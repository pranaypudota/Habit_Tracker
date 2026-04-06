import sqlite3
import os

db_path = r"d:\Habit_Tracker\backend\tracker.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
print(f"Tables in tracker.db: {tables}")

results = {}
for table in [t[0] for t in tables]:
    cursor.execute(f"SELECT COUNT(*) FROM {table}")
    results[table] = cursor.fetchone()[0]
print(f"Record Counts: {results}")

if results.get("habits", 0) > 0:
    cursor.execute("SELECT id, name FROM habits LIMIT 3")
    print(f"Sample Habits: {cursor.fetchall()}")
else:
    print("No habits found in tracker.db.")

conn.close()
