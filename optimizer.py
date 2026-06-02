import subprocess
import os
import random
import shutil
from config import SYMBOLS, get_module_name

def generate_random_strategy():
    strategy_type = random.choice(['ema', 'macd', 'rsi', 'bollinger'])
    if strategy_type == 'ema':
        short_window = random.randint(2, 50)
        long_window = random.randint(short_window + 10, 250)
        return f"""import pandas as pd\nimport numpy as np\n\ndef generate_signals(df: pd.DataFrame) -> pd.Series:\n    ema_short = df['Close'].ewm(span={short_window}, adjust=False).mean()\n    ema_long = df['Close'].ewm(span={long_window}, adjust=False).mean()\n    return pd.Series(np.where(ema_short > ema_long, 1, -1), index=df.index)"""
    elif strategy_type == 'macd':
        fast = random.randint(5, 20)
        slow = random.randint(fast + 5, 50)
        signal = random.randint(3, 15)
        return f"""import pandas as pd\nimport numpy as np\n\ndef generate_signals(df: pd.DataFrame) -> pd.Series:\n    ema_fast = df['Close'].ewm(span={fast}, adjust=False).mean()\n    ema_slow = df['Close'].ewm(span={slow}, adjust=False).mean()\n    macd = ema_fast - ema_slow\n    signal_line = macd.ewm(span={signal}, adjust=False).mean()\n    return pd.Series(np.where(macd > signal_line, 1, -1), index=df.index)"""
    elif strategy_type == 'rsi':
        window = random.randint(7, 30)
        high = random.randint(60, 80)
        low = random.randint(20, 40)
        return f"""import pandas as pd\nimport numpy as np\n\ndef generate_signals(df: pd.DataFrame) -> pd.Series:\n    delta = df['Close'].diff()\n    gain = (delta.where(delta > 0, 0)).rolling(window={window}).mean()\n    loss = (-delta.where(delta < 0, 0)).rolling(window={window}).mean()\n    rs = gain / loss\n    rsi = 100 - (100 / (1 + rs))\n    signals = pd.Series(0, index=df.index)\n    signals[rsi > {high}] = -1\n    signals[rsi < {low}] = 1\n    return signals"""
    elif strategy_type == 'bollinger':
        window = random.randint(10, 50)
        std_dev = round(random.uniform(1.5, 3.0), 2)
        return f"""import pandas as pd\nimport numpy as np\n\ndef generate_signals(df: pd.DataFrame) -> pd.Series:\n    sma = df['Close'].rolling(window={window}).mean()\n    std = df['Close'].rolling(window={window}).std()\n    upper = sma + {std_dev} * std\n    lower = sma - {std_dev} * std\n    signals = pd.Series(0, index=df.index)\n    signals[df['Close'] > upper] = 1\n    signals[df['Close'] < lower] = -1\n    return signals"""

def optimize_for_symbol(symbol):
    print(f"\\n========================================")
    print(f" Optimizing Strategy for {symbol}")
    print(f"========================================")
    
    baseline_code = """import pandas as pd\nimport numpy as np\n\ndef generate_signals(df: pd.DataFrame) -> pd.Series:\n    return pd.Series(1, index=df.index)"""
    
    with open("trading_algo.py", "w") as f:
        f.write(baseline_code)
        
    result = subprocess.run(["venv/bin/python", "evaluate.py", symbol], capture_output=True, text=True)
    try:
        best_train = float([l for l in result.stdout.split("\\n") if "TRAIN_SHARPE:" in l][0].split(":")[1])
    except:
        best_train = 0.0
        
    print(f"[{symbol}] Baseline Train Sharpe: {best_train:.4f}")
    
    random.seed(hash(symbol)) # Unique search path per symbol
    strategies = [generate_random_strategy() for _ in range(50)]
    
    for i, code in enumerate(strategies):
        with open("trading_algo.py", "w") as f:
            f.write(code)
        
        result = subprocess.run(["venv/bin/python", "evaluate.py", symbol], capture_output=True, text=True)
        try:
            train_sharpe = float([l for l in result.stdout.split("\\n") if "TRAIN_SHARPE:" in l][0].split(":")[1])
        except Exception:
            train_sharpe = -999.0
            
        if train_sharpe > best_train:
            best_train = train_sharpe
            # We don't commit every step to keep log clean, just save the file
        else:
            # Revert to last best (or rather, the last best is what we save at the end, 
            # so we just maintain the best code string in memory)
            pass

    # Wait, the logic above needs to keep track of the best code string
    pass

def run_loop():
    for symbol in SYMBOLS:
        print(f"\\n========================================")
        print(f" Optimizing Strategy for {symbol}")
        print(f"========================================")
        
        baseline_code = """import pandas as pd\nimport numpy as np\n\ndef generate_signals(df: pd.DataFrame) -> pd.Series:\n    return pd.Series(1, index=df.index)"""
        best_code = baseline_code
        
        with open("trading_algo.py", "w") as f:
            f.write(best_code)
            
        result = subprocess.run(["venv/bin/python", "evaluate.py", symbol], capture_output=True, text=True)
        try:
            best_train = float([l for l in result.stdout.split("\n") if "TRAIN_SHARPE:" in l][0].split(":")[1])
        except:
            best_train = -999.0
            
        print(f"[{symbol}] Baseline Train Sharpe: {best_train:.4f}")
        
        random.seed(hash(symbol) % 10000) 
        strategies = [generate_random_strategy() for _ in range(50)]
        
        for i, code in enumerate(strategies):
            with open("trading_algo.py", "w") as f:
                f.write(code)
            
            result = subprocess.run(["venv/bin/python", "evaluate.py", symbol], capture_output=True, text=True)
            try:
                train_sharpe = float([l for l in result.stdout.split("\n") if "TRAIN_SHARPE:" in l][0].split(":")[1])
            except Exception:
                train_sharpe = -999.0
                
            if train_sharpe > best_train:
                print(f"  -> Iteration {i+1}: NEW BEST TRAIN SCORE {train_sharpe:.4f}")
                best_train = train_sharpe
                best_code = code

        # Save the best code for this symbol
        module_name = get_module_name(symbol)
        strategy_path = os.path.join("strategies", f"{module_name}.py")
        
        with open(strategy_path, "w") as f:
            f.write(best_code)
            
        # Get the final test score of the best code
        with open("trading_algo.py", "w") as f:
            f.write(best_code)
        result = subprocess.run(["venv/bin/python", "evaluate.py", symbol], capture_output=True, text=True)
        try:
            final_test = float([l for l in result.stdout.split("\n") if "TEST_SHARPE:" in l][0].split(":")[1])

        except:
            final_test = -999.0
            
        print(f"[{symbol}] Final Algorithm Saved to {strategy_path} (Train: {best_train:.4f} | Test: {final_test:.4f})")
        subprocess.run(["git", "add", strategy_path])
        subprocess.run(["git", "commit", "-m", f"Add optimized algorithm for {symbol}"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

if __name__ == "__main__":
    run_loop()
