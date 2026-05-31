import os
import importlib
import warnings
from dotenv import load_dotenv
from config import SYMBOLS, get_module_name

try:
    from alpaca.trading.client import TradingClient
    from alpaca.trading.requests import MarketOrderRequest
    from alpaca.trading.enums import OrderSide, TimeInForce
    from alpaca.data.historical import StockHistoricalDataClient, CryptoHistoricalDataClient
    from alpaca.data.requests import StockBarsRequest, CryptoBarsRequest
    from alpaca.data.timeframe import TimeFrame
    from datetime import datetime, timedelta
except ImportError:
    pass

warnings.filterwarnings('ignore')

def send_mac_notification(title, message):
    try:
        # Escaping quotes to prevent syntax errors in AppleScript
        safe_message = message.replace('"', '\\"')
        os.system(f"""osascript -e 'display notification "{safe_message}" with title "{title}"'""")
    except Exception:
        pass

def run_portfolio_trading():
    load_dotenv()
    api_key = os.getenv("APCA_API_KEY_ID")
    secret_key = os.getenv("APCA_API_SECRET_KEY")
    
    if not api_key or not secret_key or api_key == "your_paper_trading_api_key_here":
        print("Error: Missing Alpaca API keys. Please update your .env file.")
        return

    print("Connecting to Alpaca Paper Trading for Multi-Asset Portfolio...")
    trading_client = TradingClient(api_key, secret_key, paper=True)
    stock_client = StockHistoricalDataClient(api_key, secret_key)
    crypto_client = CryptoHistoricalDataClient(api_key, secret_key)

    for symbol in SYMBOLS:
        print(f"\\n--- Trading Asset: {symbol} ---")
        
        module_name = get_module_name(symbol)
        try:
            strategy_module = importlib.import_module(f"strategies.{module_name}")
        except ModuleNotFoundError:
            print(f"Strategy file for {symbol} not found. Skipping...")
            continue
            
        generate_signals = strategy_module.generate_signals

        start_date = datetime.now() - timedelta(days=365)
        
        try:
            if "/" in symbol:
                req = CryptoBarsRequest(symbol_or_symbols=symbol, timeframe=TimeFrame.Day, start=start_date)
                bars = crypto_client.get_crypto_bars(req)
            else:
                req = StockBarsRequest(symbol_or_symbols=symbol, timeframe=TimeFrame.Day, start=start_date)
                bars = stock_client.get_stock_bars(req)
                
            df = bars.df.reset_index()
            df.set_index('timestamp', inplace=True)
            df.rename(columns={'open': 'Open', 'high': 'High', 'low': 'Low', 'close': 'Close', 'volume': 'Volume'}, inplace=True)
        except Exception as e:
            print(f"Failed to fetch data for {symbol}: {e}")
            continue
            
        if df.empty:
            print(f"No recent data for {symbol}. Skipping...")
            continue

        try:
            signals = generate_signals(df)
            latest_signal = signals.iloc[-1]
        except Exception as e:
            print(f"Error generating signal for {symbol}: {e}")
            continue
            
        print(f"Algorithm Signal: {'BUY' if latest_signal == 1 else 'SELL/SHORT' if latest_signal == -1 else 'NEUTRAL'}")
        
        try:
            position = trading_client.get_open_position(symbol.replace("/", "")) 
            current_qty = float(position.qty)
        except Exception:
            current_qty = 0.0
            
        print(f"Current Position: {current_qty} shares/coins")
        trade_size = 5 
        alpaca_symbol = symbol.replace("/", "") if "/" in symbol else symbol
        
        try:
            if latest_signal == 1 and current_qty <= 0:
                print(f"Executing BUY order to go LONG on {alpaca_symbol}...")
                if current_qty < 0:
                    trading_client.close_position(alpaca_symbol)
                
                order_data = MarketOrderRequest(
                    symbol=alpaca_symbol,
                    qty=trade_size,
                    side=OrderSide.BUY,
                    time_in_force=TimeInForce.GTC if "/" in symbol else TimeInForce.DAY
                )
                trading_client.submit_order(order_data)
                print("BUY order submitted.")
                send_mac_notification("AutoResearch AI Trade", f"BUY {trade_size} shares of {alpaca_symbol} executed!")
                
            elif latest_signal == -1 and current_qty >= 0:
                print(f"Executing SELL order to go SHORT on {alpaca_symbol}...")
                if current_qty > 0:
                    trading_client.close_position(alpaca_symbol)
                    
                if "/" not in symbol:
                    order_data = MarketOrderRequest(
                        symbol=alpaca_symbol,
                        qty=trade_size,
                        side=OrderSide.SELL,
                        time_in_force=TimeInForce.DAY
                    )
                    trading_client.submit_order(order_data)
                    print("SELL (Short) order submitted.")
                    send_mac_notification("AutoResearch AI Trade", f"SELL SHORT {trade_size} shares of {alpaca_symbol} executed!")
                else:
                    print("Shorting crypto is not supported on this Alpaca tier. Position closed, but not shorting.")
            else:
                print("Holding current position.")
        except Exception as e:
            print(f"Trade failed for {symbol}: {e}")

if __name__ == "__main__":
    print("========================================")
    print(" AutoResearch Multi-Asset Live Trader")
    print("========================================")
    run_portfolio_trading()
