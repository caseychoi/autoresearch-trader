import streamlit as st
import pandas as pd
import os
from dotenv import load_dotenv

try:
    from alpaca.trading.client import TradingClient
    from alpaca.trading.requests import GetOrdersRequest
    from alpaca.trading.enums import QueryOrderStatus
except ImportError:
    pass

st.set_page_config(page_title="AutoResearch AI Dashboard", page_icon="📈", layout="wide")

@st.cache_resource
def get_trading_client():
    load_dotenv()
    # Try local .env first
    api_key = os.getenv("APCA_API_KEY_ID")
    secret_key = os.getenv("APCA_API_SECRET_KEY")
    
    # Fallback to Streamlit Secrets for cloud deployment
    if not api_key or api_key == "your_paper_trading_api_key_here":
        try:
            api_key = st.secrets["APCA_API_KEY_ID"]
            secret_key = st.secrets["APCA_API_SECRET_KEY"]
        except Exception:
            return None
            
    if not api_key:
        return None
        
    return TradingClient(api_key, secret_key, paper=True)

trading_client = get_trading_client()

st.title("📈 AutoResearch AI Portfolio")
st.markdown("Live Autonomous Trading Engine")

if not trading_client:
    st.error("Alpaca API Keys missing. If running locally, check `.env`. If running on Streamlit Cloud, add them to your App Secrets.")
    st.stop()

# Fetch Data
try:
    account = trading_client.get_account()
    positions = trading_client.get_all_positions()
    req = GetOrdersRequest(status=QueryOrderStatus.ALL, limit=10)
    orders = trading_client.get_orders(filter=req)
except Exception as e:
    st.error(f"Failed to connect to Alpaca: {e}")
    st.stop()

# Equity Top Row
col1, col2 = st.columns(2)
with col1:
    st.metric("Total Portfolio Equity", f"${float(account.equity):,.2f}")
with col2:
    st.metric("Available Buying Power", f"${float(account.buying_power):,.2f}")

st.divider()

# Positions & Orders
col3, col4 = st.columns([2, 1])

with col3:
    st.subheader("Open Positions")
    if len(positions) == 0:
        st.info("No open positions.")
    else:
        pos_data = [{
            "Asset": p.symbol,
            "Quantity": float(p.qty),
            "Market Value ($)": float(p.market_value),
            "Unrealized P&L ($)": float(p.unrealized_pl),
            "Unrealized P&L (%)": float(p.unrealized_plpc) * 100
        } for p in positions]
        
        df = pd.DataFrame(pos_data)
        st.dataframe(df, use_container_width=True, hide_index=True)

with col4:
    st.subheader("Recent AI Alerts")
    if len(orders) == 0:
        st.info("No recent orders.")
    else:
        for o in orders:
            qty = float(o.qty) if o.qty else 0
            color = "green" if o.side.name.lower() == "buy" else "red"
            st.markdown(
                f"""
                <div style="border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; margin-bottom: 10px;">
                    <strong>{o.symbol}</strong> <span style="float:right; color: {color}; font-weight: bold;">{o.side.name} {qty}</span><br>
                    <span style="font-size: 0.8em; color: gray;">{o.created_at.strftime('%Y-%m-%d %H:%M')} • {o.status.name}</span>
                </div>
                """, unsafe_allow_html=True
            )
