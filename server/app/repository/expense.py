from app.repository.base import BaseRepository
from app.models.expense import FuelLog, Expense


class FuelLogRepository(BaseRepository[FuelLog]):
    pass


class ExpenseRepository(BaseRepository[Expense]):
    pass


fuel_log_repo = FuelLogRepository(FuelLog)
expense_repo = ExpenseRepository(Expense)
