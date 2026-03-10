import numpy as np

def calculate_sharpe(returns: list, risk_free_rate: float = 0.05) -> float:
    if not returns or len(returns) < 2:
        return 0.0
    r = np.array(returns)
    excess = r - (risk_free_rate / 252)
    if np.std(excess) == 0:
        return 0.0
    return round(float(np.mean(excess) / np.std(excess) * np.sqrt(252)), 4)

def calculate_drawdown(values: list) -> list:
    if not values:
        return []
    peak = values[0]
    drawdowns = []
    for v in values:
        if v > peak:
            peak = v
        dd = (v - peak) / peak * 100 if peak != 0 else 0
        drawdowns.append(round(dd, 4))
    return drawdowns

def calculate_beta(portfolio_returns: list, market_returns: list) -> float:
    if len(portfolio_returns) < 2 or len(market_returns) < 2:
        return 1.0
    p = np.array(portfolio_returns)
    m = np.array(market_returns)
    cov = np.cov(p, m)
    if cov[1][1] == 0:
        return 1.0
    return round(float(cov[0][1] / cov[1][1]), 4)
