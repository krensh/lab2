document.addEventListener('DOMContentLoaded', () => {
    // --- 1. КУРСОР ---
    const cursorStar = document.querySelector('.cursor-star');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let starX = mouseX;
    let starY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        if (!cursorStar) return;
        starX += (mouseX - starX) * 0.15;
        starY += (mouseY - starY) * 0.15;
        cursorStar.style.left = `${starX}px`;
        cursorStar.style.top = `${starY}px`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // --- 2. ПЕРЕМЕННЫЕ ДЛЯ КОНТРОЛЯ СКРОЛЛА ---
    let activeStarsCount = 0;
    let puzzleCount = 0;
    let isScrollLocked = false; // Флаг блокировки

    const finalSection = document.getElementById('final-section');
    const fifthSection = document.getElementById('fifth-section');

    // --- 3. УМНАЯ БЛОКИРОВКА СКРОЛЛА (С ОТКАТОМ) ---
    window.addEventListener('wheel', (e) => {
        // Если скроллим вниз (e.deltaY > 0) и скролл заблокирован
        if (e.deltaY > 0 && isScrollLocked) {

            // Если мы на 2 экране (звезды не собраны) — не даем скроллить ниже 2-го экрана
            if (activeStarsCount < 3 && window.scrollY >= window.innerHeight) {
                // Не даем уйти дальше второго экрана (100vh)
                if (window.scrollY + e.deltaY > window.innerHeight) {
                     window.scrollTo(0, window.innerHeight);
                     e.preventDefault(); // Отменяем инерцию
                }
            }
            // Если мы на 4 экране (3-й уже открыт), но не собрали 3 звезды на 4-м
            else if (activeStarsCount === 3 && puzzleCount < 3) {
                // Не даем уйти дальше 4-го экрана (300vh = 3 экрана по 100vh)
                if (window.scrollY + e.deltaY > window.innerHeight * 3) {
                    window.scrollTo(0, window.innerHeight * 3);
                    e.preventDefault();
                }
            }
        }
    }, { passive: false });


    // --- 4. ЗВЕЗДЫ НА 2 ЭКРАНЕ (Нужно 3 из 3) ---
    const stars = document.querySelectorAll('.stars-container .star');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            star.classList.toggle('active');
            activeStarsCount += star.classList.contains('active') ? 1 : -1;

            if (activeStarsCount === 3) {
                // Открываем 3 и 4 экран
                document.body.classList.add('game-won');
                isScrollLocked = true; // Скролл дальше пока закрыт (ждем 4-й экран)

                // Плавный скролл на 3-й экран
                setTimeout(() => {
                    const yOffset = finalSection.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({ top: yOffset, behavior: 'smooth' });
                }, 100);
            } else {
                document.body.classList.remove('game-won');
                // Если потушили звезду, возвращаемся на 2-й экран
                if(window.scrollY > window.innerHeight) {
                     window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                }
            }
        });
    });


    // --- 5. ЗВЕЗДЫ НА 4 ЭКРАНЕ (Нужно 3 из 4) ---
    const puzzleStars = document.querySelectorAll('.puzzle-star');

    puzzleStars.forEach(star => {
        star.addEventListener('click', () => {
            star.classList.toggle('active');
            puzzleCount += star.classList.contains('active') ? 1 : -1;

            if (puzzleCount >= 3) {
                // Открываем 5 экран и полностью разблокируем скролл
                document.body.classList.add('puzzle-won');
                isScrollLocked = false;

                setTimeout(() => {
                    const yOffset = fifthSection.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({ top: yOffset, behavior: 'smooth' });
                }, 100);
            } else {
                document.body.classList.remove('puzzle-won');
                isScrollLocked = true; // Снова блокируем, если потушили
            }
        });
    });


    // --- 6. КАРУСЕЛЬ (Драг) ---
    const carouselContainer = document.getElementById('carousel');
    if (carouselContainer) {
        let isDown = false;
        let startX;
        let scrollLeft;

        carouselContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            carouselContainer.classList.add('is-dragging');
            startX = e.pageX - carouselContainer.offsetLeft;
            scrollLeft = carouselContainer.scrollLeft;
        });

        const endDrag = () => {
            if (!isDown) return;
            isDown = false;
            carouselContainer.classList.remove('is-dragging');
        };

        carouselContainer.addEventListener('mouseleave', endDrag);
        carouselContainer.addEventListener('mouseup', endDrag);

        carouselContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carouselContainer.offsetLeft;
            const walk = (x - startX) * 1.5;
            carouselContainer.scrollLeft = scrollLeft - walk;
        });
    }
});
