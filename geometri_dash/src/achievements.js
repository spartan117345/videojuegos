// Achievement System
class AchievementSystem {
    constructor() {
        this.achievements = [
            { id: 'first_jump', name: 'Baby Steps', description: 'Make your first jump', unlocked: false, icon: '🦘' },
            { id: 'score_10', name: 'Getting Started', description: 'Score 10 points', unlocked: false, icon: '⭐' },
            { id: 'score_50', name: 'Warming Up', description: 'Score 50 points', unlocked: false, icon: '🔥' },
            { id: 'score_100', name: 'Century', description: 'Score 100 points', unlocked: false, icon: '💯' },
            { id: 'score_250', name: 'Elite Player', description: 'Score 250 points', unlocked: false, icon: '👑' },
            { id: 'score_500', name: 'Legend', description: 'Score 500 points', unlocked: false, icon: '🏆' },
            { id: 'perfect_10', name: 'Perfect Ten', description: 'Get a 10x combo', unlocked: false, icon: '⚡' },
            { id: 'power_collector', name: 'Power Collector', description: 'Collect 5 power-ups', unlocked: false, icon: '💎' },
            { id: 'survivor', name: 'Survivor', description: 'Survive for 60 seconds', unlocked: false, icon: '⏰' },
            { id: 'speed_demon', name: 'Speed Demon', description: 'Reach 3x speed', unlocked: false, icon: '🚀' },
            { id: 'comeback_kid', name: 'Comeback Kid', description: 'Play 10 games', unlocked: false, icon: '🔄' },
            { id: 'untouchable', name: 'Untouchable', description: 'Score 30 without power-ups', unlocked: false, icon: '🛡️' }
        ];

        this.stats = {
            totalJumps: 0,
            gamesPlayed: 0,
            totalScore: 0,
            highestCombo: 0,
            powerUpsCollected: 0,
            longestSurvival: 0
        };

        this.load();
    }

    check(id, value) {
        const achievement = this.achievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.save();
            this.showNotification(achievement);
            if (audioSystem.enabled) {
                audioSystem.playAchievement();
            }
            return true;
        }
        return false;
    }

    updateStat(stat, value) {
        this.stats[stat] = value;
        this.checkAchievements();
        this.save();
    }

    incrementStat(stat, amount = 1) {
        this.stats[stat] = (this.stats[stat] || 0) + amount;
        this.checkAchievements();
        this.save();
    }

    checkAchievements() {
        if (this.stats.totalJumps >= 1) this.check('first_jump');
        if (this.stats.gamesPlayed >= 10) this.check('comeback_kid');
        if (this.stats.powerUpsCollected >= 5) this.check('power_collector');
        if (this.stats.highestCombo >= 10) this.check('perfect_10');
    }

    showNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-details">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }

    save() {
        localStorage.setItem('gd_achievements', JSON.stringify(this.achievements));
        localStorage.setItem('gd_stats', JSON.stringify(this.stats));
    }

    load() {
        const savedAchievements = localStorage.getItem('gd_achievements');
        const savedStats = localStorage.getItem('gd_stats');

        if (savedAchievements) {
            const loaded = JSON.parse(savedAchievements);
            this.achievements.forEach(achievement => {
                const saved = loaded.find(a => a.id === achievement.id);
                if (saved) achievement.unlocked = saved.unlocked;
            });
        }

        if (savedStats) {
            this.stats = { ...this.stats, ...JSON.parse(savedStats) };
        }
    }

    getUnlockedCount() {
        return this.achievements.filter(a => a.unlocked).length;
    }

    getProgress() {
        return `${this.getUnlockedCount()}/${this.achievements.length}`;
    }
}

const achievementSystem = new AchievementSystem();
