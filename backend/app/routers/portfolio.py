from fastapi import APIRouter
from app.services.portfolio_engine import get_summary, get_allocation

router = APIRouter()

@router.get("/summary")
def portfolio_summary():
    # TODO: Replace with session-based trade data
    return get_summary([])

@router.get("/allocation")
def portfolio_allocation():
    return get_allocation([])
