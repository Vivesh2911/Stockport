import yfinance as yf

def get_stock_history(ticker: str, period: str = "6mo") -> list:
    stock = yf.Ticker(ticker)
    hist = stock.history(period=period)
    hist = hist.reset_index()
    records = []
    for _, row in hist.iterrows():
        records.append({
            "date": row["Date"].strftime("%Y-%m-%d"),
            "open": round(row["Open"], 2),
            "high": round(row["High"], 2),
            "low": round(row["Low"], 2),
            "close": round(row["Close"], 2),
            "volume": int(row["Volume"]),
        })
    return records

def get_benchmark_data(ticker: str = "^GSPC", period: str = "1y") -> list:
    return get_stock_history(ticker, period)

def get_current_price(ticker: str) -> float:
    stock = yf.Ticker(ticker)
    hist = stock.history(period="1d")
    if hist.empty:
        return 0.0
    return round(hist["Close"].iloc[-1], 2)
