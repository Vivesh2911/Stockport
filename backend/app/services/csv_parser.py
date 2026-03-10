import pandas as pd
import io
import re
import json
import os
import requests

REQUIRED_TARGETS = ['date', 'ticker', 'action', 'quantity', 'price']

# ─── Fallback alias dictionary (used if Grok is unavailable) ─────────────────
AUTO_ALIASES = {
    'date': ['date','trade_date','tradedate','transaction_date','order_date',
             'settlement_date','execution_date','time','datetime','timestamp',
             'activity date','run date','post date','value date'],
    'ticker': ['ticker','symbol','stock','scrip','instrument','security',
               'tradingsymbol','trading_symbol','stock_symbol','asset',
               'description','investment','company','isin','fund name'],
    'action': ['action','type','side','trade_type','tradetype','transaction_type',
               'order_type','buysell','buy/sell','transaction','activity',
               'operation','direction','instruction'],
    'quantity': ['quantity','qty','shares','units','volume','no_of_shares',
                 'number_of_shares','fillqty','filled_qty','shares/units',
                 'no. of shares','share count','size'],
    'price': ['price','rate','avg_price','average_price','trade_price',
              'tradeprice','execution_price','fill_price','cost','unit_price',
              'per_share_price','share_price','nav','price per share',
              'executed price','transaction price','net price'],
}

def normalize(col):
    return col.lower().strip().replace(' ','_').replace('-','_').replace('/','_')

# ─── Grok-powered detection ────────────────────────────────────────────────────
def detect_with_grok(columns: list, sample_rows: list) -> dict:
    api_key = os.getenv("GROK_API_KEY", "")
    if not api_key:
        return {}

    sample_str = "\n".join([str(row) for row in sample_rows[:3]])

    prompt = f"""You are a data analyst. I have a CSV file with these columns:
{columns}

Here are the first 3 rows of data:
{sample_str}

Map each of these required fields to the most appropriate column name from the list above:
- date (the trade/transaction date)
- ticker (stock symbol or company name)
- action (buy or sell)
- quantity (number of shares/units)
- price (price per share/unit)

Respond ONLY with a valid JSON object like this:
{{"date": "column_name", "ticker": "column_name", "action": "column_name", "quantity": "column_name", "price": "column_name"}}

If a field cannot be mapped, use null. Use EXACT column names from the list."""

    try:
        response = requests.post(
            "https://api.x.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "grok-3-mini",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0
            },
            timeout=10
        )
        result = response.json()
        text = result["choices"][0]["message"]["content"].strip()
        # Extract JSON from response
        match = re.search(r'\{.*?\}', text, re.DOTALL)
        if match:
            mapping = json.loads(match.group())
            # Only keep valid column mappings
            return {k: v for k, v in mapping.items() if v and v in columns}
    except Exception as e:
        print(f"Grok detection failed: {e}")
    return {}

# ─── Fallback keyword-based detection ─────────────────────────────────────────
def detect_with_aliases(columns: list) -> dict:
    mapping = {}
    normalized = {normalize(c): c for c in columns}
    for target, aliases in AUTO_ALIASES.items():
        for alias in aliases:
            if normalize(alias) in normalized:
                mapping[target] = normalized[normalize(alias)]
                break
        if target not in mapping:
            # Partial match
            for norm_col, orig_col in normalized.items():
                for alias in aliases:
                    if normalize(alias) in norm_col or norm_col in normalize(alias):
                        mapping[target] = orig_col
                        break
                if target in mapping:
                    break
    return mapping

# ─── Main parser ──────────────────────────────────────────────────────────────
def parse_csv_with_mapping(contents: bytes, user_mapping: dict = None) -> list:
    df = pd.read_csv(io.BytesIO(contents))
    df.columns = [str(c).strip() for c in df.columns]
    columns = df.columns.tolist()
    sample_rows = df.head(3).to_dict(orient='records')

    # 1. Try Grok AI detection first
    mapping = detect_with_grok(columns, sample_rows)
    print(f"Grok mapping: {mapping}")

    # 2. Fill any missing fields with alias-based fallback
    alias_mapping = detect_with_aliases(columns)
    for target in REQUIRED_TARGETS:
        if target not in mapping:
            if target in alias_mapping:
                mapping[target] = alias_mapping[target]

    # 3. Override with user-provided mapping (from frontend column mapper)
    if user_mapping:
        mapping.update({k: v for k, v in user_mapping.items() if v})

    print(f"Final mapping: {mapping}")

    missing = [t for t in REQUIRED_TARGETS if t not in mapping]
    if missing:
        raise ValueError(
            f"Could not auto-detect columns for: {missing}. "
            f"Available columns: {columns}. "
            f"Please use the column mapper to manually assign them."
        )

    # ─── Parse rows ───────────────────────────────────────────────────────────
    result = []
    for _, row in df.iterrows():
        try:
            action_raw = str(row[mapping['action']]).strip().lower()
            if action_raw in ['buy','b','purchase','purchased','bought','long']:
                action = 'buy'
            elif action_raw in ['sell','s','sale','sold','short']:
                action = 'sell'
            else:
                action = action_raw

            trade = {
                'date':     str(row[mapping['date']]).strip()[:10],
                'ticker':   str(row[mapping['ticker']]).strip().upper().replace('.NS','').replace('.BSE',''),
                'action':   action,
                'quantity': float(str(row[mapping['quantity']]).replace(',','')),
                'price':    float(str(row[mapping['price']]).replace(',','').replace('$','').replace('₹','')),
            }
            result.append(trade)
        except Exception:
            continue

    if not result:
        raise ValueError("No valid trades found after parsing. Check your column mapping.")
    return result
