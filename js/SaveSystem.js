function getSaveData() {
    return {
        stats: {
            cookies: state.cookies.toString(),
            clickValue: state.clickValue.toString(),
            rebirthPoints: state.rebirthPoints.toString(),
            totalRebirths: state.totalRebirths.toString(),
            lifetimeCookies: state.lifetimeCookies.toString()
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

function applySaveData(data) {
    if (!data) return;

    try {
        state.cookies = new Big(data.stats?.cookies || 0);
        state.clickValue = new Big(data.stats?.clickValue || 1);
        state.rebirthPoints = new Big(data.stats?.rebirthPoints || 0);
        state.totalRebirths = new Big(data.stats?.totalRebirths || 0);
        state.lifetimeCookies = new Big(data.stats?.lifetimeCookies || data.stats?.cookies || 0);

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

    const hasNoCookies = state.cookies.eq(0);
    const hasNoFactory = Object.values(factoryData).every(factory => factory.amount.eq(0));
    const hasNoRebirthProgress = !state.rebirthPoints || state.rebirthPoints.eq(0);

    if (hasNoCookies && hasNoFactory && hasNoRebirthProgress) {
        return; 
    }

    localStorage.setItem('kekslefant_save', JSON.stringify(getSaveData()));
}

function loadGame() {
    const savedData = localStorage.getItem('kekslefant_save');
    if (savedData) applySaveData(JSON.parse(savedData));
}