import uuid
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import String, Date, DateTime, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, default="Other")
    date: Mapped[date] = mapped_column(Date, nullable=False)
    note: Mapped[str] = mapped_column(String(500), nullable=True, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
