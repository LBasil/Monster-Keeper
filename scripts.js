document.addEventListener('DOMContentLoaded', (event) => {
    showScreen('enclos');
    setEnclosState('enclos-1', 'in-construction');
    switchLandscape();
});

const screens = ['enclos', 'ferme', 'options', 'capture'];
let currentScreenIndex = 0;
let currentLandscapeIndex = -1; // So with +1 we get 0

const landscapes = ['landscape-1', 'landscape-2', 'landscape-3'];

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
        'enclos-1': 'non-existing',
        'enclos-2': 'empty',
        'enclos-3': 'occupied',
        'enclos-4': 'in-construction'
    }
};

const fieldStates = {
    'landscape-1': {
        'field-1': 'empty',
        'field-2': 'non-constructed',
        'field-3': 'growing-1',
        'field-4': 'growing-2'
    },
    'landscape-2': {
        'field-1': 'non-constructed',
        'field-2': 'empty',
        'field-3': 'growing-3',
        'field-4': 'growing-7'
    },
    'landscape-3': {
        'field-1': 'growing-1',
        'field-2': 'non-constructed',
        'field-3': 'empty',
        'field-4': 'growing-2'
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
}

function prevScreen() {
    currentScreenIndex = (currentScreenIndex - 1 + screens.length) % screens.length;
    showScreen(screens[currentScreenIndex]);
}

function nextScreen() {
    currentScreenIndex = (currentScreenIndex + 1) % screens.length;
    showScreen(screens[currentScreenIndex]);
}

function switchLandscape() {
    const currentScreen = screens[currentScreenIndex];
    currentLandscapeIndex = (currentLandscapeIndex + 1) % landscapes.length;
    updateLandscapes();
    updateEnclosures();
    updateFields();
    showScreen(currentScreen);
}

function updateLandscapes() {
    const activeLandscape = landscapes[currentLandscapeIndex];
    const screenElements = document.querySelectorAll('.screen');
    screenElements.forEach(screen => {
        screen.classList.remove(...landscapes);
        screen.classList.add(activeLandscape);
    });
}

function updateEnclosures() {
    const currentLandscape = landscapes[currentLandscapeIndex];
    const currentStates = enclosureStates[currentLandscape];

    Object.keys(currentStates).forEach(enclosId => {
        setEnclosState(enclosId, currentStates[enclosId]);
    });
}

function updateFields() {
    const currentLandscape = landscapes[currentLandscapeIndex];
    const currentStates = fieldStates[currentLandscape];

    Object.keys(currentStates).forEach(fieldId => {
        setFieldState(fieldId, currentStates[fieldId]);
    });
}

function setEnclosState(enclosId, state) {
    const enclos = document.getElementById(enclosId);
    enclos.className = 'enclos ' + state;
}

function setFieldState(fieldId, state) {
    const field = document.getElementById(fieldId);
    field.className = 'field ' + state;
    field.onclick = () => handleFieldClick(fieldId);

    // Supprimez les cercles de progression existants
    const existingProgressCircle = field.querySelector('.progress-circle');
    if (existingProgressCircle) {
        existingProgressCircle.remove();
    }

    if (state.startsWith('growing-')) {
        const progressCircle = document.createElement('div');
        progressCircle.className = 'progress-circle';

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const progressCirclePath = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        bgCircle.setAttribute("cx", "50%");
        bgCircle.setAttribute("cy", "50%");
        bgCircle.setAttribute("r", "45%");
        bgCircle.setAttribute("class", "bg");

        progressCirclePath.setAttribute("cx", "50%");
        progressCirclePath.setAttribute("cy", "50%");
        progressCirclePath.setAttribute("r", "45%");
        progressCirclePath.setAttribute("class", "progress");

        svg.appendChild(bgCircle);
        svg.appendChild(progressCirclePath);
        progressCircle.appendChild(svg);

        field.appendChild(progressCircle);

        // Ajoutez le remplissage de progression en fonction du stade de croissance actuel
        const growthStage = parseInt(state.split('-')[1]);
        updateProgressCircle(progressCirclePath, growthStage);
    }
}

function updateProgressCircle(circle, growthStage) {
    const progress = (growthStage / 7) * 314; // Calcule la progression basée sur le stade de croissance
    circle.style.strokeDashoffset = 314 - progress; // Applique le décalage de progression
}

function handleFieldClick(fieldId) {
    const field = document.getElementById(fieldId);
    const state = field.className.split(' ')[1];

    if (state === 'empty' && hasSeeds()) {
        plantSeed(fieldId);
    } else if (state.startsWith('growing-') && state !== 'growing-7') {
        alert(`Field state: ${state}`);
    } else if (state === 'growing-7') {
        harvestField(fieldId);
    }
}

function hasSeeds() {
    const seeds = localStorage.getItem('seeds');
    return seeds && parseInt(seeds) > 0;
}

function plantSeed(fieldId) {
    const seeds = parseInt(localStorage.getItem('seeds'));
    if (seeds > 0) {
        localStorage.setItem('seeds', seeds - 1);
        setFieldState(fieldId, 'growing-1');
        startGrowthCycle(fieldId);
    } else {
        alert('No seeds available');
    }
}

function startGrowthCycle(fieldId) {
    let growthStage = 1;
    const field = document.getElementById(fieldId);
    const progressCircle = field.querySelector('.progress');

    const growInterval = setInterval(() => {
        if (growthStage < 7) {
            growthStage++;
            setFieldState(fieldId, `growing-${growthStage}`);
            if (progressCircle) {
                updateProgressCircle(progressCircle, growthStage);
            }
        } else {
            clearInterval(growInterval);
        }
    }, 30000);
}

function harvestField(fieldId) {
    const wheat = parseInt(localStorage.getItem('wheat')) || 0;
    const seeds = parseInt(localStorage.getItem('seeds')) || 0;
    const harvestedWheat = getRandomInt(1, 5);
    const harvestedSeeds = getRandomInt(1, 3);

    localStorage.setItem('wheat', wheat + harvestedWheat);
    localStorage.setItem('seeds', seeds + harvestedSeeds);
    setFieldState(fieldId, 'empty');

    alert(`Vous avez récolté ${harvestedWheat} blé(s) et ${harvestedSeeds} graine(s). Maintenant, le champ est vide.`);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function saveFieldStates() {
    const currentLandscape = landscapes[currentLandscapeIndex];
    const currentStates = fieldStates[currentLandscape];
    const timestamp = new Date().getTime();

    const data = {
        timestamp: timestamp,
        states: currentStates
    };

    localStorage.setItem('fieldStates_' + currentLandscape, JSON.stringify(data));
}

function loadFieldStates() {
    landscapes.forEach(landscape => {
        const data = JSON.parse(localStorage.getItem('fieldStates_' + landscape));
        if (data) {
            const timeElapsed = new Date().getTime() - data.timestamp;
            const updatedStates = {};

            Object.keys(data.states).forEach(fieldId => {
                let state = data.states[fieldId];
                if (state.startsWith('growing-')) {
                    const growthStage = parseInt(state.split('-')[1]);
                    const newGrowthStage = growthStage + Math.floor(timeElapsed / 30000); // 30 seconds per stage

                    if (newGrowthStage > 7) {
                        updatedStates[fieldId] = 'growing-7';
                    } else {
                        updatedStates[fieldId] = 'growing-' + newGrowthStage;
                    }
                } else {
                    updatedStates[fieldId] = state;
                }
            });

            fieldStates[landscape] = updatedStates;
        }
    });
}

window.addEventListener('beforeunload', saveFieldStates);
document.addEventListener('DOMContentLoaded', loadFieldStates);
