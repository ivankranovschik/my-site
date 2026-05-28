// Функция глобального выхода из аккаунта
window.logoutUser = function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
};

// Функция синхронизации профиля (отображение имени и аватарки в шапке)
function syncUserProfile() {
    const navUsername = document.getElementById('navUsername');
    const navAvatar = document.getElementById('navAvatar');
    
    // Получаем текущего пользователя (по умолчанию Kranovschik)
    let currentUser = localStorage.getItem('currentUser') || 'Kranovschik';
    
    if (navUsername) navUsername.textContent = currentUser;
    
    // Подгружаем сохранённую аватарку
    let savedAvatar = localStorage.getItem('avatar_' + currentUser);
    if (navAvatar) {
        if (savedAvatar) {
            navAvatar.innerHTML = `<img src="${savedAvatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        } else {
            navAvatar.textContent = currentUser.charAt(0).toUpperCase();
        }
    }

    // Заполняем плейсхолдеры на странице профиля
    const newProfileName = document.getElementById('newProfileName');
    if (newProfileName && !newProfileName.value) {
        newProfileName.placeholder = currentUser;
    }
}

// --- ЛОГИКА СТРАНИЦЫ АВТОРИЗАЦИИ (index.html) ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        // Проверяем кастомный пароль для Kranovschik, если его меняли
        let kranovschikPass = localStorage.getItem('pass_Kranovschik') || '12345';
        let customKranovschikName = localStorage.getItem('name_Kranovschik') || 'Kranovschik';

        if ((usernameInput === 'Kranovschik' || usernameInput === customKranovschikName) && passwordInput === kranovschikPass) {
            localStorage.setItem('currentUser', 'Kranovschik');
            errorMessage.style.color = '#2ecc71';
            errorMessage.textContent = 'Успешный вход! Перенаправление...';
            setTimeout(() => { window.location.href = 'main.html'; }, 1000);
            return;
        }

        // Проверка остальных добавленных строителей
        let customWorkers = JSON.parse(localStorage.getItem('constructionWorkers')) || [];
        const foundWorker = customWorkers.find(w => w.username === usernameInput && w.password === passwordInput);

        if (foundWorker) {
            localStorage.setItem('currentUser', usernameInput);
            errorMessage.style.color = '#2ecc71';
            errorMessage.textContent = `Добро пожаловать, ${usernameInput}!`;
            setTimeout(() => { window.location.href = 'main.html'; }, 1000);
        } else {
            errorMessage.style.color = '#e74c3c';
            errorMessage.textContent = 'Неверное имя пользователя или пароль!';
        }
    });
}

// --- ЛОГИКА ОТДЕЛЬНОЙ СТРАНИЦЫ ПРОФИЛЯ (profile.html) ---
const profileSettingsForm = document.getElementById('profileSettingsForm');
if (profileSettingsForm) {
    profileSettingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let currentUser = localStorage.getItem('currentUser') || 'Kranovschik';
        const newName = document.getElementById('newProfileName').value.trim();
        const newPass = document.getElementById('newProfilePass').value;
        const avatarInput = document.getElementById('avatarInput');
        const systemMsg = document.getElementById('profileSystemMessage');

        // 1. Сохранение аватарки (если файл выбран)
        if (avatarInput.files && avatarInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                localStorage.setItem('avatar_' + currentUser, event.target.result);
                syncUserProfile();
            };
            reader.readAsDataURL(avatarInput.files[0]);
        }

        // 2. Изменение имени/пароля для Kranovschik
        if (currentUser === 'Kranovschik') {
            if (newName) localStorage.setItem('name_Kranovschik', newName);
            if (newPass) localStorage.setItem('pass_Kranovschik', newPass);
        } else {
            // Изменение имени/пароля для обычного строителя
            let customWorkers = JSON.parse(localStorage.getItem('constructionWorkers')) || [];
            let workerIndex = customWorkers.findIndex(w => w.username === currentUser);
            if (workerIndex !== -1) {
                if (newName) customWorkers[workerIndex].username = newName;
                if (newPass) customWorkers[workerIndex].password = newPass;
                localStorage.setItem('constructionWorkers', JSON.stringify(customWorkers));
                if (newName) localStorage.setItem('currentUser', newName);
            }
        }

        systemMsg.style.color = '#2f9e44';
        systemMsg.textContent = 'Изменения успешно сохранены!';
        setTimeout(() => { syncUserProfile(); }, 500);
    });
}

// --- ЛОГИКА СТРАНИЦЫ МОДЕРАЦИИ ---
const addWorkerForm = document.getElementById('addWorkerForm');
const dynamicWorkersList = document.getElementById('dynamicWorkersList');

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

if (addWorkerForm) {
    addWorkerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const newUsername = document.getElementById('newUsername').value.trim();
        const newPassword = document.getElementById('newPassword').value;
        const modSystemMessage = document.getElementById('modSystemMessage');

        if (newUsername.toLowerCase() === 'kranovschik') {
            modSystemMessage.style.color = '#e53e3e';
            modSystemMessage.textContent = 'Ошибка: Логин Kranovschik зарезервирован!';
            return;
        }

        let customWorkers = JSON.parse(localStorage.getItem('constructionWorkers')) || [];
        if (customWorkers.some(w => w.username.toLowerCase() === newUsername.toLowerCase())) {
            modSystemMessage.style.color = '#e53e3e';
            modSystemMessage.textContent = 'Пользователь уже существует!';
        } else {
            customWorkers.push({ username: newUsername, password: newPassword });
            localStorage.setItem('constructionWorkers', JSON.stringify(customWorkers));
            modSystemMessage.style.color = '#2f9e44';
            modSystemMessage.textContent = `Строитель успешно добавлен!`;
            addWorkerForm.reset();
            renderWorkers(); 
        }
    });
}

window.deleteWorker = function(index) {
    let customWorkers = JSON.parse(localStorage.getItem('constructionWorkers')) || [];
    customWorkers.splice(index, 1); 
    localStorage.setItem('constructionWorkers', JSON.stringify(customWorkers)); 
    renderWorkers(); 
};

// Запуск синхронизации при загрузке любой страницы
document.addEventListener('DOMContentLoaded', () => {
    syncUserProfile();
    renderWorkers();
});
