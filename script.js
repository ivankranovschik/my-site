// --- СИСТЕМА ПРОФИЛЯ (РАБОТАЕТ НА ВСЕХ СТРАНИЦАХ) ---
document.addEventListener('DOMContentLoaded', function() {
    // Получаем текущие данные авторизованного юзера
    let activeUser = JSON.parse(sessionStorage.getItem('activeUser')) || {
        username: 'Kranovschik',
        avatarUrl: ''
    };

    // Обновляем шапку на странице данными пользователя
    const headerUsername = document.getElementById('headerUsername');
    const dropdownUsername = document.getElementById('dropdownUsername');
    const headerAvatar = document.getElementById('headerAvatar');

    if (headerUsername) headerUsername.textContent = activeUser.username;
    if (dropdownUsername) dropdownUsername.textContent = activeUser.username;
    if (headerAvatar) {
        if (activeUser.avatarUrl) {
            headerAvatar.style.backgroundImage = `url('${activeUser.avatarUrl}')`;
            headerAvatar.style.backgroundSize = 'cover';
            headerAvatar.style.backgroundPosition = 'center';
            headerAvatar.textContent = '';
        } else {
            headerAvatar.style.backgroundImage = 'none';
            headerAvatar.textContent = activeUser.username.charAt(0).toUpperCase();
        }
    }

    // Открытие/закрытие меню профиля
    const profileToggleBtn = document.getElementById('profileToggleBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileToggleBtn && profileDropdown) {
        profileToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', function() {
            profileDropdown.classList.remove('active');
        });

        profileDropdown.addEventListener('click', function(e) {
            e.stopPropagation(); // Чтобы клики внутри меню не закрывали его
        });
    }

    // Сохранение настроек профиля
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', function() {
            const editUsername = document.getElementById('editUsername').value.trim();
            const editPassword = document.getElementById('editPassword').value;
            const editAvatarUrl = document.getElementById('editAvatarUrl').value.trim();

            if (editUsername) {
                activeUser.username = editUsername;
            }
            if (editAvatarUrl) {
                activeUser.avatarUrl = editAvatarUrl;
            }

            // Имитация смены пароля в основной системе аккаунтов
            if (editPassword) {
                alert('Пароль успешно обновлен!');
            }

            // Сохраняем измененные данные сессии
            sessionStorage.setItem('activeUser', JSON.stringify(activeUser));
            alert('Изменения сохранены!');
            window.location.reload(); // Перезагружаем для применения стилей
        });
    }

    // Загрузка списка строителей на странице модерации
    if (typeof renderWorkers === 'function') {
        renderWorkers();
    }
});

// Глобальная функция выхода из системы
window.logoutUser = function() {
    sessionStorage.removeItem('activeUser');
    window.location.href = 'index.html';
};


// --- ОБРАБОТКА СТРАНИЦЫ ВХОДА (index.html) ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        let isSuccess = false;
        let loggedUser = { username: usernameInput, avatarUrl: '' };

        if (usernameInput === 'Kranovschik' && passwordInput === '12345') {
            isSuccess = true;
        } else {
            let customWorkers = JSON.parse(localStorage.getItem('constructionWorkers')) || [];
            const foundWorker = customWorkers.find(w => w.username === usernameInput && w.password === passwordInput);
            if (foundWorker) isSuccess = true;
        }

        if (isSuccess) {
            errorMessage.style.color = '#2ecc71';
            errorMessage.textContent = 'Успешный вход! Перенаправление...';
            sessionStorage.setItem('activeUser', JSON.stringify(loggedUser));
            setTimeout(() => { window.location.href = 'main.html'; }, 1000);
        } else {
            errorMessage.style.color = '#e74c3c';
            errorMessage.textContent = 'Неверное имя пользователя или пароль!';
        }
    });
}

// --- ОБРАБОТКА СТРАНИЦЫ МОДЕРАЦИИ (СПИСОК РАБОЧИХ) ---
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

window.deleteWorker = function(index) {
    let customWorkers = JSON.parse(localStorage.getItem('constructionWorkers')) || [];
    customWorkers.splice(index, 1); 
    localStorage.setItem('constructionWorkers', JSON.stringify(customWorkers)); 
    renderWorkers(); 
};

if (addWorkerForm) {
    addWorkerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const newUsername = document.getElementById('newUsername').value.trim();
        const newPassword = document.getElementById('newPassword').value;

        if (newUsername.toLowerCase() === 'kranovschik') {
            modSystemMessage.style.color = '#e53e3e';
            modSystemMessage.textContent = 'Ошибка: Логин зарезервирован!';
            return;
        }

        let customWorkers = JSON.parse(localStorage.getItem('constructionWorkers')) || [];
        const isExist = customWorkers.some(w => w.username.toLowerCase() === newUsername.toLowerCase());

        if (isExist) {
            modSystemMessage.style.color = '#e53e3e';
            modSystemMessage.textContent = 'Пользователь уже существует!';
        } else {
            customWorkers.push({ username: newUsername, password: newPassword });
            localStorage.setItem('constructionWorkers', JSON.stringify(customWorkers));
            modSystemMessage.style.color = '#2f9e44';
            modSystemMessage.textContent = `Участник успешно добавлен!`;
            addWorkerForm.reset();
            renderWorkers(); 
        }
    });
}
