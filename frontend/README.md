# SmartPort — Frontend (React + Vite)

## Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:5173

## Pages

| Route           | Description                        |
|-----------------|------------------------------------|
| /               | Upload CSV page                    |
| /dashboard      | Overview: value, P&L, allocation   |
| /portfolio      | Full holdings table                |
| /performance    | Benchmark chart + monthly heatmap  |
| /risk           | Sharpe, Beta, VaR, drawdown        |
| /stocks/:ticker | Candlestick + trade history        |

## Notes
- Backend must be running on http://localhost:8000
- Vite proxy forwards API calls automatically
