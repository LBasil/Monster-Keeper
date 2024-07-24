/**
 * Execute function once the DOM is fully loaded
 */

var lastIdUsed = 10;
document.addEventListener('DOMContentLoaded', (event) => {
    loadFromLocalStorage();
    showScreen('enclos');
    initializeFields(lastIdUsed); // Initialize with 10 fields
    updateAllFieldsState();
    setInterval(updateFieldsState, 3000); // Update fields state every 3 seconds
    startAnimalSpawning(); // Start spawning animals in the capture area
    setupInventoryButtonListener();
});

/**
 * Setup inventory button
 */

function setupInventoryButtonListener () {
    document.getElementById('inventoryButton').addEventListener('click', function() {
         $('#inventoryModal').modal('show');
    });
}

/**
 * Open/Close the inventory - Show/Hide the modal
 */
function handleInventoryClick(shouldOpen) {
    if (shouldOpen) {
        shouldOpenInventory = shouldOpen
    }
    if (shouldOpenInventory) {
        $('#inventoryModal').modal('show');
    } else {
        $('#inventoryModal').modal('hide');
    }

}

/**
 * Start spawning animals in the capture area at regular intervals
 */
function startAnimalSpawning() {
    setInterval(spawnAnimal, 5000); // Spawn an animal every 5 seconds
}

/**
 * Spawn an animal at a random position within the capture area
 */
function spawnAnimal() {
    const captureArea = document.getElementById('capture-area');
    const animal = document.createElement('div');
    animal.className = 'animal';
    /*animal.style.backgroundImage = 'url("path/to/animal.png")'; // Replace with the path to your animal image*/
    // Temp
    animal.style.backgroundImage = 'red'
    animal.textContent = 'Animal'
    animal.style.top = `${Math.random() * (captureArea.clientHeight - 100)}px`;
    animal.style.left = `${Math.random() * (captureArea.clientWidth - 100)}px`;

    animal.onclick = () => {
        captureAnimal(animal);
    };

    captureArea.appendChild(animal);
    showNotification("Un animal est apparu !");

    setTimeout(() => {
        if (animal.parentElement) {
            animal.remove(); // Remove animal if not captured within 10 seconds
            showNotification("Un animal est partie !");
        }
    }, 10000); // 10 seconds before the animal disappears
}

/**
 * Handle capturing the animal
 */
function captureAnimal(animal) {
    animal.remove();
    showNotification('Vous avez capturé un animal !');

    // Add logic to add the captured animal to the player's inventory or enclosures
    // For example:
    // inventory.animals.push('animal');
    // saveToLocalStorage();
}

function initializeFields(numFields) {
    for (let i = 1; i <= numFields; i++) {
        addField(`field-${i}`);
    }
}

function addField(fieldId) {
    fieldId = fieldId || lastIdUsed++;
    const fieldContainer = document.getElementById('field-container');
    const field = document.createElement('div');
    const addFielddBtn = document.getElementById('addFieldBtn');
    field.id = fieldId;
    field.className = 'field empty'; // Initial state
    field.onclick = () => handleFieldClick(fieldId);
    //fieldContainer.appendChild(field);
    fieldContainer.insertBefore(field, addFielddBtn);

    // Initialize field state in fieldStates if not already present
    const currentLandscape = landscapes[currentLandscapeIndex];
    if (!fieldStates[currentLandscape]) {
        fieldStates[currentLandscape] = {};
    }
    if (!fieldStates[currentLandscape][fieldId]) {
        fieldStates[currentLandscape][fieldId] = 'empty';
    }
}

// Initiate screens and landscape value for new users
const screens = ['enclos', 'ferme', 'options', 'capture'];
let currentScreenIndex = 0;
let currentLandscapeIndex = 0;

const landscapes = ['landscape-1', 'landscape-2', 'landscape-3'];

// Starting eclosureStates
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

// Starting fieldStates
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

// Starting inventory
let inventory = {
    'wheatSeeds': 5,
    'wheat': 0
};

/**
 * Show a specified screen
 * @param {String} screen - Contains the id of the screen
 */
function showScreen(screen) {
    screens.forEach(s => {
        document.getElementById(s).classList.remove('active');
    });
    document.getElementById(screen).classList.add('active');
}

/**
 * Go to the previous screen, if there's none, go to the last screen in the array.
 */
function prevScreen() {
    currentScreenIndex = (currentScreenIndex - 1 + screens.length) % screens.length;
    showScreen(screens[currentScreenIndex]);
}

/**
 * Go to the next screen, if there's none, go to the first screen in the array.
 */
function nextScreen() {
    currentScreenIndex = (currentScreenIndex + 1) % screens.length;
    showScreen(screens[currentScreenIndex]);
}

/**
 * Go to the next landscape, if there's none, go to the first landscape in the array.
 * Update every field and enclos depending of the landscape and current screen.
 */
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

/**
 * Set the new state of an enclos
 * @param {String} enclosId - Id of the enclos
 * @param {String} state - New state of the enclos
 */
function setEnclosState(enclosId, state) {
    const enclosElement = document.getElementById(enclosId);
    if (enclosElement) {
        enclosElement.className = 'enclos ' + state;
        enclosElement.textContent = state === 'non-existing' ? '-2' : state === 'in-construction' ? '-1' : state === 'empty' ? '0' : '1';
    }
}

/**
 * Set the new state of a field
 * @param {String} fieldId - Id of the field
 * @param {String} state - New state of the field
 */
function setFieldState(fieldId, state) {
    const fieldElement = document.getElementById(fieldId);
    if (fieldElement) {
        fieldElement.className = 'field ' + state;
        fieldElement.textContent = state === 'non-constructed' ? '-2' : state === 'in-construction' ? '-1' : state === 'empty' ? '0' : state.includes('growing') ? state.split('-')[1] : '1';
    }
}

/**
 * Show the actual state of an enclos
 * @param {*} enclosId - Id of the enclos
 */
function alertEnclosState(enclosId) {
    const enclosElement = document.getElementById(enclosId);
    if (enclosElement) {
        showNotification(`L'état de ${enclosId} est : ${enclosElement.className.split(' ')[1]}`);
    }
}

/**
 * Show the actual state of an field
 * @param {String} fieldId - Id of the field
 */
function alertFieldState(fieldId) {
    const fieldElement = document.getElementById(fieldId);
    if (fieldElement) {
        showNotification(`L'état de ${fieldId} est : ${fieldElement.className.split(' ')[1]}`);
    }
}

/**
 * Save data in the localStorage
 */
function saveToLocalStorage() {
    localStorage.setItem('currentScreenIndex', currentScreenIndex);
    localStorage.setItem('currentLandscapeIndex', currentLandscapeIndex);
    localStorage.setItem('enclosureStates', JSON.stringify(enclosureStates));
    localStorage.setItem('fieldStates', JSON.stringify(fieldStates));
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('lastUpdate', new Date().getTime());
}

/**
 * If the player has already played, load date from localStorage
 */
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

/**
 * Handle field click, check if we need to display the state, harvest or plant
 * @param {String} fieldId - Id of the field
 */
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

/**
 * Harvest a field
 * @param {String} fieldId - Id of the field
 */
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

/**
 * Planta field
 * @param {String} fieldId - Id of the field
 */
function plantField(fieldId) {
    fieldStates[landscapes[currentLandscapeIndex]][fieldId] = 'growing-1'; // Set field state to growing-1 when planting
    setFieldState(fieldId, 'growing-1');
    saveToLocalStorage();
}

/**
 * Update state of the fields
 */
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

/**
 * Update the states of the field after the player came back to the screen
 */
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

/**
 * Show a notification
 * @param {String} message - Message to show
 */
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

/**
 * Clear local storage - Debug menu
 */
function resetGame() {
    localStorage.clear();
    location.reload();
}
