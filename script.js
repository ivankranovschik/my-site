// --- ОБРАБОТКА СТРАНИЦЫ ВХОДА (index.html) ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        // Проверяем твой главный аккаунт
        if (usernameInput === 'Kranovschik' && passwordInput === '12345') {
            errorMessage.style.color = '#2ecc71';
            errorMessage.textContent = 'Успешный вход! Перенаправление...';
            setTimeout(() => { window.location.href = 'main.html'; }, 1000);
            return;
        }

        // Проверяем список добавленных через модерацию пользователей из памяти браузера
        let customWorkers = JSON.parse(localStorage.getItem('constructionWorkers')) || [];
        
        // Ищем совпадение в списке
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

// --- ОБРАБОТКА ОКНА МОДЕРАЦИИ (main.html) ---
const openModBtn = document.getElementById('openModBtn');
const closeModBtn = document.getElementById('closeModBtn');
const modModal = document.getElementById('modModal');
const addWorkerForm = document.getElementById('addWorkerForm');
const modSystemMessage = document.getElementById('modSystemMessage');

// Открыть модальное окно
if (openModBtn && modModal) {
    openModBtn.addEventListener('click', function(e) {
        e.preventDefault();
        modModal.classList.add('active');
        modSystemMessage.textContent = ''; // Сброс сообщений
    });
}

// Закрыть модальное окно по крестику
if (closeModBtn && modModal) {
    closeModBtn.addEventListener('click', function() {
        modModal.classList.remove('active');
    });
}

// Добавление нового участника в базу данных браузера
if (addWorkerForm) {
    addWorkerForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const newUsername = document.getElementById('newUsername').value.trim();
        const newPassword = document.getElementById('newPassword').value;

        // Проверка на твой никнейм, чтобы его не перезаписали
        if (newUsername.toLowerCase() === 'kranovschik') {
            modSystemMessage.style.color = '#e53e3e';
            modSystemMessage.textContent = 'Ошибка: Логин Kranovschik зарезервирован!';
            return;
        }

        // Берем старых строителей или создаем пустой массив, если никого нет
        let customWorkers = JSON.parse(localStorage.getItem('constructionWorkers')) || [];

        // Проверяем, существует ли уже такой строитель
        const isExist = customWorkers.some(w => w.username.toLowerCase() === newUsername.toLowerCase());

        if (isExist) {
            modSystemMessage.style.color = '#e53e3e';
            modSystemMessage.textContent = 'Пользователь с таким именем уже добавлен!';
        } else {
            // Добавляем нового строителя в массив
            customWorkers.push({ username: newUsername, password: newPassword });
            // Сохраняем обратно в память браузера
            localStorage.setItem('constructionWorkers', JSON.stringify(customWorkers));

            modSystemMessage.style.color = '#2f9e44';
            modSystemMessage.textContent = `Участник ${newUsername} успешно добавлен!`;
            
            // Сбрасываем форму текста
            addWorkerForm.reset();
        }
    });
}
