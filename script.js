let isResetting = false;

let state = {
    cookies: 0,
    totalCPS: 0
};

const upgradeData = {
    snail: {
        name: "Schnecken-Zucht",
        desc: "+1 Cookie/s",
        basePrice: 10, cps: 1,
        icon: "img/Schnecke.png"
    },
    elephant: {
        name: "Elefanten-Fabrik",
        desc: "+10 Cookies/s",
        basePrice: 100, cps: 10,
        icon: "img/Elefant.png"
    }
};

const upgrades = {};

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
    closeSave: document.getElementById('close-save'),
    closeLoad: document.getElementById('close-load'),
    saveField: document.getElementById('save-code-field'),
    loadField: document.getElementById('load-code-field'),
    copySaveBtn: document.getElementById('copy-save-btn'),
    confirmLoadBtn: document.getElementById('confirm-load')
};

const getPrice = (base, amount) => Math.round(base * Math.pow(1.15, amount));

function calculateTotalCPS() {
    state.totalCPS = Object.values(upgrades).reduce((acc, upg) => acc + (upg.amount * upg.cps), 0);
}

function updateUI() {
    elements.cookieDisplay.innerText = Math.floor(state.cookies).toLocaleString();
    elements.cpsDisplay.innerText = state.totalCPS.toLocaleString();
    
    for (const key in upgrades) {
        const upg = upgrades[key];
        upg.dom.amount.innerText = upg.amount;
        upg.dom.price.innerText = upg.currentPrice.toLocaleString();
        upg.dom.btn.disabled = state.cookies < upg.currentPrice;
    }
}

function buyUpgrade(key) {
    const upg = upgrades[key];
    if (state.cookies >= upg.currentPrice) {
        state.cookies -= upg.currentPrice;
        upg.amount++;
        upg.currentPrice = getPrice(upg.basePrice, upg.amount);
        
        calculateTotalCPS();
        updateUI();
        saveGame();
    }
}

function initShop() {
    for (const [key, data] of Object.entries(upgradeData)) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'upgrade-item';
        itemDiv.innerHTML = `
            <div class="upgrade-info">
                <img src="${data.icon}" alt="${data.name}" class="upgrade-icon">
                <div class="upgrade-texts">
                    <span class="upgrade-name">${data.name}</span>
                    <span class="upgrade-desc">${data.desc}</span>
                </div>
            </div>
            <div class="upgrade-controls">
                <span class="upgrade-amount" id="${key}-amount">0</span>
                <button id="buy-${key}" class="buy-btn">
                    Kaufen (<span id="${key}-price">${data.basePrice}</span> 
                    <img src="img/Keks.svg" class="price-icon">)
                </button>
            </div>
        `;
        
        elements.sidebar.appendChild(itemDiv);

        upgrades[key] = {
            ...data,
            amount: 0,
            currentPrice: data.basePrice,
            dom: {
                btn: document.getElementById(`buy-${key}`),
                price: document.getElementById(`${key}-price`),
                amount: document.getElementById(`${key}-amount`)
            }
        };

        upgrades[key].dom.btn.onclick = () => buyUpgrade(key);
    }
}

function saveGame() {
    if (isResetting) return;

    const hasUpgrades = Object.values(upgrades).some(upg => upg.amount > 0);
    if (state.cookies === 0 && !hasUpgrades) return;
    
    const saveDate = {
        cookies: state.cookies,
        upgradeAmounts: {}
    };

    for (const key in upgrades) {
        saveDate.upgradeAmounts[key] = upgrades[key].amount;
    }

    localStorage.setItem('kekslefant_save', JSON.stringify(saveDate));
}

function applySaveData(data) {
    if (!data) return;
    state.cookies = data.cookies || 0;
    if (data.upgradeAmounts) {
        for (const key in data.upgradeAmounts) {
            if (upgrades[key]) {
                upgrades[key].amount = data.upgradeAmounts[key];
                upgrades[key].currentPrice = getPrice(upgrades[key].basePrice, upgrades[key].amount);
            }
        }
    }
    calculateTotalCPS();
}

function saveGame() {
    if (isResetting) return;
    localStorage.setItem('kekslefant_save', JSON.stringify(getSavePayload()));
}

function loadGame() {
    const saved = localStorage.getItem('kekslefant_save');
    if (saved) applySaveData(JSON.parse(saved));
}

elements.cookieBtn.onclick = () => {
    state.cookies++;
    updateUI();
};

elements.shopToggle.addEventListener('click', () => {
    const isOpen = elements.sidebar.classList.toggle('open');

    if (isOpen) {
        elements.shopIcon.src = 'img/Close.png';
        elements.shopText.textContent = ' Schließen';
    } else {
        elements.shopIcon.src = 'img/Shop.png';
        elements.shopText.textContent = ' Shop';
    }
});

elements.closeSave.onclick = () => elements.savePopup.style.display = 'none';
elements.closeLoad.onclick = () => elements.loadPopup.style.display = 'none';

elements.settingsBtn.addEventListener('click', () => {
    elements.settingsOverlay.style.display = 'flex';
});

elements.closeSettings.addEventListener('click', () => {
    elements.settingsOverlay.style.display = 'none';
});

elements.settingsOverlay.addEventListener('click', (e) => {
    if (e.target === elements.settingsOverlay) {
        elements.settingsOverlay.style.display = 'none';
    }
});

elements.resetBtn.addEventListener('click', () => {
    if (confirm("Möchtest du wirklich alles löschen?")) {
        isResetting = true;

        localStorage.removeItem('kekslefant_save');
        localStorage.clear();

        location.reload();
    }
});

window.addEventListener('beforeunload', () => {
    saveGame();
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        saveGame();
    }
});

window.addEventListener("contextmenu", e => e.preventDefault());

setInterval(() => {
    if (state.totalCPS > 0) {
        state.cookies += state.totalCPS;
        updateUI();
    }
}, 1000);

setInterval(() => {
    saveGame();
}, 20000);

initShop();
loadGame();
updateUI();
