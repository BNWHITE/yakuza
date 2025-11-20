/* ================================================= */
/* 🧠 ENGINE V2: CLASSROOM PROTOCOL + BEREADY DATA */
/* ================================================= */

// --- CONFIGURATION ---
const GAME_DURATION = 60; // 60 secondes
const QUESTIONS_BEREADY = [
    // Questions inspirées de vos fichiers BeReady (app_elec, archi1, etc.)
    { theme: "ARCHI", q: "Que signifie CPU ?", options: ["Central Processing Unit", "Computer Power Unit", "Core Process Utility", "Central Power User"], correct: 0 },
    { theme: "ELEC", q: "Loi d'Ohm : U = ?", options: ["R × I", "R / I", "R + I", "I² × R"], correct: 0 },
    { theme: "SIGNAL", q: "L'unité de la fréquence ?", options: ["Hertz", "Watt", "Joule", "Volt"], correct: 0 },
    { theme: "INFO", q: "En binaire, 101 vaut ?", options: ["5", "3", "6", "9"], correct: 0 },
    { theme: "MATH", q: "Dérivée de x² ?", options: ["2x", "x", "2", "x²"], correct: 0 },
    { theme: "CULTURE", q: "Capitale du Japon ?", options: ["Tokyo", "Kyoto", "Osaka", "Seoul"], correct: 0 },
    { theme: "ARCHI", q: "1 Octet = ? bits", options: ["8", "16", "32", "4"], correct: 0 },
    { theme: "WEB", q: "Balise pour un lien ?", options: ["<a>", "<link>", "<href>", "<p>"], correct: 0 },
];

// Simulation de la classe (Nom + Seed pour l'avatar)
const CLASS_ROSTER = [
    { id: 1, name: "Lucas M.", seed: "Lucas" },
    { id: 2, name: "Sarah B.", seed: "Sarah" },
    { id: 3, name: "Enzo D.", seed: "Enzo" },
    { id: 4, name: "Ines L.", seed: "Ines" },
    { id: 5, name: "Thomas P.", seed: "Thomas" },
    { id: 6, name: "Léa F.", seed: "Lea" },
    { id: 7, name: "Karim S.", seed: "Karim" },
    { id: 8, name: "Julie A.", seed: "Julie" }
];

// Mock Leaderboard (Données fictives pour l'instant)
let leaderboardData = [
    { name: "Sarah B.", score: 2400 },
    { name: "Karim S.", score: 2150 },
    { name: "Lucas M.", score: 1900 },
    { name: "Enzo D.", score: 1850 },
    { name: "Moi", score: 0 } // Sera mis à jour
];

let state = {
    player: null,
    score: 0,
    timer: GAME_DURATION,
    playerPos: 0, // %
    botPos: 0,    // %
    gameActive: false,
    combo: 0
};

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    initLobby();
    updateLeaderboard();
});

function initLobby() {
    const select = document.getElementById('student-select');
    const imgPreview = document.getElementById('avatar-display');
    const startBtn = document.getElementById('start-btn');

    // Remplir le menu déroulant
    CLASS_ROSTER.forEach(student => {
        const opt = document.createElement('option');
        opt.value = student.id;
        opt.textContent = student.name;
        select.appendChild(opt);
    });

    // Changement Avatar au changement de sélection
    select.addEventListener('change', (e) => {
        const studentId = e.target.value;
        const student = CLASS_ROSTER.find(s => s.id == studentId);
        if(student) {
            // Utilisation de l'API DiceBear sans photos réelles
            imgPreview.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${student.seed}`;
            state.player = student;
            startBtn.disabled = false;
        }
    });

    startBtn.addEventListener('click', startGame);
}

function updateLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    
    // Trier par score décroissant
    leaderboardData.sort((a,b) => b.score - a.score);
    
    // Afficher Top 5
    leaderboardData.slice(0, 5).forEach((entry, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>#${index+1} ${entry.name}</span> <span>${entry.score} pts</span>`;
        list.appendChild(li);
    });
}

// --- GAME LOOP ---
function startGame() {
    document.getElementById('lobby-screen').classList.add('hidden-screen');
    document.getElementById('game-screen').classList.remove('hidden-screen');
    
    // Setup Avatar Jeu
    document.getElementById('game-avatar').src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${state.player.seed}`;
    document.getElementById('status-name').textContent = state.player.name;
    
    state.gameActive = true;
    state.timer = GAME_DURATION;
    
    nextQuestion();
    
    // Timer Loop
    const timerInt = setInterval(() => {
        if(!state.gameActive) { clearInterval(timerInt); return; }
        
        state.timer--;
        document.getElementById('timer').textContent = state.timer;
        
        // Mouvement Bot (Avance régulière)
        state.botPos += 1.2; // Vitesse ajustée pour 60s
        updatePositions();

        if(state.timer <= 0 || state.playerPos >= 90) endGame();
    }, 1000);
}

function updatePositions() {
    const playerEl = document.getElementById('player-racer');
    const botEl = document.getElementById('bot-racer');
    const pBar = document.getElementById('p-bar');

    playerEl.style.left = Math.min(state.playerPos, 90) + '%';
    botEl.style.left = Math.min(state.botPos, 90) + '%';
    pBar.style.width = (state.timer / GAME_DURATION * 100) + '%';
}

// --- QUIZ LOGIC ---
function nextQuestion() {
    // Prendre une question au hasard
    const q = QUESTIONS_BEREADY[Math.floor(Math.random() * QUESTIONS_BEREADY.length)];
    
    document.getElementById('q-theme').textContent = q.theme;
    document.getElementById('q-text').textContent = q.q;
    
    const container = document.getElementById('options-box');
    container.innerHTML = '';
    
    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.textContent = opt;
        btn.onclick = () => handleAnswer(index === q.correct, btn);
        container.appendChild(btn);
    });
}

function handleAnswer(isCorrect, btn) {
    if(isCorrect) {
        btn.style.background = '#10b981'; // Vert
        state.playerPos += 8; // Avance
        state.score += 100 + (state.combo * 20);
        state.combo++;
        
        // Effet Feu si combo > 2
        if(state.combo > 2) document.querySelector('.fire-fx').classList.remove('hidden');
    } else {
        btn.style.background = '#ff4655'; // Rouge
        state.combo = 0;
        document.querySelector('.fire-fx').classList.add('hidden');
    }
    
    updatePositions();
    
    // Délai avant la prochaine question
    setTimeout(nextQuestion, 400);
}

function endGame() {
    state.gameActive = false;
    const overlay = document.getElementById('result-overlay');
    overlay.classList.remove('hidden');
    
    document.getElementById('res-score').textContent = `Score Final: ${state.score}`;
    
    if(state.playerPos > state.botPos) {
        document.getElementById('res-title').textContent = "VICTOIRE ÉCLATANTE";
        document.getElementById('res-title').style.color = "#10b981";
    } else {
        document.getElementById('res-title').textContent = "ÉCHEC MISSION";
        document.getElementById('res-title').style.color = "#ff4655";
    }

    // Mise à jour du leaderboard local (simulation)
    leaderboardData.push({ name: state.player.name, score: state.score });
    updateLeaderboard();
}
