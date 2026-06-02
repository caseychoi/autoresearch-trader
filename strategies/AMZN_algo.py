import pandas as pd
import numpy as np

def generate_signals(df: pd.DataFrame) -> pd.Series:
    ema_short = df['Close'].ewm(span=23, adjust=False).mean()
    ema_long = df['Close'].ewm(span=179, adjust=False).mean()
    return pd.Series(np.where(ema_short > ema_long, 1, -1), index=df.index)