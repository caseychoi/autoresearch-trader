# AutoResearch Objective: Algorithmic Trading (Train/Test Split)

## Goal
Your objective is to maximize the `TRAIN_SHARPE` ratio of the trading strategy. 

## Rules & Constraints
1. **The Mutable File:** You are ONLY allowed to edit `trading_algo.py`.
2. **The Metric:** Run `python evaluate.py` to test your algorithm against historical market data (2015-2025). The script will output two metrics:
   - `TRAIN_SHARPE`: (2015-2020 data). **This is your only objective.**
   - `TEST_SHARPE`: (2021-2025 data). You are **strictly forbidden** from using this number to make decisions. It is purely for observation.
3. **No Cheating:** You cannot hardcode future data lookups or edit `evaluate.py`. 
4. **Valid Signals:** `generate_signals(df)` must return a pandas Series of the same length as the input DataFrame containing only values like 1, -1, or 0.

## The AutoResearch Loop Workflow
When acting autonomously, execute the following loop continuously:

1. **Hypothesis:** Formulate a new idea to improve the strategy in `trading_algo.py`.
2. **Action:** Run the backtest by executing `python evaluate.py`.
3. **Revert or Commit:**
   - If the new `TRAIN_SHARPE` is **higher** than the previous best:
     Keep the change! Run `git add trading_algo.py` and `git commit -m "Improved Train Sharpe to <value>"`.
   - If the new `TRAIN_SHARPE` is **lower** or the code crashes:
     Throw the idea away. Run `git checkout -- trading_algo.py`.
