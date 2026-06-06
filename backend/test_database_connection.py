"""
test_database_connection.py – Verify that the app can connect to Supabase PostgreSQL.
Does NOT print the password or connection string.
"""
import sys
from database import get_connection


def test_connection():
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
            result = cur.fetchone()
        conn.close()

        if result and result[0] == 1:
            print("Database connection successful")
        else:
            print("Database connection failed: unexpected result")
            sys.exit(1)
    except Exception as e:
        print(f"Database connection failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    test_connection()