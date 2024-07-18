document.addEventListener('DOMContentLoaded', (event) => {
    showScreen('enclos');
    switchLandscape(); // Set initial landscape
    updateEnclosures(); // Update enclosures based on the initial landscape
});

const screens = ['enclos', 'ferme', 'options', 'capture'];
let currentScreenIndex = 0;
let currentLandscapeIndex = -1; // So with +1 we get 0

const landscapes = ['landscape-1', 'landscape-2', 'landscape-3'];

// Define states for enclosures for each landscape
const enclosureStates = {
    'landscape-1': {
        'enclos-1': 'in-construction',
        'enclos-2': 'empty',
        'enclos-3': 'occupied',
        'enclos-4': 'non-existing'
    },
    'landscape-2': {
        'enclos-1': 'empty',
        'enclos-2': 'in-construction',
        'enclos-3': 'non-existing',
        'enclos-4': 'occupied'
    },
    'landscape-3': {
        'enclos-1': 'occupied',
        'enclos-2': 'non-existing',
        'enclos-3': 'empty',
        'enclos-4': 'in-construction'
    }
};

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

function switchLandscape() {
    const enclosSection = document.getElementById('enclos');
    currentLandscapeIndex = (currentLandscapeIndex + 1) % landscapes.length;
    enclosSection.className = 'screen active ' + landscapes[currentLandscapeIndex];
    updateEnclosures();
}

// Function to update enclosures based on the current landscape
function updateEnclosures() {
    const currentLandscape = landscapes[currentLandscapeIndex];
    const currentStates = enclosureStates[currentLandscape];

    Object.keys(currentStates).forEach(enclosId => {
        setEnclosState(enclosId, currentStates[enclosId]);
    });
}

// Function to manage the state of the enclosures
function setEnclosState(enclosId, state) {
    const enclos = document.getElementById(enclosId);
    enclos.className = 'enclos ' + state;
}
