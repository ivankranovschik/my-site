const TOTAL_FLOORS = 16;
const SHAFT_HEIGHT = 480; // 500 высота рельса - 20 высота мини-кабины
const ONE_FLOOR_PX = SHAFT_HEIGHT / (TOTAL_FLOORS - 1);

// Переменные системы
let elevatorFloor = 1;
let targetFloor = 1;
let isMoving = false;
let isDoorsOpen = false;

let userFloor = 1;         // На каком этаже стоит юзер снаружи
let isInsideCabin = false; // Находится ли юзер внутри кабины

// DOM элементы
const hallDisplay = document.getElementById('hallDisplay');
const cabinDisplay = document.getElementById('cabinDisplay');
const cabinStatus = document.getElementById('cabinStatus');
const hallArrow = document.getElementById('hallArrow');
const hallDoors = document.getElementById('hallDoors');
const miniCar = document.getElementById('miniCar');
const floorLabels = document.getElementById('floorLabels');
const btnCall = document.getElementById('btnCall');
const userFloorText = document.getElementById('userFloorText');
const playerStatus = document.getElementById('playerStatus');

const sceneHall = document.getElementById('scene-hall');
const sceneCabin = document.getElementById('scene-cabin');
const buttonsGrid = document.getElementById('buttonsGrid');

// Генерация меток в шахте
for (let i = TOTAL_FLOORS; i >= 1; i--) {
    const item = document.createElement('div');
    item.classList.add('floor-label-item');
    item.id = `label-floor-${i}`;
    item.innerText = `— ${String(i).padStart(2, '0')} эт.`;
    floorLabels.appendChild(item);
}

// Генерация сенсорных кнопок внутри кабины
for (let i = TOTAL_FLOORS; i >= 1; i--) {
    const btn = document.createElement('button');
    btn.classList.add('btn-floor');
    btn.id = `btn-floor-${i}`;
    btn.innerText = i;
    btn.addEventListener('click', () => selectFloorInside(i));
    buttonsGrid.appendChild(btn);
}

function updateIndicators() {
    const displayStr = String(Math.round(elevatorFloor)).padStart(2, '0');
    // Обновляем оба табло одновременно!
    hallDisplay.innerText = displayStr;
    cabinDisplay.innerText = displayStr;

    // Свечение этажа на боковом мониторе шахты
    document.querySelectorAll('.floor-label-item').forEach(el => el.classList.remove('current-at-shaft'));
    const currentLabel = document.getElementById(`label-floor-${Math.round(elevatorFloor)}`);
    if (currentLabel) currentLabel.classList.add('current-at-shaft');
}
updateIndicators();

// НАЖАТИЕ СНАРУЖИ: Вызов лифта
btnCall.addEventListener('click', () => {
    if (isMoving || isDoorsOpen) return;

    btnCall.classList.add('active');
    targetFloor = userFloor;

    if (Math.round(elevatorFloor) === userFloor) {
        btnCall.classList.remove('active');
        openDoors();
    } else {
        playerStatus.innerText = `Лифт вызван на ${userFloor} этаж. Ожидание...`;
        startElevatorLoop();
    }
});

// НАЖАТИЕ ВНУТРИ: Выбор этажа
function selectFloorInside(floor) {
    if (!isInsideCabin || isMoving || isDoorsOpen) return;
    if (floor === Math.round(elevatorFloor)) {
        playerStatus.innerText = "Вы уже на выбранном этаже. Ожидайте автоматического выхода.";
        return;
    }

    document.getElementById(`btn-floor-${floor}`).classList.add('active');
    targetFloor = floor;
    cabinStatus.innerText = "ЗАКРЫТИЕ";

    closeDoors().then(() => {
        playerStatus.innerText = `Лифт едет на ${targetFloor} этаж.`;
        cabinStatus.innerText = "В ПУТИ";
        startElevatorLoop();
    });
}

// ДВИЖЕНИЕ ЛИФТА
function startElevatorLoop() {
    isMoving = true;
    btnCall.disabled = true;

    // Стрелочные индикаторы направления холла
    if (targetFloor > elevatorFloor) {
        hallArrow.innerText = "▲"; hallArrow.className = "arrow up";
    } else {
        hallArrow.innerText = "▼"; hallArrow.className = "arrow down";
    }

    let speed = 0.05; // Скорость хода

    function step() {
        if (!isMoving) return;

        if (elevatorFloor < targetFloor) {
            elevatorFloor += speed;
            if (elevatorFloor >= targetFloor) { elevatorFloor = targetFloor; isMoving = false; }
        } else if (elevatorFloor > targetFloor) {
            elevatorFloor -= speed;
            if (elevatorFloor <= targetFloor) { elevatorFloor = targetFloor; isMoving = false; }
        }

        // Синхронизация мини-кабины на рельсе
        miniCar.style.bottom = `${(elevatorFloor - 1) * ONE_FLOOR_PX}px`;
        updateIndicators();

        if (isInsideCabin) {
            userFloor = Math.round(elevatorFloor);
            userFloorText.innerText = String(userFloor).padStart(2, '0');
        }

        if (isMoving) {
            requestAnimationFrame(step);
        } else {
            arriveAtFloor();
        }
    }
    requestAnimationFrame(step);
}

// ПРИБЫТИЕ ЛИФТА И СМЕНА СЦЕН
function arriveAtFloor() {
    hallArrow.innerText = "●";
    hallArrow.className = "arrow";
    btnCall.classList.remove('active');
    
    // Гасим кнопку на панели приказов
    const floorBtn = document.getElementById(`btn-floor-${targetFloor}`);
    if (floorBtn) floorBtn.classList.remove('active');

    if (!isInsideCabin) {
        // СИТУАЦИЯ: Лифт приехал к нам в холл
        openDoors().then(() => {
            playerStatus.innerText = "Лифт прибыл! Вы зашли в кабину.";
            setTimeout(() => {
                // Переключаем сцену ВНУТРЬ кабины
                isInsideCabin = true;
                sceneHall.classList.remove('active');
                sceneCabin.classList.add('active');
                cabinStatus.innerText = "ВЫБЕРИТЕ ЭТАЖ";
            }, 800);
        });
    } else {
        // СИТУАЦИЯ: Мы приехали на нужный этаж изнутри
        cabinStatus.innerText = "ПРИБЫЛ";
        playerStatus.innerText = `Вы приехали на ${targetFloor} этаж и вышли в холл.`;
        
        setTimeout(() => {
            // Переключаем сцену ОБРАТНО в холл
            isInsideCabin = false;
            sceneCabin.classList.remove('active');
            sceneHall.classList.add('active');
            
            userFloor = Math.round(elevatorFloor);
            userFloorText.innerText = String(userFloor).padStart(2, '0');
            
            // Открываем двери холла на новом этаже
            openDoors().then(() => {
                setTimeout(() => { closeDoors(); }, 3000);
            });
        }, 1000);
    }
}

// АНИМАЦИИ ДВЕРЕЙ
function openDoors() {
    return new Promise(resolve => {
        isDoorsOpen = true;
        hallDoors.classList.add('open');
        setTimeout(() => resolve(), 1200);
    });
}

function closeDoors() {
    return new Promise(resolve => {
        hallDoors.classList.remove('open');
        setTimeout(() => {
            isDoorsOpen = false;
            btnCall.disabled = false;
            resolve();
        }, 1200);
    });
}
