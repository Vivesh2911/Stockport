from collections import defaultdict

def get_summary(trades: list) -> dict:
    if not trades:
        return {
            "total_invested": 0,
            "current_value": 0,
            "total_pnl": 0,
            "total_pnl_pct": 0,
            "holdings_count": 0,
        }

    holdings = defaultdict(lambda: {"qty": 0, "cost": 0})
    for t in trades:
        ticker = t["ticker"]
        if t["action"] == "buy":
            holdings[ticker]["qty"] += t["quantity"]
            holdings[ticker]["cost"] += t["quantity"] * t["price"]
        elif t["action"] == "sell":
            holdings[ticker]["qty"] -= t["quantity"]

    total_invested = sum(h["cost"] for h in holdings.values() if h["qty"] > 0)
    return {
        "total_invested": round(total_invested, 2),
        "current_value": 0,  # needs live price
        "total_pnl": 0,
        "total_pnl_pct": 0,
        "holdings_count": sum(1 for h in holdings.values() if h["qty"] > 0),
    }

def get_allocation(trades: list) -> dict:
    # Returns sector allocation placeholder
    return {
        "sectors": [],
        "message": "Sector data requires enrichment via market data API"
    }
