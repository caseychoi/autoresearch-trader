import os
import asyncio
import datetime
import pytz
from dotenv import load_dotenv
from telegram import Update, BotCommand
from telegram.ext import Application, CommandHandler, ContextTypes
import alpaca_trade_api as tradeapi

# Load environment variables
load_dotenv()

TOKEN = "8647523534:AAFRdyqwT_0ynCEj6SZWXK-ooN7t_6di1FE"
MY_CHAT_ID = 8866461567

ALPACA_API_KEY = os.getenv("ALPACA_API_KEY")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")
ALPACA_BASE_URL = 'https://paper-api.alpaca.markets'

# Initialize Alpaca API
alpaca = tradeapi.REST(ALPACA_API_KEY, ALPACA_SECRET_KEY, base_url=ALPACA_BASE_URL)

# Global State
TRADING_PAUSED = False

async def security_check(update: Update) -> bool:
    if update.effective_user.id != MY_CHAT_ID:
        print(f"Blocked unauthorized access from {update.effective_user.id}")
        return False
    return True

# --- Commands ---

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await security_check(update): return
    welcome_message = (
        "🤖 *Mission Control Online!*\n\n"
        "Active Trading & Monitoring features enabled.\n"
        "Commands:\n"
        "👉 /buy <SYMBOL> <QTY> - Execute market buy\n"
        "👉 /sell <SYMBOL> <QTY> - Execute market sell\n"
        "👉 /status - Check system health\n"
        "👉 /balance - View live portfolio balance\n"
        "👉 /positions - View all open positions\n"
        "👉 /pause - Stop active trading\n"
        "👉 /resume - Resume active trading"
    )
    await update.message.reply_text(welcome_message, parse_mode="Markdown")

async def pause_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await security_check(update): return
    global TRADING_PAUSED
    TRADING_PAUSED = True
    await update.message.reply_text("⏸️ *EMERGENCY STOP ACTIVATED*\nAll automated trading has been paused.", parse_mode="Markdown")

async def resume_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await security_check(update): return
    global TRADING_PAUSED
    TRADING_PAUSED = False
    await update.message.reply_text("▶️ *TRADING RESUMED*\nAlgorithms and active trading are back online.", parse_mode="Markdown")

async def status_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await security_check(update): return
    try:
        clock = alpaca.get_clock()
        market_status = "Open" if clock.is_open else "Closed"
        pause_status = "PAUSED ⏸️" if TRADING_PAUSED else "ACTIVE ▶️"
        await update.message.reply_text(f"🟢 *System Status*\n\nMarket: {market_status}\nBot State: {pause_status}\nAlpaca API: Connected", parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text(f"🔴 *System Error*\n\nFailed to connect to Alpaca API.", parse_mode="Markdown")

async def balance_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await security_check(update): return
    try:
        account = alpaca.get_account()
        message = (
            f"💼 *Live Alpaca Portfolio*\n\n"
            f"Total Equity: ${float(account.equity):,.2f}\n"
            f"Buying Power: ${float(account.buying_power):,.2f}\n"
            f"Cash: ${float(account.cash):,.2f}"
        )
        await update.message.reply_text(message, parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text("❌ Could not retrieve account balance.", parse_mode="Markdown")

async def positions_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await security_check(update): return
    try:
        positions = alpaca.list_positions()
        if not positions:
            await update.message.reply_text("📉 You currently have no open stock positions.", parse_mode="Markdown")
            return
        
        message = "📈 *Your Open Stock Positions:*\n\n"
        for pos in positions:
            market_value = float(pos.market_value)
            unrealized_pl = float(pos.unrealized_pl)
            pl_sign = "+" if unrealized_pl >= 0 else ""
            message += f"• **{pos.symbol}**: {pos.qty} shares | Value: ${market_value:,.2f} | P/L: {pl_sign}${unrealized_pl:,.2f}\n"
        
        await update.message.reply_text(message, parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text("❌ Could not retrieve positions.", parse_mode="Markdown")

async def buy_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await security_check(update): return
    global TRADING_PAUSED
    if TRADING_PAUSED:
        await update.message.reply_text("⛔ Trading is currently PAUSED. Send /resume to enable trading.")
        return

    if len(context.args) < 2:
        await update.message.reply_text("Usage: /buy <SYMBOL> <QUANTITY>\nExample: `/buy AAPL 10`", parse_mode="Markdown")
        return

    symbol = context.args[0].upper()
    try:
        qty = float(context.args[1])
    except ValueError:
        await update.message.reply_text("❌ Quantity must be a number.")
        return

    try:
        order = alpaca.submit_order(
            symbol=symbol,
            qty=qty,
            side='buy',
            type='market',
            time_in_force='gtc'
        )
        await update.message.reply_text(f"⏳ *BUY Order Submitted!*\n\nSymbol: {symbol}\nQuantity: {qty}\nType: Market Buy\n\n_Waiting for execution..._", parse_mode="Markdown")
        
        # Poll for fill status
        for _ in range(15):
            await asyncio.sleep(1)
            order_status = await asyncio.to_thread(alpaca.get_order, order.id)
            if order_status.status == 'filled':
                avg_price = float(order_status.filled_avg_price) if order_status.filled_avg_price else 0.0
                await update.message.reply_text(f"✅ *BUY Order Filled!*\n\nBought {order_status.filled_qty} shares of {symbol} at avg price ${avg_price:.2f}", parse_mode="Markdown")
                return
            elif order_status.status in ['canceled', 'rejected', 'expired']:
                await update.message.reply_text(f"⚠️ *Order {order_status.status.capitalize()}*", parse_mode="Markdown")
                return
                
        await update.message.reply_text("⏱️ *Order Pending*\nIt is taking longer than usual to fill (market may be closed). It will execute later.", parse_mode="Markdown")
        
    except Exception as e:
        await update.message.reply_text(f"❌ *Failed to submit BUY order.*\n\nError: {str(e)}", parse_mode="Markdown")

async def sell_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await security_check(update): return
    global TRADING_PAUSED
    if TRADING_PAUSED:
        await update.message.reply_text("⛔ Trading is currently PAUSED. Send /resume to enable trading.")
        return

    if len(context.args) < 2:
        await update.message.reply_text("Usage: /sell <SYMBOL> <QUANTITY>\nExample: `/sell AAPL 10`", parse_mode="Markdown")
        return

    symbol = context.args[0].upper()
    try:
        qty = float(context.args[1])
    except ValueError:
        await update.message.reply_text("❌ Quantity must be a number.")
        return

    try:
        order = alpaca.submit_order(
            symbol=symbol,
            qty=qty,
            side='sell',
            type='market',
            time_in_force='gtc'
        )
        await update.message.reply_text(f"⏳ *SELL Order Submitted!*\n\nSymbol: {symbol}\nQuantity: {qty}\nType: Market Sell\n\n_Waiting for execution..._", parse_mode="Markdown")
        
        # Poll for fill status
        for _ in range(15):
            await asyncio.sleep(1)
            order_status = await asyncio.to_thread(alpaca.get_order, order.id)
            if order_status.status == 'filled':
                avg_price = float(order_status.filled_avg_price) if order_status.filled_avg_price else 0.0
                await update.message.reply_text(f"✅ *SELL Order Filled!*\n\nSold {order_status.filled_qty} shares of {symbol} at avg price ${avg_price:.2f}", parse_mode="Markdown")
                return
            elif order_status.status in ['canceled', 'rejected', 'expired']:
                await update.message.reply_text(f"⚠️ *Order {order_status.status.capitalize()}*", parse_mode="Markdown")
                return
                
        await update.message.reply_text("⏱️ *Order Pending*\nIt is taking longer than usual to fill (market may be closed). It will execute later.", parse_mode="Markdown")
        
    except Exception as e:
        await update.message.reply_text(f"❌ *Failed to submit SELL order.*\n\nError: {str(e)}", parse_mode="Markdown")

# --- Background Jobs ---

async def monitor_price_drops(context: ContextTypes.DEFAULT_TYPE):
    """Runs every 5 minutes to check for >10% intraday drops on portfolio stocks."""
    global TRADING_PAUSED
    if TRADING_PAUSED:
        return # Skip checks if paused

    try:
        positions = alpaca.list_positions()
        for pos in positions:
            # intraday change percentage (e.g. -0.105 means -10.5%)
            try:
                drop_pct = float(pos.unrealized_intraday_plpc)
            except (ValueError, TypeError):
                continue
                
            if drop_pct <= -0.10: # 10% drop
                alert_msg = (
                    f"⚠️ *MASSIVE PRICE DROP ALERT* ⚠️\n\n"
                    f"**{pos.symbol}** has dropped by {abs(drop_pct)*100:.2f}% today!\n"
                    f"Current Market Value: ${float(pos.market_value):,.2f}\n\n"
                    f"Do you want to sell? Reply with `/sell {pos.symbol} {pos.qty}`"
                )
                await context.bot.send_message(chat_id=MY_CHAT_ID, text=alert_msg, parse_mode="Markdown")
    except Exception as e:
        print(f"Error checking price drops: {e}")

async def daily_report(context: ContextTypes.DEFAULT_TYPE):
    """Runs daily at 4:05 PM EST to send the end-of-day summary."""
    try:
        account = alpaca.get_account()
        positions = alpaca.list_positions()
        
        equity = float(account.equity)
        last_equity = float(account.last_equity)
        daily_pl = equity - last_equity
        daily_pl_pct = (daily_pl / last_equity) * 100 if last_equity > 0 else 0
        pl_sign = "+" if daily_pl >= 0 else ""
        
        report = (
            f"📊 *DAILY WRAP-UP REPORT* 📊\n\n"
            f"**Total Equity:** ${equity:,.2f}\n"
            f"**Daily P/L:** {pl_sign}${daily_pl:,.2f} ({pl_sign}{daily_pl_pct:.2f}%)\n"
            f"**Open Positions:** {len(positions)}\n\n"
        )
        
        for pos in positions:
            unrealized_pl = float(pos.unrealized_pl)
            sign = "+" if unrealized_pl >= 0 else ""
            report += f"• {pos.symbol}: {sign}${unrealized_pl:,.2f}\n"
            
        await context.bot.send_message(chat_id=MY_CHAT_ID, text=report, parse_mode="Markdown")
    except Exception as e:
        await context.bot.send_message(chat_id=MY_CHAT_ID, text=f"❌ Failed to generate Daily Report: {e}")

async def scheduled_trading_job(context: ContextTypes.DEFAULT_TYPE):
    """Runs daily at 3:40 PM EST (Mon-Fri) to execute the main portfolio trading algorithm."""
    global TRADING_PAUSED
    if TRADING_PAUSED:
        await context.bot.send_message(chat_id=MY_CHAT_ID, text="⛔ *Scheduled Trading Skipped:*\nSystem is currently PAUSED.", parse_mode="Markdown")
        return
        
    await context.bot.send_message(chat_id=MY_CHAT_ID, text="⚙️ *Executing Scheduled Portfolio Trading...*", parse_mode="Markdown")
    try:
        from live_trader import run_portfolio_trading
        await asyncio.to_thread(run_portfolio_trading)
        await context.bot.send_message(chat_id=MY_CHAT_ID, text="✅ *Scheduled Trading Completed Successfully.*", parse_mode="Markdown")
    except Exception as e:
        await context.bot.send_message(chat_id=MY_CHAT_ID, text=f"❌ *Error During Scheduled Trading:*\n\n{e}", parse_mode="Markdown")

# --- Init & Run ---

async def post_init(application: Application):
    commands = [
        BotCommand("start", "Welcome Menu"),
        BotCommand("status", "System Status"),
        BotCommand("balance", "Portfolio Equity"),
        BotCommand("positions", "Open Positions"),
        BotCommand("buy", "Buy Stock: /buy AAPL 10"),
        BotCommand("sell", "Sell Stock: /sell AAPL 10"),
        BotCommand("pause", "Pause Trading"),
        BotCommand("resume", "Resume Trading")
    ]
    await application.bot.set_my_commands(commands)
    print("Registered command menu with Telegram UI.", flush=True)

def main():
    print("Starting Autonomous Trading Telegram Bot...", flush=True)
    app = Application.builder().token(TOKEN).post_init(post_init).build()
    
    # Register Commands
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("status", status_command))
    app.add_handler(CommandHandler("balance", balance_command))
    app.add_handler(CommandHandler("positions", positions_command))
    app.add_handler(CommandHandler("buy", buy_command))
    app.add_handler(CommandHandler("sell", sell_command))
    app.add_handler(CommandHandler("pause", pause_command))
    app.add_handler(CommandHandler("resume", resume_command))
    
    # Schedule Background Jobs
    # 1. Price drop monitor every 5 minutes
    app.job_queue.run_repeating(monitor_price_drops, interval=300, first=10)
    
    # 2. Daily Report at 4:05 PM EST
    est = pytz.timezone('US/Eastern')
    target_time = datetime.time(hour=16, minute=5, tzinfo=est)
    app.job_queue.run_daily(daily_report, time=target_time, days=(0, 1, 2, 3, 4, 5, 6))
    
    # 3. Scheduled Portfolio Trading at 3:40 PM EST (Mon-Fri)
    trade_time = datetime.time(hour=15, minute=40, tzinfo=est)
    app.job_queue.run_daily(scheduled_trading_job, time=trade_time, days=(0, 1, 2, 3, 4))
    
    print("Bot is polling and background tasks are running!", flush=True)
    app.run_polling()

if __name__ == "__main__":
    main()
