/* ================================================= */
/* 🧠 JAVASCRIPT FINAL : YAKUZA - SHADOW CLAN (V3) */
/* (Personnages Jouables, Progression, Hack Fix) */
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

const BASE_STATS = { vitesse: 10, codage: 10, chance: 10 }; 
const BASE_SPEED_FACTOR = 15; 
const MAX_EQUIPMENT_LEVEL = 10;
const LEVEL_BONUS = 8; 
const XP_TO_LEVEL = 100;

// Variables d'état du joueur
let playerResources = { yen: 0, kirin: 0, level: 1 };
let playerInventory = { cpu_level: 1, memory_level: 1, luck_level: 1 };
let playerCalculatedStats = { ...BASE_STATS };
let playerAgent = null; // L'objet de l'agent choisi

// 2. POOL DE PERSONNAGES JOUABLES ET RIVAUX (AGENT_AVATARS)
// Stats basées sur les titres : Vitesse(v), Codage(c), Chance(l)
const AGENT_AVATARS = [
    { id: 1, name: "Alexandre ALVES", title: "Le Débogueur", base_stats: { v: 45, c: 55, l: 30 } }, 
    { id: 2, name: "Douae BOULOUALI", title: "L'impératrice", base_stats: { v: 50, c: 45, l: 40 } }, 
    { id: 3, name: "Sid-Ahmed BOUSLAH", title: "Chill Boy", base_stats: { v: 40, c: 40, l: 50 } }, 
    { id: 4, name: "Leon JIANG", title: "FinoVox", base_stats: { v: 55, c: 35, l: 35 } }, 
    { id: 5, name: "Alheli RODRIGUEZ", title: "L'intentionnée", base_stats: { v: 45, c: 45, l: 45 } },
    { id: 6, name: "Maxime BOGNON", title: "Maximilien", base_stats: { v: 50, c: 40, l: 35 } }, 
    { id: 7, name: "Corentin BRAND", title: "Le favoris", base_stats: { v: 48, c: 48, l: 48 } }, 
    { id: 8, name: "Maximilien CANONNE", title: "Luminosité Minimum", base_stats: { v: 40, c: 40, l: 55 } }, 
    { id: 9, name: "Adel HENI", title: "Le plavonneur", base_stats: { v: 55, c: 30, l: 40 } }, 
    { id: 10, name: "Kahina MEDJUKANE", title: "THE QUEEN ♕", base_stats: { v: 50, c: 50, l: 50 } },
    { id: 11, name: "Sully MORETON", title: "Le stagiaire", base_stats: { v: 35, c: 50, l: 35 } }, 
    { id: 12, name: "Aliénor ANTONA", title: "La gourmande🍔", base_stats: { v: 40, c: 35, l: 50 } }, 
    { id: 13, name: "Nicolas CLEMENT", title: "Le délégué", base_stats: { v: 45, c: 40, l: 45 } }, 
    { id: 14, name: "Bryan DE FARIA", title: "Le Chargeur", base_stats: { v: 55, c: 35, l: 30 } }, 
    { id: 15, name: "Hani HOUMIMID", title: "Chargerrr", base_stats: { v: 55, c: 35, l: 30 } },
    { id: 16, name: "Vithues KANDIAH", title: "ECE Water", base_stats: { v: 40, c: 50, l: 35 } }, 
    { id: 17, name: "Hector LE BACHELIER", title: "L'Ingénieur Papier", base_stats: { v: 35, c: 55, l: 40 } }, 
    { id: 18, name: "Quentin DABOVILLE", title: "Le Bretons", base_stats: { v: 40, c: 45, l: 45 } }, 
    { id: 19, name: "Yassmina HARRISSI", title: "La Libanaise🇱🇧", base_stats: { v: 45, c: 40, l: 40 } }, 
    { id: 20, name: "Allan LAHCENE", title: " Le + Chill", base_stats: { v: 40, c: 40, l: 40 } },
    { id: 21, name: "Evan MASSE", title: "Hasfy", base_stats: { v: 50, c: 40, l: 35 } }, 
    { id: 22, name: "Seydina SY", title: "Git init", base_stats: { v: 45, c: 50, l: 35 } }, 
    { id: 23, name: "Ilay AL ABIAD", title: "Brother from an other mother", base_stats: { v: 50, c: 40, l: 40 } }, 
    { id: 24, name: "Ahmed ELHATTAB", title: "English Boy", base_stats: { v: 40, c: 45, l: 40 } }, 
    { id: 25, name: "Thushyan KOHILAKUMAR", title: "L'Orfèvre", base_stats: { v: 40, c: 55, l: 30 } },
    { id: 26, name: "Aurélie MAHAUT", title: "La Stratège", base_stats: { v: 45, c: 50, l: 45 } }, 
    { id: 27, name: "Gaspard PONS", title: "Le Philosophe", base_stats: { v: 35, c: 45, l: 55 } }, 
    { id: 28, name: "Rafael RION", title: "L'Alchimiste", base_stats: { v: 40, c: 45, l: 50 } }, 
    { id: 29, name: "Faruk SAN", title: "Le connaisseur", base_stats: { v: 40, c: 40, l: 40 } },
    { id: 30, name: "Mme CHABCHOUB", title: "La Guide du Code Sacré", base_stats: { v: 100, c: 100, l: 100 } }
];

// 3. CIBLES DE MISSION (Difficulté et Récompenses Fixes)
const MISSION_TARGETS = [
    { id: 101, name: "Proxy Hacking", title: "FAIBLE SÉCURITÉ", stats: { vitesse: 20, codage: 30, chance: 40 }, yenReward: 80, kirinReward: 15 }, 
    { id: 102, name: "Encrypted Node", title: "SÉCURITÉ STANDARD", stats: { vitesse: 45, codage: 50, chance: 50 }, yenReward: 150, kirinReward: 30 }, 
    { id: 103, name: "Central Bank Server", title: "SÉCURITÉ ÉLEVÉE", stats: { vitesse: 60, codage: 70, chance: 60 }, yenReward: 300, kirinReward: 50 }, 
    { id: 104, name: "THE YAKUZA CORE", title: "SÉCURITÉ MAXIMUM", stats: { vitesse: 80, codage: 90, chance: 75 }, yenReward: 600, kirinReward: 80 },
    { id: 105, name: "MME CHABCHOUB'S BACKUP", title: "FINAL JUDGEMENT", stats: { vitesse: 100, codage: 100, chance: 100 }, yenReward: 2000, kirinReward: 200 }
];

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
    agentNameDisplay: document.getElementById('agent-name-display'),
    
    // Écrans
    authScreen: document.getElementById('auth-screen'),
    agentSelectionScreen: document.getElementById('agent-selection-screen'), // NOUVEAU
    agentSelectorGrid: document.getElementById('agent-selector-grid'), // NOUVEAU
    selectionScreen: document.getElementById('selection-screen'),
    shopScreen: document.getElementById('shop-screen'),
    raceScreen: document.getElementById('race-screen'),
    
    // Auth & Chat
    authMessage: document.getElementById('auth-message'),
    logoutBtn: document.getElementById('logout-btn'),
    authEmail: document.getElementById('auth-email'),
    authPassword: document.getElementById('auth-password'),
    
    // Jeu
    kebabDisplay: document.getElementById('kebab-score-display'),
    userWelcome: document.getElementById('user-welcome'),
    selector: document.getElementById('mission-selector'), // Renommé pour clarté
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
    raceTrack: document.querySelector('.race-track'),
    confirmAgentBtn: document.getElementById('confirm-agent-btn'), // NOUVEAU

    // Chat
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    sendChatBtn: document.getElementById('send-chat-btn')
};

const errorColor = getComputedStyle(document.documentElement).getPropertyValue('--error-color').trim();
const accentRed = getComputedStyle(document.documentElement).getPropertyValue('--accent-red').trim();


// ------------------------------------
// LOGIQUE DE PROFIL & STATS
// ------------------------------------

function calculatePlayerStats() {
    // Stats de base sont maintenant tirées de l'Agent initial
    const baseV = playerAgent ? playerAgent.base_stats.v : BASE_STATS.vitesse;
    const baseC = playerAgent ? playerAgent.base_stats.c : BASE_STATS.codage;
    const baseL = playerAgent ? playerAgent.base_stats.l : BASE_STATS.chance;

    // L'amélioration est ADDITIVE
    const vitesse = baseV + (playerInventory.cpu_level * LEVEL_BONUS);
    const codage = baseC + (playerInventory.memory_level * LEVEL_BONUS);
    const chance = baseL + (playerInventory.luck_level * LEVEL_BONUS);

    playerCalculatedStats = {
        vitesse: Math.min(vitesse, 100),
        codage: Math.min(codage, 100),
        chance: Math.min(chance, 100)
    };
}

function updateHudStats() {
    calculatePlayerStats();
    
    elements.kebabDisplay.textContent = playerResources.yen;
    elements.kirinDisplay.textContent = playerResources.kirin;
    elements.agentLevel.textContent = playerResources.level;
    
    // NOUVEAU : Affichage de l'Agent joué
    if (playerAgent) {
        elements.agentNameDisplay.textContent = playerAgent.name.toUpperCase();
        elements.userWelcome.textContent = playerAgent.title.toUpperCase();
    }
    
    // Affichage des niveaux d'équipement
    let equipmentHTML = `
        <div class="stat-line"><span>CPU:</span> <span style="color:var(--stat-vitesse);">LVL ${playerInventory.cpu_level}</span></div>
        <div class="stat-line"><span>RAM:</span> <span style="color:var(--stat-codage);">LVL ${playerInventory.memory_level}</span></div>
        <div class="stat-line"><span>LUCK:</span> <span style="color:var(--stat-chance);">LVL ${playerInventory.luck_level}</span></div>
    `;
    elements.equipmentDisplay.innerHTML = equipmentHTML;

    // Affichage des stats calculées
    const statsHTML = `
        <div class="stats-card">
            <div class="stat-line"><span>Vitesse:</span> <span style="color:var(--stat-vitesse);">${playerCalculatedStats.vitesse}</span></div>
            <div class="stat-line"><span>Codage:</span> <span style="color:var(--stat-codage);">${playerCalculatedStats.codage}</span></div>
            <div class="stat-line"><span>Chance:</span> <span style="color:var(--stat-chance);">${playerCalculatedStats.chance}</span></div>
        </div>
    `;
    elements.playerStatsDisplay.innerHTML = statsHTML;
}

async function updateProfileDB() {
    if (!currentUser) return;
    
    await supabaseClient
        .from('profiles')
        .update({ 
            kebab_score: playerResources.yen, 
            kirin_points: playerResources.kirin,
            level: playerResources.level,
            inventory: playerInventory,
            agent_id: playerAgent ? playerAgent.id : null // Sauvegarde l'ID de l'Agent
        })
        .eq('id', currentUser.id);
}

// ------------------------------------
// LOGIQUE DE THEME & D'AUTHENTIFICATION
// ------------------------------------

function switchTheme(isLoggedIn) {
    const body = document.body;
    if (isLoggedIn) {
        body.classList.remove('auth-mode');
        body.classList.add('game-mode');
    } else {
        body.classList.remove('game-mode');
        body.classList.add('auth-mode');
    }
}

async function loadProfileData(userId) {
    const { data } = await supabaseClient
        .from('profiles')
        .select('kebab_score, username, kirin_points, level, inventory, agent_id')
        .eq('id', userId)
        .single();
    return data;
}

async function checkAuthSession() {
    elements.authMessage.textContent = 'Vérification de session...';
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        const profileData = await loadProfileData(currentUser.id);
        
        if (profileData) {
            playerResources.yen = profileData.kebab_score;
            playerResources.kirin = profileData.kirin_points || 0;
            playerResources.level = profileData.level || 1;
            currentUsername = profileData.username;
            playerInventory = profileData.inventory || { cpu_level: 1, memory_level: 1, luck_level: 1 };
            
            // CHARGEMENT CRITIQUE DE L'AGENT JOUE
            const agentId = profileData.agent_id;
            playerAgent = AGENT_AVATARS.find(a => a.id === agentId);

        } else {
            // Profil non trouvé mais connecté, initialisation par défaut
            playerAgent = null; 
        }
        
        switchTheme(true); 
        elements.authScreen.style.display = 'none';
        elements.sideHud.style.display = 'block';
        elements.logoutBtn.style.display = 'inline-block';
        
        updateHudStats(); // Mise à jour du HUD

        if (!playerAgent) {
            // NOUVEAU JOUEUR : Doit choisir son agent
            showAgentSelection();
        } else {
            // ANCIEN JOUEUR : Continue les missions
            showScreen('selection');
            setupRealtimeChat(); 
        }
        elements.authMessage.textContent = '';
    } else {
        switchTheme(false); 
        if(chatChannel) supabaseClient.removeChannel(chatChannel);
        currentUser = null;
        elements.authScreen.style.display = 'block';
        elements.sideHud.style.display = 'none';
        elements.logoutBtn.style.display = 'none';
        showScreen('auth');
        elements.authMessage.textContent = '';
    }
}

// Les fonctions signUp, signIn, signOut restent les mêmes

async function signUp() {
    const email = elements.authEmail.value;
    const password = elements.authPassword.value;
    elements.authMessage.textContent = 'INITIATION AGENT...';

    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
        elements.authMessage.textContent = `ERREUR: ${error.message}`;
        elements.authMessage.style.color = errorColor;
    } else {
        elements.authMessage.textContent = `CONFIRMATION REQUISE. VÉRIFIEZ VOTRE EMAIL.`;
        elements.authMessage.style.color = accentRed;
    }
}

async function signIn() {
    const email = elements.authEmail.value;
    const password = elements.authPassword.value;
    elements.authMessage.textContent = 'CONNEXION TERMINAL...';

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        elements.authMessage.textContent = `ACCÈS REFUSÉ: ${error.message}`;
        elements.authMessage.style.color = errorColor;
    } else {
        elements.authMessage.textContent = 'ACCÈS AUTORISÉ. BIENVENUE.';
        elements.authMessage.style.color = accentRed;
    }
}

async function signOut() {
    elements.authMessage.textContent = 'DÉCONNEXION EN COURS...';
    await supabaseClient.auth.signOut();
}

document.getElementById('signup-btn').addEventListener('click', signUp);
document.getElementById('signin-btn').addEventListener('click', signIn);
elements.logoutBtn.addEventListener('click', signOut);


// ------------------------------------
// NOUVEL ÉCRAN : SÉLECTION DE L'AGENT JOUEUR
// ------------------------------------

let tempSelectedAgent = null;

function showAgentSelection() {
    showScreen('agent-selection');
    elements.agentSelectorGrid.innerHTML = '';

    AGENT_AVATARS.forEach(agent => {
        const card = document.createElement('div');
        card.classList.add('student-card');
        
        let avatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=${encodeURIComponent(agent.name)}&scale=110&size=100&eyes=sides,round&mouth=smile,pucker&sides=square,round&top=antenna,cone&face=square,round&color=ff4655,00ffff,1a1a1a`;
        
        const avatar = document.createElement('img');
        avatar.classList.add('student-avatar');
        avatar.src = avatarUrl;
        
        const nameElement = document.createElement('h4');
        nameElement.textContent = agent.name;
        
        const titleElement = document.createElement('p');
        titleElement.classList.add('dark-subtitle');
        titleElement.textContent = agent.title;
        
        card.appendChild(avatar);
        card.appendChild(nameElement);
        card.appendChild(titleElement);
        
        // Affiche les stats de base de l'agent
        const baseStatsDisplay = { stats: { vitesse: agent.base_stats.v, codage: agent.base_stats.c, chance: agent.base_stats.l } };
        renderStats(card, baseStatsDisplay); 
        
        card.addEventListener('click', () => {
            Array.from(elements.agentSelectorGrid.children).forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            tempSelectedAgent = agent;
            elements.confirmAgentBtn.style.display = 'block';
        });
        elements.agentSelectorGrid.appendChild(card);
    });

    elements.confirmAgentBtn.removeEventListener('click', confirmAgentSelection);
    elements.confirmAgentBtn.addEventListener('click', confirmAgentSelection);
}

async function confirmAgentSelection() {
    if (!tempSelectedAgent) {
        alert("Veuillez sélectionner votre Agent.");
        return;
    }

    playerAgent = tempSelectedAgent;
    
    // Sauvegarde l'ID de l'agent et ses stats de base initiales
    await updateProfileDB();
    
    // Continue le jeu
    updateHudStats();
    setupRealtimeChat();
    showScreen('selection');
}


// ------------------------------------
// LOGIQUE DE JEU & HACK
// ------------------------------------

function renderStats(card, bot) {
    const stats = bot.stats || bot.base_stats;
    // Remplace les clés courtes (v, c, l) par les noms complets si nécessaire
    const vitesse = stats.vitesse || stats.v;
    const codage = stats.codage || stats.c;
    const chance = stats.chance || stats.l;

    const statsHTML = `
        <div class="stats-card">
            <div class="stat-bar-container"><label>Vitesse:</label><div class="stat-bar"><div class="stat-fill" data-stat="vitesse" style="width: ${vitesse}%;"></div></div></div>
            <div class="stat-bar-container"><label>Codage:</label><div class="stat-bar"><div class="stat-fill" data-stat="codage" style="width: ${codage}%;"></div></div></div>
            <div class="stat-bar-container"><label>Chance:</label><div class="stat-bar"><div class="stat-fill" data-stat="chance" style="width: ${chance}%;"></div></div></div>
        </div>
    `;
    card.insertAdjacentHTML('beforeend', statsHTML);
}

function getRandomRival(playerAgentId) {
    const rivals = AGENT_AVATARS.filter(a => a.id !== playerAgentId);
    const randomIndex = Math.floor(Math.random() * rivals.length);
    return rivals[randomIndex];
}

function initializeSelection() {
    if (!currentUser || !playerAgent) return;

    elements.selector.innerHTML = '';
    MISSION_TARGETS.forEach(mission => {
        
        const card = document.createElement('div');
        card.classList.add('student-card');
        
        let avatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=${encodeURIComponent(mission.name)}&scale=110&size=100&eyes=sides,round&mouth=smile,pucker&sides=square,round&top=antenna,cone&face=square,round&color=ff4655,00ffff,1a1a1a`;
        
        const avatar = document.createElement('img');
        avatar.classList.add('student-avatar');
        avatar.src = avatarUrl;
        
        const nameElement = document.createElement('h4');
        nameElement.textContent = mission.name.toUpperCase();
        
        const titleElement = document.createElement('p');
        titleElement.classList.add('dark-subtitle');
        titleElement.textContent = mission.title;
        
        card.appendChild(avatar);
        card.appendChild(nameElement);
        card.appendChild(titleElement);
        
        renderStats(card, mission); 
        
        card.addEventListener('click', () => selectMission(mission, card, avatarUrl));
        elements.selector.appendChild(card);
    });

    elements.startBtn.style.display = 'none';
}

function selectMission(mission, card, missionAvatarUrl) {
    Array.from(elements.selector.children).forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    
    // 1. Définir la cible/mission
    opponentBot = mission;
    
    // 2. Choisir un Agent Rival aléatoire
    const rivalAgent = getRandomRival(playerAgent.id);
    
    // 3. Charger les avatars et noms pour la course
    const playerAvatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=${playerAgent.name}&scale=110&size=100&color=00ffff,1a1a1a`; 
    
    elements.playerCat.src = playerAvatarUrl;
    elements.opponentCat.src = missionAvatarUrl; 
    
    elements.playerName.textContent = playerAgent.name.toUpperCase();
    elements.opponentName.textContent = `VS ${rivalAgent.name.toUpperCase()}`; // Le nom de l'Agent Rival s'affiche

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
    
    const playerStats = playerCalculatedStats;
    const opponentStats = opponentBot.stats;
    
    let playerBaseSpeed = (playerStats.vitesse * (playerStats.codage / 100)) * BASE_SPEED_FACTOR;
    let opponentBaseSpeed = (opponentStats.vitesse * (opponentStats.codage / 100)) * BASE_SPEED_FACTOR;
    
    if (elements.speedBoost.checked) playerBaseSpeed *= 1.1; 
    
    playerCat.classList.add('running');
    elements.opponentCat.classList.add('running');
    elements.raceTrack.classList.add('hacking'); 


    currentRaceInterval = setInterval(() => {
        const playerVarianceRange = elements.luckCharm.checked ? (100 - playerStats.chance) / 10 : (100 - playerStats.chance) / 50;
        const opponentVarianceRange = (100 - opponentStats.chance) / 50;
        
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
            elements.raceTrack.classList.remove('hacking'); 
            declareWinner(playerPosition, opponentPosition, false);
        }
    }, 70); 
}

function checkLevelUp() {
    const nextLevelXP = playerResources.level * XP_TO_LEVEL; 
    if (playerResources.kirin >= nextLevelXP) {
        playerResources.level++;
        playerResources.kirin -= nextLevelXP; 
        alert(`*** LEVEL UP! *** Votre Agent est maintenant Niveau ${playerResources.level}!`);
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
        yenGain = opponentBot.yenReward || 100; 
        kirinGain = opponentBot.kirinReward || 20; 
        
        playerResources.yen += yenGain;
        playerResources.kirin += kirinGain;

        checkLevelUp();
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

let chatChannel = null;

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

document.getElementById('start-race-btn').addEventListener('click', () => {
    if (!opponentBot) return;
    showScreen('race');
    startCountdown();
});

elements.confirmAgentBtn.addEventListener('click', confirmAgentSelection);
document.getElementById('reset-race-btn').addEventListener('click', initializeSelection);

checkAuthSession();
