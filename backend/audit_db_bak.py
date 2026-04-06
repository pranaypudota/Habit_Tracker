import sqlite3
import os

db_path = r"d:\Habit_Tracker\backend\tracker.db.bak"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    tables = ["habits", "habit_entries", "expenses", "subscriptions", "auth_config"]
    results = {}
    for table in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table};")
            results[table] = cursor.fetchone()[0]
        except Exception as e:
            results[table] = f"Error: {e}"
    print(f"Database Audit (.bak): {results}")
    conn.close()
else:
    print(f"File {db_path} does not exist.")
