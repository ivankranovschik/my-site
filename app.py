import random
import sqlite3
from flask import Flask, jsonify, render_template, request
from flask_apscheduler import APScheduler

app = Flask(__name__)


# База данных
def get_db_connection():
    conn = sqlite3.connect("upgrader.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY DEFAULT 1,
            balance REAL DEFAULT 100.0
        )
    """
    )
    conn.execute(
        "INSERT OR IGNORE INTO users (id, balance) VALUES (1, 100.0)"
    )
    conn.commit()
    conn.close()


init_db()

# Планировщик для часового пополнения (+100 руб каждый час)
scheduler = APScheduler()


@scheduler.task("interval", id="hourly_payday", hours=1)
def hourly_payday():
    conn = get_db_connection()
    conn.execute("UPDATE users SET balance = balance + 100.0 WHERE id = 1")
    conn.commit()
    conn.close()


scheduler.init_app(app)
scheduler.start()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/balance", methods=["GET"])
def get_balance():
    conn = get_db_connection()
    user = conn.execute("SELECT balance FROM users WHERE id = 1").fetchone()
    conn.close()
    return jsonify({"balance": user["balance"]})


@app.route("/api/upgrade", methods=["POST"])
def upgrade():
    data = request.json
    bet = float(data.get("bet", 0))
    multiplier = float(data.get("multiplier", 1.1))

    if bet <= 0 or multiplier <= 1.05:
        return jsonify({"error": "Некорректная ставка или множитель"}), 400

    conn = get_db_connection()
    user = conn.execute("SELECT balance FROM users WHERE id = 1").fetchone()
    balance = user["balance"]

    if bet > balance:
        conn.close()
        return jsonify({"error": "Недостаточно средств!"}), 400

    # Расчет шанса (RTP ~95%)
    chance = min(round((100 / multiplier) * 0.95, 2), 95.0)
    roll = random.uniform(0, 100)
    is_win = roll <= chance

    if is_win:
        win_amount = bet * (multiplier - 1)
        new_balance = balance + win_amount
    else:
        new_balance = balance - bet

    conn.execute(
        "UPDATE users SET balance = ? WHERE id = 1", (new_balance,)
    )
    conn.commit()
    conn.close()

    return jsonify(
        {
            "success": is_win,
            "roll": round(roll, 2),
            "chance": chance,
            "new_balance": round(new_balance, 2),
            "payout": round(bet * multiplier, 2) if is_win else 0,
        }
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
