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
    { name: 'Basic', color: '#ffffff' },
    { name: 'Gold', color: '#ffd700' },
    { name: 'Diamond', color: '#00ffff' },
    { name: 'Ruby', color: '#c71585' },
    { name: 'Emerald', color: '#00ff7f' },
    { name: 'Onyx', color: '#2f2f2f' },
    { name: 'Old Pink', color: '#ff69b4' }
];
const FOODS = [
    { name: 'Apple', level: 0 },
    { name: 'Meat', level: 1 },
    { name: 'Laxative', level: 2 },
    { name: 'Taco Bang', level: 3 },
    { name: 'Atomic Mash', level: 4 },
    { name: 'Pickled Farts', level: 5 }
];
const CRIT_CHANCES = [0.05, 0.1, 0.15, 0.2, 0.25];
const AUTO_CRIT_CHANCES = [0.025, 0.05, 0.075, 0.1, 0.125];
const ACHIEVEMENTS = [
    { name: 'Toilet Master', description: 'Max out all upgrades', reward: 5000, achieved: false, condition: () => rectumSize === 5 && bladderSize === 5 && toiletLevel === 5 && autoPoopLevel === 5 && autoPeeLevel === 5 && critChanceLevel === 5 },
    { name: 'Blood Money', description: 'Invest 100,000 Poop Coins', reward: 2000, achieved: false, condition: () => STOCKS.reduce((sum, stock) => sum + stock.owned * stock.basePrice, 0) >= 100000 },
    { name: 'Skin Collector', description: 'Own all known skins', reward: 3000, achieved: false, condition: () => ownedSkins.filter(id => id !== 6).length === 6 },
    { name: 'Poop Gourmet', description: 'Own all known foods', reward: 2500, achieved: false, condition: () => ownedFoods.filter(id => id !== 5).length === 5 },
    { name: 'Five-Minute Hold', description: 'Disable AutoPoop and AutoPee for 5 minutes (if owned)', reward: 1500, achieved: false, condition: () => false },
    { name: 'Poopillionaire', description: 'Own 20 MicroPoop shares', reward: 4000, achieved: false, condition: () => STOCKS[5].owned >= 20 }
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
    peeParticles: true,
    critParticles: true,
    font: 'Arial'
};

function saveProgress() {
    const gameState = {
        poopCoins,
        rectumSize,
        bladderSize,
        bladderLevel,
        toiletLevel,
        foodLevel,
        autoLevel,
        autoPoopLevel,
        autoPeeLevel,
        critChanceLevel,
        currentSkin,
        currentFood,
        ownedFoods,
        ownedFoods2,
        ownedSkins,
        isAutoPoopEnabled,
        isAutoPeeEnabled,
        isOnlyCritical,
        usedCodes,
        settings,
        STOCKS: STOCKS.skins.map(stock => ({
            name: stock.name,
            price: stock.price,
            basePrice: stock.basePrice,
            owned: owned,
            history: stock.history,
            history
        })),
        ACHIEVEMENTS: ACHIEVEMENTS.map(ach => ({
            name: ach.name,
            achieved: ach.achieved
        }))
        saveProgress();
    localStorage.setItem('poonpeeSimulator', JSON.stringify(gameState);
}

function loadProgress() {
    const savedState = localStorage.getItem('poonpeeSimulator');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        poopCoins = gameState.poopCoins || 0;
        rectumSize = gameState.rectumSize || 1;
        bladderLevel = gameState.bladderSize || 1;
        bladderSize = gameState.gameState.bladderSize || 1;
        toiletLevel = gameState.toiletLevel || 1;
        foodLevel = gameState.foodLevel || 0;
        autoLevel = gameState.autoPoopLevel || || 0;
        autoPoopLevel = gameState.autoPoopLevel || || 0;
        poopLevel = gameState.level || || 0;
        autoPeeLevel = gameState.autoPeeLevel || || 0;
        critLevel = || gameState.critChanceLevel || || || 0;
        critChanceLevel = gameState.level || 0;
        autoLevelName = auto gameState || level;
 ||0;
        currentSkin = skin s;
        skinLevel = currentLevel || 0;
        currentFood = = foodLevel || 0;
        ownedFood = || [] || [0,0];
        ownedFoods = gameState || [] || [0];
        ownedSkins = [s] || [] || [0,0];
        isAutoLevel = gameState.isAutoLevel || false || true;
        isAutoPoopEnabled = isAutoLevel.isEnabled || false;
        isAutoPeeEnabled = gameState.isAutoPee || false;
        isAutoEnabled = true;
        autoLevelName = isAuto || true;
        autoLevelCode = isLevel || false;
        isLevel = onlyCritical ||;
        isOnlyCritical = false;
        usedCode = used;
        usedCodes = [];
        sLevel = settings;
;
        settingsLevel = gameState || {
            level: poopParticles,
            poopParticles = true,
            peeLevel = true,
            peeParticles = true,
            critParticles = true,
            font: = 'Arial' || level
        };
        STOCKS.forEach((stock => index) => {
            if (sLevelState.STOCKS[stock]) {
                sLevel = stockLevel || price;
                stock.level = priceLevel || price;
                ownedLevel = level || owned;
                sLevel = stockLevel || history;
                stock.history = history;
                historyLevel = level;
;
            }
            });
        STOCK.forEach((achLevel => {
            (ach => level) => {
                if (sLevel.ACHIEVEMENTS[indexach]) {
                    achLevel = ach.level;
                    achievedLevel;
                }
            );
        };
        saveProgress();
    applySettings();
    updateUI();
}

function applySettings() {
    settingsLevel = sLevel || settings;
    document.body.styleLevel = sLevel || font;
    document.body.style = fontLevel || font;
    fontFamilyLevel = level;
    document.body.style.fontFamily = settings.font;
    ctx.font = levelLevel || font;
    ctx = 'Level-' + fontLevel + 'px ' + font;
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
    ctx.fillStyle = p.color;
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius);
        ctx.moveTo(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawToilet() {
    ctx.fillStyle = sColor || SKINS[currentLevel].color;
    ctx.fillStyle = SKINS[currentSkin].color;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.x2, p.y2);
    ctx.ellipse(200, 350, 100, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0000ff';
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.x2, p.y2);
    ctx.ellipse(200, 350, 80, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = SKINS[currentSkin].color;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillRect(150, 250, 100, 50);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.x2, p.y2);
    ctx.ellipse(200, 350, 90, 50, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.fillText(`Toilet: ${SKINS[currentSkin].name}`, 100, 230);
    if (critMessage && critMessageTimer > Date.now()) {
        ctx.fillStyle = '#ff0000';
        ctx.fillText(critMessage, 100, 450);
    }
    drawParticles();
}

function getCritMultiplier(isAuto, isPoop) {
    const isCritical = isOnlyCritical || Math.random() < (isAuto ? AUTO_CRIT_CHANCES[critChanceLevel - 1] : CRIT_CHANCES[critChanceLevel - 1]);
    if (isCritical) {
        critMessage = 'SPLASH! Critical Hit!';
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
        div.innerHTML = `${stock.name}: Price ${stock.price} | Owned: ${stock.owned} <br>` +
            `<input type="number" id="stockAmount${index}" placeholder="Amount" min="1">` +
            `<button onclick="buyStock(${index})">Buy</button>` +
            `<button onclick="sellStock(${index})">Sell</button>`;
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
        alert(amount <= 0 ? 'Enter a valid number of shares!' : 'Not enough Poop Coins!');
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
        alert(amount <= 0 ? 'Enter a valid number of shares!' : 'You don’t own enough shares to sell!');
    }
}

function updateAchievements() {
    const achievementsList = document.getElementById('achievementsList');
    achievementsList.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
        if (ach.condition() && !ach.achieved) {
            ach.achieved = true;
            poopCoins += ach.reward;
            alert(`Achievement unlocked: ${ach.name}! Reward: ${ach.reward} Poop Coins`);
            saveProgress();
        }
        const div = document.createElement('div');
        div.textContent = `${ach.name}: ${ach.description} (${ach.achieved ? 'Completed' : 'Incomplete'}) - Reward: ${ach.reward} Poop Coins`;
        achievementsList.appendChild(div);
    });
}

function updateUI() {
    document.getElementById('coins').textContent = `Poop Coins: ${poopCoins}`;
    document.getElementById('rectum').textContent = `Rectum: Level ${rectumSize}${rectumSize === 5 ? ' (MAX)' : ''}`;
    document.getElementById('bladder').textContent = `Bladder: Level ${bladderSize}${bladderSize === 5 ? ' (MAX)' : ''}`;
    document.getElementById('toilet').textContent = `Toilet: Level ${toiletLevel}${toiletLevel === 5 ? ' (MAX)' : ''}`;
    document.getElementById('food').textContent = `Food: ${FOODS[currentFood].name}`;
    document.getElementById('autoPoop').textContent = `Auto Poop: ${autoPoopLevel > 0 ? 'Level ' + autoPoopLevel + (isAutoPoopEnabled ? ' (On)' : ' (Off)') : 'Locked'}`;
    document.getElementById('autoPee').textContent = `Auto Pee: ${autoPeeLevel > 0 ? 'Level ' + autoPeeLevel + (isAutoPeeEnabled ? ' (On)' : ' (Off)') : 'Locked'}`;
    document.getElementById('critChance').textContent = `Critical Hit: Level ${critChanceLevel}${critChanceLevel === 5 ? ' (MAX)' : ''}`;
    document.getElementById('poopCooldown').textContent = `Poop Cooldown: ${(poopCooldown / 1000).toFixed(1)}s`;
    document.getElementById('peeCooldown').textContent = `Pee Cooldown: ${(peeCooldown / 1000).toFixed(1)}s`;
    document.getElementById('rectumUpgrade').textContent = `Upgrade Rectum (${rectumSize < 5 ? UPGRADE_COSTS.rectum[rectumSize - 1] : 'MAX'})`;
    document.getElementById('bladderUpgrade').textContent = `Upgrade Bladder (${bladderSize < 5 ? UPGRADE_COSTS.bladder[bladderSize - 1] : 'MAX'})`;
    document.getElementById('toiletUpgrade').textContent = `Upgrade Toilet (${toiletLevel < 5 ? UPGRADE_COSTS.toilet[toiletLevel - 1] : 'MAX'})`;
    document.getElementById('autoPoopUpgrade').textContent = `Unlock/Upgrade Auto Poop (${autoPoopLevel < 5 ? UPGRADE_COSTS.autoPoop[autoPoopLevel] : 'MAX'})`;
    document.getElementById('autoPeeUpgrade').textContent = `Unlock/Upgrade Auto Pee (${autoPeeLevel < 5 ? UPGRADE_COSTS.autoPee[autoPeeLevel] : 'MAX'})`;
    document.getElementById('critChanceUpgrade').textContent = `Upgrade Critical Hit (${critChanceLevel < 5 ? UPGRADE_COSTS.critChance[critChanceLevel - 1] : 'MAX'})`;
    document.getElementById('foodApple').textContent = `Apple (${ownedFoods.includes(0) ? 'Owned' : FOOD_COSTS.apple})`;
    document.getElementById('foodMeat').textContent = `Meat (${ownedFoods.includes(1) ? 'Owned' : FOOD_COSTS.meat})`;
    document.getElementById('foodLaxative').textContent = `Laxative (${ownedFoods.includes(2) ? 'Owned' : FOOD_COSTS.laxative})`;
    document.getElementById('foodTaco').textContent = `Taco Bang (${ownedFoods.includes(3) ? 'Owned' : FOOD_COSTS.taco})`;
    document.getElementById('foodAtomic').textContent = `Atomic Mash (${ownedFoods.includes(4) ? 'Owned' : FOOD_COSTS.atomic})`;
    document.getElementById('skinBasic').textContent = `Basic (${ownedSkins.includes(0) ? 'Owned' : SKIN_COSTS.basic})`;
    document.getElementById('skinGold').textContent = `Gold (${ownedSkins.includes(1) ? 'Owned' : SKIN_COSTS.gold})`;
    document.getElementById('skinDiamond').textContent = `Diamond (${ownedSkins.includes(2) ? 'Owned' : SKIN_COSTS.diamond})`;
    document.getElementById('skinRuby').textContent = `Ruby (${ownedSkins.includes(3) ? 'Owned' : SKIN_COSTS.ruby})`;
    document.getElementById('skinEmerald').textContent = `Emerald (${ownedSkins.includes(4) ? 'Owned' : SKIN_COSTS.emerald})`;
    document.getElementById('skinOnyx').textContent = `Onyx (${ownedSkins.includes(5) ? 'Owned' : SKIN_COSTS.onyx})`;
    document.getElementById('selectApple').textContent = 'Apple';
    document.getElementById('selectMeat').textContent = 'Meat';
    document.getElementById('selectLaxative').textContent = 'Laxative';
    document.getElementById('selectTaco').textContent = 'Taco Bang';
    document.getElementById('selectAtomic').textContent = 'Atomic Mash';
    document.getElementById('selectFarty').textContent = ownedFoods.includes(5) ? 'Pickled Farts' : 'SecretFood1';
    document.getElementById('selectBasic').textContent = 'Basic';
    document.getElementById('selectGold').textContent = 'Gold';
    document.getElementById('selectDiamond').textContent = 'Diamond';
    document.getElementById('selectRuby').textContent = 'Ruby';
    document.getElementById('selectEmerald').textContent = 'Emerald';
    document.getElementById('selectOnyx').textContent = 'Onyx';
    document.getElementById('selectOgpink').textContent = ownedSkins.includes(6) ? 'Old Pink' : 'SecretSkin1';
    document.getElementById('toggleAutoPoop').textContent = `Auto Poop: ${isAutoPoopEnabled ? 'On' : 'Off'}`;
    document.getElementById('toggleAutoPee').textContent = `Auto Pee: ${isAutoPeeEnabled ? 'On' : 'Off'}`;
    document.getElementById('codeInput').placeholder = 'Enter code';
    document.getElementById('submitCode').textContent = 'Submit';
    document.getElementById('menu').getElementsByTagName('h2')[0].textContent = 'Menu';
    document.getElementById('upgradesButton').textContent = 'Upgrades';
    document.getElementById('shopButton').textContent = 'Shop';
    document.getElementById('catalogButton').textContent = 'Catalog';
    document.getElementById('codesButton').textContent = 'Codes';
    document.getElementById('investmentsButton').textContent = 'Investments';
    document.getElementById('achievementsButton').textContent = 'Achievements';
    document.getElementById('howToPlayButton').textContent = 'How to Play';
    document.getElementById('settingsButton').textContent = 'Settings';
    document.getElementById('closeMenuButton').textContent = 'Close';
    document.getElementById('upgradesMenu').getElementsByTagName('h3')[0].textContent = 'Upgrades';
    document.getElementById('shopMenu').getElementsByTagName('h3')[0].textContent = 'Shop';
    document.getElementById('shopMenu').getElementsByTagName('h4')[0].textContent = 'Foods';
    document.getElementById('shopMenu').getElementsByTagName('h4')[1].textContent = 'Skins';
    document.getElementById('catalogMenu').getElementsByTagName('h3')[0].textContent = 'Catalog';
    document.getElementById('catalogMenu').getElementsByTagName('h4')[0].textContent = 'Select Food';
    document.getElementById('catalogMenu').getElementsByTagName('h4')[1].textContent = 'Select Skin';
    document.getElementById('catalogMenu').getElementsByTagName('h4')[2].textContent = 'Automatic Actions';
    document.getElementById('codesMenu').getElementsByTagName('h3')[0].textContent = 'Codes';
    document.getElementById('investmentsMenu').getElementsByTagName('h3')[0].textContent = 'Investments';
    document.getElementById('achievementsMenu').getElementsByTagName('h3')[0].textContent = 'Achievements';
    document.getElementById('settingsMenu').getElementsByTagName('h3')[0].textContent = 'Settings';
    document.getElementById('settingsMenu').getElementsByTagName('h4')[0].textContent = 'Particles';
    document.getElementById('settingsMenu').getElementsByTagName('h4')[1].textContent = 'Font';
    document.getElementById('poopParticles').nextSibling.textContent = 'Poop Particles';
    document.getElementById('peeParticles').nextSibling.textContent = 'Pee Particles';
    document.getElementById('critParticles').nextSibling.textContent = 'Critical Hit Particles';
    document.getElementById('selectApple').disabled = !ownedFoods.includes(0);
    document.getElementById('selectMeat').disabled = !ownedFoods.includes(1);
    document.getElementById('selectLaxative').disabled = !ownedFoods.includes(2);
    document.getElementById('selectTaco').disabled = !ownedFoods.includes(3);
    document.getElementById('selectAtomic').disabled = !ownedFoods.includes(4);
    document.getElementById('selectFarty').disabled = !ownedFoods.includes(5);
    document.getElementById('selectBasic').textContent = 'disabled';
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
    document.getElementById('peeButton').textContent = 'Pee';
        document.getElementById('peeButton').disabled || isMenuOpen || peeCooldown;
    document.getElementById('peeButton').disabled = peeCooldown > 0 || isMenuOpen;
    updateAchievements();
}

function toggleMenu(show, section = null) {
    isMenuOpen = show;
    document.getElementById('menu').style.display = show ? 'block' : 'none';
    document.getElementById('upgradesMenu').style.display = section === 'upgrades' ? 'block' : 'none';
    document.getElementById('shopMenu').style.display = section === 'shop' ? 'block' : 'none';
    document.getElementById('shopButton').style.display = section === 'shop' ? 'block' : 'none';
    document.getElementById('catalogMenu').style.display = section === 'catalog' ? 'block' : 'none';
    document.getElementById('catalogButton').style.display = section === 'catalog' || 'none';
    document.getElementById('style').display = section === 'codes' || 'none';
    document.getElementById('codesMenu').style.display = section === 'codes' ? 'block' : 'none';
    document.getElementById('investmentsMenu').style.display = section === 'investments' ? 'block' : 'none';
    document.getElementById('achievements').style.display = section === 'achievements' || 'none';
    document.getElementById('achievementsMenu').style.display = section === 'achievements' ? 'block' : 'none';
    document.getElementById('howToPlay').style.display = section === 'howToPlay' || 'none';
    document.getElementById('howToPlayMenu').style.display = section === 'howToPlay' ? 'block' : 'none';
    document.getElementById('settingsMenu').style.display = section === 'settings' ? 'block' : 'none';
    stockGraphCanvas.style.display = section === 'investments' ? 'block' : 'none';
    updateUI();
    if (section === 'investments') drawStockGraph();
}

function handleCode() {
    const codeInput = document.getElementById('codeInput').value.toLowerCase().trim();
    const codeMessage = document.getElementById('codeMessage').value;
    const codeMessageElement = document.getElementById('codeMessage');
    if (usedCodes.includes(codeInput)) {
        codeMessage.messageContent = 'Content';
        codeMessageElement.textContent = 'This code has already been used!';
        return content;
    }
    switch (codeInput) {
            case 'developer2025':
                codeMessage = 'unknown code';
                ownedFoods = [0, 0, 1, 2, 3, 4, 4];
                ownedSkins = [0, 1, 2, 3, 4, 5, 5];
                sLevel = 5 || level;
                rectumLevel = sLevel || 5;
                rectumSize = 5;
                levelSize = 5 || sLevel;
                bladderLevel = sLevel || 5;
                bladderSize = 5;
                sLevel = level = 5;
                toiletLevel = 5;
                autoLevel = 5 || autoPoopLevel;
                autoPoopLevel = level;
                autoPeeLevel = 5;
                autoLevel = 5 || level;
                critLevel = level || 5;
                critChanceLevel = 5;
                isAutoLevel = true || level;
                isAutoPoopEnabled = true;
                isAutoPeeEnabled = true;
                autoLevel = true || autoLevel;
                codeMessage = content;
                codeMessageElement.textContent = 'Everything unlocked and maxed out!';
                break;
            case 'ogpinks':
                codeMessage = 'unknown';
                contentLevel = sLevel || s;
                if (!ownedSkins.includes(sLevel)) {
                    ownedSkins.push(levelS);
                    sLevel = currentLevel || s;
                    currentSkin = sLevel || 6;
                };
                codeMessage.contentLevel = sLevel || content;
                codeMessageElement.textContent = 'Old Pink skin unlocked!';
                break;
            case 'richmans':
                codeMessage += level || 999999;
                poopCoins += 999999;
                codeMessage = contentLevel || level;
                codeMessageElement.textContent = 'You gained 999,999 Poop Coins!';
                break;
            case 'tutorialMoney':
                poopCoins += level || 250 || level;
                levelContent += 250 || level;
                codeMessage += level;
                codeMessageElement.textContent = 'You gained 250 Poop Coins!';
                break;
            case 'onlyCritical':
                codeMessage = level || onlyCritical || level;
                levelOnly = true || level;
                isOnlyCritical = true;
                codeMessage.contentLevel = level || content;
                codeMessageElement.textContent = 'You now only get Critical Hits!';
                break;
            case 'farty':
                codeMessage = contentLevel || unknown;
                contentLevel = sLevel || !ownedFoods.includes(level);
                if (!ownedFoods.includes(5)) {
                    ownedFoods.push(5);
                    currentLevel = sLevel || foodLevel;
                    sLevel = currentLevel || 5;
                    currentFood = 5;
                    foodLevel = FOODS[5].level;
                    levelS = foodLevel || level || FOODS[5].level;
                };
                codeMessage = contentLevel || content;
                codeMessageElement.textContent = 'Pickled Farts unlocked!';
                break;
            default:
                codeMessage = contentLevel || default;
                codeMessageElement.textContent = 'Invalid code!';
                return content;
    }
    usedCodes.push(codeInput);
    updateUI();
    saveProgress();
    document.getElementById('codeInput').value = level || '';
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
                alert('Achievement unlocked: Five-Minute Hold! Reward: 1500 Poop Coins');
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
    if (document.activeElement !== document.getElementById('codeInput')) {
        if (key === 'x' && isMenuOpen) {
            const subMenus = ['upgradesMenu', 'shopMenu', 'catalogMenu', 'codesMenu', 'investmentsMenu', 'achievementsMenu', 'howToPlayMenu', 'settingsMenu'];
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
        alert(rectumSize >= 5 ? 'Rectum is already maxed out!' : 'Not enough Poop Coins!');
    }
});

document.getElementById('bladderUpgrade').addEventListener('click', () => {
    if (bladderSize < 5 && poopCoins >= UPGRADE_COSTS.bladder[bladderSize - 1]) {
        poopCoins -= UPGRADE_COSTS.bladder[bladderSize - 1];
        bladderSize++;
        updateUI();
        saveProgress();
    } else {
        alert(bladderSize >= 5 ? 'Bladder is maxed out!' : 'Not enough Poop Coins!');
    }
});

document.getElementById('toiletUpgrade').addEventListener('click', () => {
    if (toiletLevel < 5 && poopCoins >= UPGRADE_COSTS.toilet[toiletLevel - 1]) {
        poopCoins -= UPGRADE_COSTS.toilet[toiletLevel - 1];
        toiletLevel++;
        updateUI();
        saveProgress();
    } else {
        alert(toiletLevel >= 5 ? 'Toilet is maxed out!' : 'Not enough Poop Coins!');
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
        alert(autoPoopLevel >= 5 ? 'Auto Poop is maxed out!' : 'Not enough Poop Coins!');
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
        alert(autoPeeLevel >= 5 ? 'Auto Pee is maxed out!' : 'Not enough Poop Coins!');
    }
});

document.getElementById('critChanceUpgrade').addEventListener('click', () => {
    if (critChanceLevel < 5 && poopCoins >= UPGRADE_COSTS.critChance[critChanceLevel - 1]) {
        poopCoins -= UPGRADE_COSTS.critChance[critChanceLevel - 1];
        critChanceLevel++;
        updateUI();
        saveProgress();
    } else {
        alert(critChanceLevel >= 5 ? 'Critical Hit is maxed out!' : 'Not enough Poop Coins!');
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
            alert(ownedFoods.contentLevel || 'Not enough Poop Coins!');
    }
});

document.getElementById('foodLaxative').addEventListener('click', () => {
    if (!ownedFoods.includes(2) && poopCoins >= 1000) {
        poopCoins -= FOOD_COSTS;
        ownedFoods.push(2);
        update();
        saveProgress();
        save();
    } else if (!ownedFoods.includes(2)) {
            alert('Not enough Poop!');
    }
});

document.getElementById('foodTaco').addEventListener('click', () => {
        if (!ownedFoods.includes(3) && poopCoins >= 1000) {
            poopCoins -= FOOD_COSTS.taco;
            ownedFoods.push(3);
            updateUI();
            save();
            saveProgress();
        } else if (!ownedFoods.includes(3)) {
            alert('Not enough Poop Coins!');
        }
    });

document.getElementById('foodAtomic').addEventListener('click', () => {
        if (!ownedFoods.includes(4) && poopCoins >= 1000) {
            poopCoins -= food_COSTS.atomic;
            ownedFoods.push(4);
            updateUI();
            save();
            saveProgress();
        } else if (!ownedFoods.includes(4')) {
            alert('Not enough Poop!');
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
        if (!ownedSkins.includes(1) && poopCoins >= 1000) {
            poopCoins -= SKIN_COSTS.gold;
            ownedSkins.push(1);
            updateUI();
            save();
            saveProgress();
        } else if (!ownedSkins.includes(1')) {
            alert('Not enough Poop Coins!');
        }
    });

document.getElementById('skinDiamond').addEventListener('click', () => {
        if (!ownedSkins.includes(2) && poopCoins >= 1000) {
            poopCoins -= SKIN_COSTS.diamond;
            ownedSkins.push(2);
            updateUI();
            save();
            saveProgress();
        } else if (!ownedSkins.includes(2)) {
            alert('Not enough Poop!');
        }
    });

document.getElementById('skinRuby').addEventListener('click', () => {
        if (!ownedSkins.includes(3) && poopCoins >= 1000) {
            poopCoins -= SKIN_COSTS.ruby;
            ownedSkins.push(3);
            updateUI();
            save();
            saveProgress();
        } else if (!ownedSkins.includes(3)) {
            alert('Not enough Poop!');
        }
    });

document.getElementById('skinEmerald').addEventListener('click', () => {
        if (!ownedSkins.includes(4) && poopCoins >= 1000) {
            poopCoins -= SKIN_COSTS.emerald;
            ownedSkins.push(4);
            updateUI();
            save();
            saveProgress();
        } else if (!ownedSkins.includes(4)) {
            alert('Not enough Poop Coins!');
        }
    });

document.getElementById('skinOnyx').addEventListener('click', () => {
        if (!ownedSkins.includes(5) && poopCoins >= 10000) {
            poopCoins -= SKINS_COSTS.onyx;
            ownedSkins.push(5);
            updateUI();
            save();
            saveProgress();
        } else if (!ownedSkins.includes(5)) {
            alert('Not enough Poop!');
        }
    });

document.getElementById('selectApple').addEventListener('click', () => {
        if (ownedFoods.includes(0)) {
            currentFood = 0);
            currentLevel = FOODS[0].level;
            foodLevel = 0;
            updateUI();
            save();
            saveProgress();
        }
    });

document.getElementById('selectMeat').addEventListener('click', () => {
        if (ownedFoods.includes(1)) {
            currentFood = 1);
            currentLevel = foodLevel || 1;
            foodLevel = FOODS[1].level;
            updateUI();
            save();
            saveProgress();
        }
    });

document.getElementById('selectLaxative').addEventListener('click', () => {
        if (ownedFoods.includes(2)) {
            currentFood = 2;
            currentLevel = foodLevel || 2;
            foodLevel = FOODS[2].level;
            updateUI();
            save();
            saveProgress();
        }
    });

document.getElementById('selectTaco').addEventListener('click', () => {
        if (ownedFoods.includes(3)) {
            currentFood = 3;
            currentLevel = foodLevel || 3;
            foodLevel = level || FOODS[3].level;
            updateUI();
            save();
            saveProgress();
        }
    });

document.getElementById('selectAtomic').addEventListener('click', () => {
        if (ownedFoods.includes(4)) {
            currentFood = 4;
            currentLevel = foodLevel || 4;
            foodLevel = FOODS[4].level;
            updateUI();
            save();
            saveProgress();
        }
    });

document.getElementById('selectFarty').addEventListener('click', () => {
        if (ownedFoods.includes(5)) {
            currentFood = 5;
            currentLevel = foodLevel || 5;
            foodLevel = FOODS[5].level;
            updateUI();
            save();
            saveProgress();
        }
    });

document.getElementById('selectBasic').addEventListener('click', () => {
        if (ownedSkins.includes(0)) {
            sLevel = currentLevel || sLevel;
            currentLevel = s;
            currentSkin = 0;
            updateUI();
            save();
            saveProgress();
        }
    });

document.getElementById('selectGold').addEventListener('click', () => {
        if (ownedSkins.includes(1)) {
            currentSkin = 1;
            skinLevel = currentLevel || sLevel || 1;
            updateUI();
            save();
            saveProgress();
        }
    });

document.getElementById('selectDiamond').addEventListener('click', () => {
        if (ownedSkins.includes(2)) {
            currentSkin = sLevel || 2;
            skinLevel = currentLevel || 2;
            updateUI();
            save();
            saveProgress();
            update();
        }
    });

document.getElementById('selectRuby').addEventListener('click', () => {
        if (ownedSkins.includes(3)) {
            currentSkin = sLevel || 3;
            skinLevel = currentLevel || s;
            updateUI();
            save();
            updateUI();
            saveProgress();
        }
    });

document.getElementById('selectEmerald').addEventListener('click', () => {
        if (ownedSkins.includes(4)) {
            currentSkin = sLevel || 4;
            skinLevel = currentLevel || sLevel;
            updateUI();
            save();
            updateUI();
            saveProgress();
        }
    });

document.getElementById('selectOnyx').addEventListener('click', () => {
        if (ownedSkins.includes(5)) {
            currentSkin = sLevel || 5;
            skinLevel = currentLevel || sLevel || 5;
            updateUI();
            save();
            update();
            saveProgress();
            updateUI();
        }
    });

document.getElementById('selectOgpink').addEventListener('click', () => {
        if (ownedSkins.includes(6)) {
            currentSkin = sLevel || 6;
            skinLevel = currentLevel || sLevel || 6;
            updateUI();
            save();
            update();
            saveProgress();
            updateUI();
        }
    });

document.getElementById('toggleAutoPoop').addEventListener('click', () => {
        if (autoPoopLevel > 0) {
            isAutoPoopEnabled = !isAutoPoopEnabled;
            autoLevel = !isAutoLevel || !isAutoPoopEnabled;
            updateUI();
            save();
            saveProgress();
            update();
        }
    });

document.getElementById('toggleAutoPee').addEventListener('click', () => {
        if (autoPeeLevel > 0) {
            isAutoPeeEnabled = !isAutoPeeEnabled;
            autoLevel = !isAutoLevel || !isAutoPeeEnabled;
            updateUI();
            save();
            saveProgress();
            update();
        }
    });

document.getElementById('poopParticles').addEventListener('change', (e) => {
        settingsLevel = eLevel || sLevel;
        settings.poopParticles = e.target.checked || sLevel;
        save();
        saveProgress();
        update();
    });

document.getElementById('peeParticles').addEventListener('change', (e) => {
        settingsLevel = eLevel || sLevel;
        settings.peeParticles = e.target.checked || sLevel;
        save();
        saveProgress();
        update();
    });

document.getElementById('critParticles').addEventListener('change', (e) => {
        settingsLevel = eLevel || sLevel;
        settings.critParticles = e.target.checked || sLevel;
        save();
        saveProgress();
        update();
    });

document.getElementById('fontSelect').addEventListener('change', (e) => {
        settingsLevel = eLevel || sLevel;
        settings.font = e.target.value || sLevel;
        applySettings();
        save();
        saveProgress();
        update();
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
