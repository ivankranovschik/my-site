let balance = 1000;

function updateBalance() {
  document.getElementById("balance").textContent = balance;
}

function getReward() {

  balance += 100;

  document.getElementById("message").textContent =
    "🎉 Ты получил 100 игровых ₽!";

  updateBalance();
}

function openCase() {

  if (balance < 500) {

    alert("❌ Недостаточно игровых ₽!");

    return;
  }

  balance -= 500;

  const items = [
    "🔪 Обычный нож",
    "🔫 Редкий предмет",
    "💎 Эпический предмет",
    "👑 Легендарный предмет"
  ];

  const randomItem =
    items[Math.floor(Math.random() * items.length)];

  alert("🎁 Тебе выпало: " + randomItem);

  updateBalance();
}
