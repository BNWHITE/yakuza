/* ================================================= */
/* 🧠 JAVASCRIPT DETAILLÉ : Logique du Jeu et Supabase */
/* (Nom du jeu : YAKUZA. Course 5-7 secondes fixée) */
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
// Déclaration globale de l'intervalle pour pouvoir l'arrêter
let currentRaceInterval; 

const DEFAULT_STATS = {
    vitesse: 60,
    codage: 60,
    chance: 60
};

const BASE_SPEED_FACTOR = 12; // Ajusté pour une course de 5-7s

const students = [
    { name: "Alexandre ALVES", title: "Le Débogueur", stats: {} }, { name: "Douae BOULOUALI", title: "L'impératrice", stats: {} }, { name: "Sid-Ahmed BOUSLAH", title: "Chill Boy", stats: {} }, { name: "Leon JIANG", title: "FinoVox", stats: {} }, { name: "Alheli RODRIGUEZ", title: "L'intentionnée", stats: {} },
    { name: "Maxime BOGNON", title: "Maximilien", stats: {} }, { name: "Corentin BRAND", title: "Le favoris", stats: {} }, { name: "Maximilien CANONNE", title: "Luminosité Minimum", stats: {} }, { name: "Adel HENI", title: "Le plavonneur", stats: {} }, { name: "Kahina MEDJUKANE", title: "THE QUEEN ♕", stats: {} },
    { name: "Sully MORETON", title: "Le stagiaire", stats: {} }, { name: "Aliénor ANTONA", title: "La gourmande🍔", stats: {} }, { name: "Nicolas CLEMENT", title: "Le délégué", stats: {} }, { name: "Bryan DE FARIA", title: "Le Chargeur", stats: {} }, { name: "Hani HOUMIMID", title: "Le turc 🇹🇷", stats: {} },
    { name: "Vithues KANDIAH", title: "ECE Water", stats: {} }, { name: "Hector LE BACHELIER", title: "L'Ingénieur Papier", stats: {} }, { name: "Quentin DABOVILLE", title: "Le Bretons", stats: {} }, { name: "Yassmina HARRISSI", title: "La Libanaise🇱🇧", stats: {} }, { name: "Allan LAHCENE", title: " Le + Chill", stats: {} },
    { name: "Evan MASSE", title: "Hasfy", stats: {} }, { name: "Seydina SY", title: "Git init", stats: {} }, { name: "Ilay AL ABIAD", title: "Brother from an other mother", stats: {} }, { name: "Ahmed ELHATTAB", title: "English Boy", stats: {} }, { name: "Thushyan KOHILAKUMAR", title: "L'Orfèvre", stats: {} },
    { name: "Aurélie MAHAUT", title: "La Stratège", stats: {} }, { name: "Gaspard PONS", title: "Le Philosophe", stats: {} }, { name: "Rafael RION", title: "L'Alchimiste", stats: {} }, { name: "Faruk SAN", title: "Le connaisseur", stats: {} },
    { name: "Mme CHABCHOUB", title: "La Guide du Code Sacré", stats: { vitesse: 100, codage: 100, chance: 100 } }
];

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
    defeatAudio: document.getElementById('defeat-audio'),
    
    chatSection: document.getElementById('chat-section'),
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    sendChatBtn: document.getElementById('send-chat-btn')
};

let selectedBot = null;
let opponentBot = null;
let raceHistory = [];
let kebabScore = 0; 
let chatChannel = null; 

const errorColor = getComputedStyle(document.documentElement).getPropertyValue('--error-color').trim();
const accentLime = getComputedStyle(document.documentElement).getPropertyValue('--accent-lime').trim();


// --- Fonctions Auth/Chat (inchangées) ---
async function loadProfileData(userId) {
    const { data } = await supabaseClient
        .from('profiles')
        .select('kebab_score, username')
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
            kebabScore = profileData.kebab_score;
            currentUsername = profileData.username;
        } else {
            kebabScore = 5;
            currentUsername = currentUser.email.split('@')[0];
        }
        
        elements.authScreen.style.display = 'none';
        elements.logoutBtn.style.display = 'block';
        elements.historySection.style.display = 'block';
        elements.selectionScreen.style.display = 'block';
        elements.chatSection.style.display = 'block'; 
        elements.userWelcome.textContent = `Bienvenue, Explorateur ${currentUsername} !`;
        
        initializeSelection();
        setupRealtimeChat(); 
        elements.authMessage.textContent = '';
    } else {
        if(chatChannel) supabaseClient.removeChannel(chatChannel);
        currentUser = null;
        kebabScore = 0;
        currentUsername = null;
        elements.authScreen.style.display = 'block';
        elements.logoutBtn.style.display = 'none';
        elements.selectionScreen.style.display = 'none';
        elements.raceScreen.style.display = 'none';
        elements.historySection.style.display = 'none';
        elements.chatSection.style.display = 'none'; 
        elements.authMessage.textContent = '';
    }
    updateKebabScore(0);
}

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
    }
}

async function signOut() {
    elements.authMessage.textContent = 'Déconnexion en cours...';
    await supabaseClient.auth.signOut();
}

elements.signupBtn.addEventListener('click', signUp);
elements.signinBtn.addEventListener('click', signIn);
elements.logoutBtn.addEventListener('click', signOut);

supabaseClient.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        checkAuthSession();
    }
});


function displayMessage(message, isNew = false) {
    const messageElement = document.createElement('p');
    messageElement.style.margin = '5px 0';
    messageElement.style.fontSize = '0.9em';
    
    if (isNew) {
        messageElement.style.color = 'var(--accent-orange)';
        setTimeout(() => messageElement.style.color = 'var(--text-color-light)', 2000);
    } else {
        messageElement.style.color = 'var(--text-color-light)';
    }
    
    const time = new Date(message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const sender = message.username || 'Bot Inconnu';
    
    messageElement.innerHTML = `[<span style="color: var(--accent-lime);">${time}</span>] <strong>${sender}</strong>: ${message.content}`;
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


// --- Fonctions de Jeu (fixées) ---

async function updateKebabScore(amount) {
    kebabScore += amount;
    
    if (currentUser) {
        await supabaseClient
            .from('profiles')
            .update({ kebab_score: kebabScore })
            .eq('id', currentUser.id);
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
    if (bot.name === "Mme CHABCHOUB") return;
    if (Object.keys(bot.stats).length === 0) {
        bot.stats.vitesse = DEFAULT_STATS.vitesse + Math.floor(Math.random() * 5); 
        bot.stats.codage = DEFAULT_STATS.codage + Math.floor(Math.random() * 5);
        bot.stats.chance = DEFAULT_STATS.chance + Math.floor(Math.random() * 5);
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

function updateMQStatus() {
    const mqMobile = window.matchMedia("(max-width: 992px)");
    if (mqMobile.matches) {
        elements.mqStatus.innerHTML = `⚙️ **MENU ROULETTE (Mobile) Activé**. Faites défiler pour voir tous les Bots !`;
        elements.mqStatus.style.color = 'var(--accent-orange)';
    } else {
        elements.mqStatus.innerHTML = `🖥️ **MODE PC**. Grille 4 colonnes pour la sélection.`;
        elements.mqStatus.style.color = 'var(--text-color-light)';
    }
}
window.addEventListener('resize', updateMQStatus);

function initializeSelection() {
    if (!currentUser) return;

    elements.selector.innerHTML = '';
    students.forEach(bot => {
        generateStats(bot);
        
        const card = document.createElement('div');
        card.classList.add('student-card');
        if (bot.name === "Mme CHABCHOUB") card.classList.add('chabchoub-card');
        
        let avatarUrl;
        const styleParams = 'scale=110&size=100&eyes=sides,round&mouth=smile,pucker&sides=square,round&top=antenna,cone&face=square,round&color=101216,aaff00,f0f0f0,ffb300';
        if (bot.name === "Mme CHABCHOUB") {
            avatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=Chabchoub&color=ff4545,ffb300,aaff00,101216&${styleParams}`;
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
    
    // Remise à zéro des positions
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
    
    const styleParams = 'scale=110&size=100&eyes=sides,round&mouth=smile,pucker&sides=square,round&top=antenna,cone&face=square,round&color=101216,aaff00,f0f0f0,ffb300';
    let opponentAvatarUrl;
    if (opponentBot.name === "Mme CHABCHOUB") {
        opponentAvatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=Chabchoub&color=ff4545,ffb300,aaff00,101216&${styleParams}`;
    } else {
        opponentAvatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=${encodeURIComponent(opponentBot.name)}&${styleParams}`;
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
    // Calcul de la largeur de piste ajustée (ajusté pour la taille mobile)
    const trackWidth = document.querySelector('.race-track').offsetWidth - elements.playerCat.offsetWidth - 30;
    
    // Si la piste est trop petite, on évite les problèmes (sécurité)
    if (trackWidth <= 0) {
        console.error("Erreur: Largeur de piste insuffisante pour la course.");
        declareWinner(1, 0); // Déclare le joueur vainqueur par défaut
        return;
    }

    let playerPosition = 0;
    let opponentPosition = 0;
    
    let playerBaseSpeed = (selectedBot.stats.vitesse * (selectedBot.stats.codage / 100)) * BASE_SPEED_FACTOR;
    let opponentBaseSpeed = (opponentBot.stats.vitesse * (opponentBot.stats.codage / 100)) * BASE_SPEED_FACTOR;
    
    if (elements.speedBoost.checked) {
        playerBaseSpeed *= 1.1; 
    }
    
    elements.playerCat.classList.add('running');
    elements.opponentCat.classList.add('running');


    currentRaceInterval = setInterval(() => {
        const playerVarianceRange = elements.luckCharm.checked ? (100 - selectedBot.stats.chance) / 20 : (100 - selectedBot.stats.chance) / 100;
        const opponentVarianceRange = elements.luckCharm.checked ? (100 - opponentBot.stats.chance) / 20 : (100 - opponentBot.stats.chance) / 100;
        
        const playerStep = (playerBaseSpeed / 100) + (Math.random() * playerVarianceRange / 10);
        const opponentStep = (opponentBaseSpeed / 100) + (Math.random() * opponentVarianceRange / 10);
        
        playerPosition += playerStep; 
        opponentPosition += opponentStep; 

        // Mise à jour de la position visuelle
        elements.playerCat.style.transform = `translateX(${Math.min(playerPosition, trackWidth)}px)`;
        elements.opponentCat.style.transform = `translateX(${Math.min(opponentPosition, trackWidth)}px)`;

        if (playerPosition >= trackWidth || opponentPosition >= trackWidth) {
            clearInterval(currentRaceInterval);
            elements.playerCat.classList.remove('running');
            elements.opponentCat.classList.remove('running');
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
