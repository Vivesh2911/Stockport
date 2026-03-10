from fastapi import APIRouter
from app.services.market_data import get_benchmark_data

router = APIRouter()

@router.get("/returns")
def get_returns():
    return {"returns": [], "message": "Upload trades to see returns"}

@router.get("/benchmark")
def get_benchmark():
    data = get_benchmark_data("^GSPC", period="1y")
    return {"benchmark": "S&P 500", "data": data}

@router.get("/calendar")
def get_calendar():
    return {"monthly_returns": [], "message": "Upload trades to see monthly returns"}
