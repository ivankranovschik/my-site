// --- ОБРАБОТКА СТРАНИЦЫ ВХОДА (index.html) ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        if (usernameInput === 'Kranovschik' && passwordInput === '12345') {
            errorMessage.style.color = '#2ecc71';
            errorMessage.textContent = 'Успешный вход! Перенаправление...';
            setTimeout(() => { window.location.href = 'main.html'; }, 1000);
            return;
        }

        let customWorkers = JSON.parse(localStorage.getItem('constructionWorkers')) || [];
        const foundWorker = customWorkers.find(w => w.username === usernameInput && w.password === passwordInput);

        if (foundWorker) {
            errorMessage.style.color = '#2ecc71';
            errorMessage.textContent = `Добро пожаловать, ${usernameInput}!`;
            setTimeout(() => { window.location.href = 'main.html'; }, 1000);
        } else {
            errorMessage.style.color = '#e74c3c';
            errorMessage.textContent = 'Неверное имя пользователя или пароль!';
        }
    });
}

// --- ОБРАБОТКА ОТДЕЛЬНОЙ СТРАНИЦЫ МОДЕРАЦИИ (moderation.html) ---
const addWorkerForm = document.getElementById('addWorkerForm');
const modSystemMessage = document.getElementById('modSystemMessage');
const dynamicWorkersList = document.getElementById('dynamicWorkersList');

// Функция отображения списка строителей на экране
function renderWorkers() {
    if (!dynamicWorkersList) return;
    dynamicWorkersList.innerHTML = ''; 

    let customWorkers = JSON.parse(localStorage.getItem('constructionWorkers')) || [];

    customWorkers.forEach((worker, index) => {
        const item = document.createElement('div');
        item.className = 'worker-item';
        item.innerHTML = `
            <div class="worker-info">
                <span class="worker-name">${worker.username}</span>
                <span class="worker-pass">Пароль: ${worker.password}</span>
            </div>
            <button class="delete-worker-btn" onclick="deleteWorker(${index})">Удалить</button>
        `;
        dynamicWorkersList.appendChild(item);
    });
}

// Функция удаления строителя
window.deleteWorker = function(index) {
    let customWorkers = JSON.parse(localStorage.getItem('constructionWorkers')) || [];
    customWorkers.splice(index, 1); 
    localStorage.setItem('constructionWorkers', JSON.stringify(customWorkers)); 
    renderWorkers(); 
};

// Регистрация нового участника
if (addWorkerForm) {
    addWorkerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const newUsername = document.getElementById('newUsername').value.trim();
        const newPassword = document.getElementById('newPassword').value;

        if (newUsername.toLowerCase() === 'kranovschik') {
            modSystemMessage.style.color = '#e53e3e';
            modSystemMessage.textContent = 'Ошибка: Логин Kranovschik зарезервирован!';
            return;
        }

        let customWorkers = JSON.parse(localStorage.getItem('constructionWorkers')) || [];
        const isExist = customWorkers.some(w => w.username.toLowerCase() === newUsername.toLowerCase());

        if (isExist) {
            modSystemMessage.style.color = '#e53e3e';
            modSystemMessage.textContent = 'Пользователь с таким именем уже добавлен!';
        } else {
            customWorkers.push({ username: newUsername, password: newPassword });
            localStorage.setItem('constructionWorkers', JSON.stringify(customWorkers));

            modSystemMessage.style.color = '#2f9e44';
            modSystemMessage.textContent = `Участник ${newUsername} успешно добавлен!`;
            
            addWorkerForm.reset();
            renderWorkers(); 
        }
    });
}

// Запускаем отрисовку списка при открытии страницы модерации
document.addEventListener('DOMContentLoaded', renderWorkers);
