import pandas as pd
import numpy as np

def generate_signals(df: pd.DataFrame) -> pd.Series:
    sma = df['Close'].rolling(window=14).mean()
    std = df['Close'].rolling(window=14).std()
    upper = sma + 1.67 * std
    lower = sma - 1.67 * std
    signals = pd.Series(0, index=df.index)
    signals[df['Close'] > upper] = 1
    signals[df['Close'] < lower] = -1
    return signals