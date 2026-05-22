document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('action-btn');
    const title = document.getElementById('title');
    const description = document.getElementById('description');

    let isChanged = false;

    button.addEventListener('click', () => {
        if (!isChanged) {
            title.textContent = "Всё работает!";
            description.textContent = "Код успешно подключен и выполнился. Теперь вы можете изменить этот проект под свои нужды.";
            button.textContent = "Вернуть обратно";
            button.style.backgroundColor = #e53e3e;
            isChanged = true;
        } else {
            title.textContent = "Добро пожаловать!";
            description.textContent = "Это стартовая страница вашего нового проекта. Нажмите кнопку ниже, чтобы изменить текст.";
            button.textContent = "Нажми меня";
            button.style.backgroundColor = #667eea;
            isChanged = false;
        }
    });
});
