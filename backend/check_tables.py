"""
check_tables.py – Verify that tables, trigger, RLS policies, and seed rows exist.
"""
import sys
from database import get_connection


def check_tables():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # Check tables exist
            tables = ["public.profiles", "public.connection_requests"]
            for table in tables:
                schema, name = table.split(".")
                cur.execute(
                    """
                    SELECT EXISTS (
                        SELECT 1
                        FROM information_schema.tables
                        WHERE table_schema = %s AND table_name = %s
                    )
                    """,
                    (schema, name),
                )
                exists = cur.fetchone()[0]
                if exists:
                    print(f"Table found: {table}")
                else:
                    print(f"Table NOT found: {table}")
                    sys.exit(1)

            # Check trigger exists
            cur.execute(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.triggers
                    WHERE trigger_name = 'on_auth_user_created'
                )
                """
            )
            trigger_exists = cur.fetchone()[0]
            print(f"Trigger on_auth_user_created: {'found' if trigger_exists else 'NOT found'}")

            # Check RLS is enabled on profiles
            cur.execute(
                """
                SELECT relrowsecurity
                FROM pg_class
                WHERE relname = 'profiles'
                """
            )
            rls_profiles = cur.fetchone()
            if rls_profiles and rls_profiles[0]:
                print("RLS enabled on profiles: yes")
            else:
                print("RLS enabled on profiles: no")

            # Check RLS is enabled on connection_requests
            cur.execute(
                """
                SELECT relrowsecurity
                FROM pg_class
                WHERE relname = 'connection_requests'
                """
            )
            rls_cr = cur.fetchone()
            if rls_cr and rls_cr[0]:
                print("RLS enabled on connection_requests: yes")
            else:
                print("RLS enabled on connection_requests: no")

            # Check seed rows
            cur.execute("SELECT COUNT(*) FROM profiles WHERE is_demo = true")
            demo_count = cur.fetchone()[0]
            print(f"Demo seed rows found: {demo_count}")
            if demo_count >= 8:
                print("Seed data: OK")
            else:
                print(f"Seed data: expected at least 8 demo rows, found {demo_count}")

    finally:
        conn.close()


if __name__ == "__main__":
    check_tables()