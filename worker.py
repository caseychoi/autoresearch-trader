import time
import pytz
from datetime import datetime
from apscheduler.schedulers.background import BlockingScheduler
from live_trader import run_portfolio_trading

def job():
    ny_time = datetime.now(pytz.timezone('America/New_York'))
    print(f"\\n[{ny_time.strftime('%Y-%m-%d %H:%M:%S')}] Waking up to execute trading algorithm...")
    try:
        run_portfolio_trading()
    except Exception as e:
        print(f"Error during trading execution: {e}")
    print("Execution complete. Going back to sleep...")

if __name__ == '__main__':
    # Force the scheduler to use New York time
    ny_tz = pytz.timezone('America/New_York')
    scheduler = BlockingScheduler(timezone=ny_tz)

    print("==========================================================")
    print(" AutoResearch Cloud Worker Online")
    print(" Timezone set to America/New_York")
    print(" Schedule: Mon-Fri @ 3:40 PM EST (10 mins before close)")
    print("==========================================================")

    # Schedule the job to run Monday through Friday at 15:40 (3:40 PM)
    scheduler.add_job(job, 'cron', day_of_week='mon-fri', hour=15, minute=40)

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        print("Worker shutting down.")
