from pydantic import BaseModel
from typing import Optional

class PortfolioSummary(BaseModel):
    total_invested: float
    current_value: float
    total_pnl: float
    total_pnl_pct: float
    holdings_count: int

class Holding(BaseModel):
    ticker: str
    quantity: float
    avg_cost: float
    current_price: Optional[float] = None
    current_value: Optional[float] = None
    pnl: Optional[float] = None
    pnl_pct: Optional[float] = None
