function getSaveData() {
    return {
        stats: {
            cookies: state.cookies.toString(),
            clickValue: state.clickValue.toString(),
            rebirthPoints: state.rebirthPoints.toString(),
            totalRebirths: state.totalRebirths.toString(),
            lifetimeCookies: state.lifetimeCookies.toString(),
            lifetimeRebirthPoints: state.lifetimeRebirthPoints.toString()
        },
        factories: Object.keys(factoryData).reduce((all, key) => {
            all[key] = {
                a: factoryData[key].amount.toString(),
                m: factoryData[key].multiplier.toString()
            };
            return all;
        }, {}),
        upgrades: {
            bought: Object.keys(upgradeData).filter(key => upgradeData[key].bought),
            visible: Array.from(visibleupgrades)
        }
    };
}

function calculateLifetimeCookiesFallback(data, currentCookies) {
    let total = new Big(currentCookies || 0);
    const growthFactor = new Big(1.15);

    if (data?.factories) {
        for (const key in data.factories) {
            if (!factoryData[key]) continue;

            const amount = parseInt(data.factories[key]?.a || 0, 10);
            if (!Number.isFinite(amount) || amount <= 0) continue;

            let nextPrice = new Big(factoryData[key].basePrice);
            for (let i = 0; i < amount; i++) {
                total = total.plus(nextPrice);
                nextPrice = nextPrice.times(growthFactor).round(0, 0);
            }
        }
    }

    if (data?.upgrades?.bought) {
        data.upgrades.bought.forEach(key => {
            if (upgradeData[key]) {
                total = total.plus(new Big(upgradeData[key].price));
            }
        });
    }

    return total;
}

function applySaveData(data) {
    if (!data) return;

    try {
        const loadedCookies = new Big(data.stats?.cookies || 0);

        state.cookies = loadedCookies;
        state.clickValue = new Big(data.stats?.clickValue || 1);
        state.rebirthPoints = new Big(data.stats?.rebirthPoints || 0);
        state.totalRebirths = new Big(data.stats?.totalRebirths || 0);
        if (data.stats?.lifetimeCookies !== undefined && data.stats?.lifetimeCookies !== null) {
            state.lifetimeCookies = new Big(data.stats.lifetimeCookies);
        } else {
            state.lifetimeCookies = calculateLifetimeCookiesFallback(data, loadedCookies);
        }
        state.lifetimeRebirthPoints = new Big(data.stats?.lifetimeRebirthPoints || data.stats?.rebirthPoints || 0);

        if (data.factories) {
            for (const key in data.factories) {
                if (factoryData[key]) {
                    const fData = data.factories[key];
                    factoryData[key].amount = new Big(fData.a || 0);
                    factoryData[key].multiplier = new Big(fData.m || 1);
                    factoryData[key].price = factoryData[key].basePrice.times(
                        new Big(1.15).pow(parseInt(factoryData[key].amount.toString()))
                    ).round(0, 0);
                }
            }
        }

        if (data.upgrades?.bought) {
            data.upgrades.bought.forEach(key => {
                if (upgradeData[key]) {
                    upgradeData[key].bought = true;
                }
            });
        }

        visibleupgrades.clear();
        if (data.upgrades?.visible) {
            data.upgrades.visible.forEach(key => {
                if (upgradeData[key] && !upgradeData[key].bought) {
                    visibleupgrades.add(key);
                }
            });
        }

        updateUI();
    } catch (e) {
        console.error("Fehler beim Laden:", e);
    }
}

function saveGame() {
    if (isResetting) return;

    const hasNoCookies = state.lifetimeCookies.eq(0);
    const hasNoFactory = Object.values(factoryData).every(factory => factory.amount.eq(0));
    const hasNoRebirth = state.lifetimeRebirthsPoints.eq(0);

    if (hasNoCookies && hasNoFactory && hasNoRebirth) {
        return; 
    }

    localStorage.setItem('kekslefant_save', JSON.stringify(getSaveData()));
}

function loadGame() {
    const savedData = localStorage.getItem('kekslefant_save');
    if (savedData) applySaveData(JSON.parse(savedData));
}