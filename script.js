const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

let money = 800;
let baseHp = 100;
let territoryControl = 50; 
let playerPvoDmg = 50;

let myDrones = [];
let enemyDrones = [];
let explosions = [];
let tracers = []; // Трассирующие снаряды ПВО

const moneyEl = document.getElementById('money');
const baseHpEl = document.getElementById('base-hp');
const controlPctEl = document.getElementById('control-pct');
const logEl = document.getElementById('status-log');

// Структура военных объектов (баз)
const militaryObjects = {
    player: [
        { name: "Штаб Командования", x: 40, y: 120, size: 25, color: "#3b82f6" },
        { name: "Завод БПЛА", x: 30, y: 220, size: 20, color: "#60a5fa" },
        { name: "РЛС ПВО", x: 60, y: 320, size: 18, color: "#93c5fd" }
    ],
    enemy: [
        { name: "Бункер Врага", x: 860, y: 120, size: 25, color: "#ef4444" },
        { name: "Сборочный Цех", x: 870, y: 220, size: 20, color: "#f87171" },
        { name: "Радар Слежения", x: 840, y: 320, size: 18, color: "#fca5a5" }
    ]
};

class Drone {
    constructor(x, y, team, model) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.model = model; // 'orlan', 'globalhawk', 'shahed', 'bayraktar'
        
        // Характеристики моделей БПЛА
        if (model === 'orlan') {
            this.name = "Орлан-10"; this.speed = 1.6; this.maxHp = 35; this.type = "scout"; this.icon = "🛸";
        } else if (model === 'globalhawk') {
            this.name = "RQ-4 Global Hawk"; this.speed = 1.0; this.maxHp = 110; this.type = "scout"; this.icon = "✈️";
        } else if (model === 'shahed') {
            this.name = "Shahed-136"; this.speed = 2.4; this.maxHp = 25; this.type = "kamikaze"; this.icon = "📐";
        } else if (model === 'bayraktar') {
            this.name = "Bayraktar TB2"; this.speed = 1.4; this.maxHp = 70; this.type = "kamikaze"; this.icon = "🛩️";
        }

        if (team === 'enemy') this.speed = -this.speed;
        this.hp = this.maxHp;
    }

    update() {
        this.x += this.speed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.team === 'enemy') ctx.scale(-1, 1); // Поворот спрайта врага
        
        // Силуэт/Иконка дрона
        ctx.fillStyle = this.team === 'player' ? '#60a5fa' : '#f87171';
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.icon, 0, 0);
        ctx.restore();

        // Название и Полоска HP
        ctx.fillStyle = '#94a3b8';
        ctx.font = "9px monospace";
        ctx.fillText(this.name, this.x - 25, this.y - 18);

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(this.x - 20, this.y - 14, 40, 3);
        ctx.fillStyle = this.team === 'player' ? '#3b82f6' : '#ef4444';
        ctx.fillRect(this.x - 20, this.y - 14, (this.hp / this.maxHp) * 40, 3);
    }
}

// Слушатели кнопок запуска игрока
document.getElementById('spawn-orlan').addEventListener('click', () => { if (money >= 150) { money -= 150; myDrones.push(new Drone(80, Math.random() * 260 + 80, 'player', 'orlan')); } });
document.getElementById('spawn-globalhawk').addEventListener('click', () => { if (money >= 400) { money -= 400; myDrones.push(new Drone(80, Math.random() * 260 + 80, 'player', 'globalhawk')); } });
document.getElementById('spawn-shahed').addEventListener('click', () => { if (money >= 200) { money -= 200; myDrones.push(new Drone(80, Math.random() * 260 + 80, 'player', 'shahed')); } });
document.getElementById('spawn-bayraktar').addEventListener('click', () => { if (money >= 500) { money -= 500; myDrones.push(new Drone(80, Math.random() * 260 + 80, 'player', 'bayraktar')); } });
document.getElementById('upgrade-pao').addEventListener('click', () => { if (money >= 450) { money -= 450; playerPvoDmg += 30; logEl.innerText = "ЗРК Базы улучшен! Мощность ПВО повышена."; } });

// Игрок сбивает врагов кликом (ПВО)
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    explosions.push({x: clickX, y: clickY, radius: 2, maxRadius: 30, color: "rgba(251, 146, 60, "});
    tracers.push({startX: 60, startY: 320, endX: clickX, endY: clickY, alpha: 1}); // Трассер от нашей РЛС ПВО

    enemyDrones.forEach((drone, index) => {
        if (Math.hypot(drone.x - clickX, drone.y - clickY) < 35) {
            drone.hp -= playerPvoDmg;
            if (drone.hp <= 0) {
                enemyDrones.splice(index, 1);
                money += 80;
                logEl.innerText = `Перехвачен ${drone.name}! Получены средства: +$80`;
            }
        }
    });
});

// ИИ Врага: пускает реальные дроны и сбивает автоматическим ПВО ваши дроны
function enemyAIProcessing() {
    // 1. Запуск вражеских дронов
    if (Math.random() < 0.015) {
        const models = ['orlan', 'shahed', 'bayraktar'];
        const chosenModel = models[Math.floor(Math.random() * models.length)];
        enemyDrones.push(new Drone(820, Math.random() * 260 + 80, 'enemy', chosenModel));
    }

    // 2. РАБОТА ВРАЖЕСКОГО ПВО (Сбивает ваши дроны)
    if (Math.random() < 0.04 && myDrones.length > 0) { // Частота выстрелов врага
        let targetDrone = myDrones[Math.floor(Math.random() * myDrones.length)];
        
        // Враг стреляет только если дрон залетел на его половину карты
        let enemyRadarX = militaryObjects.enemy[2].x;
        let enemyRadarY = militaryObjects.enemy[2].y;
        
        if (targetDrone.x > (territoryControl / 100) * canvas.width - 50) {
            tracers.push({startX: enemyRadarX, startY: enemyRadarY, endX: targetDrone.x, endY: targetDrone.y, alpha: 1, color: "239, 68, 68"});
            explosions.push({x: targetDrone.x, y: targetDrone.y, radius: 2, maxRadius: 20, color: "rgba(239, 68, 68, "});
            
            targetDrone.hp -= 20; // Урон вражеского ПВО
            logEl.innerText = `⚠️ Вражеский ЗРК обстрелял наш ${targetDrone.name}!`;

            if (targetDrone.hp <= 0) {
                myDrones.splice(myDrones.indexOf(targetDrone), 1);
                logEl.innerText = `❌ Потеря: Наш ${targetDrone.name} был сбит вражеским ПВО.`;
            }
        }
    }
}

function gameLoop() {
    // Фон военной карты
    ctx.fillStyle = '#141722';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Отрисовка секторов контроля территории
    let frontLineX = (territoryControl / 100) * canvas.width;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.06)';
    ctx.fillRect(0, 0, frontLineX, canvas.height);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.06)';
    ctx.fillRect(frontLineX, 0, canvas.width - frontLineX, canvas.height);

    // Линия соприкосновения (Фронт)
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(frontLineX, 0); ctx.lineTo(frontLineX, canvas.height); ctx.stroke();

    // Отрисовка военных объектов на базах
    drawMilitaryObjects();

    money += 0.08; 
    moneyEl.innerText = Math.floor(money);
    baseHpEl.innerText = baseHp;
    controlPctEl.innerText = Math.floor(territoryControl);

    enemyAIProcessing();

    // Обновление наших БПЛА
    myDrones.forEach((drone, index) => {
        drone.update(); drone.draw();
        if (drone.x >= 820) {
            if (drone.type === 'kamikaze') { territoryControl += 5; } else { territoryControl += 2; money += 200; }
            myDrones.splice(index, 1);
            logEl.innerText = `🎯 Успех! Наш ${drone.name} нанес удар по инфраструктуре врага.`;
        }
    });

    // Обновление вражеских БПЛА
    enemyDrones.forEach((drone, index) => {
        drone.update(); drone.draw();
        if (drone.x <= 80) {
            if (drone.type === 'kamikaze') { baseHp -= 12; territoryControl -= 4; } else { territoryControl -= 1.5; }
            enemyDrones.splice(index, 1);
            logEl.innerText = `💥 Критично! Вражеский ${drone.name} прорвался и атаковал наш объект!`;
        }
    });

    // Отрисовка трассеров ПВО
    tracers.forEach((t, index) => {
        ctx.strokeStyle = `rgba(${t.color || '59, 130, 246'}, ${t.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(t.startX, t.startY); ctx.lineTo(t.endX, t.endY); ctx.stroke();
        t.alpha -= 0.05;
        if (t.alpha <= 0) tracers.splice(index, 1);
    });

    // Отрисовка взрывов
    explosions.forEach((exp, index) => {
        ctx.strokeStyle = exp.color + (1 - exp.radius/exp.maxRadius) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2); ctx.stroke();
        exp.radius += 2;
        if (exp.radius >= exp.maxRadius) explosions.splice(index, 1);
    });

    // Финал игры
    if (baseHp <= 0 || territoryControl <= 0) { alert("Ваши военные объекты разрушены. Поражение."); resetGame(); }
    else if (territoryControl >= 100) { alert("Вы полностью уничтожили силы противника! Победа!"); resetGame(); }
    else { requestAnimationFrame(gameLoop); }
}

function drawMilitaryObjects() {
    ['player', 'enemy'].forEach(team => {
        militaryObjects[team].forEach(obj => {
            ctx.fillStyle = obj.color;
            ctx.fillRect(obj.x - obj.size/2, obj.y - obj.size/2, obj.size, obj.size);
            ctx.fillStyle = '#64748b';
            ctx.font = "9px sans-serif";
            ctx.fillText(obj.name, obj.x - obj.size, obj.y + obj.size);
        });
    });
}

function resetGame() {
    money = 800; baseHp = 100; territoryControl = 50; playerPvoDmg = 50;
    myDrones = []; enemyDrones = []; explosions = []; tracers = [];
    gameLoop();
}

gameLoop();
