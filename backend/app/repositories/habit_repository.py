"""
HabitRepository — pure persistence layer.

Business logic (streak, rates, analytics) lives in habit_service.py.
"""
import uuid
from datetime import date
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete

from app.models.habit import Habit, HabitEntry


def _uuid() -> str:
    return str(uuid.uuid4())


class HabitRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    # ─── Habits ───────────────────────────────────────────────────────────────

    async def get_all(self, include_archived: bool = False) -> list[Habit]:
        stmt = select(Habit).order_by(Habit.created_at.desc())
        if not include_archived:
            stmt = stmt.where(Habit.archived.is_(False))
        result = await self._db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, habit_id: str) -> Optional[Habit]:
        result = await self._db.execute(
            select(Habit).where(Habit.id == habit_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        name: str,
        category: str,
        period: str = "daily",
        target_per_period: int = 1,
        target_completions_per_day: int = 1,
        tracking_model: str = "streak",
    ) -> Habit:
        habit = Habit(
            id=_uuid(),
            name=name,
            category=category,
            period=period,
            target_per_period=target_per_period,
            target_completions_per_day=target_completions_per_day,
            tracking_model=tracking_model,
        )
        self._db.add(habit)
        await self._db.flush()
        await self._db.refresh(habit)
        return habit

    async def delete(self, habit_id: str) -> bool:
        habit = await self.get_by_id(habit_id)
        if not habit:
            return False
        await self._db.delete(habit)
        return True

    async def archive(self, habit_id: str) -> bool:
        habit = await self.get_by_id(habit_id)
        if not habit:
            return False
        habit.archived = True
        await self._db.flush()
        return True

    # ─── HabitEntry ───────────────────────────────────────────────────────────

    async def get_entries(
        self,
        habit_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> list[HabitEntry]:
        filters = [HabitEntry.habit_id == habit_id]
        if start_date:
            filters.append(HabitEntry.date >= start_date)
        if end_date:
            filters.append(HabitEntry.date <= end_date)

        result = await self._db.execute(
            select(HabitEntry)
            .where(and_(*filters))
            .order_by(HabitEntry.date.desc())
        )
        return list(result.scalars().all())

    async def create_entry(self, habit_id: str, entry_date: date) -> HabitEntry:
        """Create a completion entry for the habit on a specific date.
        Multiple calls for the same date are allowed (multi-completion).
        """
        entry = HabitEntry(id=_uuid(), habit_id=habit_id, date=entry_date)
        self._db.add(entry)
        await self._db.flush()
        await self._db.refresh(entry)
        return entry

    async def delete_entry(self, habit_id: str, entry_date: date) -> bool:
        """Remove completion entry for a specific date (undo)."""
        result = await self._db.execute(
            select(HabitEntry).where(
                and_(
                    HabitEntry.habit_id == habit_id,
                    HabitEntry.date == entry_date,
                )
            )
        )
        entry = result.scalar_one_or_none()
        if not entry:
            return False
        await self._db.delete(entry)
        return True

    async def get_entries_for_all_habits(
        self, habit_ids: list[str]
    ) -> dict[str, list[HabitEntry]]:
        """Batch-load entries for multiple habits (for dashboard efficiency)."""
        if not habit_ids:
            return {}
        result = await self._db.execute(
            select(HabitEntry)
            .where(HabitEntry.habit_id.in_(habit_ids))
            .order_by(HabitEntry.date.desc())
        )
        by_habit: dict[str, list[HabitEntry]] = {hid: [] for hid in habit_ids}
        for entry in result.scalars().all():
            by_habit[entry.habit_id].append(entry)
        return by_habit
