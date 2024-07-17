document.addEventListener('DOMContentLoaded', (event) => {
    showScreen('enclos'); // Affiche l'écran par défaut
});

const screens = ['enclos', 'ferme', 'options', 'capture'];
let currentScreenIndex = 0;

function showScreen(screenId) {
    const screenElements = document.querySelectorAll('.screen');
    screenElements.forEach(screen => {
        if (screen.id === screenId) {
            screen.classList.add('active');
        } else {
            screen.classList.remove('active');
        }
    });
    currentScreenIndex = screens.indexOf(screenId);
    closeMenu();
}

function prevScreen() {
    currentScreenIndex = (currentScreenIndex - 1 + screens.length) % screens.length;
    showScreen(screens[currentScreenIndex]);
}

function nextScreen() {
    currentScreenIndex = (currentScreenIndex + 1) % screens.length;
    showScreen(screens[currentScreenIndex]);
}

function toggleMenu() {
    const menu = document.querySelector('nav .menu');
    menu.classList.toggle('active');
}

function closeMenu() {
    const menu = document.querySelector('nav .menu');
    menu.classList.remove('active');
}
