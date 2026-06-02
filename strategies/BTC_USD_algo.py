import pandas as pd
import numpy as np

def generate_signals(df: pd.DataFrame) -> pd.Series:
    sma = df['Close'].rolling(window=45).mean()
    std = df['Close'].rolling(window=45).std()
    upper = sma + 1.65 * std
    lower = sma - 1.65 * std
    signals = pd.Series(0, index=df.index)
    signals[df['Close'] > upper] = 1
    signals[df['Close'] < lower] = -1
    return signals