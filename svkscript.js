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
    rectum: [100, 300, 1000, 3000, 10000, 30000],
    bladder: [50, 150, 500, 1500, 5000, 15000],
    toilet: [200, 600, 2000, 6000, 20000, 60000],
    autoPoop: [500, 1000, 2000, 4000, 8000],
    autoPee: [300, 600, 1200, 2400, 4800],
    critChance: [200, 600, 1800, 5400, 16200]
};
const FOOD_COSTS = { apple: 0, meat: 1500, laxative: 5000, taco: 15000, atomic: 50000 };
const SKIN_COSTS = { basic: 0, gold: 10000, diamond: 30000, ruby: 50000, emerald: 80000, onyx: 100000 };
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
    { name: 'Rubinový', color: '#c71585' },
    { name: 'Smaragdový', color: '#00ff7f' },
    { name: 'Ónyxový', color: '#2f2f2f' },
    { name: 'Stará Ružová', color: '#ff69b4' }
];
const FOODS = [
    { name: 'Jablko', level: 0 },
    { name: 'Mäso', level: 1 },
    { name: 'Preháňadlo', level: 2 },
    { name: 'Taco Bum', level: 3 },
    { name: 'Atómová Kaša', level: 4 },
    { name: 'Nakladané Prdy', level: 5 }
];
const CRIT_CHANCES = [0.05, 0.1, 0.15, 0.2, 0.25];
const AUTO_CRIT_CHANCES = [0.025, 0.05, 0.075, 0.1, 0.125];
const ACHIEVEMENTS = [
    { name: 'Majster Záchoda', description: 'Maximalizuj všetky upgrady', reward: 5000, achieved: false, condition: () => rectumSize === 6 && bladderSize === 6 && toiletLevel === 6 && autoPoopLevel === 5 && autoPeeLevel === 5 && critChanceLevel === 5 },
    { name: 'Krvavé Peniaze', description: 'Investuj 100,000 Poop Coinov', reward: 2000, achieved: false, condition: () => STOCKS.reduce((sum, stock) => sum + stock.owned * stock.basePrice, 0) >= 100000 },
    { name: 'Zberateľ Skinov', description: 'Vlastni všetky známe skiny', reward: 3000, achieved: false, condition: () => ownedSkins.filter(id => id !== 6).length === 6 },
    { name: 'Gurmán Kadenia', description: 'Vlastni všetky známe jedlá', reward: 2500, achieved: false, condition: () => ownedFoods.filter(id => id !== 5).length === 5 },
    { name: 'Päťminútová Výdrž', description: 'Vypni Auto Kadenie a Auto Čúranie na 5 minút (ak vlastnené)', reward: 1500, achieved: false, condition: () => false },
    { name: 'Kakamillionár', description: 'Vlastni 20 MicroPoop akcií', reward: 4000, achieved: false, condition: () => STOCKS[5].owned >= 20 }
];
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
    font: 'Arial'
};
let saveSlots = [
    { name: 'Slot 1', data: null },
    { name: 'Slot 2', data: null },
    { name: 'Slot 3', data: null }
];

function saveProgress(slotIndex = -1) {
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
    if (slotIndex >= 0) {
        saveSlots[slotIndex].data = gameState;
        localStorage.setItem(`poonpeeSimulatorSlot${slotIndex}`, JSON.stringify(saveSlots[slotIndex]));
    } else {
        localStorage.setItem('poonpeeSimulator', JSON.stringify(gameState));
    }
}

function loadProgress(slotIndex = -1) {
    let gameState;
    if (slotIndex >= 0) {
        const savedSlot = localStorage.getItem(`poonpeeSimulatorSlot${slotIndex}`);
        if (!savedSlot) return;
        gameState = JSON.parse(savedSlot).data;
    } else {
        const savedState = localStorage.getItem('poonpeeSimulator');
        if (!savedState) return;
        gameState = JSON.parse(savedState);
    }
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
        font: 'Arial'
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
    applySettings();
    updateUI();
}

function resetSlot(slotIndex) {
    saveSlots[slotIndex].data = null;
    saveSlots[slotIndex].name = `Slot ${slotIndex + 1}`;
    localStorage.removeItem(`poonpeeSimulatorSlot${slotIndex}`);
    updateUI();
}

function fullReset() {
    poopCoins = 0;
    rectumSize = 1;
    bladderSize = 1;
    toiletLevel = 1;
    foodLevel = 0;
    autoPoopLevel = 0;
    autoPeeLevel = 0;
    critChanceLevel = 1;
    currentSkin = 0;
    currentFood = 0;
    ownedFoods = [0];
    ownedSkins = [0];
    isAutoPoopEnabled = false;
    isAutoPeeEnabled = false;
    isOnlyCritical = false;
    usedCodes = [];
    autoDisabledStartTime = null;
    particles = [];
    currentGraphStock = 0;
    STOCKS.forEach(stock => {
        stock.price = stock.basePrice;
        stock.owned = 0;
        stock.history = [stock.basePrice];
    });
    ACHIEVEMENTS.forEach(ach => ach.achieved = false);
    localStorage.removeItem('poonpeeSimulator');
    saveSlots.forEach((slot, index) => {
        slot.data = null;
        slot.name = `Slot ${index + 1}`;
        localStorage.removeItem(`poonpeeSimulatorSlot${index}`);
    });
    updateUI();
    saveProgress();
}

function renameSlot(slotIndex, name) {
    saveSlots[slotIndex].name = name || `Slot ${slotIndex + 1}`;
    if (saveSlots[slotIndex].data) {
        localStorage.setItem(`poonpeeSimulatorSlot${slotIndex}`, JSON.stringify(saveSlots[slotIndex]));
    }
    updateUI();
}

function applySettings() {
    document.body.style.fontFamily = settings.font;
    ctx.font = `20px ${settings.font}`;
    stockGraphCtx.font = `12px ${settings.font}`;
    document.getElementById('poopParticles').checked = settings.poopParticles;
    document.getElementById('peeParticles').checked = settings.peeParticles;
    document.getElementById('critParticles').checked = settings.critParticles;
    document.getElementById('fontSelect').value = settings.font;
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
    ctx.ellipse(200, 350, 100, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0000ff';
    ctx.beginPath();
    ctx.ellipse(200, 350, 80, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = SKINS[currentSkin].color;
    ctx.fillRect(150, 250, 100, 50);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(200, 350, 90, 50, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.fillText(`Záchod: ${SKINS[currentSkin].name}`, 100, 230);
    if (critMessage && critMessageTimer > Date.now()) {
        ctx.fillStyle = '#ff0000';
        ctx.fillText(critMessage, 100, 450);
    }
    drawParticles();
}

function getCritMultiplier(isAuto, isPoop) {
    const isCritical = isOnlyCritical || Math.random() < (isAuto ? AUTO_CRIT_CHANCES[critChanceLevel - 1] : CRIT_CHANCES[critChanceLevel - 1]);
    if (isCritical) {
        critMessage = 'ČĽUP! Critical Hit!';
        critMessageTimer = Date.now() + 2000;
        createParticles(200, 350, 10, true, isPoop);
        return 2;
    }
    createParticles(200, 350, 5, false, isPoop);
    return 1;
}

function updateStocks(currentTime) {
    if (currentTime - lastStockUpdate >= 30000) {
        STOCKS.forEach(stock => {
            const change = Math.random() * 0.2 - 0.1;
            stock.price = Math.round(Math.max(100, stock.basePrice * (1 + change)));
            stock.history.push(stock.price);
            if (stock.history.length > 100) stock.history.shift();
        });
        lastStockUpdate = currentTime;
        saveProgress();
    }
    const stocksDiv = document.getElementById('stocks');
    stocksDiv.innerHTML = '';
    STOCKS.forEach((stock, index) => {
        const div = document.createElement('div');
        div.innerHTML = `${stock.name}: Cena ${stock.price} | Vlastnené: ${stock.owned} <br>` +
            `<input type="number" id="stockAmount${index}" placeholder="Množstvo" min="1">` +
            `<button onclick="buyStock(${index})">Kúpiť</button>` +
            `<button onclick="sellStock(${index})">Predať</button>`;
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
    stockGraphCtx.fillText(`Min: ${minPrice}`, 10, stockGraphCanvas.height - 10);
    stockGraphCtx.fillText(`Max: ${maxPrice}`, 10, 30);
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
        alert(amount <= 0 ? 'Zadaj platné množstvo akcií!' : 'Nedostatok Poop Coinov!');
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
        alert(amount <= 0 ? 'Zadaj platné množstvo akcií!' : 'Nevlastníš dosť akcií na predaj!');
    }
}

function gamble(multiplier) {
    const amount = parseInt(document.getElementById('gambleAmount').value) || 0;
    const gambleMessage = document.getElementById('gambleMessage');
    if (amount <= 0 || poopCoins < amount) {
        gambleMessage.textContent = amount <= 0 ? 'Zadaj platnú sumu!' : 'Nedostatok Poop Coinov!';
        return;
    }
    let chance;
    if (multiplier === 2) chance = 0.5;
    else if (multiplier === 3) chance = 0.33;
    else if (multiplier === 4) chance = 0.25;
    poopCoins -= amount;
    if (Math.random() < chance) {
        const winnings = amount * multiplier;
        poopCoins += winnings;
        gambleMessage.textContent = `Vyhral si ${winnings} Poop Coinov!`;
    } else {
        gambleMessage.textContent = 'Prehral si!';
    }
    document.getElementById('gambleAmount').value = '';
    updateUI();
    saveProgress();
}

function updateAchievements() {
    const achievementsList = document.getElementById('achievementsList');
    achievementsList.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
        if (ach.condition() && !ach.achieved) {
            ach.achieved = true;
            poopCoins += ach.reward;
            alert(`Úspech odomknutý: ${ach.name}! Odmena: ${ach.reward} Poop Coinov`);
            saveProgress();
        }
        const div = document.createElement('div');
        div.textContent = `${ach.name}: ${ach.description} (${ach.achieved ? 'Dokončené' : 'Nedokončené'}) - Odmena: ${ach.reward} Poop Coinov`;
        achievementsList.appendChild(div);
    });
}

function updateUI() {
    document.getElementById('coins').textContent = `Poop Coiny: ${poopCoins}`;
    document.getElementById('rectum').textContent = `Konečník: Úroveň ${rectumSize}${rectumSize === 6 ? ' (MAX)' : ''}`;
    document.getElementById('bladder').textContent = `Mechúr: Úroveň ${bladderSize}${bladderSize === 6 ? ' (MAX)' : ''}`;
    document.getElementById('toilet').textContent = `Záchod: Úroveň ${toiletLevel}${toiletLevel === 6 ? ' (MAX)' : ''}`;
    document.getElementById('food').textContent = `Jedlo: ${FOODS[currentFood].name}`;
    document.getElementById('autoPoop').textContent = `Auto Kadenie: ${autoPoopLevel > 0 ? 'Úroveň ' + autoPoopLevel + (isAutoPoopEnabled ? ' (Zapnuté)' : ' (Vypnuté)') : 'Zamknuté'}`;
    document.getElementById('autoPee').textContent = `Auto Čúranie: ${autoPeeLevel > 0 ? 'Úroveň ' + autoPeeLevel + (isAutoPeeEnabled ? ' (Zapnuté)' : ' (Vypnuté)') : 'Zamknuté'}`;
    document.getElementById('critChance').textContent = `Critical Hit: Úroveň ${critChanceLevel}${critChanceLevel === 5 ? ' (MAX)' : ''}`;
    document.getElementById('poopCooldown').textContent = `Cooldown Kadenia: ${(poopCooldown / 1000).toFixed(1)}s`;
    document.getElementById('peeCooldown').textContent = `Cooldown Čúrania: ${(peeCooldown / 1000).toFixed(1)}s`;
    document.getElementById('rectumUpgrade').textContent = `Upgradovať Konečník (${rectumSize < 6 ? UPGRADE_COSTS.rectum[rectumSize - 1] : 'MAX'})`;
    document.getElementById('bladderUpgrade').textContent = `Upgradovať Mechúr (${bladderSize < 6 ? UPGRADE_COSTS.bladder[bladderSize - 1] : 'MAX'})`;
    document.getElementById('toiletUpgrade').textContent = `Upgradovať Záchod (${toiletLevel < 6 ? UPGRADE_COSTS.toilet[toiletLevel - 1] : 'MAX'})`;
    document.getElementById('autoPoopUpgrade').textContent = `Odomknúť/Upgradovať Auto Kadenie (${autoPoopLevel < 5 ? UPGRADE_COSTS.autoPoop[autoPoopLevel] : 'MAX'})`;
    document.getElementById('autoPeeUpgrade').textContent = `Odomknúť/Upgradovať Auto Čúranie (${autoPeeLevel < 5 ? UPGRADE_COSTS.autoPee[autoPeeLevel] : 'MAX'})`;
    document.getElementById('critChanceUpgrade').textContent = `Upgradovať Critical Hit (${critChanceLevel < 5 ? UPGRADE_COSTS.critChance[critChanceLevel - 1] : 'MAX'})`;
    document.getElementById('foodApple').textContent = `Jablko (${ownedFoods.includes(0) ? 'Vlastnené' : FOOD_COSTS.apple})`;
    document.getElementById('foodMeat').textContent = `Mäso (${ownedFoods.includes(1) ? 'Vlastnené' : FOOD_COSTS.meat})`;
    document.getElementById('foodLaxative').textContent = `Preháňadlo (${ownedFoods.includes(2) ? 'Vlastnené' : FOOD_COSTS.laxative})`;
    document.getElementById('foodTaco').textContent = `Taco Bum (${ownedFoods.includes(3) ? 'Vlastnené' : FOOD_COSTS.taco})`;
    document.getElementById('foodAtomic').textContent = `Atómová Kaša (${ownedFoods.includes(4) ? 'Vlastnené' : FOOD_COSTS.atomic})`;
    document.getElementById('skinBasic').textContent = `Základný (${ownedSkins.includes(0) ? 'Vlastnené' : SKIN_COSTS.basic})`;
    document.getElementById('skinGold').textContent = `Zlatý (${ownedSkins.includes(1) ? 'Vlastnené' : SKIN_COSTS.gold})`;
    document.getElementById('skinDiamond').textContent = `Diamantový (${ownedSkins.includes(2) ? 'Vlastnené' : SKIN_COSTS.diamond})`;
    document.getElementById('skinRuby').textContent = `Rubinový (${ownedSkins.includes(3) ? 'Vlastnené' : SKIN_COSTS.ruby})`;
    document.getElementById('skinEmerald').textContent = `Smaragdový (${ownedSkins.includes(4) ? 'Vlastnené' : SKIN_COSTS.emerald})`;
    document.getElementById('skinOnyx').textContent = `Ónyxový (${ownedSkins.includes(5) ? 'Vlastnené' : SKIN_COSTS.onyx})`;
    document.getElementById('selectApple').textContent = 'Jablko';
    document.getElementById('selectMeat').textContent = 'Mäso';
    document.getElementById('selectLaxative').textContent = 'Preháňadlo';
    document.getElementById('selectTaco').textContent = 'Taco Bum';
    document.getElementById('selectAtomic').textContent = 'Atómová Kaša';
    document.getElementById('selectFarty').textContent = ownedFoods.includes(5) ? 'Nakladané Prdy' : 'TajnéJedlo1';
    document.getElementById('selectBasic').textContent = 'Základný';
    document.getElementById('selectGold').textContent = 'Zlatý';
    document.getElementById('selectDiamond').textContent = 'Diamantový';
    document.getElementById('selectRuby').textContent = 'Rubinový';
    document.getElementById('selectEmerald').textContent = 'Smaragdový';
    document.getElementById('selectOnyx').textContent = 'Ónyxový';
    document.getElementById('selectOgpink').textContent = ownedSkins.includes(6) ? 'Stará Ružová' : 'TajnýSkin1';
    document.getElementById('toggleAutoPoop').textContent = `Auto Kadenie: ${isAutoPoopEnabled ? 'Zapnuté' : 'Vypnuté'}`;
    document.getElementById('toggleAutoPee').textContent = `Auto Čúranie: ${isAutoPeeEnabled ? 'Zapnuté' : 'Vypnuté'}`;
    document.getElementById('codeInput').placeholder = 'Zadaj kód';
    document.getElementById('submitCode').textContent = 'Odoslať';
    document.getElementById('menu').getElementsByTagName('h2')[0].textContent = 'Menu';
    document.getElementById('upgradesButton').textContent = 'Upgrady';
    document.getElementById('shopButton').textContent = 'Obchod';
    document.getElementById('catalogButton').textContent = 'Katalóg';
    document.getElementById('codesButton').textContent = 'Kódy';
    document.getElementById('investmentsButton').textContent = 'Investície';
    document.getElementById('gamblingButton').textContent = 'Aktivity';
    document.getElementById('achievementsButton').textContent = 'Úspechy';
    document.getElementById('howToPlayButton').textContent = 'Ako Hrať';
    document.getElementById('settingsButton').textContent = 'Nastavenia';
    document.getElementById('closeMenuButton').textContent = 'Zavrieť';
    document.getElementById('upgradesMenu').getElementsByTagName('h3')[0].textContent = 'Upgrady';
    document.getElementById('shopMenu').getElementsByTagName('h3')[0].textContent = 'Obchod';
    document.getElementById('shopMenu').getElementsByTagName('h4')[0].textContent = 'Jedlá';
    document.getElementById('shopMenu').getElementsByTagName('h4')[1].textContent = 'Skiny';
    document.getElementById('catalogMenu').getElementsByTagName('h3')[0].textContent = 'Katalóg';
    document.getElementById('catalogMenu').getElementsByTagName('h4')[0].textContent = 'Vybrať Jedlo';
    document.getElementById('catalogMenu').getElementsByTagName('h4')[1].textContent = 'Vybrať Skin';
    document.getElementById('catalogMenu').getElementsByTagName('h4')[2].textContent = 'Automatické Akcie';
    document.getElementById('codesMenu').getElementsByTagName('h3')[0].textContent = 'Kódy';
    document.getElementById('investmentsMenu').getElementsByTagName('h3')[0].textContent = 'Investície';
    document.getElementById('gamblingMenu').getElementsByTagName('h3')[0].textContent = 'Aktivity';
    document.getElementById('achievementsMenu').getElementsByTagName('h3')[0].textContent = 'Úspechy';
    document.getElementById('settingsMenu').getElementsByTagName('h3')[0].textContent = 'Nastavenia';
    document.getElementById('settingsMenu').getElementsByTagName('h4')[0].textContent = 'Častice';
    document.getElementById('settingsMenu').getElementsByTagName('h4')[1].textContent = 'Písmo';
    document.getElementById('settingsMenu').getElementsByTagName('h4')[2].textContent = 'Ukladanie';
    document.getElementById('poopParticles').nextSibling.textContent = ' Častice Kadenia';
    document.getElementById('peeParticles').nextSibling.textContent = ' Častice Čúrania';
    document.getElementById('critParticles').nextSibling.textContent = ' Častice Critical Hitu';
    document.getElementById('nameSlot1').value = saveSlots[0].name;
    document.getElementById('nameSlot2').value = saveSlots[1].name;
    document.getElementById('nameSlot3').value = saveSlots[2].name;
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
    document.getElementById('gamblingMenu').style.display = section === 'gambling' ? 'block' : 'none';
    document.getElementById('gamblingSubMenu').style.display = section === 'gambling' ? 'none' : 'none';
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
        codeMessage.textContent = 'Tento kód už bol použitý!';
        return;
    }
    switch (codeInput) {
        case 'developer2025':
            ownedFoods = [0, 1, 2, 3, 4];
            ownedSkins = [0, 1, 2, 3, 4, 5];
            rectumSize = 6;
            bladderSize = 6;
            toiletLevel = 6;
            autoPoopLevel = 5;
            autoPeeLevel = 5;
            critChanceLevel = 5;
            isAutoPoopEnabled = true;
            isAutoPeeEnabled = true;
            codeMessage.textContent = 'Všetko odomknuté a maximalizované!';
            break;
        case 'ogpinks':
            if (!ownedSkins.includes(6)) {
                ownedSkins.push(6);
                currentSkin = 6;
            }
            codeMessage.textContent = 'Skin Stará Ružová odomknutý!';
            break;
        case 'richmans':
            poopCoins += 999999;
            codeMessage.textContent = 'Získal si 999,999 Poop Coinov!';
            break;
        case 'tutorialmoney':
            poopCoins += 250;
            codeMessage.textContent = 'Získal si 250 Poop Coinov!';
            break;
        case 'onlycritical':
            isOnlyCritical = true;
            codeMessage.textContent = 'Teraz dostávaš iba Critical Hity!';
            break;
        case 'farty':
            if (!ownedFoods.includes(5)) {
                ownedFoods.push(5);
                currentFood = 5;
                foodLevel = FOODS[5].level;
            }
            codeMessage.textContent = 'Nakladané Prdy odomknuté!';
            break;
        default:
            codeMessage.textContent = 'Neplatný kód!';
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
                alert('Úspech odomknutý: Päťminútová Výdrž! Odmena: 1500 Poop Coinov');
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

// Keyboard shortcuts
document.addEventListener('keypress', (e) => {
    const key = e.key.toLowerCase();
    if (document.activeElement !== document.getElementById('codeInput') && document.activeElement !== document.getElementById('gambleAmount') && document.activeElement !== document.getElementById('nameSlot1') && document.activeElement !== document.getElementById('nameSlot2') && document.activeElement !== document.getElementById('nameSlot3')) {
        if (key === 'x' && isMenuOpen) {
            const subMenus = ['upgradesMenu', 'shopMenu', 'catalogMenu', 'codesMenu', 'investmentsMenu', 'gamblingMenu', 'achievementsMenu', 'howToPlayMenu', 'settingsMenu'];
            const isSubMenuOpen = subMenus.some(id => document.getElementById(id).style.display === 'block');
            if (isSubMenuOpen) {
                toggleMenu(true);
            } else {
                toggleMenu(false);
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

document.getElementById('gamblingButton').addEventListener('click', () => {
    toggleMenu(true, 'gambling');
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

document.getElementById('investmentsSubButton').addEventListener('click', () => {
    toggleMenu(true, 'investments');
});

document.getElementById('gamblingSubButton').addEventListener('click', () => {
    document.getElementById('gamblingSubMenu').style.display = 'block';
    document.getElementById('gambleMessage').textContent = '';
});

document.getElementById('submitCode').addEventListener('click', handleCode);
document.getElementById('codeInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleCode();
});

document.getElementById('gambleX2').addEventListener('click', () => gamble(2));
document.getElementById('gambleX3').addEventListener('click', () => gamble(3));
document.getElementById('gambleX4').addEventListener('click', () => gamble(4));

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
    if (rectumSize < 6 && poopCoins >= UPGRADE_COSTS.rectum[rectumSize - 1]) {
        poopCoins -= UPGRADE_COSTS.rectum[rectumSize - 1];
        rectumSize++;
        updateUI();
        saveProgress();
    } else {
        alert(rectumSize >= 6 ? 'Konečník je už na maxime!' : 'Nedostatok Poop Coinov!');
    }
});

document.getElementById('bladderUpgrade').addEventListener('click', () => {
    if (bladderSize < 6 && poopCoins >= UPGRADE_COSTS.bladder[bladderSize - 1]) {
        poopCoins -= UPGRADE_COSTS.bladder[bladderSize - 1];
        bladderSize++;
        updateUI();
        saveProgress();
    } else {
        alert(bladderSize >= 6 ? 'Mechúr je už na maxime!' : 'Nedostatok Poop Coinov!');
    }
});

document.getElementById('toiletUpgrade').addEventListener('click', () => {
    if (toiletLevel < 6 && poopCoins >= UPGRADE_COSTS.toilet[toiletLevel - 1]) {
        poopCoins -= UPGRADE_COSTS.toilet[toiletLevel - 1];
        toiletLevel++;
        updateUI();
        saveProgress();
    } else {
        alert(toiletLevel >= 6 ? 'Záchod je už na maxime!' : 'Nedostatok Poop Coinov!');
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
        alert(autoPoopLevel >= 5 ? 'Auto Kadenie je už na maxime!' : 'Nedostatok Poop Coinov!');
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
        alert(autoPeeLevel >= 5 ? 'Auto Čúranie je už na maxime!' : 'Nedostatok Poop Coinov!');
    }
});

document.getElementById('critChanceUpgrade').addEventListener('click', () => {
    if (critChanceLevel < 5 && poopCoins >= UPGRADE_COSTS.critChance[critChanceLevel - 1]) {
        poopCoins -= UPGRADE_COSTS.critChance[critChanceLevel - 1];
        critChanceLevel++;
        updateUI();
        saveProgress();
    } else {
        alert(critChanceLevel >= 5 ? 'Critical Hit je už na maxime!' : 'Nedostatok Poop Coinov!');
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
        alert('Nedostatok Poop Coinov!');
    }
});

document.getElementById('foodLaxative').addEventListener('click', () => {
    if (!ownedFoods.includes(2) && poopCoins >= FOOD_COSTS.laxative) {
        poopCoins -= FOOD_COSTS.laxative;
        ownedFoods.push(2);
        updateUI();
        saveProgress();
    } else if (!ownedFoods.includes(2)) {
        alert('Nedostatok Poop Coinov!');
    }
});

document.getElementById('foodTaco').addEventListener('click', () => {
    if (!ownedFoods.includes(3) && poopCoins >= FOOD_COSTS.taco) {
        poopCoins -= FOOD_COSTS.taco;
        ownedFoods.push(3);
        updateUI();
        saveProgress();
    } else if (!ownedFoods.includes(3)) {
        alert('Nedostatok Poop Coinov!');
    }
});

document.getElementById('foodAtomic').addEventListener('click', () => {
    if (!ownedFoods.includes(4) && poopCoins >= FOOD_COSTS.atomic) {
        poopCoins -= FOOD_COSTS.atomic;
        ownedFoods.push(4);
        updateUI();
        saveProgress();
    } else if (!ownedFoods.includes(4)) {
        alert('Nedostatok Poop Coinov!');
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
    if (!ownedSkins.includes(1) && poopCoins >= SKIN_COSTS.gold) {
        poopCoins -= SKIN_COSTS.gold;
        ownedSkins.push(1);
        updateUI();
        saveProgress();
    } else if (!ownedSkins.includes(1)) {
        alert('Nedostatok Poop Coinov!');
    }
});

document.getElementById('skinDiamond').addEventListener('click', () => {
    if (!ownedSkins.includes(2) && poopCoins >= SKIN_COSTS.diamond) {
        poopCoins -= SKIN_COSTS.diamond;
        ownedSkins.push(2);
        updateUI();
        saveProgress();
    } else if (!ownedSkins.includes(2)) {
        alert('Nedostatok Poop Coinov!');
    }
});

document.getElementById('skinRuby').addEventListener('click', () => {
    if (!ownedSkins.includes(3) && poopCoins >= SKIN_COSTS.ruby) {
        poopCoins -= SKIN_COSTS.ruby;
        ownedSkins.push(3);
        updateUI();
        saveProgress();
    } else if (!ownedSkins.includes(3)) {
        alert('Nedostatok Poop Coinov!');
    }
});

document.getElementById('skinEmerald').addEventListener('click', () => {
    if (!ownedSkins.includes(4) && poopCoins >= SKIN_COSTS.emerald) {
        poopCoins -= SKIN_COSTS.emerald;
        ownedSkins.push(4);
        updateUI();
        saveProgress();
    } else if (!ownedSkins.includes(4)) {
        alert('Nedostatok Poop Coinov!');
    }
});

document.getElementById('skinOnyx').addEventListener('click', () => {
    if (!ownedSkins.includes(5) && poopCoins >= SKIN_COSTS.onyx) {
        poopCoins -= SKIN_COSTS.onyx;
        ownedSkins.push(5);
        updateUI();
        saveProgress();
    } else if (!ownedSkins.includes(5)) {
        alert('Nedostatok Poop Coinov!');
    }
});

document.getElementById('selectApple').addEventListener('click', () => {
    if (ownedFoods.includes(0)) {
        currentFood = 0;
        foodLevel = FOODS[0].level;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectMeat').addEventListener('click', () => {
    if (ownedFoods.includes(1)) {
        currentFood = 1;
        foodLevel = FOODS[1].level;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectLaxative').addEventListener('click', () => {
    if (ownedFoods.includes(2)) {
        currentFood = 2;
        foodLevel = FOODS[2].level;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectTaco').addEventListener('click', () => {
    if (ownedFoods.includes(3)) {
        currentFood = 3;
        foodLevel = FOODS[3].level;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectAtomic').addEventListener('click', () => {
    if (ownedFoods.includes(4)) {
        currentFood = 4;
        foodLevel = FOODS[4].level;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectFarty').addEventListener('click', () => {
    if (ownedFoods.includes(5)) {
        currentFood = 5;
        foodLevel = FOODS[5].level;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectBasic').addEventListener('click', () => {
    if (ownedSkins.includes(0)) {
        currentSkin = 0;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectGold').addEventListener('click', () => {
    if (ownedSkins.includes(1)) {
        currentSkin = 1;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectDiamond').addEventListener('click', () => {
    if (ownedSkins.includes(2)) {
        currentSkin = 2;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectRuby').addEventListener('click', () => {
    if (ownedSkins.includes(3)) {
        currentSkin = 3;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectEmerald').addEventListener('click', () => {
    if (ownedSkins.includes(4)) {
        currentSkin = 4;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectOnyx').addEventListener('click', () => {
    if (ownedSkins.includes(5)) {
        currentSkin = 5;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectOgpink').addEventListener('click', () => {
    if (ownedSkins.includes(6)) {
        currentSkin = 6;
        updateUI();
        saveProgress();
    }
});

document.getElementById('toggleAutoPoop').addEventListener('click', () => {
    if (autoPoopLevel > 0) {
        isAutoPoopEnabled = !isAutoPoopEnabled;
        updateUI();
        saveProgress();
    }
});

document.getElementById('toggleAutoPee').addEventListener('click', () => {
    if (autoPeeLevel > 0) {
        isAutoPeeEnabled = !isAutoPeeEnabled;
        updateUI();
        saveProgress();
    }
});

document.getElementById('saveSlot1').addEventListener('click', () => {
    saveProgress(0);
    alert('Hra uložená do Slotu 1!');
});

document.getElementById('loadSlot1').addEventListener('click', () => {
    if (saveSlots[0].data) {
        loadProgress(0);
        alert('Hra načítaná zo Slotu 1!');
    } else {
        alert('Slot 1 je prázdny!');
    }
});

document.getElementById('resetSlot1').addEventListener('click', () => {
    resetSlot(0);
    alert('Slot 1 resetovaný!');
});

document.getElementById('nameSlot1').addEventListener('change', (e) => {
    renameSlot(0, e.target.value);
});

document.getElementById('saveSlot2').addEventListener('click', () => {
    saveProgress(1);
    alert('Hra uložená do Slotu 2!');
});

document.getElementById('loadSlot2').addEventListener('click', () => {
    if (saveSlots[1].data) {
        loadProgress(1);
        alert('Hra načítaná zo Slotu 2!');
    } else {
        alert('Slot 2 je prázdny!');
    }
});

document.getElementById('resetSlot2').addEventListener('click', () => {
    resetSlot(1);
    alert('Slot 2 resetovaný!');
});

document.getElementById('nameSlot2').addEventListener('change', (e) => {
    renameSlot(1, e.target.value);
});

document.getElementById('saveSlot3').addEventListener('click', () => {
    saveProgress(2);
    alert('Hra uložená do Slotu 3!');
});

document.getElementById('loadSlot3').addEventListener('click', () => {
    if (saveSlots[2].data) {
        loadProgress(2);
        alert('Hra načítaná zo Slotu 3!');
    } else {
        alert('Slot 3 je prázdny!');
    }
});

document.getElementById('resetSlot3').addEventListener('click', () => {
    resetSlot(2);
    alert('Slot 3 resetovaný!');
});

document.getElementById('nameSlot3').addEventListener('change', (e) => {
    renameSlot(2, e.target.value);
});

document.getElementById('fullReset').addEventListener('click', () => {
    if (confirm('Naozaj chceš úplne resetovať hru? Všetok progres bude stratený!')) {
        fullReset();
        alert('Hra bola úplne resetovaná!');
    }
});

document.getElementById('poopParticles').addEventListener('change', (e) => {
    settings.poopParticles = e.target.checked;
    saveProgress();
});

document.getElementById('peeParticles').addEventListener('change', (e) => {
    settings.peeParticles = e.target.checked;
    saveProgress();
});

document.getElementById('critParticles').addEventListener('change', (e) => {
    settings.critParticles = e.target.checked;
    saveProgress();
});

document.getElementById('fontSelect').addEventListener('change', (e) => {
    settings.font = e.target.value;
    applySettings();
    saveProgress();
});

window.buyStock = buyStock;
window.sellStock = sellStock;

ctx.font = '20px Arial';
stockGraphCtx.font = '12px Arial';
loadProgress();
updateStocks(Date.now());
updateUI();
drawToilet();
requestAnimationFrame(gameLoop);
