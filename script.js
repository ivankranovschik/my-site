const TOTAL_FLOORS = 16;
const FLOOR_HEIGHT = 40;

let currentFloor = 1;
let isMoving = false;
let isDoorsOpen = false;
let activeJob = null; 
let score = 0;

// Статусы поломок
let isBroken = false;
let errorCode = "НЕТ"; 
let isCalibrated = true; 

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
    // Если лифт уже занят заявкой или сломан, новую заявку не создаем
    if (activeJob || isBroken) return; 

    const startFloor = Math.floor(Math.random() * TOTAL_FLOORS) + 1;
    let targetFloor = Math.floor(Math.random() * TOTAL_FLOORS) + 1;
    while (targetFloor === startFloor) {
        targetFloor = Math.floor(Math.random() * TOTAL_FLOORS) + 1;
    }

    activeJob = { start: startFloor, target: targetFloor, stage: 'pickup' };
    logMessage(`НОВАЯ ЗАЯВКА: Вызов на ${startFloor} этаж. Пассажиру нужно на ${targetFloor} этаж.`, 'alert');
    passengerStatus.innerText = `Ждет на ${startFloor} эт.`;
    
    executeJob();
}

// Выполнение заявки (Движение)
async function executeJob() {
    if (!activeJob || isBroken) return;

    isMoving = true;
    let destination = activeJob.stage === 'pickup' ? activeJob.start : activeJob.target;

    if (activeJob.stage === 'delivery') {
        passengerStatus.innerText = `В кабине (на ${destination} эт.)`;
    }

    // Включаем стрелки направления
    if (destination > currentFloor) { arrowUp.classList.add('active'); statusText.innerText = "ПОДЪЕМ"; } 
    else if (destination < currentFloor) { arrowDown.classList.add('active'); statusText.innerText = "СПУСК"; }

    // Движение по этажам
    while (currentFloor !== destination && !isBroken) {
        if (currentFloor < destination) currentFloor++;
        else currentFloor--;

        elevator.style.bottom = `${(currentFloor - 1) * FLOOR_HEIGHT}px`;
        display.innerText = formatFloor(currentFloor);

        // Время проезда одного этажа — 1 секунда
        await new Promise(r => setTimeout(r, 1000));
    }

    // Если во время движения лифт сломался, прерываем выполнение этой функции
    if (isBroken) return; 

    // Прибытие без поломок
    arrowUp.classList.remove('active');
    arrowDown.classList.remove('active');

    if (activeJob.stage === 'pickup') {
        await openDoors();
        logMessage(`Лифт прибыл на ${currentFloor} этаж. Пассажир вошел в кабину.`, 'system');
        await new Promise(r => setTimeout(r, 2000));
        await closeDoors();
        
        activeJob.stage = 'delivery';
        executeJob(); 
    } else {
        await openDoors();
        logMessage(`Пассажир успешно доставлен на ${currentFloor} этаж! Заявка выполнена.`, 'success');
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

// ХУЛИГАНСКИЙ ТАЙМЕР ПОЛОМОК (Ломает лифт гарантированно, если он в движении)
setInterval(() => {
    // Лифт ломается только если он едет прямо сейчас и еще не сломан
    if (isMoving && !isBroken && activeJob) {
        triggerBreakdown();
    }
}, 14000); // Проверка на поломку каждые 14 секунд хода

// Функция генерации аварии
function triggerBreakdown() {
    isBroken = true;
    isMoving = false;
    arrowUp.classList.remove('active');
    arrowDown.classList.remove('active');
    
    elevator.classList.add('broken');
    display.classList.add('err-mode');

    // Выбираем тип неисправности
    const errors = [
        { code: "F4", text: "ОШИБКА F4: Сбой позиционирования (Потеряны датчики шахты).", action: 'reboot' },
        { code: "E2", text: "ОШИБКА E2: Заклинивание привода дверей на этаже.", action: 'repair' }
    ];
    const chosen = errors[Math.floor(Math.random() * errors.length)];
    
    errorCode = chosen.code;
    errDisplay.innerText = errorCode;
    errDisplay.className = "text-error";
    statusText.innerText = "АВАРИЯ";

    if (activeJob.stage === 'delivery') {
        logMessage(`🚨 КРИТИЧЕСКАЯ ПОЛОМКА! ${chosen.text} Пассажир ЗАСТРЯЛ в кабине на ${currentFloor} этаже!`, 'danger');
        passengerStatus.innerText = "ЗАСТРЯЛ В ЛИФТЕ!";
    } else {
        logMessage(`⚠️ ТЕХНИЧЕСКИЙ СБОЙ: ${chosen.text} Лифт застрял на пути к пассажиру.`, 'danger');
        passengerStatus.innerText = "Ждет (Лифт застрял)";
    }

    // Подсвечиваем нужные кнопки инструментов
    if (chosen.action === 'reboot') {
        isCalibrated = false; 
    } else if (chosen.action === 'repair') {
        btnRepair.disabled = false;
    }
}

// Инструмент: Перезагрузка автомата (Сброс питания)
btnReboot.addEventListener('click', async () => {
    logMessage("Выключение автомата питания... Станция ШУЛК обесточена.", 'system');
    display.innerText = "--";
    errDisplay.innerText = "ВЫКЛ";
    statusText.innerText = "ОБЕСТОЧЕНО";
    btnReboot.disabled = true;
    
    await new Promise(r => setTimeout(r, 2000));
    
    logMessage("Питание подано. Запуск операционной системы лифта...", 'system');
    display.innerText = "88";
    await new Promise(r => setTimeout(r, 1000));
    btnReboot.disabled = false;

    if (errorCode === "F4") {
        errorCode = "НЕТ";
        errDisplay.innerText = "НЕТ";
        errDisplay.className = "text-ok";
        logMessage("Процессор перезапущен. Ошибка F4 сброшена. Требуется калибровка шахты!", 'alert');
        btnCalibrate.disabled = false; // Включаем кнопку калибровки
    } else {
        display.innerText = formatFloor(currentFloor);
        errDisplay.innerText = errorCode;
        statusText.innerText = "АВАРИЯ";
        logMessage(`Перезагрузка платы не помогла. Ошибка железа ${errorCode} всё еще активна! Нужен ремонт.`, 'danger');
    }
});

// Инструмент: Точная Калибровка (Поиск датчика первого этажа)
btnCalibrate.addEventListener('click', async () => {
    btnCalibrate.disabled = true;
    logMessage("Запущена калибровка: лифт на малой скорости идет вниз до концевого выключателя...", 'system');
    statusText.innerText = "КАЛИБРОВКА";

    // Лифт медленно ползет на 1 этаж
    while(currentFloor > 1) {
        currentFloor--;
        elevator.style.bottom = `${(currentFloor - 1) * FLOOR_HEIGHT}px`;
        display.innerText = formatFloor(currentFloor);
        await new Promise(r => setTimeout(r, 600));
    }

    isCalibrated = true;
    isBroken = false;
    elevator.classList.remove('broken');
    display.classList.remove('err-mode');
    statusText.innerText = "СТЕНДБАЙ";
    logMessage("Лифт успешно дошел до датчика 1-го этажа, координаты восстановлены!", 'success');

    // Возвращаемся к работе
    if (activeJob) {
        logMessage("Возобновление прерванной заявки диспетчера...", 'system');
        executeJob();
    }
});

// Инструмент: Механический ремонт дверей
btnRepair.addEventListener('click', async () => {
    btnRepair.disabled = true;
    logMessage("Лифтер открыл двери вручную ключом и меняет сгоревший предохранитель привода...", 'system');
    statusText.innerText = "РЕМОНТ";

    await new Promise(r => setTimeout(r, 3000));

    errorCode = "НЕТ";
    errDisplay.innerText = "НЕТ";
    errDisplay.className = "text-ok";
    isBroken = false;
    elevator.classList.remove('broken');
    display.classList.remove('err-mode');
    statusText.innerText = "СТЕНДБАЙ";
    logMessage("Привод дверей успешно заменен. Работа восстановлена.", 'success');

    if (activeJob) {
        executeJob();
    }
});

// Функции анимации дверей
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

// Запуск бесконечного спавна заявок диспетчера каждые 9 секунд
setInterval(generateRandomJob, 9000);
// Самая первая заявка через 2 секунды после старта страницы
setTimeout(generateRandomJob, 2000);
