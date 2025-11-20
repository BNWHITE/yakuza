/* =========================================
   KAHINA: L'HÉRITAGE DES ANCIENS - GAME ENGINE V4
   ========================================= */

// --- CONFIGURATION ---
const PLAYER_BASE_STATS = { 
    maxHp: 100, 
    maxMana: 50, 
    attack: 15, 
    defense: 5, 
    heal: 30 
};

let player = { 
    name: "Gardienne", 
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    hp: 100, 
    mana: 50,
    essence: 0, 
    defenseMode: false,
    stats: { ...PLAYER_BASE_STATS },
    equipment: {
        weapon: null,
        armor: null,
        accessory: null
    },
    skills: [],
    inventory: []
};

let currentEnemy = null;
let currentZone = "sanctuary";

// Zones de jeu avec ennemis spécifiques
const ZONES = {
    sanctuary: {
        name: "Sanctuaire Central",
        levelRange: "1-5",
        enemies: [
            { name: "L'OMBRE", img: "./images/5.jpg", hp: 80, attack: 10, xp: 50, type: "Ombre" },
            { name: "PYRO", img: "./images/12.jpg", hp: 100, attack: 15, xp: 80, type: "Feu" }
        ]
    },
    ruins: {
        name: "Ruines Antiques",
        levelRange: "5-10",
        enemies: [
            { name: "TITAN", img: "./images/9.jpg", hp: 150, attack: 8, xp: 100, type: "Terre" },
            { name: "VIPER", img: "./images/8.jpg", hp: 90, attack: 12, xp: 60, type: "Poison" }
        ]
    },
    abyss: {
        name: "Abysse Corrompu",
        levelRange: "10-15",
        enemies: [
            { name: "SNIPER", img: "./images/10.jpg", hp: 70, attack: 20, xp: 70, type: "Vent" },
            { name: "RONIN", img: "./images/6.jpg", hp: 110, attack: 14, xp: 90, type: "Lame" }
        ]
    },
    citadel: {
        name: "Citadelle des Anciens",
        levelRange: "15-20",
        enemies: [
            { name: "DRACONIS", img: "./images/7.jpg", hp: 200, attack: 25, xp: 150, type: "Dragon" },
            { name: "SPECTRE", img: "./images/11.jpg", hp: 120, attack: 18, xp: 120, type: "Spectre" }
        ]
    }
};

// Compétences disponibles
const SKILLS = {
    attack: { name: "Frappe Spirituelle", cost: 0, type: "attack", desc: "Inflige des dégâts de base" },
    heal: { name: "Renaissance", cost: 10, type: "heal", desc: "Restaure vos points de vie" },
    defend: { name: "Écorce de Fer", cost: 5, type: "defense", desc: "Réduit les dégâts subis" },
    special: { name: "Furie des Anciens", cost: 20, type: "special", desc: "Attaque puissante des ancêtres" }
};

// --- DOM ELEMENTS ---
const authScreen = document.getElementById('auth-screen');
const gameContainer = document.getElementById('game-container');
const playerNameInput = document.getElementById('player-name-input');
const displayUsername = document.getElementById('display-username');
const playerLevel = document.getElementById('player-level');
const enemyGrid = document.getElementById('enemy-grid');
const battleScreen = document.getElementById('battle-screen');
const selectionScreen = document.getElementById('selection-screen');
const worldMapScreen = document.getElementById('world-map');
const inventoryScreen = document.getElementById('inventory-screen');

// --- SYSTEME D'AUTHENTIFICATION ---
document.getElementById('login-btn').addEventListener('click', handleLogin);
document.getElementById('register-btn').addEventListener('click', handleLogin);

function handleLogin() {
    const name = playerNameInput.value.trim() || "Gardienne";
    player.name = name;
    displayUsername.textContent = name.toUpperCase();

    // Animation de succès
    alert(`✨ Bienvenue, ${name}. L'héritage des anciens vous attend.`);
    
    // Transition
    authScreen.style.opacity = '0';
    setTimeout(() => {
        authScreen.style.display = 'none';
        gameContainer.classList.remove('hidden-opacity');
        initWorldMap();
    }, 800);
}

// --- MONDE ET ZONES ---
function initWorldMap() {
    // Déverrouiller les zones selon le niveau
    document.querySelectorAll('.zone-card').forEach(card => {
        const zone = card.dataset.zone;
        if (zone === "sanctuary" || (zone === "ruins" && player.level >= 5) || 
            (zone === "abyss" && player.level >= 10) || (zone === "citadel" && player.level >= 15)) {
            card.classList.remove('locked');
            card.addEventListener('click', () => selectZone(zone));
        }
    });
}

function selectZone(zone) {
    currentZone = zone;
    document.getElementById('zone-title').textContent = ZONES[zone].name;
    worldMapScreen.classList.remove('active');
    selectionScreen.classList.add('active');
    initEnemySelection();
}

function initEnemySelection() {
    enemyGrid.innerHTML = '';
    ZONES[currentZone].enemies.forEach((enemy, index) => {
        const card = document.createElement('div');
        card.classList.add('enemy-card');
        card.innerHTML = `
            <img src="${enemy.img}">
            <div style="margin-top:10px; font-weight:bold;">${enemy.name}</div>
            <div style="font-size:0.8em; opacity:0.7;">PV: ${enemy.hp} | Type: ${enemy.type}</div>
        `;
        card.addEventListener('click', () => startBattle(index));
        enemyGrid.appendChild(card);
    });
}

// --- MOTEUR DE COMBAT AMÉLIORÉ ---
function startBattle(enemyIndex) {
    // Clonage de l'ennemi avec mise à l'échelle selon le niveau
    const baseEnemy = ZONES[currentZone].enemies[enemyIndex];
    const levelScale = 1 + (player.level - 1) * 0.1;
    
    currentEnemy = { 
        ...baseEnemy, 
        maxHp: Math.floor(baseEnemy.hp * levelScale),
        hp: Math.floor(baseEnemy.hp * levelScale),
        attack: Math.floor(baseEnemy.attack * levelScale),
        xp: Math.floor(baseEnemy.xp * levelScale)
    };

    // Réinitialisation du joueur
    player.hp = player.stats.maxHp;
    player.mana = player.stats.maxMana;
    player.defenseMode = false;

    // UI Setup
    selectionScreen.classList.remove('active');
    battleScreen.classList.add('active');
    battleScreen.classList.remove('hidden');
    
    document.getElementById('battle-enemy-img').src = currentEnemy.img;
    document.getElementById('enemy-type').textContent = currentEnemy.type;
    document.getElementById('leave-battle-btn').classList.add('hidden');
    document.querySelector('.battle-controls').style.pointerEvents = 'auto';
    
    updateHealthBars();
    updateManaBar();
    logBattle(`Un ${currentEnemy.name} corrompu apparaît !`);
}

function updateHealthBars() {
    const playerPct = (player.hp / player.stats.maxHp) * 100;
    const enemyPct = (currentEnemy.hp / currentEnemy.maxHp) * 100;
    
    document.getElementById('player-hp-bar').style.width = `${Math.max(0, playerPct)}%`;
    document.getElementById('enemy-hp-bar').style.width = `${Math.max(0, enemyPct)}%`;
    document.getElementById('hp-display').textContent = Math.max(0, player.hp);
    document.getElementById('max-hp-display').textContent = player.stats.maxHp;
}

function updateManaBar() {
    const manaPct = (player.mana / player.stats.maxMana) * 100;
    document.getElementById('player-mana-bar').style.width = `${Math.max(0, manaPct)}%`;
    document.getElementById('mana-display').textContent = Math.max(0, player.mana);
    document.getElementById('max-mana-display').textContent = player.stats.maxMana;
}

// --- ACTIONS DU JOUEUR AVEC SYSTÈME DE MANA ---
document.getElementById('btn-attack').addEventListener('click', () => playerTurn('attack'));
document.getElementById('btn-heal').addEventListener('click', () => playerTurn('heal'));
document.getElementById('btn-defend').addEventListener('click', () => playerTurn('defend'));
document.getElementById('btn-special').addEventListener('click', () => playerTurn('special'));

function playerTurn(action) {
    if (player.hp <= 0 || currentEnemy.hp <= 0) return;

    const skill = SKILLS[action];
    
    // Vérifier le mana
    if (player.mana < skill.cost) {
        logBattle("Pas assez de mana !");
        return;
    }

    // Dépenser le mana
    player.mana -= skill.cost;
    updateManaBar();

    let logMsg = "";
    player.defenseMode = false;
    document.getElementById('player-shield').classList.add('hidden');

    if (action === 'attack') {
        let dmg = Math.floor(Math.random() * 10) + player.stats.attack;
        if(Math.random() > 0.8) { 
            dmg *= 2; 
            logMsg += "CRITIQUE ! "; 
        }
        
        currentEnemy.hp -= dmg;
        showFloatingText('enemy', `-${dmg}`);
        animateFighter('player', 'attack');
        animateFighter('enemy', 'hit');
        logMsg += `Vous infligez ${dmg} dégâts à ${currentEnemy.name}.`;
    
    } else if (action === 'heal') {
        const healAmount = player.stats.heal;
        player.hp = Math.min(player.hp + healAmount, player.stats.maxHp);
        showFloatingText('player', `+${healAmount}`, '#52b788');
        logMsg = "La nature restaure vos forces.";

    } else if (action === 'defend') {
        player.defenseMode = true;
        document.getElementById('player-shield').classList.remove('hidden');
        logMsg = "Vous renforcez votre écorce spirituelle.";
    
    } else if (action === 'special') {
        let dmg = Math.floor(Math.random() * 15) + 20;
        currentEnemy.hp -= dmg;
        showFloatingText('enemy', `-${dmg}`, '#ff9900');
        animateFighter('player', 'attack');
        animateFighter('enemy', 'hit');
        logMsg = `La FURIE DES ANCIENS inflige ${dmg} dégâts dévastateurs !`;
    }

    logBattle(logMsg);
    updateHealthBars();

    if (currentEnemy.hp <= 0) {
        endBattle(true);
    } else {
        // Tour de l'ennemi après 1 seconde
        disableSkills();
        setTimeout(enemyTurn, 1200);
    }
}

function enemyTurn() {
    if (currentEnemy.hp <= 0) return;

    let dmg = Math.floor(Math.random() * 5) + currentEnemy.attack;
    
    // Si joueur défend, dégâts réduits de 50%
    if (player.defenseMode) {
        dmg = Math.floor(dmg / 2);
    }

    player.hp -= dmg;
    showFloatingText('player', `-${dmg}`, '#e63946');
    animateFighter('enemy', 'attack');
    animateFighter('player', 'hit');
    
    logBattle(`${currentEnemy.name} attaque et inflige ${dmg} dégâts !`);
    updateHealthBars();

    // Réactiver les boutons
    enableSkills();

    if (player.hp <= 0) {
        endBattle(false);
    }
}

function disableSkills() {
    document.querySelectorAll('.skill-btn').forEach(btn => {
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
    });
}

function enableSkills() {
    document.querySelectorAll('.skill-btn').forEach(btn => {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        
        // Désactiver les boutons si pas assez de mana
        const action = btn.id.replace('btn-', '');
        if (SKILLS[action].cost > player.mana) {
            btn.disabled = true;
        } else {
            btn.disabled = false;
        }
    });
}

// --- SYSTÈME DE PROGRESSION ---
function gainXP(amount) {
    player.xp += amount;
    
    if (player.xp >= player.xpToNextLevel) {
        levelUp();
    }
}

function levelUp() {
    player.level++;
    player.xp -= player.xpToNextLevel;
    player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.5);
    
    // Amélioration des stats
    player.stats.maxHp += 20;
    player.stats.maxMana += 10;
    player.stats.attack += 3;
    player.stats.heal += 5;
    
    // Soin complet
    player.hp = player.stats.maxHp;
    player.mana = player.stats.maxMana;
    
    // Mise à jour de l'UI
    playerLevel.textContent = `Niv. ${player.level}`;
    updateHealthBars();
    updateManaBar();
    
    alert(`🎉 FÉLICITATIONS ! Vous atteignez le niveau ${player.level} !`);
    
    // Vérifier le déverrouillage de nouvelles zones
    initWorldMap();
}

// --- UTILITAIRES ---
function logBattle(msg) {
    const log = document.getElementById('battle-log');
    log.textContent = msg;
    log.style.animation = 'none';
    log.offsetHeight;
    log.style.animation = 'shake 0.2s';
}

function showFloatingText(target, text, color = 'white') {
    const el = document.getElementById(`${target}-damage`);
    el.textContent = text;
    el.style.color = color;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
}

function animateFighter(who, type) {
    const el = document.querySelector(`.fighter.${who} .fighter-img`);
    if (type === 'attack') {
        el.classList.add('attack-anim');
        setTimeout(() => el.classList.remove('attack-anim'), 200);
    } else {
        el.classList.add('hit-anim');
        setTimeout(() => el.classList.remove('hit-anim'), 500);
    }
}

function endBattle(victory) {
    const btn = document.getElementById('leave-battle-btn');
    btn.classList.remove('hidden');
    document.querySelector('.skills-grid').style.pointerEvents = 'none';

    if (victory) {
        logBattle(`VICTOIRE ! Vous gagnez ${currentEnemy.xp} XP et ${Math.floor(currentEnemy.xp/2)} Essence.`);
        player.essence += Math.floor(currentEnemy.xp/2);
        gainXP(currentEnemy.xp);
        document.getElementById('essence-display').textContent = player.essence;
    } else {
        logBattle("DÉFAITE... L'esprit vous a submergé.");
    }

    btn.onclick = () => {
        battleScreen.classList.remove('active');
        battleScreen.classList.add('hidden');
        selectionScreen.classList.add('active');
    };
}

// --- NAVIGATION ---
document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.id !== 'stats-btn') {
        btn.addEventListener('click', () => {
            const screen = btn.dataset.screen;
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(screen).classList.add('active');
        });
    }
});

document.getElementById('back-to-map').addEventListener('click', () => {
    selectionScreen.classList.remove('active');
    worldMapScreen.classList.add('active');
});

document.getElementById('back-from-inventory').addEventListener('click', () => {
    inventoryScreen.classList.remove('active');
    worldMapScreen.classList.add('active');
});

// Initialisation des compétences dans l'inventaire
function initSkills() {
    const skillsList = document.getElementById('skills-list');
    skillsList.innerHTML = '';
    
    Object.values(SKILLS).forEach(skill => {
        const skillEl = document.createElement('div');
        skillEl.classList.add('skill-item');
        skillEl.innerHTML = `
            <div style="font-weight:bold">${skill.name}</div>
            <div style="font-size:0.8em; opacity:0.7">${skill.desc}</div>
            <div style="font-size:0.7em; color:var(--mana)">Coût: ${skill.cost} mana</div>
        `;
        skillsList.appendChild(skillEl);
    });
}

// Initialisation au chargement
window.addEventListener('load', () => {
    initSkills();
});
