const factoryConfig = {
    huette: {
        name: "Keks Hütte",
        basePrice: new Decimal(15),
        cps: new Decimal(1),
        priceMultiplier: new Decimal(1.15),
        icon: "img/Huette.png"
    },
    kristall: {
        name: "Kristall-Konditorei",
        basePrice: new Decimal(100),
        cps: new Decimal(5),
        priceMultiplier: new Decimal(1.15),
        icon: "img/Kristall.png"
    },
    plasma: {
        name: "Plasma-Keks-Generator",
        basePrice: new Decimal(1100),
        cps: new Decimal(40),
        priceMultiplier: new Decimal(1.15),
        icon: "img/Plasma.png"
    },
    labor: {
        name: "Licht-Keks-Labor",
        basePrice: new Decimal(12000),
        cps: new Decimal(200),
        priceMultiplier: new Decimal(1.15),
        icon: "img/Labor.png"
    },
    former: {
        name: "Makro-Keks-Former",
        basePrice: new Decimal(130000),
        cps: new Decimal(1000),
        priceMultiplier: new Decimal(1.15),
        icon: "img/Former.png"
    },
    ofen: {
        name: "Schwerkraft-Ofen",
        basePrice: new Decimal(1400000),
        cps: new Decimal(6500),
        priceMultiplier: new Decimal(1.15),
        icon: "img/Ofen.png"
    },
    sonde: {
        name: "Back-Sonde",
        basePrice: new Decimal(20000000),
        cps: new Decimal(40000),
        priceMultiplier: new Decimal(1.15),
        icon: "img/Sonde.png"
    }
};

const upgradeConfig = {
    click_1: {
        name: "Verstärkter Zeigefinger",
        type: "clickBoost",
        boost: new Decimal(1),
        price: new Decimal(50),
        icon: "img/Keks.svg",
        desc: "Jeder Klick bringt +1 Keks mehr."
    },
    click_2: {
        name: "Titan-Mausrad",
        type: "clickMultiplier",
        factor: new Decimal(2),
        price: new Decimal(5000),
        icon: "img/Keks.svg",
        desc: "Verdoppelt die Effizienz deiner Klicks!"
    },
    click_3: {
        name: "Diamant-Cursor",
        type: "clickMultiplier",
        factor: new Decimal(100),
        price: new Decimal(2500000),
        icon: "img/Keks.svg",
        desc: "Deine Klicks sind nun 100-mal so mächtig."
    },
    click_4: {
        name: "Quanten-Clicker",
        type: "clickMultiplier",
        factor: new Decimal(10000),
        price: new Decimal(1000000000),
        icon: "img/Keks.svg",
        desc: "Ein Klick, tausend Realitäten. Klick-Wert x10000."
    },
    huette_1: {
        name: "Bio-Kekseteig",
        type: "multiplier",
        target: "huette",
        price: new Decimal(500),
        factor: new Decimal(2),
        icon: "img/Huette.png",
        desc: "Die Keks-Hütten produzieren doppelt so schnell."
    },
    huette_2: {
        name: "Keks-Mutation",
        type: "multiplier",
        target: "huette",
        price: new Decimal(15000),
        factor: new Decimal(4),
        icon: "img/Huette.png",
        desc: "Die Keks-Hütten sind nun intelligent. Hütten produzieren 4-mal so viel."
    },
    huette_3: {
        name: "Hütten-Automatik",
        type: "multiplier",
        target: "huette",
        price: new Decimal(1000000),
        factor: new Decimal(10),
        icon: "img/Huette.png",
        desc: "Vollautomatische Teigführung. Hütten x10."
    },
    kristall_1: {
        name: "Hochglanz-Prismen",
        type: "multiplier",
        target: "kristall",
        price: new Decimal(5000),
        factor: new Decimal(2),
        icon: "img/Kristall.png",
        desc: "Kristall-Konditoreien glänzen mit 100% mehr Ertrag."
    },
    kristall_2: {
        name: "Zucker-Diamanten",
        type: "multiplier",
        target: "kristall",
        price: new Decimal(250000),
        factor: new Decimal(4),
        icon: "img/Kristall.png",
        desc: "Konditoreien produzieren 4-mal so viel."
    },
    kristall_3: {
        name: "Reinstkristall-Gitter",
        type: "multiplier",
        target: "kristall",
        price: new Decimal(25000000),
        factor: new Decimal(8),
        icon: "img/Kristall.png",
        desc: "Perfekte Molekularstruktur. Kristall-Konditoreien x8."
    },
    plasma_1: {
        name: "Ionen-Beschleuniger",
        type: "multiplier",
        target: "plasma",
        price: new Decimal(50000),
        factor: new Decimal(2),
        icon: "img/Plasma.png",
        desc: "Stabilisiert den Plasma-Fluss für doppelte Produktion."
    },
    plasma_2: {
        name: "Dunkle Materie Kern",
        type: "multiplier",
        target: "plasma",
        price: new Decimal(3000000),
        factor: new Decimal(4),
        icon: "img/Plasma.png",
        desc: "Plasma-Generatoren erreichen die kritische Masse. Output x4."
    },
    plasma_3: {
        name: "Supernova-Einspeisung",
        type: "multiplier",
        target: "plasma",
        price: new Decimal(150000000),
        factor: new Decimal(10),
        icon: "img/Plasma.png",
        desc: "Direkte Energie aus dem Kern eines Sterns. Plasma x10."
    },
    labor_1: {
        name: "Quanten-Backofen",
        type: "multiplier",
        target: "labor",
        price: new Decimal(500000),
        factor: new Decimal(2),
        icon: "img/Labor.png",
        desc: "Licht-Keks-Labore verdoppeln ihren Output."
    },
    labor_2: {
        name: "Zeitkrümmungs-Backen",
        type: "multiplier",
        target: "labor",
        price: new Decimal(40000000),
        factor: new Decimal(4),
        icon: "img/Labor.png",
        desc: "Die Kekse sind fertig, bevor der Teig existiert. Labor x4."
    },
    labor_3: {
        name: "Parallelwelt-Labor",
        type: "multiplier",
        target: "labor",
        price: new Decimal(2000000000),
        factor: new Decimal(10),
        icon: "img/Labor.png",
        desc: "Importiert Kekse aus Dimensionen, in denen es nur Kekse gibt. x10."
    },
    former_1: {
        name: "Atomare Symmetrie",
        type: "multiplier",
        target: "former",
        price: new Decimal(50000000),
        factor: new Decimal(2),
        icon: "img/Former.png",
        desc: "Makro-Keks-Former arbeiten nun doppelt so effizient."
    },
    former_2: {
        name: "Fraktale Geometrie",
        type: "multiplier",
        target: "former",
        price: new Decimal(5000000000),
        factor: new Decimal(4),
        icon: "img/Former.png",
        desc: "Die Formgebung ist nun 4-mal effizienter."
    },
    ofen_1: {
        name: "Ereignishorizont-Grill",
        type: "multiplier",
        target: "ofen",
        price: new Decimal(5000000000),
        factor: new Decimal(2),
        icon: "img/Ofen.png",
        desc: "Schwerkraft-Öfen nutzen die Krümmung für doppeltes Backtempo."
    },
    ofen_2: {
        name: "Singularitäts-Hitze",
        type: "multiplier",
        target: "ofen",
        price: new Decimal(250000000000),
        factor: new Decimal(4),
        icon: "img/Ofen.png",
        desc: "Die Hitze eines sterbenden Sterns. Schwerkraft-Öfen x4."
    },
    sonde_1: {
        name: "Deep-Space-Backen",
        type: "multiplier",
        target: "sonde",
        price: new Decimal(50000000000),
        factor: new Decimal(2),
        icon: "img/Sonde.png",
        desc: "Back-Sonden finden effizientere Routen im All (x2)."
    },
    sonde_2: {
        name: "Galaktisches Netzwerk",
        type: "multiplier",
        target: "sonde",
        price: new Decimal(1000000000000),
        factor: new Decimal(5),
        icon: "img/Sonde.png",
        desc: "Ein intergalaktisches Liefernetzwerk. Sonden-Effizienz x5."
    },
    global_1: {
        name: "Keks-Imperium",
        type: "globalMultiplier",
        factor: new Decimal(1.5),
        price: new Decimal(1000000000000),
        icon: "img/Logo.png",
        desc: "Erhöht die Produktion ALLER Gebäude um 50%!"
    },
    global_2: {
        name: "Keks-Relativität",
        type: "globalMultiplier",
        factor: new Decimal(2),
        price: new Decimal(50000000000000),
        icon: "img/Logo.png",
        desc: "E=mc²? Nein, Energie = mehr Cookies! Alles wird verdoppelt."
    },
    global_3: {
        name: "Universelle Keks-Konstante",
        type: "globalMultiplier",
        factor: new Decimal(5),
        price: new Decimal(1000000000000000),
        icon: "img/Logo.png",
        desc: "Das Universum besteht nun zu 5% aus Keksteig. Alles x5."
    }
};

const rebirthConfig = {
    baseCookies: new Decimal(1000000),
    bonusPerPoint: new Decimal(0.05),
    pointsMultiplier: new Decimal(1.15)
};

const rebirthTreeConfig = {
    click_1: {
        name: "Daumen-Training",
        type: "clickFlat",
        value: new Decimal(1),
        cost: new Decimal(1),
        tier: 1,
        prereqs: [],
        icon: "img/Keks.svg",
        desc: "Jeder Klick bringt dauerhaft +1 extra Keks."
    },
    click_2: {
        name: "Maus-Disziplin",
        type: "clickMultiplier",
        factor: new Decimal(2),
        cost: new Decimal(2),
        tier: 2,
        prereqs: ["click_1"],
        icon: "img/Keks.svg",
        desc: "Verdoppelt den dauerhaften Klick-Bonus."
    },
    prod_1: {
        name: "Back-Intuition",
        type: "factoryMultiplier",
        factor: new Decimal(1.25),
        cost: new Decimal(1),
        tier: 1,
        prereqs: [],
        icon: "img/Logo.png",
        desc: "Alle Gebäude produzieren dauerhaft 25% mehr."
    },
    prod_2: {
        name: "Keks-Synergie",
        type: "factoryMultiplier",
        factor: new Decimal(1.75),
        cost: new Decimal(3),
        tier: 2,
        prereqs: ["prod_1"],
        icon: "img/Logo.png",
        desc: "Die Produktionsboni aller Gebäude werden weiter verstärkt."
    },
    core: {
        name: "Wurstwasser-Kern",
        type: "globalMultiplier",
        factor: new Decimal(1.5),
        cost: new Decimal(5),
        tier: 3,
        prereqs: ["click_2", "prod_2"],
        icon: "img/Logo.png",
        desc: "Alle dauerhaften Boni werden noch einmal um 50% verstärkt."
    },
    click_3: {
        name: "Finger-Fokus",
        type: "clickFlat",
        value: new Decimal(5),
        cost: new Decimal(4),
        tier: 3,
        prereqs: ["click_2"],
        icon: "img/Keks.svg",
        desc: "Jeder Klick gibt zusätzlich +5 Kekse."
    },
    prod_3: {
        name: "Ofen-Orchester",
        type: "factoryMultiplier",
        factor: new Decimal(2),
        cost: new Decimal(5),
        tier: 3,
        prereqs: ["prod_2"],
        icon: "img/Logo.png",
        desc: "Alle Gebaeude arbeiten im Takt und produzieren doppelt."
    },
    click_4: {
        name: "Praezisionsklick",
        type: "clickMultiplier",
        factor: new Decimal(3),
        cost: new Decimal(8),
        tier: 4,
        prereqs: ["click_3", "core"],
        icon: "img/Keks.svg",
        desc: "Verdreifacht den permanenten Klickwert."
    },
    prod_4: {
        name: "Massenproduktion",
        type: "factoryMultiplier",
        factor: new Decimal(2.5),
        cost: new Decimal(8),
        tier: 4,
        prereqs: ["prod_3", "core"],
        icon: "img/Logo.png",
        desc: "Ein grosser Produktionsschub fuer alle Gebaeude."
    },
    core_2: {
        name: "Wurstkern-Reaktor",
        type: "globalMultiplier",
        factor: new Decimal(2),
        cost: new Decimal(13),
        tier: 5,
        prereqs: ["click_4", "prod_4"],
        icon: "img/Logo.png",
        desc: "Verdoppelt alle permanenten Rebirth-Boni erneut."
    },
    click_5: {
        name: "Hyper-Reflex",
        type: "clickFlat",
        value: new Decimal(25),
        cost: new Decimal(21),
        tier: 6,
        prereqs: ["core_2"],
        icon: "img/Keks.svg",
        desc: "Jeder Klick erhaelt einen massiven +25 Bonus."
    },
    prod_5: {
        name: "Endlos-Baeckerei",
        type: "factoryMultiplier",
        factor: new Decimal(4),
        cost: new Decimal(21),
        tier: 6,
        prereqs: ["core_2"],
        icon: "img/Logo.png",
        desc: "Spiele mit voller Produktionskraft: x4 auf alle Gebaeude."
    },
    apex: {
        name: "Keks-Apex",
        type: "globalMultiplier",
        factor: new Decimal(3),
        cost: new Decimal(34),
        tier: 7,
        prereqs: ["click_5", "prod_5"],
        icon: "img/Logo.png",
        desc: "Der finale Knoten: verdreifacht Klick und Produktion dauerhaft."
    }
};