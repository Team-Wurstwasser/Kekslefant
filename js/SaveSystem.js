function getSaveData() {
    return {
        stats: {
            cookies: state.cookies.toString(),
            clickValue: state.clickValue.toString(),
            rebirthPoints: state.rebirthPoints.toString(),
            totalRebirths: state.totalRebirths.toString(),
            lifetimeCookies: state.lifetimeCookies.toString()
        },
        factories: Object.keys(factoryList).reduce((all, key) => {
            all[key] = {
                a: factoryList[key].amount.toString(),
                m: factoryList[key].multiplier.toString()
            };
            return all;
        }, {}),
        upgrades: {
            bought: Object.keys(upgradesList).filter(key => upgradesList[key].bought),
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
                if (factoryList[key]) {
                    const fData = data.factories[key];
                    factoryList[key].amount = new Big(fData.a || 0);
                    factoryList[key].multiplier = new Big(fData.m || 1);
                    factoryList[key].price = factoryList[key].basePrice.times(
                        new Big(1.15).pow(parseInt(factoryList[key].amount.toString()))
                    ).round(0, 0);
                }
            }
        }

        if (data.upgrades?.bought) {
            data.upgrades.bought.forEach(key => {
                if (upgradesList[key]) {
                    upgradesList[key].bought = true;
                }
            });
        }

        visibleupgrades.clear();
        if (data.upgrades?.visible) {
            data.upgrades.visible.forEach(key => {
                if (upgradesList[key] && !upgradesList[key].bought) {
                    visibleupgrades.add(key);
                }
            });
        }

        calculateTotalCPS();
        updateUI();
    } catch (e) {
        console.error("Fehler beim Laden:", e);
    }
}

function saveGame() {
    if (isResetting) return;

    const hasNoCookies = state.cookies.eq(0);
    const hasNoFactory = Object.values(factoryList).every(factory => factory.amount.eq(0));
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