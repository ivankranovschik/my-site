const TOTAL_FLOORS = 16;
const FLOOR_HEIGHT = 40; 

let currentFloor = 1;
let isMoving = false;
let isDoorsOpen = false;
let queue = [];

const elevator = document.getElementById('elevator');
const display = document.getElementById('display');
const statusText = document.getElementById('status-text');
const arrowUp = document.getElementById('arrow-up');
const arrowDown = document.getElementById('arrow-down');
const buttonsGrid = document.getElementById('buttonsGrid');
const floorLines = document.getElementById('floorLines');

// Рендерим линии этажей в шахте для красоты
for(let i=0; i<TOTAL_FLOORS; i++) {
    const line = document.createElement('div');
    line.classList.add('floor-line');
    floorLines.appendChild(line);
}

// Форматирование вывода этажа (например, 05 вместо 5)
const formatFloor = (num) => String(num).padStart(2, '0');

// Создание кнопок
for (let i = TOTAL_FLOORS; i >= 1; i--) {
    const btn = document.createElement('button');
    btn.classList.add('btn-touch');
    btn.innerText = formatFloor(i);
    btn.id = `floor-${i}`;
    btn.addEventListener('click', () => requestFloor(i));
    buttonsGrid.appendChild(btn);
}

function requestFloor(floor) {
    if (floor === currentFloor && !isMoving && !isDoorsOpen) {
        openDoors();
        return;
    }
    
    if (!queue.includes(floor) && floor !== currentFloor) {
        queue.push(floor);
        document.getElementById(`floor-${floor}`).classList.add('active');
        if (!isMoving) {
            processQueue();
        }
    }
}

async function processQueue() {
    if (queue.length === 0) {
        statusText.innerText = "СТЕНДБАЙ";
        arrowUp.classList.remove('active');
        arrowDown.classList.remove('active');
        return;
    }
    
    isMoving = true;
    const targetFloor = queue[0];
    
    if (isDoorsOpen) {
        await closeDoors();
    }

    // Включаем стрелки направления
    if (targetFloor > currentFloor) {
        arrowUp.classList.add('active');
        arrowDown.classList.remove('active');
        statusText.innerText = "ПОДЪЕМ";
    } else {
        arrowDown.classList.add('active');
        arrowUp.classList.remove('active');
        statusText.innerText = "СПУСК";
    }

    // Движение
    while (currentFloor !== targetFloor) {
        if (currentFloor < targetFloor) {
            currentFloor++;
        } else {
            currentFloor--;
        }
        
        // Время пролета одного этажа уменьшено до 800мс (лифт ведь скоростной!)
        elevator.style.bottom = `${(currentFloor - 1) * FLOOR_HEIGHT}px`;
        display.innerText = formatFloor(currentFloor);
        
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Остановка
    queue.shift();
    document.getElementById(`floor-${targetFloor}`).classList.remove('active');
    arrowUp.classList.remove('active');
    arrowDown.classList.remove('active');
    
    await openDoors();
    await new Promise(resolve => setTimeout(resolve, 2500));
    await closeDoors();

    isMoving = false;
    processQueue();
}

function openDoors() {
    return new Promise(resolve => {
        isDoorsOpen = true;
        statusText.innerText = "ПОСАДКА";
        elevator.classList.add('doors-open');
        setTimeout(resolve, 1200); 
    });
}

function closeDoors() {
    return new Promise(resolve => {
        statusText.innerText = "ЗАКРЫТИЕ";
        elevator.classList.remove('doors-open');
        setTimeout(() => {
            isDoorsOpen = false;
            resolve();
        }, 1200);
    });
}

document.getElementById('btn-open').addEventListener('click', () => {
    if (!isMoving && !isDoorsOpen) openDoors();
});
document.getElementById('btn-close').addEventListener('click', () => {
    if (isDoorsOpen) closeDoors();
});
