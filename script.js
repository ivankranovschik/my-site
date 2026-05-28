document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Запрещаем перезагрузку страницы при отправке формы

    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Проверка учетных данных
    if (usernameInput === 'Kranovschik' && passwordInput === '12345') {
        errorMessage.style.color = '#2ecc71';
        errorMessage.textContent = 'Успешный вход! Перенаправление...';
        
        // Перенаправляем на главную страницу через 1.5 секунды
        setTimeout(function() {
            window.location.href = 'main.html';
        }, 1500);
    } else {
        errorMessage.style.color = '#e74c3c';
        errorMessage.textContent = 'Неверное имя пользователя или пароль!';
    }
});
