const TOTAL_FLOORS = 16;
const SHAFT_HEIGHT = 496; // Доступный пиксельный путь кабины в шахте (520 - 24 высота кабины)
const ONE_FLOOR_PX = SHAFT_HEIGHT / (TOTAL_FLOORS - 1); // Расстояние между этажами на схеме

// Состояния лифта
let elevatorFloor = 1;      // Где сейчас лифт физически (может быть дробным при движении)
let targetFloor = 1;        // Куда лифт направляется
let isMoving = false;
let isDoorsOpen = false;

// Состояния игрока
let userFloor = 1;          // На каком этаже сейчас стоит человек
let isInsideCar = false;    // Находится ли человек внутри кабины лифта

// DOM элементы
const mainDisplay = document.getElementById('mainDisplay');
const mainArrow = document.getElementById('mainArrow');
const doorsWrapper = document.getElementById('doorsWrapper');
const miniCar = document.getElementById('miniCar');
const floorLabels = document.getElementById('floorLabels');
const btnCallElevator = document.getElementById('btnCallElevator');
const userFloorText = document.getElementById('userFloorText');
const playerStatus = document.getElementById('playerStatus');
const elevatorViewBox = document.getElementById('elevatorViewBox');
const buttonsGrid = document.getElementById('buttonsGrid');

// Генерируем метки этажей на схеме шахты (сверху вниз)
for (let i = TOTAL_FLOORS; i >= 1; i--) {
    const item = document.createElement('div');
    item.classList.add('floor-label-item');
    item.id = `label-floor-${i}`;
    item.innerText = `— ${String(i).padStart(2, '0')} эт.`;
    floorLabels.appendChild(item);
}

// Генерируем сенсорные кнопки внутри кабины (1-16)
for (let i = TOTAL_FLOORS; i >= 1; i--) {
    const btn = document.createElement('button');
    btn.classList.add('btn-floor');
    btn.id = `btn-floor-${i}`;
    btn.innerText = i;
    btn.addEventListener('click', () => pressFloorInside(i));
    buttonsGrid.appendChild(btn);
}

// Обновление подсветки текущего этажа на схеме
function updateShaftLabelsHighlight() {
    const roundedFloor = Math.round(elevatorFloor);
    document.querySelectorAll('.floor-label-item').forEach(el => el.classList.remove('current-at-shaft'));
    const activeLabel = document.getElementById(`label-floor-${roundedFloor}`);
    if (activeLabel) activeLabel.classList.add('current-at-shaft');
}
updateShaftLabelsHighlight();

// Функция изменения статуса и подсказок для игрока
function setStatus(text) {
    playerStatus.innerText = text;
}

// КНОПКА: Вызов лифта снаружи (с этажа, где стоит юзер)
btnCallElevator.addEventListener('click', () => {
    if (isMoving || isDoorsOpen) return;
    
    btnCallElevator.classList.add('active');
    targetFloor = userFloor;
    
    if (Math.round(elevatorFloor) === userFloor) {
        // Лифт уже на нашем этаже
        btnCallElevator.classList.remove('active');
        openDoorsSequence();
    } else {
        setStatus(`Лифт вызван на ${userFloor} этаж. Ожидайте...`);
        startMovement();
    }
});

// НАЖАТИЕ НА КНОПКУ ВНУТРИ КАБИНЫ
function pressFloorInside(floor) {
    if (!isInsideCar || isMoving || isDoorsOpen) return;
    if (floor === Math.round(elevatorFloor)) {
        setStatus("Вы уже находитесь на этом этаже.");
        return;
    }

    // Подсвечиваем нажатую кнопку
    document.getElementById(`btn-floor-${floor}`).classList.add('active');
    targetFloor = floor;
    
    closeDoorsSequence().then(() => {
        setStatus(`Лифт плавно поехал на ${targetFloor} этаж...`);
        startMovement();
    });
}

// СИСТЕМА ПЛАВНОГО ДВИЖЕНИЯ (Таймер высокого разрешения)
function startMovement() {
    isMoving = true;
    btnCallElevator.disabled = true;
    
    // Стрелки направления на табло
    if (targetFloor > elevatorFloor) {
        mainArrow.innerText = "▲";
        mainArrow.className = "arrow-indicator active-up";
    } else {
        mainArrow.innerText = "▼";
        mainArrow.className = "arrow-indicator active-down";
    }

    let speed = 0.04; // Скорость перемещения между этажами за один кадр анимации

    function moveFrame() {
        if (!isMoving) return;

        if (elevatorFloor < targetFloor) {
            elevatorFloor += speed;
            if (elevatorFloor >= targetFloor) {
                elevatorFloor = targetFloor;
                isMoving = false;
            }
        } else if (elevatorFloor > targetFloor) {
            elevatorFloor -= speed;
            if (elevatorFloor <= targetFloor) {
                elevatorFloor = targetFloor;
                isMoving = false;
            }
        }

        // 1. Движение кабины на боковой схеме (в пикселях)
        const bottomPx = (elevatorFloor - 1) * ONE_FLOOR_PX;
        miniCar.style.bottom = `${bottomPx}px`;

        // 2. Обновление табло от 1-го лица
        mainDisplay.innerText = String(Math.round(elevatorFloor)).padStart(2, '0');
        updateShaftLabelsHighlight();

        // Если едем вместе с лифтом, наш этаж меняется параллельно
        if (isInsideCar) {
            userFloor = Math.round(elevatorFloor);
            userFloorText.innerText = String(userFloor).padStart(2, '0');
        }

        if (isMoving) {
            requestAnimationFrame(moveFrame);
        } else {
            // Лифт прибыл на целевой этаж
            onElevatorArrived();
        }
    }

    requestAnimationFrame(moveFrame);
}

// ЛИФТ ПРИБЫЛ
function onElevatorArrived() {
    mainArrow.innerText = "●";
    mainArrow.className = "arrow-indicator";
    btnCallElevator.classList.remove('active');
    
    // Гасим кнопку внутри кабины
    document.getElementById(`btn-floor-${targetFloor}`).classList.remove('active');

    openDoorsSequence().then(() => {
        if (!isInsideCar) {
            setStatus("Лифт прибыл. Двери открыты. Вы автоматически ВОШЛИ в кабину.");
            // Игрок заходит в кабину
            isInsideCar = true;
            document.body.classList.add('inside'); // Для CSS (подсветить панель)
            document.getElementById('doorsWrapper').parentElement.classList.add('inside');
            hallCallBox.style.display = "none"; // Прячем кнопку вызова этажа, так как мы внутри
            
            // Ждем 4 секунды, пока игрок внутри выбирает этаж. Если ничего не нажал — двери закроются.
            setTimeout(() => {
                if (!isMoving && isDoorsOpen) {
                    closeDoorsSequence().then(() => {
                        setStatus("Вы внутри кабины. Выберите этаж на вертикальной панели.");
                    });
                }
            }, 5000);
        } else {
            // Мы приехали на нужный этаж изнутри
            setStatus(`Вы приехали на ${userFloor} этаж! Вы автоматически ВЫШЛИ в холл.`);
            isInsideCar = false;
            document.body.classList.remove('inside');
            document.getElementById('doorsWrapper').parentElement.classList.remove('inside');
            hallCallBox.style.display = "flex"; // Возвращаем кнопку вызова этажа холла
            userFloorText.innerText = String(userFloor).padStart(2, '0');
            
            setTimeout(() => {
                if (!isMoving && isDoorsOpen) closeDoorsSequence();
            }, 3000);
        }
    });
}

// АНИМАЦИИ ДВЕРЕЙ (Возвращают промисы для синхронизации)
function openDoorsSequence() {
    return new Promise(resolve => {
        isDoorsOpen = true;
        doorsWrapper.classList.add('doors-open');
        setTimeout(() => resolve(), 1400); // Время анимации дверей в CSS
    });
}

function closeDoorsSequence() {
    return new Promise(resolve => {
        doorsWrapper.classList.remove('doors-open');
        setTimeout(() => {
            isDoorsOpen = false;
            btnCallElevator.disabled = false;
            resolve();
        }, 1400);
    });
}
