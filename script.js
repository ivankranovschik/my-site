// --- ОБРАБОТКА СТРАНИЦЫ ВХОДА (index.html) ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        // Подгружаем кастомные настройки главного админа, если они менялись
        const adminData = JSON.parse(localStorage.getItem('adminProfile')) || { username: 'Kranovschik', password: '12345' };

        if (usernameInput === adminData.username && passwordInput === adminData.password) {
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

// --- УПРАВЛЕНИЕ ПРОФИЛЕМ НА ГЛАВНОЙ (main.html) ---
const profileMenuBtn = document.getElementById('profileMenuBtn');
const profileDropdown = document.getElementById('profileDropdown');
const settingsModal = document.getElementById('settingsModal');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');

// Открытие/закрытие выпадающего меню по клику на профиль
if (profileMenuBtn && profileDropdown) {
    profileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        profileDropdown.classList.toggle('active');
    });
    document.addEventListener('click', () => profileDropdown.classList.remove('active'));
}

// Открытие модалки настроек
if (openSettingsBtn && settingsModal) {
    openSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
        // Заполняем поля текущими данными админа
        const adminData = JSON.parse(localStorage.getItem('adminProfile')) || { username: 'Kranovschik', password: '12345' };
        document.getElementById('editUsername').value = adminData.username;
        document.getElementById('editPassword').value = adminData.password;
    });
}

// Закрытие модалки настроек
if (closeSettingsBtn && settingsModal) {
    closeSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('active'));
}

// Загрузка фото (перевод картинки в Base64 для localStorage)
const avatarInput = document.getElementById('avatarInput');
let savedAvatarBase64 = localStorage.getItem('adminAvatar') || "";

if (avatarInput) {
    avatarInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                savedAvatarBase64 = e.target.result;
                document.getElementById('modalAvatarPreview').style.backgroundImage = `url(${savedAvatarBase64})`;
                document.getElementById('modalAvatarPreview').textContent = "";
            };
            reader.readAsDataURL(file);
        }
    });
}

// Сохранение настроек формы
const profileSettingsForm = document.getElementById('profileSettingsForm');
if (profileSettingsForm) {
    profileSettingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newName = document.getElementById('editUsername').value.trim();
        const newPass = document.getElementById('editPassword').value;
        const statusMsg = document.getElementById('settingsStatusMsg');

        // Сохраняем имя и пароль
        localStorage.setItem('adminProfile', JSON.stringify({ username: newName, password: newPass }));
        
        // Сохраняем аватарку, если она была загружена
        if (savedAvatarBase64) {
            localStorage.setItem('adminAvatar', savedAvatarBase64);
        }

        statusMsg.style.color = '#2f9e44';
        statusMsg.textContent = 'Данные успешно обновлены!';
        
        // Обновляем шапку профиля на лету
        updateHeaderProfile();

        setTimeout(() => {
            settingsModal.classList.remove('active');
        }, 1000);
    });
}

// Функция обновления данных профиля в шапке
function updateHeaderProfile() {
    const headerUsername = document.getElementById('headerUsername');
    const headerAvatar = document.getElementById('headerAvatar');
    const modalAvatarPreview = document.getElementById('modalAvatarPreview');

    if (!headerUsername) return;

    const adminData = JSON.parse(localStorage.getItem('adminProfile')) || { username: 'Kranovschik', password: '12345' };
    const adminAvatar = localStorage.getItem('adminAvatar');

    headerUsername.textContent = adminData.username;

    if (adminAvatar) {
        headerAvatar.style.backgroundImage = `url(${adminAvatar})`;
        headerAvatar.textContent = "";
        if (modalAvatarPreview) {
            modalAvatarPreview.style.backgroundImage = `url(${adminAvatar})`;
            modalAvatarPreview.textContent = "";
        }
    } else {
        headerAvatar.textContent = adminData.username.charAt(0).toUpperCase();
        headerAvatar.style.backgroundImage = "none";
    }
}

// Инициализация данных при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateHeaderProfile();
    if (typeof renderWorkers === 'function') renderWorkers();
});

// --- ЛОГИКА СТРАНИЦЫ МОДЕРАЦИИ (moderation.html) ---
const addWorkerForm = document.getElementById('addWorkerForm');
const modSystemMessage = document.getElementById('modSystemMessage');
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

if (typeof window !== 'undefined') {
    window.deleteWorker = function(index) {
        let customWorkers = JSON.parse(localStorage.getItem('constructionWorkers')) || [];
        customWorkers.splice(index, 1); 
        localStorage.setItem('constructionWorkers', JSON.stringify(customWorkers)); 
        renderWorkers(); 
    };
}

if (addWorkerForm) {
    addWorkerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const newUsername = document.getElementById('newUsername').value.trim();
        const newPassword = document.getElementById('newPassword').value;
        const adminData = JSON.parse(localStorage.getItem('adminProfile')) || { username: 'kranovschik' };

        if (newUsername.toLowerCase() === adminData.username.toLowerCase()) {
            modSystemMessage.style.color = '#e53e3e';
            modSystemMessage.textContent = 'Ошибка: Данный логин админа зарезервирован!';
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
