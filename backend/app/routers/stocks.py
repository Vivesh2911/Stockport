from fastapi import APIRouter, HTTPException
from app.services.market_data import get_stock_history

router = APIRouter()

@router.get("/{ticker}")
def stock_detail(ticker: str, period: str = "6mo"):
    try:
        data = get_stock_history(ticker.upper(), period)
        return {"ticker": ticker.upper(), "data": data}
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Could not fetch data for {ticker}: {str(e)}")
