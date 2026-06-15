// Константы авторизации
const ADMIN_USER = "Админ";
const ADMIN_PASS = "12345";

// Начальные данные (если хранилище пустое)
const initialSchedule = {
    "Понедельник": ["Математика", "Русский язык", "Литература"],
    "Вторник": ["История", "Физика", "Информатика"],
    "Среда": ["География", "Английский язык", "Физкультура"],
    "Четверг": ["Математика", "Химия", "Биология"],
    "Пятница": ["Русский язык", "История", "ИЗО"]
};

// Загрузка состояния из localStorage
let schedule = JSON.parse(localStorage.getItem('diary_schedule')) || initialSchedule;
let homework = JSON.parse(localStorage.getItem('diary_homework')) || {};
let grades = JSON.parse(localStorage.getItem('diary_grades')) || [];
let currentTheme = localStorage.getItem('diary_theme') || 'light';
let avatarSeed = localStorage.getItem('diary_avatar') || 'Admin';

let activeDayEditor = ""; 

// Инициализация при старте
window.onload = function() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.getElementById('theme-toggle').textContent = currentTheme === 'light' ? '🌙' : '☀️';
    document.getElementById('user-avatar').src = `https://dicebear.com{avatarSeed}`;
    
    startClock();
    updateSubjectSelects();
    renderSchedule();
    renderGrades();
};

// Часы реального времени
function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('live-clock').textContent = now.toLocaleTimeString('ru-RU');
    }, 1000);
}

// Переключатель темы (Светлая / Темная)
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('diary_theme', currentTheme);
    document.getElementById('theme-toggle').textContent = currentTheme === 'light' ? '🌙' : '☀️';
    showToast("Тема оформления изменена");
}

// Генерация кастомных аватарок по клику
function changeAvatar() {
    avatarSeed = Math.random().toString(36).substring(7);
    localStorage.setItem('diary_avatar', avatarSeed);
    document.getElementById('user-avatar').src = `https://dicebear.com{avatarSeed}`;
    showToast("Аватар обновлен! 🤖");
}

// Функция входа
function handleLogin() {
    const userInp = document.getElementById('username').value;
    const passInp = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

    if (userInp === ADMIN_USER && passInp === ADMIN_PASS) {
        errorMsg.textContent = "";
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-screen').classList.remove('hidden');
        showToast(`Добро пожаловать, ${ADMIN_USER}! 🎉`);
    } else {
        errorMsg.textContent = "Неверное имя пользователя или пароль!";
    }
}

function handleLogout() {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    showToast("Вы вышли из системы");
}

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

// Сбор уникального списка предметов на основе расписания
function getAllSubjects() {
    let subjects = new Set();
    for (let day in schedule) {
        schedule[day].forEach(sub => { if(sub.trim() !== "") subjects.add(sub); });
    }
    return subjects.size > 0 ? Array.from(subjects) : ["Математика", "Русский язык"];
}

function updateSubjectSelects() {
    const select = document.getElementById('subject-select');
    select.innerHTML = "";
    getAllSubjects().forEach(sub => {
        let opt = document.createElement('option');
        opt.value = sub; opt.textContent = sub;
        select.appendChild(opt);
    });
}

// Отображение расписания и интерактивного ДЗ
function renderSchedule() {
    const container = document.getElementById('schedule-container');
    container.innerHTML = "";

    for (const day in schedule) {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        
        let headerRow = `<div class="section-header"><h4>${day}</h4><button onclick="openDayEditor('${day}')" style="width:auto; padding:4px 8px; font-size:12px;">✏️</button></div>`;
        let lessonsHtml = `<div class="lessons-list">`;
        
        if(schedule[day].length === 0) {
            lessonsHtml += `<p style="font-size:14px; color:var(--text-muted)">Нет уроков</p>`;
        }

        schedule[day].forEach((lesson, index) => {
            const hwKey = `${day}-${index}`;
            const hwData = homework[hwKey] || { text: "", done: false };
            
            lessonsHtml += `
                <div class="lesson-row">
                    <span><strong>${index + 1}.</strong> ${lesson}</span>
                    <div class="homework-box">
                        <input type="checkbox" ${hwData.done ? 'checked' : ''} onchange="toggleHomework('${hwKey}', this)">
                        <input type="text" class="homework-text ${hwData.done ? 'done' : ''}" 
                               value="${hwData.text}" placeholder="Задать ДЗ..." 
                               onblur="saveHomework('${hwKey}', this.value)">
                    </div>
                </div>
            `;
        });
        
        lessonsHtml += `</div>`;
        dayCard.innerHTML = headerRow + lessonsHtml;
        container.appendChild(dayCard);
    }
}

// Функции Домашнего Задания
function saveHomework(key, val) {
    if(!homework[key]) homework[key] = { text: "", done: false };
    homework[key].text = val;
    localStorage.setItem('diary_homework', JSON.stringify(homework));
}

function toggleHomework(key, checkbox) {
    if(!homework[key]) homework[key] = { text: "", done: false };
    homework[key].done = checkbox.checked;
    localStorage.setItem('diary_homework', JSON.stringify(homework));
    
    // Перерисуем чтобы зачеркнуть/размаркировать текст
    renderSchedule();
    if(checkbox.checked) showToast("Задание выполнено! Конфетти! 🌟");
}

// РЕДАКТОР РАСПИСАНИЯ (Модальное Окно)
function openDayEditor(day) {
    activeDayEditor = day;
    document.getElementById('editor-day-title').textContent = day;
    const listCont = document.getElementById('modal-lessons-list');
    listCont.innerHTML = "";

    schedule[day].forEach((lesson) => {
        createEditorRow(lesson);
    });

    document.getElementById('editor-modal').classList.remove('hidden');
}

function createEditorRow(value = "") {
    const listCont = document.getElementById('modal-lessons-list');
    const row = document.createElement('div');
    row.className = 'editor-row';
    row.innerHTML = `
        <input type="text" class="editor-input" value="${value}" placeholder="Название предмета">
        <button onclick="this.parentElement.remove()" class="delete-btn" style="padding:5px">❌</button>
    `;
    listCont.appendChild(row);
}

function addLessonInEditor() {
    createEditorRow("");
}

function saveScheduleEditor() {
    const inputs = document.querySelectorAll('.editor-input');
    let newLessons = [];
    inputs.forEach(inp => {
        if(inp.value.trim() !== "") newLessons.push(inp.value.trim());
    });

    schedule[activeDayEditor] = newLessons;
    localStorage.setItem('diary_schedule', JSON.stringify(schedule));
    
    closeScheduleEditor();
    updateSubjectSelects();
    renderSchedule();
    renderGrades(); // Статистика может измениться
    showToast("Расписание сохранено успешно!");
}

function closeScheduleEditor() {
    document.getElementById('editor-modal').classList.add('hidden');
}

// ОЦЕНКИ И АНАЛИТИКА
function addGrade() {
    const subject = document.getElementById('subject-select').value;
    const grade = parseInt(document.getElementById('grade-select').value);
    const date = new Date().toLocaleDateString('ru-RU');

    if(!subject) {
        showToast("Сначала добавьте предметы в расписание!");
        return;
    }

    const newGrade = { id: Date.now(), subject, grade, date };
    grades.push(newGrade);
    
    localStorage.setItem('diary_grades', JSON.stringify(grades));
    
    renderGrades();
    
    if(grade === 5) showToast("Отлично! Так держать! 🎉");
    else if(grade === 2) showToast("Не расстраивайся, в следующий раз получится! 💪");
    else showToast("Оценка сохранена");
}

function deleteGrade(id) {
    grades = grades.filter(g => g.id !== id);
    localStorage.setItem('diary_grades', JSON.stringify(grades));
    renderGrades();
    showToast("Оценка удалена");
}

function renderGrades() {
    // 1. Отрисовка списка
    const list = document.getElementById('grades-list');
    list.innerHTML = "";

    grades.slice().reverse().forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${item.subject}</strong> — <span class="${item.grade >= 4 ? 'badge-good' : 'badge-bad'}">${item.grade}</span></span>
            <div>
                <small style="color: var(--text-muted); margin-right:15px">${item.date}</small>
                <button onclick="deleteGrade(${item.id})" class="delete-btn">❌</button>
            </div>
        `;
        list.appendChild(li);
    });

    // 2. Расчет статистики среднего балла
    const statsCont = document.getElementById('stats-container');
statsCont.innerHTML = "";let subjectTotals = {};grades.forEach(g => {if(!subjectTotals[g.subject]) subjectTotals[g.subject] = { sum: 0, count: 0 };subjectTotals[g.subject].sum += g.grade;subjectTotals[g.subject].count += 1;});const activeSubjects = getAllSubjects();activeSubjects.forEach(sub => {const card = document.createElement('div');card.className = 'stat-card';let avgText = "—";let badgeClass = "";if(subjectTotals[sub]) {let avg = (subjectTotals[sub].sum / subjectTotals[sub].count).toFixed(2);avgText = avg;badgeClass = avg >= 4.0 ? 'badge-good' : (avg < 3.5 ? 'badge-bad' : '');}card.innerHTML = <span>${sub}</span> <span class="${badgeClass}">${avgText}</span>;statsCont.appendChild(card);});}// Функция кастомных тостов (уведомлений)function showToast(message) {const container = document.getElementById('toast-container');const toast = document.createElement('div');toast.className = 'toast';toast.textContent = message;container.appendChild(toast);setTimeout(() => {toast.remove();}, 3000);}
