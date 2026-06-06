# FounderFit

URL - founder-fit-six.vercel.app

A co-founder matching platform. Founders with a startup idea can find a skilled co-founder, and skilled professionals can find a startup to join.

## Project Structure

```
Founder_Fit/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py          # FastAPI application & routes
│   ├── database.py           # PostgreSQL connection & DB init
│   ├── setup_database.sql    # DDL, triggers, RLS policies, seed data
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Environment variables (gitignored)
│   ├── .env.example          # Template for .env
│   ├── check_tables.py       # Verify tables, trigger, RLS, seed rows
│   └── test_database_connection.py  # Test DB connectivity
├── frontend/
│   ├── src/
│   │   ├── pages/            # React page components
│   │   ├── components/       # Shared UI components
│   │   ├── lib/              # API client & utilities
│   │   └── App.tsx           # Root component with routing
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
├── .gitignore
└── README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- A Supabase project with PostgreSQL

## Setup

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy .env.example to .env and fill in your Supabase credentials
cp .env.example .env

# Run the backend server (from the backend/ directory)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

> **Important:** The backend must be run from the `backend/` directory so that
> `load_dotenv()` finds `backend/.env` and the `database` module is importable.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy .env.example to .env and set your API URL
cp .env.example .env

# Start the dev server
npm run dev
```

The frontend will be available at http://localhost:5173 and the API docs at http://127.0.0.1:8000/docs.

## API Endpoints

| Method | Path              | Description                          |
|--------|-------------------|--------------------------------------|
| GET    | `/`               | Health check                         |
| GET    | `/health`         | Health check                         |
| POST   | `/auth/signup`    | Create a new user via Supabase Auth  |
| POST   | `/auth/login`     | Sign in and get access token         |
| GET    | `/profile/me`     | Get current user's profile           |
| PATCH  | `/profile/me`     | Update current user's profile        |
| GET    | `/matches`        | Get complementary profile matches    |
| POST   | `/connections`    | Send a connection request            |

## Database Verification Scripts

```bash
# From the backend/ directory:
python test_database_connection.py   # Verify DB connectivity
python check_tables.py               # Verify tables, trigger, RLS, seeds
python database.py                   # Re-run setup_database.sql
```

## Deployment (Vercel)

The project is structured for Vercel deployment:
- **Frontend:** Deploy the `frontend/` directory as a Vite/React project.
- **Backend:** Deploy the `backend/` directory as a Python serverless function.
  Set the root directory to `backend/` and the entry point to `app.main:app`.