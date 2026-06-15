// Данные для входа
const ADMIN_USER = "Админ";
const ADMIN_PASS = "12345";

// Заглушка для расписания (пока просто статичная, потом сделаем изменение)
const defaultSchedule = {
    "Понедельник": ["Математика", "Русский язык", "Литература"],
    "Вторник": ["История", "Физика", "Математика"],
    "Среда": ["Русский язык", "Литература", "Физкультура"]
};

// Массив для хранения оценок (загружается из памяти браузера или создается пустым)
let grades = JSON.parse(localStorage.getItem('diary_grades')) || [];

// Проверка входа при загрузке страницы
window.onload = function() {
    renderSchedule();
    renderGrades();
};

// Функция логина
function handleLogin() {
    const userInp = document.getElementById('username').value;
    const passInp = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

    if (userInp === ADMIN_USER && passInp === ADMIN_PASS) {
        errorMsg.textContent = "";
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-screen').classList.remove('hidden');
        document.getElementById('user-display').textContent = ADMIN_USER;
    } else {
        errorMsg.textContent = "Неверное имя пользователя или пароль!";
    }
}

// Функция выхода
function handleLogout() {
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

// Переключение вкладок (Расписание / Оценки)
function switchTab(tabName) {
    document.getElementById('tab-schedule').classList.add('hidden');
    document.getElementById('tab-grades').classList.add('hidden');
    document.getElementById('tab-schedule-btn').classList.remove('active');
    document.getElementById('tab-grades-btn').classList.remove('active');

    if (tabName === 'schedule') {
        document.getElementById('tab-schedule').classList.remove('hidden');
        document.getElementById('tab-schedule-btn').classList.add('active');
    } else if (tabName === 'grades') {
        document.getElementById('tab-grades').classList.remove('hidden');
        document.getElementById('tab-grades-btn').classList.add('active');
    }
}

// Отображение расписания
function renderSchedule() {
    const container = document.getElementById('schedule-container');
    container.innerHTML = "";

    for (const day in defaultSchedule) {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        
        let lessonsList = defaultSchedule[day].map(lesson => `<li>${lesson}</li>`).join('');
        
        dayCard.innerHTML = `
            <h4>${day}</h4>
            <ol>${lessonsList}</ol>
        `;
        container.appendChild(dayCard);
    }
}

// Добавление оценки
function addGrade() {
    const subject = document.getElementById('subject-select').value;
    const grade = document.getElementById('grade-select').value;
    const date = new Date().toLocaleDateString('ru-RU');

    const newGrade = { subject, grade, date };
    grades.push(newGrade);
    
    // Сохраняем в память браузера
    localStorage.setItem('diary_grades', JSON.stringify(grades));
    
    renderGrades();
}

// Отображение списка оценок
function renderGrades() {
    const list = document.getElementById('grades-list');
    list.innerHTML = "";

    grades.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${item.subject}</strong> — Оценка: ${item.grade}</span>
            <small style="color: #888;">${item.date}</small>
        `;
        list.appendChild(li);
    });
}
