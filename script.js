document.addEventListener('DOMContentLoaded', () => {
    // корсор
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

    let activeStarsCount = 0;
    let puzzleCount = 0;
    let isScrollLocked = false;
    let foundCombos = [];


    const finalSection = document.getElementById('final-section');
    const fifthSection = document.getElementById('fifth-section');
    const sandboxSection = document.getElementById('sandbox-section');
    const sandboxCarouselSection = document.getElementById('sandbox-carousel-section');

    window.addEventListener('wheel', (e) => {
        if (e.deltaY > 0 && isScrollLocked) {

            if (activeStarsCount < 3 && window.scrollY >= window.innerHeight) {
                if (window.scrollY + e.deltaY > window.innerHeight) {
                     window.scrollTo(0, window.innerHeight);
                     e.preventDefault();
                }
            }

            else if (activeStarsCount === 3 && foundCombos.length < 4) {
                const fifthRect = fifthSection.getBoundingClientRect();
                const fifthBottom = fifthRect.bottom + window.scrollY;

                if (window.scrollY + e.deltaY > fifthBottom - 50) {
                    window.scrollTo(0, fifthBottom - 50);
                    e.preventDefault();
                }
            }
        }
    }, { passive: false });


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


    const puzzleStars = document.querySelectorAll('.puzzle-star');
    const secondCarousel = document.getElementById('second-carousel');

    const combos = {
        "123": "second/1",
        "124": "second/2",
        "234": "second/3",
        "134": "second/4"
    };

    function loadImagesFromPath(carouselElement, folderPath) {
        if (carouselElement.dataset.currentFolder === folderPath) return;

        carouselElement.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const img = document.createElement('img');
            img.src = `assets/pic_packs/${folderPath}/${i}.jpg`;
            img.alt = `Идея ${i}`;
            img.className = 'carousel-img';
            img.draggable = false;
            img.onerror = () => img.style.display = 'none';
            carouselElement.appendChild(img);
        }
        carouselElement.dataset.currentFolder = folderPath;
    }

    puzzleStars.forEach(star => {
        star.addEventListener('click', () => {
            const starId = star.getAttribute('data-id');
            let activeIds = [];
            puzzleStars.forEach(s => {
                if (s.classList.contains('active')) activeIds.push(s.getAttribute('data-id'));
            });

            if (star.classList.contains('active')) {
                activeIds = activeIds.filter(id => id !== starId);
            } else {
                activeIds.push(starId);
            }

            if (activeIds.length === 4) activeIds = [starId];

            puzzleStars.forEach(s => {
                if (activeIds.includes(s.getAttribute('data-id'))) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });

            puzzleCount = activeIds.length;

            if (puzzleCount === 3) {
                const comboString = activeIds.sort().join("");

                if (!foundCombos.includes(comboString) && combos[comboString]) {
                    foundCombos.push(comboString);

                    if (foundCombos.length === 4) {
                        document.body.classList.add('all-combos-found');
                        isScrollLocked = false;
                    }
                }

                if (combos[comboString]) {
                    loadImagesFromPath(secondCarousel, combos[comboString]);
                }

                document.body.classList.add('puzzle-won');
                setTimeout(() => {
                    const yOffset = fifthSection.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({ top: yOffset, behavior: 'smooth' });
                }, 100);
            } else {
                document.body.classList.remove('puzzle-won');
                if (foundCombos.length < 4) {
                    isScrollLocked = true;
                }
            }
        });
    });


    const sandboxStars = document.querySelectorAll('.sandbox-star');
    const sandboxCarousel = document.getElementById('sandbox-carousel');
    let sandboxActiveIds = [];

    sandboxStars.forEach(star => {
        star.addEventListener('click', () => {
            const starId = star.getAttribute('data-id');

            if (star.classList.contains('active')) {
                star.classList.remove('active');
                sandboxActiveIds = sandboxActiveIds.filter(id => id !== starId);
            } else {
                star.classList.add('active');
                sandboxActiveIds.push(starId);

                if (sandboxActiveIds.length > 3) {
                    sandboxActiveIds = [starId];
                    sandboxStars.forEach(s => {
                        if (s.getAttribute('data-id') !== starId) s.classList.remove('active');
                    });
                }
            }

            if (sandboxActiveIds.length === 3) {
                const comboString = sandboxActiveIds.sort().join("");
                loadImagesFromPath(sandboxCarousel, comboString);

                document.body.classList.add('sandbox-carousel-won');
                setTimeout(() => {
                    const yOffset = sandboxCarouselSection.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({ top: yOffset, behavior: 'smooth' });
                }, 100);
            } else {
                document.body.classList.remove('sandbox-carousel-won');
            }
        });
    });


    const carousels = [document.getElementById('carousel'), secondCarousel, sandboxCarousel];

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
