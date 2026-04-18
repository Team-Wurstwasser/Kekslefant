let isResetting = false;
let inputBuffer = "";
const targetWord = "wurst";

const state = {
    cookies: new Decimal(0),
    clickValue: new Decimal(1),
    rebirthPoints: new Decimal(0),
    totalRebirths: new Decimal(0),
    lifetimeCookies: new Decimal(0),
    lifetimeRebirthPoints: new Decimal(0),
    isWurstMode: false,
    lastUpdate: Date.now()
};

const factoryData = {};
const upgradeData = {};
const rebirthTreeData = {};
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
    rebirthInfo: document.getElementById('rebirth-info'),
    rebirthBtn: document.getElementById('rebirth-btn'),
    rebirthTreeOverlay: document.getElementById('rebirth-tree-overlay'),
    closeRebirthTree: document.getElementById('close-rebirth-tree'),
    rebirthTreePoints: document.getElementById('rebirth-tree-points'),
    rebirthTreeList: document.getElementById('rebirth-tree-list'),
    upgradePopup: document.getElementById('upgrade-popup'),
    closeUpgradePop: document.getElementById('close-upgrade-pop'),
    confirmUpgradeBuy: document.getElementById('confirm-upgrade-buy'),
    upPopName: document.getElementById('up-pop-name'),
    upPopIcon: document.getElementById('up-pop-icon'),
    upPopDesc: document.getElementById('up-pop-desc'),
    upPopPriceBtn: document.getElementById('up-pop-price-btn'),
    factoryContainer: document.getElementById('factory-list'),
    upgradeContainer: document.getElementById('upgrade-list')
};

function formatNumber(num) {
    if (!(num instanceof Decimal)) num = new Decimal(num || 0);
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
        return num.toExponential(2).replace('+', '').replace('.', ',');
    }

    const shortValue = num.div(new Decimal(10).pow(suffixIndex * 3)).toFixed(2).replace('.', ',');
    return shortValue + " " + suffixes[suffixIndex];
}

function formatValue(num) {
    if (!(num instanceof Decimal)) num = new Decimal(num || 0);

    if (num.lt(1000)) {
        return num.toFixed(2).replace('.', ',');
    }

    return formatNumber(num).replace('.', ',');
}

function getRebirthPoints() {
    const totalPointsPossible = state.lifetimeCookies.div(rebirthConfig.baseCookies).log(10).div(new Decimal(rebirthConfig.pointsMultiplier).log(10)).floor();
    return totalPointsPossible.gt(state.lifetimeRebirthPoints) ? totalPointsPossible.minus(state.lifetimeRebirthPoints)  : new Decimal(0);
}

function getRebirthMultiplier() {
    return new Decimal(1).plus(state.lifetimeRebirthPoints.times(rebirthConfig.bonusPerPoint));
}

function getFactoryCPS() {
    let total = new Decimal(0);
    for (const key in factoryData) {
        const item = factoryData[key];
        total = total.plus(new Decimal(item.amount).times(item.cps).times(item.multiplier));
    }
    return total.times(getRebirthMultiplier());
}

function getClickValue() {
    return state.clickValue.times(getRebirthMultiplier());
}

function performRebirth() {
    const points = getRebirthPoints();

    if (!confirm(`Wirklich Rebirth ausführen? Du erhältst +${points.toString()} Rebirth-Punkte und setzt den normalen Fortschritt zurück.`)) {
        return;
    }

    state.rebirthPoints = state.rebirthPoints.plus(points);
    state.totalRebirths = state.totalRebirths.plus(1);
    state.lifetimeRebirthPoints = state.lifetimeRebirthPoints.plus(points);
    state.cookies = new Decimal(0);
    state.clickValue = new Decimal(1);

    for (const key in factoryData) {
        factoryData[key].amount = new Decimal(0);
        factoryData[key].multiplier = new Decimal(1);
        factoryData[key].price = new Decimal(factoryData[key].basePrice);
    }

    for (const key in upgradeData) {
        const upg = upgradeData[key];
        upg.bought = false;
        if (upg.dom.btn) {
            upg.dom.btn.remove();
            upg.dom.btn = null;
        }
    }

    visibleupgrades.clear();
    updateUI();
    saveGame();
    updateRebirthTree();
    showOverlay(elements.rebirthTreeOverlay);
}

function updateUI() {
    elements.cookieDisplay.innerText = formatNumber(state.cookies);
    elements.cpsDisplay.innerText = formatValue(getFactoryCPS());
    const rebirthMultiplier = getRebirthMultiplier();

    const rebirthBonusPercent = state.rebirthPoints.times(rebirthConfig.bonusPerPoint).times(100).toDecimalPlaces(0, Decimal.ROUND_DOWN);
    const potentialGain = getRebirthPoints();
    elements.rebirthInfo.innerText = `Rebirth: ${formatNumber(state.lifetimeRebirthPoints)} Punkte (+${rebirthBonusPercent.toString()}%)`;
    elements.rebirthBtn.innerText = `Rebirth (+${formatNumber(potentialGain)})`;
    elements.rebirthBtn.disabled = potentialGain.lte(0);

    for (const key in factoryData) {
        const upg = factoryData[key];
        const currentCPS = upg.cps.times(upg.multiplier).times(rebirthMultiplier);

        upg.dom.amount.innerText = formatNumber(upg.amount);
        upg.dom.price.innerText = formatNumber(upg.price);
        upg.dom.desc.innerText = `+${formatValue(currentCPS)} Cookies/s`;
        upg.dom.btn.disabled = state.cookies.lt(upg.price);
    }

    if (elements.upgradePopup.style.display === 'flex') {
        updateUpgradePopupButton();
    }
    checkUpgradeUnlocks();
}

function updateUpgradePopupButton() {
    const selectedUpgrade = currentUpgradeToBuy ? upgradeData[currentUpgradeToBuy] : null;
    elements.confirmUpgradeBuy.disabled = !selectedUpgrade || state.cookies.lt(selectedUpgrade.price);
}

function updateRebirthTree() {
    elements.rebirthTreePoints.innerText = `Verfügbare Punkte: ${formatNumber(state.rebirthPoints)}`;

    for (const key in rebirthTreeData) {
        const upg = rebirthTreeData[key];
        if (!upg.dom?.btn) continue;

        const prereqsMet = (upg.prereqs || []).every(reqKey => rebirthTreeData[reqKey]?.bought);
        const canBuy = !upg.bought && prereqsMet && state.rebirthPoints.gte(upg.cost);

        upg.dom.btn.classList.toggle('owned', upg.bought);
        upg.dom.btn.classList.toggle('locked', !upg.bought && !prereqsMet);
        upg.dom.btn.classList.toggle('available', canBuy);
        upg.dom.btn.disabled = upg.bought || !prereqsMet || state.rebirthPoints.lt(upg.cost);
        upg.dom.status.innerText = upg.bought ? 'Gekauft' : (prereqsMet ? `Kosten: ${formatNumber(upg.cost)}` : `Benötigt: ${upg.prereqs.map(req => rebirthTreeData[req]?.name).filter(Boolean).join(', ')}`);
    }
}

function checkUpgradeUnlocks() {
    for (const key in upgradeData) {
        const upg = upgradeData[key];
        
        if (upg.bought) continue;

        const shouldBeVisible = visibleupgrades.has(key) || state.cookies.gte(upg.price.times(0.8));

        if (shouldBeVisible && !upg.dom.btn) {
            const btn = document.createElement('button');
            btn.className = 'upgrade-unlock-btn';
            btn.innerHTML = `<img src="${upg.icon}" class="btn-icon">`;

            elements.upgradeContainer.appendChild(btn);
            visibleupgrades.add(key);
            upg.dom.btn = btn;

            btn.addEventListener('click', () => {
                currentUpgradeToBuy = key;
                elements.upPopName.innerText = upg.name;
                elements.upPopIcon.src = upg.icon;
                elements.upPopDesc.innerText = upg.desc;
                elements.upPopPriceBtn.innerText = formatNumber(upg.price);
                updateUpgradePopupButton();
                showOverlay(elements.upgradePopup);
            });
        }
    }
}

function buyFactory(key) {
    const upg = factoryData[key];
    if (state.cookies.gte(upg.price)) {
        state.cookies = state.cookies.minus(upg.price);
        upg.amount = upg.amount.plus(1);
        upg.price = upg.basePrice.times(
            upg.priceMultiplier.pow(parseInt(upg.amount.toString()))
        ).toDecimalPlaces(0, Decimal.ROUND_DOWN);

        updateUI();
        saveGame();
    }
}

function applyUpgrade(key, restore = false) {
    const upg = upgradeData[key];
    if (!upg || upg.bought || (!restore && state.cookies.lt(upg.price))) return;

    if (!restore) {
        state.cookies = state.cookies.minus(upg.price);
    }

    upg.bought = true;

    const factor = new Decimal(upg.factor || 2);
    const boost = new Decimal(upg.boost || 1);

    switch (upg.type) {
        case "clickBoost":
            state.clickValue = state.clickValue.plus(boost);
            break;
        
        case "clickMultiplier":
            state.clickValue = state.clickValue.times(factor);
            break;

        case "multiplier":
            factoryData[upg.target].multiplier = factoryData[upg.target].multiplier.times(factor);
            break;

        case "globalMultiplier":
            Object.keys(factoryData).forEach(m => {
                factoryData[m].multiplier = factoryData[m].multiplier.times(factor);
            });
            break;
    }

    if (upg.dom.btn) {
        upg.dom.btn.remove();
        upg.dom.btn = null;
    }
    visibleupgrades.delete(key);

    if (!restore) {
        updateUI();
        saveGame();
    }
}

function applyRebirth(key, restore = false) {
    const rebirth = rebirthTreeData[key];
    if (!rebirth || rebirth.bought || (!restore && !(rebirth.prereqs || []).every(reqKey => rebirthTreeData[reqKey]?.bought))) return;

    if (!restore) {
        if (state.rebirthPoints.lt(rebirth.cost)) return;

        state.rebirthPoints = state.rebirthPoints.minus(rebirth.cost);
    }

    rebirth.bought = true;

    const factor = new Decimal(rebirth.factor || 1);
    const value = new Decimal(rebirth.value || 0);

    switch (rebirth.type) {
        case "clickFlat":
            state.clickValue = state.clickValue.plus(value);
            break;
        case "clickMultiplier":
            state.clickValue = state.clickValue.times(factor);
            break;
        case "factoryMultiplier":
            Object.keys(factoryData).forEach(key => {
                factoryData[key].multiplier = factoryData[key].multiplier.times(factor);
            });
            break;
        case "globalMultiplier":
            state.clickValue = state.clickValue.times(factor);
            Object.keys(factoryData).forEach(key => {
                factoryData[key].multiplier = factoryData[key].multiplier.times(factor);
            });
            break;
    }

    if (!restore) {
        updateUI();
        updateRebirthTree();
        saveGame();
    }
}

elements.cookieBtn.addEventListener('click', (e) => {
    const clickGain = getClickValue();
    state.cookies = state.cookies.plus(clickGain);
    state.lifetimeCookies = state.lifetimeCookies.plus(clickGain);
    updateUI();
    createParticle(e.clientX, e.clientY);
    createFloatingText(e.clientX, e.clientY, clickGain);
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

function createFloatingText(x, y, value) {
    const text = document.createElement('div');
    text.className = 'click-value-float';
    text.innerText = `+${formatValue(value)}`;
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
        updateUI();
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

elements.rebirthBtn.addEventListener('click', performRebirth);

[elements.closeSave, elements.closeLoad].forEach(btn => {
    btn.addEventListener('click', () => {
        hideOverlay(elements.savePopup);
        hideOverlay(elements.loadPopup);
    });
});

elements.closeRebirthTree.addEventListener('click', () => hideOverlay(elements.rebirthTreeOverlay));
elements.closeUpgradePop.addEventListener('click', () => hideOverlay(elements.upgradePopup));
elements.confirmUpgradeBuy.addEventListener('click', () => {
    if (currentUpgradeToBuy && state.cookies.gte(upgradeData[currentUpgradeToBuy].price)) {
        applyUpgrade(currentUpgradeToBuy);
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
    const deltaTime = new Decimal(now - state.lastUpdate).div(1000);
    if (getFactoryCPS().gt(0)) {
        const passiveGain = getFactoryCPS().times(deltaTime);
        state.cookies = state.cookies.plus(passiveGain);
        state.lifetimeCookies = state.lifetimeCookies.plus(passiveGain);
        updateUI();
    }
    state.lastUpdate = now;
}, 100);

setInterval(saveGame, 30000);
window.addEventListener('beforeunload', saveGame);

initShop();
initUpgrades();
initRebirthTree();
loadGame();
updateUI();