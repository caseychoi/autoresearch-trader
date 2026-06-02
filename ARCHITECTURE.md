# AutoResearch Trader: System Architecture

This document serves as the high-level technical overview of the `autoresearch-trader` system. It is intended for future developers or AI agents to understand how the various components interact, how they are deployed, and how to extend them.

## 1. Core Components

The application is split into several primary modules:

### A. The Research & Optimization Loop (`optimizer.py`, `evaluate.py`, `trading_algo.py`)
This is the offline "lab" environment. 
- **`trading_algo.py`**: The mutable file containing the core strategy logic (`generate_signals`).
- **`evaluate.py`**: Backtests the strategy against historical data (2015-2025) and outputs `TRAIN_SHARPE` and `TEST_SHARPE`.
- **`optimizer.py`**: The agentic loop script that iteratively refines `trading_algo.py` to maximize `TRAIN_SHARPE`.

### B. The Live Execution Engine (`live_trader.py`)
- Interfaces with the **Alpaca API**.
- Fetches live market data using `yfinance`.
- Translates the signals from `trading_algo.py` (and individual `/strategies/` scripts) into actual portfolio rebalancing orders.
- The main entry point is `run_portfolio_trading()`.

### C. The Remote Control & Alerting Layer (`telegram_bot.py`)
This script acts as the master control loop for live production. It combines an asynchronous Telegram interface with scheduled trading jobs.
- **Commands**: Parses chat messages like `/buy`, `/sell`, `/status`, `/balance`, `/positions`, `/pause`, and `/resume`.
- **Proactive Alerts**: A background loop (`monitor_price_drops`) polls open positions every 5 minutes and sends a push notification if a stock drops more than 10% intraday.
- **Scheduled Trading**: The `scheduled_trading_job` triggers `live_trader.run_portfolio_trading()` every weekday at 3:40 PM EST.
- **State Management**: The global variable `TRADING_PAUSED` dictates whether active trades and scheduled runs are allowed to execute.

### D. The Analytics Dashboard (`streamlit_app.py`)
- Provides a Web UI for visually analyzing backtest results and current live portfolio metrics.

## 2. Deployment Architecture (Render.com)

The system is designed to run completely autonomously in the cloud via **Render.com**.

### Web Service (Optional)
- **Start Command**: `streamlit run streamlit_app.py`
- Runs the visual dashboard.

### Background Worker (Primary Engine)
- **Start Command**: `python telegram_bot.py`
- Runs the combined Telegram bot and live trading scheduler.
- **Environment Variables Required**:
  - `ALPACA_API_KEY`: Your Alpaca Paper/Live API Key.
  - `ALPACA_SECRET_KEY`: Your Alpaca Secret Key.
  - `GEMINI_API_KEY` (Optional): For AI integrations.
  - (Note: The Telegram `TOKEN` and `MY_CHAT_ID` are currently hardcoded in `telegram_bot.py` but should ideally be moved to environment variables for security.)

## 3. How to Extend the System

### Adding a New Telegram Command
1. Define a new `async def my_command(update, context):` inside `telegram_bot.py`.
2. Add a `BotCommand("mycommand", "Description")` to the `post_init` function.
3. Register it in `main()` with `app.add_handler(CommandHandler("mycommand", my_command))`.

### Modifying the Trading Schedule
If you want to trade at a different time, locate the `app.job_queue.run_daily` definition inside `main()` of `telegram_bot.py` and modify the `trade_time` variable.

### Tuning the Price Drop Alert Threshold
Inside `telegram_bot.py` -> `monitor_price_drops()`, adjust the `if drop_pct <= -0.10:` line to change the sensitivity of the intraday alert.
