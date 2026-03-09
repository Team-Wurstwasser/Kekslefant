let isResetting = false;

let state = {
    cookies: 0,
    totalCPS: 0
};

const upgradeData = {
    snail: {
        name: "Schnecken-Zucht",
        desc: "+1 Cookie/s",
        basePrice: 10,
        cps: 1,
        icon: "img/Schnecke.png"
    },
    elephant: {
        name: "Elefanten-Fabrik",
        desc: "+10 Cookies/s",
        basePrice: 100,
        cps: 10,
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
    saveCodeField: document.getElementById('save-code-field'),
    loadCodeField: document.getElementById('load-code-field'),
    confirmLoadBtn: document.getElementById('confirm-load'),
    closeSave: document.getElementById('close-save'),
    closeLoad: document.getElementById('close-load')
};

function calculateTotalCPS() {
    state.totalCPS = Object.values(upgrades).reduce((acc, upg) => acc + (upg.amount * upg.cps), 0);
}

function updateUI() {
    elements.cookieDisplay.innerText = Math.floor(state.cookies).toLocaleString();
    elements.cpsDisplay.innerText = state.totalCPS.toLocaleString();

    for (const key in upgrades) {
        const upg = upgrades[key];
        upg.dom.amount.innerText = upg.amount;
        upg.dom.price.innerText = Math.ceil(upg.price).toLocaleString();
        upg.dom.btn.disabled = state.cookies < upg.price;
    }
}

function buyUpgrade(key) {
    const upg = upgrades[key];
    if (state.cookies >= upg.price) {
        state.cookies -= upg.price;
        upg.amount++;
        upg.price = Math.round(upg.basePrice * Math.pow(1.15, upg.amount));

        calculateTotalCPS();
        updateUI();
        saveGame();
    }
}

function saveGame() {
    if (isResetting) return;

    const hasUpgrades = Object.values(upgrades).some(upg => upg.amount > 0);
    if (state.cookies === 0 && !hasUpgrades) return;

    const saveData = {
        cookies: state.cookies,
        upgradeAmounts: {}
    };

    for (const key in upgrades) {
        saveData.upgradeAmounts[key] = upgrades[key].amount;
    }

    localStorage.setItem('kekslefant_save', JSON.stringify(saveData));
}

function loadGame() {
    const savedData = localStorage.getItem('kekslefant_save');
    if (!savedData) return;

    try {
        const data = JSON.parse(savedData);
        state.cookies = data.cookies || 0;

        if (data.upgradeAmounts) {
            for (const key in data.upgradeAmounts) {
                if (upgrades[key]) {
                    const amount = data.upgradeAmounts[key];
                    upgrades[key].amount = amount;
                    upgrades[key].price = Math.round(upgrades[key].basePrice * Math.pow(1.15, amount));
                }
            }
        }
        calculateTotalCPS();
    } catch (e) {
        console.error(e);
    }
}

function exportGame() {
    const saveData = {
        cookies: state.cookies,
        upgradeAmounts: {}
    };

    for (const key in upgrades) {
        saveData.upgradeAmounts[key] = upgrades[key].amount;
    }

    const code = btoa(JSON.stringify(saveData));
    elements.saveCodeField.value = code;
    showOverlay(elements.savePopup);
}

function importGame() {
    const code = elements.loadCodeField.value.trim();
    if (!code) return;

    try {
        const decoded = atob(code);
        const data = JSON.parse(decoded);

        state.cookies = data.cookies || 0;
        if (data.upgradeAmounts) {
            for (const key in data.upgradeAmounts) {
                if (upgrades[key]) {
                    const amount = data.upgradeAmounts[key];
                    upgrades[key].amount = amount;
                    upgrades[key].price = Math.round(upgrades[key].basePrice * Math.pow(1.15, amount));
                }
            }
        }

        calculateTotalCPS();
        updateUI();
        saveGame();

        hideOverlay(elements.loadPopup);
        elements.settingsOverlay.style.display = 'none';
        elements.loadCodeField.value = "";
        alert("Spielstand erfolgreich geladen!");

    } catch (e) {
        alert("Ungültiger Save-Code!");
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
            price: data.basePrice,
            dom: {
                btn: document.getElementById(`buy-${key}`),
                price: document.getElementById(`${key}-price`),
                amount: document.getElementById(`${key}-amount`)
            }
        };

        upgrades[key].dom.btn.addEventListener('click', () => buyUpgrade(key));
    }
}

function showOverlay(overlay) { overlay.style.display = 'flex'; }
function hideOverlay(overlay) { overlay.style.display = 'none'; }

elements.cookieBtn.addEventListener('click', () => {
    state.cookies += 1;
    updateUI();
});

elements.shopToggle.addEventListener('click', () => {
    const isOpen = elements.sidebar.classList.toggle('open');
    elements.shopIcon.src = isOpen ? 'img/Close.png' : 'img/Shop.png';
    elements.shopText.textContent = isOpen ? ' Schließen' : ' Shop';
});

elements.settingsBtn.addEventListener('click', () => showOverlay(elements.settingsOverlay));
elements.closeSettings.addEventListener('click', () => hideOverlay(elements.settingsOverlay));

elements.resetBtn.addEventListener('click', () => {
    if (confirm("Möchtest du wirklich alles löschen?")) {
        isResetting = true;
        localStorage.clear();
        location.reload();
    }
});

elements.exportBtn.addEventListener('click', exportGame);
elements.importBtn.addEventListener('click', () => showOverlay(elements.loadPopup));
elements.confirmLoadBtn.addEventListener('click', importGame);
elements.closeSave.addEventListener('click', () => hideOverlay(elements.savePopup));
elements.closeLoad.addEventListener('click', () => hideOverlay(elements.loadPopup));

[elements.settingsOverlay, elements.savePopup, elements.loadPopup].forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideOverlay(overlay);
    });
});

window.addEventListener('beforeunload', saveGame);
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveGame();
});
window.addEventListener("contextmenu", e => e.preventDefault());

setInterval(() => {
    if (state.totalCPS > 0) {
        state.cookies += state.totalCPS;
        updateUI();
    }
}, 1000);

setInterval(saveGame, 20000);

initShop();
loadGame();
updateUI();