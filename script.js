/* LOGIQUE JEU V3 - CLASSROOM LEAGUE */

// Config
const GAME_TIME = 60;
const students = [
    { name: "Alexandre ALVES", title: "Le Débogueur", stats: {} }, { name: "Douae BOULOUALI", title: "L'impératrice", stats: {} }, { name: "Sid-Ahmed BOUSLAH", title: "Chill Boy", stats: {} }, { name: "Leon JIANG", title: "FinoVox", stats: {} }, { name: "Alheli RODRIGUEZ", title: "L'intentionnée", stats: {} },
    { name: "Maxime BOGNON", title: "Maximilien", stats: {} }, { name: "Corentin BRAND", title: "Le favoris", stats: {} }, { name: "Maximilien CANONNE", title: "Luminosité Minimum", stats: {} }, { name: "Adel HENI", title: "Le plavonneur", stats: {} }, { name: "Kahina MEDJUKANE", title: "THE QUEEN ♕", stats: {} },
    { name: "Sully MORETON", title: "Le stagiaire", stats: {} }, { name: "Aliénor ANTONA", title: "La gourmande🍔", stats: {} }, { name: "Nicolas CLEMENT", title: "Le délégué", stats: {} }, { name: "Bryan DE FARIA", title: "Le Chargeur", stats: {} }, { name: "Hani HOUMIMID", title: "Chargerrr", stats: {} },
    { name: "Vithues KANDIAH", title: "ECE Water", stats: {} }, { name: "Hector LE BACHELIER", title: "L'Ingénieur Papier", stats: {} }, { name: "Quentin DABOVILLE", title: "Le Bretons", stats: {} }, { name: "Yassmina HARRISSI", title: "La Libanaise🇱🇧", stats: {} }, { name: "Allan LAHCENE", title: " Le + Chill", stats: {} },
    { name: "Evan MASSE", title: "Hasfy", stats: {} }, { name: "Seydina SY", title: "Git init", stats: {} }, { name: "Ilay AL ABIAD", title: "Brother from an other mother", stats: {} }, { name: "Ahmed ELHATTAB", title: "English Boy", stats: {} }, { name: "Thushyan KOHILAKUMAR", title: "L'Orfèvre", stats: {} },
    { name: "Aurélie MAHAUT", title: "La Stratège", stats: {} }, { name: "Gaspard PONS", title: "Le Philosophe", stats: {} }, { name: "Rafael RION", title: "L'Alchimiste", stats: {} }, { name: "Faruk SAN", title: "Le connaisseur", stats: {} },
    { name: "Mme CHABCHOUB", title: "La Guide du Code Sacré", stats: { vitesse: 100, codage: 100, chance: 100 } }
];

let gameState = {
    isPlaying: false,
    score: 0,
    timer: GAME_TIME,
    playerPos: 0,
    botPos: 0,
    combo: 0,
    correctAnswers: 0,
    totalQuestions: 0
};

let timerInterval;

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    setupLobby();
    loadLeaderboard();
});

function setupLobby() {
    const select = document.getElementById('student-select');
    const img = document.getElementById('current-avatar');
    const btn = document.getElementById('start-btn');

    STUDENTS.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.seed;
        opt.textContent = s.name;
        select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
        const seed = e.target.value;
        img.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=transparent`;
        btn.disabled = false;
    });

    btn.addEventListener('click', startGame);
}

function loadLeaderboard() {
    const list = document.getElementById('leaderboard');
    // Faux scores pour remplir
    const scores = [
        { n: "Sarah B.", s: 4200 },
        { n: "Lucas M.", s: 3800 },
        { n: "Ines L.", s: 3500 },
        { n: "Enzo D.", s: 3100 },
        { n: "Thomas P.", s: 2900 }
    ];
    
    list.innerHTML = scores.map((s, i) => `
        <li class="rank-item">
            <span class="rank-pos">#${i+1}</span>
            <span class="rank-name">${s.n}</span>
            <span class="rank-score">${s.s}</span>
        </li>
    `).join('');
}

// --- GAME LOOP ---
function startGame() {
    const seed = document.getElementById('student-select').value;
    document.getElementById('player-img-game').src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
    
    document.getElementById('lobby-screen').classList.remove('active');
    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('active');

    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.timer = GAME_TIME;
    gameState.playerPos = 0;
    gameState.botPos = 0;

    loadQuestion();
    startTimer();
}

function startTimer() {
    const circle = document.getElementById('timer-circle');
    const text = document.getElementById('timer-text');
    
    timerInterval = setInterval(() => {
        gameState.timer--;
        text.textContent = gameState.timer;
        
        // Bot avance tout seul
        gameState.botPos += 1.3; // 1.3% par seconde
        updatePositions();

        // Cercle SVG animation
        const offset = 283 - (283 * gameState.timer / GAME_TIME);
        circle.style.strokeDashoffset = offset;

        if(gameState.timer <= 0 || gameState.playerPos >= 95) {
            endGame();
        }
    }, 1000);
}

function updatePositions() {
    const pLane = document.getElementById('player-racer');
    const bLane = document.getElementById('bot-racer');
    
    pLane.style.left = Math.min(gameState.playerPos, 95) + '%';
    bLane.style.left = Math.min(gameState.botPos, 95) + '%';
}

// --- QUIZ ENGINE ---
function loadQuestion() {
    const q = getQuestion(); // depuis data_questions.js
    
    document.getElementById('q-cat').textContent = q.cat;
    document.getElementById('q-text').textContent = q.q;
    
    const grid = document.getElementById('answers-grid');
    grid.innerHTML = '';

    q.a.forEach((ans, i) => {
        const btn = document.createElement('button');
        btn.className = 'ans-btn';
        btn.textContent = ans;
        btn.onclick = () => handleAnswer(i === q.ok, btn);
        grid.appendChild(btn);
    });
}

function handleAnswer(isCorrect, btn) {
    // Bloquer les clics
    const allBtns = document.querySelectorAll('.ans-btn');
    allBtns.forEach(b => b.disabled = true);

    gameState.totalQuestions++;

    if(isCorrect) {
        btn.classList.add('correct');
        gameState.correctAnswers++;
        gameState.combo++;
        
        // Calcul Score
        const points = 100 + (gameState.combo * 20);
        gameState.score += points;
        document.getElementById('score').textContent = gameState.score;

        // Avance
        gameState.playerPos += 6;

        // Effet Combo
        if(gameState.combo > 2) {
            document.querySelector('.fire-particles').classList.remove('hidden');
            document.getElementById('combo-display').classList.remove('hidden');
            document.getElementById('combo-display').textContent = `COMBO x${gameState.combo} 🔥`;
        }

    } else {
        btn.classList.add('wrong');
        gameState.combo = 0;
        document.querySelector('.fire-particles').classList.add('hidden');
        document.getElementById('combo-display').classList.add('hidden');
    }

    updatePositions();

    // Si arrivé
    if(gameState.playerPos >= 95) {
        setTimeout(endGame, 500);
    } else {
        setTimeout(loadQuestion, 600);
    }
}

function endGame() {
    clearInterval(timerInterval);
    gameState.isPlaying = false;

    const overlay = document.getElementById('overlay');
    const title = document.getElementById('end-title');
    
    overlay.classList.remove('hidden');
    
    document.getElementById('end-score').textContent = gameState.score;
    const acc = Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100) || 0;
    document.getElementById('end-acc').textContent = acc + '%';

    if(gameState.playerPos > gameState.botPos) {
        title.textContent = "VICTOIRE !";
        title.style.color = "#00C853";
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
        title.textContent = "DÉFAITE...";
        title.style.color = "#D50000";
    }
}
