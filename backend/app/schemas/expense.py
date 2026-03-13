from datetime import date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ExpenseBase(BaseModel):
    amount: Decimal
    category: str = "Other"
    date: date
    note: Optional[str] = ""


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseResponse(ExpenseBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
