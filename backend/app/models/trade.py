from pydantic import BaseModel
from typing import Optional

class Trade(BaseModel):
    date: str
    ticker: str
    action: str  # buy or sell
    quantity: float
    price: float
    fees: Optional[float] = 0.0
    currency: Optional[str] = "USD"
    exchange: Optional[str] = None

class TradeUploadResponse(BaseModel):
    message: str
    trade_count: int
    trades: list[Trade]
