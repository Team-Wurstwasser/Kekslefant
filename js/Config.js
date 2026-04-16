const factoryData = {
    huette: {
        name: "Hefe Hütte",
        basePrice: new Big(15),
        cps: new Big(1),
        icon: "img/Huette.png"
    },
    kristall: {
        name: "Kristall-Konditorei",
        basePrice: new Big(100),
        cps: new Big(5),
        icon: "img/Kristall.png"
    },
    plasma: {
        name: "Plasma-Keks-Generator",
        basePrice: new Big(1100),
        cps: new Big(40),
        icon: "img/Plasma.png"
    },
    labor: {
        name: "Licht-Keks-Labor",
        basePrice: new Big(12000),
        cps: new Big(200),
        icon: "img/Labor.png"
    },
    former: {
        name: "Makro-Keks-Former",
        basePrice: new Big(130000),
        cps: new Big(1000),
        icon: "img/Former.png"
    },
    ofen: {
        name: "Schwerkraft-Ofen",
        basePrice: new Big(1400000),
        cps: new Big(6500),
        icon: "img/Ofen.png"
    },
    sonde: {
        name: "Back-Sonde",
        basePrice: new Big(20000000),
        cps: new Big(40000),
        icon: "img/Sonde.png"
    }
};

const upgradeData = {
    click_1: {
        name: "Verstärkter Zeigefinger",
        type: "clickBoost",
        boost: new Big(1),
        price: new Big(50),
        icon: "img/Keks.svg",
        desc: "Jeder Klick bringt +1 Keks mehr."
    },
    click_2: {
        name: "Titan-Mausrad",
        type: "clickMultiplier",
        factor: new Big(2),
        price: new Big(5000),
        icon: "img/Keks.svg",
        desc: "Verdoppelt die Effizienz deiner Klicks!"
    },
    click_3: {
        name: "Diamant-Cursor",
        type: "clickMultiplier",
        factor: new Big(5),
        price: new Big(2500000),
        icon: "img/Keks.svg",
        desc: "Deine Klicks sind nun 5-mal so mächtig."
    },
    click_4: {
        name: "Quanten-Clicker",
        type: "clickMultiplier",
        factor: new Big(10),
        price: new Big(1000000000),
        icon: "img/Keks.svg",
        desc: "Ein Klick, tausend Realitäten. Klick-Wert x10."
    },
    huette_1: {
        name: "Bio-Hefe",
        type: "multiplier",
        target: "huette",
        price: new Big(500),
        factor: new Big(2),
        icon: "img/Huette.png",
        desc: "Die Hefe-Hütten produzieren doppelt so schnell."
    },
    huette_2: {
        name: "Hefe-Mutation",
        type: "multiplier",
        target: "huette",
        price: new Big(15000),
        factor: new Big(4),
        icon: "img/Huette.png",
        desc: "Die Hefe ist nun intelligent. Hütten produzieren 4-mal so viel."
    },
    huette_3: {
        name: "Hütten-Automatik",
        type: "multiplier",
        target: "huette",
        price: new Big(1000000),
        factor: new Big(10),
        icon: "img/Huette.png",
        desc: "Vollautomatische Teigführung. Hütten x10."
    },
    kristall_1: {
        name: "Hochglanz-Prismen",
        type: "multiplier",
        target: "kristall",
        price: new Big(5000),
        factor: new Big(2),
        icon: "img/Kristall.png",
        desc: "Kristall-Konditoreien glänzen mit 100% mehr Ertrag."
    },
    kristall_2: {
        name: "Zucker-Diamanten",
        type: "multiplier",
        target: "kristall",
        price: new Big(250000),
        factor: new Big(4),
        icon: "img/Kristall.png",
        desc: "Konditoreien produzieren 4-mal so viel."
    },
    kristall_3: {
        name: "Reinstkristall-Gitter",
        type: "multiplier",
        target: "kristall",
        price: new Big(25000000),
        factor: new Big(8),
        icon: "img/Kristall.png",
        desc: "Perfekte Molekularstruktur. Kristall-Konditoreien x8."
    },
    plasma_1: {
        name: "Ionen-Beschleuniger",
        type: "multiplier",
        target: "plasma",
        price: new Big(50000),
        factor: new Big(2),
        icon: "img/Plasma.png",
        desc: "Stabilisiert den Plasma-Fluss für doppelte Produktion."
    },
    plasma_2: {
        name: "Dunkle Materie Kern",
        type: "multiplier",
        target: "plasma",
        price: new Big(3000000),
        factor: new Big(4),
        icon: "img/Plasma.png",
        desc: "Plasma-Generatoren erreichen die kritische Masse. Output x4."
    },
    plasma_3: {
        name: "Supernova-Einspeisung",
        type: "multiplier",
        target: "plasma",
        price: new Big(150000000),
        factor: new Big(10),
        icon: "img/Plasma.png",
        desc: "Direkte Energie aus dem Kern eines Sterns. Plasma x10."
    },
    labor_1: {
        name: "Quanten-Backofen",
        type: "multiplier",
        target: "labor",
        price: new Big(500000),
        factor: new Big(2),
        icon: "img/Labor.png",
        desc: "Licht-Keks-Labore verdoppeln ihren Output."
    },
    labor_2: {
        name: "Zeitkrümmungs-Backen",
        type: "multiplier",
        target: "labor",
        price: new Big(40000000),
        factor: new Big(4),
        icon: "img/Labor.png",
        desc: "Die Kekse sind fertig, bevor der Teig existiert. Labor x4."
    },
    labor_3: {
        name: "Parallelwelt-Labor",
        type: "multiplier",
        target: "labor",
        price: new Big(2000000000),
        factor: new Big(10),
        icon: "img/Labor.png",
        desc: "Importiert Kekse aus Dimensionen, in denen es nur Kekse gibt. x10."
    },
    former_1: {
        name: "Atomare Symmetrie",
        type: "multiplier",
        target: "former",
        price: new Big(50000000),
        factor: new Big(2),
        icon: "img/Former.png",
        desc: "Makro-Keks-Former arbeiten nun doppelt so effizient."
    },
    former_2: {
        name: "Fraktale Geometrie",
        type: "multiplier",
        target: "former",
        price: new Big(5000000000),
        factor: new Big(4),
        icon: "img/Former.png",
        desc: "Die Formgebung ist nun 4-mal effizienter."
    },
    ofen_1: {
        name: "Ereignishorizont-Grill",
        type: "multiplier",
        target: "ofen",
        price: new Big(5000000000),
        factor: new Big(2),
        icon: "img/Ofen.png",
        desc: "Schwerkraft-Öfen nutzen die Krümmung für doppeltes Backtempo."
    },
    ofen_2: {
        name: "Singularitäts-Hitze",
        type: "multiplier",
        target: "ofen",
        price: new Big(250000000000),
        factor: new Big(4),
        icon: "img/Ofen.png",
        desc: "Die Hitze eines sterbenden Sterns. Schwerkraft-Öfen x4."
    },
    sonde_1: {
        name: "Deep-Space-Backen",
        type: "multiplier",
        target: "sonde",
        price: new Big(50000000000),
        factor: new Big(2),
        icon: "img/Sonde.png",
        desc: "Back-Sonden finden effizientere Routen im All (x2)."
    },
    sonde_2: {
        name: "Galaktisches Netzwerk",
        type: "multiplier",
        target: "sonde",
        price: new Big(1000000000000),
        factor: new Big(5),
        icon: "img/Sonde.png",
        desc: "Ein intergalaktisches Liefernetzwerk. Sonden-Effizienz x5."
    },
    global_1: {
        name: "Keks-Imperium",
        type: "globalMultiplier",
        factor: new Big(1.5),
        price: new Big(1000000000000),
        icon: "img/Logo.png",
        desc: "Erhöht die Produktion ALLER Gebäude um 50%!"
    },
    global_2: {
        name: "Keks-Relativität",
        type: "globalMultiplier",
        factor: new Big(2),
        price: new Big(50000000000000),
        icon: "img/Logo.png",
        desc: "E=mc²? Nein, Energie = mehr Cookies! Alles wird verdoppelt."
    },
    global_3: {
        name: "Universelle Keks-Konstante",
        type: "globalMultiplier",
        factor: new Big(5),
        price: new Big(1000000000000000),
        icon: "img/Logo.png",
        desc: "Das Universum besteht nun zu 5% aus Keksteig. Alles x5."
    }
};

const rebirthConfig = {
    baseCookies: new Big(1000000),
    bonusPerPoint: new Big(0.05)
};