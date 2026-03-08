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
    settingsBtn: document.getElementById('settings-toggle'),
    settingsOverlay: document.getElementById('settings-overlay'),
    closeSettings: document.getElementById('close-settings'),
    resetBtn: document.getElementById('reset-game')
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
                <button id="buy-${key}" class="buy-btn">Kaufen (<span id="${key}-price">${data.basePrice}</span> 🍪)</button>
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

function saveGame() {
    const saveDate = {
        cookies: state.cookies,
        upgradeAmounts: {}
    };

    for (const key in upgrades) {
        saveDate.upgradeAmounts[key] = upgrades[key].amount;
    }

    localStorage.setItem('kekslefant_save', JSON.stringify(saveDate));
}

function loadGame() {
    const savedData = localStorage.getItem('kekslefant_save');
    if (!savedData) return;

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
    updateUI();
}

elements.cookieBtn.addEventListener('click', () => {
    state.cookies += 1;
    updateUI();
});

elements.shopToggle.addEventListener('click', () => {
    const isOpen = elements.sidebar.classList.toggle('open');
    elements.shopToggle.textContent = isOpen ? '❌ Schließen' : '🛒 Shop';
});

elements.settingsBtn.addEventListener('click', () => {
    elements.settingsOverlay.style.display = 'flex';
});

elements.closeSettings.addEventListener('click', () => {
    elements.settingsOverlay.style.display = 'none';
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
    if (!isResetting) {
        saveGame();
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && !isResetting) {
        saveGame();
    }
});

setInterval(() => {
    if (state.totalCPS > 0) {
        state.cookies += state.totalCPS;
        updateUI();
    }
}, 1000);

setInterval(() => {
    if (!isResetting) {
        saveGame();
    }
}, 20000);

initShop();
loadGame();
