const TOTAL_FLOORS = 16;
const FLOOR_HEIGHT = 40;

let currentFloor = 1;
let isMoving = false;
let isDoorsOpen = false;
let activeJob = null; // Текущая активная заявка
let score = 0;

// Статусы поломок
let isBroken = false;
let errorCode = "НЕТ"; // Могут быть: F1 (Перегруз привода), F4 (Сбой датчиков), E2 (Заклинило двери)
let isCalibrated = true; // Требуется ли калибровка после сброса питания

// DOM Элементы
const elevator = document.getElementById('elevator');
const display = document.getElementById('display');
const statusText = document.getElementById('status-text');
const arrowUp = document.getElementById('arrow-up');
const arrowDown = document.getElementById('arrow-down');
const errDisplay = document.getElementById('error-code');
const passengerStatus = document.getElementById('passenger-status');
const jobLog = document.getElementById('job-log');
const scoreCount = document.getElementById('score-count');

// Кнопки управления
const btnReboot = document.getElementById('btn-reboot');
const btnCalibrate = document.getElementById('btn-calibrate');
const btnRepair = document.getElementById('btn-repair');

// Инициализация шахты
const floorLines = document.getElementById('floorLines');
for(let i=0; i<TOTAL_FLOORS; i++) {
    const line = document.createElement('div');
    line.classList.add('floor-line');
    floorLines.appendChild(line);
}

const formatFloor = (num) => String(num).padStart(2, '0');

// Логирование событий в пульт
function logMessage(text, type = 'system') {
    const entry = document.createElement('div');
    entry.classList.add('log-entry', type);
    const time = new Date().toLocaleTimeString();
    entry.innerText = `[${time}] ${text}`;
    jobLog.appendChild(entry);
    jobLog.scrollTop = jobLog.scrollHeight;
}

// Генератор случайных заявок
function generateRandomJob() {
    if (activeJob || isBroken) return; // Не спамим, если лифт занят или сломан

    const startFloor = Math.floor(Math.random() * TOTAL_FLOORS) + 1;
    let targetFloor = Math.floor(Math.random() * TOTAL_FLOORS) + 1;
    while (targetFloor === startFloor) {
        targetFloor = Math.floor(Math.random() * TOTAL_FLOORS) + 1;
    }

    activeJob = { start: startFloor, target: targetFloor, stage: 'pickup' };
    logMessage(`НОВАЯ ЗАЯВКА: Вызов на ${startFloor} этаж. Пассажиру нужно на ${targetFloor} этаж.`, 'alert');
    passengerStatus.innerText = `Ждет на ${startFloor} эт.`;
    
    // Запуск лифта к пассажиру
    executeJob();
}

// Выполнение заявки
async function executeJob() {
    if (!activeJob || isBroken) return;

    isMoving = true;
    let destination = activeJob.stage === 'pickup' ? activeJob.start : activeJob.target;

    if (activeJob.stage === 'delivery') {
        passengerStatus.innerText = `В кабине (едет на ${destination})`;
    }

    // Включаем стрелки направления
    if (destination > currentFloor) { arrowUp.classList.add('active'); statusText.innerText = "ПОДЪЕМ"; } 
    else if (destination < currentFloor) { arrowDown.classList.add('active'); statusText.innerText = "СПУСК"; }

    // Движение по этажам
    while (currentFloor !== destination && !isBroken) {
        // Рандомный шанс поломки во время движения (15%)
        if (Math.random() < 0.15 && currentFloor !== destination) {
            triggerBreakdown();
            break;
        }

        if (currentFloor < destination) currentFloor++;
        else currentFloor--;

        elevator.style.bottom = `${(currentFloor - 1) * FLOOR_HEIGHT}px`;
        display.innerText = formatFloor(currentFloor);

        await new Promise(r => setTimeout(r, 1000));
    }

    if (isBroken) return; // Если сломался в пути — выходим из цикла движения

    // Прибытие в точку
    arrowUp.classList.remove('active');
    arrowDown.classList.remove('active');

    if (activeJob.stage === 'pickup') {
        // Забрали человека
        await openDoors();
        logMessage(`Лифт прибыл на ${currentFloor} этаж. Пассажир вошел в кабину.`, 'system');
        await new Promise(r => setTimeout(r, 2000));
        await closeDoors();
        
        activeJob.stage = 'delivery';
        executeJob(); // Едем дальше на целевой этаж
    } else {
        // Доставили человека
        await openDoors();
        logMessage(`Пассажир успешно доставлен на ${currentFloor} этаж! Заявка закрыта.`, 'success');
        await new Promise(r => setTimeout(r, 2000));
        await closeDoors();

        activeJob = null;
        isMoving = false;
        passengerStatus.innerText = "НЕТ";
        statusText.innerText = "СТЕНДБАЙ";
        score++;
        scoreCount.innerText = score;
    }
}

// Система Поломок
function triggerBreakdown() {
    isBroken = true;
    isMoving = false;
    arrowUp.classList.remove('active');
    arrowDown.classList.remove('active');
    
    elevator.classList.add('broken');
    display.classList.add('err-mode');

    // Рандомим тип ошибки
    const errors = [
        { code: "F4", text: "ОШИБКА F4: Сбой позиционирования (Потеряны датчики шахты).", action: 'reboot' },
        { code: "E2", text: "ОШИБКА E2: Заклинивание привода дверей на этаже.", action: 'repair' }
    ];
    const chosen = errors[Math.floor(Math.random() * errors.length)];
    
    errorCode = chosen.code;
    errDisplay.innerText = errorCode;
    errDisplay.className = "text-error";
    statusText.innerText = "АВАРИЯ";

    let passengerText = activeJob.stage === 'delivery' ? "ЗАСТРЯЛ В КАБИНЕ!" : "Ждет на этаже";
    if (activeJob.stage === 'delivery') {
        logMessage(`🚨 КРИТИЧЕСКАЯ ПОЛОМКА! ${chosen.text} Пассажир ЗАСТРЯЛ между этажами!`, 'danger');
    } else {
        logMessage(`⚠️ ТЕХНИЧЕСКИЙ СБОЙ: ${chosen.text} Лифт остановился в аварийном режиме.`, 'danger');
    }

    // Активируем нужные инструменты для починки
    if (chosen.action === 'reboot') {
        isCalibrated = false; // потребуется калибровка после перезагрузки
    } else if (chosen.action === 'repair') {
        btnRepair.disabled = false;
    }
}

// Действие: Перезагрузка автомата (Сброс питания)
btnReboot.addEventListener('click', async () => {
    logMessage("Выключение автомата питания... Станция ШУЛК обесточена.", 'system');
    display.innerText = "--";
    errDisplay.innerText = "ВЫКЛ";
    statusText.innerText = "ОБЕСТОЧЕНО";
    
    await new Promise(r => setTimeout(r, 2000));
    
    logMessage("Питание подано. Запуск ОС лифта...", 'system');
    display.innerText = "88";
    await new Promise(r => setTimeout(r, 1000));

    if (errorCode === "F4") {
        // Успешно сбросили ошибку процессора
        errorCode = "НЕТ";
        errDisplay.innerText = "НЕТ";
        errDisplay.className = "text-ok";
        logMessage("Ошибка F4 очищена. Требуется калибровка датчиков (Поиск точной остановки).", 'alert');
        btnCalibrate.disabled = false;
    } else {
        // Если была механическая поломка дверей (E2), обычный ребут не поможет
        display.innerText = formatFloor(currentFloor);
        errDisplay.innerText = errorCode;
        statusText.innerText = "АВАРИЯ";
        logMessage(`Перезагрузка не помогла. Ошибка ${errorCode} всё еще активна. Требуется ремонт железа!`, 'danger');
    }
});

// Действие: Точная Калибровка (Поиск 1-го этажа)
btnCalibrate.addEventListener('click', async () => {
    btnCalibrate.disabled = false;
    logMessage("Запущен процесс калибровки. Лифт медленно спускается на технический 1-й этаж...", 'system');
    statusText.innerText = "КАЛИБРОВКА";

    // Медленно гоним лифт вниз на первый этаж для сброса датчиков положения
    while(currentFloor > 1) {
        currentFloor--;
        elevator.style.bottom = `${(currentFloor - 1) * FLOOR_HEIGHT}px`;
        display.innerText = formatFloor(currentFloor);
        await new Promise(r => setTimeout(r, 500));
    }

    isCalibrated = true;
    isBroken = false;
    btnCalibrate.disabled = true;
    elevator.classList.remove('broken');
    display.classList.remove('err-mode');
    statusText.innerText = "СТЕНДБАЙ";
    logMessage("Лифт успешно определился в шахте и готов к работе!", 'success');

    // Продолжаем прерванную заявку, если она была
    if (activeJob) {
        logMessage("Возврат к выполнению прерванной заявки...", 'system');
        executeJob();
    }
});

// Действие: Механический ремонт дверей
btnRepair.addEventListener('click', async () => {
    btnRepair.disabled = true;
    logMessage("Лифтер производит замену сгоревшего предохранителя и регулировку ремня привода дверей...", 'system');
    statusText.innerText = "РЕМОНТ";

    await new Promise(r => setTimeout(r, 3000));

    errorCode = "НЕТ";
    errDisplay.innerText = "НЕТ";
    errDisplay.className = "text-ok";
    isBroken = false;
    elevator.classList.remove('broken');
    display.classList.remove('err-mode');
    statusText.innerText = "СТЕНДБАЙ";
    logMessage("Механический узел привода дверей успешно отремонтирован!", 'success');

    if (activeJob) {
        executeJob();
    }
});

// Двери
function openDoors() {
    return new Promise(resolve => {
        isDoorsOpen = true;
        elevator.classList.add('doors-open');
        setTimeout(resolve, 1000);
    });
}
function closeDoors() {
    return new Promise(resolve => {
        elevator.classList.remove('doors-open');
        setTimeout(() => { isDoorsOpen = false; resolve(); }, 1000);
    });
}

// Запуск бесконечного цикла случайных заявок каждые 12 секунд
setInterval(generateRandomJob, 12000);
// Первую заявку генерируем чуть быстрее
setTimeout(generateRandomJob, 3000);
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
