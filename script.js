class KahinaGame {
    constructor() {
        this.supabase = null;
        this.player = {
            id: null,
            name: "GARDIENNE",
            email: null,
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            hp: 100,
            maxHp: 100,
            mana: 50,
            maxMana: 50,
            essence: 0,
            gold: 0,
            stats: {
                attack: 15,
                defense: 8,
                magic: 12,
                speed: 10
            },
            skills: ['attack', 'fireball', 'heal', 'lightning'],
            inventory: [],
            achievements: []
        };

        this.currentEnemy = null;
        this.currentZone = "vallee";
        this.gameState = "auth";
        this.combatActive = false;
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.vibrationEnabled = true;

        this.initializeSupabase();
        this.initializeGame();
    }

    async initializeSupabase() {
        // Configuration Supabase
        this.supabase = supabase.createClient(
            'https://dxiefxcfnggezuiifeqf.supabase.co',
            
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4aWVmeGNmbmdnZXp1aWlmZXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ2ODg2MzQsImV4cCI6MjAyMDI2NDYzNH0.3kPr5Ydqc-Nd2lZdR1d1VtYVYAOUc7mA0U3VcTGTbR8'
        );

        console.log("Supabase initialisé");
    }

    initializeGame() {
        this.createLeaves();
        this.bindEvents();
        this.loadGame();
        this.updateUI();
        this.loadEnemies();
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

        // Navigation menu
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showMenuSection(section);
            });
        });

        // Compétences de combat
        document.querySelectorAll('.skill-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skill = e.currentTarget.dataset.skill;
                this.useSkill(skill);
            });
        });

        // Sélection d'ennemis
        document.addEventListener('click', (e) => {
            if (e.target.closest('.enemy-card')) {
                const enemyCard = e.target.closest('.enemy-card');
                const enemyType = enemyCard.dataset.enemy;
                this.startCombat(enemyType);
            }
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

        // Paramètres
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('music-toggle').addEventListener('change', (e) => {
            this.musicEnabled = e.target.checked;
            if (this.musicEnabled) {
                document.getElementById('background-music').play();
            } else {
                document.getElementById('background-music').pause();
            }
            this.saveSettings();
        });

        document.getElementById('vibration-toggle').addEventListener('change', (e) => {
            this.vibrationEnabled = e.target.checked;
            this.saveSettings();
        });
    }

    async loadEnemies() {
        try {
            // Charger depuis Supabase
            const { data: enemies, error } = await this.supabase
                .from('enemies')
                .select('*')
                .eq('zone', this.currentZone);

            if (error) throw error;

            if (enemies && enemies.length > 0) {
                this.enemiesData = enemies;
                this.updateEnemyGrid();
            } else {
                // Données par défaut si Supabase vide
                this.enemiesData = [
                    {
                        id: 1,
                        name: "Gobelin Corrompu",
                        type: "gobelin",
                        image_url: "https://images.unsplash.com/photo-1570303345338-e1f0eddf4946?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
                        level: 2,
                        hp: 80,
                        max_hp: 80,
                        attack: 12,
                        defense: 5,
                        xp_reward: 50,
                        essence_reward: 25
                    },
                    {
                        id: 2,
                        name: "Orc Brute",
                        type: "orc",
                        image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
                        level: 3,
                        hp: 120,
                        max_hp: 120,
                        attack: 15,
                        defense: 8,
                        xp_reward: 80,
                        essence_reward: 40
                    },
                    {
                        id: 3,
                        name: "Mage Noir",
                        type: "mage",
                        image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
                        level: 4,
                        hp: 70,
                        max_hp: 70,
                        attack: 25,
                        defense: 3,
                        xp_reward: 100,
                        essence_reward: 50
                    }
                ];
                this.updateEnemyGrid();
            }
        } catch (error) {
            console.error("Erreur chargement ennemis:", error);
            this.loadDefaultEnemies();
        }
    }

    loadDefaultEnemies() {
        this.enemiesData = [
            {
                id: 1,
                name: "Gobelin Corrompu",
                type: "gobelin",
                image_url: "https://images.unsplash.com/photo-1570303345338-e1f0eddf4946?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
                level: 2,
                hp: 80,
                max_hp: 80,
                attack: 12,
                defense: 5,
                xp_reward: 50,
                essence_reward: 25
            }
        ];
        this.updateEnemyGrid();
    }

    updateEnemyGrid() {
        const grid = document.getElementById('enemy-grid');
        grid.innerHTML = '';

        this.enemiesData.forEach(enemy => {
            const card = document.createElement('div');
            card.className = 'enemy-card';
            card.dataset.enemy = enemy.type;
            
            card.innerHTML = `
                <div class="enemy-image">
                    <img src="${enemy.image_url}" alt="${enemy.name}" onerror="this.src='https://images.unsplash.com/photo-1570303345338-e1f0eddf4946?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'">
                    <div class="enemy-level">Niv. ${enemy.level}</div>
                </div>
                <div class="enemy-info">
                    <h3>${enemy.name}</h3>
                    <div class="enemy-stats">
                        <span class="stat">❤️ ${enemy.hp}</span>
                        <span class="stat">⚔️ ${enemy.attack}</span>
                        <span class="stat">🛡️ ${enemy.defense}</span>
                    </div>
                </div>
                <div class="select-overlay">
                    <button class="action-btn small combat-btn" data-enemy="${enemy.type}">
                        COMBATTRE
                    </button>
                </div>
            `;
            
            grid.appendChild(card);
        });
    }

    async startGame() {
        const name = document.getElementById('player-name-input').value.trim();
        this.player.name = name || "GARDIENNE";
        
        try {
            // Sauvegarder le joueur dans Supabase
            const { data, error } = await this.supabase
                .from('players')
                .insert([
                    {
                        name: this.player.name,
                        level: this.player.level,
                        xp: this.player.xp,
                        essence: this.player.essence,
                        created_at: new Date()
                    }
                ])
                .select();

            if (error) throw error;

            if (data && data[0]) {
                this.player.id = data[0].id;
                this.showMessage(`Bienvenue, ${this.player.name}! Votre aventure commence...`);
                this.switchScreen('world-map');
                this.saveGame();
                this.updateLeaderboard();
            }
        } catch (error) {
            console.error("Erreur création joueur:", error);
            this.showMessage(`Bienvenue, ${this.player.name}! (Mode hors ligne)`);
            this.switchScreen('world-map');
        }
    }

    async continueGame() {
        try {
            // Charger les données du joueur depuis Supabase
            const { data: players, error } = await this.supabase
                .from('players')
                .select('*')
                .eq('name', this.player.name)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (players && players[0]) {
                const savedPlayer = players[0];
                this.player.id = savedPlayer.id;
                this.player.level = savedPlayer.level;
                this.player.xp = savedPlayer.xp;
                this.player.essence = savedPlayer.essence;
                
                this.showMessage(`Bienvenue de retour, ${this.player.name}!`);
                this.switchScreen('world-map');
                this.updateUI();
            } else {
                this.showMessage("Aucune sauvegarde trouvée. Démarrage d'une nouvelle aventure!");
                this.startGame();
            }
        } catch (error) {
            console.error("Erreur chargement joueur:", error);
            this.showMessage("Mode hors ligne - Chargement local");
            this.loadLocalGame();
        }
    }

    selectZone(zone) {
        this.currentZone = zone;
        document.getElementById('zone-name').textContent = this.getZoneName(zone);
        this.loadEnemies();
        this.switchScreen('enemy-select');
    }

    exploreZone() {
        this.showMessage(`Vous explorez la ${this.getZoneName(this.currentZone)}...`);
        // Événements aléatoires à implémenter
    }

    startCombat(enemyType) {
        const enemyData = this.enemiesData.find(e => e.type === enemyType);
        if (!enemyData) return;

        this.currentEnemy = {
            ...enemyData,
            hp: enemyData.hp,
            maxHp: enemyData.max_hp
        };

        this.combatActive = true;
        
        // Mise à jour de l'interface de combat
        document.getElementById('enemy-img').src = this.currentEnemy.image_url;
        document.getElementById('enemy-name').textContent = this.currentEnemy.name;
        document.getElementById('enemy-level').textContent = `Niv. ${this.currentEnemy.level}`;
        document.getElementById('enemy-hp').textContent = this.currentEnemy.hp;
        document.getElementById('enemy-max-hp').textContent = this.currentEnemy.maxHp;
        document.getElementById('combat-player-name').textContent = this.player.name;
        
        this.updateCombatUI();
        this.switchScreen('combat-screen');
        
        this.showCombatMessage(`Un ${this.currentEnemy.name} apparaît!`);
        this.playSound('magic-sound');
    }

    useSkill(skill) {
        if (!this.combatActive || this.player.hp <= 0) return;

        let message = "";
        let damage = 0;
        let manaCost = 0;

        switch(skill) {
            case 'attack':
                manaCost = 0;
                damage = this.calculateDamage(this.player.stats.attack, this.currentEnemy.defense);
                message = `Vous attaquez et infligez ${damage} dégâts!`;
                this.createProjectile('player', 'enemy', 'sword');
                this.playSound('sword-sound');
                break;
                
            case 'fireball':
                manaCost = 15;
                if (this.player.mana >= manaCost) {
                    this.player.mana -= manaCost;
                    damage = this.calculateDamage(this.player.stats.magic + 10, this.currentEnemy.defense);
                    message = `Boule de feu! ${damage} dégâts magiques!`;
                    this.createProjectile('player', 'enemy', 'fire');
                    this.playSound('magic-sound');
                } else {
                    this.showCombatMessage("Pas assez de mana!");
                    return;
                }
                break;
                
            case 'heal':
                manaCost = 20;
                if (this.player.mana >= manaCost) {
                    this.player.mana -= manaCost;
                    const healAmount = 30;
                    this.player.hp = Math.min(this.player.hp + healAmount, this.player.maxHp);
                    message = `Vous vous soignez de ${healAmount} PV!`;
                    this.createHealEffect();
                    this.playSound('heal-sound');
                } else {
                    this.showCombatMessage("Pas assez de mana!");
                    return;
                }
                break;
                
            case 'lightning':
                manaCost = 30;
                if (this.player.mana >= manaCost) {
                    this.player.mana -= manaCost;
                    damage = this.calculateDamage(this.player.stats.magic + 20, this.currentEnemy.defense);
                    message = `Foudre! ${damage} dégâts électriques!`;
                    this.createLightningEffect();
                    this.playSound('lightning-sound');
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
            this.playSound('hit-sound');
        }

        this.showCombatMessage(message);
        this.updateCombatUI();

        // Vérifier si l'ennemi est vaincu
        if (this.currentEnemy.hp <= 0) {
            this.endCombat(true);
            return;
        }

        // Tour de l'ennemi après délai
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
        this.playSound('hit-sound');
        
        this.updateCombatUI();

        // Vérifier si le joueur est vaincu
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

    async endCombat(victory) {
        this.combatActive = false;
        
        if (victory) {
            const xpGained = this.currentEnemy.xp_reward;
            const essenceGained = this.currentEnemy.essence_reward;
            
            this.player.xp += xpGained;
            this.player.essence += essenceGained;
            
            this.showCombatMessage(`Victoire! +${xpGained} XP et +${essenceGained} Essence!`);
            this.playSound('victory-sound');
            this.createVictoryEffect();
            
            // Sauvegarder les récompenses
            await this.savePlayerProgress();
            this.checkLevelUp();
        } else {
            this.showCombatMessage("Défaite... Vous perdez de l'essence.");
            this.player.essence = Math.max(0, this.player.essence - 20);
            this.player.hp = this.player.maxHp;
            this.playSound('defeat-sound');
        }

        this.saveGame();
        
        setTimeout(() => {
            this.switchScreen('enemy-select');
        }, 3000);
    }

    async savePlayerProgress() {
        if (!this.player.id) return;

        try {
            const { error } = await this.supabase
                .from('players')
                .update({
                    level: this.player.level,
                    xp: this.player.xp,
                    essence: this.player.essence,
                    updated_at: new Date()
                })
                .eq('id', this.player.id);

            if (error) throw error;
        } catch (error) {
            console.error("Erreur sauvegarde progression:", error);
        }
    }

    fleeCombat() {
        if (Math.random() > 0.3) {
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
            
            // Sauvegarder le niveau
            this.savePlayerProgress();
        }
    }

    // EFFETS VISUELS ET SONORES
    createProjectile(from, to, type) {
        const container = document.getElementById('projectile-container');
        const projectile = document.createElement('div');
        projectile.className = `projectile ${type}`;
        
        const fromRect = document.querySelector(`.${from}-combatant`).getBoundingClientRect();
        const toRect = document.querySelector(`.${to}-combatant`).getBoundingClientRect();
        
        const startX = from === 'player' ? fromRect.left + fromRect.width / 2 : fromRect.left + fromRect.width / 2;
        const startY = from === 'player' ? fromRect.top : fromRect.top + fromRect.height;
        const endX = to === 'player' ? toRect.left + toRect.width / 2 : toRect.left + toRect.width / 2;
        const endY = to === 'player' ? toRect.top + toRect.height : toRect.top;
        
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
        
        if (this.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(200);
        }
    }

    playSound(soundId) {
        if (!this.soundEnabled) return;
        
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Audio play failed:", e));
        }
    }

    // INTERFACE UTILISATEUR
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
            this.updateLeaderboard();
        }
    }

    showMenuSection(section) {
        // Mettre à jour les boutons actifs
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        // Afficher la section correspondante
        document.querySelectorAll('.menu-section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        document.getElementById(`${section}-section`).classList.add('active');
    }

    async updateLeaderboard() {
        try {
            const { data: players, error } = await this.supabase
                .from('players')
                .select('name, level, essence')
                .order('level', { ascending: false })
                .order('essence', { ascending: false })
                .limit(10);

            if (error) throw error;

            const leaderboard = document.getElementById('leaderboard');
            if (players && players.length > 0) {
                leaderboard.innerHTML = '';
                
                players.forEach((player, index) => {
                    const item = document.createElement('div');
                    item.className = 'leaderboard-item';
                    item.innerHTML = `
                        <div class="leaderboard-rank">#${index + 1}</div>
                        <div class="leaderboard-name">${player.name}</div>
                        <div class="leaderboard-score">Niv. ${player.level}</div>
                    `;
                    leaderboard.appendChild(item);
                });
            }
        } catch (error) {
            console.error("Erreur classement:", error);
            document.getElementById('leaderboard').innerHTML = '<div class="empty-state">Erreur de chargement</div>';
        }
    }

    updateUI() {
        document.getElementById('display-username').textContent = this.player.name;
        document.getElementById('quick-essence').textContent = this.player.essence;
        document.getElementById('quick-level').textContent = this.player.level;
        document.getElementById('menu-player-name').textContent = this.player.name;
        document.getElementById('menu-level').textContent = this.player.level;
        document.getElementById('menu-xp').textContent = `${this.player.xp}/${this.player.xpToNextLevel}`;
        document.getElementById('menu-essence').textContent = this.player.essence;
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
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
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

    // SAUVEGARDE LOCALE
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
                
                if (this.musicEnabled) {
                    document.getElementById('background-music').play();
                }
            }
        }
    }

    loadLocalGame() {
        this.loadGame();
        this.switchScreen('world-map');
    }

    saveSettings() {
        this.saveGame();
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
        text-shadow: 2px 2px 0 #000;
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
    
    .notification {
        font-family: 'Cinzel', serif;
    }
`;
document.head.appendChild(style);
