// ===== KAHINA: ASCENSION - MOTEUR DE JEU COMPLET =====

class KahinaGame {
    constructor() {
        this.supabase = null;
        this.player = {
            id: null,
            name: "GARDIENNE",
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            hp: 100,
            maxHp: 100,
            mana: 50,
            maxMana: 50,
            essence: 0,
            gold: 0,
            victories: 0,
            stats: {
                attack: 15,
                defense: 8,
                magic: 12
            },
            skills: ['attack', 'fireball', 'heal', 'lightning'],
            inventory: [],
            currentQuest: {
                name: "Purification de la Vallée",
                target: 3,
                current: 0,
                reward: { xp: 150, essence: 75, gold: 50 }
            }
        };

        this.currentEnemy = null;
        this.currentZone = "vallee";
        this.gameState = "auth";
        this.combatActive = false;
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.vibrationEnabled = true;
        this.tutorialStep = 0;

        this.init();
    }

    async init() {
        await this.initializeSupabase();
        this.createVisualEffects();
        this.bindEvents();
        this.loadGame();
        this.updateUI();
        this.startBackgroundMusic();
    }

    async initializeSupabase() {
        try {
            this.supabase = supabase.createClient(
                'https://dxiefxcfnggezuiifeqf.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4aWVmeGNmbmdnZXp1aWlmZXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ2ODg2MzQsImV4cCI6MjAyMDI2NDYzNH0.3kPr5Ydqc-Nd2lZdR1d1VtYVYAOUc7mA0U3VcTGTbR8'
            );
            console.log("✅ Supabase initialisé");
        } catch (error) {
            console.log("❌ Supabase en mode hors ligne");
        }
    }

    createVisualEffects() {
        this.createLeaves();
        this.createBirds();
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

    createBirds() {
        const container = document.getElementById('birds-container');
        for (let i = 0; i < 3; i++) {
            const bird = document.createElement('div');
            bird.className = 'bird';
            bird.textContent = '🐦';
            bird.style.left = Math.random() * 100 + '%';
            bird.style.top = Math.random() * 50 + '%';
            bird.style.animationDuration = (Math.random() * 20 + 10) + 's';
            bird.style.animationDelay = Math.random() * 5 + 's';
            container.appendChild(bird);
        }
    }

    bindEvents() {
        // Écran d'accueil
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('tutorial-btn').addEventListener('click', () => this.showTutorial());
        
        // Tutoriel
        document.getElementById('next-step').addEventListener('click', () => this.nextTutorialStep());
        document.getElementById('prev-step').addEventListener('click', () => this.prevTutorialStep());
        document.getElementById('start-adventure').addEventListener('click', () => this.startAdventure());
        
        // Carte monde
        document.getElementById('explore-btn').addEventListener('click', () => this.exploreZone());
        
        // Combat
        document.getElementById('flee-btn').addEventListener('click', () => this.fleeCombat());
        document.querySelectorAll('.skill-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skill = e.currentTarget.dataset.skill;
                this.useSkill(skill);
            });
        });

        // Navigation
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.target;
                this.switchScreen(target);
            });
        });

        // Menu
        document.getElementById('menu-toggle').addEventListener('click', () => this.toggleMenu());
        document.getElementById('close-menu').addEventListener('click', () => this.toggleMenu());
        document.getElementById('menu-overlay').addEventListener('click', () => this.toggleMenu());

        // Navigation menu
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showMenuSection(section);
            });
        });

        // Zones interactives
        this.setupZoneInteractions();

        // Entrée nom joueur
        document.getElementById('player-name-input').addEventListener('input', (e) => {
            this.player.name = e.target.value.toUpperCase() || "GARDIENNE";
            this.updateUI();
        });

        // Bouton victoire
        document.getElementById('continue-btn-popup').addEventListener('click', () => {
            this.hideVictoryPopup();
            this.switchScreen('enemy-select');
        });

        // Bouton rafraîchir ennemis
        document.getElementById('refresh-enemies-btn').addEventListener('click', () => {
            this.refreshEnemies();
        });

        // Paramètres
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('music-toggle').addEventListener('change', (e) => {
            this.musicEnabled = e.target.checked;
            this.saveSettings();
            if (this.musicEnabled) {
                this.startBackgroundMusic();
            } else {
                document.getElementById('background-music').pause();
            }
        });

        document.getElementById('vibration-toggle').addEventListener('change', (e) => {
            this.vibrationEnabled = e.target.checked;
            this.saveSettings();
        });

        // Effet d'eau sur la carte
        document.getElementById('map-container').addEventListener('click', (e) => {
            this.createWaterEffect(e.clientX, e.clientY);
        });

        console.log("✅ Tous les événements liés");
    }

    setupZoneInteractions() {
        const zones = document.querySelectorAll('.zone');
        
        zones.forEach(zone => {
            // Double écouteur pour mobile/desktop
            zone.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleZoneClick(zone);
            });
            
            zone.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleZoneClick(zone);
            });
        });

        console.log("✅ Zones interactives initialisées");
    }

    handleZoneClick(zone) {
        if (zone.classList.contains('locked-zone')) {
            this.showMessage("🔒 Zone verrouillée - Niveau requis non atteint");
            return;
        }

        const zoneType = zone.dataset.zone;
        console.log(`🎯 Zone sélectionnée: ${zoneType}`);

        switch(zoneType) {
            case 'vallee':
                this.selectValleeZone();
                break;
            case 'foret':
                this.showMessage("🌳 Forêt Hurlante - Bientôt disponible!");
                break;
            case 'montagnes':
                this.showMessage("🏔️ Montagnes Maudites - Bientôt disponible!");
                break;
        }
    }

    selectValleeZone() {
        this.currentZone = "vallee";
        this.switchScreen('enemy-select');
        this.showValleeEnemies();
        this.updateQuestProgress();
        this.showMessage("🌿 Bienvenue dans la Vallée des Larmes! Choisissez un ennemi à affronter.");
    }

    showValleeEnemies() {
        console.log("🔄 Affichage des ennemis de la Vallée des Larmes");
        
        const grid = document.getElementById('enemy-grid');
        if (!grid) {
            console.error("❌ Element enemy-grid non trouvé");
            return;
        }

        // Vider la grille
        grid.innerHTML = '';

        // Ennemis pour la Vallée des Larmes
        const valleeEnemies = [
            {
                id: 1,
                name: "Gobelin Corrompu",
                type: "gobelin",
                image_url: "./images/2.png",
                level: 2,
                hp: 80,
                max_hp: 80,
                attack: 12,
                defense: 5,
                xp_reward: 100,
                essence_reward: 50,
                gold_reward: 25
            },
            {
                id: 2,
                name: "Loup Spectral", 
                type: "loup",
                image_url: "./images/3.png",
                level: 3,
                hp: 100,
                max_hp: 100,
                attack: 15,
                defense: 6,
                xp_reward: 120,
                essence_reward: 60,
                gold_reward: 30
            },
            {
                id: 3,
                name: "Esprit Tourmenté",
                type: "esprit",
                image_url: "./images/4.png",
                level: 4,
                hp: 70,
                max_hp: 70,
                attack: 20,
                defense: 3,
                xp_reward: 150,
                essence_reward: 75,
                gold_reward: 40
            }
        ];

        valleeEnemies.forEach(enemy => {
            const card = this.createEnemyCard(enemy);
            grid.appendChild(card);
        });

        console.log(`✅ ${valleeEnemies.length} ennemis affichés`);
    }

    createEnemyCard(enemy) {
        const card = document.createElement('div');
        card.className = 'enemy-card';
        card.dataset.enemy = enemy.type;
        
        card.innerHTML = `
            <div class="enemy-image">
                <img src="${enemy.image_url}" alt="${enemy.name}" 
                     onerror="this.src='https://images.unsplash.com/photo-1570303345338-e1f0eddf4946?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'">
                <div class="enemy-level">Niv. ${enemy.level}</div>
            </div>
            <div class="enemy-info">
                <h3>${enemy.name}</h3>
                <div class="enemy-stats">
                    <span class="stat">❤️ ${enemy.hp}</span>
                    <span class="stat">⚔️ ${enemy.attack}</span>
                    <span class="stat">🛡️ ${enemy.defense}</span>
                </div>
                <div class="enemy-rewards">
                    <small>Récompenses: ✨${enemy.essence_reward} ⭐${enemy.xp_reward}</small>
                </div>
            </div>
            <div class="select-overlay">
                <div class="combat-prompt">
                    <button class="action-btn primary combat-btn" data-enemy="${enemy.type}">
                        <span class="btn-icon">⚔️</span>
                        COMBATTRE
                    </button>
                    <p class="combat-hint">Cliquez pour affronter cet ennemi</p>
                </div>
            </div>
        `;
        
        // Ajouter l'écouteur d'événement
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`🎯 Début combat contre: ${enemy.name}`);
            this.startCombat(enemy);
        });

        return card;
    }

    startCombat(enemyData) {
        if (!enemyData) {
            console.error("❌ Données ennemi manquantes");
            return;
        }

        this.currentEnemy = {
            ...enemyData,
            hp: enemyData.hp,
            maxHp: enemyData.max_hp,
            currentHp: enemyData.hp
        };

        this.combatActive = true;
        
        console.log(`⚔️ Combat contre: ${this.currentEnemy.name}`);
        
        // Mise à jour interface combat
        const enemyImg = document.getElementById('enemy-img');
        const enemyName = document.getElementById('enemy-name');
        const enemyLevel = document.getElementById('enemy-level');
        const enemyHp = document.getElementById('enemy-hp');
        const enemyMaxHp = document.getElementById('enemy-max-hp');

        if (enemyImg) enemyImg.src = this.currentEnemy.image_url;
        if (enemyName) enemyName.textContent = this.currentEnemy.name;
        if (enemyLevel) enemyLevel.textContent = `Niv. ${this.currentEnemy.level}`;
        if (enemyHp) enemyHp.textContent = this.currentEnemy.hp;
        if (enemyMaxHp) enemyMaxHp.textContent = this.currentEnemy.maxHp;
        
        // Réinitialiser le joueur pour le combat
        this.player.hp = this.player.maxHp;
        this.player.mana = this.player.maxMana;
        
        this.updateCombatUI();
        this.switchScreen('combat-screen');
        
        this.showCombatMessage(`⚔️ Un ${this.currentEnemy.name} apparaît!`);
        this.playSound('magic-sound');
    }

    useSkill(skill) {
        if (!this.combatActive || this.player.hp <= 0) return;

        let message = "";
        let damage = 0;
        let manaCost = 0;

        switch(skill) {
            case 'attack':
                damage = this.calculateDamage(this.player.stats.attack, this.currentEnemy.defense);
                message = `⚔️ Frappe! ${damage} dégâts!`;
                this.createProjectile('player', 'enemy', 'sword');
                this.playSound('sword-sound');
                break;
                
            case 'fireball':
                manaCost = 15;
                if (this.player.mana >= manaCost) {
                    this.player.mana -= manaCost;
                    damage = this.calculateDamage(this.player.stats.magic + 10, this.currentEnemy.defense);
                    message = `🔥 Boule de feu! ${damage} dégâts!`;
                    this.createProjectile('player', 'enemy', 'fire');
                    this.playSound('magic-sound');
                } else {
                    this.showCombatMessage("❌ Pas assez de mana!");
                    return;
                }
                break;
                
            case 'heal':
                manaCost = 20;
                if (this.player.mana >= manaCost) {
                    this.player.mana -= manaCost;
                    const healAmount = 30;
                    this.player.hp = Math.min(this.player.hp + healAmount, this.player.maxHp);
                    message = `💚 Soin! +${healAmount} PV!`;
                    this.createHealEffect();
                    this.playSound('heal-sound');
                } else {
                    this.showCombatMessage("❌ Pas assez de mana!");
                    return;
                }
                break;
                
            case 'lightning':
                manaCost = 30;
                if (this.player.mana >= manaCost) {
                    this.player.mana -= manaCost;
                    damage = this.calculateDamage(this.player.stats.magic + 20, this.currentEnemy.defense);
                    message = `⚡ Foudre! ${damage} dégâts!`;
                    this.createLightningEffect();
                    this.playSound('lightning-sound');
                } else {
                    this.showCombatMessage("❌ Pas assez de mana!");
                    return;
                }
                break;
        }

        if (damage > 0) {
            this.currentEnemy.hp -= damage;
            this.showDamageNumber('enemy', damage);
            this.shakeElement('.enemy-combatant');
            this.playSound('hit-sound');
        }

        this.showCombatMessage(message);
        this.updateCombatUI();

        if (this.currentEnemy.hp <= 0) {
            this.endCombat(true);
            return;
        }

        setTimeout(() => this.enemyTurn(), 1500);
    }

    enemyTurn() {
        if (!this.combatActive || this.currentEnemy.hp <= 0) return;

        const damage = this.calculateDamage(this.currentEnemy.attack, this.player.stats.defense);
        this.player.hp -= damage;
        
        this.showCombatMessage(`💀 ${this.currentEnemy.name} attaque! ${damage} dégâts!`);
        this.showDamageNumber('player', damage);
        this.createProjectile('enemy', 'player', 'dark');
        this.shakeElement('.player-combatant');
        this.playSound('hit-sound');
        
        this.updateCombatUI();

        if (this.player.hp <= 0) {
            this.endCombat(false);
        }
    }

    calculateDamage(attack, defense) {
        const baseDamage = Math.max(1, attack - (defense * 0.5));
        const variance = baseDamage * 0.3;
        const finalDamage = baseDamage + (Math.random() * variance * 2 - variance);
        return Math.round(finalDamage);
    }

    endCombat(victory) {
        this.combatActive = false;
        
        if (victory) {
            const xpGained = this.currentEnemy.xp_reward;
            const essenceGained = this.currentEnemy.essence_reward;
            const goldGained = this.currentEnemy.gold_reward;
            
            this.player.xp += xpGained;
            this.player.essence += essenceGained;
            this.player.gold += goldGained;
            this.player.victories++;
            
            // Mise à jour quête
            if (this.player.currentQuest && this.currentEnemy.type === 'gobelin') {
                this.player.currentQuest.current++;
            }
            
            this.showVictoryPopup(xpGained, essenceGained, goldGained);
            this.playSound('victory-sound');
            this.createVictoryEffect();
            
            this.checkLevelUp();
            this.updateQuestProgress();
        } else {
            this.showCombatMessage("💔 Défaite...");
            this.player.hp = this.player.maxHp;
            this.player.mana = this.player.maxMana;
            this.playSound('defeat-sound');
            
            setTimeout(() => {
                this.switchScreen('enemy-select');
            }, 3000);
        }

        this.saveGame();
    }

    showVictoryPopup(xp, essence, gold) {
        const popup = document.getElementById('victory-popup');
        const rewards = document.getElementById('victory-rewards');
        const message = document.getElementById('victory-message');
        
        rewards.innerHTML = `
            <div class="reward-item">
                <span class="reward-icon">⭐</span>
                <span class="reward-text">+${xp} XP</span>
            </div>
            <div class="reward-item">
                <span class="reward-icon">✨</span>
                <span class="reward-text">+${essence} Essence</span>
            </div>
            <div class="reward-item">
                <span class="reward-icon">💰</span>
                <span class="reward-text">+${gold} Or</span>
            </div>
        `;
        
        if (message) {
            message.textContent = `Vous avez vaincu le ${this.currentEnemy.name}!`;
        }
        
        popup.classList.add('active');
    }

    hideVictoryPopup() {
        document.getElementById('victory-popup').classList.remove('active');
    }

    checkLevelUp() {
        if (this.player.xp >= this.player.xpToNextLevel) {
            this.player.level++;
            this.player.xp -= this.player.xpToNextLevel;
            this.player.xpToNextLevel = Math.floor(this.player.xpToNextLevel * 1.5);
            
            this.player.maxHp += 20;
            this.player.maxMana += 10;
            this.player.stats.attack += 2;
            this.player.stats.defense += 1;
            this.player.stats.magic += 2;
            
            this.player.hp = this.player.maxHp;
            this.player.mana = this.player.maxMana;
            
            this.showMessage(`🎉 NIVEAU ${this.player.level} ATTEINT!`);
            this.updateUI();
        }
    }

    fleeCombat() {
        if (Math.random() > 0.3) {
            this.showCombatMessage("🏃 Fuite réussie!");
            this.combatActive = false;
            setTimeout(() => this.switchScreen('enemy-select'), 1000);
        } else {
            this.showCombatMessage("❌ Fuite échouée!");
            this.enemyTurn();
        }
    }

    exploreZone() {
        const zoneName = this.getZoneName(this.currentZone);
        this.showMessage(`🗺️ Vous explorez la ${zoneName}... Découvrez de nouveaux ennemis!`);
    }

    refreshEnemies() {
        this.showMessage("🔄 Appel de renforts ennemis...");
        setTimeout(() => {
            this.showValleeEnemies();
            this.showMessage("🎯 De nouveaux adversaires arrivent!");
        }, 1000);
    }

    updateQuestProgress() {
        const progress = this.player.currentQuest.current;
        const target = this.player.currentQuest.target;
        const percent = (progress / target) * 100;
        
        const progressText = document.getElementById('quest-progress');
        const progressBar = document.getElementById('quest-progress-bar');
        const menuProgress = document.getElementById('menu-quest-progress');
        
        if (progressText) {
            progressText.textContent = `${progress}/${target} ennemis vaincus`;
        }
        
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
        
        if (menuProgress) {
            menuProgress.textContent = `${progress}/${target} complété`;
        }
    }

    // EFFETS VISUELS
    createProjectile(from, to, type) {
        const container = document.getElementById('projectile-container');
        const projectile = document.createElement('div');
        projectile.className = `projectile ${type}`;
        
        const fromRect = document.querySelector(`.${from}-combatant`).getBoundingClientRect();
        const toRect = document.querySelector(`.${to}-combatant`).getBoundingClientRect();
        
        const startX = fromRect.left + fromRect.width / 2;
        const startY = fromRect.top + fromRect.height / 2;
        const endX = toRect.left + toRect.width / 2;
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
                container.appendChild(sparkle);
                
                setTimeout(() => sparkle.remove(), 2000);
            }, i * 200);
        }
    }

    createWaterEffect(x, y) {
        const effect = document.getElementById('water-effect');
        effect.style.left = (x - 25) + 'px';
        effect.style.top = (y - 25) + 'px';
        effect.style.opacity = '1';
        effect.style.transform = 'scale(0)';
        
        this.playSound('water-sound');
        
        setTimeout(() => {
            effect.style.transform = 'scale(3)';
            effect.style.opacity = '0';
        }, 10);
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
        
        if (this.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(200);
        }
    }

    // TUTORIEL
    showTutorial() {
        document.getElementById('tutorial-overlay').classList.add('active');
        this.tutorialStep = 0;
        this.updateTutorial();
    }

    updateTutorial() {
        const steps = document.querySelectorAll('.tutorial-step');
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === this.tutorialStep);
        });

        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        const startBtn = document.getElementById('start-adventure');

        prevBtn.style.display = this.tutorialStep === 0 ? 'none' : 'flex';
        nextBtn.style.display = this.tutorialStep === steps.length - 1 ? 'none' : 'flex';
        startBtn.style.display = this.tutorialStep === steps.length - 1 ? 'flex' : 'none';
    }

    nextTutorialStep() {
        if (this.tutorialStep < 2) {
            this.tutorialStep++;
            this.updateTutorial();
        }
    }

    prevTutorialStep() {
        if (this.tutorialStep > 0) {
            this.tutorialStep--;
            this.updateTutorial();
        }
    }

    startAdventure() {
        document.getElementById('tutorial-overlay').classList.remove('active');
        this.startGame();
    }

    // AUDIO
    playSound(soundId) {
        if (!this.soundEnabled) return;
        
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Audio:", e));
        }
    }

    startBackgroundMusic() {
        if (this.musicEnabled) {
            const music = document.getElementById('background-music');
            music.volume = 0.3;
            music.play().catch(e => console.log("Musique:", e));
        }
    }

    // INTERFACE
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

    toggleMenu() {
        const menu = document.getElementById('side-menu');
        const overlay = document.getElementById('menu-overlay');
        
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        
        if (menu.classList.contains('active')) {
            this.showMenuSection('inventory');
        }
    }

    showMenuSection(section) {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        document.querySelectorAll('.menu-section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        document.getElementById(`${section}-section`).classList.add('active');
    }

    updateUI() {
        document.getElementById('display-username').textContent = this.player.name;
        document.getElementById('quick-essence').textContent = this.player.essence;
        document.getElementById('quick-level').textContent = this.player.level;
        document.getElementById('quick-victories').textContent = this.player.victories;
        document.getElementById('menu-player-name').textContent = this.player.name;
        document.getElementById('menu-level').textContent = this.player.level;
        document.getElementById('menu-xp').textContent = `${this.player.xp}/${this.player.xpToNextLevel}`;
        document.getElementById('menu-essence').textContent = this.player.essence;
        document.getElementById('avatar-level').textContent = this.player.level;
        
        this.updateQuestProgress();
    }

    updateCombatUI() {
        const playerHpPercent = (this.player.hp / this.player.maxHp) * 100;
        const playerManaPercent = (this.player.mana / this.player.maxMana) * 100;
        const enemyHpPercent = (this.currentEnemy.hp / this.currentEnemy.maxHp) * 100;
        
        document.getElementById('player-health').style.width = playerHpPercent + '%';
        document.getElementById('player-mana').style.width = playerManaPercent + '%';
        document.getElementById('enemy-health').style.width = enemyHpPercent + '%';
        
        document.getElementById('player-hp').textContent = this.player.hp;
        document.getElementById('player-max-hp').textContent = this.player.maxHp;
        document.getElementById('player-mp').textContent = this.player.mana;
        document.getElementById('player-max-mp').textContent = this.player.maxMana;
        document.getElementById('enemy-hp').textContent = this.currentEnemy.hp;
        document.getElementById('enemy-max-hp').textContent = this.currentEnemy.maxHp;
        document.getElementById('current-hp').textContent = this.player.hp;
        document.getElementById('current-mana').textContent = this.player.mana;
        document.getElementById('combat-player-name').textContent = this.player.name;
    }

    showMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: #ffd700;
            padding: 1rem 2rem;
            border-radius: 10px;
            border: 1px solid #ffd700;
            z-index: 1000;
            animation: fadeInOut 3s ease;
            text-align: center;
            max-width: 90%;
            font-family: 'Cinzel', serif;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

    showCombatMessage(message) {
        const log = document.getElementById('combat-log');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
        
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
            currentZone: this.currentZone,
            settings: {
                sound: this.soundEnabled,
                music: this.musicEnabled,
                vibration: this.vibrationEnabled
            }
        };
        localStorage.setItem('kahina_save', JSON.stringify(saveData));
    }

    loadGame() {
        const saveData = localStorage.getItem('kahina_save');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.player = { ...this.player, ...data.player };
            this.currentZone = data.currentZone;
            
            if (data.settings) {
                this.soundEnabled = data.settings.sound;
                this.musicEnabled = data.settings.music;
                this.vibrationEnabled = data.settings.vibration;
                
                document.getElementById('sound-toggle').checked = this.soundEnabled;
                document.getElementById('music-toggle').checked = this.musicEnabled;
                document.getElementById('vibration-toggle').checked = this.vibrationEnabled;
            }
        }
    }

    saveSettings() {
        this.saveGame();
    }

    async startGame() {
        const name = document.getElementById('player-name-input').value.trim();
        this.player.name = name || "GARDIENNE";
        
        try {
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('players')
                    .insert([{
                        name: this.player.name,
                        level: this.player.level,
                        xp: this.player.xp,
                        essence: this.player.essence,
                        created_at: new Date()
                    }])
                    .select();

                if (data && data[0]) {
                    this.player.id = data[0].id;
                }
            }
        } catch (error) {
            console.log("Mode hors ligne activé");
        }

        this.showMessage(`✨ Bienvenue, ${this.player.name}!`);
        this.switchScreen('world-map');
        this.saveGame();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.game = new KahinaGame();
});
