// UI Controller for Settings and Achievements

// Settings Panel
document.getElementById('settingsBtn')?.addEventListener('click', () => {
    document.getElementById('settingsPanel').style.display = 'flex';
    renderSkinSelector();
});

document.getElementById('closeSettings')?.addEventListener('click', () => {
    document.getElementById('settingsPanel').style.display = 'none';
});

// Achievements Panel
document.getElementById('achievementsBtn')?.addEventListener('click', () => {
    document.getElementById('achievementsPanel').style.display = 'flex';
    renderAchievements();
});

document.getElementById('closeAchievements')?.addEventListener('click', () => {
    document.getElementById('achievementsPanel').style.display = 'none';
});

// Music Volume
document.getElementById('musicVolume')?.addEventListener('input', (e) => {
    const value = e.target.value;
    document.getElementById('musicVolumeValue').textContent = value + '%';
    if (audioSystem.enabled) {
        audioSystem.setMusicVolume(value / 100);
    }
});

// SFX Volume
document.getElementById('sfxVolume')?.addEventListener('input', (e) => {
    const value = e.target.value;
    document.getElementById('sfxVolumeValue').textContent = value + '%';
    if (audioSystem.enabled) {
        audioSystem.setSFXVolume(value / 100);
    }
});

// Toggle Sound
document.getElementById('toggleSound')?.addEventListener('click', (e) => {
    const enabled = audioSystem.toggle();
    e.target.textContent = enabled ? '🔊 ON' : '🔇 OFF';
    if (!enabled) {
        audioSystem.stopMusic();
    }
});

// Render Skin Selector
function renderSkinSelector() {
    const container = document.getElementById('skinSelector');
    if (!container || typeof SKINS === 'undefined') return;

    container.innerHTML = '';

    SKINS.forEach((skin, index) => {
        const skinCard = document.createElement('div');
        skinCard.className = `skin-card ${!skin.unlocked ? 'locked' : ''} ${gameState.skin === index ? 'selected' : ''}`;

        const colors = `linear-gradient(135deg, hsl(${skin.colors[0]}, 100%, 50%), hsl(${skin.colors[1]}, 100%, 50%))`;

        skinCard.innerHTML = `
            <div class="skin-preview" style="background: ${colors}"></div>
            <div class="skin-name">${skin.name}</div>
            ${!skin.unlocked ? `<div class="skin-lock">🔒 ${skin.requirement}</div>` : ''}
        `;

        if (skin.unlocked) {
            skinCard.addEventListener('click', () => {
                gameState.skin = index;
                localStorage.setItem('gd_skin', index.toString());
                renderSkinSelector();
            });
        }

        container.appendChild(skinCard);
    });
}

// Render Achievements
function renderAchievements() {
    const container = document.getElementById('achievementList');
    const progress = document.getElementById('achievementProgress');

    if (!container || !progress || typeof achievementSystem === 'undefined') return;

    progress.textContent = achievementSystem.getProgress();
    container.innerHTML = '';

    achievementSystem.achievements.forEach(achievement => {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;

        card.innerHTML = `
            <div class="achievement-icon-large">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
                ${achievement.unlocked ? '<div class="achievement-status">✓ Unlocked</div>' : '<div class="achievement-status">🔒 Locked</div>'}
            </div>
        `;

        container.appendChild(card);
    });
}

// Update pause menu stats
setInterval(() => {
    if (typeof gameState !== 'undefined' && gameState.isPaused) {
        const pauseScore = document.getElementById('pauseScore');
        const pauseTime = document.getElementById('pauseTime');
        if (pauseScore) pauseScore.textContent = Math.floor(gameState.score);
        if (pauseTime) pauseTime.textContent = gameState.survivalTime.toFixed(1);
    }
}, 100);

// Show pause button when game is playing
setInterval(() => {
    if (typeof gameState !== 'undefined') {
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.style.display = gameState.isPlaying ? 'inline-block' : 'none';
        }
    }
}, 100);

// Initialize - with delay to ensure all scripts loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        renderAchievements();
        renderSkinSelector();
    }, 100);
});
