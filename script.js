// --- SPIEL-ZUSTAND ---
let cookies = 0;

const upgrades = {
    snail: {
        amount: 0,
        price: 10,
        cps: 1,
        dom: {
            btn: document.getElementById('buy-snail'),
            price: document.getElementById('snail-price'),
            amount: document.getElementById('snail-amount')
        }
    },
    elephant: {
        amount: 0,
        price: 100,
        cps: 10,
        dom: {
            btn: document.getElementById('buy-elephant'),
            price: document.getElementById('elephant-price'),
            amount: document.getElementById('elephant-amount')
        }
    }
};

// --- DOM ELEMENTE ---
const cookieBtn = document.getElementById('cookie');
const cookieDisplay = document.getElementById('cookie-count');
const cpsDisplay = document.getElementById('cps-count');

// --- LOGIK ---

function updateUI() {
    // Cookies anzeigen
    cookieDisplay.innerText = Math.floor(cookies).toLocaleString();
    
    // CPS berechnen
    let totalCPS = 0;
    for (let key in upgrades) {
        let upg = upgrades[key];
        totalCPS += upg.amount * upg.cps;
        
        // Buttons & Texte im Shop
        upg.dom.amount.innerText = upg.amount;
        upg.dom.price.innerText = upg.price;
        upg.dom.btn.disabled = cookies < upg.price;
    }
    cpsDisplay.innerText = totalCPS;
}

// Klick auf den Keks
cookieBtn.addEventListener('click', (e) => {
    cookies += 1;
    updateUI();
});

// Kauf-Funktion
function setupUpgrade(key) {
    const upg = upgrades[key];
    upg.dom.btn.addEventListener('click', () => {
        if (cookies >= upg.price) {
            cookies -= upg.price;
            upg.amount++;
            upg.price = Math.round(upg.price * 1.15);
            updateUI();
        }
    });
}

// Event-Listener für alle Upgrades initialisieren
setupUpgrade('snail');
setupUpgrade('elephant');

// Game Loop (Jede Sekunde)
setInterval(() => {
    let totalCPS = 0;
    for (let key in upgrades) {
        totalCPS += upgrades[key].amount * upgrades[key].cps;
    }
    
    if (totalCPS > 0) {
        cookies += totalCPS;
        updateUI();
    }
}, 1000);

// Start-Update
updateUI();