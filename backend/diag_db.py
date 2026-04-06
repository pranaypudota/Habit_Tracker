import sqlite3
import os

DB_PATH = r"d:\Habit_Tracker\backend\tracker.db"

def check_db():
    if not os.path.exists(DB_PATH):
        print(f"Error: DB not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT count(*) FROM habits")
        habits_count = cursor.fetchone()[0]
        print(f"Habits: {habits_count}")

        cursor.execute("SELECT count(*) FROM habit_entries")
        entries_count = cursor.fetchone()[0]
        print(f"Entries: {entries_count}")

        cursor.execute("SELECT count(*) FROM expenses")
        expenses_count = cursor.fetchone()[0]
        print(f"Expenses: {expenses_count}")

        cursor.execute("SELECT * FROM auth_config")
        auth = cursor.fetchall()
        print(f"Auth Configured: {len(auth) > 0}")

    except Exception as e:
        print(f"Error querying DB: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_db()
