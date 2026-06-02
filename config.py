# Portfolio Configuration

# Mapped from user request: bitcoin, mstr, googl, ibit, nvda, amd, hood, xrp, ether, cbrs, gs
SYMBOLS = [
    "BTC/USD",  # Bitcoin
    "MSTR",     # MicroStrategy
    "GOOGL",    # Alphabet
    "IBIT",     # iShares Bitcoin Trust
    "NVDA",     # Nvidia
    "AMD",      # Advanced Micro Devices
    "HOOD",     # Robinhood
    "XRP/USD",  # XRP
    "ETH/USD",  # Ethereum
    "CBRS",     # Centric Brands (if invalid, API will skip)
    "QQQ",      # 
    "AMZN",     # 
    "CEG",      # 
    "CRCL",     #  
    "DELL",     #  
    "GS"        # Goldman Sachs
]

def get_module_name(symbol):
    """Convert symbol to a valid python module name (e.g. BTC/USD -> BTC_USD_algo)"""
    return symbol.replace("/", "_") + "_algo"
