import pandas as pd
import numpy as np

def generate_signals(df: pd.DataFrame) -> pd.Series:
    ema_fast = df['Close'].ewm(span=7, adjust=False).mean()
    ema_slow = df['Close'].ewm(span=20, adjust=False).mean()
    macd = ema_fast - ema_slow
    signal_line = macd.ewm(span=3, adjust=False).mean()
    return pd.Series(np.where(macd > signal_line, 1, -1), index=df.index)