from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from app.routers import upload, portfolio, performance, risk, stocks

app = FastAPI(title="SmartPort API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(portfolio.router, prefix="/portfolio", tags=["Portfolio"])
app.include_router(performance.router, prefix="/performance", tags=["Performance"])
app.include_router(risk.router, prefix="/risk", tags=["Risk"])
app.include_router(stocks.router, prefix="/stocks", tags=["Stocks"])

@app.get("/")
def root():
    return {"message": "SmartPort API is running!"}
