import pandas as pd
import numpy as np

def generate_signals(df: pd.DataFrame) -> pd.Series:
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=28).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=28).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    signals = pd.Series(0, index=df.index)
    signals[rsi > 67] = -1
    signals[rsi < 36] = 1
    return signals