let cookies = 0;

const upgradeData = {
    snail: { name: "Schnecken-Zucht", desc: "+1 Cookie/s", basePrice: 10, cps: 1, icon: "img/Schnecke.png" },
    elephant: { name: "Elefanten-Fabrik", desc: "+10 Cookies/s", basePrice: 100, cps: 10, icon: "img/Elefant.png" }
};

const upgrades = {};
const sidebar = document.querySelector('.sidebar');
const cookieBtn = document.getElementById('cookie');
const cookieDisplay = document.getElementById('cookie-count');
const cpsDisplay = document.getElementById('cps-count');
const shopToggle = document.getElementById('shop-toggle');

function initShop() {
    for (const key in upgradeData) {
        const data = upgradeData[key];
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
                <button id="buy-${key}">Kaufen (<span id="${key}-price">${data.basePrice}</span> 🍪)</button>
            </div>
        `;
        
        sidebar.appendChild(itemDiv);

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

        upgrades[key].dom.btn.addEventListener('click', () => {
            if (cookies >= upgrades[key].price) {
                cookies -= upgrades[key].price;
                upgrades[key].amount++;
                upgrades[key].price = Math.round(upgrades[key].basePrice * Math.pow(1.15, upgrades[key].amount));
                updateUI();
            }
        });
    }
}

function updateUI() {
    cookieDisplay.innerText = Math.floor(cookies).toLocaleString();
    const totalCPS = Object.values(upgrades).reduce((acc, upg) => acc + (upg.amount * upg.cps), 0);
    cpsDisplay.innerText = totalCPS.toLocaleString();
    
    for (const key in upgrades) {
        const upg = upgrades[key];
        upg.dom.amount.innerText = upg.amount;
        upg.dom.price.innerText = upg.price.toLocaleString();
        upg.dom.btn.disabled = cookies < upg.price;
    }
}

cookieBtn.addEventListener('click', () => {
    cookies += 1;
    updateUI();
});

setInterval(() => {
    const totalCPS = Object.values(upgrades).reduce((acc, upg) => acc + (upg.amount * upg.cps), 0);
    if (totalCPS > 0) {
        cookies += totalCPS;
        updateUI();
    }
}, 1000);

shopToggle.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    shopToggle.textContent = isOpen ? '❌ Schließen' : '🛒 Shop';
});

initShop();
updateUI();
