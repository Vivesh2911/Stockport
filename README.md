# 📈 SmartPort — Stock Portfolio Analyzer

A fullstack data analysis platform to analyze your stock trade history.

## Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS + Recharts
- **Backend:** FastAPI + Pandas + yfinance

---

## 🚀 Getting Started on Mac

### 1. Backend Setup (Open `smartport/backend` in PyCharm)

```bash
# Step 1 — Create virtual environment
python3 -m venv venv

# Step 2 — Activate (Mac/Linux)
source venv/bin/activate

# Step 3 — Install dependencies
pip install -r requirements.txt

# Step 4 — Run the server
uvicorn app.main:app --reload
```

✅ Backend runs at:   http://localhost:8000
📖 API Docs at:       http://localhost:8000/docs

> **PyCharm tip:** Go to Settings → Python Interpreter → Add → Existing Environment → select `venv/bin/python`

---

### 2. Frontend Setup (open a new terminal)

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend runs at: http://localhost:5173

---

## 📁 Project Structure

```
smartport/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── routers/             # upload, portfolio, performance, risk, stocks
│   │   ├── services/            # csv_parser, portfolio_engine, market_data, risk_engine
│   │   └── models/              # Pydantic models
│   ├── sample_data/
│   │   └── generic_sample.csv   # Use this to test the app immediately
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/               # Home, Dashboard, Performance, RiskAnalysis, StockDetail
        ├── components/          # Sidebar, Topbar, MetricCard, CSVUploader, etc.
        ├── services/api.js      # Axios API calls
        ├── store/               # Zustand state
        └── utils/formatters.js  # Currency, % helpers
```

---

## 📄 Sample CSV Format

```csv
date,ticker,action,quantity,price,fees,currency
2024-01-10,AAPL,buy,10,185.50,0.99,USD
2024-03-20,MSFT,sell,2,410.50,0.99,USD
```

A ready-to-use sample is at: `backend/sample_data/generic_sample.csv`

---

## 🛠 Deactivate virtual env when done

```bash
deactivate
```
