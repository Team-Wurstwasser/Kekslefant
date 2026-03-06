// --- Spiel-Status (State) ---
let cookies = 0;
let grandmas = 0;
let grandmaPrice = 10;

// --- DOM-Elemente ---
const cookieDisplay = document.getElementById('cookie-count');
const cpsDisplay = document.getElementById('cps-count');
const priceDisplay = document.getElementById('price');
const cookieBtn = document.getElementById('cookie');
const buyBtn = document.getElementById('buy-grandma');

// --- Funktionen ---

// Aktualisiert alle Texte und Buttons auf der Seite
function updateUI() {
    cookieDisplay.innerText = Math.floor(cookies);
    cpsDisplay.innerText = grandmas;
    priceDisplay.innerText = grandmaPrice;
    
    // Button nur aktivieren, wenn genug Cookies da sind
    buyBtn.disabled = cookies < grandmaPrice;
}

// Wenn auf den Keks geklickt wird
cookieBtn.addEventListener('click', () => {
    cookies += 1;
    updateUI();
});

// Wenn ein Upgrade gekauft wird
buyBtn.addEventListener('click', () => {
    if (cookies >= grandmaPrice) {
        cookies -= grandmaPrice;
        grandmas += 1;
        // Preis steigt um 50% pro Kauf
        grandmaPrice = Math.round(grandmaPrice * 1.5); 
        updateUI();
    }
});

// Der "Game Loop" - läuft jede Sekunde
setInterval(() => {
    if (grandmas > 0) {
        cookies += grandmas;
        updateUI();
    }
}, 1000);

// Initialer Aufruf beim Laden der Seite
updateUI();