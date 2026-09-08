import asyncio
import os
import random
import sqlite3
import discord
from discord.ext import commands, tasks

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

conn = sqlite3.connect("upgrader.db")
cursor = conn.cursor()
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY,
        balance REAL DEFAULT 100.0
    )
"""
)
conn.commit()


def get_balance(user_id: int) -> float:
    cursor.execute("SELECT balance FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    if row is None:
        cursor.execute(
            "INSERT INTO users (user_id, balance) VALUES (?, 100.0)", (user_id,)
        )
        conn.commit()
        return 100.0
    return row[0]


def update_balance(user_id: int, amount: float):
    get_balance(user_id)
    cursor.execute(
        "UPDATE users SET balance = balance + ? WHERE user_id = ?",
        (amount, user_id),
    )
    conn.commit()


@tasks.loop(hours=1)
async def hourly_payday():
    cursor.execute("UPDATE users SET balance = balance + 100.0")
    conn.commit()


@bot.event
async def on_ready():
    hourly_payday.start()
    print(f"Бот {bot.user.name} запущен!")


@bot.command(name="баланс")
async def balance(ctx):
    bal = get_balance(ctx.author.id)
    await ctx.send(f"💳 Ваш баланс: **{bal:.2f}** игровой валюты.")


@bot.command(name="апгрейд")
async def upgrade(ctx, bet: float, multiplier: float):
    if bet <= 0 or multiplier <= 1.1:
        await ctx.send("⚠️ Ставка должна быть > 0, а множитель больше 1.1x!")
        return

    user_bal = get_balance(ctx.author.id)
    if bet > user_bal:
        await ctx.send("❌ Недостаточно средств на балансе!")
        return

    chance = round((100 / multiplier) * 0.95, 2)
    chance = min(chance, 95.0)

    roll = random.uniform(0, 100)
    is_win = roll <= chance

    if is_win:
        win_amount = bet * (multiplier - 1)
        update_balance(ctx.author.id, win_amount)
        new_bal = get_balance(ctx.author.id)
        await ctx.send(
            f"🎉 **УСПЕХ!** (Шанс: {chance}% | Выпало: {roll:.1f})\n"
            f"Вы выиграли **{bet * multiplier:.2f}** руб.! Ваш баланс: **{new_bal:.2f}** руб."
        )
    else:
        update_balance(ctx.author.id, -bet)
        new_bal = get_balance(ctx.author.id)
        await ctx.send(
            f"💥 **НЕУДАЧА!** (Шанс: {chance}% | Выпало: {roll:.1f})\n"
            f"Предмет сгорел (-{bet:.2f} руб.). Ваш баланс: **{new_bal:.2f}** руб."
        )


# Токен берется из переменных окружения для безопасности
TOKEN = os.getenv("DISCORD_TOKEN")
if TOKEN:
    bot.run(TOKEN)
else:
    print("Ошибка: Переменная DISCORD_TOKEN не найдена!")
