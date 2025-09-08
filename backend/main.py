import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
import yfinance as yf
from fastapi.middleware.cors import CORSMiddleware

# --- Configuração de Logging ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("backend.log"),
        logging.StreamHandler()
    ]
)

app = FastAPI(
    title="API de Cotações de Ações",
    description="Uma API para buscar os preços atuais de ações e calcular o lucro/prejuízo com base no preço médio da carteira.",
    version="1.0.0"
)

# --- Eventos de Startup e Shutdown ---
@app.on_event("startup")
async def startup_event():
    logging.info("Backend server has started.")

@app.on_event("shutdown")
async def shutdown_event():
    logging.info("Backend server is shutting down.")

# --- CORS Middleware ---
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mapeamento de Tickers ---
TICKER_MAPPING = {
    "VVAR3": "BHIA3",
}


# --- Modelos de Dados (Pydantic) ---

class StockPositionInput(BaseModel):
    ticker: str
    quantity: int
    average_price: float = Field(alias='averagePrice')
    total_value: float = Field(alias='totalValue')


class PortfolioInput(BaseModel):
    positions: List[StockPositionInput]


class StockPositionOutput(BaseModel):
    ticker: str
    quantity: int
    average_price: float = Field(alias='averagePrice')
    total_value: float = Field(alias='totalValue')
    current_price: float | None = Field(None, alias='currentPrice')
    profit_loss: float | None = Field(None, alias='profitLoss')
    profit_loss_percent: float | None = Field(None, alias='profitLossPercent')
    error: str | None = None

    class Config:
        populate_by_name = True
        json_encoders = {float: lambda v: round(v, 2) if v is not None else None}


# --- Endpoint da API ---

@app.post("/fetch-current-prices", response_model=List[StockPositionOutput], response_model_by_alias=True)
def fetch_current_prices(portfolio: PortfolioInput):
    logging.info(f"Recebida requisição para /fetch-current-prices com {len(portfolio.positions)} posições.")
    response_data = []

    for stock in portfolio.positions:
        original_ticker = stock.ticker.upper()
        # Verifica se o ticker precisa ser mapeado para um novo (ex: VVAR3 -> VIIA3)
        corrected_ticker = TICKER_MAPPING.get(original_ticker, original_ticker)
        ticker_symbol = f"{corrected_ticker}.SA"
        
        current_price = None
        profit_loss = None
        profit_loss_percent = None
        error_message = None

        try:
            ticker_data = yf.Ticker(ticker_symbol)
            last_price = ticker_data.fast_info.get('last_price')

            if last_price is None:
                history = ticker_data.history(period="1d")
                if not history.empty:
                    last_price = history['Close'].iloc[-1]

            if last_price is None:
                error_message = f"Não foi possível encontrar o preço para {original_ticker}."
                logging.warning(error_message)
            else:
                current_price = last_price
                invested_value = stock.total_value
                current_total_value = current_price * stock.quantity
                profit_loss = current_total_value - invested_value
                if invested_value != 0:
                    profit_loss_percent = (profit_loss / invested_value) * 100
                else:
                    profit_loss_percent = 0

        except Exception as e:
            error_message = f"Erro ao buscar dados para {original_ticker}: {str(e)}"
            logging.error(error_message)

        response_data.append(StockPositionOutput(
            ticker=original_ticker,
            quantity=stock.quantity,
            average_price=stock.average_price,
            total_value=stock.total_value,
            current_price=current_price,
            profit_loss=profit_loss,
            profit_loss_percent=profit_loss_percent,
            error=error_message,
        ))
    
    logging.info("Requisição /fetch-current-prices processada com sucesso.")
    return response_data
