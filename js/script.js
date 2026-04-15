let isResetting = false;
let inputBuffer = "";
const targetWord = "wurst";

const state = {
    cookies: new Big(0),
    totalCPS: new Big(0),
    clickValue: new Big(1),
    isWurstMode: false,
    lastUpdate: Date.now()
};

const factoryData = {
    huette: {
        name: "Hefe Hütte",
        basePrice: new Big(10),
        cps: new Big(1),
        icon: "img/Huette.png"
    },
    kristall: {
        name: "Kristall-Konditorei",
        basePrice: new Big(100),
        cps: new Big(10),
        icon: "img/Kristall.png"
    },
    plasma: {
        name: "Plasma-Keks-Generator",
        basePrice: new Big(1000),
        cps: new Big(50),
        icon: "img/Plasma.png"
    },
    labor: {
        name: "Licht-Keks-Labor",
        basePrice: new Big(10000),
        cps: new Big(100),
        icon: "img/Labor.png"
    },
    former: {
        name: "Makro-Keks-Former",
        basePrice: new Big(1000000),
        cps: new Big(1000),
        icon: "img/Former.png"
    },
    ofen: {
        name: "Schwerkraft-Keks-Ofen",
        basePrice: new Big(100000000),
        cps: new Big(100000),
        icon: "img/Ofen.png"
    },
    sonde: {
        name: "Back-Sonde",
        basePrice: new Big(1000000000),
        cps: new Big(1000000),
        icon: "img/Sonde.png"
    }
};

const upgradeData = {

};
const factoryList = {};
const upgradesList = {};
const visibleupgrades = new Set();
let currentUpgradeToBuy = null;

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
    closeLoad: document.getElementById('close-load'),
    upgradePopup: document.getElementById('upgrade-popup'),
    closeUpgradePop: document.getElementById('close-upgrade-pop'),
    confirmUpgradeBuy: document.getElementById('confirm-upgrade-buy'),
    upPopName: document.getElementById('up-pop-name'),
    upPopIcon: document.getElementById('up-pop-icon'),
    upPopDesc: document.getElementById('up-pop-desc'),
    upPopPrice: document.getElementById('up-pop-price')
};

function formatNumber(bigNum) {
    if (!(bigNum instanceof Big)) bigNum = new Big(bigNum || 0);
    if (bigNum.lt(1000)) return bigNum.toFixed(0);

    const suffixes = [
        "", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", 
        "Dc", "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Ocd", "Nod", 
        "Vg", "Uvg", "Dvg", "Tvg", "Qavg", "Qivg", "Sxvg", "Spvg", "Ocvg", "Novg"
    ];

    const parts = bigNum.toExponential().split('e');
    const exponent = parseInt(parts[1]);
    const suffixIndex = Math.floor(exponent / 3);

    if (suffixIndex >= suffixes.length) {
        return bigNum.toExponential(2).replace('+', '');
    }

    const shortValue = bigNum.div(new Big(10).pow(suffixIndex * 3)).toFixed(2);
    return shortValue + " " + suffixes[suffixIndex];
}

function calculateTotalCPS() {
    let total = new Big(0);
    for (const key in factoryList) {
        const item = factoryList[key];
        total = total.plus(new Big(item.amount).times(item.cps).times(item.multiplier));
    }
    state.totalCPS = total;
}

function updateUI() {
    elements.cookieDisplay.innerText = formatNumber(state.cookies);
    elements.cpsDisplay.innerText = formatNumber(state.totalCPS);

    for (const key in factoryList) {
        const upg = factoryList[key];
        const currentCPS = upg.cps.times(upg.multiplier);

        upg.dom.amount.innerText = formatNumber(upg.amount);
        upg.dom.price.innerText = formatNumber(upg.price);
        upg.dom.desc.innerText = `+${formatNumber(currentCPS)} Cookies/s`;
        upg.dom.btn.disabled = state.cookies.lt(upg.price);
    }
    checkUpgradeUnlocks();
}

function buyFactory(key) {
    const upg = factoryList[key];
    if (state.cookies.gte(upg.price)) {
        state.cookies = state.cookies.minus(upg.price);
        upg.amount = upg.amount.plus(1);
        upg.price = upg.basePrice.times(new Big(1.15).pow(Number(upg.amount.toString()))).round(0, 0);

        calculateTotalCPS();
        updateUI();
        saveGame();
    }
}

function buyUpgrade(key) {
    const spec = upgradesList[key];
    if (state.cookies.gte(spec.price) && !spec.bought) {
        state.cookies = state.cookies.minus(spec.price);
        spec.bought = true;

        const factor = new Big(spec.factor || 2);
        const boost = new Big(spec.boost || 1);

        switch (spec.type) {
            case "clickBoost":
                state.clickValue = state.clickValue.plus(boost);
                break;
            
            case "clickMultiplier":
                state.clickValue = state.clickValue.times(factor);
                break;

            case "multiplier":
                factoryList[spec.target].multiplier = factoryList[spec.target].multiplier.times(factor);
                break;

            case "globalMultiplier":
                Object.keys(factoryData.multiplier).forEach(m => {
                    factoryList[m].multiplier = factoryList[m].multiplier.times(factor);
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
    const multipliers = {};
    for (const key in factoryList) {
        upgradeAmounts[key] = factoryList[key].amount.toString();
        multipliers[key] = factoryList[key].multiplier.toString();
    }
    const boughtSpecials = {};
    for (const key in upgradesList) boughtSpecials[key] = upgradesList[key].bought;

    return {
        cookies: state.cookies.toString(),
        clickValue: state.clickValue.toString(),
        multipliers,
        upgradeAmounts,
        boughtSpecials
    };
}

function applySaveData(data) {
    try {
        state.cookies = new Big(data.cookies || 0);
        state.clickValue = new Big(data.clickValue || 1);

        if (data.upgradeAmounts) {
            for (const key in data.upgradeAmounts) {
                if (factoryList[key]) {
                    const amount = new Big(data.upgradeAmounts[key]);
                    factoryList[key].amount = amount;
                    factoryList[key].price = factoryList[key].basePrice.times(new Big(1.15).pow(Number(amount.toString()))).round(0, 0);
                }
            }
        }
        if (data.multipliers) {
            for (const key in data.multipliers) {
                if (factoryList[key]) factoryList[key].multiplier = new Big(data.multipliers[key]);
            }
        }
        if (data.boughtSpecials) {
            for (const key in data.boughtSpecials) {
                if (data.boughtSpecials[key] && upgradesList[key]) {
                    upgradesList[key].bought = true;
                    upgradesList[key].dom?.btn?.remove();
                }
            }
        }
        calculateTotalCPS();
        updateUI();
    } catch (e) {
        console.error(e);
    }
}

function saveGame() {
    if (isResetting) return;

    const hasNoFactory = Object.values(factoryList).every(factory => factory.amount.eq(0));

    if (state.cookies.eq(0) && hasNoFactory) {
        return; 
    }

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
                        <span id="${key}-price">${data.basePrice.toString()}</span> 
                        <img src="img/Keks.svg" class="factory-price-icon">
                    </span>
                </button>
            </div>`;

        factoryContainer.appendChild(itemDiv);
        factoryList[key] = {
            ...data,
            amount: 0,
            price: data.basePrice,
            multiplier: new Big(1),
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

        if (state.cookies.gte(new Big(data.price).times(0.8))) {
            const btn = document.createElement('button');
            btn.className = 'upgrade-unlock-btn';
            btn.innerHTML = `<img src="${data.icon}" class="btn-icon">`;

            upgradeContainer.appendChild(btn);
            visibleupgrades.add(key);

            upgradesList[key] = {
                ...data,
                price: new Big(data.price),
                bought: false,
                dom: { btn }
            };

            btn.addEventListener('click', () => {
                currentUpgradeToBuy = key;
                elements.upPopName.innerText = data.name;
                elements.upPopIcon.src = data.icon;
                elements.upPopDesc.innerText = data.desc;
                elements.upPopPrice.innerText = `Preis: ${formatNumber(new Big(data.price))} Cookies`;
                elements.confirmUpgradeBuy.disabled = state.cookies.lt(new Big(data.price));
                showOverlay(elements.upgradePopup);
            });
        }
    }
}

elements.cookieBtn.addEventListener('click', (e) => {
    state.cookies = state.cookies.plus(state.clickValue);
    updateUI();
    createParticle(e.clientX, e.clientY);
    createFloatingText(e.clientX, e.clientY);
});

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'cookie-particle';
    particle.style.backgroundImage = state.isWurstMode ? "url('img/Logo.png')" : "url('img/Keks.svg')";
    const dX = (Math.random() - 0.5) * 300;
    const dY = (Math.random() - 0.5) * 300;
    particle.style.left = `${x - 15}px`;
    particle.style.top = `${y - 15}px`;
    particle.style.setProperty('--x', `${dX}px`);
    particle.style.setProperty('--y', `${dY}px`);
    particle.style.setProperty('--r', `${Math.random() * 360}deg`);
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
}

function createFloatingText(x, y) {
    const text = document.createElement('div');
    text.className = 'click-value-float';
    text.innerText = `+${formatNumber(state.clickValue)}`;
    text.style.left = `${x}px`;
    text.style.top = `${y}px`;
    document.body.appendChild(text);
    setTimeout(() => text.remove(), 1000);
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

elements.closeUpgradePop.addEventListener('click', () => hideOverlay(elements.upgradePopup));
elements.confirmUpgradeBuy.addEventListener('click', () => {
    if (currentUpgradeToBuy && state.cookies.gte(upgradesList[currentUpgradeToBuy].price)) {
        buyUpgrade(currentUpgradeToBuy);
        hideOverlay(elements.upgradePopup);
        currentUpgradeToBuy = null;
    }
});

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === targetWord[inputBuffer.length]) inputBuffer += key;
    else inputBuffer = (key === 'w') ? 'w' : "";
    if (inputBuffer === targetWord) {
        state.isWurstMode = !state.isWurstMode;
        elements.cookieBtn.src = state.isWurstMode ? "img/Logo.png" : "img/Keks.svg";
        inputBuffer = "";
    }
});

setInterval(() => {
    const now = Date.now();
    const deltaTime = new Big(now - state.lastUpdate).div(1000);
    if (state.totalCPS.gt(0)) {
        state.cookies = state.cookies.plus(state.totalCPS.times(deltaTime));
        updateUI();
    }
    state.lastUpdate = now;
}, 100);

setInterval(saveGame, 30000);
window.addEventListener('beforeunload', saveGame);

initShop();
loadGame();
updateUI();