document.addEventListener('DOMContentLoaded', (event) => {
    loadFromLocalStorage();
    showScreen('enclos');
    setInterval(updateFieldsState, 10000); // Update fields state every 10 seconds
});

const screens = ['enclos', 'ferme', 'options', 'capture'];
let currentScreenIndex = 0;
let currentLandscapeIndex = 0;

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
        'field-4': 'seed'
    },
    'landscape-2': {
        'field-1': 'seed',
        'field-2': 'growing-2',
        'field-3': 'non-constructed',
        'field-4': 'empty'
    },
    'landscape-3': {
        'field-1': 'growing-3',
        'field-2': 'seed',
        'field-3': 'empty',
        'field-4': 'non-constructed'
    }
};

let inventory = {
    'wheatSeeds': 5,
    'wheat': 0
};

function showScreen(screen) {
    screens.forEach(s => {
        document.getElementById(s).classList.remove('active');
    });
    document.getElementById(screen).classList.add('active');
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
    currentLandscapeIndex = (currentLandscapeIndex + 1) % landscapes.length;
    const landscape = landscapes[currentLandscapeIndex];
    const screenElements = document.querySelectorAll('.screen');

    screenElements.forEach(screen => {
        landscapes.forEach(ls => {
            screen.classList.remove(ls);
        });
        screen.classList.add(landscape);
    });

    const currentEnclosures = enclosureStates[landscape];
    for (let enclos in currentEnclosures) {
        setEnclosState(enclos, currentEnclosures[enclos]);
    }

    const currentFields = fieldStates[landscape];
    for (let field in currentFields) {
        setFieldState(field, currentFields[field]);
    }
    saveToLocalStorage();
}

function setEnclosState(enclosId, state) {
    const enclosElement = document.getElementById(enclosId);
    if (enclosElement) {
        enclosElement.className = 'enclos ' + state;
        enclosElement.textContent = state === 'non-existing' ? '-2' : state === 'in-construction' ? '-1' : state === 'empty' ? '0' : '1';
    }
}

function setFieldState(fieldId, state) {
    const fieldElement = document.getElementById(fieldId);
    if (fieldElement) {
        fieldElement.className = 'field ' + state;
        fieldElement.textContent = state === 'non-constructed' ? '-2' : state === 'in-construction' ? '-1' : state === 'empty' ? '0' : state.includes('growing') ? state.split('-')[1] : '1';
        if (state === 'in-construction') {
            updateFieldProgress(fieldId, 20); // Update progress bar for in-construction state
        }
    }
}

function alertEnclosState(enclosId) {
    const enclosElement = document.getElementById(enclosId);
    if (enclosElement) {
        alert(`L'état de ${enclosId} est : ${enclosElement.className.split(' ')[1]}`);
    }
}

function alertFieldState(fieldId) {
    const fieldElement = document.getElementById(fieldId);
    if (fieldElement) {
        alert(`L'état de ${fieldId} est : ${fieldElement.className.split(' ')[1]}`);
    }
}

function updateFieldProgress(fieldId, duration) {
    const fieldElement = document.getElementById(fieldId);
    const progressBar = fieldElement.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.height = '0%';
        setTimeout(() => {
            progressBar.style.height = '100%';
        }, 100); // Small delay to trigger CSS transition
        setTimeout(() => {
            fieldElement.className = 'field seed'; // Change state to seed after duration
            fieldStates[landscapes[currentLandscapeIndex]][fieldId] = 'seed'; // Update state in fieldStates
            saveToLocalStorage();
        }, duration * 1000);
    }
}

function saveToLocalStorage() {
    const currentLandscape = landscapes[currentLandscapeIndex];
    const currentEnclosures = enclosureStates[currentLandscape];
    const currentFields = fieldStates[currentLandscape];

    localStorage.setItem('currentScreenIndex', currentScreenIndex);
    localStorage.setItem('currentLandscapeIndex', currentLandscapeIndex);
    localStorage.setItem('enclosureStates', JSON.stringify(enclosureStates));
    localStorage.setItem('fieldStates', JSON.stringify(fieldStates));
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

function loadFromLocalStorage() {
    if (localStorage.getItem('currentScreenIndex') !== null) {
        currentScreenIndex = parseInt(localStorage.getItem('currentScreenIndex'), 10);
    }
    if (localStorage.getItem('currentLandscapeIndex') !== null) {
        currentLandscapeIndex = parseInt(localStorage.getItem('currentLandscapeIndex'), 10);
    }
    if (localStorage.getItem('enclosureStates') !== null) {
        Object.assign(enclosureStates, JSON.parse(localStorage.getItem('enclosureStates')));
    }
    if (localStorage.getItem('fieldStates') !== null) {
        Object.assign(fieldStates, JSON.parse(localStorage.getItem('fieldStates')));
    }
    if (localStorage.getItem('inventory') !== null) {
        inventory = JSON.parse(localStorage.getItem('inventory'));
    }

    const currentLandscape = landscapes[currentLandscapeIndex];
    if (currentLandscape) {
        const screenElements = document.querySelectorAll('.screen');
        screenElements.forEach(screen => {
            landscapes.forEach(ls => {
                screen.classList.remove(ls);
            });
            screen.classList.add(currentLandscape);
        });

        const currentEnclosures = enclosureStates[currentLandscape];
        for (let enclos in currentEnclosures) {
            setEnclosState(enclos, currentEnclosures[enclos]);
        }

        const currentFields = fieldStates[currentLandscape];
        for (let field in currentFields) {
            setFieldState(field, currentFields[field]);
        }
    }

    showScreen(screens[currentScreenIndex]);
}

function handleFieldClick(fieldId) {
    const fieldElement = document.getElementById(fieldId);
    const state = fieldElement.className.split(' ')[1];
    if (state === 'growing-7') {
        harvestField(fieldId);
    } else if (state === 'empty') {
        if (inventory.wheatSeeds > 0) {
            inventory.wheatSeeds--;
            plantField(fieldId);
            alert('Vous avez planté une graine de blé.');
        } else {
            alertFieldState(fieldId);
        }
    } else {
        alertFieldState(fieldId);
    }
}

function harvestField(fieldId) {
    const wheatAmount = Math.floor(Math.random() * 5) + 1; // 1 to 5 wheat
    const seedAmount = Math.floor(Math.random() * 3) + 1; // 1 to 3 seeds
    inventory.wheat += wheatAmount;
    inventory.wheatSeeds += seedAmount;
    fieldStates[landscapes[currentLandscapeIndex]][fieldId] = 'empty'; // Set field state to empty after harvesting
    setFieldState(fieldId, 'empty');
    saveToLocalStorage();
    alert(`Vous avez récolté ${wheatAmount} blé(s) et ${seedAmount} graine(s) de blé.`);
}

function plantField(fieldId) {
    fieldStates[landscapes[currentLandscapeIndex]][fieldId] = 'growing-1'; // Set field state to in-construction when planting
    setFieldState(fieldId, 'growing-1');
    saveToLocalStorage();
}

function updateFieldsState() {
    const currentLandscape = landscapes[currentLandscapeIndex];
    const currentFields = fieldStates[currentLandscape];

    for (let field in currentFields) {
        let state = currentFields[field];
        if (state.startsWith('growing-')) {
            let level = parseInt(state.split('-')[1]);
            if (level < 7) {
                level++;
                currentFields[field] = `growing-${level}`;
                setFieldState(field, `growing-${level}`);
            }
        }
    }
    saveToLocalStorage();
}
