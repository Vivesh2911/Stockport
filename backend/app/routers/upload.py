from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.services.csv_parser import parse_csv_with_mapping

router = APIRouter()

@router.post("/csv")
async def upload_csv(
    file: UploadFile = File(...),
    date: Optional[str] = Form(None),
    ticker: Optional[str] = Form(None),
    action: Optional[str] = Form(None),
    quantity: Optional[str] = Form(None),
    price: Optional[str] = Form(None),
):
    contents = await file.read()
    mapping = {}
    if date:     mapping['date']     = date
    if ticker:   mapping['ticker']   = ticker
    if action:   mapping['action']   = action
    if quantity: mapping['quantity'] = quantity
    if price:    mapping['price']    = price

    try:
        trades = parse_csv_with_mapping(contents, mapping)
        return {"message": "File uploaded successfully", "trade_count": len(trades), "trades": trades}
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
