/* ================================================= */
/* 🧠 JAVASCRIPT FINAL : YAKUZA - DIGITAL HEIST (V2) */
/* (Course Fixée, Inventaire, Progression, Chat) */
/* ================================================= */

// 1. DÉCLARATION DES CLÉS (Clé Publique)
const SUPABASE_URL = 'https://dxiefxcfnggezuiifeqf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wAZG8NaYrZux3loetrNbmg_6QOuyBz5';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { redirectTo: window.location.origin }
});

let currentUser = null; 
let currentUsername = null; 
let currentRaceInterval; 

const BASE_STATS = { vitesse: 10, codage: 10, chance: 10 }; // Base de départ pour le calcul
const BASE_SPEED_FACTOR = 15; 
const MAX_EQUIPMENT_LEVEL = 10; // Niveau max des composants
const XP_TO_LEVEL = 100; // XP requis pour le niveau 2 (pour la démo)

let playerResources = { yen: 0, kirin: 0, level: 1 };
let playerInventory = { cpu_level: 1, memory_level: 1, luck_level: 1 };
let playerCalculatedStats = { ...BASE_STATS };

// Bonus par niveau d'équipement
const LEVEL_BONUS = 8; 

// Liste des cibles/missions (PNJs)
const students = [
    { name: "DATA VAULT-01", title: "FAIBLE SÉCURITÉ", stats: { vitesse: 20, codage: 30, chance: 40 }, yenReward: 80, kirinReward: 15 }, 
    { name: "GHOST NETWORK", title: "SÉCURITÉ STANDARD", stats: { vitesse: 45, codage: 50, chance: 50 }, yenReward: 150, kirinReward: 30 }, 
    { name: "CRYPTO NODE", title: "SÉCURITÉ ÉLEVÉE", stats: { vitesse: 60, codage: 70, chance: 60 }, yenReward: 300, kirinReward: 50 }, 
    { name: "THE YAKUZA CORE", title: "SÉCURITÉ MAXIMUM", stats: { vitesse: 80, codage: 90, chance: 75 }, yenReward: 600, kirinReward: 80 },
    { name: "ADMIN TERMINAL", title: "ADMINISTRATEUR CLAN", stats: { vitesse: 100, codage: 100, chance: 100 }, yenReward: 1000, kirinReward: 100 }
];

// Upgrades disponibles dans le shop
const UPGRADES = [
    { name: "CPU Core Upgrade", stat: "cpu_level", cost: (lvl) => 100 + lvl * 50, increase: 1, description: "Améliore la Vitesse de Traitement (VITESSE)" },
    { name: "RAM Module Upgrade", stat: "memory_level", cost: (lvl) => 150 + lvl * 75, increase: 1, description: "Améliore la Capacité de Script (CODAGE)" },
    { name: "Luck Chipset v2.0", stat: "luck_level", cost: (lvl) => 120 + lvl * 60, increase: 1, description: "Améliore les Chances de Succès (CHANCE)" }
];


const elements = {
    // Éléments du HUD
    sideHud: document.getElementById('side-hud'),
    kirinDisplay: document.getElementById('kirin-display'),
    playerStatsDisplay: document.getElementById('player-stats-display'),
    agentLevel: document.getElementById('agent-level'),
    equipmentDisplay: document.getElementById('equipment-display'),
    
    // Écrans
    authScreen: document.getElementById('auth-screen'),
    selectionScreen: document.getElementById('selection-screen'),
    shopScreen: document.getElementById('shop-screen'),
    raceScreen: document.getElementById('race-screen'),
    
    // Auth & Chat
    authMessage: document.getElementById('auth-message'),
    logoutBtn: document.getElementById('logout-btn'),
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    sendChatBtn: document.getElementById('send-chat-btn'),
    authEmail: document.getElementById('auth-email'),
    authPassword: document.getElementById('auth-password'),
    
    // Jeu
    kebabDisplay: document.getElementById('kebab-score-display'),
    userWelcome: document.getElementById('user-welcome'),
    selector: document.getElementById('student-selector'),
    startBtn: document.getElementById('start-race-btn'),
    playerCat: document.getElementById('player-cat'),
    opponentCat: document.getElementById('opponent-cat'),
    countdown: document.getElementById('countdown'),
    raceResult: document.getElementById('race-result'),
    resetBtn: document.getElementById('reset-race-btn'),
    upgradeShop: document.getElementById('upgrade-shop'),

    // Options
    speedBoost: document.getElementById('speed-boost-option'),
    luckCharm: document.getElementById('luck-charm-option'),

    // Course
    raceTrack: document.querySelector('.race-track')
};

// ------------------------------------
// LOGIQUE DE PROFIL & STATS
// ------------------------------------

// Calcul dynamique des stats du joueur
function calculatePlayerStats() {
    // Vitesse = Base + (CPU Level * Bonus)
    const vitesse = BASE_STATS.vitesse + (playerInventory.cpu_level * LEVEL_BONUS);
    // Codage = Base + (Memory Level * Bonus)
    const codage = BASE_STATS.codage + (playerInventory.memory_level * LEVEL_BONUS);
    // Chance = Base + (Luck Level * Bonus)
    const chance = BASE_STATS.chance + (playerInventory.luck_level * LEVEL_BONUS);

    playerCalculatedStats = {
        vitesse: Math.min(vitesse, MAX_BASE_STAT),
        codage: Math.min(codage, MAX_BASE_STAT),
        chance: Math.min(chance, MAX_BASE_STAT)
    };
}

// Met à jour l'affichage des stats dans le HUD
function updateHudStats() {
    calculatePlayerStats();
    
    elements.kebabDisplay.textContent = playerResources.yen;
    elements.kirinDisplay.textContent = playerResources.kirin;
    elements.agentLevel.textContent = playerResources.level;
    
    // Affichage des niveaux d'équipement
    let equipmentHTML = `
        <div class="stat-line"><span>CPU:</span> <span style="color:var(--stat-vitesse);">LVL ${playerInventory.cpu_level}</span></div>
        <div class="stat-line"><span>RAM:</span> <span style="color:var(--stat-codage);">LVL ${playerInventory.memory_level}</span></div>
        <div class="stat-line"><span>LUCK:</span> <span style="color:var(--stat-chance);">LVL ${playerInventory.luck_level}</span></div>
    `;
    elements.equipmentDisplay.innerHTML = equipmentHTML;

    // Affichage des stats calculées
    const statsHTML = `
        <div class="stats-card-small">
            <div class="stat-line"><span>Vitesse:</span> <span style="color:var(--stat-vitesse);">${playerCalculatedStats.vitesse}</span></div>
            <div class="stat-line"><span>Codage:</span> <span style="color:var(--stat-codage);">${playerCalculatedStats.codage}</span></div>
            <div class="stat-line"><span>Chance:</span> <span style="color:var(--stat-chance);">${playerCalculatedStats.chance}</span></div>
        </div>
    `;
    elements.playerStatsDisplay.innerHTML = statsHTML;
}

// Met à jour le profil en DB
async function updateProfileDB() {
    if (!currentUser) return;
    
    await supabaseClient
        .from('profiles')
        .update({ 
            kebab_score: playerResources.yen, 
            kirin_points: playerResources.kirin,
            level: playerResources.level,
            inventory: playerInventory
        })
        .eq('id', currentUser.id);
}

// ------------------------------------
// LOGIQUE DE NAVIGATION & SHOP
// ------------------------------------

function showScreen(screenId) {
    const screens = ['auth', 'selection', 'race', 'history', 'shop', 'chat'];
    screens.forEach(id => {
        const screenElement = document.getElementById(`${id}-screen`);
        if (screenElement) screenElement.style.display = 'none';
    });
    
    const targetElement = document.getElementById(`${screenId}-screen`);
    if (targetElement) targetElement.style.display = 'block';

    if (screenId === 'shop') renderShop();
    if (screenId === 'selection') initializeSelection();
}

function renderShop() {
    let shopHTML = '';
    UPGRADES.forEach(upgrade => {
        const currentLevel = playerInventory[upgrade.stat];
        const cost = upgrade.cost(currentLevel);
        const isMaxLevel = currentLevel >= MAX_EQUIPMENT_LEVEL;
        const isDisabled = isMaxLevel || playerResources.yen < cost;
        const buttonText = isMaxLevel ? 'NIVEAU MAX' : (playerResources.yen < cost ? `YEN INSUFFISANT` : `ACHETER (${cost} ¥)`);
        
        shopHTML += `
            <div class="shop-item">
                <h4 class="upgrade-name">${upgrade.name}</h4>
                <p>${upgrade.description}</p>
                <div class="stat-line">Niveau Actuel: <span style="color: var(--accent-red); font-weight: 700;">${currentLevel} / ${MAX_EQUIPMENT_LEVEL}</span></div>
                <button 
                    class="action-button log-btn buy-btn" 
                    data-stat="${upgrade.stat}" 
                    data-cost="${cost}"
                    data-increase="${upgrade.increase}"
                    ${isDisabled ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            </div>
        `;
    });
    elements.upgradeShop.innerHTML = shopHTML;
    
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', handleBuyUpgrade);
    });
}

function handleBuyUpgrade(event) {
    const button = event.target;
    const statKey = button.getAttribute('data-stat');
    const cost = parseInt(button.getAttribute('data-cost'));
    const increase = parseInt(button.getAttribute('data-increase'));
    const currentLevel = playerInventory[statKey];

    if (playerResources.yen >= cost && currentLevel < MAX_EQUIPMENT_LEVEL) {
        playerResources.yen -= cost;
        playerInventory[statKey] += increase;
        
        if (playerInventory[statKey] > MAX_EQUIPMENT_LEVEL) {
            playerInventory[statKey] = MAX_EQUIPMENT_LEVEL;
        }

        updateProfileDB();
        updateHudStats();
        renderShop();
        
        alert(`UPGRADE RÉUSSI: ${statKey.toUpperCase().replace('_LEVEL', '')} est maintenant Niveau ${playerInventory[statKey]}!`);
    }
}

// ------------------------------------
// LOGIQUE DE LA SIMULATION DE HACK (COURSE)
// ------------------------------------

function renderStats(card, bot) {
    const stats = bot.stats;
    const statsHTML = `
        <div class="stats-card">
            <div class="stat-bar-container"><label>Vitesse:</label><div class="stat-bar"><div class="stat-fill" data-stat="vitesse" style="width: ${stats.vitesse}%;"></div></div></div>
            <div class="stat-bar-container"><label>Codage:</label><div class="stat-bar"><div class="stat-fill" data-stat="codage" style="width: ${stats.codage}%;"></div></div></div>
            <div class="stat-bar-container"><label>Chance:</label><div class="stat-bar"><div class="stat-fill" data-stat="chance" style="width: ${stats.chance}%;"></div></div></div>
        </div>
    `;
    card.insertAdjacentHTML('beforeend', statsHTML);
}

function initializeSelection() {
    if (!currentUser) return;

    elements.selector.innerHTML = '';
    students.forEach(bot => {
        const card = document.createElement('div');
        card.classList.add('student-card');
        
        let avatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=${encodeURIComponent(bot.name)}&scale=110&size=100&eyes=sides,round&mouth=smile,pucker&sides=square,round&top=antenna,cone&face=square,round&color=ff0033,00ffee,1a1a1a`;
        
        const avatar = document.createElement('img');
        avatar.classList.add('student-avatar');
        avatar.src = avatarUrl;
        
        const nameElement = document.createElement('h4');
        nameElement.textContent = bot.name;
        
        const titleElement = document.createElement('p');
        titleElement.classList.add('dark-subtitle');
        titleElement.textContent = bot.title;
        
        card.appendChild(avatar);
        card.appendChild(nameElement);
        card.appendChild(titleElement);
        
        renderStats(card, bot); 
        
        card.addEventListener('click', () => selectBot(bot, card, avatarUrl));
        elements.selector.appendChild(card);
    });

    elements.startBtn.style.display = 'none';
}

function selectBot(bot, card, avatarUrl) {
    Array.from(elements.selector.children).forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    opponentBot = bot;
    
    elements.playerCat.src = `https://api.dicebear.com/8.x/bottts/svg?seed=${currentUsername}&scale=110&size=100&color=00ffee,1a1a1a`; 
    elements.opponentCat.src = avatarUrl;

    elements.startBtn.style.display = 'block';
}

function startCountdown() {
    let count = 3;
    elements.countdown.textContent = count;
    elements.countdown.style.display = 'block';
    elements.raceResult.textContent = '';
    elements.resetBtn.style.display = 'none';
    
    elements.playerCat.style.transform = `translateX(0px)`;
    elements.opponentCat.style.transform = `translateX(0px)`;


    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            elements.countdown.textContent = count;
        } else if (count === 0) {
            elements.countdown.textContent = "HACK INITIÉ...";
        } else {
            clearInterval(countdownInterval);
            elements.countdown.style.display = 'none';
            startHack();
        }
    }, 1000);
}

function startHack() {
    const raceTrack = elements.raceTrack;
    const playerCat = elements.playerCat;
    
    const trackWidth = raceTrack.offsetWidth - playerCat.offsetWidth - 30;
    
    if (trackWidth <= 0) {
        declareWinner(1, 0, true); 
        return;
    }

    let playerPosition = 0;
    let opponentPosition = 0;
    
    // Stats basées sur l'équipement du joueur
    const playerStats = playerCalculatedStats;
    const opponentStats = opponentBot.stats;
    
    let playerBaseSpeed = (playerStats.vitesse * (playerStats.codage / MAX_BASE_STAT)) * BASE_SPEED_FACTOR;
    let opponentBaseSpeed = (opponentStats.vitesse * (opponentStats.codage / MAX_BASE_STAT)) * BASE_SPEED_FACTOR;
    
    if (elements.speedBoost.checked) playerBaseSpeed *= 1.1; 
    
    playerCat.classList.add('running');
    elements.opponentCat.classList.add('running');
    elements.raceTrack.classList.add('hacking'); // Animation de hack visuelle


    currentRaceInterval = setInterval(() => {
        const playerVarianceRange = elements.luckCharm.checked ? (MAX_BASE_STAT - playerStats.chance) / 10 : (MAX_BASE_STAT - playerStats.chance) / 50;
        const opponentVarianceRange = (MAX_BASE_STAT - opponentStats.chance) / 50;
        
        const playerStep = (playerBaseSpeed / 100) + (Math.random() * playerVarianceRange / 10);
        const opponentStep = (opponentBaseSpeed / 100) + (Math.random() * opponentVarianceRange / 10);
        
        playerPosition += playerStep; 
        opponentPosition += opponentStep; 

        playerCat.style.transform = `translateX(${Math.min(playerPosition, trackWidth)}px)`;
        elements.opponentCat.style.transform = `translateX(${Math.min(opponentPosition, trackWidth)}px)`;

        if (playerPosition >= trackWidth || opponentPosition >= trackWidth) {
            clearInterval(currentRaceInterval);
            playerCat.classList.remove('running');
            elements.opponentCat.classList.remove('running');
            elements.raceTrack.classList.remove('hacking'); // Arrêt de l'animation
            declareWinner(playerPosition, opponentPosition, false);
        }
    }, 70); 
}

function checkLevelUp() {
    // Vérification simple de niveau : 100 KIRIN par niveau pour l'instant
    const nextLevelXP = playerResources.level * XP_TO_LEVEL; 
    if (playerResources.kirin >= nextLevelXP) {
        playerResources.level++;
        playerResources.kirin -= nextLevelXP; 
        alert(`*** LEVEL UP! *** Votre Agent est maintenant Niveau ${playerResources.level}!`);
        // Le level up pourrait donner un bonus de base ici si souhaité.
    }
}


function declareWinner(playerPos, opponentPos, errorState) {
    if (errorState) {
         elements.raceResult.textContent = `ERREUR DE PISTE. RÉESSAYER.`;
         elements.raceResult.classList.add('lose');
         elements.resetBtn.style.display = 'block';
         return;
    }
    
    let isPlayerWinner = playerPos > opponentPos;
    let yenGain = 0;
    let kirinGain = 0;

    if (isPlayerWinner) {
        // Gain basé sur la cible
        yenGain = opponentBot.yenReward || 100; 
        kirinGain = opponentBot.kirinReward || 20; 
        
        playerResources.yen += yenGain;
        playerResources.kirin += kirinGain;

        checkLevelUp(); // Vérifie le niveau après gain XP
        updateProfileDB();
        updateHudStats();
        
        elements.raceResult.textContent = `HACK RÉUSSI! YEN: +${yenGain} | KIRIN: +${kirinGain}.`;
        elements.raceResult.classList.remove('lose');
        elements.raceResult.classList.add('win');
    } else {
        yenGain = -50; 
        playerResources.yen = Math.max(0, playerResources.yen + yenGain);
        updateProfileDB();
        updateHudStats();
        
        elements.raceResult.textContent = `DETECTION! PROTOCOLES DÉFAILLANTS (Perte: ${Math.abs(yenGain)} ¥).`;
        elements.raceResult.classList.remove('win');
        elements.raceResult.classList.add('lose');
    }
    
    elements.resetBtn.style.display = 'block';
}

// ------------------------------------
// LOGIQUE CHAT EN TEMPS RÉEL (inchangée)
// ------------------------------------
// (Fonctions displayMessage, loadMessages, setupRealtimeChat, sendMessage)

function displayMessage(message, isNew = false) {
    const messageElement = document.createElement('p');
    messageElement.style.margin = '5px 0';
    messageElement.style.fontSize = '0.9em';
    
    if (isNew) {
        messageElement.style.color = 'var(--accent-red)';
        setTimeout(() => messageElement.style.color = 'var(--text-color-light)', 2000);
    } else {
        messageElement.style.color = 'var(--text-color-light)';
    }
    
    const time = new Date(message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const sender = message.username || 'Bot Inconnu';
    
    messageElement.innerHTML = `[<span style="color: var(--accent-cyan);">${time}</span>] <strong>${sender}</strong>: ${message.content}`;
    elements.chatMessages.appendChild(messageElement);
    
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

async function loadMessages() {
    elements.chatMessages.innerHTML = ''; 
    const { data } = await supabaseClient
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(20);

    if (data) data.forEach(displayMessage);
}

function setupRealtimeChat() {
    if (chatChannel) supabaseClient.removeChannel(chatChannel); 
    
    loadMessages(); 

    chatChannel = supabaseClient
        .channel('public:messages')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'messages' }, 
            (payload) => {
                displayMessage(payload.new, true);
            })
        .subscribe();
}

async function sendMessage() {
    const content = elements.chatInput.value.trim();
    if (!content || !currentUser || !currentUsername) return;

    elements.chatInput.disabled = true;
    elements.sendChatBtn.disabled = true;

    await supabaseClient
        .from('messages')
        .insert({ user_id: currentUser.id, content: content, username: currentUsername });

    elements.chatInput.disabled = false;
    elements.sendChatBtn.disabled = false;
    elements.chatInput.value = '';
}

elements.sendChatBtn.addEventListener('click', sendMessage);
elements.chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});


// ------------------------------------
// INITIALISATION
// ------------------------------------

document.getElementById('signup-btn').addEventListener('click', signUp);
document.getElementById('signin-btn').addEventListener('click', signIn);
document.getElementById('reset-race-btn').addEventListener('click', initializeSelection);


checkAuthSession();
