/* ================================================= */
/* 🧠 JAVASCRIPT DETAILLÉ : Logique du Jeu et Supabase */
/* (Style "FatNinja", Course Rapide, Stats Équitables) */
/* ================================================= */

// 1. DÉCLARATION DES CLÉS (Clé Publique - ANONYMOUS)
// Cette clé est sûre pour le front-end. NE JAMAIS UTILISER LA CLÉ SECRÈTE DE SERVICE.
const SUPABASE_URL = 'https://dxiefxcfnggezuiifeqf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wAZG8NaYrZux3loetrNbmg_6QOuyBz5';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        // ESSENTIEL : Redirige l'utilisateur vers la page actuelle après confirmation d'email
        redirectTo: window.location.origin, 
    }
});
let currentUser = null; 

// NOUVEAU : Stats de départ équitables pour la progression
const DEFAULT_STATS = {
    vitesse: 60,
    codage: 60,
    chance: 60
};

// Liste des bots PNJs (non-joueurs) pour la sélection et l'opposition
const students = [
    { name: "Alexandre ALVES", title: "Le Débogueur", stats: {} }, { name: "Douae BOULOUALI", title: "L'impératrice", stats: {} }, { name: "Sid-Ahmed BOUSLAH", title: "Chill Boy", stats: {} }, { name: "Leon JIANG", title: "FinoVox", stats: {} }, { name: "Alheli RODRIGUEZ", title: "L'intentionnée", stats: {} },
    { name: "Maxime BOGNON", title: "Maximilien", stats: {} }, { name: "Corentin BRAND", title: "Le favoris", stats: {} }, { name: "Maximilien CANONNE", title: "Luminosité Minimum", stats: {} }, { name: "Adel HENI", title: "Le plavonneur", stats: {} }, { name: "Kahina MEDJUKANE", title: "THE QUEEN ♕", stats: {} },
    { name: "Sully MORETON", title: "Le stagiaire", stats: {} }, { name: "Aliénor ANTONA", title: "La gourmande🍔", stats: {} }, { name: "Nicolas CLEMENT", title: "Le délégué", stats: {} }, { name: "Bryan DE FARIA", title: "Le Chargeur", stats: {} }, { name: "Hani HOUMIMID", title: "Le turc 🇹🇷", stats: {} },
    { name: "Vithues KANDIAH", title: "ECE Water", stats: {} }, { name: "Hector LE BACHELIER", title: "L'Ingénieur Papier", stats: {} }, { name: "Quentin DABOVILLE", title: "Le Bretons", stats: {} }, { name: "Yassmina HARRISSI", title: "La Libanaise🇱🇧", stats: {} }, { name: "Allan LAHCENE", title: " Le + Chill", stats: {} },
    { name: "Evan MASSE", title: "Hasfy", stats: {} }, { name: "Seydina SY", title: "Git init", stats: {} }, { name: "Ilay AL ABIAD", title: "Brother from an other mother", stats: {} }, { name: "Ahmed ELHATTAB", title: "English Boy", stats: {} }, { name: "Thushyan KOHILAKUMAR", title: "L'Orfèvre", stats: {} },
    { name: "Aurélie MAHAUT", title: "La Stratège", stats: {} }, { name: "Gaspard PONS", title: "Le Philosophe", stats: {} }, { name: "Rafael RION", title: "L'Alchimiste", stats: {} }, { name: "Faruk SAN", title: "Le connaisseur", stats: {} },
    // Profil Professeur (Adversaire final)
    { name: "Mme CHABCHOUB", title: "La Guide du Code Sacré", stats: { vitesse: 100, codage: 100, chance: 100 } }
];

// Récupération des éléments du DOM
const elements = {
    authScreen: document.getElementById('auth-screen'),
    authEmail: document.getElementById('auth-email'),
    authPassword: document.getElementById('auth-password'),
    signupBtn: document.getElementById('signup-btn'),
    signinBtn: document.getElementById('signin-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    authMessage: document.getElementById('auth-message'),
    userWelcome: document.getElementById('user-welcome'),
    selector: document.getElementById('student-selector'),
    startBtn: document.getElementById('start-race-btn'),
    selectionScreen: document.getElementById('selection-screen'),
    raceScreen: document.getElementById('race-screen'),
    playerCat: document.getElementById('player-cat'),
    playerName: document.getElementById('player-name'),
    opponentCat: document.getElementById('opponent-cat'),
    opponentName: document.getElementById('opponent-name'),
    countdown: document.getElementById('countdown'),
    raceResult: document.getElementById('race-result'),
    resetBtn: document.getElementById('reset-race-btn'),
    historyLog: document.getElementById('history-log'),
    historySection: document.getElementById('history-section'),
    mqStatus: document.getElementById('mq-status'),
    speedBoost: document.getElementById('speed-boost-option'),
    luckCharm: document.getElementById('luck-charm-option'),
    kebabDisplay: document.getElementById('kebab-score-display'),
    defeatAudio: document.getElementById('defeat-audio')
};

let selectedBot = null;
let opponentBot = null;
let raceHistory = [];
let kebabScore = 0; 

// Récupère la valeur d'une variable CSS pour la couleur d'erreur
const errorColor = getComputedStyle(document.documentElement).getPropertyValue('--error-color').trim();
const accentLime = getComputedStyle(document.documentElement).getPropertyValue('--accent-lime').trim();


// ------------------------------------
// LOGIQUE SUPABASE : AUTHENTIFICATION & PROFIL
// ------------------------------------

/** Charge le score Kebab du profil utilisateur. */
async function loadKebabScore(userId) {
    const { data } = await supabaseClient
        .from('profiles')
        .select('kebab_score')
        .eq('id', userId)
        .single();
    
    // Si le profil existe, retourne le score, sinon retourne le score de base (5 K)
    return data ? data.kebab_score : 5; 
}

/** Vérifie la session utilisateur et bascule entre les écrans Auth et Sélection. */
async function checkAuthSession() {
    elements.authMessage.textContent = 'Vérification de session...';
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        kebabScore = await loadKebabScore(currentUser.id);
        
        elements.authScreen.style.display = 'none';
        elements.logoutBtn.style.display = 'block';
        elements.historySection.style.display = 'block';
        elements.selectionScreen.style.display = 'block'; // Affiche la sélection
        elements.userWelcome.textContent = `Bienvenue, Explorateur ${currentUser.email.split('@')[0]} !`;
        initializeSelection();
        elements.authMessage.textContent = '';
    } else {
        currentUser = null;
        kebabScore = 0;
        elements.authScreen.style.display = 'block';
        elements.logoutBtn.style.display = 'none';
        elements.selectionScreen.style.display = 'none';
        elements.raceScreen.style.display = 'none';
        elements.historySection.style.display = 'none';
        elements.authMessage.textContent = '';
    }
    updateKebabScore(0);
}

/** Inscription d'un nouvel utilisateur. */
async function signUp() {
    const email = elements.authEmail.value;
    const password = elements.authPassword.value;
    elements.authMessage.textContent = 'Inscription en cours...';

    const { error } = await supabaseClient.auth.signUp({ email, password });

    if (error) {
        elements.authMessage.textContent = `Erreur d'inscription: ${error.message}`;
        elements.authMessage.style.color = errorColor;
    } else {
        elements.authMessage.textContent = `✅ Inscription réussie ! Un lien de confirmation a été envoyé à ${email}. Cliquez sur ce lien pour vous connecter automatiquement au site.`;
        elements.authMessage.style.color = accentLime;
    }
}

/** Connexion d'un utilisateur existant. */
async function signIn() {
    const email = elements.authEmail.value;
    const password = elements.authPassword.value;
    elements.authMessage.textContent = 'Connexion en cours...';

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        elements.authMessage.textContent = `Erreur de connexion: ${error.message}`;
        elements.authMessage.style.color = errorColor;
    } else {
        elements.authMessage.textContent = 'Connexion réussie !';
        elements.authMessage.style.color = accentLime;
        // La suite est gérée par onAuthStateChange
    }
}

/** Déconnexion de l'utilisateur. */
async function signOut() {
    elements.authMessage.textContent = 'Déconnexion en cours...';
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
         elements.authMessage.textContent = `Erreur de déconnexion: ${error.message}`;
         elements.authMessage.style.color = errorColor;
    }
    // La suite est gérée par onAuthStateChange
}

// Événements d'authentification
elements.signupBtn.addEventListener('click', signUp);
elements.signinBtn.addEventListener('click', signIn);
elements.logoutBtn.addEventListener('click', signOut);

// Gère les changements d'état (connexion, déconnexion, confirmation email)
supabaseClient.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        checkAuthSession();
    }
});


// ------------------------------------
// FONCTIONNALITÉS DU JEU
// ------------------------------------

/** Met à jour le score Kebab de l'utilisateur et le sauvegarde en DB. */
async function updateKebabScore(amount) {
    kebabScore += amount;
    
    if (currentUser) {
        const { error } = await supabaseClient
            .from('profiles')
            .update({ kebab_score: kebabScore })
            .eq('id', currentUser.id);

        if (error) {
            console.error("Erreur de sauvegarde du score:", error);
        }
    }
    elements.kebabDisplay.textContent = `${kebabScore} K`;
}

/** Joue le son de défaite. */
function playDefeatSound() {
    if (opponentBot.name !== "Mme CHABCHOUB") {
        elements.defeatAudio.currentTime = 0;
        elements.defeatAudio.play().catch(e => console.error("Erreur lecture audio :", e));
    }
}

/** Génère les stats des bots (avec équité au départ). */
function generateStats(bot) {
    // La prof garde ses 100/100/100
    if (bot.name === "Mme CHABCHOUB") {
        return;
    }

    // Si le bot n'a pas encore de stats, il reçoit les stats de base + une légère variation
    if (Object.keys(bot.stats).length === 0) {
        bot.stats.vitesse = DEFAULT_STATS.vitesse + Math.floor(Math.random() * 5); 
        bot.stats.codage = DEFAULT_STATS.codage + Math.floor(Math.random() * 5);
        bot.stats.chance = DEFAULT_STATS.chance + Math.floor(Math.random() * 5);
    }
    // NOTE : Si on utilisait la table 'avatars', les stats seraient chargées ici.
}

/** Affiche les barres de stats. */
function renderStats(card, bot) {
    const statsHTML = `
        <div class="stats-card">
            <div class="stat-bar-container"><label>Vitesse :</label><div class="stat-bar"><div class="stat-fill" data-stat="vitesse" style="width: ${bot.stats.vitesse}%;"></div></div></div>
            <div class="stat-bar-container"><label>Codage :</label><div class="stat-bar"><div class="stat-fill" data-stat="codage" style="width: ${bot.stats.codage}%;"></div></div></div>
            <div class="stat-bar-container"><label>Chance :</label><div class="stat-bar"><div class="stat-fill" data-stat="chance" style="width: ${bot.stats.chance}%;"></div></div></div>
        </div>
    `;
    card.insertAdjacentHTML('beforeend', statsHTML);
}

/** Met à jour l'affichage Media Query. */
function updateMQStatus() {
    const mq = window.matchMedia("(max-width: 600px)");
    if (mq.matches) {
        elements.mqStatus.innerHTML = `⚠️ **MODE MOBILE ACTIVÉ** (Media Query: 1 colonne).`;
        elements.mqStatus.style.color = 'var(--accent-orange)';
    } else if (window.innerWidth <= 992) {
         elements.mqStatus.innerHTML = `✅ **MODE TABLETTE ACTIVÉ** (Media Query: 2 colonnes).`;
         elements.mqStatus.style.color = 'var(--accent-lime)';
    }
    else {
        elements.mqStatus.innerHTML = `🖥️ **MODE PC** (Grille 4 colonnes).`;
        elements.mqStatus.style.color = 'var(--text-color-light)';
    }
}
window.addEventListener('resize', updateMQStatus);

/** Enregistre la course dans l'historique. */
function logRace(winnerName, isPlayerWinner, mqUsed, kebabGain) {
    const resultClass = isPlayerWinner ? 'win' : 'lose';
    const mqText = mqUsed ? ' (Responsive Actif)' : '';
    const gainText = isPlayerWinner ? ` (+${kebabGain} K)` : '';
    
    const logEntry = document.createElement('p');
    logEntry.classList.add('history-item', resultClass);
    if (mqUsed) logEntry.classList.add('mq-active');
    
    logEntry.innerHTML = `[${new Date().toLocaleTimeString()}] : La Quête a été gagnée par **${winnerName}**. ${gainText} ${mqText}`;
    
    if (raceHistory.length === 0) {
         elements.historyLog.innerHTML = '';
    }
    elements.historyLog.prepend(logEntry);
    raceHistory.push(logEntry);
}

/** Initialise l'écran de sélection des bots. */
function initializeSelection() {
    if (!currentUser) return; // Ne fait rien si non connecté

    elements.selector.innerHTML = '';
    students.forEach(bot => {
        generateStats(bot);
        
        const card = document.createElement('div');
        card.classList.add('student-card');
        if (bot.name === "Mme CHABCHOUB") {
            card.classList.add('chabchoub-card');
        }
        
        // Génération des avatars avec le nouveau style "FatNinja"
        let avatarUrl;
        const styleParams = 'scale=110&size=100&color=ffb300,aaff00,101216';
        if (bot.name === "Mme CHABCHOUB") {
            // Couleurs spécifiques pour la prof (Rouge/Orange)
            avatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=Chabchoub&eyes=bulgy,round&mouth=smile,pucker&sides=square,round&top=antenna,cone&face=square,round&color=ff4545,ffb300,aaff00,101216&${styleParams}`;
        } else {
            avatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=${encodeURIComponent(bot.name)}&${styleParams}`;
        }
        
        const avatar = document.createElement('img');
        avatar.classList.add('student-avatar');
        avatar.src = avatarUrl;
        
        const nameElement = document.createElement('p');
        nameElement.textContent = bot.name;
        
        const titleElement = document.createElement('span');
        titleElement.classList.add('title');
        titleElement.textContent = bot.title;
        
        card.appendChild(avatar);
        card.appendChild(nameElement);
        card.appendChild(titleElement);
        
        renderStats(card, bot);
        
        card.addEventListener('click', () => selectBot(bot, card, avatarUrl));
        elements.selector.appendChild(card);
    });

    elements.startBtn.style.display = 'none';
    elements.raceScreen.style.display = 'none';
    elements.selectionScreen.style.display = 'block';
    elements.resetBtn.style.display = 'none';
    elements.raceResult.textContent = '';
    
    elements.playerCat.style.transform = `translateX(0px)`;
    elements.opponentCat.style.transform = `translateX(0px)`;
    
    updateMQStatus();
}

/** Sélectionne le bot joueur. */
function selectBot(bot, card, avatarUrl) {
    Array.from(elements.selector.children).forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedBot = bot;
    elements.playerCat.src = avatarUrl;
    elements.startBtn.style.display = 'block';
}

/** Choisit un adversaire aléatoire. */
function generateOpponent() {
    let randomOpponent;
    do {
        const index = Math.floor(Math.random() * students.length);
        randomOpponent = students[index];
    } while (randomOpponent.name === selectedBot.name);
    return randomOpponent;
}

elements.startBtn.addEventListener('click', () => {
    if (!selectedBot) return;

    opponentBot = generateOpponent();
    generateStats(opponentBot);

    elements.playerName.textContent = selectedBot.name;
    elements.opponentName.textContent = opponentBot.name;
    
    const styleParams = 'scale=110&size=100&color=ffb300,aaff00,101216';
    let opponentAvatarUrl;
    if (opponentBot.name === "Mme CHABCHOUB") {
        opponentAvatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=Chabchoub&eyes=bulgy,round&mouth=smile,pucker&sides=square,round&top=antenna,cone&face=square,round&color=ff4545,ffb300,aaff00,101216&${styleParams}`;
    } else {
        opponentAvatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=${encodeURIComponent(opponentBot.name)}&${styleParams}`;
    }
    elements.opponentCat.src = opponentAvatarUrl;

    elements.selectionScreen.style.display = 'none';
    elements.raceScreen.style.display = 'block';
    
    startCountdown();
});

/** Démarre le compte à rebours avant la course. */
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
            elements.countdown.textContent = "GO!";
        } else {
            clearInterval(countdownInterval);
            elements.countdown.style.display = 'none';
            startRace();
        }
    }, 1000);
}

/** Lance la simulation de course (rendue plus rapide). */
function startRace() {
    const trackWidth = document.querySelector('.race-track').offsetWidth - elements.playerCat.offsetWidth - 30;
    let playerPosition = 0;
    let opponentPosition = 0;
    
    // VITESSE ACCÉLÉRÉE (multipliée par 3)
    const SPEED_MULTIPLIER = 3;
    let playerBaseSpeed = (selectedBot.stats.vitesse * (selectedBot.stats.codage / 100)) * SPEED_MULTIPLIER;
    let opponentBaseSpeed = (opponentBot.stats.vitesse * (opponentBot.stats.codage / 100)) * SPEED_MULTIPLIER;
    
    if (elements.speedBoost.checked) {
        playerBaseSpeed *= 1.1; 
    }

    currentRaceInterval = setInterval(() => {
        // La variance est ajustée pour coller aux courses rapides
        const playerVarianceRange = elements.luckCharm.checked ? (100 - selectedBot.stats.chance) / 20 : (100 - selectedBot.stats.chance) / 100;
        const opponentVarianceRange = elements.luckCharm.checked ? (100 - opponentBot.stats.chance) / 20 : (100 - opponentBot.stats.chance) / 100;
        
        const playerStep = (playerBaseSpeed / 100) + (Math.random() * playerVarianceRange / 10);
        const opponentStep = (opponentBaseSpeed / 100) + (Math.random() * opponentVarianceRange / 10);
        
        playerPosition += playerStep; 
        opponentPosition += opponentStep; 

        elements.playerCat.style.transform = `translateX(${Math.min(playerPosition, trackWidth)}px)`;
        elements.opponentCat.style.transform = `translateX(${Math.min(opponentPosition, trackWidth)}px)`;

        if (playerPosition >= trackWidth || opponentPosition >= trackWidth) {
            clearInterval(currentRaceInterval);
            declareWinner(playerPosition, opponentPosition);
        }
    }, 70); 
}

/** Déclare le vainqueur, met à jour le score Kebab. */
function declareWinner(playerPos, opponentPos) {
    const mqUsed = window.matchMedia("(max-width: 992px)").matches;
    let winnerName;
    let isPlayerWinner;
    let kebabGain = 0;

    if (playerPos > opponentPos) {
        winnerName = selectedBot.name;
        isPlayerWinner = true;
        
        kebabGain = 5 + Math.floor(Math.random() * 10); 
        updateKebabScore(kebabGain);
        
        elements.raceResult.textContent = `🏆 ${selectedBot.name} trouve le Bug Sacré ! Victoire et ${kebabGain} K !`;
        elements.raceResult.classList.remove('lose');
        elements.raceResult.classList.add('win');
    } else {
        winnerName = opponentBot.name;
        isPlayerWinner = false;
        
        elements.raceResult.textContent = `😭 ${opponentBot.name} gagne la Quête ! Dégât, dégât...`;
        elements.raceResult.classList.remove('win');
        elements.raceResult.classList.add('lose');
        
        playDefeatSound();
    }
    
    logRace(winnerName, isPlayerWinner, mqUsed, kebabGain);
    elements.resetBtn.style.display = 'block';
}

elements.resetBtn.addEventListener('click', initializeSelection);

// Démarrage : vérifie l'état de la session au chargement
checkAuthSession();
