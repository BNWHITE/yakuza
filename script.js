
// ===== KAHINA: QUIZ DE COMBAT - MOTEUR DE JEU V2 =====

class QuizCombatGame {
    constructor() {
        this.player = {
            name: "CHAMPION",
            score: 0,
            correctCount: 0,
            totalQuestions: 0,
            skipsRemaining: 3,
        };
        
        this.quiz = {
            timer: 90, // 1 minute 30 secondes
            intervalId: null,
            timeWarning: false,
            currentQuestion: null,
            isLocked: false,
        };

        this.stats = {
            bestScore: 0,
            totalCorrect: 0,
            quizzesPlayed: 0,
        };

        this.init();
    }

    init() {
        this.loadGame();
        this.bindEvents();
        this.updateUI();
        this.startBackgroundMusic();
        this.createVisualEffects();
        console.log("✅ Jeu initialisé en mode Quiz Combat.");
    }

    // --- VISUEL & AUDIO ---

    createVisualEffects() {
        // Simuler les feuilles de l'original si le container existe
        const container = document.getElementById('leaves-container');
        if (container) {
             for (let i = 0; i < 15; i++) {
                const leaf = document.createElement('div');
                leaf.className = 'leaf';
                leaf.style.left = Math.random() * 100 + '%';
                leaf.style.animationDuration = (Math.random() * 10 + 5) + 's';
                leaf.style.animationDelay = Math.random() * 5 + 's';
                container.appendChild(leaf);
            }
        }
    }

    bindEvents() {
        document.getElementById('start-quiz-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-quiz-btn').addEventListener('click', () => {
            this.hidePopup();
            this.switchScreen('auth-screen');
        });
        document.getElementById('tutorial-btn').addEventListener('click', () => this.switchScreen('rules-screen'));
        document.getElementById('start-from-rules').addEventListener('click', () => this.startGame());
        document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchScreen(e.currentTarget.dataset.target));
        });
        document.getElementById('player-name-input').addEventListener('input', (e) => {
            this.player.name = e.target.value.toUpperCase() || "CHAMPION";
            this.updateUI();
        });
    }

    switchScreen(screenId) {
        const transition = document.getElementById('screen-transition');
        transition.style.opacity = '1';
        
        setTimeout(() => {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            document.getElementById(screenId).classList.add('active');
            transition.style.opacity = '0';
        }, 300);
    }
    
    playSound(soundId) {
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Audio play failed:", e));
        }
    }

    startBackgroundMusic() {
        const music = document.getElementById('background-music');
        music.volume = 0.3;
        music.play().catch(e => console.log("Musique play failed:", e));
    }

    // --- LOGIQUE DE JEU ---

    startGame() {
        this.resetGame();
        this.switchScreen('quiz-screen');
        this.loadNextQuestion();
        this.startTimer();
        this.showCombatMessage(`⚔️ Duel lancé! 90 secondes pour l'Ascension!`);
    }

    resetGame() {
        this.player.score = 0;
        this.player.correctCount = 0;
        this.player.totalQuestions = 0;
        this.player.skipsRemaining = 3;
        this.quiz.timer = 90;
        this.quiz.timeWarning = false;
        questionsPiochées.clear(); // Vider les questions piochées
        this.updateUI();
        this.updatePlayerHealth(100);
        this.updateEnemyHealth(100);
        document.getElementById('combat-log').innerHTML = ''; // Clear log
    }

    startTimer() {
        clearInterval(this.quiz.intervalId);
        this.quiz.intervalId = setInterval(() => {
            this.quiz.timer--;
            this.updateUI();
            
            if (this.quiz.timer <= 0) {
                this.endGame();
            } else if (this.quiz.timer <= 15 && !this.quiz.timeWarning) {
                this.quiz.timeWarning = true;
                this.playSound('time-warning-sound');
                this.showCombatMessage("🚨 Attention: Le temps presse!");
            }
        }, 1000);
    }

    endGame() {
        clearInterval(this.quiz.intervalId);
        this.stats.quizzesPlayed++;
        if (this.player.score > this.stats.bestScore) {
            this.stats.bestScore = this.player.score;
        }
        this.stats.totalCorrect += this.player.correctCount;
        
        this.saveGame();
        this.showVictoryPopup();
        this.playSound('victory-sound');
    }

    // --- LOGIQUE DE QUESTION ---

    loadNextQuestion() {
        this.quiz.isLocked = false;
        const q = getQuestion(); // Utilise la fonction de data_questions.js
        this.quiz.currentQuestion = q;
        this.player.totalQuestions++;
        
        // Mise à jour de l'interface
        document.getElementById('question-category').textContent = q.cat;
        document.getElementById('question-difficulty').textContent = `POINTS: +${q.diff}`;
        document.getElementById('question-text').textContent = q.q;
        document.getElementById('current-question').textContent = this.player.totalQuestions;
        
        this.displayOptions(q);
        this.updateUI();
    }

    displayOptions(q) {
        const grid = document.getElementById('options-grid');
        grid.innerHTML = '';
        
        q.a.forEach((answer, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = answer;
            btn.dataset.index = index;
            btn.addEventListener('click', (e) => this.handleAnswer(parseInt(e.currentTarget.dataset.index)));
            grid.appendChild(btn);
        });
    }

    handleAnswer(selectedIndex) {
        if (this.quiz.isLocked) return;
        this.quiz.isLocked = true;
        
        const correctIndex = this.quiz.currentQuestion.ok;
        const isCorrect = selectedIndex === correctIndex;
        
        const options = document.querySelectorAll('.option-btn');
        options[selectedIndex].classList.add(isCorrect ? 'correct' : 'wrong');
        options[correctIndex].classList.add('correct');
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
        
        // Charger la question suivante après un court délai
        setTimeout(() => {
            this.loadNextQuestion();
        }, 1000);
    }

    handleCorrectAnswer() {
        const q = this.quiz.currentQuestion;
        this.player.score += q.diff;
        this.player.correctCount++;
        this.playSound('correct-sound');
        
        this.showCombatMessage(`✅ Bonne réponse! Vous lancez un sort de ${q.effect}! (+${q.diff} pts)`);
        this.createAttackEffect('player', 'enemy', q.effect, q.diff);
        this.updateEnemyHealth(this.getEnemyHealth() - 10); // L'ennemi "perd" de la vie de façon symbolique
        this.updateUI();
    }

    handleWrongAnswer() {
        this.playSound('wrong-sound');
        this.quiz.timer = Math.max(0, this.quiz.timer - 5); // Pénalité de 5 secondes
        
        this.showCombatMessage(`❌ Mauvaise réponse! L'ennemi contre-attaque! (-5s)`);
        this.createAttackEffect('enemy', 'player', 'counter', 0); // Contre-attaque
        this.updatePlayerHealth(this.getPlayerHealth() - 5); // Le joueur "perd" de la vie de façon symbolique
        this.updateUI();
    }
    
    skipQuestion() {
        if (this.player.skipsRemaining <= 0 || this.quiz.isLocked) {
            this.showCombatMessage("❌ Plus de passages disponibles!");
            return;
        }

        this.player.skipsRemaining--;
        this.playSound('skip-sound');
        this.showCombatMessage(`⏭️ Question passée. ${this.player.skipsRemaining} restants.`);
        this.loadNextQuestion();
    }

    // --- EFFETS VISUELS & UI ---

    createAttackEffect(from, to, type, damage) {
        const container = document.getElementById('combat-effects');
        const projectile = document.createElement('div');
        projectile.className = `projectile ${type}`;
        
        const fromRect = document.querySelector(`.${from}-combatant-quiz`).getBoundingClientRect();
        const toRect = document.querySelector(`.${to}-combatant-quiz`).getBoundingClientRect();
        
        const startX = fromRect.left + fromRect.width / 2;
        const startY = fromRect.top + fromRect.height / 2;
        const endX = toRect.left + toRect.width / 2;
        const endY = toRect.top + toRect.height / 2;
        
        projectile.style.left = startX + 'px';
        projectile.style.top = startY + 'px';
        projectile.style.setProperty('--targetX', (endX - startX) + 'px');
        projectile.style.setProperty('--targetY', (endY - startY) + 'px');
        
        container.appendChild(projectile);
        this.playSound(type + '-sound');
        
        setTimeout(() => {
            projectile.remove();
            this.createImpactEffect(to, type, damage);
            this.shakeElement(`.${to}-combatant-quiz`);
        }, 500); // Animation plus rapide
    }

    createImpactEffect(target, type, damage) {
        const container = document.getElementById('combat-effects');
        const effect = document.createElement('div');
        effect.className = `impact-effect ${type}`;
        
        const targetRect = document.querySelector(`.${target}-combatant-quiz`).getBoundingClientRect();
        effect.style.left = (targetRect.left + targetRect.width / 2) + 'px';
        effect.style.top = (targetRect.top + targetRect.height / 2) + 'px';
        
        container.appendChild(effect);
        
        if (damage > 0) {
            this.showDamageNumber(target, `+${damage}`); // Afficher le score
        } else if (type === 'counter') {
            this.showDamageNumber(target, `-5s`, '#ff6b6b'); // Afficher la pénalité
        }

        setTimeout(() => effect.remove(), 500); // Durée de l'impact
    }
    
    showDamageNumber(target, text, color = '#ffd700') {
        const combatant = document.querySelector(`.${target}-combatant-quiz`);
        const damageText = document.createElement('div');
        damageText.className = 'damage-number';
        damageText.textContent = text;
        damageText.style.color = color;
        
        // Positionner au milieu du combattant
        damageText.style.position = 'absolute';
        damageText.style.left = '50%';
        damageText.style.top = '50%';
        damageText.style.transform = 'translate(-50%, -50%)';

        combatant.appendChild(damageText);
        
        setTimeout(() => damageText.remove(), 1000);
    }
    
    shakeElement(selector) {
        const element = document.querySelector(selector);
        element.style.animation = 'shake 0.3s';
        setTimeout(() => element.style.animation = '', 300);
    }

    showCombatMessage(message) {
        const log = document.getElementById('combat-log');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
        
        // Limiter le nombre de messages
        while (log.children.length > 5) {
            log.removeChild(log.firstChild);
        }
    }
    
    showVictoryPopup() {
        const totalAccuracy = this.player.totalQuestions > 0 
            ? ((this.player.correctCount / this.player.totalQuestions) * 100).toFixed(1)
            : 0;

        document.getElementById('correct-answers').textContent = `${this.player.correctCount} bonnes réponses`;
        document.getElementById('total-score').textContent = `${this.player.score} points`;
        document.getElementById('quiz-accuracy').textContent = `${totalAccuracy}% Précision`;
        document.getElementById('victory-message').textContent = this.player.score > this.stats.bestScore ? "NOUVEAU MEILLEUR SCORE!" : "Duel terminé.";
        
        document.getElementById('victory-popup').classList.add('active');
    }

    hidePopup() {
        document.getElementById('victory-popup').classList.remove('active');
    }

    // --- GESTION DES BARRES DE VIE (Symbolique) ---
    
    // Ces fonctions gèrent les barres comme une barre de progression symbolique.
    // L'ennemi perd de la 'vie' (progression) à chaque bonne réponse.
    // Le joueur perd de la 'vie' (progression) à chaque mauvaise réponse.

    updatePlayerHealth(percent) {
        document.getElementById('player-hp-fill').style.width = `${percent}%`;
    }
    
    updateEnemyHealth(percent) {
        document.getElementById('enemy-hp-fill').style.width = `${percent}%`;
    }
    
    getPlayerHealth() {
        return parseFloat(document.getElementById('player-hp-fill').style.width);
    }
    
    getEnemyHealth() {
        return parseFloat(document.getElementById('enemy-hp-fill').style.width);
    }


    // --- SAUVEGARDE & UI ---

    updateUI() {
        document.getElementById('timer').textContent = this.quiz.timer;
        document.getElementById('current-score').textContent = this.player.score;
        document.getElementById('correct-count').textContent = this.player.correctCount;
        document.getElementById('skips-remaining').textContent = this.player.skipsRemaining;
        document.getElementById('combat-player-name').textContent = this.player.name;
        
        // Stats Écran d'accueil
        document.getElementById('best-score').textContent = this.stats.bestScore;
        document.getElementById('total-correct').textContent = this.stats.totalCorrect;
        document.getElementById('quizzes-played').textContent = this.stats.quizzesPlayed;
    }

    saveGame() {
        const saveData = {
            bestScore: this.stats.bestScore,
            totalCorrect: this.stats.totalCorrect,
            quizzesPlayed: this.stats.quizzesPlayed,
            playerName: this.player.name 
        };
        localStorage.setItem('kahina_quiz_combat_save', JSON.stringify(saveData));
    }

    loadGame() {
        const saveData = localStorage.getItem('kahina_quiz_combat_save');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.stats.bestScore = data.bestScore || 0;
            this.stats.totalCorrect = data.totalCorrect || 0;
            this.stats.quizzesPlayed = data.quizzesPlayed || 0;
            this.player.name = data.playerName || "CHAMPION";
            document.getElementById('player-name-input').value = this.player.name;
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérification de la présence de la librairie Supabase pour éviter les erreurs, même si la logique est retirée
    if (typeof supabase === 'undefined') {
        window.supabase = { createClient: () => null };
    }
    window.game = new QuizCombatGame();
});
