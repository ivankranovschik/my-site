const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

let money = 800;
let enemyMoney = 800;
let baseHp = 100;
let territoryControl = 50; 
let playerPvoDmg = 40;
let playerPvoRadius = 350; // Радиус автоматического ПВО игрока
let enemyPvoRadius = 350;  // Радиус ПВО врага

let myDrones = [];
let enemyDrones = [];
let explosions = [];
let tracers = [];

const moneyEl = document.getElementById('money');
const enemyMoneyEl = document.getElementById('enemy-money');
const baseHpEl = document.getElementById('base-hp');
const controlPctEl = document.getElementById('control-pct');
const logEl = document.getElementById('status-log');

const militaryObjects = {
    player: [
        { name: "Штаб Игрока", x: 40, y: 120, size: 24, color: "#2563eb" },
        { name: "Завод БПЛА", x: 30, y: 220, size: 20, color: "#3b82f6" },
        { name: "ЗРК Патриот (Авто)", x: 60, y: 320, size: 18, color: "#60a5fa" }
    ],
    enemy: [
        { name: "Штаб Врага", x: 860, y: 120, size: 24, color: "#dc2626" },
        { name: "Завод Врага", x: 870, y: 220, size: 20, color: "#ef4444" },
        { name: "ЗРК С-400 (Авто)", x: 840, y: 320, size: 18, color: "#f87171" }
    ]
};

class Drone {
    constructor(x, y, team, model) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.model = model;
        
        if (model === 'orlan') {
            this.name = "Орлан-10"; this.speed = 1.6; this.maxHp = 35; this.type = "scout";
        } else if (model === 'fp1') {
            this.name = "FP-1 (FPV)"; this.speed = 3.5; this.maxHp = 15; this.type = "kamikaze";
        } else if (model === 'globalhawk') {
            this.name = "RQ-4 Global"; this.speed = 0.9; this.maxHp = 120; this.type = "scout";
        } else if (model === 'shahed') {
            this.name = "Shahed-136"; this.speed = 2.2; this.maxHp = 25; this.type = "kamikaze";
        } else if (model === 'bayraktar') {
            this.name = "Bayraktar TB2"; this.speed = 1.3; this.maxHp = 75; this.type = "kamikaze";
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
        if (this.team === 'enemy') ctx.scale(-1, 1);
        
        ctx.strokeStyle = this.team === 'player' ? '#3b82f6' : '#ef4444';
        ctx.fillStyle = this.team === 'player' ? 'rgba(59,130,246,0.3)' : 'rgba(239,68,68,0.3)';
        ctx.lineWidth = 2;

        if (this.model === 'fp1') {
            ctx.beginPath();
            ctx.moveTo(-8, -8); ctx.lineTo(8, 8);
            ctx.moveTo(8, -8); ctx.lineTo(-8, 8);
            ctx.stroke();
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fillRect(-4, -4, 8, 8);
            ctx.beginPath();
            ctx.arc(-8, -8, 4, 0, Math.PI*2); ctx.arc(8, -8, 4, 0, Math.PI*2);
            ctx.arc(-8, 8, 4, 0, Math.PI*2); ctx.arc(8, 8, 4, 0, Math.PI*2);
            ctx.stroke();
        } else if (this.model === 'shahed') {
            ctx.beginPath();
            ctx.moveTo(12, 0);
            ctx.lineTo(-10, -14);
            ctx.lineTo(-6, 0);
            ctx.lineTo(-10, 14);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
        } else {
            let wingSpan = this.model === 'globalhawk' ? 24 : (this.model === 'bayraktar' ? 18 : 14);
            let length = this.model === 'globalhawk' ? 16 : 12;
            ctx.beginPath();
            ctx.moveTo(-length, 0); ctx.lineTo(length, 0);
            ctx.moveTo(2, -wingSpan); ctx.lineTo(4, wingSpan);
            ctx.moveTo(-length+2, -5); ctx.lineTo(-length+2, 5);
            ctx.stroke();
        }

        ctx.restore();

        ctx.fillStyle = '#64748b';
        ctx.font = "9px monospace";
        ctx.fillText(this.name, this.x - 20, this.y - 16);

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(this.x - 15, this.y - 11, 30, 3);
        ctx.fillStyle = this.team === 'player' ? '#10b981' : '#ef4444';
        ctx.fillRect(this.x - 15, this.y - 11, (this.hp / this.maxHp) * 30, 3);
    }
}

// Слушатели кнопок запуска игрока
document.getElementById('spawn-orlan').addEventListener('click', () => { if (money >= 150) { money -= 150; myDrones.push(new Drone(80, Math.random() * 260 + 80, 'player', 'orlan')); } });
document.getElementById('spawn-fp1').addEventListener('click', () => { if (money >= 120) { money -= 120; myDrones.push(new Drone(80, Math.random() * 260 + 80, 'player', 'fp1')); } });
document.getElementById('spawn-globalhawk').addEventListener('click', () => { if (money >= 400) { money -= 400; myDrones.push(new Drone(80, Math.random() * 260 + 80, 'player', 'globalhawk')); } });
document.getElementById('spawn-shahed').addEventListener('click', () => { if (money >= 200) { money -= 200; myDrones.push(new Drone(80, Math.random() * 260 + 80, 'player', 'shahed')); } });
document.getElementById('spawn-bayraktar').addEventListener('click', () => { if (money >= 500) { money -= 500; myDrones.push(new Drone(80, Math.random() * 260 + 80, 'player', 'bayraktar')); } });
document.getElementById('upgrade-pao').addEventListener('click', () => { if (money >= 450) { money -= 450; playerPvoDmg += 20; playerPvoRadius += 50; logEl.innerText = "ЗРК улучшен! Увеличен радиус авто-стрельбы и урон."; } });

// Ручной клик ПВО игрока
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left; const clickY = e.clientY - rect.top;
    explosions.push({x: clickX, y: clickY, radius: 2, maxRadius: 25, color: "rgba(251, 146, 60, "});
    tracers.push({startX: 60, startY: 320, endX: clickX, endY: clickY, alpha: 1, color: "59, 130, 246"});

    enemyDrones.forEach((drone, index) => {
        if (Math.hypot(drone.x - clickX, drone.y - clickY) < 35) {
            drone.hp -= playerPvoDmg;
            if (drone.hp <= 0) { enemyDrones.splice(index, 1); money += 80; }
        }
    });
});

// Экономика и Авто-ПВО Врага
function enemyAIProcessing() {
    enemyMoney += 0.08;

    if (Math.random() < 0.02) {
        const droneConfigs = [
            { model: 'fp1', cost: 120 },
            { model: 'orlan', cost: 150 },
            { model: 'shahed', cost: 200 },
            { model: 'bayraktar', cost: 500 }
        ];
        let affordable = droneConfigs.filter(d => enemyMoney >= d.cost);
        if (affordable.length > 0) {
            let choice = affordable[Math.floor(Math.random() * affordable.length)];
            enemyMoney -= choice.cost;
            enemyDrones.push(new Drone(820, Math.random() * 260 + 80, 'enemy', choice.model));
        }
    }

    // Авто-ПВО врага (Исправлено)
    let enemyPvo = militaryObjects.enemy[2]; // Берем третий объект - радар ПВО
    if (Math.random() < 0.03 && myDrones.length > 0) {
        let targetsInRadius = myDrones.filter(d => Math.hypot(d.x - enemyPvo.x, d.y - enemyPvo.y) < enemyPvoRadius);
        if (targetsInRadius.length > 0) {
            let target = targetsInRadius[0]; // Стреляем в первую цель в массиве
            tracers.push({startX: enemyPvo.x, startY: enemyPvo.y, endX: target.x, endY: target.y, alpha: 1, color: "239, 68, 68"});
            explosions.push({x: target.x, y: target.y, radius: 2, maxRadius: 18, color: "rgba(239, 68, 68, "});
            
            target.hp -= 15;
            if (target.hp <= 0) {
                myDrones.splice(myDrones.indexOf(target), 1);
                enemyMoney += 60;
                logEl.innerText = `❌ Вражеское авто-ПВО сбило наш ${target.name}.`;
            }
        }
    }
}

// Автоматическое ПВО Игрока (Исправлено)
function playerAutoPvoProcessing() {
    let playerPvo = militaryObjects.player[2]; // Берем наш радар ПВО
    if (Math.random() < 0.04 && enemyDrones.length > 0) {
        let targetsInRadius = enemyDrones.filter(d => Math.hypot(d.x - playerPvo.x, d.y - playerPvo.y) < playerPvoRadius);
        if (targetsInRadius.length > 0) {
            let target = targetsInRadius[0]; // Выбираем конкретный дрон
            tracers.push({startX: playerPvo.x, startY: playerPvo.y, endX: target.x, endY: target.y, alpha: 1, color: "34, 197, 94"});
            explosions.push({x: target.x, y: target.y, radius: 2, maxRadius: 18, color: "rgba(34, 197, 94, "});
            
            target.hp -= 18;
            if (target.hp <= 0) {
                enemyDrones.splice(enemyDrones.indexOf(target), 1);
                money += 80;
                logEl.innerText = `🛡️ Авто-ПВО успешно уничтожило ${target.name}! +$80`;
            }
        }
    }
}

function gameLoop() {
    ctx.fillStyle = '#0b0d12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let frontLineX = (territoryControl / 100) * canvas.width;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.04)'; ctx.fillRect(0, 0, frontLineX, canvas.height);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.04)'; ctx.fillRect(frontLineX, 0, canvas.width - frontLineX, canvas.height);

    ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(frontLineX, 0); ctx.lineTo(frontLineX, canvas.height); ctx.stroke();

    drawMilitaryObjects();

    money += 0.08;
    moneyEl.innerText = Math.floor(money);
    enemyMoneyEl.innerText = Math.floor(enemyMoney);
    baseHpEl.innerText = baseHp;
    controlPctEl.innerText = Math.floor(territoryControl);

    enemyAIProcessing();
    playerAutoPvoProcessing();

    myDrones.forEach((drone, index) => {
        drone.update(); drone.draw();
        if (drone.x >= 820) {
            if (drone.type === 'kamikaze') { territoryControl += (drone.model==='fp1'? 3 : 6); } else { territoryControl += 2.5; money += 180; }
            myDrones.splice(index, 1);
            logEl.innerText = `🎯 Наш ${drone.name} прорвался на базу врага!`;
        }
    });

    enemyDrones.forEach((drone, index) => {
        drone.update(); drone.draw();
        if (drone.x <= 80) {
if (drone.type === 'kamikaze') { baseHp -= (drone.model==='fp1'? 6 : 14); territoryControl -= 4; } else { territoryControl -= 2; }enemyDrones.splice(index, 1);logEl.innerText = 🚨 Прорыв! Вражеский ${drone.name} нанес удар по штабу!;}});tracers.forEach((t, index) => {ctx.strokeStyle = rgba(${t.color}, ${t.alpha});ctx.lineWidth = 2;ctx.beginPath(); ctx.moveTo(t.startX, t.startY); ctx.lineTo(t.endX, t.endY); ctx.stroke();t.alpha -= 0.06;if (t.alpha <= 0) tracers.splice(index, 1);});explosions.forEach((exp, index) => {ctx.strokeStyle = exp.color + (1 - exp.radius/exp.maxRadius) + ')';ctx.lineWidth = 2;ctx.beginPath(); ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2); ctx.stroke();exp.radius += 2;if (exp.radius >= exp.maxRadius) explosions.splice(index, 1);});if (baseHp <= 0 || territoryControl <= 0) { alert("Ваш штаб уничтожен. Поражение."); resetGame(); }else if (territoryControl >= 100) { alert("Линия фронта полностью сдвинута. Полная Победа!"); resetGame(); }else { requestAnimationFrame(gameLoop); }}function drawMilitaryObjects() {['player', 'enemy'].forEach(team => {militaryObjects[team].forEach(obj => {ctx.fillStyle = obj.color;ctx.fillRect(obj.x - obj.size/2, obj.y - obj.size/2, obj.size, obj.size);ctx.fillStyle = '#475569';ctx.font = "9px sans-serif";ctx.fillText(obj.name, obj.x - obj.size, obj.y + obj.size + 12);});});}function resetGame() {money = 800; enemyMoney = 800; baseHp = 100; territoryControl = 50; playerPvoDmg = 40; playerPvoRadius = 350;myDrones = []; enemyDrones = []; explosions = []; tracers = [];gameLoop();}gameLoop();
