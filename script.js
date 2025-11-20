/* =========================================
   KAHINA: ASCENSION - GAME ENGINE V3
   ========================================= */

// --- CONFIGURATION ---
const PLAYER_STATS = { maxHp: 100, attack: 15, heal: 30 };
let player = { name: "Gardienne", hp: 100, essence: 0, defenseMode: false };
let currentEnemy = null;

// Liste des ennemis (Tes images)
const ENEMIES_DB = [
    { name: "L'OMBRE", img: "./images/5.jpg", hp: 80, attack: 10, xp: 50 }, //
    { name: "PYRO", img: "./images/12.jpg", hp: 100, attack: 15, xp: 80 }, //
    { name: "TITAN", img: "./images/9.jpg", hp: 150, attack: 8, xp: 100 }, //
    { name: "VIPER", img: "./images/8.jpg", hp: 90, attack: 12, xp: 60 },  //
    { name: "SNIPER", img: "./images/10.jpg", hp: 70, attack: 20, xp: 70 }, //
    { name: "RONIN", img: "./images/6.jpg", hp: 110, attack: 14, xp: 90 }  //
];

// --- DOM ELEMENTS ---
const authScreen = document.getElementById('auth-screen');
const gameContainer = document.getElementById('game-container');
const playerNameInput = document.getElementById('player-name-input');
const displayUsername = document.getElementById('display-username');
const enemyGrid = document.getElementById('enemy-grid');
const battleScreen = document.getElementById('battle-screen');
const selectionScreen = document.getElementById('selection-screen');

// --- SYSTEME D'AUTHENTIFICATION (SIMULÉ) ---
document.getElementById('login-btn').addEventListener('click', handleLogin);
document.getElementById('register-btn').addEventListener('click', handleLogin); // Même action pour l'effet

function handleLogin() {
    const name = playerNameInput.value.trim() || "Gardienne";
    player.name = name;
    displayUsername.textContent = name.toUpperCase();

    // Animation de succès
    alert(`✨ Bienvenue, ${name}. La forêt a senti votre présence.`);
    
    // Transition
    authScreen.style.opacity = '0';
    setTimeout(() => {
        authScreen.style.display = 'none';
        gameContainer.classList.remove('hidden-opacity');
        initLobby();
    }, 800);
}

// --- LOBBY & SELECTION ---
function initLobby() {
    enemyGrid.innerHTML = '';
    ENEMIES_DB.forEach((enemy, index) => {
        const card = document.createElement('div');
        card.classList.add('enemy-card');
        card.innerHTML = `
            <img src="${enemy.img}">
            <div style="margin-top:10px; font-weight:bold;">${enemy.name}</div>
            <div style="font-size:0.8em; opacity:0.7;">PV: ${enemy.hp}</div>
        `;
        card.addEventListener('click', () => startBattle(index));
        enemyGrid.appendChild(card);
    });
}

// --- MOTEUR DE COMBAT ---
function startBattle(enemyIndex) {
    // Clonage de l'ennemi pour ne pas modifier la DB originale
    currentEnemy = { ...ENEMIES_DB[enemyIndex], maxHp: ENEMIES_DB[enemyIndex].hp };
    player.hp = PLAYER_STATS.maxHp;
    player.defenseMode = false;

    // UI Setup
    selectionScreen.classList.remove('active');
    battleScreen.classList.add('active'); // Utilise flex grâce au CSS .active
    battleScreen.classList.remove('hidden');
    
    document.getElementById('battle-enemy-img').src = currentEnemy.img;
    document.getElementById('leave-battle-btn').classList.add('hidden');
    document.querySelector('.battle-controls').style.pointerEvents = 'auto';
    
    updateHealthBars();
    logBattle(`Un ${currentEnemy.name} corrompu apparaît !`);
}

function updateHealthBars() {
    const playerPct = (player.hp / PLAYER_STATS.maxHp) * 100;
    const enemyPct = (currentEnemy.hp / currentEnemy.maxHp) * 100;
    
    document.getElementById('player-hp-bar').style.width = `${Math.max(0, playerPct)}%`;
    document.getElementById('enemy-hp-bar').style.width = `${Math.max(0, enemyPct)}%`;
    document.getElementById('hp-display').textContent = Math.max(0, player.hp);
}

// --- ACTIONS DU JOUEUR ---
document.getElementById('btn-attack').addEventListener('click', () => playerTurn('attack'));
document.getElementById('btn-heal').addEventListener('click', () => playerTurn('heal'));
document.getElementById('btn-defend').addEventListener('click', () => playerTurn('defend'));

function playerTurn(action) {
    if (player.hp <= 0 || currentEnemy.hp <= 0) return;

    let logMsg = "";
    player.defenseMode = false; // Reset defense
    document.getElementById('player-shield').classList.add('hidden');

    if (action === 'attack') {
        // Dégâts entre 10 et 20 + Crit chance
        let dmg = Math.floor(Math.random() * 10) + PLAYER_STATS.attack;
        if(Math.random() > 0.8) { dmg *= 2; logMsg += "CRITIQUE ! "; } // 20% Crit
        
        currentEnemy.hp -= dmg;
        showFloatingText('enemy', `-${dmg}`);
        animateFighter('player', 'attack');
        animateFighter('enemy', 'hit');
        logMsg += `Vous infligez ${dmg} dégâts à ${currentEnemy.name}.`;
    
    } else if (action === 'heal') {
        const healAmount = PLAYER_STATS.heal;
        player.hp = Math.min(player.hp + healAmount, PLAYER_STATS.maxHp);
        showFloatingText('player', `+${healAmount}`, '#52b788');
        logMsg = "La nature restaure vos forces.";

    } else if (action === 'defend') {
        player.defenseMode = true;
        document.getElementById('player-shield').classList.remove('hidden');
        logMsg = "Vous renforcez votre écorce spirituelle.";
    }

    logBattle(logMsg);
    updateHealthBars();

    if (currentEnemy.hp <= 0) {
        endBattle(true);
    } else {
        // Tour de l'ennemi après 1 seconde
        document.querySelector('.skills-grid').style.opacity = '0.5';
        document.querySelector('.skills-grid').style.pointerEvents = 'none';
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
    document.querySelector('.skills-grid').style.opacity = '1';
    document.querySelector('.skills-grid').style.pointerEvents = 'auto';

    if (player.hp <= 0) {
        endBattle(false);
    }
}

// --- UTILITAIRES ---
function logBattle(msg) {
    const log = document.getElementById('battle-log');
    log.textContent = msg;
    log.style.animation = 'none';
    log.offsetHeight; /* trigger reflow */
    log.style.animation = 'shake 0.2s';
}

function showFloatingText(target, text, color = 'white') {
    const el = document.getElementById(`${target}-damage`);
    el.textContent = text;
    el.style.color = color;
    el.classList.remove('show');
    void el.offsetWidth; // Reset animation
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
        logBattle(`VICTOIRE ! Vous gagnez ${currentEnemy.xp} Essence.`);
        logBattle.style.color = "#ffd700";
        player.essence += currentEnemy.xp;
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
