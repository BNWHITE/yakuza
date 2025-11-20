// ===== KAHINA: SAUVEZ LA REINE - MOTEUR DE JEU MOBILE =====

class KahinaGame {
    constructor() {
        this.player = {
            name: "GARDIENNE",
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            hp: 100,
            maxHp: 100,
            mana: 50,
            maxMana: 50,
            essence: 0,
            stats: {
                attack: 15,
                defense: 8,
                magic: 12
            }
        };

        this.currentEnemy = null;
        this.currentZone = "vallee";
        this.gameState = "auth";
        this.combatActive = false;

        this.initializeGame();
    }

    initializeGame() {
        this.createLeaves();
        this.bindEvents();
        this.loadGame();
        this.updateUI();
    }

    createLeaves() {
        const container = document.getElementById('leaves-container');
        for (let i = 0; i < 15; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'leaf';
            leaf.style.left = Math.random() * 100 + '%';
            leaf.style.animationDuration = (Math.random() * 10 + 5) + 's';
            leaf.style.animationDelay = Math.random() * 5 + 's';
            container.appendChild(leaf);
        }
    }

    bindEvents() {
        // Navigation
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('continue-btn').addEventListener('click', () => this.continueGame());
        document.getElementById('explore-btn').addEventListener('click', () => this.exploreZone());
        document.getElementById('flee-btn').addEventListener('click', () => this.fleeCombat());
        
        // Menu
        document.getElementById('menu-toggle').addEventListener('click', () => this.toggleMenu());
        document.getElementById('close-menu').addEventListener('click', () => this.toggleMenu());
        document.getElementById('menu-overlay').addEventListener('click', () => this.toggleMenu());

        // Compétences de combat
        document.querySelectorAll('.skill-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skill = e.currentTarget.dataset.skill;
                this.useSkill(skill);
            });
        });

        // Sélection d'ennemis
        document.querySelectorAll('.combat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const enemyType = e.currentTarget.dataset.enemy;
                this.startCombat(enemyType);
            });
        });

        // Navigation entre écrans
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.target;
                this.switchScreen(target);
            });
        });

        // Entrée du nom
        document.getElementById('player-name-input').addEventListener('input', (e) => {
            this.player.name = e.target.value.toUpperCase() || "GARDIENNE";
            this.updateUI();
        });

        // Zones interactives
        document.querySelectorAll('.zone').forEach(zone => {
            zone.addEventListener('click', (e) => {
                if (!zone.classList.contains('locked-zone')) {
                    this.selectZone(zone.dataset.zone);
                }
            });
        });
    }

    startGame() {
        const name = document.getElementById('player-name-input').value.trim();
        this.player.name = name || "GARDIENNE";
        
        this.showMessage(`Bienvenue, ${this.player.name}! L'aventure commence...`);
        this.switchScreen('world-map');
        this.saveGame();
    }

    continueGame() {
        this.switchScreen('world-map');
        this.showMessage(`Bienvenue de retour, ${this.player.name}!`);
    }

    selectZone(zone) {
        this.currentZone = zone;
        document.getElementById('zone-name').textContent = this.getZoneName(zone);
        this.switchScreen('enemy-select');
    }

    exploreZone() {
        this.showMessage(`Vous explorez la ${this.getZoneName(this.currentZone)}...`);
        // Ici on pourrait ajouter des événements aléatoires
    }

    startCombat(enemyType) {
        this.currentEnemy = this.createEnemy(enemyType);
        this.combatActive = true;
        
        // Mise à jour de l'interface de combat
        document.getElementById('enemy-img').src = this.currentEnemy.image;
        document.getElementById('enemy-name').textContent = this.currentEnemy.name;
        document.getElementById('enemy-hp').textContent = this.currentEnemy.hp;
        
        this.updateCombatUI();
        this.switchScreen('combat-screen');
        
        this.showCombatMessage(`Un ${this.currentEnemy.name} apparaît!`);
    }

    createEnemy(type) {
        const enemies = {
            gobelin: {
                name: "Gobelin Corrompu",
                image: "./images/5.jpg",
                hp: 80,
                maxHp: 80,
                attack: 12,
                defense: 5,
                xp: 50
            },
            orc: {
                name: "Orc Brute",
                image: "./images/9.jpg",
                hp: 120,
                maxHp: 120,
                attack: 15,
                defense: 8,
                xp: 80
            },
            mage: {
                name: "Mage Noir",
                image: "./images/12.jpg",
                hp: 70,
                maxHp: 70,
                attack: 25,
                defense: 3,
                xp: 100
            }
        };

        return { ...enemies[type] };
    }

    useSkill(skill) {
        if (!this.combatActive || this.player.hp <= 0) return;

        let message = "";
        let damage = 0;

        switch(skill) {
            case 'attack':
                damage = this.calculateDamage(this.player.stats.attack, this.currentEnemy.defense);
                message = `Vous attaquez et infligez ${damage} dégâts!`;
                this.createProjectile('player', 'enemy', 'sword');
                break;
                
            case 'fireball':
                if (this.player.mana >= 15) {
                    this.player.mana -= 15;
                    damage = this.calculateDamage(this.player.stats.magic + 10, this.currentEnemy.defense);
                    message = `Boule de feu! ${damage} dégâts magiques!`;
                    this.createProjectile('player', 'enemy', 'fire');
                } else {
                    this.showCombatMessage("Pas assez de mana!");
                    return;
                }
                break;
                
            case 'heal':
                if (this.player.mana >= 20) {
                    this.player.mana -= 20;
                    const healAmount = 30;
                    this.player.hp = Math.min(this.player.hp + healAmount, this.player.maxHp);
                    message = `Vous vous soignez de ${healAmount} PV!`;
                    this.createHealEffect();
                } else {
                    this.showCombatMessage("Pas assez de mana!");
                    return;
                }
                break;
                
            case 'lightning':
                if (this.player.mana >= 30) {
                    this.player.mana -= 30;
                    damage = this.calculateDamage(this.player.stats.magic + 20, this.currentEnemy.defense);
                    message = `Foudre! ${damage} dégâts électriques!`;
                    this.createLightningEffect();
                } else {
                    this.showCombatMessage("Pas assez de mana!");
                    return;
                }
                break;
        }

        if (damage > 0) {
            this.currentEnemy.hp -= damage;
            this.showDamageNumber('enemy', damage);
            this.shakeElement('.enemy-combatant');
        }

        this.showCombatMessage(message);
        this.updateCombatUI();

        // Vérifier si l'ennemi est vaincu
        if (this.currentEnemy.hp <= 0) {
            this.endCombat(true);
            return;
        }

        // Tour de l'ennemi
        setTimeout(() => this.enemyTurn(), 1500);
    }

    enemyTurn() {
        if (!this.combatActive || this.currentEnemy.hp <= 0) return;

        const damage = this.calculateDamage(this.currentEnemy.attack, this.player.stats.defense);
        this.player.hp -= damage;
        
        this.showCombatMessage(`${this.currentEnemy.name} vous attaque et inflige ${damage} dégâts!`);
        this.showDamageNumber('player', damage);
        this.createProjectile('enemy', 'player', 'dark');
        this.shakeElement('.player-combatant');
        
        this.updateCombatUI();

        // Vérifier si le joueur est vaincu
        if (this.player.hp <= 0) {
            this.endCombat(false);
        }
    }

    calculateDamage(attack, defense) {
        const baseDamage = attack - defense / 2;
        const variance = baseDamage * 0.3;
        const finalDamage = Math.max(1, baseDamage + (Math.random() * variance * 2 - variance));
        return Math.round(finalDamage);
    }

    endCombat(victory) {
        this.combatActive = false;
        
        if (victory) {
            const xpGained = this.currentEnemy.xp;
            this.player.xp += xpGained;
            this.player.essence += Math.floor(xpGained / 2);
            
            this.showCombatMessage(`Victoire! +${xpGained} XP et +${Math.floor(xpGained/2)} Essence!`);
            this.checkLevelUp();
            
            // Effet de victoire
            this.createVictoryEffect();
        } else {
            this.showCombatMessage("Défaite... Vous perdez de l'essence.");
            this.player.essence = Math.max(0, this.player.essence - 20);
            this.player.hp = this.player.maxHp; // Reset HP après défaite
        }

        this.saveGame();
        
        setTimeout(() => {
            this.switchScreen('enemy-select');
        }, 3000);
    }

    fleeCombat() {
        if (Math.random() > 0.3) { // 70% de chance de fuite
            this.showCombatMessage("Vous fuyez le combat!");
            this.combatActive = false;
            setTimeout(() => this.switchScreen('enemy-select'), 1000);
        } else {
            this.showCombatMessage("Fuite échouée!");
            this.enemyTurn();
        }
    }

    checkLevelUp() {
        if (this.player.xp >= this.player.xpToNextLevel) {
            this.player.level++;
            this.player.xp -= this.player.xpToNextLevel;
            this.player.xpToNextLevel = Math.floor(this.player.xpToNextLevel * 1.5);
            
            // Amélioration des stats
            this.player.maxHp += 20;
            this.player.maxMana += 10;
            this.player.stats.attack += 2;
            this.player.stats.defense += 1;
            this.player.stats.magic += 2;
            
            // Soin complet
            this.player.hp = this.player.maxHp;
            this.player.mana = this.player.maxMana;
            
            this.showMessage(`🎉 NIVEAU ${this.player.level} ATTEINT!`);
            this.updateUI();
        }
    }

    // EFFETS VISUELS
    createProjectile(from, to, type) {
        const container = document.getElementById('projectile-container');
        const projectile = document.createElement('div');
        projectile.className = `projectile ${type}`;
        
        const fromRect = document.querySelector(`.${from}-combatant`).getBoundingClientRect();
        const toRect = document.querySelector(`.${to}-combatant`).getBoundingClientRect();
        
        const startX = from === 'player' ? fromRect.right : fromRect.left;
        const startY = fromRect.top + fromRect.height / 2;
        const endX = to === 'player' ? toRect.left : toRect.right;
        const endY = toRect.top + toRect.height / 2;
        
        projectile.style.left = startX + 'px';
        projectile.style.top = startY + 'px';
        projectile.style.setProperty('--targetX', (endX - startX) + 'px');
        projectile.style.setProperty('--targetY', (endY - startY) + 'px');
        
        container.appendChild(projectile);
        
        setTimeout(() => {
            projectile.remove();
            this.createImpactEffect(to, type);
        }, 800);
    }

    createImpactEffect(target, type) {
        const container = document.getElementById('effect-overlay');
        const effect = document.createElement('div');
        effect.className = `impact-effect ${type}`;
        
        const targetRect = document.querySelector(`.${target}-combatant`).getBoundingClientRect();
        effect.style.left = (targetRect.left + targetRect.width / 2) + 'px';
        effect.style.top = (targetRect.top + targetRect.height / 2) + 'px';
        
        container.appendChild(effect);
        
        setTimeout(() => effect.remove(), 1000);
    }

    createHealEffect() {
        const container = document.getElementById('effect-overlay');
        const effect = document.createElement('div');
        effect.className = 'heal-effect';
        
        const playerRect = document.querySelector('.player-combatant').getBoundingClientRect();
        effect.style.left = (playerRect.left + playerRect.width / 2) + 'px';
        effect.style.top = (playerRect.top + playerRect.height / 2) + 'px';
        
        container.appendChild(effect);
        
        setTimeout(() => effect.remove(), 1500);
    }

    createLightningEffect() {
        const container = document.getElementById('effect-overlay');
        const effect = document.createElement('div');
        effect.className = 'lightning-effect';
        
        const enemyRect = document.querySelector('.enemy-combatant').getBoundingClientRect();
        effect.style.left = (enemyRect.left + enemyRect.width / 2) + 'px';
        effect.style.top = enemyRect.top + 'px';
        
        container.appendChild(effect);
        
        setTimeout(() => effect.remove(), 1000);
    }

    createVictoryEffect() {
        const container = document.getElementById('effect-overlay');
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'victory-sparkle';
                sparkle.style.left = Math.random() * 100 + '%';
                sparkle.style.top = Math.random() * 100 + '%';
                sparkle.style.animationDelay = Math.random() * 1 + 's';
                container.appendChild(sparkle);
                
                setTimeout(() => sparkle.remove(), 2000);
            }, i * 200);
        }
    }

    showDamageNumber(target, amount) {
        const combatant = document.querySelector(`.${target}-combatant`);
        const damageText = document.createElement('div');
        damageText.className = 'damage-number';
        damageText.textContent = `-${amount}`;
        damageText.style.color = target === 'player' ? '#ff6b6b' : '#4ecdc4';
        
        combatant.appendChild(damageText);
        
        setTimeout(() => {
            damageText.style.transform = 'translateY(-50px)';
            damageText.style.opacity = '0';
        }, 100);
        
        setTimeout(() => damageText.remove(), 1000);
    }

    shakeElement(selector) {
        const element = document.querySelector(selector);
        element.style.animation = 'shake 0.5s';
        setTimeout(() => element.style.animation = '', 500);
    }

    // INTERFACE UTILISATEUR
    switchScreen(screenId) {
        // Transition entre écrans
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

    toggleMenu() {
        const menu = document.getElementById('side-menu');
        const overlay = document.getElementById('menu-overlay');
        
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    updateUI() {
        // Mise à jour des informations du joueur
        document.getElementById('display-username').textContent = this.player.name;
        document.getElementById('quick-essence').textContent = this.player.essence;
        document.getElementById('quick-level').textContent = this.player.level;
        document.getElementById('menu-player-name').textContent = this.player.name;
        document.getElementById('menu-level').textContent = this.player.level;
        document.getElementById('menu-essence').textContent = this.player.essence;
    }

    updateCombatUI() {
        // Mise à jour des barres de vie et mana
        const playerHpPercent = (this.player.hp / this.player.maxHp) * 100;
        const playerManaPercent = (this.player.mana / this.player.maxMana) * 100;
        const enemyHpPercent = (this.currentEnemy.hp / this.currentEnemy.maxHp) * 100;
        
        document.getElementById('player-health').style.width = playerHpPercent + '%';
        document.getElementById('player-mana').style.width = playerManaPercent + '%';
        document.getElementById('enemy-health').style.width = enemyHpPercent + '%';
        
        document.getElementById('player-hp').textContent = this.player.hp;
        document.getElementById('player-mp').textContent = this.player.mana;
        document.getElementById('enemy-hp').textContent = this.currentEnemy.hp;
        document.getElementById('current-hp').textContent = this.player.hp;
    }

    showMessage(message) {
        // Créer une notification temporaire
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: #ffd700;
            padding: 1rem 2rem;
            border-radius: 10px;
            border: 1px solid #ffd700;
            z-index: 1000;
            animation: fadeInOut 3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showCombatMessage(message) {
        const log = document.getElementById('combat-log');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
        
        // Garder seulement les 5 derniers messages
        while (log.children.length > 5) {
            log.removeChild(log.firstChild);
        }
    }

    getZoneName(zone) {
        const names = {
            vallee: "Vallée des Larmes",
            foret: "Forêt Hurlante",
            montagnes: "Montagnes Maudites"
        };
        return names[zone] || "Zone Inconnue";
    }

    // SAUVEGARDE
    saveGame() {
        const saveData = {
            player: this.player,
            currentZone: this.currentZone
        };
        localStorage.setItem('kahina_save', JSON.stringify(saveData));
    }

    loadGame() {
        const saveData = localStorage.getItem('kahina_save');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.player = { ...this.player, ...data.player };
            this.currentZone = data.currentZone;
        }
    }
}

// Initialisation du jeu
document.addEventListener('DOMContentLoaded', () => {
    window.game = new KahinaGame();
});

// Styles CSS dynamiques pour les animations
const style = document.createElement('style');
style.textContent = `
    .projectile {
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        animation: projectile 0.8s linear forwards;
        z-index: 15;
    }
    
    .projectile.sword {
        background: radial-gradient(circle, #fff, #4ecdc4);
        box-shadow: 0 0 10px #4ecdc4;
    }
    
    .projectile.fire {
        background: radial-gradient(circle, #ff6b6b, #ffd700);
        box-shadow: 0 0 15px #ff6b6b;
    }
    
    .projectile.dark {
        background: radial-gradient(circle, #6c5ce7, #2d3436);
        box-shadow: 0 0 10px #6c5ce7;
    }
    
    .impact-effect {
        position: absolute;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        animation: explode 0.6s ease-out forwards;
        z-index: 16;
    }
    
    .impact-effect.sword {
        background: radial-gradient(circle, transparent 30%, #4ecdc4 70%);
    }
    
    .impact-effect.fire {
        background: radial-gradient(circle, transparent 30%, #ff6b6b 70%);
    }
    
    .impact-effect.dark {
        background: radial-gradient(circle, transparent 30%, #6c5ce7 70%);
    }
    
    .heal-effect {
        position: absolute;
        width: 100px;
        height: 100px;
        background: radial-gradient(circle, transparent 30%, #00b894 70%);
        border-radius: 50%;
        animation: healPulse 1.5s ease-out forwards;
        z-index: 16;
    }
    
    .lightning-effect {
        position: absolute;
        width: 5px;
        height: 200px;
        background: linear-gradient(to bottom, transparent, #ffeaa7, transparent);
        animation: lightningStrike 0.3s ease-out forwards;
        z-index: 16;
    }
    
    .victory-sparkle {
        position: absolute;
        width: 10px;
        height: 10px;
        background: #ffd700;
        border-radius: 50%;
        animation: sparkleFloat 2s ease-out forwards;
        z-index: 16;
    }
    
    .damage-number {
        position: absolute;
        font-size: 1.5rem;
        font-weight: bold;
        transition: all 1s ease;
        z-index: 17;
    }
    
    @keyframes healPulse {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
    }
    
    @keyframes lightningStrike {
        0% { transform: scaleY(0); opacity: 1; }
        100% { transform: scaleY(1); opacity: 0; }
    }
    
    @keyframes sparkleFloat {
        0% { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-100px) scale(0); opacity: 0; }
    }
    
    @keyframes fadeInOut {
        0%, 100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
`;
document.head.appendChild(style);
