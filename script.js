document.addEventListener('DOMContentLoaded', () => {
    const actionBtn = document.getElementById('action-btn');
    const backBtn = document.getElementById('back-btn');
    const welcomeBlock = document.getElementById('welcome-block');
    const loginBlock = document.getElementById('login-block');
    const loginForm = document.getElementById('login-form');

    // Переход к форме входа
    actionBtn.addEventListener('click', () => {
        welcomeBlock.classList.add('hidden');
        loginBlock.classList.remove('hidden');
    });

    // Возврат назад на главную
    backBtn.addEventListener('click', () => {
        loginBlock.classList.add('hidden');
        welcomeBlock.classList.remove('hidden');
    });

    // Обработка отправки формы
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        alert(`Привет, ${username}! Вход успешно выполнен.`);
    });
});
