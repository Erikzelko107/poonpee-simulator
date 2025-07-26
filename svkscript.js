const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const stockGraphCanvas = document.getElementById('stockGraph');
const stockGraphCtx = stockGraphCanvas.getContext('2d');
let kakaCoins = 0;
let konecnikSize = 1;
let mechurSize = 1;
let zachodLevel = 1;
let jedloLevel = 0;
let autoKadenieLevel = 0;
let autoCuranieLevel = 0;
let critChanceLevel = 1;
let kadenieCooldown = 0;
let curanieCooldown = 0;
let autoKadenieCooldown = 0;
let autoCuranieCooldown = 0;
let lastStockUpdate = 0;
const BASE_COOLDOWN = 5000;
const PEE_COOLDOWN_MULTIPLIER = 0.7;
const COOLDOWN_REDUCTION = [0, 500, 1000, 1500, 2000, 2500];
const AUTO_COOLDOWN = 10000;
const AUTO_COOLDOWN_REDUCTION = [0, 1000, 2000, 3000, 4000];
const UPGRADE_COSTS = {
    konecnik: [100, 300, 1000, 3000, 10000, 30000],
    mechur: [50, 150, 500, 1500, 5000, 15000],
    zachod: [200, 600, 2000, 6000, 20000, 60000],
    autoKadenie: [500, 1000, 2000, 4000, 8000],
    autoCuranie: [300, 600, 1200, 2400, 4800],
    critChance: [200, 600, 1800, 5400, 16200]
};
const FOOD_COSTS = { jablko: 0, maso: 1500, prehanadlo: 5000, taco: 15000, atomovy: 50000 };
const SKIN_COSTS = { zakladny: 0, zlaty: 20000, diamantovy: 60000, rubinovy: 100000, smaragdovy: 160000, onyxovy: 200000 };
const STOCKS = [
    { name: 'Tento Papier', price: 1000, basePrice: 1000, owned: 0, history: [1000] },
    { name: 'Caca Cola', price: 2000, basePrice: 2000, owned: 0, history: [2000] },
    { name: 'Skibidi Záchod', price: 5000, basePrice: 5000, owned: 0, history: [5000] },
    { name: 'MineKakať', price: 10000, basePrice: 10000, owned: 0, history: [10000] },
    { name: 'CikiBook', price: 20000, basePrice: 20000, owned: 0, history: [20000] },
    { name: 'MicroKakať', price: 30000, basePrice: 30000, owned: 0, history: [30000] }
];
const SKINS = [
    { name: 'Základný', color: '#ffffff' },
    { name: 'Zlatý', color: '#ffd700' },
    { name: 'Diamantový', color: '#00ffff' },
    { name: 'Rubínový', color: '#c71585' },
    { name: 'Smaragdový', color: '#00ff7f' },
    { name: 'Onyxový', color: '#2f2f2f' },
    { name: 'Staroružový', color: '#ff69b4' }
];
const FOODS = [
    { name: 'Jablko', level: 0 },
    { name: 'Mäso', level: 1 },
    { name: 'Preháňadlo', level: 2 },
    { name: 'Taco Bang', level: 3 },
    { name: 'Atomový Mix', level: 4 },
    { name: 'Nakladané Prdy', level: 5 }
];
const CRIT_CHANCES = [0.05, 0.1, 0.15, 0.2, 0.25];
const AUTO_CRIT_CHANCES = [0.025, 0.05, 0.075, 0.1, 0.125];
const ACHIEVEMENTS = [
    { name: 'Záchodový Majster', description: 'Maximalizuj všetky upgrady', reward: 5000, achieved: false, condition: () => konecnikSize === 6 && mechurSize === 6 && zachodLevel === 6 && autoKadenieLevel === 5 && autoCuranieLevel === 5 && critChanceLevel === 5 },
    { name: 'Krvavé Peniaze', description: 'Investuj 100,000 Kaka Coinov', reward: 2000, achieved: false, condition: () => STOCKS.reduce((sum, stock) => sum + stock.owned * stock.basePrice, 0) >= 100000 },
    { name: 'Zberač Skinov', description: 'Vlastni všetky známe skiny', reward: 3000, achieved: false, condition: () => ownedSkins.filter(id => id !== 6).length === 6 },
    { name: 'Kakať Gourmet', description: 'Vlastni všetky známe jedlá', reward: 2500, achieved: false, condition: () => ownedFoods.filter(id => id !== 5).length === 5 },
    { name: 'Päťminútová Výdrž', description: 'Vypni Auto Kadenie a Auto Čúranie na 5 minút (ak vlastníš)', reward: 1500, achieved: false, condition: () => false },
    { name: 'Kakamillionár', description: 'Vlastni 20 MicroKakať akcií', reward: 4000, achieved: false, condition: () => STOCKS[5].owned >= 20 }
];
let currentSkin = 0;
let currentFood = 0;
let ownedFoods = [0];
let ownedSkins = [0];
let lastKadenieTime = 0;
let lastCuranieTime = 0;
let lastAutoKadenieTime = 0;
let lastAutoCuranieTime = 0;
let isMenuOpen = false;
let isAutoKadenieEnabled = false;
let isAutoCuranieEnabled = false;
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
let saveSlots = {
    slot1: { name: 'Slot 1', data: null },
    slot2: { name: 'Slot 2', data: null },
    slot3: { name: 'Slot 3', data: null }
};

function saveProgress(slot = 'default') {
    const gameState = {
        kakaCoins,
        konecnikSize,
        mechurSize,
        zachodLevel,
        jedloLevel,
        autoKadenieLevel,
        autoCuranieLevel,
        critChanceLevel,
        currentSkin,
        currentFood,
        ownedFoods,
        ownedSkins,
        isAutoKadenieEnabled,
        isAutoCuranieEnabled,
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
    if (slot === 'default') {
        localStorage.setItem('kakatCuratSimulator', JSON.stringify(gameState));
    } else {
        saveSlots[slot].data = gameState;
        localStorage.setItem('saveSlots', JSON.stringify(saveSlots));
    }
}

function loadProgress(slot = 'default') {
    let gameState;
    if (slot === 'default') {
        const savedState = localStorage.getItem('kakatCuratSimulator');
        if (savedState) gameState = JSON.parse(savedState);
    } else {
        const savedSlots = localStorage.getItem('saveSlots');
        if (savedSlots) {
            saveSlots = JSON.parse(savedSlots);
            gameState = saveSlots[slot].data;
        }
    }
    if (gameState) {
        kakaCoins = gameState.kakaCoins || 0;
        konecnikSize = gameState.konecnikSize || 1;
        mechurSize = gameState.mechurSize || 1;
        zachodLevel = gameState.zachodLevel || 1;
        jedloLevel = gameState.jedloLevel || 0;
        autoKadenieLevel = gameState.autoKadenieLevel || 0;
        autoCuranieLevel = gameState.autoCuranieLevel || 0;
        critChanceLevel = gameState.critChanceLevel || 1;
        currentSkin = gameState.currentSkin || 0;
        currentFood = gameState.currentFood || 0;
        ownedFoods = gameState.ownedFoods || [0];
        ownedSkins = gameState.ownedSkins || [0];
        isAutoKadenieEnabled = gameState.isAutoKadenieEnabled || false;
        isAutoCuranieEnabled = gameState.isAutoCuranieEnabled || false;
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
    }
    applySettings();
    updateUI();
}

function resetSlot(slot) {
    saveSlots[slot].data = null;
    localStorage.setItem('saveSlots', JSON.stringify(saveSlots));
    alert(`Slot ${saveSlots[slot].name} bol resetovaný!`);
}

function renameSlot(slot, name) {
    saveSlots[slot].name = name || `Slot ${slot.slice(-1)}`;
    localStorage.setItem('saveSlots', JSON.stringify(saveSlots));
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

function createParticles(x, y, count, isCritical, isKadenie) {
    if ((isKadenie && !settings.poopParticles) || (!isKadenie && !settings.peeParticles) || (isCritical && !settings.critParticles)) return;
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            radius: isCritical ? Math.random() * 6 + 3 : Math.random() * 3 + 1,
            life: 1000,
            startTime: Date.now(),
            color: isCritical ? '#ff0000' : (isKadenie ? '#8b4513' : '#ffff00')
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

function drawZachod() {
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

function getCritMultiplier(isAuto, isKadenie) {
    const isCritical = isOnlyCritical || Math.random() < (isAuto ? AUTO_CRIT_CHANCES[critChanceLevel - 1] : CRIT_CHANCES[critChanceLevel - 1]);
    if (isCritical) {
        critMessage = 'ŠPLIECH! Kritický Zásah!';
        critMessageTimer = Date.now() + 2000;
        createParticles(200, 350, 10, true, isKadenie);
        return 2;
    }
    createParticles(200, 350, 5, false, isKadenie);
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
    if (amount > 0 && kakaCoins >= totalCost) {
        kakaCoins -= totalCost;
        stock.owned += amount;
        document.getElementById(`stockAmount${index}`).value = '';
        updateUI();
        saveProgress();
    } else {
        alert(amount <= 0 ? 'Zadaj platné množstvo akcií!' : 'Nedostatok Kaka Coinov!');
    }
}

function sellStock(index) {
    const stock = STOCKS[index];
    const amount = parseInt(document.getElementById(`stockAmount${index}`).value) || 0;
    if (amount > 0 && stock.owned >= amount) {
        kakaCoins += stock.price * amount;
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
    const resultDiv = document.getElementById('gambleResult');
    if (amount <= 0) {
        resultDiv.textContent = 'Zadaj platnú sumu!';
        return;
    }
    if (kakaCoins < amount) {
        resultDiv.textContent = 'Nedostatok Kaka Coinov!';
        return;
    }
    kakaCoins -= amount;
    let chance, win;
    switch (multiplier) {
        case 2:
            chance = 0.5;
            win = Math.random() < chance;
            break;
        case 3:
            chance = 0.3;
            win = Math.random() < chance;
            break;
        case 4:
            chance = 0.15;
            win = Math.random() < chance;
            break;
        default:
            resultDiv.textContent = 'Neplatný násobiteľ!';
            return;
    }
    if (win) {
        kakaCoins += amount * multiplier;
        resultDiv.textContent = `Vyhral si! Získal si ${amount * multiplier} Kaka Coinov!`;
    } else {
        resultDiv.textContent = 'Prehral si! Skús znova!';
    }
    updateUI();
    saveProgress();
    document.getElementById('gambleAmount').value = '';
}

function updateAchievements() {
    const achievementsList = document.getElementById('achievementsList');
    achievementsList.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
        if (ach.condition() && !ach.achieved) {
            ach.achieved = true;
            kakaCoins += ach.reward;
            alert(`Úspech odomknutý: ${ach.name}! Odmena: ${ach.reward} Kaka Coinov`);
            saveProgress();
        }
        const div = document.createElement('div');
        div.textContent = `${ach.name}: ${ach.description} (${ach.achieved ? 'Dokončený' : 'Nedokončený'}) - Odmena: ${ach.reward} Kaka Coinov`;
        achievementsList.appendChild(div);
    });
}

function updateUI() {
    document.getElementById('coins').textContent = `Kaka Coiny: ${kakaCoins}`;
    document.getElementById('konecnik').textContent = `Konečník: Úroveň ${konecnikSize}${konecnikSize === 6 ? ' (MAX)' : ''}`;
    document.getElementById('mechur').textContent = `Mechúr: Úroveň ${mechurSize}${mechurSize === 6 ? ' (MAX)' : ''}`;
    document.getElementById('zachod').textContent = `Záchod: Úroveň ${zachodLevel}${zachodLevel === 6 ? ' (MAX)' : ''}`;
    document.getElementById('jedlo').textContent = `Jedlo: ${FOODS[currentFood].name}`;
    document.getElementById('autoKadenie').textContent = `Auto Kadenie: ${autoKadenieLevel > 0 ? 'Úroveň ' + autoKadenieLevel + (isAutoKadenieEnabled ? ' (Zapnuté)' : ' (Vypnuté)') : 'Zamknuté'}`;
    document.getElementById('autoCuranie').textContent = `Auto Čúranie: ${autoCuranieLevel > 0 ? 'Úroveň ' + autoCuranieLevel + (isAutoCuranieEnabled ? ' (Zapnuté)' : ' (Vypnuté)') : 'Zamknuté'}`;
    document.getElementById('critChance').textContent = `Kritický Zásah: Úroveň ${critChanceLevel}${critChanceLevel === 5 ? ' (MAX)' : ''}`;
    document.getElementById('kadenieCooldown').textContent = `Cooldown Kadenia: ${(kadenieCooldown / 1000).toFixed(1)}s`;
    document.getElementById('curanieCooldown').textContent = `Cooldown Čúrania: ${(curanieCooldown / 1000).toFixed(1)}s`;
    document.getElementById('konecnikUpgrade').textContent = `Upgradovať Konečník (${konecnikSize < 6 ? UPGRADE_COSTS.konecnik[konecnikSize - 1] : 'MAX'})`;
    document.getElementById('mechurUpgrade').textContent = `Upgradovať Mechúr (${mechurSize < 6 ? UPGRADE_COSTS.mechur[mechurSize - 1] : 'MAX'})`;
    document.getElementById('zachodUpgrade').textContent = `Upgradovať Záchod (${zachodLevel < 6 ? UPGRADE_COSTS.zachod[zachodLevel - 1] : 'MAX'})`;
    document.getElementById('autoKadenieUpgrade').textContent = `Odomknúť/Upgradovať Auto Kadenie (${autoKadenieLevel < 5 ? UPGRADE_COSTS.autoKadenie[autoKadenieLevel] : 'MAX'})`;
    document.getElementById('autoCuranieUpgrade').textContent = `Odomknúť/Upgradovať Auto Čúranie (${autoCuranieLevel < 5 ? UPGRADE_COSTS.autoCuranie[autoCuranieLevel] : 'MAX'})`;
    document.getElementById('critChanceUpgrade').textContent = `Upgradovať Kritický Zásah (${critChanceLevel < 5 ? UPGRADE_COSTS.critChance[critChanceLevel - 1] : 'MAX'})`;
    document.getElementById('foodJablko').textContent = `Jablko (${ownedFoods.includes(0) ? 'Vlastnené' : FOOD_COSTS.jablko})`;
    document.getElementById('foodMaso').textContent = `Mäso (${ownedFoods.includes(1) ? 'Vlastnené' : FOOD_COSTS.maso})`;
    document.getElementById('foodPrehanadlo').textContent = `Preháňadlo (${ownedFoods.includes(2) ? 'Vlastnené' : FOOD_COSTS.prehanadlo})`;
    document.getElementById('foodTaco').textContent = `Taco Bang (${ownedFoods.includes(3) ? 'Vlastnené' : FOOD_COSTS.taco})`;
    document.getElementById('foodAtomovy').textContent = `Atomový Mix (${ownedFoods.includes(4) ? 'Vlastnené' : FOOD_COSTS.atomovy})`;
    document.getElementById('skinZakladny').textContent = `Základný (${ownedSkins.includes(0) ? 'Vlastnené' : SKIN_COSTS.zakladny})`;
    document.getElementById('skinZlaty').textContent = `Zlatý (${ownedSkins.includes(1) ? 'Vlastnené' : SKIN_COSTS.zlaty})`;
    document.getElementById('skinDiamantovy').textContent = `Diamantový (${ownedSkins.includes(2) ? 'Vlastnené' : SKIN_COSTS.diamantovy})`;
    document.getElementById('skinRubinovy').textContent = `Rubínový (${ownedSkins.includes(3) ? 'Vlastnené' : SKIN_COSTS.rubinovy})`;
    document.getElementById('skinSmaragdovy').textContent = `Smaragdový (${ownedSkins.includes(4) ? 'Vlastnené' : SKIN_COSTS.smaragdovy})`;
    document.getElementById('skinOnyxovy').textContent = `Onyxový (${ownedSkins.includes(5) ? 'Vlastnené' : SKIN_COSTS.onyxovy})`;
    document.getElementById('selectJablko').textContent = 'Jablko';
    document.getElementById('selectMaso').textContent = 'Mäso';
    document.getElementById('selectPrehanadlo').textContent = 'Preháňadlo';
    document.getElementById('selectTaco').textContent = 'Taco Bang';
    document.getElementById('selectAtomovy').textContent = 'Atomový Mix';
    document.getElementById('selectPrdy').textContent = ownedFoods.includes(5) ? 'Nakladané Prdy' : 'TajnéJedlo1';
    document.getElementById('selectZakladny').textContent = 'Základný';
    document.getElementById('selectZlaty').textContent = 'Zlatý';
    document.getElementById('selectDiamantovy').textContent = 'Diamantový';
    document.getElementById('selectRubinovy').textContent = 'Rubínový';
    document.getElementById('selectSmaragdovy').textContent = 'Smaragdový';
    document.getElementById('selectOnyxovy').textContent = 'Onyxový';
    document.getElementById('selectStaroruzovy').textContent = ownedSkins.includes(6) ? 'Staroružový' : 'TajnýSkin1';
    document.getElementById('toggleAutoKadenie').textContent = `Auto Kadenie: ${isAutoKadenieEnabled ? 'Zapnuté' : 'Vypnuté'}`;
    document.getElementById('toggleAutoCuranie').textContent = `Auto Čúranie: ${isAutoCuranieEnabled ? 'Zapnuté' : 'Vypnuté'}`;
    document.getElementById('codeInput').placeholder = 'Zadaj kód';
    document.getElementById('submitCode').textContent = 'Odoslať';
    document.getElementById('menu').getElementsByTagName('h2')[0].textContent = 'Menu';
    document.getElementById('upgradesButton').textContent = 'Upgrady';
    document.getElementById('shopButton').textContent = 'Obchod';
    document.getElementById('catalogButton').textContent = 'Katalóg';
    document.getElementById('codesButton').textContent = 'Kódy';
    document.getElementById('activitiesButton').textContent = 'Aktivity';
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
    document.getElementById('activitiesMenu').getElementsByTagName('h3')[0].textContent = 'Aktivity';
    document.getElementById('activitiesMenu').getElementsByTagName('h4')[0].textContent = 'Investície';
    document.getElementById('activitiesMenu').getElementsByTagName('h4')[1].textContent = 'Gambling';
    document.getElementById('achievementsMenu').getElementsByTagName('h3')[0].textContent = 'Úspechy';
    document.getElementById('settingsMenu').getElementsByTagName('h3')[0].textContent = 'Nastavenia';
    document.getElementById('settingsMenu').getElementsByTagName('h4')[0].textContent = 'Častice';
    document.getElementById('settingsMenu').getElementsByTagName('h4')[1].textContent = 'Font';
    document.getElementById('settingsMenu').getElementsByTagName('h4')[2].textContent = 'Uloženie';
    document.getElementById('poopParticles').nextSibling.textContent = ' Častice Kadenia';
    document.getElementById('peeParticles').nextSibling.textContent = ' Častice Čúrania';
    document.getElementById('critParticles').nextSibling.textContent = ' Častice Kritického Zásahu';
    document.getElementById('selectJablko').disabled = !ownedFoods.includes(0);
    document.getElementById('selectMaso').disabled = !ownedFoods.includes(1);
    document.getElementById('selectPrehanadlo').disabled = !ownedFoods.includes(2);
    document.getElementById('selectTaco').disabled = !ownedFoods.includes(3);
    document.getElementById('selectAtomovy').disabled = !ownedFoods.includes(4);
    document.getElementById('selectPrdy').disabled = !ownedFoods.includes(5);
    document.getElementById('selectZakladny').disabled = !ownedSkins.includes(0);
    document.getElementById('selectZlaty').disabled = !ownedSkins.includes(1);
    document.getElementById('selectDiamantovy').disabled = !ownedSkins.includes(2);
    document.getElementById('selectRubinovy').disabled = !ownedSkins.includes(3);
    document.getElementById('selectSmaragdovy').disabled = !ownedSkins.includes(4);
    document.getElementById('selectOnyxovy').disabled = !ownedSkins.includes(5);
    document.getElementById('selectStaroruzovy').disabled = !ownedSkins.includes(6);
    document.getElementById('toggleAutoKadenie').disabled = autoKadenieLevel === 0;
    document.getElementById('toggleAutoCuranie').disabled = autoCuranieLevel === 0;
    document.getElementById('kadenieButton').disabled = kadenieCooldown > 0 || isMenuOpen;
    document.getElementById('curanieButton').disabled = curanieCooldown > 0 || isMenuOpen;
    updateAchievements();
}

function toggleMenu(show, section = null) {
    isMenuOpen = show;
    document.getElementById('menu').style.display = show ? 'block' : 'none';
    document.getElementById('upgradesMenu').style.display = section === 'upgrades' ? 'block' : 'none';
    document.getElementById('shopMenu').style.display = section === 'shop' ? 'block' : 'none';
    document.getElementById('catalogMenu').style.display = section === 'catalog' ? 'block' : 'none';
    document.getElementById('codesMenu').style.display = section === 'codes' ? 'block' : 'none';
    document.getElementById('activitiesMenu').style.display = section === 'activities' ? 'block' : 'none';
    document.getElementById('achievementsMenu').style.display = section === 'achievements' ? 'block' : 'none';
    document.getElementById('howToPlayMenu').style.display = section === 'howToPlay' ? 'block' : 'none';
    document.getElementById('settingsMenu').style.display = section === 'settings' ? 'block' : 'none';
    stockGraphCanvas.style.display = section === 'activities' ? 'block' : 'none';
    updateUI();
    if (section === 'activities') drawStockGraph();
}

function handleCode() {
    const codeInput = document.getElementById('codeInput').value.toLowerCase().trim();
    const codeMessage = document.getElementById('codeMessage');
    if (usedCodes.includes(codeInput)) {
        codeMessage.textContent = 'Tento kód už bol použitý!';
        return;
    }
    switch (codeInput) {
        case 'developer2020':
            ownedFoods = [0, 1, 2, 3, 4];
            ownedSkins = [0, 1, 2, 3, 4, 5];
            konecnikSize = 6;
            mechurSize = 6;
            zachodLevel = 6;
            autoKadenieLevel = 5;
            autoCuranieLevel = 5;
            critChanceLevel = 5;
            isAutoKadenieEnabled = true;
            isAutoCuranieEnabled = true;
            codeMessage.textContent = 'Všetko odomknuté a maximalizované!';
            break;
        case 'staroruzovy':
            if (!ownedSkins.includes(6)) {
                ownedSkins.push(6);
                currentSkin = 6;
            }
            codeMessage.textContent = 'Staroružový skin odomknutý!';
            break;
        case 'bohatas':
            kakaCoins += 999999;
            codeMessage.textContent = 'Získal si 999,999 Kaka Coinov!';
            break;
        case 'tutorialpeniaze':
            kakaCoins += 250;
            codeMessage.textContent = 'Získal si 250 Kaka Coinov!';
            break;
        case 'lenkriticke':
            isOnlyCritical = true;
            codeMessage.textContent = 'Teraz získavaš iba Kritické Zásahy!';
            break;
        case 'prdy':
            if (!ownedFoods.includes(5)) {
                ownedFoods.push(5);
                currentFood = 5;
                jedloLevel = FOODS[5].level;
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
        if (kadenieCooldown > 0) {
            kadenieCooldown = Math.max(0, BASE_COOLDOWN - COOLDOWN_REDUCTION[jedloLevel] - (currentTime - lastKadenieTime));
        }
        if (curanieCooldown > 0) {
            curanieCooldown = Math.max(0, BASE_COOLDOWN * PEE_COOLDOWN_MULTIPLIER - COOLDOWN_REDUCTION[jedloLevel] - (currentTime - lastCuranieTime));
        }
        if (autoKadenieLevel > 0 && isAutoKadenieEnabled && autoKadenieCooldown <= 0) {
            kakaCoins += 10 * konecnikSize * zachodLevel * getCritMultiplier(true, true);
            autoKadenieCooldown = AUTO_COOLDOWN - AUTO_COOLDOWN_REDUCTION[autoKadenieLevel - 1] - COOLDOWN_REDUCTION[jedloLevel];
            lastAutoKadenieTime = currentTime;
            saveProgress();
        }
        if (autoCuranieLevel > 0 && isAutoCuranieEnabled && autoCuranieCooldown <= 0) {
            kakaCoins += 7 * mechurSize * zachodLevel * getCritMultiplier(true, false);
            autoCuranieCooldown = AUTO_COOLDOWN * PEE_COOLDOWN_MULTIPLIER - AUTO_COOLDOWN_REDUCTION[autoCuranieLevel - 1] - COOLDOWN_REDUCTION[jedloLevel];
            lastAutoCuranieTime = currentTime;
            saveProgress();
        }
        if (autoKadenieLevel > 0 && autoKadenieCooldown > 0) {
            autoKadenieCooldown = Math.max(0, AUTO_COOLDOWN - AUTO_COOLDOWN_REDUCTION[autoKadenieLevel - 1] - COOLDOWN_REDUCTION[jedloLevel] - (currentTime - lastAutoKadenieTime));
        }
        if (autoCuranieLevel > 0 && autoCuranieCooldown > 0) {
            autoCuranieCooldown = Math.max(0, AUTO_COOLDOWN * PEE_COOLDOWN_MULTIPLIER - AUTO_COOLDOWN_REDUCTION[autoCuranieLevel - 1] - COOLDOWN_REDUCTION[jedloLevel] - (currentTime - lastAutoCuranieTime));
        }
        if (autoKadenieLevel > 0 && autoCuranieLevel > 0 && !isAutoKadenieEnabled && !isAutoCuranieEnabled) {
            if (!autoDisabledStartTime) autoDisabledStartTime = currentTime;
            if (currentTime - autoDisabledStartTime >= 5 * 60 * 1000) {
                ACHIEVEMENTS[4].achieved = true;
                kakaCoins += ACHIEVEMENTS[4].reward;
                autoDisabledStartTime = null;
                alert('Úspech odomknutý: Päťminútová Výdrž! Odmena: 1500 Kaka Coinov');
                saveProgress();
            }
        } else {
            autoDisabledStartTime = null;
        }
        updateStocks(currentTime);
        updateParticles();
    }
    drawZachod();
    updateUI();
    requestAnimationFrame(gameLoop);
}

// Keyboard shortcuts
document.addEventListener('keypress', (e) => {
    const key = e.key.toLowerCase();
    if (document.activeElement !== document.getElementById('codeInput') && document.activeElement !== document.getElementById('slotName')) {
        if (key === 'x' && isMenuOpen) {
            const subMenus = ['upgradesMenu', 'shopMenu', 'catalogMenu', 'codesMenu', 'activitiesMenu', 'achievementsMenu', 'howToPlayMenu', 'settingsMenu'];
            const isSubMenuOpen = subMenus.some(id => document.getElementById(id).style.display === 'block');
            if (isSubMenuOpen) {
                toggleMenu(true);
            } else {
                toggleMenu(false);
            }
        } else if (key === 'k' && !isMenuOpen && kadenieCooldown <= 0) {
            document.getElementById('kadenieButton').click();
        } else if (key === 'c' && !isMenuOpen && curanieCooldown <= 0) {
            document.getElementById('curanieButton').click();
        } else if (key === 'm' && !isMenuOpen) {
            toggleMenu(true);
        }
    }
});

document.getElementById('kadenieButton').addEventListener('click', () => {
    if (kadenieCooldown <= 0 && !isMenuOpen) {
        kakaCoins += 10 * konecnikSize * zachodLevel * getCritMultiplier(false, true);
        kadenieCooldown = BASE_COOLDOWN - COOLDOWN_REDUCTION[jedloLevel];
        lastKadenieTime = Date.now();
        updateUI();
        saveProgress();
    }
});

document.getElementById('curanieButton').addEventListener('click', () => {
    if (curanieCooldown <= 0 && !isMenuOpen) {
        kakaCoins += 7 * mechurSize * zachodLevel * getCritMultiplier(false, false);
        curanieCooldown = BASE_COOLDOWN * PEE_COOLDOWN_MULTIPLIER - COOLDOWN_REDUCTION[jedloLevel];
        lastCuranieTime = Date.now();
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

document.getElementById('activitiesButton').addEventListener('click', () => {
    toggleMenu(true, 'activities');
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

document.getElementById('konecnikUpgrade').addEventListener('click', () => {
    if (konecnikSize < 6 && kakaCoins >= UPGRADE_COSTS.konecnik[konecnikSize - 1]) {
        kakaCoins -= UPGRADE_COSTS.konecnik[konecnikSize - 1];
        konecnikSize++;
        updateUI();
        saveProgress();
    } else {
        alert(konecnikSize >= 6 ? 'Konečník je maximalizovaný!' : 'Nedostatok Kaka Coinov!');
    }
});

document.getElementById('mechurUpgrade').addEventListener('click', () => {
    if (mechurSize < 6 && kakaCoins >= UPGRADE_COSTS.mechur[mechurSize - 1]) {
        kakaCoins -= UPGRADE_COSTS.mechur[mechurSize - 1];
        mechurSize++;
        updateUI();
        saveProgress();
    } else {
        alert(mechurSize >= 6 ? 'Mechúr je maximalizovaný!' : 'Nedostatok Kaka Coinov!');
    }
});

document.getElementById('zachodUpgrade').addEventListener('click', () => {
    if (zachodLevel < 6 && kakaCoins >= UPGRADE_COSTS.zachod[zachodLevel - 1]) {
        kakaCoins -= UPGRADE_COSTS.zachod[zachodLevel - 1];
        zachodLevel++;
        updateUI();
        saveProgress();
    } else {
        alert(zachodLevel >= 6 ? 'Záchod je maximalizovaný!' : 'Nedostatok Kaka Coinov!');
    }
});

document.getElementById('autoKadenieUpgrade').addEventListener('click', () => {
    if (autoKadenieLevel < 5 && kakaCoins >= UPGRADE_COSTS.autoKadenie[autoKadenieLevel]) {
        kakaCoins -= UPGRADE_COSTS.autoKadenie[autoKadenieLevel];
        autoKadenieLevel++;
        isAutoKadenieEnabled = true;
        updateUI();
        saveProgress();
    } else {
        alert(autoKadenieLevel >= 5 ? 'Auto Kadenie je maximalizované!' : 'Nedostatok Kaka Coinov!');
    }
});

document.getElementById('autoCuranieUpgrade').addEventListener('click', () => {
    if (autoCuranieLevel < 5 && kakaCoins >= UPGRADE_COSTS.autoCuranie[autoCuranieLevel]) {
        kakaCoins -= UPGRADE_COSTS.autoCuranie[autoCuranieLevel];
        autoCuranieLevel++;
        isAutoCuranieEnabled = true;
        updateUI();
        saveProgress();
    } else {
        alert(autoCuranieLevel >= 5 ? 'Auto Čúranie je maximalizované!' : 'Nedostatok Kaka Coinov!');
    }
});

document.getElementById('critChanceUpgrade').addEventListener('click', () => {
    if (critChanceLevel < 5 && kakaCoins >= UPGRADE_COSTS.critChance[critChanceLevel - 1]) {
        kakaCoins -= UPGRADE_COSTS.critChance[critChanceLevel - 1];
        critChanceLevel++;
        updateUI();
        saveProgress();
    } else {
        alert(critChanceLevel >= 5 ? 'Kritický Zásah je maximalizovaný!' : 'Nedostatok Kaka Coinov!');
    }
});

document.getElementById('foodJablko').addEventListener('click', () => {
    if (!ownedFoods.includes(0)) {
        ownedFoods.push(0);
        updateUI();
        saveProgress();
    }
});

document.getElementById('foodMaso').addEventListener('click', () => {
    if (!ownedFoods.includes(1) && kakaCoins >= FOOD_COSTS.maso) {
        kakaCoins -= FOOD_COSTS.maso;
        ownedFoods.push(1);
        updateUI();
        saveProgress();
    } else if (!ownedFoods.includes(1)) {
        alert('Nedostatok Kaka Coinov!');
    }
});

document.getElementById('foodPrehanadlo').addEventListener('click', () => {
    if (!ownedFoods.includes(2) && kakaCoins >= FOOD_COSTS.prehanadlo) {
        kakaCoins -= FOOD_COSTS.prehanadlo;
        ownedFoods.push(2);
        updateUI();
        saveProgress();
    } else if (!ownedFoods.includes(2)) {
        alert('Nedostatok Kaka Coinov!');
    }
});

document.getElementById('foodTaco').addEventListener('click', () => {
    if (!ownedFoods.includes(3) && kakaCoins >= FOOD_COSTS.taco) {
        kakaCoins -= FOOD_COSTS.taco;
        ownedFoods.push(3);
        updateUI();
        saveProgress();
    } else if (!ownedFoods.includes(3)) {
        alert('Nedostatok Kaka Coinov!');
    }
});

document.getElementById('foodAtomovy').addEventListener('click', () => {
    if (!ownedFoods.includes(4) && kakaCoins >= FOOD_COSTS.atomovy) {
        kakaCoins -= FOOD_COSTS.atomovy;
        ownedFoods.push(4);
        updateUI();
        saveProgress();
    } else if (!ownedFoods.includes(4)) {
        alert('Nedostatok Kaka Coinov!');
    }
});

document.getElementById('skinZakladny').addEventListener('click', () => {
    if (!ownedSkins.includes(0)) {
        ownedSkins.push(0);
        updateUI();
        saveProgress();
    }
});

document.getElementById('skinZlaty').addEventListener('click', () => {
    if (!ownedSkins.includes(1) && kakaCoins >= SKIN_COSTS.zlaty) {
        kakaCoins -= SKIN_COSTS.zlaty;
        ownedSkins.push(1);
        updateUI();
        saveProgress();
    } else if (!ownedSkins.includes(1)) {
        alert('Nedostatok Kaka Coinov!');
    }
});

document.getElementById('skinDiamantovy').addEventListener('click', () => {
    if (!ownedSkins.includes(2) && kakaCoins >= SKIN_COSTS.diamantovy) {
        kakaCoins -= SKIN_COSTS.diamantovy;
        ownedSkins.push(2);
        updateUI();
        saveProgress();
    } else if (!ownedSkins.includes(2)) {
        alert('Nedostatok Kaka Coinov!');
    }
});

document.getElementById('skinRubinovy').addEventListener('click', () => {
    if (!ownedSkins.includes(3) && kakaCoins >= SKIN_COSTS.rubinovy) {
        kakaCoins -= SKIN_COSTS.rubinovy;
        ownedSkins.push(3);
        updateUI();
        saveProgress();
    } else if (!ownedSkins.includes(3)) {
        alert('Nedostatok Kaka Coinov!');
    }
});

document.getElementById('skinSmaragdovy').addEventListener('click', () => {
    if (!ownedSkins.includes(4) && kakaCoins >= SKIN_COSTS.smaragdovy) {
        kakaCoins -= SKIN_COSTS.smaragdovy;
        ownedSkins.push(4);
        updateUI();
        saveProgress();
    } else if (!ownedSkins.includes(4)) {
        alert('Nedostatok Kaka Coinov!');
    }
});

document.getElementById('skinOnyxovy').addEventListener('click', () => {
    if (!ownedSkins.includes(5) && kakaCoins >= SKIN_COSTS.onyxovy) {
        kakaCoins -= SKIN_COSTS.onyxovy;
        ownedSkins.push(5);
        updateUI();
        saveProgress();
    } else if (!ownedSkins.includes(5)) {
        alert('Nedostatok Kaka Coinov!');
    }
});

document.getElementById('selectJablko').addEventListener('click', () => {
    if (ownedFoods.includes(0)) {
        currentFood = 0;
        jedloLevel = FOODS[0].level;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectMaso').addEventListener('click', () => {
    if (ownedFoods.includes(1)) {
        currentFood = 1;
        jedloLevel = FOODS[1].level;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectPrehanadlo').addEventListener('click', () => {
    if (ownedFoods.includes(2)) {
        currentFood = 2;
        jedloLevel = FOODS[2].level;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectTaco').addEventListener('click', () => {
    if (ownedFoods.includes(3)) {
        currentFood = 3;
        jedloLevel = FOODS[3].level;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectAtomovy').addEventListener('click', () => {
    if (ownedFoods.includes(4)) {
        currentFood = 4;
        jedloLevel = FOODS[4].level;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectPrdy').addEventListener('click', () => {
    if (ownedFoods.includes(5)) {
        currentFood = 5;
        jedloLevel = FOODS[5].level;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectZakladny').addEventListener('click', () => {
    if (ownedSkins.includes(0)) {
        currentSkin = 0;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectZlaty').addEventListener('click', () => {
    if (ownedSkins.includes(1)) {
        currentSkin = 1;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectDiamantovy').addEventListener('click', () => {
    if (ownedSkins.includes(2)) {
        currentSkin = 2;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectRubinovy').addEventListener('click', () => {
    if (ownedSkins.includes(3)) {
        currentSkin = 3;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectSmaragdovy').addEventListener('click', () => {
    if (ownedSkins.includes(4)) {
        currentSkin = 4;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectOnyxovy').addEventListener('click', () => {
    if (ownedSkins.includes(5)) {
        currentSkin = 5;
        updateUI();
        saveProgress();
    }
});

document.getElementById('selectStaroruzovy').addEventListener('click', () => {
    if (ownedSkins.includes(6)) {
        currentSkin = 6;
        updateUI();
        saveProgress();
    }
});

document.getElementById('toggleAutoKadenie').addEventListener('click', () => {
    if (autoKadenieLevel > 0) {
        isAutoKadenieEnabled = !isAutoKadenieEnabled;
        updateUI();
        saveProgress();
    }
});

document.getElementById('toggleAutoCuranie').addEventListener('click', () => {
    if (autoCuranieLevel > 0) {
        isAutoCuranieEnabled = !isAutoCuranieEnabled;
        updateUI();
        saveProgress();
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

document.getElementById('saveSlot').addEventListener('click', () => {
    const slot = document.getElementById('slotSelect').value;
    const name = document.getElementById('slotName').value.trim();
    saveProgress(slot);
    renameSlot(slot, name);
    alert(`Hra uložená do slotu ${saveSlots[slot].name}!`);
});

document.getElementById('loadSlot').addEventListener('click', () => {
    const slot = document.getElementById('slotSelect').value;
    if (saveSlots[slot].data) {
        loadProgress(slot);
        alert(`Hra načítaná zo slotu ${saveSlots[slot].name}!`);
    } else {
        alert(`Slot ${saveSlots[slot].name} je prázdny!`);
    }
});

document.getElementById('resetSlot').addEventListener('click', () => {
    const slot = document.getElementById('slotSelect').value;
    resetSlot(slot);
});

document.getElementById('gambleDouble').addEventListener('click', () => {
    gamble(2);
});

document.getElementById('gambleTriple').addEventListener('click', () => {
    gamble(3);
});

document.getElementById('gambleQuad').addEventListener('click', () => {
    gamble(4);
});

window.buyStock = buyStock;
window.sellStock = sellStock;

ctx.font = '20px Arial';
stockGraphCtx.font = '12px Arial';
loadProgress();
updateStocks(Date.now());
updateUI();
drawZachod();
requestAnimationFrame(gameLoop);
