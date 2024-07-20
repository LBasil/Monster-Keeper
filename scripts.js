document.addEventListener('DOMContentLoaded', (event) => {
    loadFromLocalStorage();
    showScreen('enclos');
    updateAllFieldsState();
    setInterval(updateFieldsState, 3000); // Update fields state every 3 seconds
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
        'field-4': 'growing-1'
    },
    'landscape-2': {
        'field-1': 'growing-1',
        'field-2': 'growing-2',
        'field-3': 'non-constructed',
        'field-4': 'empty'
    },
    'landscape-3': {
        'field-1': 'growing-3',
        'field-2': 'growing-1',
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
    updateAllFieldsState();
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
    }
}

function alertEnclosState(enclosId) {
    const enclosElement = document.getElementById(enclosId);
    if (enclosElement) {
        showNotification(`L'état de ${enclosId} est : ${enclosElement.className.split(' ')[1]}`);
    }
}

function alertFieldState(fieldId) {
    const fieldElement = document.getElementById(fieldId);
    if (fieldElement) {
        showNotification(`L'état de ${fieldId} est : ${fieldElement.className.split(' ')[1]}`);
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
    localStorage.setItem('lastUpdate', new Date().getTime());
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
            showNotification('Vous avez planté une graine de blé.');
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
    showNotification(`Vous avez récolté ${wheatAmount} blé(s) et ${seedAmount} graine(s) de blé.`);
}

function plantField(fieldId) {
    fieldStates[landscapes[currentLandscapeIndex]][fieldId] = 'growing-1'; // Set field state to growing-1 when planting
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

function updateAllFieldsState() {
    const lastUpdate = localStorage.getItem('lastUpdate');
    if (lastUpdate) {
        const currentTime = new Date().getTime();
        const timeDifference = currentTime - lastUpdate; // Time difference in milliseconds
        const stateUpdates = Math.floor(timeDifference / 10000); // Number of 10-second intervals passed

        if (stateUpdates > 0) {
            for (let landscape in fieldStates) {
                const fields = fieldStates[landscape];
                for (let field in fields) {
                    let state = fields[field];
                    if (state.startsWith('growing-')) {
                        let level = parseInt(state.split('-')[1]);
                        level = Math.min(level + stateUpdates, 7);
                        fields[field] = `growing-${level}`;
                        setFieldState(field, `growing-${level}`);
                    }
                }
            }
        }
        saveToLocalStorage();
    }
}

function showNotification(message) {
    const toastContainer = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-primary border-0';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    const toastBody = document.createElement('div');
    toastBody.className = 'd-flex';
    toastBody.innerHTML = `
        <div class="toast-body">
            ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    `;

    toast.appendChild(toastBody);
    toastContainer.appendChild(toast);

    const bootstrapToast = new bootstrap.Toast(toast, { delay: 3000 });
    bootstrapToast.show();

    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function resetGame() {
    localStorage.clear();
    location.reload();
}
