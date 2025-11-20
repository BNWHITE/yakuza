/* ================================================= */
/* 🧠 JAVASCRIPT FINAL : YAKUZA - DIGITAL HEIST */
/* (Course Fixée, Mobile Optimal, Progression, Chat) */
/* ================================================= */

// 1. DÉCLARATION DES CLÉS (Clé Publique - ANONYMOUS)
const SUPABASE_URL = 'https://dxiefxcfnggezuiifeqf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wAZG8NaYrZux3loetrNbmg_6QOuyBz5';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        redirectTo: window.location.origin, 
    }
});

let currentUser = null; 
let currentUsername = null; 
let currentRaceInterval;
let playerCurrentStats = { vitesse: 10, codage: 10, chance: 10 }; // Initialisation basse pour progression!

const DEFAULT_STATS = { vitesse: 10, codage: 10, chance: 10 }; // Stats minimales pour la progression
const BASE_SPEED_FACTOR = 15; // Ajusté pour une course de 5-7s
const MAX_BASE_STAT = 100;

// Liste des cibles/missions (PNJs)
const students = [
    { name: "DATA VAULT-01", title: "FAIBLE SÉCURITÉ", stats: { vitesse: 20, codage: 30, chance: 40 } }, 
    { name: "GHOST NETWORK", title: "SÉCURITÉ STANDARD", stats: { vitesse: 45, codage: 50, chance: 50 } }, 
    { name: "CRYPTO NODE", title: "SÉCURITÉ ÉLEVÉE", stats: { vitesse: 60, codage: 70, chance: 60 } }, 
    { name: "THE YAKUZA CORE", title: "SÉCURITÉ MAXIMUM", stats: { vitesse: 80, codage: 90, chance: 75 } },
    { name: "ADMIN TERMINAL", title: "ADMINISTRATEUR CLAN", stats: { vitesse: MAX_BASE_STAT, codage: MAX_BASE_STAT, chance: MAX_BASE_STAT } }
];

// Upgrades disponibles dans le shop
const UPGRADES = [
    { name: "CPU Overclock", stat: "vitesse", cost: 100, increase: 5 },
    { name: "Quantum Compiler", stat: "codage", cost: 150, increase: 5 },
    { name: "Luck Module", stat: "chance", cost: 120, increase: 5 }
];


const elements = {
    // Éléments du HUD
    sideHud: document.getElementById('side-hud'),
    kirinDisplay: document.getElementById('kirin-display'),
    playerStatsDisplay: document.getElementById('player-stats-display'),
    
    // Écrans
    authScreen: document.getElementById('auth-screen'),
    selectionScreen: document.getElementById('selection-screen'),
    shopScreen: document.getElementById('shop-screen'),
    raceScreen: document.getElementById('race-screen'),
    
    // Auth & Chat
    authEmail: document.getElementById('auth-email'),
    authPassword: document.getElementById('auth-password'),
    authMessage: document.getElementById('auth-message'),
    logoutBtn: document.getElementById('logout-btn'),
    chatSection: document.getElementById('chat-section'),
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    sendChatBtn: document.getElementById('send-chat-btn'),

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
    luckCharm: document.getElementById('luck-charm-option')
};

let opponentBot = null;
let kebabScore = 0; 
let kirinPoints = 0;
let chatChannel = null; 

const errorColor = getComputedStyle(document.documentElement).getPropertyValue('--error-color').trim();
const accentLime = getComputedStyle(document.documentElement).getPropertyValue('--accent-lime').trim();

// ------------------------------------
// LOGIQUE SUPABASE & AFFICHAGE
// ------------------------------------

async function loadProfileData(userId) {
    const { data } = await supabaseClient
        .from('profiles')
        .select('kebab_score, username, kirin_points, current_stats')
        .eq('id', userId)
        .single();
    return data;
}

// Nouvelle fonction pour mettre à jour les stats et le score en DB
async function updateProfileDB() {
    if (!currentUser) return;
    
    await supabaseClient
        .from('profiles')
        .update({ 
            kebab_score: kebabScore, 
            kirin_points: kirinPoints,
            current_stats: playerCurrentStats 
        })
        .eq('id', currentUser.id);
}

// Fonction pour mettre à jour l'affichage des stats dans le HUD latéral
function updateHudStats() {
    elements.kebabDisplay.textContent = kebabScore;
    elements.kirinDisplay.textContent = kirinPoints;

    const statsHTML = `
        <div class="stats-card-small">
            <div class="stat-line"><span>Vitesse:</span> <span style="color:var(--stat-vitesse);">${playerCurrentStats.vitesse}</span></div>
            <div class="stat-line"><span>Codage:</span> <span style="color:var(--stat-codage);">${playerCurrentStats.codage}</span></div>
            <div class="stat-line"><span>Chance:</span> <span style="color:var(--stat-chance);">${playerCurrentStats.chance}</span></div>
        </div>
    `;
    elements.playerStatsDisplay.innerHTML = statsHTML;
}

async function checkAuthSession() {
    elements.authMessage.textContent = 'Vérification de session...';
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        const profileData = await loadProfileData(currentUser.id);
        
        if (profileData) {
            kebabScore = profileData.kebab_score;
            kirinPoints = profileData.kirin_points || 0;
            currentUsername = profileData.username;
            playerCurrentStats = profileData.current_stats || DEFAULT_STATS;
        }
        
        // Affichage des écrans
        elements.authScreen.style.display = 'none';
        elements.sideHud.style.display = 'block';
        elements.logoutBtn.style.display = 'inline-block';
        
        elements.userWelcome.textContent = `AGENT: ${currentUsername.toUpperCase()}`;
        
        updateHudStats();
        showScreen('selection');
        setupRealtimeChat(); 
        elements.authMessage.textContent = '';
    } else {
        // Déconnexion
        if(chatChannel) supabaseClient.removeChannel(chatChannel);
        currentUser = null;
        playerCurrentStats = DEFAULT_STATS;
        elements.authScreen.style.display = 'block';
        elements.sideHud.style.display = 'none';
        elements.logoutBtn.style.display = 'none';
        showScreen('auth');
        elements.authMessage.textContent = '';
    }
}

// Fonctions d'authentification (signUp, signIn, signOut) restent les mêmes
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
        elements.authMessage.style.color = accentLime;
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
        elements.authMessage.style.color = accentLime;
    }
}

async function signOut() {
    elements.authMessage.textContent = 'DÉCONNEXION EN COURS...';
    await supabaseClient.auth.signOut();
}

elements.logoutBtn.addEventListener('click', signOut);


// ------------------------------------
// LOGIQUE DE NAVIGATION & SHOP
// ------------------------------------

// Afficher un seul écran à la fois
function showScreen(screenId) {
    const screens = ['auth', 'selection', 'race', 'history', 'shop', 'chat'];
    screens.forEach(id => {
        const screenElement = document.getElementById(`${id}-screen`);
        if (screenElement) screenElement.style.display = 'none';
    });
    
    const targetElement = document.getElementById(`${screenId}-screen`);
    if (targetElement) targetElement.style.display = 'block';

    if (screenId === 'shop') renderShop();
}

function renderShop() {
    let shopHTML = '';
    UPGRADES.forEach(upgrade => {
        const isDisabled = playerCurrentStats[upgrade.stat] >= MAX_BASE_STAT || kebabScore < upgrade.cost;
        const buttonText = isDisabled ? (playerCurrentStats[upgrade.stat] >= MAX_BASE_STAT ? 'MAX' : `YEN INSUFFISANT`) : `BUY (${upgrade.cost} YEN)`;
        
        shopHTML += `
            <div class="shop-item">
                <h4 class="upgrade-name">${upgrade.name}</h4>
                <p>Augmente **${upgrade.stat.toUpperCase()}** de +${upgrade.increase}.</p>
                <p>Niveau Actuel: <span style="color: var(--accent-red);">${playerCurrentStats[upgrade.stat]}</span></p>
                <button 
                    class="action-button log-btn buy-btn" 
                    data-stat="${upgrade.stat}" 
                    data-cost="${upgrade.cost}"
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
    const stat = button.getAttribute('data-stat');
    const cost = parseInt(button.getAttribute('data-cost'));
    const increase = parseInt(button.getAttribute('data-increase'));

    if (kebabScore >= cost && playerCurrentStats[stat] < MAX_BASE_STAT) {
        kebabScore -= cost;
        playerCurrentStats[stat] += increase;
        
        // Limiter les stats à MAX_BASE_STAT
        if (playerCurrentStats[stat] > MAX_BASE_STAT) {
            playerCurrentStats[stat] = MAX_BASE_STAT;
        }

        updateProfileDB();
        updateHudStats();
        renderShop(); // Rafraîchir le shop
        
        alert(`Upgrade ${stat.toUpperCase()} réussi! Nouveau niveau: ${playerCurrentStats[stat]}`);
    }
}


// ------------------------------------
// LOGIQUE DE JEU & HACK (COURSE FIXÉE)
// ------------------------------------

function generateStats(bot) {
    // Les stats des cibles sont fixes, stockées dans l'objet students
    if (!bot.currentStats) {
        bot.currentStats = { ...bot.stats };
    }
}

function renderStats(card, bot) {
    const stats = bot.currentStats || bot.stats;
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
        generateStats(bot);
        
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
        
        // Affichage des stats de la CIBLE (pour comparaison)
        renderStats(card, bot); 
        
        card.addEventListener('click', () => selectBot(bot, card, avatarUrl));
        elements.selector.appendChild(card);
    });

    elements.startBtn.style.display = 'none';
    showScreen('selection');
}

function selectBot(bot, card, avatarUrl) {
    Array.from(elements.selector.children).forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    opponentBot = bot;
    
    // Le bot joueur est l'avatar générique pour la piste
    elements.playerCat.src = `https://api.dicebear.com/8.x/bottts/svg?seed=${currentUsername}&scale=110&size=100&color=00ffee,1a1a1a`; 
    elements.opponentCat.src = avatarUrl;

    elements.startBtn.style.display = 'block';
}

elements.startBtn.addEventListener('click', () => {
    if (!opponentBot) return;

    elements.playerName.textContent = currentUsername.toUpperCase();
    elements.opponentName.textContent = opponentBot.name;
    
    showScreen('race');
    startCountdown();
});

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
            elements.countdown.textContent = "HACK!";
        } else {
            clearInterval(countdownInterval);
            elements.countdown.style.display = 'none';
            startHack(); // Renommé pour le contexte
        }
    }, 1000);
}

function startHack() {
    const raceTrack = document.querySelector('.race-track');
    const playerCat = elements.playerCat;
    
    // Déterminer la distance maximale de déplacement
    const trackWidth = raceTrack.offsetWidth - playerCat.offsetWidth - 30;
    
    if (trackWidth <= 0) {
        declareWinner(1, 0, true); 
        return;
    }

    let playerPosition = 0;
    let opponentPosition = 0;
    
    // Calcul de la VITESSE : PlayerCurrentStats (améliorables) vs Stats Opponent (fixes)
    let playerBaseSpeed = (playerCurrentStats.vitesse * (playerCurrentStats.codage / MAX_BASE_STAT)) * BASE_SPEED_FACTOR;
    let opponentBaseSpeed = (opponentBot.stats.vitesse * (opponentBot.stats.codage / MAX_BASE_STAT)) * BASE_SPEED_FACTOR;
    
    if (elements.speedBoost.checked) playerBaseSpeed *= 1.1; 
    
    playerCat.classList.add('running');
    elements.opponentCat.classList.add('running');

    currentRaceInterval = setInterval(() => {
        // La variance est maintenant basée sur la Chance du joueur/cible
        const playerVarianceRange = elements.luckCharm.checked ? (MAX_BASE_STAT - playerCurrentStats.chance) / 10 : (MAX_BASE_STAT - playerCurrentStats.chance) / 50;
        const opponentVarianceRange = (MAX_BASE_STAT - opponentBot.stats.chance) / 50;
        
        // Pas de déplacement
        const playerStep = (playerBaseSpeed / 100) + (Math.random() * playerVarianceRange / 10);
        const opponentStep = (opponentBaseSpeed / 100) + (Math.random() * opponentVarianceRange / 10);
        
        playerPosition += playerStep; 
        opponentPosition += opponentStep; 

        // Mise à jour de la position visuelle (FIX CRITIQUE)
        playerCat.style.transform = `translateX(${Math.min(playerPosition, trackWidth)}px)`;
        elements.opponentCat.style.transform = `translateX(${Math.min(opponentPosition, trackWidth)}px)`;

        if (playerPosition >= trackWidth || opponentPosition >= trackWidth) {
            clearInterval(currentRaceInterval);
            playerCat.classList.remove('running');
            elements.opponentCat.classList.remove('running');
            declareWinner(playerPosition, opponentPosition, false);
        }
    }, 70); 
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
        yenGain = 50 + Math.floor(Math.random() * 100); 
        kirinGain = 5 + Math.floor(Math.random() * 5); 
        
        kebabScore += yenGain;
        kirinPoints += kirinGain;
        updateProfileDB();
        updateHudStats();
        
        elements.raceResult.textContent = `ACCESS GRANTED! GAIN: ${yenGain} YEN, ${kirinGain} KIRIN.`;
        elements.raceResult.classList.remove('lose');
        elements.raceResult.classList.add('win');
    } else {
        yenGain = -20; // Perte en cas d'échec
        kebabScore = Math.max(0, kebabScore + yenGain);
        updateProfileDB();
        updateHudStats();
        
        elements.raceResult.textContent = `DETECTION IMMINENTE! RÉTROGRADATION (${yenGain} YEN).`;
        elements.raceResult.classList.remove('win');
        elements.raceResult.classList.add('lose');
        
        // playDefeatSound(); // Garder si le fichier audio est présent
    }
    
    elements.resetBtn.style.display = 'block';
}

elements.resetBtn.addEventListener('click', initializeSelection);


// ------------------------------------
// INITIALISATION
// ------------------------------------
// Association des boutons Auth
document.getElementById('signup-btn').addEventListener('click', signUp);
document.getElementById('signin-btn').addEventListener('click', signIn);

// Lancement au chargement
checkAuthSession();
