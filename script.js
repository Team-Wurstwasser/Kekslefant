let isResetting = false;
let inputBuffer = "";
const targetWord = "wurst";

const state = {
    cookies: 0,
    totalCPS: 0,
    clickValue: 1,
    isWurstMode: false,
    multipliers: {
        snail: 1,
        elephant: 1,
        wurst: 1,
    },
    lastUpdate: Date.now()
};

const factoryData = {
    snail: {
        name: "Schnecken-Zucht",
        basePrice: 10,
        cps: 1,
        icon: "img/Schnecke.png"
    },
    elephant: {
        name: "Elefanten-Fabrik",
        basePrice: 100,
        cps: 10,
        icon: "img/Elefant.png"
    },
    wurst: {
        name: "Wurst-Fabrik",
        basePrice: 1000,
        cps: 50,
        icon: "img/Logo.png"
    }
};

const upgradeData = {
    stronger_fingers: {
        name: "Starke Finger",
        desc: "Klicks bringen +1", 
        price: 50,
        type: "clickBoost", 
        boost: 1,
        icon: "img/Keks.svg"
    },
    click_hammer: {
        name: "Keks-Hammer",
        desc: "Jeder Klick ist 5x so stark",
        price: 5000,
        type: "clickMultiplier",
        factor: 5,
        icon: "img/Logo.png"
    },
    snail_turbo: {
        name: "Turbo-Schnecken",
        desc: "Schnecken sind 3x so schnell",
        price: 250, 
        type: "multiplier",
        target: "snail", 
        factor: 3,
        icon: "img/Schnecke.png"
    },
    elephant_energy: {
        name: "Elefanten-Energy",
        desc: "Elefanten arbeiten 2x so hart",
        price: 2500,
        type: "multiplier",
        target: "elephant",
        factor: 2,
        icon: "img/Logo.png"
    },
    wurst_overclock: {
        name: "Wurst-Übertaktung",
        desc: "Die Wurst-Fabrik läuft auf 400%",
        price: 25000,
        type: "multiplier",
        target: "wurst",
        factor: 4,
        icon: "img/Logo.png"
    },
    sugar_rush: {
        name: "Zuckerschock",
        desc: "ALLES produziert 2x so viel",
        price: 100000,
        type: "globalMultiplier",
        factor: 2,
        icon: "img/Logo.png"
    }
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

function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toString();

    const suffixes = [
        "", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", 
        "Dc", "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Ocd", "Nod", 
        "Vg", "Uvg", "Dvg", "Tvg", "Qavg", "Qivg", "Sxvg", "Spvg", "Ocvg", "Novg"
    ];

    const suffixNum = Math.floor(Math.log10(num) / 3);

    if (suffixNum >= suffixes.length) {
        return num.toExponential(2).replace('+', ' ');
    }

    let shortValue = (num / Math.pow(1000, suffixNum));
    
    return shortValue.toFixed(2).replace(/\.00$/, '') + " " + suffixes[suffixNum];
}

function calculateTotalCPS() {
    state.totalCPS = Object.keys(factoryData).reduce((acc, key) => {
        const upg = factoryList[key];
        return acc + (upg.amount * upg.cps * (state.multipliers[key] || 1));
    }, 0);
}

function updateUI() {
    elements.cookieDisplay.innerText = formatNumber(state.cookies);
    elements.cpsDisplay.innerText = formatNumber(state.totalCPS);

    for (const key in factoryList) {
        const upg = factoryList[key];
        const currentMulti = state.multipliers[key] || 1;
        const effectiveCPS = upg.cps * currentMulti;

        upg.dom.amount.innerText = upg.amount;    
        upg.dom.price.innerText = formatNumber(upg.price);    
        upg.dom.desc.innerText = `+${formatNumber(effectiveCPS)} Cookies/s`;

        upg.dom.btn.disabled = state.cookies < upg.price;
    }

    checkUpgradeUnlocks();
}

function buyFactory(key) {
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

function buyUpgrade(key) {
    const spec = upgradesList[key];
    if (state.cookies >= spec.price && !spec.bought) {
        state.cookies -= spec.price;
        spec.bought = true;

        switch (spec.type) {
            case "clickBoost":
                state.clickValue += (spec.boost || 1);
                break;
            
            case "clickMultiplier":
                state.clickValue *= (spec.factor || 1);
                break;

            case "multiplier":
                state.multipliers[spec.target] *= (spec.factor || 2);
                break;

            case "globalMultiplier":
                Object.keys(state.multipliers).forEach(m => {
                    state.multipliers[m] *= (spec.factor || 2);
                });
                break;
        }

        spec.dom.btn.remove(); 
        calculateTotalCPS();
        updateUI();
        saveGame();
    }
}

function getSaveData() {
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
    localStorage.setItem('kekslefant_save', JSON.stringify(getSaveData()));
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
                    <span class="factory-desc"></span> </div>
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
                amount: document.getElementById(`${key}-amount`),
                desc: itemDiv.querySelector('.factory-desc')
            }
        };
        factoryList[key].dom.btn.addEventListener('click', () => buyFactory(key));
    }
}

function checkUpgradeUnlocks() {
    const upgradeContainer = document.getElementById('upgrade-list');

    for (const [key, data] of Object.entries(upgradeData)) {
        if (upgradesList[key]?.bought || visibleupgrades.has(key)) continue;

        if (state.cookies >= data.price * 0.8) {
            const btn = document.createElement('button');
            btn.className = 'upgrade-unlock-btn';
            btn.title = `${data.name}: ${data.desc} - Kosten: ${formatNumber(data.price)}`;
            btn.innerHTML = `<img src="${data.icon}" class="btn-icon">`;
            
            upgradeContainer.appendChild(btn);
            visibleupgrades.add(key);

            upgradesList[key] = {
                ...data,
                price: data.price,
                bought: false,
                dom: { btn: btn }
            };

            btn.addEventListener('click', () => buyUpgrade(key));
        }
    }
}

elements.cookieBtn.addEventListener('click', (e) => {
    state.cookies += state.clickValue;
    updateUI();
    createParticle(e.clientX, e.clientY);
    createFloatingText(e.clientX, e.clientY);
});

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'cookie-particle';  
    
    if (state.isWurstMode) {
        particle.style.backgroundImage = "url('img/Logo.png')";
    } else {
        particle.style.backgroundImage = "url('img/Keks.svg')";
    }

    const destinationX = (Math.random() - 0.5) * 300;
    const destinationY = (Math.random() - 0.5) * 300;
    const rotation = Math.random() * 360;
    particle.style.left = `${x - 15}px`; 
    particle.style.top = `${y - 15}px`;
    particle.style.setProperty('--x', `${destinationX}px`);
    particle.style.setProperty('--y', `${destinationY}px`);
    particle.style.setProperty('--r', `${rotation}deg`);
    document.body.appendChild(particle);
    setTimeout(() => {
        particle.remove();
    }, 800);
}

function createFloatingText(x, y) {
    const text = document.createElement('div');
    text.className = 'click-value-float';
    text.innerText = `+${formatNumber(state.clickValue)}`;
    text.style.left = `${x}px`;
    text.style.top = `${y}px`;
    document.body.appendChild(text);
    setTimeout(() => {
        text.remove();
    }, 1000);
}

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
    elements.saveCodeField.value = btoa(JSON.stringify(getSaveData()));
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

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    if (key === targetWord[inputBuffer.length]) {
        inputBuffer += key;
    } else {
        inputBuffer = (key === 'w') ? 'w' : "";
    }

    if (inputBuffer === targetWord) {
        state.isWurstMode = !state.isWurstMode;
        
        elements.cookieBtn.src = state.isWurstMode ? "img/Logo.png" : "img/Keks.svg";
        
        inputBuffer = "";
    }
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