// Глобальная функция выхода из аккаунта
window.logoutUser = function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
};

// Функция переключения видимости меню профиля (открытие/закрытие по клику)
window.toggleProfileMenu = function(event) {
    if (event) event.stopPropagation(); // Блокируем клик, чтобы меню сразу не закрылось
    const menu = document.getElementById('profileDropdownMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
};

// Закрытие меню профиля при клике в любую пустую область экрана
document.addEventListener('click', function(event) {
    const menu = document.getElementById('profileDropdownMenu');
    const profileBlock = document.querySelector('.user-profile-block');
    
    // Если меню открыто и клик произошел вне блока профиля и вне самого меню — закрываем его
    if (menu && menu.classList.contains('active')) {
        if (!profileBlock.contains(event.target) && !menu.contains(event.target)) {
            menu.classList.remove('active');
        }
    }
});

// Функция синхронизации профиля (отображение имени и аватарки на всех страницах)
function syncUserProfile() {
    const navUsername = document.getElementById('navUsername');
    const menuUsername = document.getElementById('menuUsername');
    const navAvatar = document.getElementById('navAvatar');
    const menuAvatar = document.getElementById('menuAvatar');
    
    // Получаем текущего авторизованного пользователя
    let currentUser = localStorage.getItem('currentUser') || 'Kranovschik';
    
    // Выводим никнеймы в шапку и в меню
    if (navUsername) navUsername.textContent = currentUser;
    if (menuUsername) menuUsername.textContent = currentUser;
    
    // Подгружаем аватарку из памяти
    let savedAvatar = localStorage.getItem('avatar_' + currentUser);
    
    // Обновляем мини-аватарку в шапке
    if (navAvatar) {
        if (savedAvatar) {
            navAvatar.innerHTML = `<img src="${savedAvatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        } else {
            navAvatar.textContent = currentUser.charAt(0).toUpperCase();
            navAvatar.innerHTML = currentUser.charAt(0).toUpperCase();
        }
    }
    
    // Обновляем большую аватарку внутри выпадающего меню
    if (menuAvatar) {
        if (savedAvatar) {
            menuAvatar.innerHTML = `<img src="${savedAvatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        } else {
            menuAvatar.textContent = currentUser.charAt(0).toUpperCase();
            menuAvatar.innerHTML = currentUser.charAt(0).toUpperCase();
        }
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

        let kranovschikPass = localStorage.getItem('pass_Kranovschik') || '12345';
        let customKranovschikName = localStorage.getItem('name_Kranovschik') || 'Kranovschik';

        if ((usernameInput === 'Kranovschik' || usernameInput === customKranovschikName) && passwordInput === kranovschikPass) {
            localStorage.setItem('currentUser', 'Kranovschik');
            errorMessage.style.color = '#2ecc71';
            errorMessage.textContent = 'Успешный вход! Перенаправление...';
            setTimeout(() => { window.location.href = 'main.html'; }, 1000);
            return;
        }

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

// --- ОБРАБОТКА ФОРМЫ НАСТРОЕК ПРОФИЛЯ (внутри выпадающего меню) ---
const profileSettingsForm = document.getElementById('profileSettingsForm');
if (profileSettingsForm) {
    profileSettingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let currentUser = localStorage.getItem('currentUser') || 'Kranovschik';
        const newName = document.getElementById('newProfileName').value.trim();
        const newPass = document.getElementById('newProfilePass').value;
        const avatarLinkInput = document.getElementById('avatarLinkInput').value.trim();
        const systemMsg = document.getElementById('profileSystemMessage');

        // 1. Сохранение аватарки по ссылке URL
        if (avatarLinkInput) {
            localStorage.setItem('avatar_' + currentUser, avatarLinkInput);
        }

        // 2. Изменение имени/пароля
        if (currentUser === 'Kranovschik') {
            if (newName) localStorage.setItem('name_Kranovschik', newName);
            if (newPass) localStorage.setItem('pass_Kranovschik', newPass);
        } else {
            let customWorkers = JSON.parse(localStorage.getItem('constructionWorkers')) || [];
            let workerIndex = customWorkers.findIndex(w => w.username === currentUser);
            if (workerIndex !== -1) {
                if (newName) customWorkers[workerIndex].username = newName;
                if (newPass) customWorkers[workerIndex].password = newPass;
                localStorage.setItem('constructionWorkers', JSON.stringify(customWorkers));
                if (newName) localStorage.setItem('currentUser', newName);
            }
        }

        if (systemMsg) {
            systemMsg.style.color = '#2f9e44';
            systemMsg.textContent = 'Изменения успешно сохранены!';
        }
        
        // Сбрасываем текстовые поля и обновляем внешний вид
        profileSettingsForm.reset();
        setTimeout(() => { 
            syncUserProfile(); 
            if(systemMsg) systemMsg.textContent = '';
        }, 1500);
    });
}

// --- ЛОГИКА СТРАНИЦЫ МОДЕРАЦИИ (moderation.html) ---
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

// Автоматический запуск синхронизации при загрузке любой страницы
document.addEventListener('DOMContentLoaded', () => {
    syncUserProfile();
    renderWorkers();
});
