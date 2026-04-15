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
        basePrice: new Big(15),
        cps: new Big(1),
        icon: "img/Huette.png"
    },
    kristall: {
        name: "Kristall-Konditorei",
        basePrice: new Big(100),
        cps: new Big(5),
        icon: "img/Kristall.png"
    },
    plasma: {
        name: "Plasma-Keks-Generator",
        basePrice: new Big(1100),
        cps: new Big(40),
        icon: "img/Plasma.png"
    },
    labor: {
        name: "Licht-Keks-Labor",
        basePrice: new Big(12000),
        cps: new Big(200),
        icon: "img/Labor.png"
    },
    former: {
        name: "Makro-Keks-Former",
        basePrice: new Big(130000),
        cps: new Big(1000),
        icon: "img/Former.png"
    },
    ofen: {
        name: "Schwerkraft-Ofen",
        basePrice: new Big(1400000),
        cps: new Big(6500),
        icon: "img/Ofen.png"
    },
    sonde: {
        name: "Back-Sonde",
        basePrice: new Big(20000000),
        cps: new Big(40000),
        icon: "img/Sonde.png"
    }
};

const upgradeData = {
    click_1: {
        name: "Verstärkter Zeigefinger",
        type: "clickBoost",
        boost: new Big(1),
        price: new Big(50),
        icon: "img/Keks.svg",
        desc: "Jeder Klick bringt +1 Keks mehr."
    },
    click_2: {
        name: "Titan-Mausrad",
        type: "clickMultiplier",
        factor: new Big(2),
        price: new Big(5000),
        icon: "img/Keks.svg",
        desc: "Verdoppelt die Effizienz deiner Klicks!"
    },
    click_3: {
        name: "Diamant-Cursor",
        type: "clickMultiplier",
        factor: new Big(5),
        price: new Big(2500000),
        icon: "img/Keks.svg",
        desc: "Deine Klicks sind nun 5-mal so mächtig."
    },
    click_4: {
        name: "Quanten-Clicker",
        type: "clickMultiplier",
        factor: new Big(10),
        price: new Big(1000000000),
        icon: "img/Keks.svg",
        desc: "Ein Klick, tausend Realitäten. Klick-Wert x10."
    },
    huette_1: {
        name: "Bio-Hefe",
        type: "multiplier",
        target: "huette",
        price: new Big(500),
        factor: new Big(2),
        icon: "img/Huette.png",
        desc: "Die Hefe-Hütten produzieren doppelt so schnell."
    },
    huette_2: {
        name: "Hefe-Mutation",
        type: "multiplier",
        target: "huette",
        price: new Big(15000),
        factor: new Big(4),
        icon: "img/Huette.png",
        desc: "Die Hefe ist nun intelligent. Hütten produzieren 4-mal so viel."
    },
    huette_3: {
        name: "Hütten-Automatik",
        type: "multiplier",
        target: "huette",
        price: new Big(1000000),
        factor: new Big(10),
        icon: "img/Huette.png",
        desc: "Vollautomatische Teigführung. Hütten x10."
    },
    kristall_1: {
        name: "Hochglanz-Prismen",
        type: "multiplier",
        target: "kristall",
        price: new Big(5000),
        factor: new Big(2),
        icon: "img/Kristall.png",
        desc: "Kristall-Konditoreien glänzen mit 100% mehr Ertrag."
    },
    kristall_2: {
        name: "Zucker-Diamanten",
        type: "multiplier",
        target: "kristall",
        price: new Big(250000),
        factor: new Big(4),
        icon: "img/Kristall.png",
        desc: "Konditoreien produzieren 4-mal so viel."
    },
    kristall_3: {
        name: "Reinstkristall-Gitter",
        type: "multiplier",
        target: "kristall",
        price: new Big(25000000),
        factor: new Big(8),
        icon: "img/Kristall.png",
        desc: "Perfekte Molekularstruktur. Kristall-Konditoreien x8."
    },
    plasma_1: {
        name: "Ionen-Beschleuniger",
        type: "multiplier",
        target: "plasma",
        price: new Big(50000),
        factor: new Big(2),
        icon: "img/Plasma.png",
        desc: "Stabilisiert den Plasma-Fluss für doppelte Produktion."
    },
    plasma_2: {
        name: "Dunkle Materie Kern",
        type: "multiplier",
        target: "plasma",
        price: new Big(3000000),
        factor: new Big(4),
        icon: "img/Plasma.png",
        desc: "Plasma-Generatoren erreichen die kritische Masse. Output x4."
    },
    plasma_3: {
        name: "Supernova-Einspeisung",
        type: "multiplier",
        target: "plasma",
        price: new Big(150000000),
        factor: new Big(10),
        icon: "img/Plasma.png",
        desc: "Direkte Energie aus dem Kern eines Sterns. Plasma x10."
    },
    labor_1: {
        name: "Quanten-Backofen",
        type: "multiplier",
        target: "labor",
        price: new Big(500000),
        factor: new Big(2),
        icon: "img/Labor.png",
        desc: "Licht-Keks-Labore verdoppeln ihren Output."
    },
    labor_2: {
        name: "Zeitkrümmungs-Backen",
        type: "multiplier",
        target: "labor",
        price: new Big(40000000),
        factor: new Big(4),
        icon: "img/Labor.png",
        desc: "Die Kekse sind fertig, bevor der Teig existiert. Labor x4."
    },
    labor_3: {
        name: "Parallelwelt-Labor",
        type: "multiplier",
        target: "labor",
        price: new Big(2000000000),
        factor: new Big(10),
        icon: "img/Labor.png",
        desc: "Importiert Kekse aus Dimensionen, in denen es nur Kekse gibt. x10."
    },
    former_1: {
        name: "Atomare Symmetrie",
        type: "multiplier",
        target: "former",
        price: new Big(50000000),
        factor: new Big(2),
        icon: "img/Former.png",
        desc: "Makro-Keks-Former arbeiten nun doppelt so effizient."
    },
    former_2: {
        name: "Fraktale Geometrie",
        type: "multiplier",
        target: "former",
        price: new Big(5000000000),
        factor: new Big(4),
        icon: "img/Former.png",
        desc: "Die Formgebung ist nun 4-mal effizienter."
    },
    ofen_1: {
        name: "Ereignishorizont-Grill",
        type: "multiplier",
        target: "ofen",
        price: new Big(5000000000),
        factor: new Big(2),
        icon: "img/Ofen.png",
        desc: "Schwerkraft-Öfen nutzen die Krümmung für doppeltes Backtempo."
    },
    ofen_2: {
        name: "Singularitäts-Hitze",
        type: "multiplier",
        target: "ofen",
        price: new Big(250000000000),
        factor: new Big(4),
        icon: "img/Ofen.png",
        desc: "Die Hitze eines sterbenden Sterns. Schwerkraft-Öfen x4."
    },
    sonde_1: {
        name: "Deep-Space-Backen",
        type: "multiplier",
        target: "sonde",
        price: new Big(50000000000),
        factor: new Big(2),
        icon: "img/Sonde.png",
        desc: "Back-Sonden finden effizientere Routen im All (x2)."
    },
    sonde_2: {
        name: "Galaktisches Netzwerk",
        type: "multiplier",
        target: "sonde",
        price: new Big(1000000000000),
        factor: new Big(5),
        icon: "img/Sonde.png",
        desc: "Ein intergalaktisches Liefernetzwerk. Sonden-Effizienz x5."
    },
    global_1: {
        name: "Keks-Imperium",
        type: "globalMultiplier",
        factor: new Big(1.5),
        price: new Big(1000000000000),
        icon: "img/Logo.png",
        desc: "Erhöht die Produktion ALLER Gebäude um 50%!"
    },
    global_2: {
        name: "Keks-Relativität",
        type: "globalMultiplier",
        factor: new Big(2),
        price: new Big(50000000000000),
        icon: "img/Logo.png",
        desc: "E=mc²? Nein, Energie = mehr Cookies! Alles wird verdoppelt."
    },
    global_3: {
        name: "Universelle Keks-Konstante",
        type: "globalMultiplier",
        factor: new Big(5),
        price: new Big(1000000000000000),
        icon: "img/Logo.png",
        desc: "Das Universum besteht nun zu 5% aus Keksteig. Alles x5."
    }
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

function formatNumber(num) {
    if (!(num instanceof Big)) num = new Big(num || 0);
    if (num.lt(1000)) return num.toFixed(0);

    const suffixes = [
        "", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", 
        "Dc", "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Ocd", "Nod", 
        "Vg", "Uvg", "Dvg", "Tvg", "Qavg", "Qivg", "Sxvg", "Spvg", "Ocvg", "Novg"
    ];

    const parts = num.toExponential().split('e');
    const exponent = parseInt(parts[1]);
    const suffixIndex = Math.floor(exponent / 3);

    if (suffixIndex >= suffixes.length) {
        return num.toExponential(2).replace('+', '');
    }

    const shortValue = num.div(new Big(10).pow(suffixIndex * 3)).toFixed(2);
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
        upg.price = upg.basePrice.times(
            new Big(1.15).pow(parseInt(upg.amount.toString()))
        ).round(0, 0);

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
                Object.keys(factoryList).forEach(m => {
                    factoryList[m].multiplier = factoryList[m].multiplier.times(factor);
                });
                break;
        }

        if (spec.dom.btn) {
            spec.dom.btn.remove();
            spec.dom.btn = null;
        }
        visibleupgrades.delete(key);

        calculateTotalCPS();
        updateUI();
        saveGame();
    }
}

function getSaveData() {
    return {
        stats: {
            cookies: state.cookies.toString(),
            clickValue: state.clickValue.toString()
        },
        factories: Object.keys(factoryList).reduce((all, key) => {
            all[key] = {
                a: factoryList[key].amount.toString(),
                m: factoryList[key].multiplier.toString()
            };
            return all;
        }, {}),
        upgrades: {
            bought: Object.keys(upgradesList).filter(key => upgradesList[key].bought),
            visible: Array.from(visibleupgrades)
        }
    };
}

function applySaveData(data) {
    if (!data) return;

    try {
        state.cookies = new Big(data.stats?.cookies || 0);
        state.clickValue = new Big(data.stats?.clickValue || 1);

        if (data.factories) {
            for (const key in data.factories) {
                if (factoryList[key]) {
                    const fData = data.factories[key];
                    factoryList[key].amount = new Big(fData.a || 0);
                    factoryList[key].multiplier = new Big(fData.m || 1);
                    factoryList[key].price = factoryList[key].basePrice.times(
                        new Big(1.15).pow(parseInt(factoryList[key].amount.toString()))
                    ).round(0, 0);
                }
            }
        }

        if (data.upgrades?.bought) {
            data.upgrades.bought.forEach(key => {
                if (upgradesList[key]) {
                    upgradesList[key].bought = true;
                }
            });
        }

        visibleupgrades.clear();
        if (data.upgrades?.visible) {
            data.upgrades.visible.forEach(key => {
                if (upgradesList[key] && !upgradesList[key].bought) {
                    visibleupgrades.add(key);
                }
            });
        }

        calculateTotalCPS();
        updateUI();
    } catch (e) {
        console.error("Fehler beim Laden:", e);
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
            amount: new Big(0),
            price: new Big(data.basePrice),
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

function initUpgrades() {
    for (const [key, data] of Object.entries(upgradeData)) {
        upgradesList[key] = {
            ...data,
            price: new Big(data.price),
            bought: false,
            dom: { btn: null }
        };
    }
}

function checkUpgradeUnlocks() {
    const upgradeContainer = document.getElementById('upgrade-list');

    for (const key in upgradesList) {
        const spec = upgradesList[key];
        
        if (spec.bought) continue;

        const shouldBeVisible = visibleupgrades.has(key) || state.cookies.gte(spec.price.times(0.8));

        if (shouldBeVisible && !spec.dom.btn) {
            const btn = document.createElement('button');
            btn.className = 'upgrade-unlock-btn';
            btn.innerHTML = `<img src="${spec.icon}" class="btn-icon">`;

            upgradeContainer.appendChild(btn);
            visibleupgrades.add(key);
            spec.dom.btn = btn;

            btn.addEventListener('click', () => {
                currentUpgradeToBuy = key;
                elements.upPopName.innerText = spec.name;
                elements.upPopIcon.src = spec.icon;
                elements.upPopDesc.innerText = spec.desc;
                elements.upPopPrice.innerText = `Preis: ${formatNumber(spec.price)} Cookies`;
                elements.confirmUpgradeBuy.disabled = state.cookies.lt(spec.price);
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
initUpgrades();
loadGame();
updateUI();
