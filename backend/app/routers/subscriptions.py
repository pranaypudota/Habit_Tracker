from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.subscription import SubscriptionCreate, SubscriptionResponse, SubscriptionUpdate
from app.repositories.subscription_repository import SubscriptionRepository

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


def _repo(db: AsyncSession = Depends(get_db)) -> SubscriptionRepository:
    return SubscriptionRepository(db)


@router.get("/", response_model=list[SubscriptionResponse])
async def list_subscriptions(
    year: Optional[int] = Query(default=None),
    month: Optional[int] = Query(default=None),
    repo: SubscriptionRepository = Depends(_repo),
):
    """
    Get all active subscriptions for the specified year and month.
    If no year or month is provided, it returns all active subscriptions.
    """
    return await repo.get_all_active(year=year, month=month)


@router.post("/", response_model=SubscriptionResponse, status_code=201)
async def add_subscription(
    payload: SubscriptionCreate,
    repo: SubscriptionRepository = Depends(_repo),
):
    """Adds a new subscription."""
    return await repo.create(
        name=payload.name,
        amount=payload.amount,
        category=payload.category,
        start_date=payload.start_date,
        billing_day=payload.billing_day,
    )


@router.patch("/{subscription_id}", response_model=SubscriptionResponse)
async def update_subscription(
    subscription_id: str,
    payload: SubscriptionUpdate,
    repo: SubscriptionRepository = Depends(_repo),
):
    """Updates an existing subscription (Edit price, Stop/Restart, etc.)"""
    updated = await repo.update(subscription_id, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return updated


@router.delete("/{subscription_id}", status_code=204)
async def delete_subscription(
    subscription_id: str,
    repo: SubscriptionRepository = Depends(_repo),
):
    """Permanently removes a subscription."""
    deleted = await repo.delete(subscription_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Subscription not found")
