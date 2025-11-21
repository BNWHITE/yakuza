// ===== KAHINA: QUIZ DE L'ASCENSION - JAVASCRIPT COMPLET =====

class KahinaQuiz {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.timeLeft = 90;
        this.timer = null;
        this.skipsRemaining = 3;
        this.playerName = '';
        this.usedQuestions = new Set();
        this.isAnswering = false;
        this.totalQuestionsAnswered = 0;
        
        this.initializeElements();
        this.loadQuestions();
        this.loadStats();
        this.setupEventListeners();
    }

    initializeElements() {
        // Screens
        this.authScreen = document.getElementById('auth-screen');
        this.quizScreen = document.getElementById('quiz-screen');
        this.rulesScreen = document.getElementById('rules-screen');
        this.victoryPopup = document.getElementById('victory-popup');

        // Auth elements
        this.playerNameInput = document.getElementById('player-name-input');
        this.startQuizBtn = document.getElementById('start-quiz-btn');
        this.tutorialBtn = document.getElementById('tutorial-btn');
        this.startFromRulesBtn = document.getElementById('start-from-rules');

        // Quiz elements
        this.timerDisplay = document.getElementById('timer');
        this.currentScoreDisplay = document.getElementById('current-score');
        this.currentQuestionDisplay = document.getElementById('current-question');
        this.correctCountDisplay = document.getElementById('correct-count');
        this.timeFill = document.getElementById('time-fill');
        this.questionText = document.getElementById('question-text');
        this.questionCategory = document.getElementById('question-category');
        this.questionDifficulty = document.getElementById('question-difficulty');
        this.optionsGrid = document.getElementById('options-grid');
        this.skipBtn = document.getElementById('skip-btn');
        this.skipsRemainingDisplay = document.getElementById('skips-remaining');
        this.feedbackArea = document.getElementById('feedback-area');
        this.feedbackMessage = document.getElementById('feedback-message');

        // Stats elements
        this.bestScoreDisplay = document.getElementById('best-score');
        this.totalCorrectDisplay = document.getElementById('total-correct');
        this.quizzesPlayedDisplay = document.getElementById('quizzes-played');

        // Victory popup elements
        this.correctAnswersDisplay = document.getElementById('correct-answers');
        this.totalScoreDisplay = document.getElementById('total-score');
        this.quizRankDisplay = document.getElementById('quiz-rank');
        this.victoryMessage = document.getElementById('victory-message');
        this.restartQuizBtn = document.getElementById('restart-quiz-btn');

        // Effects containers
        this.leavesContainer = document.getElementById('leaves-container');
        this.quizEffects = document.getElementById('quiz-effects');
        this.screenTransition = document.getElementById('screen-transition');

        // Audio elements
        this.audioElements = {
            correct: document.getElementById('correct-sound'),
            wrong: document.getElementById('wrong-sound'),
            skip: document.getElementById('skip-sound'),
            timeWarning: document.getElementById('time-warning-sound'),
            victory: document.getElementById('victory-sound'),
            fire: document.getElementById('fire-sound'),
            water: document.getElementById('water-sound'),
            lightning: document.getElementById('lightning-sound'),
            nature: document.getElementById('nature-sound'),
            background: document.getElementById('background-music')
        };
    }

    loadQuestions() {
        // Base de données de 1000 questions de culture générale
        this.questions = [
            // Histoire
            {
                question: "En quelle année a eu lieu la Révolution française ?",
                options: ["1789", "1799", "1776", "1815"],
                correct: 0,
                category: "Histoire",
                difficulty: "easy"
            },
            {
                question: "Qui était le premier empereur de Rome ?",
                options: ["Jules César", "Auguste", "Néron", "Caligula"],
                correct: 1,
                category: "Histoire",
                difficulty: "medium"
            },
            {
                question: "Quelle civilisation a construit les pyramides de Gizeh ?",
                options: ["Les Grecs", "Les Romains", "Les Égyptiens", "Les Mayas"],
                correct: 2,
                category: "Histoire",
                difficulty: "easy"
            },
            {
                question: "En quelle année Christophe Colomb a-t-il découvert l'Amérique ?",
                options: ["1492", "1502", "1488", "1510"],
                correct: 0,
                category: "Histoire",
                difficulty: "easy"
            },
            {
                question: "Qui a peint la Joconde ?",
                options: ["Michel-Ange", "Raphaël", "Léonard de Vinci", "Botticelli"],
                correct: 2,
                category: "Arts",
                difficulty: "easy"
            },
            {
                question: "Quelle est la capitale de l'Australie ?",
                options: ["Sydney", "Melbourne", "Canberra", "Perth"],
                correct: 2,
                category: "Géographie",
                difficulty: "medium"
            },
            {
                question: "Combien de côtés a un hexagone ?",
                options: ["5", "6", "7", "8"],
                correct: 1,
                category: "Mathématiques",
                difficulty: "easy"
            },
            {
                question: "Quel est l'élément chimique représenté par le symbole 'Au' ?",
                options: ["Argent", "Or", "Aluminium", "Argon"],
                correct: 1,
                category: "Sciences",
                difficulty: "medium"
            },
            {
                question: "Qui a écrit '1984' ?",
                options: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "H.G. Wells"],
                correct: 1,
                category: "Littérature",
                difficulty: "medium"
            },
            {
                question: "Quelle planète est surnommée 'la planète rouge' ?",
                options: ["Vénus", "Mars", "Jupiter", "Saturne"],
                correct: 1,
                category: "Sciences",
                difficulty: "easy"
            },
            {
                question: "Quel est le plus grand océan du monde ?",
                options: ["Atlantique", "Indien", "Pacifique", "Arctique"],
                correct: 2,
                category: "Géographie",
                difficulty: "easy"
            },
            {
                question: "Combien de joueurs y a-t-il dans une équipe de football ?",
                options: ["9", "10", "11", "12"],
                correct: 2,
                category: "Sports",
                difficulty: "easy"
            },
            {
                question: "Qui a composé la Symphonie n°5 ?",
                options: ["Mozart", "Beethoven", "Bach", "Chopin"],
                correct: 1,
                category: "Musique",
                difficulty: "medium"
            },
            {
                question: "Quelle est la langue la plus parlée au monde ?",
                options: ["Anglais", "Espagnol", "Mandarin", "Hindi"],
                correct: 2,
                category: "Culture Générale",
                difficulty: "medium"
            },
            {
                question: "Quel animal est le plus grand mammifère du monde ?",
                options: ["Éléphant", "Girafe", "Baleine bleue", "Rhinocéros"],
                correct: 2,
                category: "Sciences",
                difficulty: "easy"
            },
            {
                question: "En quelle année a été fondée l'Organisation des Nations Unies ?",
                options: ["1919", "1945", "1950", "1939"],
                correct: 1,
                category: "Histoire",
                difficulty: "medium"
            },
            {
                question: "Quel est le plus long fleuve du monde ?",
                options: ["Nil", "Amazone", "Mississippi", "Yangtsé"],
                correct: 1,
                category: "Géographie",
                difficulty: "hard"
            },
            {
                question: "Qui a découvert la pénicilline ?",
                options: ["Marie Curie", "Alexander Fleming", "Louis Pasteur", "Robert Koch"],
                correct: 1,
                category: "Sciences",
                difficulty: "medium"
            },
            {
                question: "Combien de temps la Terre met-elle pour faire une révolution autour du Soleil ?",
                options: ["24 heures", "30 jours", "365 jours", "7 jours"],
                correct: 2,
                category: "Sciences",
                difficulty: "easy"
            },
            {
                question: "Quelle est la monnaie officielle du Japon ?",
                options: ["Yuan", "Won", "Yen", "Ringgit"],
                correct: 2,
                category: "Économie",
                difficulty: "easy"
            },
            // ... Ajouter 980 questions supplémentaires ici
        ];

        // Si vous avez besoin de plus de questions, vous pouvez les ajouter ici
        // ou les charger depuis un fichier externe
    }

    loadStats() {
        const stats = JSON.parse(localStorage.getItem('kahinaQuizStats')) || {
            bestScore: 0,
            totalCorrect: 0,
            quizzesPlayed: 0
        };
        
        this.bestScoreDisplay.textContent = stats.bestScore;
        this.totalCorrectDisplay.textContent = stats.totalCorrect;
        this.quizzesPlayedDisplay.textContent = stats.quizzesPlayed;
    }

    saveStats() {
        const stats = {
            bestScore: Math.max(this.score, parseInt(this.bestScoreDisplay.textContent)),
            totalCorrect: parseInt(this.totalCorrectDisplay.textContent) + this.correctAnswers,
            quizzesPlayed: parseInt(this.quizzesPlayedDisplay.textContent) + 1
        };
        
        localStorage.setItem('kahinaQuizStats', JSON.stringify(stats));
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                this.showScreen(target);
            });
        });

        // Boutons d'action
        this.startQuizBtn.addEventListener('click', () => this.startQuiz());
        this.tutorialBtn.addEventListener('click', () => this.showScreen('rules-screen'));
        this.startFromRulesBtn.addEventListener('click', () => this.startQuiz());
        this.restartQuizBtn.addEventListener('click', () => this.restartQuiz());

        // Sauter une question
        this.skipBtn.addEventListener('click', () => this.skipQuestion());

        // Entrée du nom
        this.playerNameInput.addEventListener('input', (e) => {
            this.playerName = e.target.value || 'CHAMPION';
        });

        // Effets sonores
        Object.values(this.audioElements).forEach(audio => {
            audio.volume = 0.5;
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    startQuiz() {
        this.playerName = this.playerNameInput.value || 'CHAMPION';
        this.score = 0;
        this.correctAnswers = 0;
        this.timeLeft = 90;
        this.skipsRemaining = 3;
        this.usedQuestions.clear();
        this.totalQuestionsAnswered = 0;
        this.isAnswering = false;

        this.showScreen('quiz-screen');
        this.updateDisplay();
        this.startTimer();
        this.loadRandomQuestion();
        this.createLeaves();
        
        // Démarrer la musique de fond
        this.audioElements.background.play().catch(e => console.log('Audio play failed:', e));
    }

    startTimer() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.endQuiz();
            } else if (this.timeLeft <= 10) {
                this.timerDisplay.classList.add('time-critical');
                if (this.timeLeft === 10) {
                    this.audioElements.timeWarning.play().catch(e => console.log('Audio play failed:', e));
                }
            } else if (this.timeLeft <= 30) {
                this.timerDisplay.classList.add('time-warning');
            }
        }, 1000);
    }

    updateTimer() {
        this.timerDisplay.textContent = this.timeLeft;
        const percentage = (this.timeLeft / 90) * 100;
        this.timeFill.style.width = `${percentage}%`;
    }

    updateDisplay() {
        this.currentScoreDisplay.textContent = this.score;
        this.currentQuestionDisplay.textContent = this.totalQuestionsAnswered + 1;
        this.correctCountDisplay.textContent = this.correctAnswers;
        this.skipsRemainingDisplay.textContent = this.skipsRemaining;
    }

    loadRandomQuestion() {
        if (this.questions.length === 0) {
            console.error('Aucune question disponible');
            return;
        }

        // Filtrer les questions non utilisées
        const availableQuestions = this.questions.filter((_, index) => !this.usedQuestions.has(index));
        
        if (availableQuestions.length === 0) {
            // Réutiliser les questions si toutes ont été utilisées
            this.usedQuestions.clear();
            this.loadRandomQuestion();
            return;
        }

        // Choisir une question aléatoire
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const questionIndex = this.questions.indexOf(availableQuestions[randomIndex]);
        this.currentQuestionIndex = questionIndex;
        this.usedQuestions.add(questionIndex);

        this.displayQuestion(this.questions[questionIndex]);
    }

    displayQuestion(question) {
        this.questionText.textContent = question.question;
        this.questionCategory.textContent = question.category;
        this.questionDifficulty.textContent = question.difficulty;
        this.questionDifficulty.className = `difficulty-badge ${question.difficulty}`;

        this.optionsGrid.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];

        question.options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'option-btn';
            optionBtn.innerHTML = `
                <span class="option-letter">${letters[index]}</span>
                <span class="option-text">${option}</span>
            `;
            
            optionBtn.addEventListener('click', () => this.selectAnswer(index));
            this.optionsGrid.appendChild(optionBtn);
        });

        this.isAnswering = false;
        this.hideFeedback();
    }

    selectAnswer(selectedIndex) {
        if (this.isAnswering) return;
        
        this.isAnswering = true;
        this.totalQuestionsAnswered++;
        
        const question = this.questions[this.currentQuestionIndex];
        const optionButtons = this.optionsGrid.querySelectorAll('.option-btn');
        
        // Désactiver tous les boutons
        optionButtons.forEach(btn => btn.disabled = true);
        
        // Marquer la bonne réponse
        optionButtons[question.correct].classList.add('correct');
        
        if (selectedIndex === question.correct) {
            // Bonne réponse
            optionButtons[selectedIndex].classList.add('correct');
            this.handleCorrectAnswer(question.difficulty);
        } else {
            // Mauvaise réponse
            optionButtons[selectedIndex].classList.add('incorrect');
            this.handleIncorrectAnswer();
        }
        
        // Passer à la question suivante après un délai
        setTimeout(() => {
            this.loadRandomQuestion();
            this.updateDisplay();
        }, 2000);
    }

    handleCorrectAnswer(difficulty) {
        let points = 0;
        switch (difficulty) {
            case 'easy': points = 10; break;
            case 'medium': points = 20; break;
            case 'hard': points = 30; break;
        }
        
        // Bonus de rapidité
        if (this.timeLeft > 60) points += 5;
        
        this.score += points;
        this.correctAnswers++;
        
        this.showFeedback(`Bonne réponse ! +${points} points`, 'correct');
        this.audioElements.correct.play().catch(e => console.log('Audio play failed:', e));
        this.createEffect('correct');
    }

    handleIncorrectAnswer() {
        this.showFeedback('Mauvaise réponse', 'incorrect');
        this.audioElements.wrong.play().catch(e => console.log('Audio play failed:', e));
        this.createEffect('incorrect');
    }

    skipQuestion() {
        if (this.skipsRemaining > 0 && !this.isAnswering) {
            this.skipsRemaining--;
            this.totalQuestionsAnswered++;
            
            this.showFeedback('Question passée', 'skip');
            this.audioElements.skip.play().catch(e => console.log('Audio play failed:', e));
            
            setTimeout(() => {
                this.loadRandomQuestion();
                this.updateDisplay();
            }, 1000);
        }
    }

    showFeedback(message, type) {
        this.feedbackMessage.textContent = message;
        this.feedbackMessage.className = `feedback-message ${type}`;
        this.feedbackArea.style.display = 'flex';
    }

    hideFeedback() {
        this.feedbackArea.style.display = 'none';
    }

    createEffect(type) {
        const effects = {
            correct: ['fire', 'water', 'lightning', 'nature'],
            incorrect: ['fire']
        };
        
        const effectTypes = effects[type] || effects.correct;
        const effectType = effectTypes[Math.floor(Math.random() * effectTypes.length)];
        
        const effect = document.createElement('div');
        effect.className = `quiz-effect effect-${effectType}`;
        effect.style.left = `${Math.random() * 80 + 10}%`;
        effect.style.top = `${Math.random() * 80 + 10}%`;
        
        this.quizEffects.appendChild(effect);
        
        // Jouer le son correspondant
        if (this.audioElements[`${effectType}-sound`]) {
            this.audioElements[`${effectType}-sound`].play().catch(e => console.log('Audio play failed:', e));
        }
        
        // Supprimer l'effet après l'animation
        setTimeout(() => {
            effect.remove();
        }, 2000);
    }

    createLeaves() {
        // Créer des feuilles tombantes pour l'ambiance
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const leaf = document.createElement('div');
                leaf.className = 'leaf';
                leaf.style.left = `${Math.random() * 100}%`;
                leaf.style.animationDuration = `${Math.random() * 3 + 2}s`;
                this.leavesContainer.appendChild(leaf);
                
                setTimeout(() => leaf.remove(), 5000);
            }, i * 500);
        }
    }

    endQuiz() {
        clearInterval(this.timer);
        this.audioElements.background.pause();
        this.audioElements.victory.play().catch(e => console.log('Audio play failed:', e));
        
        this.showVictoryPopup();
        this.saveStats();
    }

    showVictoryPopup() {
        this.correctAnswersDisplay.textContent = `${this.correctAnswers} bonnes réponses`;
        this.totalScoreDisplay.textContent = `${this.score} points`;
        
        // Déterminer le rang
        let rank = 'Débutant';
        if (this.score >= 300) rank = 'Maître';
        else if (this.score >= 200) rank = 'Expert';
        else if (this.score >= 100) rank = 'Intermédiaire';
        
        this.quizRankDisplay.textContent = rank;
        
        // Message personnalisé
        let message = 'Temps écoulé ! ';
        if (this.correctAnswers === this.totalQuestionsAnswered) {
            message += 'Performance parfaite ! 🎯';
        } else if (this.correctAnswers >= this.totalQuestionsAnswered * 0.7) {
            message += 'Excellent travail ! ⭐';
        } else if (this.correctAnswers >= this.totalQuestionsAnswered * 0.5) {
            message += 'Bon effort ! 👍';
        } else {
            message += 'Continuez à vous entraîner ! 💪';
        }
        
        this.victoryMessage.textContent = message;
        this.victoryPopup.classList.add('active');
    }

    restartQuiz() {
        this.victoryPopup.classList.remove('active');
        this.startQuiz();
    }
}

// Initialiser le jeu quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    new KahinaQuiz();
});

// Gestionnaire pour empêcher le zoom sur mobile
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);
