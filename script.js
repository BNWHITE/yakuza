// --- CONFIGURATION ---
const PLAYER_HERO = {
    name: "KAHINA",
    img: "./images/princess.avif",
    stats: { power: 70, agility: 80, magic: 90 } // Stats pour la logique
};

// Liste des "Esprits Rivaux" (Tes images PNJ)
const ENEMIES = [
    { id: 1, name: "L'OMBRE", title: "Assassin", img: "./images/5.jpg", speed: 75 },
    { id: 2, name: "PYRO", title: "Mage Feu", img: "./images/12.jpg", speed: 65 },
    { id: 3, name: "VIPER", title: "Empoisonneuse", img: "./images/8.jpg", speed: 55 },
    { id: 4, name: "TITAN", title: "Guerrier Lourd", img: "./images/9.jpg", speed: 40 },
    { id: 5, name: "NEON", title: "Vitesse Pure", img: "./images/7.jpg", speed: 95 },
    { id: 6, name: "RONIN", title: "Sabreur", img: "./images/6.jpg", speed: 80 },
    { id: 7, name: "JINX", title: "Chaotique", img: "./images/3.jpg", speed: 70 },
    { id: 8, name: "SNIPER", title: "Oeil de Lynx", img: "./images/10.jpg", speed: 50 }
];

let selectedEnemy = null;
let playerEssence = 0;

// --- DOM ELEMENTS ---
const enemyGrid = document.getElementById('enemy-grid');
const battleBtn = document.getElementById('battle-btn');
const selectionScreen = document.getElementById('selection-screen');
const battleScreen = document.getElementById('battle-screen');
const enemyImgBattle = document.getElementById('enemy-img-battle');
const battleLog = document.getElementById('battle-log');
const playerBar = document.getElementById('player-progress');
const enemyBar = document.getElementById('enemy-progress');
const resetBtn = document.getElementById('reset-btn');
const essenceDisplay = document.getElementById('essence-display');

// --- INITIALISATION ---
function initGame() {
    renderEnemies();
}

// --- RENDU DES CARTES ENNEMIS (GRID) ---
function renderEnemies() {
    enemyGrid.innerHTML = '';
    ENEMIES.forEach(enemy => {
        // Création de la carte
        const card = document.createElement('div');
        card.classList.add('enemy-card');
        
        // Structure HTML de la carte
        card.innerHTML = `
            <div class="enemy-img-container">
                <img src="${enemy.img}" alt="${enemy.name}">
            </div>
            <div class="enemy-info">
                <div class="enemy-name">${enemy.name}</div>
                <div class="enemy-title">${enemy.title}</div>
            </div>
        `;

        // Event Listener
        card.addEventListener('click', () => selectEnemy(enemy, card));
        enemyGrid.appendChild(card);
    });
}

function selectEnemy(enemy, cardElement) {
    // Gestion visuelle de la sélection
    document.querySelectorAll('.enemy-card').forEach(c => c.classList.remove('selected'));
    cardElement.classList.add('selected');

    selectedEnemy = enemy;
    
    // Afficher le bouton de combat avec animation
    battleBtn.classList.remove('hidden');
    battleBtn.textContent = `AFFRONTER ${enemy.name}`;
}

// --- SYSTEME DE COMBAT ---
battleBtn.addEventListener('click', startBattle);
resetBtn.addEventListener('click', resetGame);

function startBattle() {
    if(!selectedEnemy) return;

    // Transition d'écran
    selectionScreen.classList.add('hidden');
    battleScreen.classList.remove('hidden');

    // Setup Combat
    enemyImgBattle.src = selectedEnemy.img;
    playerBar.style.width = '0%';
    enemyBar.style.width = '0%';
    battleLog.textContent = "LE RITUEL COMMENCE...";
    battleLog.style.color = "white";
    resetBtn.classList.add('hidden');

    // Logique de course (Simulation)
    let playerProgress = 0;
    let enemyProgress = 0;
    
    // Calcul vitesse basée sur les stats (Facteur aléatoire pour le réalisme)
    // Kahina a 80 Agilité.
    const playerSpeedBase = 0.8 + (Math.random() * 0.4); 
    const enemySpeedBase = (selectedEnemy.speed / 100) + (Math.random() * 0.3);

    const raceInterval = setInterval(() => {
        // Avancement
        playerProgress += playerSpeedBase;
        enemyProgress += enemySpeedBase;

        // Mise à jour visuelle
        playerBar.style.width = `${Math.min(playerProgress, 100)}%`;
        enemyBar.style.width = `${Math.min(enemyProgress, 100)}%`;

        // Vérification Victoire
        if (playerProgress >= 100 || enemyProgress >= 100) {
            clearInterval(raceInterval);
            endBattle(playerProgress >= 100);
        }

    }, 20); // 50fps update
}

function endBattle(playerWon) {
    resetBtn.classList.remove('hidden');
    
    if (playerWon) {
        battleLog.textContent = `VICTOIRE ! ${selectedEnemy.name} A ÉTÉ PURIFIÉ.`;
        battleLog.style.color = "#ffd700"; // Or
        battleLog.style.textShadow = "0 0 10px #ffd700";
        
        playerEssence += 100;
        essenceDisplay.textContent = playerEssence;
        triggerConfetti(); // Fonction bonus si tu veux l'ajouter plus tard
    } else {
        battleLog.textContent = "ÉCHEC DU RITUEL... RETRAITE.";
        battleLog.style.color = "#ff4d4d"; // Rouge
    }
}

function resetGame() {
    battleScreen.classList.add('hidden');
    selectionScreen.classList.remove('hidden');
    // On garde la sélection ou on reset ? Ici on garde pour rejouer vite.
}

// Lancement
initGame();
