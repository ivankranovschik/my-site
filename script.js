const TOTAL_FLOORS = 16;
const FLOOR_HEIGHT = 40; // совпадает с CSS

let currentFloor = 1;
let isMoving = false;
let isDoorsOpen = false;
let queue = [];

const elevator = document.getElementById('elevator');
const display = document.getElementById('display');
const buttonsGrid = document.getElementById('buttonsGrid');

// Генерируем кнопки 1-16 (снизу вверх, как на панели ЩЛЗ)
for (let i = TOTAL_FLOORS; i >= 1; i--) {
    const btn = document.createElement('button');
    btn.classList.add('btn');
    btn.innerText = i;
    btn.id = `floor-${i}`;
    btn.addEventListener('click', () => requestFloor(i));
    buttonsGrid.appendChild(btn);
}

// Обработка нажатия на этаж
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

// Запуск движения по очереди
async function processQueue() {
    if (queue.length === 0) return;
    
    isMoving = true;
    const targetFloor = queue[0]; // Берем первый в очереди (простая логика)
    
    // Закрываем двери перед ходом, если открыты
    if (isDoorsOpen) {
        await closeDoors();
    }

    // Имитация движения по этажам
    while (currentFloor !== targetFloor) {
        if (currentFloor < targetFloor) {
            currentFloor++;
        } else {
            currentFloor--;
        }
        
        // Перемещаем визуально кабину
        elevator.style.bottom = `${(currentFloor - 1) * FLOOR_HEIGHT}px`;
        display.innerText = currentFloor;
        
        // Время проезда одного этажа — 1 секунда
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Приехали на нужный этаж
    queue.shift(); // Удаляем из очереди
    document.getElementById(`floor-${targetFloor}`).classList.remove('active');
    
    await openDoors();
    // Ждем пассажиров 3 секунды
    await new Promise(resolve => setTimeout(resolve, 3000));
    await closeDoors();

    isMoving = false;
    processQueue(); // Проверяем следующие вызовы
}

// Анимация дверей
function openDoors() {
    return new Promise(resolve => {
        isDoorsOpen = true;
        elevator.classList.add('doors-open');
        setTimeout(resolve, 1500); // время анимации в CSS
    });
}

function closeDoors() {
    return new Promise(resolve => {
        elevator.classList.remove('doors-open');
        setTimeout(() => {
            isDoorsOpen = false;
            resolve();
        }, 1500);
    });
}

// Кнопки принудительного управления дверями
document.getElementById('btn-open').addEventListener('click', () => {
    if (!isMoving && !isDoorsOpen) openDoors();
});
document.getElementById('btn-close').addEventListener('click', () => {
    if (isDoorsOpen) closeDoors();
});
document.getElementById('btn-alarm').addEventListener('click', () => {
    alert('🔔 Диспетчер: "Лифт ЩЛЗ 2011 года слушает! Что у вас случилось?"');
});
