from fastapi import APIRouter
from app.services.risk_engine import calculate_sharpe, calculate_drawdown

router = APIRouter()

@router.get("/metrics")
def risk_metrics():
    return {
        "sharpe_ratio": None,
        "beta": None,
        "max_drawdown": None,
        "message": "Upload trades to see risk metrics"
    }

@router.get("/correlation")
def correlation_matrix():
    return {"matrix": [], "tickers": []}

@router.get("/drawdown")
def drawdown_chart():
    return {"drawdown": []}
