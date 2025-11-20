/* LOGIQUE JEU V3 - CLASSROOM LEAGUE */

// Config
const GAME_TIME = 60;
const STUDENTS = [
    { id: 1, name: "Lucas M.", seed: "Lucas" },
    { id: 2, name: "Sarah B.", seed: "Sarah" },
    { id: 3, name: "Enzo D.", seed: "Enzo" },
    { id: 4, name: "Ines L.", seed: "Ines" },
    { id: 5, name: "Thomas P.", seed: "Thomas" },
    { id: 6, name: "Léa F.", seed: "Lea" },
    { id: 7, name: "Alex K.", seed: "Alex" },
    { id: 8, name: "Julie A.", seed: "Julie" }
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
