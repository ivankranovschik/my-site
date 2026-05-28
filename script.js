// --- ЛОГИКА ВХОДА (index.html) ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        // Берем измененные данные Kranovschik, если они есть
        const savedName = localStorage.getItem('admin_name') || 'Kranovschik';
        const savedPass = localStorage.getItem('admin_pass') || '12345';

        if (usernameInput === savedName && passwordInput === savedPass) {
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

// --- ЛОГИКА ПРОФИЛЯ И ВЫПАДАЮЩЕГО МЕНЮ (main.html / cities.html / moderation.html) ---
document.addEventListener('DOMContentLoaded', function() {
    const profileTrigger = document.getElementById('profileTrigger');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const headerAvatar = document.getElementById('headerAvatar');
    const headerUsername = document.getElementById('headerUsername');
    
    const avatarInput = document.getElementById('avatarInput');
    const changeNameInput = document.getElementById('changeNameInput');
    const changePassInput = document.getElementById('changePassInput');
    const saveProfileBtn = document.getElementById('saveProfileBtn');

    // 1. Загрузка сохраненных данных профиля при старте страницы
    if (headerUsername) {
        headerUsername.textContent = localStorage.getItem('admin_name') || 'Kranovschik';
    }
    if (headerAvatar) {
        const savedAvatar = localStorage.getItem('admin_avatar');
        if (savedAvatar) {
            headerAvatar.innerHTML = `<img src="${savedAvatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        } else {
            const currentName = localStorage.getItem('admin_name') || 'Kranovschik';
            headerAvatar.textContent = currentName.charAt(0).toUpperCase();
        }
    }

    // 2. Открытие / Закрытие менюшки по клику на профиль
    if (profileTrigger && profileDropdown) {
        profileTrigger.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        // Закрывать меню, если кликнули в любое другое место экрана
        document.addEventListener('click', function() {
            profileDropdown.classList.remove('active');
        });

        profileDropdown.addEventListener('click', function(e) {
            e.stopPropagation(); // Чтобы меню не закрывалось при кликах внутри него
        });
    }

    // 3. Сохранение новых настроек профиля
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', function() {
            // Смена имени
            if (changeNameInput.value.trim() !== '') {
                localStorage.setItem('admin_name', changeNameInput.value.trim());
                if (headerUsername) headerUsername.textContent = changeNameInput.value.trim();
            }
            
            // Смена пароля
            if (changePassInput.value !== '') {
                localStorage.setItem('admin_pass', changePassInput.value);
            }

            // Обработка и сохранение загруженной картинки аватара
            if (avatarInput && avatarInput.files && avatarInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    localStorage.setItem('admin_avatar', e.target.result);
                    if (headerAvatar) {
                        headerAvatar.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
                    }
                };
                reader.readAsDataURL(avatarInput.files[0]);
            }

            alert('Настройки профиля успешно сохранены!');
            changeNameInput.value = '';
            changePassInput.value = '';
            profileDropdown.classList.remove('active');
        });
    }

    // 4. Кнопка выхода из аккаунта
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
});

// --- СТРАНИЦА МОДЕРАЦИИ (moderation.html) ---
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

if (addWorkerForm) {
    addWorkerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const newUsername = document.getElementById('newUsername').value.trim();
        const newPassword = document.getElementById('newPassword').value;
        const currentAdminName = localStorage.getItem('admin_name') || 'Kranovschik';

        if (newUsername.toLowerCase() === currentAdminName.toLowerCase() || newUsername.toLowerCase() === 'kranovschik') {
            modSystemMessage.style.color = '#e53e3e';
            modSystemMessage.textContent = 'Ошибка: Этот логин занят создателем сайта!';
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

window.deleteWorker = function(index) {
    let customWorkers = JSON.parse(localStorage.getItem('constructionWorkers')) || [];
    customWorkers.splice(index, 1); 
    localStorage.setItem('constructionWorkers', JSON.stringify(customWorkers)); 
    renderWorkers(); 
};

if (dynamicWorkersList) {
    document.addEventListener('DOMContentLoaded', renderWorkers);
}
