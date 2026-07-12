let money = 2000;
let fuel = 500;
let price = 2.5;
let currentClientFuelNeeded = 0;
let hasClient = false;

// Элементы интерфейса
const moneyEl = document.getElementById('money');
const fuelEl = document.getElementById('fuel');
const priceEl = document.getElementById('price');
const carEl = document.getElementById('car');
const serveBtn = document.getElementById('serve-btn');
const logEl = document.getElementById('log');

// Обновление цифр на экране
function updateUI() {
    moneyEl.innerText = money.toFixed(2);
    fuelEl.innerText = fuel;
    priceEl.innerText = price.toFixed(2);
}

// Появление новой машины
function spawnCar() {
    if (hasClient) return;
    
    // Если цена слишком высокая, клиенты могут не приехать
    if (price > 4.5 && Math.random() > 0.3) {
        logEl.innerText = "Клиенты видят высокую цену и проезжают мимо...";
        return;
    }

    hasClient = true;
    currentClientFuelNeeded = Math.floor(Math.random() * 35) + 15; // 15-50 литров
    
    logEl.innerText = `Подъехала машина! Требуется ${currentClientFuelNeeded} л.`;
    carEl.className = "car arrived";
    serveBtn.disabled = false;
}

// Кнопка: Заправить клиента
serveBtn.addEventListener('click', () => {
    if (!hasClient) return;

    if (fuel >= currentClientFuelNeeded) {
        fuel -= currentClientFuelNeeded;
        let earned = currentClientFuelNeeded * price;
        money += earned;
        logEl.innerText = `Успешно заправили на $${earned.toFixed(2)}!`;
    } else {
        logEl.innerText = "Недостаточно топлива на заправке! Клиент уехал злой.";
    }

    // Машина уезжает
    serveBtn.disabled = true;
    carEl.className = "car hidden";
    hasClient = false;
    updateUI();
});

// Кнопка: Закупка бензина оптом
document.getElementById('buy-fuel-btn').addEventListener('click', () => {
    if (money >= 120 && fuel <= 900) {
        money -= 120;
        fuel += 100;
        logEl.innerText = "Закуплено 100 литров топлива.";
        updateUI();
    } else if (fuel > 900) {
        logEl.innerText = "Цистерна заполнена!";
    } else {
        logEl.innerText = "Не хватает денег на закупку!";
    }
});

// Кнопки изменения цены
document.getElementById('raise-price-btn').addEventListener('click', () => {
    price += 0.5;
    updateUI();
});

document.getElementById('lower-price-btn').addEventListener('click', () => {
    if (price > 0.5) {
        price -= 0.5;
        updateUI();
    }
});

// Запуск бесконечного цикла приезда машин (каждые 5 секунд)
setInterval(spawnCar, 5000);
