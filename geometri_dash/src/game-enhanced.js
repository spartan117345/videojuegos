// Enhanced Game Configuration
const CONFIG = {
    gravity: 0.8,
    jumpForce: -15,
    playerSize: 30,
    obstacleSpeed: 5,
    groundHeight: 50,
    scoreIncrement: 1,
    powerUpChance: 0.01, // Reduced from 0.02
    screenShakeIntensity: 10,
    screenShakeDuration: 500,
    portalChance: 0.003, // Reduced from 0.008 (portals are rare!)
    platformHeights: [50, 100, 150] // Different floor levels
};

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State (must be defined BEFORE resizeCanvas)
let gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    highScore: parseInt(localStorage.getItem('gd_highscore') || '0'),
    gameSpeed: 1,
    combo: 0,
    comboMultiplier: 1,
    survivalTime: 0,
    startTime: 0,
    powerUpsCollected: 0,
    skin: parseInt(localStorage.getItem('gd_skin') || '0')
};

// Set canvas size
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    // Re-render static scene if game not playing (only if initialized)
    try {
        if (gameState && !gameState.isPlaying && player) {
            renderStaticScene();
        }
    } catch (e) {
        // Ignore - player not initialized yet
    }
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Screen Shake
let screenShake = {
    active: false,
    intensity: 0,
    duration: 0,
    startTime: 0
};

function triggerScreenShake(intensity = CONFIG.screenShakeIntensity, duration = CONFIG.screenShakeDuration) {
    screenShake = {
        active: true,
        intensity: intensity,
        duration: duration,
        startTime: performance.now()
    };
}

function getScreenShakeOffset() {
    if (!screenShake.active) return { x: 0, y: 0 };

    const elapsed = performance.now() - screenShake.startTime;
    if (elapsed > screenShake.duration) {
        screenShake.active = false;
        return { x: 0, y: 0 };
    }

    const progress = elapsed / screenShake.duration;
    const currentIntensity = screenShake.intensity * (1 - progress);

    return {
        x: (Math.random() - 0.5) * currentIntensity * 2,
        y: (Math.random() - 0.5) * currentIntensity * 2
    };
}

// Player Skins
const SKINS = [
    { name: 'Classic', colors: [0, 60], unlocked: true },
    { name: 'Fire', colors: [0, 30], unlocked: false, requirement: 50 },
    { name: 'Ocean', colors: [180, 240], unlocked: false, requirement: 100 },
    { name: 'Forest', colors: [120, 150], unlocked: false, requirement: 150 },
    { name: 'Purple Haze', colors: [270, 300], unlocked: false, requirement: 200 },
    { name: 'Golden', colors: [45, 60], unlocked: false, requirement: 300 }
];

// Check and unlock skins
function checkSkinUnlocks() {
    SKINS.forEach((skin, index) => {
        if (!skin.unlocked && gameState.highScore >= skin.requirement) {
            skin.unlocked = true;
            if (audioSystem.enabled) audioSystem.playAchievement();
            showNotification(`Skin Unlocked: ${skin.name}!`, '🎨');
        }
    });
    saveSkins();
}

function saveSkins() {
    const unlocked = SKINS.map(s => s.unlocked);
    localStorage.setItem('gd_skins', JSON.stringify(unlocked));
}

function loadSkins() {
    const saved = localStorage.getItem('gd_skins');
    if (saved) {
        const unlocked = JSON.parse(saved);
        SKINS.forEach((skin, i) => {
            if (unlocked[i]) skin.unlocked = true;
        });
    }
}

// Player Class (Enhanced)
class Player {
    constructor() {
        this.x = 100;
        this.y = canvas.height - CONFIG.groundHeight - CONFIG.playerSize;
        this.width = CONFIG.playerSize;
        this.height = CONFIG.playerSize;
        this.velocityY = 0;
        this.isJumping = false;
        this.rotation = 0;
        this.color = 0;
        this.hasShield = false;
        this.shieldDuration = 0;
        this.canDoubleJump = false;
        this.hasUsedDoubleJump = false;
        this.gravityMultiplier = 1; // 1 = normal, -1 = flipped
        this.currentGroundHeight = CONFIG.groundHeight;
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = CONFIG.jumpForce * this.gravityMultiplier;
            this.isJumping = true;
            if (audioSystem.enabled) audioSystem.playJump();
            achievementSystem.incrementStat('totalJumps');
        } else if (this.canDoubleJump && !this.hasUsedDoubleJump) {
            this.velocityY = CONFIG.jumpForce * 0.8 * this.gravityMultiplier;
            this.hasUsedDoubleJump = true;
            if (audioSystem.enabled) audioSystem.playJump();
            achievementSystem.incrementStat('totalJumps');
        }
    }

    flipGravity() {
        this.gravityMultiplier *= -1;
        this.velocityY = 0;
        triggerScreenShake(8, 300);
        showNotification('Gravity Flipped!', '🌀');
        if (audioSystem.enabled) audioSystem.playPowerUp();
    }

    update() {
        // Apply gravity (with flip support)
        this.velocityY += CONFIG.gravity * this.gravityMultiplier;
        this.y += this.velocityY;

        // Reset to default ground if not on platform
        // This will be overridden by platform check in game loop
        this.currentGroundHeight = CONFIG.groundHeight;

        // Ground/ceiling collision
        if (this.gravityMultiplier === 1) {
            // Normal gravity - check ground
            const groundY = canvas.height - this.currentGroundHeight - this.height;
            if (this.y >= groundY) {
                this.y = groundY;
                this.velocityY = 0;
                this.isJumping = false;
                this.rotation = 0;
                this.hasUsedDoubleJump = false;
            }
        } else {
            // Flipped gravity - check ceiling
            const ceilingY = 0;
            if (this.y <= ceilingY) {
                this.y = ceilingY;
                this.velocityY = 0;
                this.isJumping = false;
                this.rotation = 0;
                this.hasUsedDoubleJump = false;
            }
        }

        // Rotation effect when jumping
        if (this.isJumping) {
            this.rotation += 5 * this.gravityMultiplier;
        }

        // Color cycling for rainbow effect
        const currentSkin = SKINS[gameState.skin];
        this.color = (this.color + 2) % 360;

        // Update power-up durations
        if (this.shieldDuration > 0) {
            this.shieldDuration--;
            if (this.shieldDuration === 0) this.hasShield = false;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        // Flip rendering if gravity is flipped
        if (this.gravityMultiplier === -1) {
            ctx.scale(1, -1);
        }

        ctx.rotate((this.rotation * Math.PI) / 180);

        const currentSkin = SKINS[gameState.skin];
        const baseColor = (this.color + currentSkin.colors[0]) % 360;

        // Draw player with gradient and effects
        const gradient = ctx.createLinearGradient(-this.width / 2, -this.height / 2, this.width / 2, this.height / 2);
        gradient.addColorStop(0, `hsl(${baseColor}, 100%, 50%)`);
        gradient.addColorStop(1, `hsl(${baseColor + currentSkin.colors[1]}, 100%, 50%)`);

        // Shield effect
        if (this.hasShield) {
            ctx.shadowColor = '#ffd166';
            ctx.shadowBlur = 30;
            ctx.strokeStyle = '#ffd166';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(0, 0, this.width, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Glow effect
        ctx.shadowColor = `hsl(${baseColor}, 100%, 50%)`;
        ctx.shadowBlur = 20;

        // Main square
        ctx.fillStyle = gradient;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Inner detail
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(-this.width / 4, -this.height / 4, this.width / 2, this.height / 2);

        // Gravity indicator arrow
        if (this.gravityMultiplier === -1) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.moveTo(0, -this.height / 4);
            ctx.lineTo(-5, -this.height / 4 - 8);
            ctx.lineTo(5, -this.height / 4 - 8);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}

// Power-Up Class
class PowerUp {
    constructor(x) {
        this.x = x;
        this.y = canvas.height - CONFIG.groundHeight - 80;
        this.width = 25;
        this.height = 25;
        this.color = Math.random() * 360;
        this.rotation = 0;
        this.types = ['shield', 'slowmo', 'doublejump'];
        this.type = this.types[Math.floor(Math.random() * this.types.length)];
        this.pulseSize = 0;
        this.labels = {
            'shield': '🛡️ SHIELD',
            'slowmo': '⏰ SLOW-MO',
            'doublejump': '⚡ DBL-JUMP'
        };
    }

    update() {
        this.x -= CONFIG.obstacleSpeed * gameState.gameSpeed;
        this.rotation += 3;
        this.color = (this.color + 2) % 360;
        this.pulseSize = Math.sin(Date.now() / 100) * 5;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate((this.rotation * Math.PI) / 180);

        // Glow
        ctx.shadowColor = `hsl(${this.color}, 100%, 50%)`;
        ctx.shadowBlur = 20;

        // Icon based on type
        const size = this.width + this.pulseSize;
        ctx.fillStyle = `hsl(${this.color}, 100%, 50%)`;

        if (this.type === 'shield') {
            // Shield icon
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'slowmo') {
            // Clock icon
            ctx.fillRect(-size / 2, -size / 2, size, size);
        } else {
            // Double jump icon (two arrows)
            ctx.beginPath();
            ctx.moveTo(0, -size / 2);
            ctx.lineTo(size / 2, size / 2);
            ctx.lineTo(-size / 2, size / 2);
            ctx.closePath();
            ctx.fill();
        }

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        // Simple icon above power-up (no fancy labels!)
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y - 20);
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.type === 'shield') {
            ctx.fillText('🛡️', 0, 0);
        } else if (this.type === 'slowmo') {
            ctx.fillText('⏰', 0, 0);
        } else {
            ctx.fillText('⚡', 0, 0);
        }
        ctx.restore();
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    collidesWith(player) {
        return (
            player.x < this.x + this.width &&
            player.x + player.width > this.x &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y
        );
    }
}

// Obstacle Class (Enhanced with more types)
class Obstacle {
    constructor(x, type = null) {
        this.x = x;
        const types = ['spike', 'block', 'tall', 'moving'];
        this.type = type || types[Math.floor(Math.random() * types.length)];

        if (this.type === 'spike') {
            this.width = 30;
            this.height = 40;
        } else if (this.type === 'tall') {
            this.width = 40;
            this.height = 80;
        } else if (this.type === 'moving') {
            this.width = 35;
            this.height = 35;
            this.baseY = canvas.height - CONFIG.groundHeight - 100;
            this.moveRange = 40;
            this.moveSpeed = 0.002; // Smooth sine wave movement
        } else {
            this.width = 50;
            this.height = 60;
        }

        this.y = canvas.height - CONFIG.groundHeight - this.height;
        this.color = Math.random() * 360;
        this.rotation = 0;
    }

    update() {
        this.x -= CONFIG.obstacleSpeed * gameState.gameSpeed;
        this.color = (this.color + 1) % 360;

        if (this.type === 'moving') {
            // Smooth sine wave movement
            this.y = this.baseY + Math.sin(Date.now() * this.moveSpeed) * this.moveRange;
        }

        this.rotation += 1;
    }

    draw() {
        ctx.save();

        if (this.type === 'spike') {
            // Draw spike obstacle
            const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
            gradient.addColorStop(0, `hsl(${this.color}, 100%, 50%)`);
            gradient.addColorStop(1, `hsl(${this.color + 60}, 100%, 30%)`);

            ctx.shadowColor = `hsl(${this.color}, 100%, 50%)`;
            ctx.shadowBlur = 15;

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (this.type === 'moving') {
            // Rotating diamond
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate((this.rotation * Math.PI) / 180);

            const gradient = ctx.createLinearGradient(-this.width / 2, -this.height / 2, this.width / 2, this.height / 2);
            gradient.addColorStop(0, `hsl(${this.color}, 100%, 50%)`);
            gradient.addColorStop(1, `hsl(${this.color + 60}, 100%, 40%)`);

            ctx.shadowColor = `hsl(${this.color}, 100%, 50%)`;
            ctx.shadowBlur = 20;

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(0, -this.height / 2);
            ctx.lineTo(this.width / 2, 0);
            ctx.lineTo(0, this.height / 2);
            ctx.lineTo(-this.width / 2, 0);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Draw block obstacle
            const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
            gradient.addColorStop(0, `hsl(${this.color}, 100%, 40%)`);
            gradient.addColorStop(1, `hsl(${this.color + 60}, 100%, 50%)`);

            ctx.shadowColor = `hsl(${this.color}, 100%, 50%)`;
            ctx.shadowBlur = 15;

            ctx.fillStyle = gradient;
            ctx.fillRect(this.x, this.y, this.width, this.height);

            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }

        ctx.restore();
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    collidesWith(player) {
        return (
            player.x < this.x + this.width - 5 &&
            player.x + player.width > this.x + 5 &&
            player.y < this.y + this.height - 5 &&
            player.y + player.height > this.y + 5
        );
    }
}

// Enhanced Particle System
class Particle {
    constructor(x, y, type = 'trail') {
        this.x = x;
        this.y = y;
        this.type = type;

        if (type === 'explosion') {
            this.vx = (Math.random() - 0.5) * 15;
            this.vy = (Math.random() - 0.5) * 15;
            this.life = 1;
            this.size = Math.random() * 8 + 4;
        } else {
            this.vx = (Math.random() - 0.5) * 5;
            this.vy = (Math.random() - 0.5) * 5;
            this.life = 1;
            this.size = Math.random() * 5 + 2;
        }

        this.color = Math.random() * 360;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.type === 'explosion' ? 0.03 : 0.02;
        this.vy += 0.2;
    }

    draw() {
        if (this.life <= 0) return; // Don't draw dead particles

        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = `hsl(${this.color}, 100%, 50%)`;
        ctx.shadowColor = `hsl(${this.color}, 100%, 50%)`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        const radius = Math.max(0.1, this.size * this.life); // Ensure positive radius
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// Parallax Background Stars
class BackgroundStar {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speed = Math.random() * 0.5 + 0.1;
        this.opacity = Math.random();
    }

    update() {
        this.x -= this.speed * gameState.gameSpeed;
        if (this.x < 0) {
            this.x = canvas.width;
            this.y = Math.random() * canvas.height;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Game Objects
let player;
let obstacles = [];
let powerUps = [];
let particles = [];
let backgroundStars = [];
let lastObstacleTime = 0;
let animationId;

// Initialize stars
for (let i = 0; i < 50; i++) {
    backgroundStars.push(new BackgroundStar());
}

// Initialize Game
function init() {
    player = new Player();
    obstacles = [];
    powerUps = [];
    particles = [];
    gameState.score = 0;
    gameState.gameSpeed = 1;
    gameState.isPlaying = false;
    gameState.isPaused = false;
    gameState.combo = 0;
    gameState.comboMultiplier = 1;
    gameState.survivalTime = 0;
    gameState.powerUpsCollected = 0;
    updateScore();
    loadSkins();
    renderStaticScene();
}

// Render static scene (when game not playing)
function renderStaticScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background stars
    backgroundStars.forEach(star => {
        star.draw();
    });

    // Draw background grid
    drawBackground();

    // Draw player
    if (player) {
        player.draw();
    }

    // Draw ground
    drawGround();
}

// Update Score Display
function updateScore() {
    document.getElementById('score').textContent = Math.floor(gameState.score);
    document.getElementById('highScore').textContent = gameState.highScore;
    document.getElementById('combo').textContent = gameState.combo > 1 ? `${gameState.combo}x COMBO!` : '';
}

// Create explosion effect
function createExplosion(x, y) {
    for (let i = 0; i < 30; i++) {
        particles.push(new Particle(x, y, 'explosion'));
    }
}

// Update combo system
function updateCombo(success) {
    if (success) {
        gameState.combo++;
        gameState.comboMultiplier = 1 + (gameState.combo * 0.1);

        if (gameState.combo === 10) {
            achievementSystem.check('perfect_10');
        }

        if (gameState.combo > (achievementSystem.stats.highestCombo || 0)) {
            achievementSystem.updateStat('highestCombo', gameState.combo);
        }
    } else {
        gameState.combo = 0;
        gameState.comboMultiplier = 1;
    }
}

// Game Loop (Enhanced)
function gameLoop(timestamp) {
    if (!gameState.isPlaying || gameState.isPaused) return;

    // Calculate survival time
    if (gameState.startTime === 0) gameState.startTime = timestamp;
    gameState.survivalTime = (timestamp - gameState.startTime) / 1000;

    // Screen shake offset
    const shakeOffset = getScreenShakeOffset();
    ctx.save();
    ctx.translate(shakeOffset.x, shakeOffset.y);

    // Clear canvas
    ctx.clearRect(-shakeOffset.x, -shakeOffset.y, canvas.width, canvas.height);

    // Draw background stars
    backgroundStars.forEach(star => {
        star.update();
        star.draw();
    });

    // Draw background grid
    drawBackground();

    // Update and draw player
    player.update();
    player.draw();

    // Spawn obstacles - SIMPLE! Just spikes and blocks
    if (timestamp - lastObstacleTime > 1500 / gameState.gameSpeed) {
        const type = Math.random() > 0.7 ? 'block' : 'spike';
        obstacles.push(new Obstacle(canvas.width, type));
        lastObstacleTime = timestamp;
    }

    // Spawn power-ups occasionally
    if (Math.random() < 0.008 / gameState.gameSpeed) {
        powerUps.push(new PowerUp(canvas.width));
    }

    // Update and draw power-ups
    powerUps = powerUps.filter(powerUp => {
        powerUp.update();
        powerUp.draw();

        if (powerUp.collidesWith(player)) {
            // Apply power-up effect
            if (powerUp.type === 'shield') {
                player.hasShield = true;
                player.shieldDuration = 300;
                showNotification('Shield Active!', '🛡️');
            } else if (powerUp.type === 'slowmo') {
                gameState.gameSpeed *= 0.5;
                setTimeout(() => { gameState.gameSpeed = Math.max(1, gameState.gameSpeed * 2); }, 3000);
                showNotification('Slow Motion!', '⏰');
            } else if (powerUp.type === 'doublejump') {
                player.canDoubleJump = true;
                setTimeout(() => { player.canDoubleJump = false; }, 5000);
                showNotification('Double Jump!', '⚡');
            }

            gameState.powerUpsCollected++;
            achievementSystem.incrementStat('powerUpsCollected');
            if (audioSystem.enabled) audioSystem.playPowerUp();
            return false;
        }

        return !powerUp.isOffScreen();
    });

    // Removed portals, walls, ceiling obstacles, and platforms for simplicity!

    // Update and draw obstacles
    obstacles = obstacles.filter(obstacle => {
        obstacle.update();
        obstacle.draw();

        // Check collision
        if (obstacle.collidesWith(player)) {
            if (player.hasShield) {
                player.hasShield = false;
                player.shieldDuration = 0;
                showNotification('Shield Broke!', '💥');
                createExplosion(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
                if (audioSystem.enabled) audioSystem.playDeath();
                triggerScreenShake(5, 200);
                return false;
            } else {
                gameOver();
                return false;
            }
        }

        // Remove off-screen obstacles and award points
        if (obstacle.isOffScreen()) {
            const points = CONFIG.scoreIncrement * gameState.comboMultiplier;
            gameState.score += points;
            updateCombo(true);
            updateScore();
            if (audioSystem.enabled) audioSystem.playScore();

            // Check score achievements
            if (gameState.score >= 10) achievementSystem.check('score_10');
            if (gameState.score >= 50) achievementSystem.check('score_50');
            if (gameState.score >= 100) achievementSystem.check('score_100');
            if (gameState.score >= 250) achievementSystem.check('score_250');
            if (gameState.score >= 500) achievementSystem.check('score_500');

            return false;
        }

        return true;
    });

    // Update particles
    particles = particles.filter(particle => {
        particle.update();
        particle.draw();
        return !particle.isDead();
    });

    // Create trail particles
    if (Math.random() > 0.7) {
        particles.push(new Particle(
            player.x + player.width / 2,
            player.y + player.height / 2
        ));
    }

    // Increase difficulty
    gameState.gameSpeed = 1 + gameState.score / 100;

    // Check achievements
    if (gameState.survivalTime >= 60) achievementSystem.check('survivor');
    if (gameState.gameSpeed >= 3) achievementSystem.check('speed_demon');

    // Draw ground
    drawGround();

    // Draw HUD
    drawHUD();

    ctx.restore();

    animationId = requestAnimationFrame(gameLoop);
}

// Draw HUD
function drawHUD() {
    // Survival time
    ctx.fillStyle = 'rgba(79, 172, 254, 0.8)';
    ctx.font = '16px Courier New';
    ctx.fillText(`Time: ${gameState.survivalTime.toFixed(1)}s`, canvas.width - 150, 30);

    // Speed indicator
    ctx.fillText(`Speed: ${gameState.gameSpeed.toFixed(1)}x`, canvas.width - 150, 55);

    // Power-up indicators
    if (player.hasShield) {
        ctx.fillStyle = '#ffd166';
        ctx.fillText('🛡️ SHIELD', 10, 30);
    }
    if (player.canDoubleJump) {
        ctx.fillStyle = '#ffd166';
        ctx.fillText('⚡ DOUBLE JUMP', 10, 55);
    }
}

// Draw Background
function drawBackground() {
    const gridSize = 40;
    ctx.strokeStyle = 'rgba(79, 172, 254, 0.1)';
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Draw Ground
function drawGround() {
    const gradient = ctx.createLinearGradient(0, canvas.height - CONFIG.groundHeight, 0, canvas.height);
    gradient.addColorStop(0, '#ff6b35');
    gradient.addColorStop(1, '#ffd166');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, canvas.height - CONFIG.groundHeight, canvas.width, CONFIG.groundHeight);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - CONFIG.groundHeight);
    ctx.lineTo(canvas.width, canvas.height - CONFIG.groundHeight);
    ctx.stroke();
}

// Game Over (Enhanced)
function gameOver() {
    gameState.isPlaying = false;
    cancelAnimationFrame(animationId);

    // Create massive explosion
    createExplosion(player.x + player.width / 2, player.y + player.height / 2);
    triggerScreenShake(20, 800);
    if (audioSystem.enabled) {
        audioSystem.playDeath();
        audioSystem.stopMusic();
    }

    // Update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = Math.floor(gameState.score);
        localStorage.setItem('gd_highscore', gameState.highScore.toString());
        checkSkinUnlocks();
    }

    // Update achievements
    achievementSystem.incrementStat('gamesPlayed');
    achievementSystem.updateStat('totalScore', achievementSystem.stats.totalScore + Math.floor(gameState.score));
    if (gameState.survivalTime > (achievementSystem.stats.longestSurvival || 0)) {
        achievementSystem.updateStat('longestSurvival', Math.floor(gameState.survivalTime));
    }

    if (gameState.powerUpsCollected === 0 && gameState.score >= 30) {
        achievementSystem.check('untouchable');
    }

    updateCombo(false);

    document.getElementById('finalScore').textContent = Math.floor(gameState.score);
    document.getElementById('finalTime').textContent = gameState.survivalTime.toFixed(1);
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('restartBtn').style.display = 'inline-block';
    document.getElementById('startBtn').style.display = 'none';

    // Render static scene so floor stays visible
    setTimeout(() => renderStaticScene(), 100);
}

// Start Game (Enhanced)
function startGame() {
    init();
    gameState.isPlaying = true;
    gameState.startTime = 0;
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('restartBtn').style.display = 'inline-block';
    lastObstacleTime = performance.now();

    if (audioSystem.enabled) {
        audioSystem.init();
        audioSystem.startMusic();
    }

    requestAnimationFrame(gameLoop);
}

// Toggle Pause
function togglePause() {
    if (!gameState.isPlaying) return;

    gameState.isPaused = !gameState.isPaused;
    document.getElementById('pauseMenu').style.display = gameState.isPaused ? 'block' : 'none';

    if (!gameState.isPaused) {
        requestAnimationFrame(gameLoop);
    }
}

// Show notification
function showNotification(message, icon = '🎮') {
    const notification = document.createElement('div');
    notification.className = 'game-notification';
    notification.innerHTML = `<span class="notif-icon">${icon}</span> ${message}`;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Event Listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn')?.addEventListener('click', togglePause);
document.getElementById('resumeBtn')?.addEventListener('click', togglePause);

// Jump controls
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState.isPlaying && !gameState.isPaused) {
        e.preventDefault();
        player.jump();
    }
    if (e.code === 'Escape' || e.code === 'KeyP') {
        togglePause();
    }
});

canvas.addEventListener('click', () => {
    if (gameState.isPlaying && !gameState.isPaused) {
        player.jump();
    }
});

// Initialize
init();
loadSkins();
