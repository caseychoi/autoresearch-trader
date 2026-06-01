import pandas as pd
import numpy as np

def generate_signals(df: pd.DataFrame) -> pd.Series:
    return pd.Series(1, index=df.index)