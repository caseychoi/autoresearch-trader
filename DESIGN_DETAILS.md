# AutoResearch Trader: System Design Details

This document outlines the internal mechanics, algorithms, and data pipelines of the AutoResearch Trader. It provides the exact specifications needed to rebuild or heavily modify the system in the future.

## 1. The Strategy Optimizer (`optimizer.py`)

The optimizer serves as the "AI Researcher" of the system. It uses a random-search evolutionary approach to discover the best trading algorithms.

**Workflow:**
1. **Algorithm Generation:** For each asset in `SYMBOLS`, it generates 50 random trading strategies. The generator picks from 4 classic technical indicators (EMA, MACD, RSI, Bollinger Bands) and randomizes their parameters (e.g., random short/long window lengths for EMA).
2. **Evaluation Execution:** It writes the generated code into `trading_algo.py` and runs `subprocess.run(["python", "evaluate.py", symbol])`.
3. **Metric Extraction:** It parses the standard output of `evaluate.py` to extract the `TRAIN_SHARPE` ratio.
4. **Selection:** It keeps track of the highest `TRAIN_SHARPE`. If a randomly generated algorithm beats the current best, it replaces it.
5. **Finalization:** The best performing algorithm for that specific asset is permanently saved into the `strategies/` directory as `{module_name}_algo.py` (e.g., `TSLA_algo.py`).

## 2. The Evaluator (`evaluate.py`)

The evaluator is a historical backtesting engine that calculates risk-adjusted performance (Sharpe Ratio).

**Workflow:**
1. **Data Fetching:** Connects to the Alpaca Historical Data API to download daily bars (`Open, High, Low, Close, Volume`) from 2018 to 2025.
2. **Data Caching:** Saves the downloaded data to a local CSV file (e.g., `TSLA_history.csv`) to dramatically speed up the optimizer's iteration loop.
3. **Signal Generation:** Passes the historical DataFrame to `generate_signals(df)` from `trading_algo.py`, which must return a Pandas Series of signals (-1 for short, 0 for neutral, 1 for long).
4. **Return Calculation:** 
   - Computes daily asset returns: `df['Close'].pct_change()`
   - Computes strategy returns: `Daily_Return * signals.shift(1)`
5. **Data Splitting:**
   - **Train Set:** All data strictly before `2024-01-01`.
   - **Test Set:** All data from `2024-01-01` onwards.
6. **Output:** Prints `TRAIN_SHARPE: <value>` and `TEST_SHARPE: <value>` to stdout.

## 3. The Live Execution Engine (`live_trader.py`)

The live trader translates the saved strategies into real (or paper) money trades via Alpaca.

**Workflow:**
1. **API Connection:** Authenticates with the Alpaca Paper Trading API using `APCA_API_KEY_ID` and `APCA_API_SECRET_KEY`.
2. **Asset Iteration:** Loops through every symbol in `config.SYMBOLS`.
3. **Strategy Loading:** Dynamically imports the optimized strategy for the asset from `strategies/{module_name}_algo.py`.
4. **State Fetching:**
   - Downloads the last 365 days of price data for the asset.
   - Pings the Alpaca API to get the current open position quantity for the asset.
5. **Signal Execution:**
   - Passes the 365-day dataframe to the loaded strategy's `generate_signals(df)`.
   - Looks ONLY at the final row: `latest_signal = signals.iloc[-1]`.
   - **Trade Sizing:** Hardcoded to 5 shares/coins per trade.
   - **Execution Logic:**
     - If `latest_signal == 1` (BUY) and the system is currently short or neutral: It closes any short position and submits a `MarketOrder` to buy 5 shares.
     - If `latest_signal == -1` (SELL) and the system is currently long or neutral: It closes any long position and submits a `MarketOrder` to short 5 shares (Note: crypto shorting is bypassed as Alpaca doesn't support it).

## 4. Rebuilding Guidelines

If you ever rebuild this system anew, keep these design constraints in mind:
*   **Decoupled Modules:** The Optimizer must never interact directly with the Live Trader. The Optimizer's only job is to write python files to the `strategies/` folder. The Live Trader's only job is to read them.
*   **Time Series Leakage:** In `evaluate.py`, the `signals.shift(1)` is the most critical line of code in the system. It ensures that the signal generated on Day 1 only captures the return on Day 2. If you rebuild the backtester, never remove the shift, or the AI will "cheat" by looking into the future.
*   **Stateless Trading:** The `live_trader.py` does not remember what it did yesterday. Every time it runs, it queries Alpaca for the current state, queries the algorithm for the current signal, and reconciles the difference. This makes it highly robust to crashes.
