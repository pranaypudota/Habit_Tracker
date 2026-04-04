from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict


class SubscriptionBase(BaseModel):
    name: str
    amount: Decimal
    category: str = "Subscription"
    start_date: date = date.today()
    end_date: Optional[date] = None
    status: str = "active"
    billing_day: int = 1


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[Decimal] = None
    category: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    billing_day: Optional[int] = None


class SubscriptionResponse(SubscriptionBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
