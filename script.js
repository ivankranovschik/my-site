const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// Игровые ресурсы
let money = 600;
let baseHp = 100;
let territoryControl = 50; // Процент контроля (от 0 до 100). 100 - победа.
let pvoDamage = 50;

// Списки объектов
let myDrones = [];
let enemyDrones = [];
let explosions = [];

// Интерфейс
const moneyEl = document.getElementById('money');
const baseHpEl = document.getElementById('base-hp');
const controlPctEl = document.getElementById('control-pct');
const logEl = document.getElementById('status-log');

// Класс Дрона
class Drone {
    constructor(x, y, team, type) {
        this.x = x;
        this.y = y;
        this.team = team; // 'player' или 'enemy'
        this.type = type; // 'scout' или 'kamikaze'
        this.speed = team === 'player' ? 2 : -2;
        this.hp = type === 'scout' ? 40 : 20;
        this.size = type === 'scout' ? 12 : 8;
        this.color = team === 'player' ? '#3b82f6' : '#ef4444';
    }

    update() {
        this.x += this.speed;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (this.type === 'scout') {
            // Рисуем треугольный самолетик
            ctx.moveTo(this.x + (this.team === 'player' ? 15 : -15), this.y);
            ctx.lineTo(this.x, this.y - this.size);
            ctx.lineTo(this.x, this.y + this.size);
        } else {
            // Квадратный камикадзе
            ctx.rect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        }
        ctx.fill();

        // Полоска здоровья
        ctx.fillStyle = '#rgba(0,0,0,0.5)';
        ctx.fillRect(this.x - 10, this.y - this.size - 7, 20, 4);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(this.x - 10, this.y - this.size - 7, (this.hp / (this.type==='scout'?40:20)) * 20, 4);
    }
}

// Запуски дронов игрока
document.getElementById('spawn-scout').addEventListener('click', () => {
    if (money >= 150) { money -= 150; myDrones.push(new Drone(50, Math.random() * 300 + 50, 'player', 'scout')); logEl.innerText = "Запущен разведывательный БПЛА."; }
});
document.getElementById('spawn-kamikaze').addEventListener('click', () => {
    if (money >= 300) { money -= 300; myDrones.push(new Drone(50, Math.random() * 300 + 50, 'player', 'kamikaze')); logEl.innerText = "Ударный дрон-камикадзе в воздухе!"; }
});
document.getElementById('upgrade-pao').addEventListener('click', () => {
    if (money >= 500) { money -= 500; pvoDamage += 25; logEl.innerText = "Системы ПВО модернизированы! Урон увеличен."; }
});

// Клик по карте (Работа ПВО)
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Взрыв в месте клика
    explosions.push({x: clickX, y: clickY, radius: 2, maxRadius: 25});

    // Проверяем попадание во вражеские дроны
    enemyDrones.forEach((drone, index) => {
        let dist = Math.hypot(drone.x - clickX, drone.y - clickY);
        if (dist < 30) { // Радиус поражения ПВО
            drone.hp -= pvoDamage;
            if (drone.hp <= 0) {
                enemyDrones.splice(index, 1);
                money += 100; // Награда за сбитие
                logEl.innerText = "Вражеский БПЛА уничтожен силами ПВО! +$100";
            }
        }
    });
});

// Логика ИИ противника (Запуск вражеских дронов)
function enemyAI() {
    if (Math.random() < 0.03) { // Шанс запуска каждый кадр
        let type = Math.random() > 0.4 ? 'kamikaze' : 'scout';
        enemyDrones.push(new Drone(750, Math.random() * 300 + 50, 'enemy', type));
    }
}

// Главный игровой движок (Перерисовка 60 раз в секунду)
function gameLoop() {
    // 1. Очистка и отрисовка карты/фона страны
    ctx.fillStyle = '#1e293b'; // Земля
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Рисуем линию фронта на основе territoryControl
    let frontLineX = (territoryControl / 100) * canvas.width;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)'; // Ваша зона
    ctx.fillRect(0, 0, frontLineX, canvas.height);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'; // Вражеская зона
    ctx.fillRect(frontLineX, 0, canvas.width - frontLineX, canvas.height);

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(frontLineX, 0);
    ctx.lineTo(frontLineX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Плавный доход
    money += 0.05; 
    moneyEl.innerText = Math.floor(money);
    baseHpEl.innerText = baseHp;
    controlPctEl.innerText = Math.floor(territoryControl);

    // Работа ИИ
    enemyAI();

    // 2. Обновление и отрисовка ваших дронов
    myDrones.forEach((drone, index) => {
        drone.update();
        drone.draw();
        
        // Долетел до базы врага
        if (drone.x >= 750) {
            if (drone.type === 'kamikaze') {
                territoryControl += 4;
                logEl.innerText = "Наш камикадзе успешно поразил объекты врага! Фронт сдвинут.";
            } else {
                territoryControl += 1.5;
                money += 150;
                logEl.innerText = "Разведчик собрал данные о территории! Получены гранты.";
            }
            myDrones.splice(index, 1);
        }
    });

    // 3. Обновление и отрисовка вражеских дронов
    enemyDrones.forEach((drone, index) => {
        drone.update();
        drone.draw();

        // Долетел до вашей базы
        if (drone.x <= 50) {
            if (drone.type === 'kamikaze') {
                baseHp -= 10;
                territoryControl -= 3;
                logEl.innerText = "🚨 Тревога! Вражеский камикадзе прорвал оборону и нанес удар по базе!";
            } else {
                territoryControl -= 1;
                logEl.innerText = "Вражеский разведчик вскрыл наши позиции. Мы отступаем.";
            }
            enemyDrones.splice(index, 1);
        }
    });

    // Отрисовка эффектов анимации взрывов от кликов ПВО
    explosions.forEach((exp, index) => {
        ctx.strokeStyle = 'rgba(251, 146, 60, ' + (1 - exp.radius/exp.maxRadius) + ')';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.stroke();
        exp.radius += 2;
        if (exp.radius >= exp.maxRadius) explosions.splice(index, 1);
    });

    // Проверка условий окончания игры
    if (baseHp <= 0) {
        alert("Ваша база уничтожена! Игра окончена.");
        resetGame();
    } else if (territoryControl >= 100) {
        alert("Поздравляем! Вы полностью захватили территорию вымышленной страны! Победа!");
        resetGame();
    } else if (territoryControl <= 0) {
        alert("Враг полностью вытеснил вас с карты. Поражение.");
        resetGame();
    } else {
        requestAnimationFrame(gameLoop);
    }
}

function resetGame() {
    money = 600; baseHp = 100; territoryControl = 50; pvoDamage = 50;
    myDrones = []; enemyDrones = []; explosions = [];
    gameLoop();
}

// Старт игры
gameLoop();
