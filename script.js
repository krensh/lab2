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

    // --- 2. УМНАЯ БЛОКИРОВКА СКРОЛЛА ---
    let activeStarsCount = 0;
    let puzzleCount = 0;
    let isScrollLocked = false;

    const finalSection = document.getElementById('final-section');
    const fifthSection = document.getElementById('fifth-section');

    window.addEventListener('wheel', (e) => {
        if (e.deltaY > 0 && isScrollLocked) {
            // Блокируем на 2-м экране
            if (activeStarsCount < 3 && window.scrollY >= window.innerHeight) {
                if (window.scrollY + e.deltaY > window.innerHeight) {
                     window.scrollTo(0, window.innerHeight);
                     e.preventDefault();
                }
            }
            // Блокируем на 4-м экране
            else if (activeStarsCount === 3 && puzzleCount < 3) {
                if (window.scrollY + e.deltaY > window.innerHeight * 3) {
                    window.scrollTo(0, window.innerHeight * 3);
                    e.preventDefault();
                }
            }
        }
    }, { passive: false });


    // --- 3. ЗВЕЗДЫ НА 2 ЭКРАНЕ ---
    const stars = document.querySelectorAll('.stars-container .star');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            star.classList.toggle('active');
            activeStarsCount += star.classList.contains('active') ? 1 : -1;

            if (activeStarsCount === 3) {
                document.body.classList.add('game-won');
                isScrollLocked = true;
                setTimeout(() => {
                    const yOffset = finalSection.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({ top: yOffset, behavior: 'smooth' });
                }, 100);
            } else {
                document.body.classList.remove('game-won');
                if(window.scrollY > window.innerHeight) {
                     window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                }
            }
        });
    });


    // --- 4. ЛОГИКА 4 ЭКРАНА (ПАЗЛ) ---
    const puzzleStars = document.querySelectorAll('.puzzle-star');
    const secondCarousel = document.getElementById('second-carousel');

    // Все возможные комбинации по 3 звезды (123, 124, 134, 234)
    const combinations = ["123", "124", "134", "234"];

    // Привязываем комбинации к папкам с картинками
    const comboToFolder = {
        "123": 1,
        "124": 2,
        "134": 3,
        "234": 1  // Для четвертой комбинации можно использовать 1-ю папку или добавить новую
    };

    // Функция для генерации картинок в карусели
    function loadImages(folderNumber) {
        secondCarousel.innerHTML = ''; // Очищаем старые картинки
        for (let i = 1; i <= 5; i++) {
            const img = document.createElement('img');
            // Путь к картинкам: assets/pic_packs/second/1/1.jpg и т.д.
            img.src = `assets/pic_packs/second/${folderNumber}/${i}.jpg`;
            img.alt = `Идея ${i}`;
            img.className = 'carousel-img';
            img.draggable = false;
            secondCarousel.appendChild(img);
        }
    }

    puzzleStars.forEach(star => {
        star.addEventListener('click', () => {
            const starId = star.getAttribute('data-id');
            let activeIds = [];

            // Собираем ID всех горящих звезд ДО клика
            puzzleStars.forEach(s => {
                if (s.classList.contains('active')) {
                    activeIds.push(s.getAttribute('data-id'));
                }
            });

            // Если звезда уже горит, мы ее тушим (удаляем из массива)
            if (star.classList.contains('active')) {
                activeIds = activeIds.filter(id => id !== starId);
            } else {
                // Если звезда не горит, добавляем ее
                activeIds.push(starId);
            }

            // ПРАВИЛО: Если выбрано 4 звезды, оставляем только последнюю
            if (activeIds.length === 4) {
                activeIds = [starId];
            }

            // Обновляем визуальное состояние всех звезд
            puzzleStars.forEach(s => {
                const id = s.getAttribute('data-id');
                if (activeIds.includes(id)) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });

            puzzleCount = activeIds.length;

            // Если выбрано 3 звезды
            if (puzzleCount === 3) {
                // Сортируем ID по возрастанию, чтобы получить строку (например, "123")
                const comboString = activeIds.sort().join("");

                // Загружаем картинки для этой комбинации
                if (comboToFolder[comboString]) {
                    loadImages(comboToFolder[comboString]);
                }

                // Разблокируем скролл и едем вниз
                document.body.classList.add('puzzle-won');
                isScrollLocked = false;
                setTimeout(() => {
                    const yOffset = fifthSection.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({ top: yOffset, behavior: 'smooth' });
                }, 100);
            } else {
                // Если звезд меньше 3, блокируем скролл и прячем 5 экран
                document.body.classList.remove('puzzle-won');
                isScrollLocked = true;
            }
        });
    });


    // --- 5. ДРАГ КАРУСЕЛЕЙ ---
    // Инициализация драга для обеих каруселей
    const carousels = [document.getElementById('carousel'), document.getElementById('second-carousel')];

    carousels.forEach(carouselContainer => {
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
});
