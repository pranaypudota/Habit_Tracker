import sqlite3
import os

active_db = r"d:\Habit_Tracker\backend\tracker.db"
backup_db = r"d:\Habit_Tracker\backend\tracker.db.bak"

def restore():
    if not os.path.exists(backup_db):
        print("Backup file not found!")
        return

    src_conn = sqlite3.connect(backup_db)
    dst_conn = sqlite3.connect(active_db)
    
    src_cursor = src_conn.cursor()
    dst_cursor = dst_conn.cursor()
    
    # 1. Habits
    print("Restoring Habits...")
    try:
        # Check source columns
        src_cursor.execute("PRAGMA table_info(habits)")
        src_cols = [c[1] for c in src_cursor.fetchall()]
        print(f"Source Habits columns: {src_cols}")
        
        # We'll map what we have
        target_cols = ["id", "name", "category", "period", "target_per_period", "archived", "created_at"]
        actual_fetch = []
        for col in target_cols:
            if col in src_cols:
                actual_fetch.append(col)
            elif col == "name" and "title" in src_cols:
                 actual_fetch.append("title as name")
            elif col == "archived" and "is_archived" in src_cols:
                 actual_fetch.append("is_archived as archived")
            else:
                 # Default values for missing cols
                 if col == "period": actual_fetch.append("'daily' as period")
                 elif col == "target_per_period": actual_fetch.append("1 as target_per_period")
                 elif col == "archived": actual_fetch.append("0 as archived")
                 elif col == "created_at": actual_fetch.append("CURRENT_TIMESTAMP as created_at")

        query = f"SELECT {', '.join(actual_fetch)} FROM habits"
        src_cursor.execute(query)
        rows = src_cursor.fetchall()
        
        dst_cursor.executemany(
            f"INSERT OR IGNORE INTO habits ({', '.join(target_cols)}) VALUES (?, ?, ?, ?, ?, ?, ?);",
            rows
        )
        print(f"Restored {len(rows)} habits.")
    except Exception as e:
        print(f"Habits restoration error: {e}")

    # 2. Habit Entries
    print("Restoring Habit Entries...")
    try:
        src_cursor.execute("SELECT id, habit_id, date FROM habit_entries;")
        rows = src_cursor.fetchall()
        dst_cursor.executemany(
            "INSERT OR IGNORE INTO habit_entries (id, habit_id, date) VALUES (?, ?, ?);",
            rows
        )
        print(f"Restored {len(rows)} habit entries.")
    except Exception as e:
        print(f"Habit entries restoration error: {e}")

    # 3. Expenses
    print("Restoring Expenses...")
    try:
        src_cursor.execute("SELECT id, amount, category, date, note FROM expenses;")
        rows = src_cursor.fetchall()
        dst_cursor.executemany(
            "INSERT OR IGNORE INTO expenses (id, amount, category, date, note) VALUES (?, ?, ?, ?, ?);",
            rows
        )
        print(f"Restored {len(rows)} expenses.")
    except Exception as e:
        # Retry with old column name if 'note' doesn't exist
        try:
             src_cursor.execute("SELECT id, amount, category, date, description FROM expenses;")
             rows = src_cursor.fetchall()
             dst_cursor.executemany(
                "INSERT OR IGNORE INTO expenses (id, amount, category, date, note) VALUES (?, ?, ?, ?, ?);",
                rows
             )
             print(f"Restored {len(rows)} expenses (using old schema).")
        except:
            print(f"Expenses restoration error: {e}")

    # 4. Auth Reset (For fresh start with recovery key visibility)
    print("Clearing current Auth Config to force fresh setup...")
    dst_cursor.execute("DELETE FROM auth_config;")
    
    dst_conn.commit()
    src_conn.close()
    dst_conn.close()
    print("All data restoration operations completed.")

if __name__ == "__main__":
    restore()
