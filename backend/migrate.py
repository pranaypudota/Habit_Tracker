import sqlite3
import os

db_path = "tracker.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE habits ADD COLUMN target_completions_per_day INTEGER DEFAULT 1")
        conn.commit()
        print("Successfully added target_completions_per_day to habits table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column already exists.")
        else:
            print(f"Error: {e}")
    finally:
        conn.close()
else:
    print("Database not found.")
