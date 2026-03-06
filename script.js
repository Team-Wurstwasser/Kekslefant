let cookies = 0;

const upgrades = {
    snail: {
        amount: 0,
        basePrice: 10,
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
        basePrice: 100,
        price: 100,
        cps: 10,
        dom: {
            btn: document.getElementById('buy-elephant'),
            price: document.getElementById('elephant-price'),
            amount: document.getElementById('elephant-amount')
        }
    }
};

const dom = {
    cookieBtn: document.getElementById('cookie'),
    cookieDisplay: document.getElementById('cookie-count'),
    cpsDisplay: document.getElementById('cps-count'),
    shopToggle: document.getElementById('shop-toggle'),
    sidebar: document.querySelector('.sidebar')
};

const calculateTotalCPS = () => {
    return Object.values(upgrades).reduce((acc, upg) => acc + (upg.amount * upg.cps), 0);
};

function updateUI() {
    dom.cookieDisplay.innerText = Math.floor(cookies).toLocaleString();
    dom.cpsDisplay.innerText = calculateTotalCPS().toLocaleString();
    
    for (const key in upgrades) {
        const upg = upgrades[key];
        upg.dom.amount.innerText = upg.amount;
        upg.dom.price.innerText = upg.price.toLocaleString();
        upg.dom.btn.disabled = cookies < upg.price;
    }
}

Object.keys(upgrades).forEach(key => {
    const upg = upgrades[key];
    upg.dom.btn.addEventListener('click', () => {
        if (cookies >= upg.price) {
            cookies -= upg.price;
            upg.amount++;
            upg.price = Math.round(upg.basePrice * Math.pow(1.15, upg.amount));
            updateUI();
        }
    });
});

dom.cookieBtn.addEventListener('click', () => {
    cookies += 1;
    updateUI();
});

setInterval(() => {
    const totalCPS = calculateTotalCPS();
    if (totalCPS > 0) {
        cookies += totalCPS;
        updateUI();
    }
}, 1000);

dom.shopToggle.addEventListener('click', () => {
    const isOpen = dom.sidebar.classList.toggle('open');
    dom.shopToggle.textContent = isOpen ? '❌ Schließen' : '🛒 Shop';
});

updateUI();