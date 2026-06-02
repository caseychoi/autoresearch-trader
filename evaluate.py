import sys
import os
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from trading_algo import generate_signals

try:
    from alpaca.data.historical import StockHistoricalDataClient, CryptoHistoricalDataClient
    from alpaca.data.requests import StockBarsRequest, CryptoBarsRequest
    from alpaca.data.timeframe import TimeFrame
    from datetime import datetime
except ImportError:
    pass

load_dotenv()

def fetch_alpaca_data(symbol, start_year=2018):
    cache_file = f"{symbol.replace('/', '_')}_history.csv"
    if os.path.exists(cache_file):
        df = pd.read_csv(cache_file, index_col='timestamp', parse_dates=True)
        return df

    api_key = os.getenv("APCA_API_KEY_ID")
    secret_key = os.getenv("APCA_API_SECRET_KEY")
    
    if not api_key or not secret_key or api_key == "your_paper_trading_api_key_here":
        raise ValueError("Missing or default Alpaca API keys in .env file.")
        
    start_dt = datetime(start_year, 1, 1)
    end_dt = datetime(2025, 1, 1)
    
    if "/" in symbol: # Crypto
        client = CryptoHistoricalDataClient(api_key, secret_key)
        request_params = CryptoBarsRequest(
            symbol_or_symbols=symbol,
            timeframe=TimeFrame.Day,
            start=start_dt,
            end=end_dt
        )
        try:
            bars = client.get_crypto_bars(request_params)
        except Exception as e:
            raise ValueError(f"Failed to fetch crypto {symbol}: {e}")
    else: # Stock
        client = StockHistoricalDataClient(api_key, secret_key)
        request_params = StockBarsRequest(
            symbol_or_symbols=symbol,
            timeframe=TimeFrame.Day,
            start=start_dt,
            end=end_dt
        )
        try:
            bars = client.get_stock_bars(request_params)
        except Exception as e:
            raise ValueError(f"Failed to fetch stock {symbol}: {e}")
            
    df = bars.df.reset_index()
    df.set_index('timestamp', inplace=True)
    df.index = df.index.tz_localize(None) 
    df.rename(columns={'open': 'Open', 'high': 'High', 'low': 'Low', 'close': 'Close', 'volume': 'Volume'}, inplace=True)
    
    # Cache it
    df.to_csv(cache_file)
    return df

def calculate_sharpe_ratio(returns: pd.Series, risk_free_rate: float = 0.02, trading_days: int = 252) -> float:
    if len(returns) == 0: return 0.0
    mean_return = returns.mean() * trading_days
    volatility = returns.std() * np.sqrt(trading_days)
    if volatility == 0 or pd.isna(volatility):
        return 0.0
    return (mean_return - risk_free_rate) / volatility

def main():
    symbol = sys.argv[1] if len(sys.argv) > 1 else 'TSLA'
    
    try:
        df = fetch_alpaca_data(symbol, 2018)
        if df.empty:
            raise ValueError("Empty dataframe returned.")
    except Exception as e:
        print(f"TRAIN_SHARPE: -999.0000")
        print(f"TEST_SHARPE: -999.0000")
        return
        
    try:
        signals = generate_signals(df.copy())
    except Exception as e:
        print("TRAIN_SHARPE: -999.0000")
        print("TEST_SHARPE: -999.0000")
        return
    
    if len(signals) != len(df):
        print("TRAIN_SHARPE: -999.0000")
        print("TEST_SHARPE: -999.0000")
        return
        
    df['Daily_Return'] = df['Close'].pct_change()
    df['Strategy_Return'] = df['Daily_Return'] * signals.shift(1).fillna(0)
    strategy_returns = df['Strategy_Return'].dropna()
    
    if len(strategy_returns) == 0:
        print("TRAIN_SHARPE: -999.0000")
        print("TEST_SHARPE: -999.0000")
        return
        
    # SPLIT DATA (Train: < 2024, Test: >= 2024)
    train_returns = strategy_returns[strategy_returns.index < '2024-01-01']
    test_returns = strategy_returns[strategy_returns.index >= '2024-01-01']
    
    train_sharpe = calculate_sharpe_ratio(train_returns)
    test_sharpe = calculate_sharpe_ratio(test_returns)
    
    print(f"TRAIN_SHARPE: {train_sharpe:.4f}")
    print(f"TEST_SHARPE: {test_sharpe:.4f}")

if __name__ == "__main__":
    main()
