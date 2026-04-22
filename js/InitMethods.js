function initShop() {
    elements.factoryContainer.innerHTML = '';

    for (const [key, data] of Object.entries(factoryConfig)) {
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

        elements.factoryContainer.appendChild(itemDiv);
        factoryData[key] = {
            ...data,
            amount: new Decimal(0),
            price: new Decimal(data.basePrice),
            multiplier: new Decimal(1),
            dom: {
                btn: document.getElementById(`buy-${key}`),
                price: document.getElementById(`${key}-price`),
                amount: document.getElementById(`${key}-amount`),
                desc: itemDiv.querySelector('.factory-desc')
            }
        };
        factoryData[key].dom.btn.addEventListener('click', () => buyFactory(key));
    }
}

function initUpgrades() {
    for (const [key, data] of Object.entries(upgradeConfig)) {
        upgradeData[key] = {
            ...data,
            price: new Decimal(data.price),
            bought: false,
            dom: { btn: null }
        };
    }
}