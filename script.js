const TOTAL_FLOORS = 16;
const SHAFT_HEIGHT = 442; // Высота рельса 460 - 18 высота мини-кабины
const ONE_FLOOR_PX = SHAFT_HEIGHT / (TOTAL_FLOORS - 1);

let elevatorFloor = 1;
let targetFloor = 1;
let isMoving = false;
let isDoorsOpen = false;

// DOM элементы
const mainDisplay = document.getElementById('mainDisplay');
const mainArrow = document.getElementById('mainArrow');
const statusText = document.getElementById('statusText');
const elevatorDoors = document.getElementById('elevatorDoors');
const miniCar = document.getElementById('miniCar');
const floorLabels = document.getElementById('floorLabels');
const buttonsGrid = document.getElementById('buttonsGrid');

const btnOpen = document.getElementById('btnOpen');
const btnClose = document.getElementById('btnClose');

// 1. Генерация меток шахты (справа)
for (let i = TOTAL_FLOORS; i >= 1; i--) {
    const item = document.createElement('div');
    item.classList.add('floor-label-item');
    item.id = `label-floor-${i}`;
    item.innerText = `— ${String(i).padStart(2, '0')} эт.`;
    floorLabels.appendChild(item);
}

// 2. Генерация сенсорных кнопок панели приказов (по центру)
for (let i = TOTAL_FLOORS; i >= 1; i--) {
    const btn = document.createElement('button');
    btn.classList.add('btn-floor');
    btn.id = `btn-floor-${i}`;
    btn.innerText = i;
    btn.addEventListener('click', () => sendElevatorTo(i));
    buttonsGrid.appendChild(btn);
}

// Обновление экранов телеметрии
function updateUI() {
    const displayStr = String(Math.round(elevatorFloor)).padStart(2, '0');
    mainDisplay.innerText = displayStr;

    // Подсветка текущего этажа на схеме шахты
    document.querySelectorAll('.floor-label-item').forEach(el => el.classList.remove('current-at-shaft'));
    const currentLabel = document.getElementById(`label-floor-${Math.round(elevatorFloor)}`);
    if (currentLabel) currentLabel.classList.add('current-at-shaft');
}
updateUI();

// Функция отправки лифта на выбранный этаж
function sendElevatorTo(floor) {
    if (isMoving) return; // Не прерывать ход, если уже едет
    
    if (floor === Math.round(elevatorFloor)) {
        openDoors(); // Если нажали этаж, на котором стоим — просто открываем двери
        return;
    }

    // Включаем подсветку кнопки
    document.getElementById(`btn-floor-${floor}`).classList.add('active');
    targetFloor = floor;

    // Сначала закрываем двери, если они открыты, затем едем
    closeDoors().then(() => {
        startMovement();
    });
}

// АЛГОРИТМ ПЛАВНОГО ХОДА ЛИФТА
function startMovement() {
    isMoving = true;
    statusText.innerText = "В ДВИЖЕНИИ";

    // Анимация стрелки на медиа-экране
    if (targetFloor > elevatorFloor) {
        mainArrow.innerText = "▲"; mainArrow.className = "arrow up";
    } else {
        mainArrow.innerText = "▼"; mainArrow.className = "arrow down";
    }

    let speed = 0.04; // Плавная скорость

    function animate() {
        if (!isMoving) return;

        if (elevatorFloor < targetFloor) {
            elevatorFloor += speed;
            if (elevatorFloor >= targetFloor) { elevatorFloor = targetFloor; isMoving = false; }
        } else if (elevatorFloor > targetFloor) {
            elevatorFloor -= speed;
            if (elevatorFloor <= targetFloor) { elevatorFloor = targetFloor; isMoving = false; }
        }

        // Двигаем машинку на схеме
        miniCar.style.bottom = `${(elevatorFloor - 1) * ONE_FLOOR_PX}px`;
        updateUI();

        if (isMoving) {
            requestAnimationFrame(animate);
        } else {
            arriveAtDestination();
        }
    }
    requestAnimationFrame(animate);
}

// ПРИБЫТИЕ НА ЭТАЖ
function arriveAtDestination() {
    mainArrow.innerText = "●";
    mainArrow.className = "arrow";
    statusText.innerText = "ПРИБЫЛ";
    
    // Выключаем подсветку кнопки
    const activeBtn = document.getElementById(`btn-floor-${targetFloor}`);
    if (activeBtn) activeBtn.classList.remove('active');

    // Автоматическое открытие дверей по прибытии
    openDoors().then(() => {
        setTimeout(() => {
            if (!isMoving && isDoorsOpen) closeDoors();
        }, 3500); // Двери стоят открытыми 3.5 секунды
    });
}

// УПРАВЛЕНИЕ ДВЕРЬМИ (Возвращают Промисы для синхронизации с ходом)
function openDoors() {
    return new Promise(resolve => {
        if (isMoving) return resolve();
        isDoorsOpen = true;
        statusText.innerText = "ОТКРЫТО";
        elevatorDoors.classList.add('open');
        setTimeout(() => resolve(), 1200);
    });
}

function closeDoors() {
    return new Promise(resolve => {
        isDoorsOpen = false;
        statusText.innerText = "ЗАКРЫТИЕ";
        elevatorDoors.classList.remove('open');
        setTimeout(() => {
            statusText.innerText = "СТЕНДБАЙ";
            resolve();
        }, 1200);
    });
}

// Привязка сервисных кнопок принудительного открытия/закрытия
btnOpen.addEventListener('click', () => { if(!isMoving && !isDoorsOpen) openDoors(); });
btnClose.addEventListener('click', () => { if(isDoorsOpen) closeDoors(); });
