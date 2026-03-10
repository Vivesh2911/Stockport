import pandas as pd
import yfinance as yf
from app.services.portfolio_engine import build_holdings
from app.services.market_data import get_historical_prices

def get_returns(trades: list[dict]) -> dict:
    """Portfolio cumulative value over time."""
    df = pd.DataFrame(trades)
    df["date"] = pd.to_datetime(df["date"])
    start = df["date"].min().strftime("%Y-%m-%d")
    end = pd.Timestamp.today().strftime("%Y-%m-%d")

    tickers = df["ticker"].unique().tolist()
    prices = get_historical_prices(tickers, start, end)
    if prices.empty:
        return {"returns": []}

    result = []
    for date in prices.index:
        daily_value = 0.0
        trades_until = df[df["date"] <= date]
        if trades_until.empty:
            continue
        holdings = build_holdings(trades_until.to_dict(orient="records"))
        for _, row in holdings.iterrows():
            ticker = row["ticker"]
            if ticker in prices.columns and date in prices.index:
                daily_value += prices.loc[date, ticker] * row["qty"]
        result.append({"date": str(date)[:10], "value": round(daily_value, 2)})

    return {"returns": result}

def get_benchmark(trades: list[dict]) -> dict:
    """Compare portfolio returns vs S&P 500."""
    df = pd.DataFrame(trades)
    df["date"] = pd.to_datetime(df["date"])
    start = df["date"].min().strftime("%Y-%m-%d")
    end = pd.Timestamp.today().strftime("%Y-%m-%d")

    portfolio = get_returns(trades)["returns"]
    spy = yf.download("^GSPC", start=start, end=end, auto_adjust=True, progress=False)["Close"]

    if portfolio and not spy.empty:
        base_portfolio = portfolio[0]["value"] if portfolio[0]["value"] else 1
        base_spy = float(spy.iloc[0])
        combined = []
        spy_dict = {str(d)[:10]: float(v) for d, v in spy.items()}
        for p in portfolio:
            date = p["date"]
            spy_val = spy_dict.get(date)
            combined.append({
                "date": date,
                "portfolio": round((p["value"] / base_portfolio - 1) * 100, 2) if base_portfolio else 0,
                "sp500": round((spy_val / base_spy - 1) * 100, 2) if spy_val else None,
            })
        return {"benchmark": combined}
    return {"benchmark": []}

def get_calendar(trades: list[dict]) -> dict:
    """Monthly returns heatmap data."""
    returns_data = get_returns(trades)["returns"]
    if not returns_data:
        return {"calendar": []}

    df = pd.DataFrame(returns_data)
    df["date"] = pd.to_datetime(df["date"])
    df["month"] = df["date"].dt.to_period("M")
    monthly = df.groupby("month")["value"].agg(["first", "last"])
    monthly["return_pct"] = ((monthly["last"] - monthly["first"]) / monthly["first"] * 100).round(2)

    calendar = [
        {"month": str(period), "return_pct": row["return_pct"]}
        for period, row in monthly.iterrows()
    ]
    return {"calendar": calendar}
