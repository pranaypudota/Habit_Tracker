from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, or_

from app.models.subscription import Subscription


class SubscriptionRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all_historical(self) -> list[Subscription]:
        """Fetch all subscriptions including inactive ones for historical reporting."""
        stmt = select(Subscription).order_by(Subscription.start_date)
        result = await self._db.execute(stmt)
        return list(result.scalars().all())

    async def get_all_active(self, year: Optional[int] = None, month: Optional[int] = None) -> list[Subscription]:
        """
        Get all subscriptions effective during a specific period.
        """
        if not year or not month:
            # Current active subs
            stmt = select(Subscription).where(Subscription.status == "active").order_by(Subscription.name)
            result = await self._db.execute(stmt)
            return list(result.scalars().all())

        # Effective subs for period (X)
        first_day = date(year, month, 1)
        if month == 12:
            last_day = date(year + 1, 1, 1) # This is okay for logic but not literal, let's use a better approach
        else:
            last_day = date(year, month + 1, 1) # start of next month for boundary check

        stmt = select(Subscription).where(
            and_(
                Subscription.start_date < last_day,
                or_(
                    Subscription.end_date == None,
                    Subscription.end_date >= first_day
                ),
                Subscription.status != "inactive" # still include "paused" for now or handle later
            )
        ).order_by(Subscription.name)
        
        result = await self._db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, subscription_id: str) -> Optional[Subscription]:
        result = await self._db.execute(
            select(Subscription).where(Subscription.id == subscription_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        name: str,
        amount: Decimal,
        category: str = "Subscription",
        start_date: Optional[date] = None,
        billing_day: int = 1
    ) -> Subscription:
        if not start_date:
            start_date = date.today()

        subscription = Subscription(
            name=name,
            amount=amount,
            category=category,
            start_date=start_date,
            billing_day=billing_day,
            status="active"
        )
        self._db.add(subscription)
        await self._db.flush()
        await self._db.refresh(subscription)
        return subscription

    async def update(self, subscription_id: str, data: dict) -> Optional[Subscription]:
        subscription = await self.get_by_id(subscription_id)
        if not subscription:
            return None

        # Handle "Stop" correctly
        if "status" in data and data["status"] == "inactive" and not subscription.end_date:
            subscription.end_date = date.today()

        for key, value in data.items():
            if value is not None:
                setattr(subscription, key, value)
        
        await self._db.flush()
        await self._db.refresh(subscription)
        return subscription

    async def delete(self, subscription_id: str) -> bool:
        subscription = await self.get_by_id(subscription_id)
        if not subscription:
            return False
        await self._db.delete(subscription)
        return True

    async def get_effective_monthly_total(self, year: int, month: int) -> float:
        """Calculate total commitments for a month."""
        subs = await self.get_all_active(year, month)
        return sum(float(s.amount) for s in subs)
