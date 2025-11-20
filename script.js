/* ================================================= */
/* 🧠 GAME ENGINE : CLASSROOM CONQUEST (V3) */
/* ================================================= */

// --- CONFIG ---
const SUPABASE_URL = 'https://dxiefxcfnggezuiifeqf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wAZG8NaYrZux3loetrNbmg_6QOuyBz5'; // Ta clé publique
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- ETAT DU JEU ---
let currentUser = null;
let selectedAgent = null;
let gameInterval = null;
let timerInterval = null;

let gameState = {
    playerPos: 0, // Pourcentage 0-100
    opponentPos: 0,
    timeLeft: 30,
    score: 0,
    consecutiveCorrect: 0, // Pour le combo feu
    lastAnswerTime: 0,
    currentQuestion: null
};

const MAX_DISTANCE = 90; // La ligne d'arrivée est visuellement à ~90%
const SPEED_BOOST_PER_ANSWER = 12; // On avance de 12% par bonne réponse
const OPPONENT_SPEED_MPS = 2.8; // L'adversaire avance de 2.8% par seconde (constant)

// --- DONNÉES (MOCK) ---
// Pour la prod, on peut charger un fichier JSON externe ici
const HARDCODED_QUESTIONS = [
    { cat: "CULTURE", q: "Quelle est la capitale du Japon ?", a: ["Tokyo", "Kyoto", "Osaka", "Seoul"], ok: 0 },
    { cat: "CODE", q: "Que signifie HTML ?", a: ["HyperText Markup Language", "HighTech Modern Language", "HyperTransfer Make Link", "Home Tool Markup"], ok: 0 },
    { cat: "CINÉMA", q: "Qui a réalisé Interstellar ?", a: ["Christopher Nolan", "Steven Spielberg", "Quentin Tarantino", "James Cameron"], ok: 0 },
    { cat: "SCIENCE", q: "Quel est le symbole chimique de l'Or ?", a: ["Au", "Ag", "Or", "Fe"], ok: 0 },
    { cat: "HISTOIRE", q: "En quelle année a eu lieu la Révolution Française ?", a: ["1789", "1799", "1815", "1515"], ok: 0 },
];

// Liste fictive des élèves/avatars
const CLASSMATES = [
    { name: "Lucas", seed: "Lucas" },
    { name: "Sarah", seed: "Sarah" },
    { name: "Tom", seed: "Tom" },
    { name: "Ines", seed: "Ines" },
    { name: "Enzo", seed: "Enzo" },
    { name: "Léa", seed: "Lea" },
    { name: "Bot Alpha", seed: "Bot1" },
    { name: "Bot Beta", seed: "Bot2" }
];

// =================================================
// 1. AUTH & LOBBY
// =================================================

function init() {
    renderAgentSelection();
    
    // Listeners Auth
    document.getElementById('signin-btn').addEventListener('click', async () => {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        // Simulation Auth pour la démo (remplacer par supabase.auth.signInWithPassword)
        if(email) {
            currentUser = { email: email };
            unlockLobby();
        }
    });

    document.getElementById('confirm-agent-btn').addEventListener('click', launchGame);
    document.getElementById('restart-btn').addEventListener('click', resetGame);
}

function renderAgentSelection() {
    const grid = document.getElementById('agents-grid');
    grid.innerHTML = '';
    CLASSMATES.forEach(student => {
        const div = document.createElement('div');
        div.className = 'agent-choice';
        div.innerHTML = `
            <img src="https://api.dicebear.com/8.x/avataaars/svg?seed=${student.seed}" alt="${student.name}">
            <div>${student.name}</div>
        `;
        div.onclick = () => selectAgent(div, student);
        grid.appendChild(div);
    });
}

function selectAgent(element, student) {
    document.querySelectorAll('.agent-choice').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    selectedAgent = student;
    document.getElementById('confirm-agent-btn').disabled = false;
}

function unlockLobby() {
    document.getElementById('auth-msg').textContent = "ACCESS GRANTED.";
    document.getElementById('auth-msg').style.color = "#10b981";
    document.querySelector('.auth-panel').style.opacity = "0.5";
    document.querySelector('.auth-panel').style.pointerEvents = "none";
    
    const agentPanel = document.getElementById('agent-selection');
    agentPanel.style.opacity = "1";
    agentPanel.style.pointerEvents = "all";
    document.getElementById('user-status-display').textContent = `AGENT: ${currentUser.email.split('@')[0].toUpperCase()}`;
}

// =================================================
// 2. MOTEUR DE QUESTIONS (HYBRIDE)
// =================================================

function generateMathQuestion() {
    // Générateur de calcul mental infini
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, res;

    if (op === '+') {
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * 50) + 10;
        res = a + b;
    } else if (op === '-') {
        a = Math.floor(Math.random() * 50) + 20;
        b = Math.floor(Math.random() * a); // Pas de négatif
        res = a - b;
    } else {
        a = Math.floor(Math.random() * 12) + 2;
        b = Math.floor(Math.random() * 10) + 2;
        res = a * b;
    }

    // Générer fausses réponses proches
    let answers = [res];
    while (answers.length < 4) {
        let fake = res + Math.floor(Math.random() * 10) - 5;
        if (fake !== res && !answers.includes(fake)) answers.push(fake);
    }
    
    return {
        cat: "CALCUL MENTAL",
        q: `${a} ${op} ${b} = ?`,
        a: shuffleArray(answers),
        correctVal: res // On stocke la valeur pour vérifier
    };
}

function getNextQuestion() {
    // 50% de chance d'avoir des maths (infini), 50% culture
    if (Math.random() > 0.5) {
        return generateMathQuestion();
    } else {
        const q = HARDCODED_QUESTIONS[Math.floor(Math.random() * HARDCODED_QUESTIONS.length)];
        // Copie pour ne pas modifier l'original lors du shuffle
        const answers = [...q.a]; 
        const correctAnswerText = q.a[q.ok];
        const shuffled = shuffleArray(answers);
        return {
            cat: q.cat,
            q: q.q,
            a: shuffled,
            correctVal: correctAnswerText
        };
    }
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// =================================================
// 3. GAMEPLAY LOOP
// =================================================

function launchGame() {
    document.getElementById('lobby-screen').classList.add('hidden-screen');
    document.getElementById('game-screen').classList.remove('hidden-screen');
    
    // Setup Avatar
    const playerImg = document.querySelector('#player-avatar-display img');
    playerImg.src = `https://api.dicebear.com/8.x/avataaars/svg?seed=${selectedAgent.seed}`;
    
    resetGameState();
    startGameLoop();
    displayNewQuestion();
}

function resetGameState() {
    gameState = {
        playerPos: 0,
        opponentPos: 0,
        timeLeft: 30,
        score: 0,
        consecutiveCorrect: 0,
        lastAnswerTime: Date.now(),
        currentQuestion: null
    };
    updatePositionsDOM();
    document.getElementById('result-overlay').classList.add('hidden');
    document.querySelector('.fire-effect').classList.add('hidden');
}

function startGameLoop() {
    // Boucle de temps (Timer + Mouvement adversaire)
    timerInterval = setInterval(() => {
        gameState.timeLeft -= 0.1;
        
        // Mouvement adversaire (linéaire)
        gameState.opponentPos += (OPPONENT_SPEED_MPS / 10); 
        
        updateUI();

        // Vérification Fin de jeu
        if (gameState.timeLeft <= 0 || gameState.playerPos >= MAX_DISTANCE || gameState.opponentPos >= MAX_DISTANCE) {
            endGame();
        }
    }, 100);
}

function updateUI() {
    document.getElementById('game-timer').textContent = gameState.timeLeft.toFixed(1);
    document.getElementById('score-display').textContent = gameState.score;
    updatePositionsDOM();
}

function updatePositionsDOM() {
    const playerEl = document.querySelector('#player-lane .avatar-wrapper');
    const oppEl = document.querySelector('#opponent-lane .avatar-wrapper');
    
    playerEl.style.left = Math.min(gameState.playerPos, 100) + '%';
    oppEl.style.left = Math.min(gameState.opponentPos, 100) + '%';
}

// =================================================
// 4. INTERACTION QUIZ
// =================================================

function displayNewQuestion() {
    const qData = getNextQuestion();
    gameState.currentQuestion = qData;
    
    document.getElementById('q-category').textContent = qData.cat;
    document.getElementById('q-text').textContent = qData.q;
    
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach((btn, index) => {
        btn.textContent = qData.a[index];
        btn.className = 'answer-btn'; // Reset classes
        btn.disabled = false;
        
        // Nettoyage anciens listeners via clonage ou gestionnaire unique (ici simple re-assign)
        btn.onclick = () => handleAnswer(qData.a[index], btn);
    });
}

function handleAnswer(value, btnElement) {
    // Désactiver boutons pour éviter double clic
    document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
    
    const isCorrect = (value == gameState.currentQuestion.correctVal);
    const now = Date.now();
    
    if (isCorrect) {
        btnElement.classList.add('correct');
        gameState.playerPos += SPEED_BOOST_PER_ANSWER;
        gameState.score += 100;
        
        // Logique COMBO / FEU
        const timeDiff = (now - gameState.lastAnswerTime) / 1000;
        if (timeDiff < 15) {
            gameState.consecutiveCorrect++;
        } else {
            gameState.consecutiveCorrect = 1;
        }
        
        if (gameState.consecutiveCorrect >= 2) {
            activateFireMode();
        }

    } else {
        btnElement.classList.add('wrong');
        gameState.consecutiveCorrect = 0;
        deactivateFireMode();
        // Pénalité légère ?
        gameState.playerPos = Math.max(0, gameState.playerPos - 2);
    }

    gameState.lastAnswerTime = now;
    
    // Prochaine question après délai court
    setTimeout(() => {
        if (gameState.timeLeft > 0) displayNewQuestion();
    }, 500);
}

function activateFireMode() {
    const fire = document.querySelector('.fire-effect');
    fire.classList.remove('hidden');
    // On pourrait ajouter un boost de vitesse x1.5 ici
}

function deactivateFireMode() {
    document.querySelector('.fire-effect').classList.add('hidden');
}

// =================================================
// 5. FIN DE JEU
// =================================================

function endGame() {
    clearInterval(timerInterval);
    
    const overlay = document.getElementById('result-overlay');
    const title = document.getElementById('result-title');
    
    overlay.classList.remove('hidden');
    
    if (gameState.playerPos >= MAX_DISTANCE && gameState.playerPos > gameState.opponentPos) {
        title.textContent = "VICTOIRE";
        title.style.color = "#10b981"; // Green
        playAudio('win');
    } else {
        title.textContent = "ECHEC";
        title.style.color = "#ff4655"; // Red
    }
}

function resetGame() {
    document.getElementById('lobby-screen').classList.remove('hidden-screen');
    document.getElementById('game-screen').classList.add('hidden-screen');
}

function playAudio(type) {
    // Placeholder pour le son
    console.log(`Playing sound: ${type}`);
}

// Start
init();
