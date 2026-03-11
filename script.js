let isResetting = false;

const state = {
    cookies: 0,
    totalCPS: 0,
    clickValue: 1,
    multipliers: { snail: 1, elephant: 1, wurst: 1 },
    lastUpdate: Date.now()
};

const factoryData = {
    snail: {
        name: "Schnecken-Zucht",
        desc: "+1 Cookie/s",
        basePrice: 10,
        cps: 1,
        icon: "img/Schnecke.png" },
    elephant: {
        name: "Elefanten-Fabrik",
        desc: "+10 Cookies/s",
        basePrice: 100,
        cps: 10,
        icon: "img/Elefant.png" },
    wurst: {
        name: "Wurst-Fabrik",
        desc: "+50 Cookies/s",
        basePrice: 1000,
        cps: 50,
        icon: "img/Logo.png" }
};

const upgradeData = {
    stronger_fingers: {
        name: "Starke Finger",
        desc: "Klicks bringen +1", 
        basePrice: 50,
        type: "clickBoost", 
        icon: "img/Keks.svg" },
    snail_turbo: {
        name: "Turbo-Schnecken",
        desc: "Schnecken sind 2x so schnell",
        basePrice: 250, 
        type: "multiplier",
        target: "snail", 
        icon: "img/Schnecke.png" }
};

const factoryList = {}; 
const upgradesList = {};
const visibleupgrades = new Set();

const elements = {
    sidebar: document.querySelector('.sidebar'),
    cookieBtn: document.getElementById('cookie'),
    cookieDisplay: document.getElementById('cookie-count'),
    cpsDisplay: document.getElementById('cps-count'),
    shopToggle: document.getElementById('shop-toggle'),
    shopIcon: document.getElementById('shop-icon'),
    shopText: document.getElementById('shop-text'),
    settingsBtn: document.getElementById('settings-toggle'),
    settingsOverlay: document.getElementById('settings-overlay'),
    closeSettings: document.getElementById('close-settings'),
    resetBtn: document.getElementById('reset-game'),
    exportBtn: document.getElementById('export-save'),
    importBtn: document.getElementById('import-save'),
    savePopup: document.getElementById('save-popup'),
    loadPopup: document.getElementById('load-popup'),
    saveCodeField: document.getElementById('save-code-field'),
    loadCodeField: document.getElementById('load-code-field'),
    confirmLoadBtn: document.getElementById('confirm-load'),
    closeSave: document.getElementById('close-save'),
    closeLoad: document.getElementById('close-load')
};


function calculateTotalCPS() {
    state.totalCPS = Object.keys(factoryData).reduce((acc, key) => {
        const upg = factoryList[key];
        return acc + (upg.amount * upg.cps * (state.multipliers[key] || 1));
    }, 0);
}

function updateUI() {
    elements.cookieDisplay.innerText = Math.floor(state.cookies).toLocaleString();
    elements.cpsDisplay.innerText = state.totalCPS.toLocaleString();

    for (const key in factoryList) {
        const upg = factoryList[key];
        upg.dom.amount.innerText = upg.amount;
        upg.dom.price.innerText = Math.ceil(upg.price).toLocaleString();
        upg.dom.btn.disabled = state.cookies < upg.price;
    }

    checkUpgradeUnlocks();
}

function buyUpgrade(key) {
    const upg = factoryList[key];
    if (state.cookies >= upg.price) {
        state.cookies -= upg.price;
        upg.amount++;
        upg.price = Math.round(upg.basePrice * Math.pow(1.15, upg.amount));

        calculateTotalCPS();
        updateUI();
        saveGame();
    }
}

function buySpecialUpgrade(key) {
    const spec = upgradesList[key];
    if (state.cookies >= spec.price && !spec.bought) {
        state.cookies -= spec.price;
        spec.bought = true;

        if (spec.type === "clickBoost") state.clickValue += 1;
        if (spec.type === "multiplier") state.multipliers[spec.target] *= 2;

        spec.dom.btn.remove(); 
        
        calculateTotalCPS();
        updateUI();
        saveGame();
    }
}

function getSaveObject() {
    const upgradeAmounts = {};
    for (const key in factoryList) upgradeAmounts[key] = factoryList[key].amount;

    const boughtSpecials = {};
    for (const key in upgradesList) boughtSpecials[key] = upgradesList[key].bought;

    return {
        cookies: state.cookies,
        clickValue: state.clickValue,
        multipliers: state.multipliers,
        upgradeAmounts,
        boughtSpecials
    };
}

function applySaveData(data) {
    try {
        state.cookies = data.cookies || 0;
        state.clickValue = data.clickValue || 1;
        state.multipliers = data.multipliers || { snail: 1, elephant: 1, wurst: 1 };

        if (data.upgradeAmounts) {
            for (const key in data.upgradeAmounts) {
                if (factoryList[key]) {
                    const amount = data.upgradeAmounts[key];
                    factoryList[key].amount = amount;
                    factoryList[key].price = Math.round(factoryList[key].basePrice * Math.pow(1.15, amount));
                }
            }
        }

        if (data.boughtSpecials) {
            for (const key in data.boughtSpecials) {
                if (data.boughtSpecials[key]) {
                    if (upgradesList[key]) {
                        upgradesList[key].bought = true;
                        upgradesList[key].dom?.btn?.remove();
                    } else {
                        upgradesList[key] = { bought: true };
                    }
                }
            }
        }

        calculateTotalCPS();
        updateUI();
    } catch (e) {
        console.error("Fehler beim Laden:", e);
    }
}

function saveGame() {
    if (isResetting) return;
    localStorage.setItem('kekslefant_save', JSON.stringify(getSaveObject()));
}

function loadGame() {
    const savedData = localStorage.getItem('kekslefant_save');
    if (savedData) applySaveData(JSON.parse(savedData));
}

function initShop() {
    const factoryContainer = document.getElementById('factory-list');
    factoryContainer.innerHTML = ''; 

    for (const [key, data] of Object.entries(factoryData)) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'factory-item';
        itemDiv.innerHTML = `
            <div class="factory-info">
                <img src="${data.icon}" alt="${data.name}" class="factory-icon">
                <div class="factory-texts">
                    <span class="factory-name">${data.name}</span>
                    <span class="factory-desc">${data.desc}</span>
                </div>
                <div class="factory-count-badge"><span class="factory-amount" id="${key}-amount">0</span></div>
            </div>
            <div class="factory-controls">
                <button id="buy-${key}" class="factory-buy-btn">
                    <span class="buy-label">Kaufen</span>
                    <span class="buy-price-wrapper">
                        <span id="${key}-price">${data.basePrice}</span> 
                        <img src="img/Keks.svg" class="factory-price-icon">
                    </span>
                </button>
            </div>`;

        factoryContainer.appendChild(itemDiv);

        factoryList[key] = {
            ...data,
            amount: 0,
            price: data.basePrice,
            dom: {
                btn: document.getElementById(`buy-${key}`),
                price: document.getElementById(`${key}-price`),
                amount: document.getElementById(`${key}-amount`)
            }
        };
        factoryList[key].dom.btn.addEventListener('click', () => buyUpgrade(key));
    }
}

function checkUpgradeUnlocks() {
    const upgradeList = document.getElementById('upgrade-list');

    for (const [key, data] of Object.entries(upgradeData)) {
        if (upgradesList[key]?.bought || visibleupgrades.has(key)) continue;

        if (state.cookies >= data.basePrice * 0.8) {
            const btn = document.createElement('button');
            btn.className = 'upgrade-unlock-btn';
            btn.title = `${data.name}: ${data.desc} (${data.basePrice} Kekse)`;
            btn.innerHTML = `<img src="${data.icon}" class="btn-icon">`;
            
            upgradeList.appendChild(btn);
            visibleupgrades.add(key);

            upgradesList[key] = {
                ...data,
                price: data.basePrice,
                bought: false,
                dom: { btn: btn }
            };

            btn.addEventListener('click', () => buySpecialUpgrade(key));
        }
    }
}

elements.cookieBtn.addEventListener('click', (e) => {
    state.cookies += state.clickValue;
    updateUI();
});

elements.shopToggle.addEventListener('click', () => {
    const isOpen = elements.sidebar.classList.toggle('open');
    elements.shopIcon.src = isOpen ? 'img/Close.png' : 'img/Shop.png';
    elements.shopText.textContent = isOpen ? ' Schließen' : ' Shop';
});

const showOverlay = (o) => o.style.display = 'flex';
const hideOverlay = (o) => o.style.display = 'none';

elements.settingsBtn.addEventListener('click', () => showOverlay(elements.settingsOverlay));
elements.closeSettings.addEventListener('click', () => hideOverlay(elements.settingsOverlay));

elements.exportBtn.addEventListener('click', () => {
    elements.saveCodeField.value = btoa(JSON.stringify(getSaveObject()));
    showOverlay(elements.savePopup);
});

elements.importBtn.addEventListener('click', () => showOverlay(elements.loadPopup));

elements.confirmLoadBtn.addEventListener('click', () => {
    const code = elements.loadCodeField.value.trim();
    if (!code) return;
    try {
        const data = JSON.parse(atob(code));
        applySaveData(data);
        saveGame();
        hideOverlay(elements.loadPopup);
        hideOverlay(elements.settingsOverlay);
        alert("Spielstand geladen!");
    } catch (e) {
        alert("Ungültiger Code!");
    }
});

elements.resetBtn.addEventListener('click', () => {
    if (confirm("Wirklich alles löschen? Fortschritt geht verloren!")) {
        isResetting = true;
        localStorage.removeItem('kekslefant_save');
        location.reload();
    }
});

[elements.closeSave, elements.closeLoad].forEach(btn => {
    btn.addEventListener('click', () => {
        hideOverlay(elements.savePopup);
        hideOverlay(elements.loadPopup);
    });
});

setInterval(() => {
    const now = Date.now();
    const deltaTime = (now - state.lastUpdate) / 1000;
    
    if (state.totalCPS > 0) {
        state.cookies += state.totalCPS * deltaTime;
        updateUI();
    }
    state.lastUpdate = now;
}, 100);

setInterval(saveGame, 30000);
window.addEventListener('beforeunload', saveGame);

initShop();
loadGame();
updateUI();