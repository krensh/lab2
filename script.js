document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ЛОГИКА КУРСОРА-ЗВЕЗДЫ ---
    const cursorStar = document.querySelector('.cursor-star');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let starX = mouseX;
    let starY = mouseY;

    // Отслеживаем движение мыши
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Анимация "догоняния" (инерция)
    function animateCursor() {
        // Коэффициент 0.15 задает скорость догоняния (чем меньше, тем сильнее отстает)
        starX += (mouseX - starX) * 0.15;
        starY += (mouseY - starY) * 0.15;

        cursorStar.style.left = `${starX}px`;
        cursorStar.style.top = `${starY}px`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // --- 2. ЛОГИКА ЗАЖИГАНИЯ ЗВЕЗД ---
    const stars = document.querySelectorAll('.star');
    let activeStarsCount = 0;

    stars.forEach(star => {
        star.addEventListener('click', () => {
            // Переключаем класс "active"
            star.classList.toggle('active');

            // Проверяем, зажглась звезда или потухла, чтобы вести счетчик
            if (star.classList.contains('active')) {
                activeStarsCount++;
            } else {
                activeStarsCount--;
            }

            // Если зажгли все 3 звезды
            if (activeStarsCount === 3) {
                // Тут будет логика скролла вниз и открытия следующего блока
                document.querySelector('.subtitle').textContent = "ты справился!";
                // Через 1.5 секунды можно разблокировать скролл:
                // document.body.style.overflow = 'auto';
            }
        });
    });
});
