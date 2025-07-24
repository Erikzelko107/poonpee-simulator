const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const stockGraphCanvas = document.getElementById('stockGraph');
const stockGraphCtx = stockGraphCanvas.getContext('2d');
let poopCoins = 0;
let rectumSize = 1;
let bladderSize = 1;
let toiletLevel = 1;
let foodLevel = 0;
let autoPoopLevel = 0;
let autoPeeLevel = 0;
let critChanceLevel = 1;
let poopCooldown = 0;
let peeCooldown = 0;
let autoPoopCooldown = 0;
let autoPeeCooldown = 0;
let lastStockUpdate = 0;
const BASE_COOLDOWN = 5000;
const PEE_COOLDOWN_MULTIPLIER = 0.7;
const COOLDOWN_REDUCTION = [0, 500, 1000, 1500, 2000, 2500];
const AUTO_COOLDOWN = 10000;
const AUTO_COOLDOWN_REDUCTION = [0, 1000, 2000, 3000, 4000];
const UPGRADE_COSTS = {
    rectum: [100, 300, 1000, 3000, 10000],
    bladder: [50, 150, 500, 1500, 5000],
    toilet: [200, 600, 2000, 6000, 20000],
    autoPoop: [500, 1000, 2000, 4000, 8000],
    autoPee: [300, 600, 1200, 2400, 4800],
    critChance: [200, 600, 1800, 5400, 16200]
};
const FOOD_COSTS = { apple: 0, meat: 150, laxative: 500, taco: 1500, atomic: 5000 };
const SKIN_COSTS = { basic: 0, gold: 1000, diamond: 3000, ruby: 5000, emerald: 8000, onyx: 10000 };
const STOCKS = [
    { name: 'Tento Papier', price: 1000, basePrice: 1000, owned: 0, history: [1000] },
    { name: 'Caca Cola', price: 2000, basePrice: 2000, owned: 0, history: [2000] },
    { name: 'Skibidi Toilet', price: 5000, basePrice: 5000, owned: 0, history: [5000] },
    { name: 'MineKakať', price: 10000, basePrice: 10000, owned: 0, history: [10000] },
    { name: 'CikiBook', price: 20000, basePrice: 20000, owned: 0, history: [20000] },
    { name: 'MicroPoop', price: 30000, basePrice: 30000, owned: 0, history: [30000] }
];
const SKINS = [
    { name: 'Základný', color: '#ffffff' },
    { name: 'Zlatý', color: '#ffd700' },
    { name: 'Diamantový', color: '#00ffff' },
    { name: 'Rubínový', color: '#c71585' },
    { name: 'Smaragdový', color: '#00ff7f' },
    { name: 'Onixový', color: '#2f2f2f' },
    { name: 'Starý Ružový', color: '#ff69b4' }
];
const FOODS = [
    { name: 'Jablko', level: 0 },
    { name: 'Mäso', level: 1 },
    { name: 'Prejímadlo', level: 2 },
    { name: 'Taco Bang', level: 3 },
    { name: 'Atómová kaša', level: 4 },
    { name: 'Zavárané prdy', level: 5 }
];
const CRIT_CHANCES = [0.05, 0.1, 0.15, 0.2, 0.25];
const AUTO_CRIT_CHANCES = [0.025, 0.05, 0.075, 0.1, 0.125];
const ACHIEVEMENTS = [
    { name: 'Majster Záchoda', description: 'Všetky upgrady na MAX', reward: 5000, achieved: false, condition: () => rectumSize === 5 && bladderSize === 5 && toiletLevel === 5 && autoPoopLevel === 5 && autoPeeLevel === 5 && critChanceLevel === 5 },
    { name: 'Krviprelievač', description: 'Investuj 100,000 Poop Coinov', reward: 2000, achieved: false, condition: () => STOCKS.reduce((sum, stock) => sum + stock.owned * stock.basePrice, 0) >= 100000 },
    { name: 'Zberateľ Skinov', description: 'Vlastni všetky známe skiny', reward: 3000, achieved: false, condition: () => ownedSkins.filter(id => id !== 6).length === 6 },
    { name: 'Gurmán Kadenia', description: 'Vlastni všetky známe jedlá', reward: 2500, achieved: false, condition: () => ownedFoods.filter(id => id !== 5).length === 5 },
    { name: 'Päťminútová Výdrž', description: 'Vypni Auto Kadenie a Auto Čúranie na 5 minút (ak sú kúpené)', reward: 1500, achieved: false, condition: () => false },
    { name: 'Kakamillionár', description: 'Vlastni 20 akcií MicroPoop', reward: 4000, achieved: false, condition: () => STOCKS[5].owned >= 20 }
];
const TRANSLATIONS = {
    sk: {
        coins: 'Poop Coiny',
        rectum: 'Konečník: Úroveň',
        bladder: 'Mechúr: Úroveň',
        toilet: 'Záchod: Úroveň',
        food: 'Jedlo',
        autoPoop: 'Auto Kadenie',
        autoPee: 'Auto Čúranie',
        critChance: 'Critical Hit: Úroveň',
        poopCooldown: 'Cooldown Kad',
        peeCooldown: 'Cooldown Čúr',
        poopButton: 'Kadiť',
        peeButton: 'Čúrať',
        menuButton: 'Menu',
        menu: 'Menu',
        upgradesButton: 'Upgrady',
        shopButton: 'Obchod',
        catalogButton: 'Katalóg',
        codesButton: 'Kódy',
        investmentsButton: 'Investície',
        achievementsButton: 'Achievements',
        howToPlayButton: 'Ako Hrať',
        settingsButton: 'Nastavenia',
        closeMenuButton: 'Zatvoriť',
        upgradesMenu: 'Upgrady',
        rectumUpgrade: 'Upgrade Konečník',
        bladderUpgrade: 'Upgrade Mechúr',
        toiletUpgrade: 'Upgrade Záchod',
        autoPoopUpgrade: 'Odomknúť/Upgrade Auto Kadenie',
        autoPeeUpgrade: 'Odomknúť/Upgrade Auto Čúranie',
        critChanceUpgrade: 'Upgrade Critical Hit',
        shopMenu: 'Obchod',
        foods: 'Jedlá',
        skins: 'Skiny',
        foodApple: 'Jablko',
        foodMeat: 'Mäso',
        foodLaxative: 'Prejímadlo',
        foodTaco: 'Taco Bang',
        foodAtomic: 'Atómová kaša',
        skinBasic: 'Základný',
        skinGold: 'Zlatý',
        skinDiamond: 'Diamantový',
        skinRuby: 'Rubínový',
        skinEmerald: 'Smaragdový',
        skinOnyx: 'Onixový',
        catalogMenu: 'Katalóg',
        selectFood: 'Vybrať Jedlo',
        selectSkin: 'Vybrať Skin',
        autoActions: 'Automatické akcie',
        selectApple: 'Jablko',
        selectMeat: 'Mäso',
        selectLaxative: 'Prejímadlo',
        selectTaco: 'Taco Bang',
        selectAtomic: 'Atómová kaša',
        selectFarty: 'Zavárané prdy',
        selectBasic: 'Základný',
        selectGold: 'Zlatý',
        selectDiamond: 'Diamantový',
        selectRuby: 'Rubínový',
        selectEmerald: 'Smaragdový',
        selectOnyx: 'Onixový',
        selectOgpink: 'Starý Ružový',
        toggleAutoPoop: 'Auto Kadenie',
        toggleAutoPee: 'Auto Čúranie',
        codesMenu: 'Kódy',
        codeInput: 'Zadaj kód',
        submitCode: 'Potvrdiť',
        investmentsMenu: 'Investície',
        achievementsMenu: 'Achievements',
        howToPlayMenu: 'Ako Hrať',
        settingsMenu: 'Nastavenia',
        particles: 'Častice',
        poopParticles: 'Častice Kadenia',
        peeParticles: 'Častice Čúrania',
        critParticles: 'Častice Critical Hit',
        font: 'Font',
        language: 'Jazyk',
        howToPlayText: `
            <p>Vitaj v Poo'n'Pee Simulator! Tvoj cieľ je zbierať Poop Coiny kadením a čúraním na záchode.</p>
            <ul>
                <li><strong>Kadenie/Čúranie</strong>: Klikni na tlačidlá "Kadiť" (10 coinov × úroveň konečníka × záchod) alebo "Čúrať" (7 coinov × úroveň mechúra × záchod). Cooldown je 5s/3.5s, znížený jedlom. Alebo použi klávesy <strong>K</strong> (Kadiť) a <strong>C</strong> (Čúrať).</li>
                <li><strong>Upgrady</strong>: Zvyš úroveň konečníka, mechúra, záchoda, Auto Kadenia/Čúrania a Critical Hitu za coiny.</li>
                <li><strong>Obchod</strong>: Kúp jedlá (znižujú cooldown) a skiny (menia vzhľad záchoda).</li>
                <li><strong>Katalóg</strong>: Vyber si kúpené jedlo, skin alebo zapni/vypni Auto akcie.</li>
                <li><strong>Kódy</strong>: Zadaj kódy (napr. "TutorialMoney" pre 250 coinov) na odmeny.</li>
                <li><strong>Investície</strong>: Kúp/predaj akcie firiem, ktorých ceny kolíšu každých 30s. Sleduj graf cien.</li>
                <li><strong>Achievements</strong>: Plň úlohy (napr. kúp všetky skiny) pre odmeny.</li>
                <li><strong>Nastavenia</strong>: Uprav font, jazyk alebo zapni/vypni častice pre kadenie, čúranie a Critical Hity.</li>
            </ul>
            <p><strong>Klávesové skratky</strong>: Stlač <strong>K</strong> na Kadenie, <strong>C</strong> na Čúranie, <strong>M</strong> na otvorenie Menu, <strong>X</strong> na zatvorenie podmenu alebo celého menu.</p>
            <p>Hraj, zbieraj coiny a staň sa majstrom záchoda!</p>
        `
    },
    en: {
        coins: 'Poop Coins',
        rectum: 'Rectum: Level',
        bladder: 'Bladder: Level',
        toilet: 'Toilet: Level',
        food: 'Food',
        autoPoop: 'Auto Poop',
        autoPee: 'Auto Pee',
        critChance: 'Critical Hit: Level',
        poopCooldown: 'Poop Cooldown',
        peeCooldown: 'Pee Cooldown',
        poopButton: 'Poop',
        peeButton: 'Pee',
        menuButton: 'Menu',
        menu: 'Menu',
        upgradesButton: 'Upgrades',
        shopButton: 'Shop',
        catalogButton: 'Catalog',
        codesButton: 'Codes',
        investmentsButton: 'Investments',
        achievementsButton: 'Achievements',
        howToPlayButton: 'How to Play',
        settingsButton: 'Settings',
        closeMenuButton: 'Close',
        upgradesMenu: 'Upgrades',
        rectumUpgrade: 'Upgrade Rectum',
        bladderUpgrade: 'Upgrade Bladder',
        toiletUpgrade: 'Upgrade Toilet',
        autoPoopUpgrade: 'Unlock/Upgrade Auto Poop',
        autoPeeUpgrade: 'Unlock/Upgrade Auto Pee',
        critChanceUpgrade: 'Upgrade Critical Hit',
        shopMenu: 'Shop',
        foods: 'Foods',
        skins: 'Skins',
        foodApple: 'Apple',
        foodMeat: 'Meat',
        foodLaxative: 'Laxative',
        foodTaco: 'Taco Bang',
        foodAtomic: 'Atomic Mash',
        skinBasic: 'Basic',
        skinGold: 'Gold',
        skinDiamond: 'Diamond',
        skinRuby: 'Ruby',
        skinEmerald: 'Emerald',
        skinOnyx: 'Onyx',
        catalogMenu: 'Catalog',
        selectFood: 'Select Food',
        selectSkin: 'Select Skin',
        autoActions: 'Automatic Actions',
        selectApple: 'Apple',
        selectMeat: 'Meat',
        selectLaxative: 'Laxative',
        selectTaco: 'Taco Bang',
        selectAtomic: 'Atomic Mash',
        selectFarty: 'Pickled Farts',
        selectBasic: 'Basic',
        selectGold: 'Gold',
        selectDiamond: 'Diamond',
        selectRuby: 'Ruby',
        selectEmerald: 'Emerald',
        selectOnyx: 'Onyx',
        selectOgpink: 'Old Pink',
        toggleAutoPoop: 'Auto Poop',
        toggleAutoPee: 'Auto Pee',
        codesMenu: 'Codes',
        codeInput: 'Enter code',
        submitCode: 'Submit',
        investmentsMenu: 'Investments',
        achievementsMenu: 'Achievements',
        howToPlayMenu: 'How to Play',
        settingsMenu: 'Settings',
        particles: 'Particles',
        poopParticles: 'Poop Particles',
        peeParticles: 'Pee Particles',
        critParticles: 'Critical Hit Particles',
        font: 'Font',
        language: 'Language',
        howToPlayText: `
            <p>Welcome to Poo'n'Pee Simulator! Your goal is to collect Poop Coins by pooping and peeing on the toilet.</p>
            <ul>
                <li><strong>Pooping/Peeing</strong>: Click the "Poop" (10 coins × rectum level × toilet) or "Pee" (7 coins × bladder level × toilet) buttons. Cooldown is 5s/3.5s, reduced by food. Or use <strong>K</strong> (Poop) and <strong>C</strong> (Pee) keys.</li>
                <li><strong>Upgrades</strong>: Increase rectum, bladder, toilet, Auto Poop/Pee, and Critical Hit levels with coins.</li>
                <li><strong>Shop</strong>: Buy foods (reduce cooldown) and skins (change toilet appearance).</li>
                <li><strong>Catalog</strong>: Select purchased food, skin, or enable/disable Auto actions.</li>
                <li><strong>Codes</strong>: Enter codes (e.g., "TutorialMoney" for 250 coins) for rewards.</li>
                <li><strong>Investments</strong>: Buy/sell company stocks with prices fluctuating every 30s. Watch the price graph.</li>
                <li><strong>Achievements</strong>: Complete tasks (e.g., buy all skins) for rewards.</li>
                <li><strong>Settings</strong>: Adjust font, language, or enable/disable particles for pooping, peeing, and Critical Hits.</li>
            </ul>
            <p><strong>Keyboard Shortcuts</strong>: Press <strong>K</strong> to Poop, <strong>C</strong> to Pee, <strong>M</strong> to open Menu, <strong>X</strong> to close submenu or entire menu.</p>
            <p>Play, collect coins, and become a toilet master!</p>
        `
    }
};
let currentSkin = 0;
let currentFood = 0;
let ownedFoods = [0];
let ownedSkins = [0];
let lastPoopTime = 0;
let lastPeeTime = 0;
let lastAutoPoopTime = 0;
let lastAutoPeeTime = 0;
let isMenuOpen = false;
let isAutoPoopEnabled = false;
let isAutoPeeEnabled = false;
let isOnlyCritical = false;
let critMessage = '';
let critMessageTimer = 0;
let usedCodes = [];
let autoDisabledStartTime = null;
let particles = [];
let currentGraphStock = 0;
let settings = {
    poopParticles: true,
    peeParticles: true,
    critParticles: true,
    font: 'Arial',
    language: 'sk'
};

function saveProgress() {
    const gameState = {
        poopCoins,
        rectumSize,
        bladderSize,
        toiletLevel,
        foodLevel,
        autoPoopLevel,
        autoPeeLevel,
        critChanceLevel,
        currentSkin,
        currentFood,
        ownedFoods,
        ownedSkins,
        isAutoPoopEnabled,
        isAutoPeeEnabled,
        isOnlyCritical,
        usedCodes,
        settings,
        STOCKS: STOCKS.map(stock => ({
            name: stock.name,
            price: stock.price,
            basePrice: stock.basePrice,
            owned: stock.owned,
            history: stock.history
        })),
        ACHIEVEMENTS: ACHIEVEMENTS.map(ach => ({
            name: ach.name,
            achieved: ach.achieved
        }))
    };
    localStorage.setItem('poonpeeSimulator', JSON.stringify(gameState));
}

function loadProgress() {
    const savedState = localStorage.getItem('poonpeeSimulator');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        poopCoins = gameState.poopCoins || 0;
        rectumSize = gameState.rectumSize || 1;
        bladderSize = gameState.bladderSize || 1;
        toiletLevel = gameState.toiletLevel || 1;
        foodLevel = gameState.foodLevel || 0;
        autoPoopLevel = gameState.autoPoopLevel || 0;
        autoPeeLevel = gameState.autoPeeLevel || 0;
        critChanceLevel = gameState.critChanceLevel || 1;
        currentSkin = gameState.currentSkin || 0;
        currentFood = gameState.currentFood || 0;
        ownedFoods = gameState.ownedFoods || [0];
        ownedSkins = gameState.ownedSkins || [0];
        isAutoPoopEnabled = gameState.isAutoPoopEnabled || false;
        isAutoPeeEnabled = gameState.isAutoPeeEnabled || false;
        isOnlyCritical = gameState.isOnlyCritical || false;
        usedCodes = gameState.usedCodes || [];
        settings = gameState.settings || {
            poopParticles: true,
            peeParticles: true,
            critParticles: true,
            font: 'Arial',
            language: 'sk'
        };
        STOCKS.forEach((stock, index) => {
            if (gameState.STOCKS[index]) {
                stock.price = gameState.STOCKS[index].price;
                stock.owned = gameState.STOCKS[index].owned;
                stock.history = gameState.STOCKS[index].history;
            }
        });
        ACHIEVEMENTS.forEach((ach, index) => {
            if (gameState.ACHIEVEMENTS[index]) {
                ach.achieved = gameState.ACHIEVEMENTS[index].achieved;
            }
        });
    }
    applySettings();
    updateUI();
}

function applySettings() {
    document.body.style.fontFamily = settings.font;
    ctx.font = `20px ${settings.font}`;
    stockGraphCtx.font = `12px ${settings.font}`;
    updateUI();
}

function createParticles(x, y, count, isCritical, isPoop) {
    if ((isPoop && !settings.poopParticles) || (!isPoop && !settings.peeParticles) || (isCritical && !settings.critParticles)) return;
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            radius: isCritical ? Math.random() * 6 + 3 : Math.random() * 3 + 1,
            life: 1000,
            startTime: Date.now(),
            color: isCritical ? '#ff0000' : (isPoop ? '#8b4513' : '#ffff00')
        });
    }
}

function updateParticles() {
    const currentTime = Date.now();
    particles = particles.filter(p => currentTime - p.startTime < p.life);
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 16;
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawToilet() {
    ctx.fillStyle = SKINS[currentSkin].color;
    ctx.beginPath();
    ctx.ellipse(200, 350, 100, 60, 0, 0, Math.PI * 2); // Misa
    ctx.fill();
    ctx.fillStyle = '#0000ff';
    ctx.beginPath();
    ctx.ellipse(200, 350, 80, 40, 0, 0, Math.PI * 2); // Voda
    ctx.fill();
    ctx.fillStyle = SKINS[currentSkin].color;
    ctx.fillRect(150, 250, 100, 50); // Nádrž
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(200, 350, 90, 50, 0, 0, Math.PI * 2); // Sedadlo
    ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.fillText(`${TRANSLATIONS[settings.language].toilet}: ${SKINS[currentSkin].name}`, 100, 230);
    if (critMessage && critMessageTimer > Date.now()) {
        ctx.fillStyle = '#ff0000';
        ctx.fillText(critMessage, 100, 450);
    }
    drawParticles();
}

function getCritMultiplier(isAuto, isPoop) {
    const isCritical = isOnlyCritical || Math.random() < (isAuto ? AUTO_CRIT_CHANCES[critChanceLevel - 1] : CRIT_CHANCES[critChanceLevel - 1]);
    if (isCritical) {
        critMessage = settings.language === 'sk' ? 'ŠPLECH! Critical Hit!' : 'SPLASH! Critical Hit!';
        critMessageTimer = Date.now() + 2000;
        createParticles(200, 350, 10, true, isPoop);
        return 2;
    }
    createParticles(200, 350, 5, false, isPoop);
    return 1;
}

function updateStocks(currentTime) {
    if (currentTime - lastStockUpdate >= 30000) { // Každých 30 sekúnd
        STOCKS.forEach(stock => {
            const change = Math.random() * 0.2 - 0.1; // ±10% zmena
            stock.price = Math.round(Math.max(100, stock.basePrice * (1 + change)));
            stock.history.push(stock.price);
            if (stock.history.length > 100) stock.history.shift(); // Max 100 záznamov
        });
        lastStockUpdate = currentTime;
        saveProgress();
    }
    const stocksDiv = document.getElementById('stocks');
    stocksDiv.innerHTML = '';
    STOCKS.forEach((stock, index) => {
        const div = document.createElement('div');
        div.innerHTML = `${stock.name}: ${TRANSLATIONS[settings.language].price} ${stock.price} | ${TRANSLATIONS[settings.language].owned}: ${stock.owned} <br>` +
            `<input type="number" id="stockAmount${index}" placeholder="${TRANSLATIONS[settings.language].amount}" min="1">` +
            `<button onclick="buyStock(${index})">${TRANSLATIONS[settings.language].buy}</button>` +
            `<button onclick="sellStock(${index})">${TRANSLATIONS[settings.language].sell}</button>`;
        stocksDiv.appendChild(div);
    });
    drawStockGraph();
}

function drawStockGraph() {
    stockGraphCtx.clearRect(0, 0, stockGraphCanvas.width, stockGraphCanvas.height);
    const history = STOCKS[currentGraphStock].history;
    if (history.length < 2) return;
    const maxPrice = Math.max(...history);
    const minPrice = Math.min(...history);
    const priceRange = maxPrice - minPrice || 1;
    stockGraphCtx.strokeStyle = '#0000ff';
    stockGraphCtx.lineWidth = 2;
    stockGraphCtx.beginPath();
    const step = stockGraphCanvas.width / (history.length - 1);
    history.forEach((price, i) => {
        const x = i * step;
        const y = stockGraphCanvas.height - ((price - minPrice) / priceRange) * stockGraphCanvas.height;
        if (i === 0) stockGraphCtx.moveTo(x, y);
        else stockGraphCtx.lineTo(x, y);
    });
    stockGraphCtx.stroke();
    stockGraphCtx.fillStyle = '#000000';
    stockGraphCtx.fillText(STOCKS[currentGraphStock].name, 10, 20);
    stockGraphCtx.fillText(`${TRANSLATIONS[settings.language].min}: ${minPrice}`, 10, stockGraphCanvas.height - 10);
    stockGraphCtx.fillText(`${TRANSLATIONS[settings.language].max}: ${maxPrice}`, 10, 30);
}

function buyStock(index) {
    const stock = STOCKS[index];
    const amount = parseInt(document.getElementById(`stockAmount${index}`).value) || 0;
    const totalCost = stock.price * amount;
    if (amount > 0 && poopCoins >= totalCost) {
        poopCoins -= totalCost;
        stock.owned += amount;
        document.getElementById(`stockAmount${index}`).value = '';
        updateUI();
        saveProgress();
    } else {
        alert(amount <= 0 ? TRANSLATIONS[settings.language].invalidAmount : TRANSLATIONS[settings.language].notEnoughCoins);
    }
}

function sellStock(index) {
    const stock = STOCKS[index];
    const amount = parseInt(document.getElementById(`stockAmount${index}`).value) || 0;
    if (amount > 0 && stock.owned >= amount) {
        poopCoins += stock.price * amount;
        stock.owned -= amount;
        document.getElementById(`stockAmount${index}`).value = '';
        updateUI();
        saveProgress();
    } else {
        alert(amount <= 0 ? TRANSLATIONS[settings.language].invalidAmount : TRANSLATIONS[settings.language].notEnoughStocks);
    }
}

function updateAchievements() {
    const achievementsList = document.getElementById('achievementsList');
    achievementsList.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
        if (ach.condition() && !ach.achieved) {
            ach.achieved = true;
            poopCoins += ach.reward;
            alert(`${TRANSLATIONS[settings.language].achievementUnlocked}: ${ach.name}! ${TRANSLATIONS[settings.language].reward}: ${ach.reward} ${TRANSLATIONS[settings.language].coins}`);
            saveProgress();
        }
        const div = document.createElement('div');
        div.textContent = `${ach.name}: ${ach.description} (${ach.achieved ? TRANSLATIONS[settings.language].achieved : TRANSLATIONS[settings.language].notAchieved}) - ${TRANSLATIONS[settings.language].reward}: ${ach.reward} ${TRANSLATIONS[settings.language].coins}`;
        achievementsList.appendChild(div);
    });
}

function updateUI() {
    const t = TRANSLATIONS[settings.language];
    document.getElementById('coins').textContent = `${t.coins}: ${poopCoins}`;
    document.getElementById('rectum').textContent = `${t.rectum} ${rectumSize}${rectumSize === 5 ? ' (MAX)' : ''}`;
    document.getElementById('bladder').textContent = `${t.bladder} ${bladderSize}${bladderSize === 5 ? ' (MAX)' : ''}`;
    document.getElementById('toilet').textContent = `${t.toilet} ${toiletLevel}${toiletLevel === 5 ? ' (MAX)' : ''}`;
    document.getElementById('food').textContent = `${t.food}: ${FOODS[currentFood].name}`;
    document.getElementById('autoPoop').textContent = `${t.autoPoop}: ${autoPoopLevel > 0 ? t.level + ' ' + autoPoopLevel + (isAutoPoopEnabled ? ' (' + t.enabled + ')' : ' (' + t.disabled + ')') : t.notUnlocked}`;
    document.getElementById('autoPee').textContent = `${t.autoPee}: ${autoPeeLevel > 0 ? t.level + ' ' + autoPeeLevel + (isAutoPeeEnabled ? ' (' + t.enabled + ')' : ' (' + t.disabled + ')') : t.notUnlocked}`;
    document.getElementById('critChance').textContent = `${t.critChance} ${critChanceLevel}${critChanceLevel === 5 ? ' (MAX)' : ''}`;
    document.getElementById('poopCooldown').textContent = `${t.poopCooldown}: ${(poopCooldown / 1000).toFixed(1)}s`;
    document.getElementById('peeCooldown').textContent = `${t.peeCooldown}: ${(peeCooldown / 1000).toFixed(1)}s`;
    document.getElementById('poopButton').textContent = t.poopButton;
    document.getElementById('peeButton').textContent = t.peeButton;
    document.getElementById('menuButton').textContent = t.menuButton;
    document.getElementById('menu').getElementsByTagName('h2')[0].textContent = t.menu;
    document.getElementById('upgradesButton').textContent = t.upgradesButton;
    document.getElementById('shopButton').textContent = t.shopButton;
    document.getElementById('catalogButton').textContent = t.catalogButton;
    document.getElementById('codesButton').textContent = t.codesButton;
    document.getElementById('investmentsButton').textContent = t.investmentsButton;
    document.getElementById('achievementsButton').textContent = t.achievementsButton;
    document.getElementById('howToPlayButton').textContent = t.howToPlayButton;
    document.getElementById('settingsButton').textContent = t.settingsButton;
    document.getElementById('closeMenuButton').textContent = t.closeMenuButton;
    document.getElementById('upgradesMenu').getElementsByTagName('h3')[0].textContent = t.upgradesMenu;
    document.getElementById('rectumUpgrade').textContent = `${t.rectumUpgrade} (${rectumSize < 5 ? UPGRADE_COSTS.rectum[rectumSize - 1] : 'MAX'})`;
    document.getElementById('bladderUpgrade').textContent = `${t.bladderUpgrade} (${bladderSize < 5 ? UPGRADE_COSTS.bladder[bladderSize - 1] : 'MAX'})`;
    document.getElementById('toiletUpgrade').textContent = `${t.toiletUpgrade} (${toiletLevel < 5 ? UPGRADE_COSTS.toilet[toiletLevel - 1] : 'MAX'})`;
    document.getElementById('autoPoopUpgrade').textContent = `${t.autoPoopUpgrade} (${autoPoopLevel < 5 ? UPGRADE_COSTS.autoPoop[autoPoopLevel] : 'MAX'})`;
    document.getElementById('autoPeeUpgrade').textContent = `${t.autoPeeUpgrade} (${autoPeeLevel < 5 ? UPGRADE_COSTS.autoPee[autoPeeLevel] : 'MAX'})`;
    document.getElementById('critChanceUpgrade').textContent = `${t.critChanceUpgrade} (${critChanceLevel < 5 ? UPGRADE_COSTS.critChance[critChanceLevel - 1] : 'MAX'})`;
    document.getElementById('shopMenu').getElementsByTagName('h3')[0].textContent = t.shopMenu;
    document.getElementById('shopMenu').getElementsByTagName('h4')[0].textContent = t.foods;
    document.getElementById('shopMenu').getElementsByTagName('h4')[1].textContent = t.skins;
    document.getElementById('foodApple').textContent = `${t.foodApple} (${ownedFoods.includes(0) ? t.purchased : FOOD_COSTS.apple})`;
    document.getElementById('foodMeat').textContent = `${t.foodMeat} (${ownedFoods.includes(1) ? t.purchased : FOOD_COSTS.meat})`;
    document.getElementById('foodLaxative').textContent = `${t.foodLaxative} (${ownedFoods.includes(2) ? t.purchased : FOOD_COSTS.laxative})`;
    document.getElementById('foodTaco').textContent = `${t.foodTaco} (${ownedFoods.includes(3) ? t.purchased : FOOD_COSTS.taco})`;
    document.getElementById('foodAtomic').textContent = `${t.foodAtomic} (${ownedFoods.includes(4) ? t.purchased : FOOD_COSTS.atomic})`;
    document.getElementById('skinBasic').textContent = `${t.skinBasic} (${ownedSkins.includes(0) ? t.purchased : SKIN_COSTS.basic})`;
    document.getElementById('skinGold').textContent = `${t.skinGold} (${ownedSkins.includes(1) ? t.purchased : SKIN_COSTS.gold})`;
    document.getElementById('skinDiamond').textContent = `${t.skinDiamond} (${ownedSkins.includes(2) ? t.purchased : SKIN_COSTS.diamond})`;
    document.getElementById('skinRuby').textContent = `${t.skinRuby} (${ownedSkins.includes(3) ? t.purchased : SKIN_COSTS.ruby})`;
    document.getElementById('skinEmerald').textContent = `${t.skinEmerald} (${ownedSkins.includes(4) ? t.purchased : SKIN_COSTS.emerald})`;
    document.getElementById('skinOnyx').textContent = `${t.skinOnyx} (${ownedSkins.includes(5) ? t.purchased : SKIN_COSTS.onyx})`;
    document.getElementById('catalogMenu').getElementsByTagName('h3')[0].textContent = t.catalogMenu;
    document.getElementById('catalogMenu').getElementsByTagName('h4')[0].textContent = t.selectFood;
    document.getElementById('catalogMenu').getElementsByTagName('h4')[1].textContent = t.selectSkin;
    document.getElementById('catalogMenu').getElementsByTagName('h4')[2].textContent = t.autoActions;
    document.getElementById('selectApple').textContent = t.selectApple;
    document.getElementById('selectMeat').textContent = t.selectMeat;
    document.getElementById('selectLaxative').textContent = t.selectLaxative;
    document.getElementById('selectTaco').textContent = t.selectTaco;
    document.getElementById('selectAtomic').textContent = t.selectAtomic;
    document.getElementById('selectFarty').textContent = ownedFoods.includes(5) ? t.selectFarty : 'SecretFood1';
    document.getElementById('selectBasic').textContent = t.selectBasic;
    document.getElementById('selectGold').textContent = t.selectGold;
    document.getElementById('selectDiamond').textContent = t.selectDiamond;
    document.getElementById('selectRuby').textContent = t.selectRuby;
    document.getElementById('selectEmerald').textContent = t.selectEmerald;
    document.getElementById('selectOnyx').textContent = t.selectOnyx;
    document.getElementById('selectOgpink').textContent = ownedSkins.includes(6) ? t.selectOgpink : 'SecretSkin1';
    document.getElementById('toggleAutoPoop').textContent = `${t.toggleAutoPoop}: ${isAutoPoopEnabled ? t.enabled : t.disabled}`;
    document.getElementById('toggleAutoPee').textContent = `${t.toggleAutoPee}: ${isAutoPeeEnabled ? t.enabled : t.disabled}`;
    document.getElementById('codesMenu').getElementsByTagName('h3')[0].textContent = t.codesMenu;
    document.getElementById('codeInput').placeholder = t.codeInput;
    document.getElementById('submitCode').textContent = t.submitCode;
    document.getElementById('investmentsMenu').getElementsByTagName('h3')[0].textContent = t.investmentsMenu;
    document.getElementById('achievementsMenu').getElementsByTagName('h3')[0].textContent = t.achievementsMenu;
    document.getElementById('howToPlayMenu').getElementsByTagName('h3')[0].textContent = t.howToPlayMenu;
    document.getElementById('howToPlayMenu').getElementsByTagName('p')[0].innerHTML = t.howToPlayText;
    document.getElementById('settingsMenu').getElementsByTagName('h3')[0].textContent = t.settingsMenu;
    document.getElementById('settingsMenu').getElementsByTagName('h4')[0].textContent = t.particles;
    document.getElementById('settingsMenu').getElementsByTagName('h4')[1].textContent = t.font;
    document.getElementById('settingsMenu').getElementsByTagName('h4')[2].textContent = t.language;
    document.getElementById('poopParticles').nextSibling.textContent = t.poopParticles;
    document.getElementById('peeParticles').nextSibling.textContent = t.peeParticles;
    document.getElementById('critParticles').nextSibling.textContent = t.critParticles;
    document.getElementById('selectApple').disabled = !ownedFoods.includes(0);
    document.getElementById('selectMeat').disabled = !ownedFoods.includes(1);
    document.getElementById('selectLaxative').disabled = !ownedFoods.includes(2);
    document.getElementById('selectTaco').disabled = !ownedFoods.includes(3);
    document.getElementById('selectAtomic').disabled = !ownedFoods.includes(4);
    document.getElementById('selectFarty').disabled = !ownedFoods.includes(5);
    document.getElementById('selectBasic').disabled = !ownedSkins.includes(0);
    document.getElementById('selectGold').disabled = !ownedSkins.includes(1);
    document.getElementById('selectDiamond').disabled = !ownedSkins.includes(2);
    document.getElementById('selectRuby').disabled = !ownedSkins.includes(3);
    document.getElementById('selectEmerald').disabled = !ownedSkins.includes(4);
    document.getElementById('selectOnyx').disabled = !ownedSkins.includes(5);
    document.getElementById('selectOgpink').disabled = !ownedSkins.includes(6);
    document.getElementById('toggleAutoPoop').disabled = autoPoopLevel === 0;
    document.getElementById('toggleAutoPee').disabled = autoPeeLevel === 0;
    document.getElementById('poopButton').disabled = poopCooldown > 0 || isMenuOpen;
    document.getElementById('peeButton').disabled = peeCooldown > 0 || isMenuOpen;
    updateAchievements();
}

function toggleMenu(show, section = null) {
    isMenuOpen = show;
    document.getElementById('menu').style.display = show ? 'block' : 'none';
    document.getElementById('upgradesMenu').style.display = section === 'upgrades' ? 'block' : 'none';
    document.getElementById('shopMenu').style.display = section === 'shop' ? 'block' : 'none';
    document.getElementById('catalogMenu').style.display = section === 'catalog' ? 'block' : 'none';
    document.getElementById('codesMenu').style.display = section === 'codes' ? 'block' : 'none';
    document.getElementById('investmentsMenu').style.display = section === 'investments' ? 'block' : 'none';
    document.getElementById('achievementsMenu').style.display = section === 'achievements' ? 'block' : 'none';
    document.getElementById('howToPlayMenu').style.display = section === 'howToPlay' ? 'block' : 'none';
    document.getElementById('settingsMenu').style.display = section === 'settings' ? 'block' : 'none';
    stockGraphCanvas.style.display = section === 'investments' ? 'block' : 'none';
    updateUI();
    if (section === 'investments') drawStockGraph();
}

function handleCode() {
    const codeInput = document.getElementById('codeInput').value.toLowerCase().trim();
    const codeMessage = document.getElementById('codeMessage');
    if (usedCodes.includes(codeInput)) {
        codeMessage.textContent = TRANSLATIONS[settings.language].codeUsed;
        return;
    }
    switch (codeInput) {
        case 'developer2025':
            ownedFoods = [0, 1, 2, 3, 4];
            ownedSkins = [0, 1, 2, 3, 4, 5];
            rectumSize = 5;
            bladderSize = 5;
            toiletLevel = 5;
            autoPoopLevel = 5;
            autoPeeLevel = 5;
            critChanceLevel = 5;
            isAutoPoopEnabled = true;
            isAutoPeeEnabled = true;
            codeMessage.textContent = TRANSLATIONS[settings.language].everythingUnlocked;
            break;
        case 'ogpink':
            if (!ownedSkins.includes(6)) {
                ownedSkins.push(6);
                currentSkin = 6;
            }
            codeMessage.textContent = TRANSLATIONS[settings.language].ogpinkUnlocked;
            break;
        case 'richman':
            poopCoins += 999999;
            codeMessage.textContent = TRANSLATIONS[settings.language].richmanReward;
            break;
        case 'tutorialmoney':
            poopCoins += 250;
            codeMessage.textContent = TRANSLATIONS[settings.language].tutorialMoneyReward;
            break;
        case 'onlycritical':
            isOnlyCritical = true;
            codeMessage.textContent = TRANSLATIONS[settings.language].onlyCriticalReward;
            break;
        case 'farty':
            if (!ownedFoods.includes(5)) {
                ownedFoods.push(5);
                currentFood = 5;
                foodLevel = FOODS[5].level;
            }
            codeMessage.textContent = TRANSLATIONS[settings.language].fartyUnlocked;
            break;
        default:
            codeMessage.textContent = TRANSLATIONS[settings.language].invalidCode;
            return;
    }
    usedCodes.push(codeInput);
    updateUI();
    saveProgress();
    document.getElementById('codeInput').value = '';
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!isMenuOpen) {
        const currentTime = Date.now();
        if (poopCooldown > 0) {
            poopCooldown = Math.max(0, BASE_COOLDOWN - COOLDOWN_REDUCTION[foodLevel] - (currentTime - lastPoopTime));
        }
        if (peeCooldown > 0) {
            peeCooldown = Math.max(0, BASE_COOLDOWN * PEE_COOLDOWN_MULTIPLIER - COOLDOWN_REDUCTION[foodLevel] - (currentTime - lastPeeTime));
        }
        if (autoPoopLevel > 0 && isAutoPoopEnabled && autoPoopCooldown <= 0) {
            poopCoins += 10 * rectumSize * toiletLevel * getCritMultiplier(true, true);
            autoPoopCooldown = AUTO_COOLDOWN - AUTO_COOLDOWN_REDUCTION[autoPoopLevel - 1] - COOLDOWN_REDUCTION[foodLevel];
            lastAutoPoopTime = currentTime;
            saveProgress();
        }
        if (autoPeeLevel > 0 && isAutoPeeEnabled && autoPeeCooldown <= 0) {
            poopCoins += 7 * bladderSize * toiletLevel * getCritMultiplier(true, false);
            autoPeeCooldown = AUTO_COOLDOWN * PEE_COOLDOWN_MULTIPLIER - AUTO_COOLDOWN_REDUCTION[autoPeeLevel - 1] - COOLDOWN_REDUCTION[foodLevel];
            lastAutoPeeTime = currentTime;
            saveProgress();
        }
        if (autoPoopLevel > 0 && autoPoopCooldown > 0) {
            autoPoopCooldown = Math.max(0, AUTO_COOLDOWN - AUTO_COOLDOWN_REDUCTION[autoPoopLevel - 1] - COOLDOWN_REDUCTION[foodLevel] - (currentTime - lastAutoPoopTime));
        }
        if (autoPeeLevel > 0 && autoPeeCooldown > 0) {
            autoPeeCooldown = Math.max(0, AUTO_COOLDOWN * PEE_COOLDOWN_MULTIPLIER - AUTO_COOLDOWN_REDUCTION[autoPeeLevel - 1] - COOLDOWN_REDUCTION[foodLevel] - (currentTime - lastAutoPeeTime));
        }
        if (autoPoopLevel > 0 && autoPeeLevel > 0 && !isAutoPoopEnabled && !isAutoPeeEnabled) {
            if (!autoDisabledStartTime) autoDisabledStartTime = currentTime;
            if (currentTime - autoDisabledStartTime >= 5 * 60 * 1000) {
                ACHIEVEMENTS[4].achieved = true;
                poopCoins += ACHIEVEMENTS[4].reward;
                autoDisabledStartTime = null;
                alert(`${TRANSLATIONS[settings.language].achievementUnlocked}: ${ACHIEVEMENTS[4].name}! ${TRANSLATIONS[settings.language].reward}: ${ACHIEVEMENTS[4].reward} ${TRANSLATIONS[settings.language].coins}`);
                saveProgress();
            }
        } else {
            autoDisabledStartTime = null;
        }
        updateStocks(currentTime);
        updateParticles();
    }
    drawToilet();
    updateUI();
    requestAnimationFrame(gameLoop);
}

// Klávesové skratky
document.addEventListener('keypress', (e) => {
    const key = e.key.toLowerCase();
    if (document.activeElement !== document.getElementById('codeInput')) {
        if (key === 'x' && isMenuOpen) {
            const subMenus = ['upgradesMenu', 'shopMenu', 'catalogMenu', 'codesMenu', 'investmentsMenu', 'achievementsMenu', 'howToPlayMenu', 'settingsMenu'];
            const isSubMenuOpen = subMenus.some(id => document.getElementById(id).style.display === 'block');
            if (isSubMenuOpen) {
                toggleMenu(true); // Vráti do hlavného menu
            } else {
                toggleMenu(false); // Zatvorí menu a vráti do hry
            }
        } else if (key === 'k' && !isMenuOpen && poopCooldown <= 0) {
            document.getElementById('poopButton').click();
        } else if (key === 'c' && !isMenuOpen && peeCooldown <= 0) {
            document.getElementById('peeButton').click();
        } else if (key === 'm' && !isMenuOpen) {
            toggleMenu(true);
        }
    }
});

document.getElementById('poopButton').addEventListener('click', () => {
    if (poopCooldown <= 0 && !isMenuOpen) {
        poopCoins += 10 * rectumSize * toiletLevel * getCritMultiplier(false, true);
        poopCooldown = BASE_COOLDOWN - COOLDOWN_REDUCTION[foodLevel];
        lastPoopTime = Date.now();
        updateUI();
        saveProgress();
    }
});

document.getElementById('peeButton').addEventListener('click', () => {
    if (peeCooldown <= 0 && !isMenuOpen) {
        poopCoins += 7 * bladderSize * toiletLevel * getCritMultiplier(false, false);
        peeCooldown = BASE_COOLDOWN * PEE_COOLDOWN_MULTIPLIER - COOLDOWN_REDUCTION[foodLevel];
        lastPeeTime = Date.now();
        updateUI();
        saveProgress();
    }
});

document.getElementById('menuButton').addEventListener('click', () => {
    toggleMenu(true);
});

document.getElementById('upgradesButton').addEventListener('click', () => {
    toggleMenu(true, 'upgrades');
});

document.getElementById('shopButton').addEventListener('click', () => {
    toggleMenu(true, 'shop');
});

document.getElementById('catalogButton').addEventListener('click', () => {
    toggleMenu(true, 'catalog');
});

document.getElementById('codesButton').addEventListener('click', () => {
    toggleMenu(true, 'codes');
    document.getElementById('codeMessage').textContent = '';
});

document.getElementById('investmentsButton').addEventListener('click', () => {
    toggleMenu(true, 'investments');
});

document.getElementById('achievementsButton').addEventListener('click', () => {
    toggleMenu(true, 'achievements');
});

document.getElementById('howToPlayButton').addEventListener('click', () => {
    toggleMenu(true, 'howToPlay');
});

document.getElementById('settingsButton').addEventListener('click', () => {
    toggleMenu(true, 'settings');
});

document.getElementById('closeMenuButton').addEventListener('click', () => {
    toggleMenu(false);
});

document.getElementById('submitCode').addEventListener('click', handleCode);
document.getElementById('codeInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleCode();
});

document.getElementById('graphStock0').addEventListener('click', () => {
    currentGraphStock = 0;
    drawStockGraph();
});

document.getElementById('graphStock1').addEventListener('click', () => {
    currentGraphStock = 1;
    drawStockGraph();
});

document.getElementById('graphStock2').addEventListener('click', () => {
    currentGraphStock = 2;
    drawStockGraph();
});

document.getElementById('graphStock3').addEventListener('click', () => {
    currentGraphStock = 3;
    drawStockGraph();
});

document.getElementById('graphStock4').addEventListener('click', () => {
    currentGraphStock = 4;
    drawStockGraph();
});

document.getElementById('graphStock5').addEventListener('click', () => {
    currentGraphStock = 5;
    drawStockGraph();
});

document.getElementById('rectumUpgrade').addEventListener('click', () => {
    if (rectumSize < 5 && poopCoins >= UPGRADE_COSTS.rectum[rectumSize - 1]) {
        poopCoins -= UPGRADE_COSTS.rectum[rectumSize - 1];
        rectumSize++;
        updateUI();
        saveProgress();
    } else {
        alert(rectumSize >= 5 ? TRANSLATIONS[settings.language].rectumMax : TRANSLATIONS[settings.language].notEnoughCoins);
    }
});

document.getElementById('bladderUpgrade').addEventListener('click', () => {
    if (bladderSize < 5 && poopCoins >= UPGRADE_COSTS.bladder[bladderSize - 1]) {
        poopCoins -= UPGRADE_COSTS.bladder[bladderSize - 1];
        bladderSize++;
        updateUI();
        saveProgress();
    } else {
        alert(bladderSize >= 5 ? TRANSLATIONS[settings.language].bladderMax : TRANSLATIONS[settings.language].notEnoughCoins);
    }
});

document.getElementById('toiletUpgrade').addEventListener('click', () => {
    if (toiletLevel < 5 && poopCoins >= UPGRADE_COSTS.toilet[toiletLevel - 1]) {
        poopCoins -= UPGRADE_COSTS.toilet[toiletLevel - 1];
        toiletLevel++;
        updateUI();
        saveProgress();
    } else {
        alert(toiletLevel >= 5 ? TRANSLATIONS[settings.language].toiletMax : TRANSLATIONS[settings.language].notEnoughCoins);
    }
});

document.getElementById('autoPoopUpgrade').addEventListener('click', () => {
    if (autoPoopLevel < 5 && poopCoins >= UPGRADE_COSTS.autoPoop[autoPoopLevel]) {
        poopCoins -= UPGRADE_COSTS.autoPoop[autoPoopLevel];
        autoPoopLevel++;
        isAutoPoopEnabled = true;
        updateUI();
        saveProgress();
    } else {
        alert(autoPoopLevel >= 5 ? TRANSLATIONS[settings.language].autoPoopMax : TRANSLATIONS[settings.language].notEnoughCoins);
    }
});

document.getElementById('autoPeeUpgrade').addEventListener('click', () => {
    if (autoPeeLevel < 5 && poopCoins >= UPGRADE_COSTS.autoPee[autoPeeLevel]) {
        poopCoins -= UPGRADE_COSTS.autoPee[autoPeeLevel];
        autoPeeLevel++;
        isAutoPeeEnabled = true;
        updateUI();
        saveProgress();
    } else {
        alert(autoPeeLevel >= 5 ? TRANSLATIONS[settings.language].autoPeeMax : TRANSLATIONS[settings.language].notEnoughCoins);
    }
});

document.getElementById('critChanceUpgrade').addEventListener('click', () => {
    if (critChanceLevel < 5 && poopCoins >= UPGRADE_COSTS.critChance[critChanceLevel - 1]) {
        poopCoins -= UPGRADE_COSTS.critChance[critChanceLevel - 1];
        critChanceLevel++;
        updateUI();
        saveProgress();
    } else {
        alert(critChanceLevel >= 5 ? TRANSLATIONS[settings.language].critChanceMax : TRANSLATIONS[settings.language].notEnoughCoins);
    }
});

document.getElementById('foodApple').addEventListener('click', () => {
    if (!ownedFoods.includes(0)) {
        ownedFoods.push(0);
        updateUI();
        saveProgress();
    }
});

document.getElementById('foodMeat').addEventListener('click', () => {
    if (!ownedFoods.includes(1) && poopCoins >= FOOD_COSTS.meat) {
        poopCoins -= FOOD_COSTS.meat;
        ownedFoods.push(1);
        updateUI();
        saveProgress();
    } else if (!ownedFoods.includes(1)) {
        alert(TRANSLATIONS[settings.language].notEnoughCoins);
    }
});

document.getElementById('foodLaxative').addEventListener('click', () => {
    if (!ownedFoods.includes(2) && poopCoins >= FOOD_COSTS.laxative) {
        poopCoins -= FOOD_COSTS.laxative;
        ownedFoods.push(2);
        updateUI();
        saveProgress();
    } else if (!ownedFoods.includes(2)) {
        alert(TRANSLATIONS[settings.language].notEnoughCoins);
    }
});

document.getElementById('foodTaco').addEventListener('click', () => {
    if (!ownedFoods.includes(3) && poopCoins >= FOOD_COSTS.taco) {
        poopCoins -= FOOD_COSTS.taco;
        ownedFoods.push(3);
        updateUI();
        saveProgress();
    } else if (!ownedFoods.includes(3)) {
        alert(TRANSLATIONS[settings.language].notEnoughCoins);
    }
});

document.getElementById('foodAtomic').addEventListener('click', () => {
    if (!ownedFoods.includes(4) && poopCoins >= FOOD_COSTS.atomic) {
        poopCoins -= FOOD_COSTS.atomic;
        ownedFoods.push(4);
        updateUI();
        saveProgress();
    } else if (!ownedFoods.includes(4)) {
        alert(TRANSLATIONS[settings.language].notEnoughCoins);
    }
});

document.getElementById('skinBasic').addEventListener('click', () => {
    if (!ownedSkins.includes(0)) {
        ownedSkins.push(0);
        updateUI();
        saveProgress();
    }
});

document.getElementById('skinGold').addEventListener('click', () => {
    if (!ownedSkins.includes(1) && poopCoins >= SKIN_COST
