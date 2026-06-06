"""
database.py – Supabase PostgreSQL connection and initialisation.
"""
import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Check your .env file.")


def get_connection():
    """Return a new psycopg2 connection to Supabase PostgreSQL."""
    return psycopg2.connect(DATABASE_URL)


def init_db():
    """
    Run setup_database.sql to create tables, trigger, RLS policies, and seed data.
    Called once at FastAPI startup via the lifespan event.
    """
    sql_path = Path(__file__).parent / "setup_database.sql"
    sql = sql_path.read_text(encoding="utf-8")

    conn = get_connection()
    try:
        conn.autocommit = True
        with conn.cursor() as cur:
            cur.execute(sql)
        print("Database initialization completed successfully")
    finally:
        conn.close()


if __name__ == "__main__":
    # Allows running `python database.py` standalone to initialise the DB
    init_db()