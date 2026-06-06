"""
main.py – FounderFit FastAPI Backend
In production, tokens should be verified properly.
"""
import os
from contextlib import asynccontextmanager
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import get_connection, init_db

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")


# --------------- Lifespan ---------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


# --------------- App ---------------
app = FastAPI(
    title="FounderFit API",
    description="Co-founder matching backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------- Auth helper ---------------
async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Forward the Bearer token to Supabase Auth REST to get the current user.
    Returns the Supabase user dict (contains 'id', 'email', …).
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = authorization.replace("Bearer ", "")

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_ANON_KEY,
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return resp.json()


# --------------- Request models ---------------
class AuthBody(BaseModel):
    full_name: Optional[str] = None
    email: str
    password: str


class ProfileUpdate(BaseModel):
    intent: Optional[str] = None
    # Founder fields
    startup_name: Optional[str] = None
    one_liner_pitch: Optional[str] = None
    industry: Optional[str] = None
    current_stage: Optional[str] = None
    cofounder_skill_needed: Optional[str] = None
    # Cofounder fields
    skill_domain: Optional[str] = None
    years_experience: Optional[int] = None
    short_bio: Optional[str] = None
    preferred_industry: Optional[str] = None
    open_to_remote: Optional[str] = None


class ConnectionBody(BaseModel):
    to_profile_id: str


# --------------- Routes ---------------
@app.get("/")
def root():
    return {"message": "FounderFit API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


# ---- Auth ----
@app.post("/auth/signup")
async def signup(body: AuthBody):
    """Create a new user via Supabase Auth."""
    payload = {
        "email": body.email,
        "password": body.password,
    }
    if body.full_name:
        payload["data"] = {"full_name": body.full_name}

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPABASE_URL}/auth/v1/signup",
            json=payload,
            headers={"apikey": SUPABASE_ANON_KEY},
        )

    data = resp.json()
    if resp.status_code not in (200, 201):
        raise HTTPException(status_code=resp.status_code, detail=data)

    return data


@app.post("/auth/login")
async def login(body: AuthBody):
    """Sign in and return access_token + user info."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            json={"email": body.email, "password": body.password},
            headers={"apikey": SUPABASE_ANON_KEY},
        )

    data = resp.json()
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=data)

    return data


# ---- Profile ----
@app.get("/profile/me")
async def get_my_profile(authorization: Optional[str] = Header(None)):
    """Return the calling user's profile row."""
    user = await get_current_user(authorization)
    user_id = user["id"]

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM profiles WHERE auth_user_id = %s", (user_id,)
            )
            cols = [desc[0] for desc in cur.description]
            row = cur.fetchone()
    finally:
        conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")

    return dict(zip(cols, row))


@app.patch("/profile/me")
async def update_my_profile(
    body: ProfileUpdate,
    authorization: Optional[str] = Header(None),
):
    """Update the calling user's profile (intent + founder/cofounder fields)."""
    user = await get_current_user(authorization)
    user_id = user["id"]

    # Build dynamic SET clause from non-None fields
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = []
    values = []
    for col, val in updates.items():
        set_parts.append(f"{col} = %s")
        values.append(val)

    set_parts.append("updated_at = now()")
    values.append(user_id)

    sql = f"UPDATE profiles SET {', '.join(set_parts)} WHERE auth_user_id = %s RETURNING *"

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, values)
            cols = [desc[0] for desc in cur.description]
            row = cur.fetchone()
            conn.commit()
    finally:
        conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")

    return dict(zip(cols, row))


# ---- Matches ----
@app.get("/matches")
async def get_matches(authorization: Optional[str] = Header(None)):
    """
    Return up to 3 complementary profiles based on caller's intent:
    - founder → match cofounders where skill_domain ILIKE cofounder_skill_needed
    - cofounder → match founders where cofounder_skill_needed ILIKE skill_domain
    Fallback: most recent demo profiles of the opposite intent.
    """
    user = await get_current_user(authorization)
    user_id = user["id"]

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # Get caller profile
            cur.execute("SELECT * FROM profiles WHERE auth_user_id = %s", (user_id,))
            cols = [desc[0] for desc in cur.description]
            caller_row = cur.fetchone()

            if not caller_row:
                raise HTTPException(status_code=404, detail="Profile not found – complete your profile first")

            caller = dict(zip(cols, caller_row))
            intent = caller.get("intent")

            if not intent:
                raise HTTPException(status_code=400, detail="Set your intent (founder/cofounder) before viewing matches")

            matches = []

            if intent == "founder":
                skill_needed = caller.get("cofounder_skill_needed")
                if skill_needed:
                    cur.execute(
                        """
                        SELECT * FROM profiles
                        WHERE intent = 'cofounder'
                          AND skill_domain ILIKE %s
                        ORDER BY is_demo DESC, created_at DESC
                        LIMIT 3
                        """,
                        (f"%{skill_needed}%",),
                    )
                    cols = [desc[0] for desc in cur.description]
                    matches = [dict(zip(cols, r)) for r in cur.fetchall()]

                # Fallback: recent demo cofounders
                if not matches:
                    cur.execute(
                        """
                        SELECT * FROM profiles
                        WHERE intent = 'cofounder' AND is_demo = true
                        ORDER BY created_at DESC
                        LIMIT 3
                        """
                    )
                    cols = [desc[0] for desc in cur.description]
                    matches = [dict(zip(cols, r)) for r in cur.fetchall()]

            elif intent == "cofounder":
                skill = caller.get("skill_domain")
                if skill:
                    cur.execute(
                        """
                        SELECT * FROM profiles
                        WHERE intent = 'founder'
                          AND cofounder_skill_needed ILIKE %s
                        ORDER BY is_demo DESC, created_at DESC
                        LIMIT 3
                        """,
                        (f"%{skill}%",),
                    )
                    cols = [desc[0] for desc in cur.description]
                    matches = [dict(zip(cols, r)) for r in cur.fetchall()]

                # Fallback: recent demo founders
                if not matches:
                    cur.execute(
                        """
                        SELECT * FROM profiles
                        WHERE intent = 'founder' AND is_demo = true
                        ORDER BY created_at DESC
                        LIMIT 3
                        """
                    )
                    cols = [desc[0] for desc in cur.description]
                    matches = [dict(zip(cols, r)) for r in cur.fetchall()]

            return matches
    finally:
        conn.close()


# ---- Connections ----
@app.post("/connections")
async def send_connection(
    body: ConnectionBody,
    authorization: Optional[str] = Header(None),
):
    """Create a connection_request from the current user to a profile."""
    user = await get_current_user(authorization)
    user_id = user["id"]

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO connection_requests (from_user_id, to_profile_id)
                VALUES (%s, %s)
                RETURNING *
                """,
                (user_id, body.to_profile_id),
            )
            cols = [desc[0] for desc in cur.description]
            row = cur.fetchone()
            conn.commit()
    finally:
        conn.close()

    if not row:
        raise HTTPException(status_code=400, detail="Could not create connection request")

    return dict(zip(cols, row))


# --------------- Run directly ---------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)