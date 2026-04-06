import sqlite3
import os

DB_ACTIVE = r"d:\Habit_Tracker\backend\tracker.db"
DB_BACKUP = r"d:\Habit_Tracker\backend\tracker.db.bak"

def robust_restore():
    if not os.path.exists(DB_BACKUP):
        print(f"Error: Backup {DB_BACKUP} not found.")
        return

    src_conn = sqlite3.connect(DB_BACKUP)
    dst_conn = sqlite3.connect(DB_ACTIVE)
    
    src_cursor = src_conn.cursor()
    dst_cursor = dst_conn.cursor()
    
    try:
        # 1. Habits
        print("Restoring Habits...")
        src_cursor.execute("PRAGMA table_info(habits)")
        src_cols = [c[1] for c in src_cursor.fetchall()]
        print(f"Source columns: {src_cols}")
        
        # Define all columns currently in the active DB model
        target_cols = ["id", "name", "category", "period", "target_per_period", 
                      "target_completions_per_day", "tracking_model", "archived", "created_at"]
        
        # Build mapping based on what's available
        actual_fetch = []
        for col in target_cols:
            if col in src_cols:
                actual_fetch.append(col)
            elif col == "name" and "title" in src_cols:
                actual_fetch.append("title as name")
            elif col == "archived" and "is_archived" in src_cols:
                actual_fetch.append("is_archived as archived")
            else:
                # Defaults
                if col == "period": actual_fetch.append("'daily' as period")
                elif col == "target_per_period": actual_fetch.append("1 as target_per_period")
                elif col == "target_completions_per_day": actual_fetch.append("1 as target_completions_per_day")
                elif col == "tracking_model": actual_fetch.append("'streak' as tracking_model")
                elif col == "archived": actual_fetch.append("0 as archived")
                elif col == "created_at": actual_fetch.append("CURRENT_TIMESTAMP as created_at")
                else: actual_fetch.append("NULL")

        query = f"SELECT {', '.join(actual_fetch)} FROM habits"
        src_cursor.execute(query)
        habits = src_cursor.fetchall()
        print(f"Found {len(habits)} habits in backup.")
        
        # Use OR REPLACE in case IDs changed or exist
        placeholders = ", ".join(["?" for _ in target_cols])
        dst_cursor.executemany(
            f"INSERT OR REPLACE INTO habits ({', '.join(target_cols)}) VALUES ({placeholders})",
            habits
        )
        print(f"Restored {dst_cursor.rowcount} habits into active DB.")
        
        # 2. Habit Entries
        print("Restoring Habit Entries...")
        src_cursor.execute("SELECT id, habit_id, date FROM habit_entries")
        entries = src_cursor.fetchall()
        dst_cursor.executemany(
            "INSERT OR REPLACE INTO habit_entries (id, habit_id, date) VALUES (?, ?, ?)",
            entries
        )
        print(f"Restored {dst_cursor.rowcount} habit entries into active DB.")

        # 3. Expenses
        print("Restoring Expenses...")
        # Check source for 'note' or 'description'
        src_cursor.execute("PRAGMA table_info(expenses)")
        exp_cols = [c[1] for c in src_cursor.fetchall()]
        note_col = "note" if "note" in exp_cols else "description"
        
        src_cursor.execute(f"SELECT id, amount, category, date, {note_col} FROM expenses")
        expenses = src_cursor.fetchall()
        dst_cursor.executemany(
            "INSERT OR REPLACE INTO expenses (id, amount, category, date, note) VALUES (?, ?, ?, ?, ?)",
            expenses
        )
        print(f"Restored {dst_cursor.rowcount} expenses into active DB.")
        
        dst_conn.commit()
        print("Successfully committed restoration.")
        
    except Exception as e:
        print(f"FATAL RECOVERY ERROR: {e}")
        dst_conn.rollback()
    finally:
        src_conn.close()
        dst_conn.close()

if __name__ == "__main__":
    robust_restore()
