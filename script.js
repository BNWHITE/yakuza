/* ================================================= */
/* 🧠 JAVASCRIPT DETAILLÉ : Logique du Jeu et Supabase */
/* ================================================= */

// 1. DÉCLARATION DES CLÉS (Clé Publique)
// C'est la seule clé que vous devez mettre dans le code front-end (JS)
const SUPABASE_URL = 'https://dxiefxcfnggezuiifeqf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wAZG8NaYrZux3loetrNbmg_6QOuyBz5';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null; 

// Liste des bots PNJs (non-joueurs) pour la course
const students = [
    { name: "Alexandre ALVES", title: "Le Débogueur", stats: {} }, { name: "Douae BOULOUALI", title: "L'impératrice", stats: {} }, { name: "Sid-Ahmed BOUSLAH", title: "Chill Boy", stats: {} }, { name: "Leon JIANG", title: "FinoVox", stats: {} }, { name: "Alheli RODRIGUEZ", title: "L'intentionnée", stats: {} },
    { name: "Maxime BOGNON", title: "Maximilien", stats: {} }, { name: "Corentin BRAND", title: "Le favoris", stats: {} }, { name: "Maximilien CANONNE", title: "Luminosité Minimum", stats: {} }, { name: "Adel HENI", title: "Le plavonneur", stats: {} }, { name: "Kahina MEDJUKANE", title: "THE QUEEN ♕", stats: { vitesse: 100, codage: 100, chance: 100 } },
    { name: "Sully MORETON", title: "Le stagiaire", stats: {} }, { name: "Aliénor ANTONA", title: "La gourmande🍔", stats: {} }, { name: "Nicolas CLEMENT", title: "Le délégué", stats: {} }, { name: "Bryan DE FARIA", title: "Le Chargeur", stats: {} }, { name: "Hani HOUMIMID", title: "Le turc 🇹🇷", stats: {} },
    { name: "Vithues KANDIAH", title: "ECE Water", stats: {} }, { name: "Hector LE BACHELIER", title: "L'Ingénieur Papier", stats: {} }, { name: "Quentin DABOVILLE", title: "Le Bretons", stats: {} }, { name: "Yassmina HARRISSI", title: "La Libanaise🇱🇧", stats: {} }, { name: "Allan LAHCENE", title: " Le + Chill", stats: {} },
    { name: "Evan MASSE", title: "Hasfy", stats: {} }, { name: "Seydina SY", title: "Git init", stats: {} }, { name: "Ilay AL ABIAD", title: "Brother from an other mother", stats: {} }, { name: "Ahmed ELHATTAB", title: "English Boy", stats: {} }, { name: "Thushyan KOHILAKUMAR", title: "L'Orfèvre", stats: {} },
    { name: "Aurélie MAHAUT", title: "La Stratège", stats: {} }, { name: "Gaspard PONS", title: "Le Philosophe", stats: {} }, { name: "Rafael RION", title: "L'Alchimiste", stats: {} }, { name: "Faruk SAN", title: "Le connaisseur", stats: {} },
    // Profil Professeur
    { name: "Mme CHABCHOUB", title: "La Guide du Code Sacré", stats: { vitesse: 100, codage: 100, chance: 100 } }
];

const elements = {
    // Éléments d'Authentification
    authScreen: document.getElementById('auth-screen'),
    authEmail: document.getElementById('auth-email'),
    authPassword: document.getElementById('auth-password'),
    signupBtn: document.getElementById('signup-btn'),
    signinBtn: document.getElementById('signin-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    authMessage: document.getElementById('auth-message'),
    userWelcome: document.getElementById('user-welcome'),
    // Éléments du Jeu existants
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
    historySection: document.getElementById('history-section'), // Ajouté pour gestion visibilité
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


// ------------------------------------
// LOGIQUE SUPABASE : AUTHENTIFICATION & PROFIL
// ------------------------------------
async function loadKebabScore(userId) {
    // Tente de charger le score de l'utilisateur
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('kebab_score')
        .eq('id', userId)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = pas de ligne trouvée
        console.error("Erreur de chargement du score :", error);
    }
    
    return data ? data.kebab_score : 0; // Défaut à 0 si le profil n'existe pas encore
}

async function createProfileIfMissing(userId, email) {
    // Crée un profil initial après une nouvelle inscription ou si la ligne est manquante
    const { data, error } = await supabaseClient
        .from('profiles')
        .insert({ id: userId, username: email.split('@')[0], kebab_score: 5 }) // Donne 5 K au départ
        .select()
        .single()
        .then(response => {
             // Si le profil existait (erreur de conflit), on le considère créé
            if (response.error && response.error.code === '23505') { 
                return { data: true, error: null };
            }
            return response;
        });

    if (error) {
        console.error("Erreur de création de profil:", error);
    }
}

async function checkAuthSession() {
    elements.authMessage.textContent = 'Vérification de session...';
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        await createProfileIfMissing(currentUser.id, currentUser.email);
        kebabScore = await loadKebabScore(currentUser.id);
        
        elements.authScreen.style.display = 'none';
        elements.logoutBtn.style.display = 'block';
        elements.historySection.style.display = 'block';
        elements.userWelcome.textContent = `Bienvenue, Explorateur ${currentUser.email.split('@')[0]} !`;
        initializeSelection();
    } else {
        currentUser = null;
        kebabScore = 0;
        elements.authScreen.style.display = 'block';
        elements.logoutBtn.style.display = 'none';
        elements.selectionScreen.style.display = 'none';
        elements.raceScreen.style.display = 'none';
        elements.historySection.style.display = 'none';
    }
    updateKebabScore(0);
    elements.authMessage.textContent = '';
}

async function signUp() {
    const email = elements.authEmail.value;
    const password = elements.authPassword.value;
    elements.authMessage.textContent = 'Inscription en cours...';

    const { data, error } = await supabaseClient.auth.signUp({ email, password });

    if (error) {
        elements.authMessage.textContent = `Erreur d'inscription: ${error.message}`;
    } else {
        elements.authMessage.textContent = `Inscription réussie ! Un lien de confirmation a été envoyé à ${data.user.email}.`;
        // Un trigger Supabase (voir SQL) s'occupe de créer le profil une fois l'utilisateur confirmé.
    }
}

async function signIn() {
    const email = elements.authEmail.value;
    const password = elements.authPassword.value;
    elements.authMessage.textContent = 'Connexion en cours...';

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        elements.authMessage.textContent = `Erreur de connexion: ${error.message}`;
    } else {
        elements.authMessage.textContent = 'Connexion réussie !';
        checkAuthSession();
    }
}

async function signOut() {
    elements.authMessage.textContent = 'Déconnexion en cours...';
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
         elements.authMessage.textContent = `Erreur de déconnexion: ${error.message}`;
    } else {
        checkAuthSession();
        elements.authEmail.value = '';
        elements.authPassword.value = '';
        elements.authMessage.textContent = 'Déconnecté. Au revoir !';
    }
}

elements.signupBtn.addEventListener('click', signUp);
elements.signinBtn.addEventListener('click', signIn);
elements.logoutBtn.addEventListener('click', signOut);

supabaseClient.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkAuthSession();
    }
});

// ------------------------------------
// FONCTIONNALITÉS DU JEU
// ------------------------------------

async function updateKebabScore(amount) {
    kebabScore += amount;
    
    if (currentUser) {
        // Envoi du nouveau score à Supabase
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

function playDefeatSound() {
    if (opponentBot.name !== "Mme CHABCHOUB") {
        elements.defeatAudio.currentTime = 0;
        elements.defeatAudio.play().catch(e => console.error("Erreur lecture audio :", e));
    }
}

function generateStats(bot) {
    if (bot.name === "Mme CHABCHOUB") {
        // Stats fixes pour la prof
    } else if (Object.keys(bot.stats).length === 0) {
        bot.stats.vitesse = 40 + Math.floor(Math.random() * 40);
        bot.stats.codage = 40 + Math.floor(Math.random() * 40);
        bot.stats.chance = 50 + Math.floor(Math.random() * 50);
    }
}

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

// ... (fonctions updateMQStatus, logRace, initializeSelection, selectBot, generateOpponent, startCountdown, startRace, declareWinner restent similaires)

function updateMQStatus() {
    const mq = window.matchMedia("(max-width: 600px)");
    if (mq.matches) {
        elements.mqStatus.innerHTML = `⚠️ **MODE MOBILE ACTIVÉ** (Media Query: 1 colonne). L'affichage a été réorganisé pour éviter le débordement.`;
        elements.mqStatus.style.color = '#ffeb3b';
    } else if (window.innerWidth <= 992) {
         elements.mqStatus.innerHTML = `✅ **MODE TABLETTE ACTIVÉ** (Media Query: 2 colonnes).`;
         elements.mqStatus.style.color = '#aaffaa';
    }
    else {
        elements.mqStatus.innerHTML = `🖥️ **MODE PC** (Grille 4 colonnes). Réduisez la fenêtre pour voir la magie des Media Queries !`;
        elements.mqStatus.style.color = '#fff';
    }
}
window.addEventListener('resize', updateMQStatus);

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

function initializeSelection() {
    if (!currentUser) {
        elements.selectionScreen.style.display = 'none';
        elements.authScreen.style.display = 'block';
        return;
    }
    
    elements.selector.innerHTML = '';
    students.forEach(bot => {
        generateStats(bot);
        
        const card = document.createElement('div');
        card.classList.add('student-card');
        if (bot.name === "Mme CHABCHOUB") {
            card.classList.add('chabchoub-card');
        }
        
        let avatarUrl;
        if (bot.name === "Mme CHABCHOUB") {
            avatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=Chabchoub&scale=110&size=100&eyes=bulgy,round&mouth=smile,pucker&sides=square,round&top=antenna,cone&face=square,round&color=ff3333,00ff80,4CAF50,00bcd4`;
        } else {
            avatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=${encodeURIComponent(bot.name)}&scale=110&size=100`;
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

function selectBot(bot, card, avatarUrl) {
    Array.from(elements.selector.children).forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedBot = bot;
    elements.playerCat.src = avatarUrl;
    elements.startBtn.style.display = 'block';
}

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
    
    let opponentAvatarUrl;
    if (opponentBot.name === "Mme CHABCHOUB") {
        opponentAvatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=Chabchoub&scale=110&size=100&eyes=bulgy,round&mouth=smile,pucker&sides=square,round&top=antenna,cone&face=square,round&color=ff3333,00ff80,4CAF50,00bcd4`;
    } else {
        opponentAvatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=${encodeURIComponent(opponentBot.name)}&scale=110&size=100`;
    }
    elements.opponentCat.src = opponentAvatarUrl;

    elements.selectionScreen.style.display = 'none';
    elements.raceScreen.style.display = 'block';
    
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
            elements.countdown.textContent = "GO!";
        } else {
            clearInterval(countdownInterval);
            elements.countdown.style.display = 'none';
            startRace();
        }
    }, 1000);
}

function startRace() {
    const trackWidth = document.querySelector('.race-track').offsetWidth - elements.playerCat.offsetWidth - 30;
    let playerPosition = 0;
    let opponentPosition = 0;
    
    let playerBaseSpeed = selectedBot.stats.vitesse * (selectedBot.stats.codage / 100);
    let opponentBaseSpeed = opponentBot.stats.vitesse * (opponentBot.stats.codage / 100);
    
    if (elements.speedBoost.checked) {
        playerBaseSpeed *= 1.1; 
    }

    currentRaceInterval = setInterval(() => {
        const playerVarianceRange = elements.luckCharm.checked ? (100 - selectedBot.stats.chance) / 10 : (100 - selectedBot.stats.chance) / 50;
        const opponentVarianceRange = elements.luckCharm.checked ? (100 - opponentBot.stats.chance) / 10 : (100 - opponentBot.stats.chance) / 50;
        
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
