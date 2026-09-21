// ===============================
// ESTADOS DEL JUEGO
// ===============================

const GAME_STATES = {
    START: 'start',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver',
    PAUSED: 'paused'
};

// ===============================
// VARIABLES PRINCIPALES
// ===============================

let canvas, ctx;
let gameState = GAME_STATES.START;

let player;
let bullets = [];
let enemies = [];
let explosions = [];
let enemyBullets = [];

let level = 1;
let score = 0;
let lives = 3;

let keys = {};
let gameStartTime = 0;

// ===============================
// CONFIGURACIÓN
// ===============================

const settings = {

    playerSpeed: 6,

    bulletSpeed: 8,

    enemySpeed: 1,

    enemyShootChance: 0.001,

    enemyBulletSpeed: 3,

    maxEnemyBullets: 3,

    levels: [

        {
            enemyCount: 12,
            formation: 'grid',
            enemyType: 'basic',
            color: '#ff4fc3',
            moveSpeed: 1
        },

        {
            enemyCount: 18,
            formation: 'v-shape',
            enemyType: 'fast',
            color: '#9e8cff',
            moveSpeed: 1.5
        },

        {
            enemyCount: 24,
            formation: 'wave',
            enemyType: 'shooter',
            color: '#ff6584',
            moveSpeed: 2
        }

    ]
};

// ===============================
// JUGADOR
// ===============================

class Player {

    constructor() {

        this.width = 34;
        this.height = 42;

        this.x = canvas.width / 2 - this.width / 2;

        this.y = canvas.height - this.height - 25;

        this.speed = settings.playerSpeed;

        this.animation = 0;

        this.invulnerable = 0;
    }

    update() {

        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= this.speed;
        }

        if (
            keys['ArrowRight'] &&
            this.x < canvas.width - this.width
        ) {
            this.x += this.speed;
        }

        this.animation += 0.2;

        if (this.invulnerable > 0) {
            this.invulnerable--;
        }
    }

    draw() {

        ctx.save();

        if (
            this.invulnerable > 0 &&
            Math.floor(this.invulnerable / 5) % 2
        ) {
            ctx.globalAlpha = 0.35;
        }

        // Resplandor de la nave
        ctx.shadowColor = '#ff4fc3';
        ctx.shadowBlur = 18;

        // Cuerpo principal
        ctx.fillStyle = '#ff4fc3';

        ctx.beginPath();

        ctx.moveTo(
            this.x + this.width / 2,
            this.y
        );

        ctx.lineTo(
            this.x + this.width,
            this.y + this.height
        );

        ctx.lineTo(
            this.x + this.width * 0.65,
            this.y + this.height * 0.78
        );

        ctx.lineTo(
            this.x + this.width * 0.5,
            this.y + this.height
        );

        ctx.lineTo(
            this.x + this.width * 0.35,
            this.y + this.height * 0.78
        );

        ctx.lineTo(
            this.x,
            this.y + this.height
        );

        ctx.closePath();

        ctx.fill();

        // Cabina
        ctx.shadowBlur = 8;

        ctx.fillStyle = '#ffffff';

        ctx.beginPath();

        ctx.arc(
            this.x + this.width / 2,
            this.y + 17,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // Alas
        ctx.fillStyle = '#9e8cff';

        ctx.fillRect(
            this.x + 3,
            this.y + 27,
            10,
            5
        );

        ctx.fillRect(
            this.x + this.width - 13,
            this.y + 27,
            10,
            5
        );

        // Motor
        const flameSize =
            8 + Math.sin(this.animation) * 3;

        ctx.fillStyle = '#ffb3df';

        ctx.beginPath();

        ctx.moveTo(
            this.x + this.width / 2 - 5,
            this.y + this.height - 1
        );

        ctx.lineTo(
            this.x + this.width / 2,
            this.y + this.height + flameSize
        );

        ctx.lineTo(
            this.x + this.width / 2 + 5,
            this.y + this.height - 1
        );

        ctx.closePath();

        ctx.fill();

        ctx.restore();
    }

    takeDamage() {

        if (this.invulnerable <= 0) {

            lives--;

            this.invulnerable = 120;

            createExplosion(
                this.x + this.width / 2,
                this.y + this.height / 2,
                '#ff4fc3'
            );

            return true;
        }

        return false;
    }

    getBounds() {

        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// ===============================
// PROYECTILES
// ===============================

class Bullet {

    constructor(
        x,
        y,
        direction = -1,
        color = '#ffffff',
        speed = settings.bulletSpeed
    ) {

        this.x = x;

        this.y = y;

        this.width = 4;

        this.height = 13;

        this.speed = speed;

        this.direction = direction;

        this.color = color;

        this.trail = [];
    }

    update() {

        this.y += this.speed * this.direction;

        this.trail.push({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        });

        if (this.trail.length > 7) {
            this.trail.shift();
        }
    }

    draw() {

        ctx.save();

        // Estela
        for (let i = 0; i < this.trail.length; i++) {

            const alpha =
                (i + 1) / this.trail.length * 0.35;

            ctx.globalAlpha = alpha;

            ctx.fillStyle = this.color;

            ctx.fillRect(
                this.trail[i].x - 1,
                this.trail[i].y - 1,
                2,
                2
            );
        }

        ctx.restore();

        // Disparo
        ctx.save();

        ctx.shadowColor = this.color;

        ctx.shadowBlur = 15;

        ctx.fillStyle = this.color;

        ctx.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );

        ctx.restore();
    }

    getBounds() {

        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// ===============================
// ENEMIGOS
// ===============================

class Enemy {

    constructor(x, y, type = 'basic') {

        this.x = x;

        this.y = y;

        this.width = 28;

        this.height = 28;

        this.type = type;

        this.speed =
            settings.levels[level - 1].moveSpeed;

        this.color =
            settings.levels[level - 1].color;

        this.direction = 1;

        this.moveCounter = 0;

        this.shootCooldown = 0;

        this.animation = Math.random() * 10;
    }

    update() {

        this.animation += 0.1;

        this.moveCounter++;

        switch (this.type) {

            case 'basic':

                if (this.moveCounter % 60 === 0) {
                    this.y += 20;
                }

                this.x +=
                    this.direction *
                    this.speed *
                    0.5;

                break;

            case 'fast':

                this.x +=
                    this.direction *
                    this.speed;

                this.y +=
                    Math.sin(this.animation) *
                    0.5;

                break;

            case 'shooter':

                if (this.moveCounter % 30 === 0) {

                    this.x +=
                        this.direction * 20;
                }

                if (
                    this.shootCooldown <= 0 &&
                    Math.random() <
                    settings.enemyShootChance * 2
                ) {

                    this.shoot();

                    this.shootCooldown = 60;
                }

                break;
        }

        if (
            this.x <= 0 ||
            this.x >= canvas.width - this.width
        ) {

            this.direction *= -1;

            this.y += 10;
        }

        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
    }

    draw() {

        ctx.save();

        if (this.type === 'basic') {
            this.drawBasicEnemy();
        }

        if (this.type === 'fast') {
            this.drawFastEnemy();
        }

        if (this.type === 'shooter') {
            this.drawShooterEnemy();
        }

        ctx.restore();
    }

    drawBasicEnemy() {

        ctx.shadowColor = this.color;

        ctx.shadowBlur = 15;

        ctx.fillStyle = this.color;

        // Cabeza
        ctx.fillRect(
            this.x + 5,
            this.y + 4,
            this.width - 10,
            18
        );

        // Antenas
        ctx.fillRect(
            this.x + 3,
            this.y,
            4,
            8
        );

        ctx.fillRect(
            this.x + this.width - 7,
            this.y,
            4,
            8
        );

        // Ojos
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';

        ctx.fillRect(
            this.x + 9,
            this.y + 10,
            4,
            5
        );

        ctx.fillRect(
            this.x + 16,
            this.y + 10,
            4,
            5
        );
    }

    drawFastEnemy() {

        ctx.shadowColor = this.color;

        ctx.shadowBlur = 18;

        ctx.fillStyle = this.color;

        ctx.beginPath();

        ctx.moveTo(
            this.x + this.width / 2,
            this.y
        );

        ctx.lineTo(
            this.x + this.width,
            this.y + this.height
        );

        ctx.lineTo(
            this.x,
            this.y + this.height
        );

        ctx.closePath();

        ctx.fill();

        ctx.fillStyle = '#ffffff';

        ctx.fillRect(
            this.x + 9,
            this.y + 17,
            4,
            4
        );

        ctx.fillRect(
            this.x + 16,
            this.y + 17,
            4,
            4
        );
    }

    drawShooterEnemy() {

        ctx.shadowColor = this.color;

        ctx.shadowBlur = 20;

        ctx.fillStyle = this.color;

        ctx.beginPath();

        ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            13,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';

        ctx.fillRect(
            this.x + 8,
            this.y + 9,
            4,
            5
        );

        ctx.fillRect(
            this.x + 16,
            this.y + 9,
            4,
            5
        );

        // Cañón
        ctx.fillStyle = '#ffb3df';

        ctx.fillRect(
            this.x + this.width / 2 - 2,
            this.y + this.height - 1,
            4,
            8
        );
    }

    shoot() {

        if (
            enemyBullets.length <
            settings.maxEnemyBullets
        ) {

            enemyBullets.push(
                new Bullet(
                    this.x + this.width / 2 - 2,
                    this.y + this.height,
                    1,
                    '#ff6584',
                    settings.enemyBulletSpeed
                )
            );
        }
    }

    getBounds() {

        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// ===============================
// EXPLOSIONES
// ===============================

class Explosion {

    constructor(x, y, color = '#ff4fc3') {

        this.x = x;

        this.y = y;

        this.particles = [];

        this.lifetime = 35;

        for (let i = 0; i < 14; i++) {

            this.particles.push({

                x: x,

                y: y,

                vx:
                    (Math.random() - 0.5) * 9,

                vy:
                    (Math.random() - 0.5) * 9,

                color: color,

                life: 35,

                size:
                    Math.random() * 3 + 1
            });
        }
    }

    update() {

        this.lifetime--;

        this.particles.forEach(particle => {

            particle.x += particle.vx;

            particle.y += particle.vy;

            particle.vx *= 0.97;

            particle.vy *= 0.97;

            particle.life--;
        });
    }

    draw() {

        this.particles.forEach(particle => {

            if (particle.life > 0) {

                ctx.save();

                ctx.globalAlpha =
                    particle.life / 35;

                ctx.fillStyle =
                    particle.color;

                ctx.shadowColor =
                    particle.color;

                ctx.shadowBlur = 8;

                ctx.beginPath();

                ctx.arc(
                    particle.x,
                    particle.y,
                    particle.size,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                ctx.restore();
            }
        });
    }

    isDead() {

        return this.lifetime <= 0;
    }
}

// ===============================
// FUNCIONES
// ===============================

function createExplosion(
    x,
    y,
    color = '#ff4fc3'
) {

    explosions.push(
        new Explosion(x, y, color)
    );
}

function checkCollision(rect1, rect2) {

    return (
        rect1.x <
            rect2.x + rect2.width &&

        rect1.x + rect1.width >
            rect2.x &&

        rect1.y <
            rect2.y + rect2.height &&

        rect1.y + rect1.height >
            rect2.y
    );
}

// ===============================
// CREAR ENEMIGOS
// ===============================

function spawnEnemies() {

    enemies = [];

    const levelData =
        settings.levels[level - 1];

    switch (levelData.formation) {

        case 'grid':

            spawnGridFormation(
                levelData.enemyCount,
                levelData.enemyType
            );

            break;

        case 'v-shape':

            spawnVFormation(
                levelData.enemyCount,
                levelData.enemyType
            );

            break;

        case 'wave':

            spawnWaveFormation(
                levelData.enemyCount,
                levelData.enemyType
            );

            break;
    }
}

function spawnGridFormation(count, type) {

    const cols =
        Math.ceil(Math.sqrt(count));

    const rows =
        Math.ceil(count / cols);

    const spacing = 60;

    const startX =
        (canvas.width -
            (cols - 1) * spacing) / 2;

    for (let i = 0; i < count; i++) {

        const col = i % cols;

        const row =
            Math.floor(i / cols);

        const x =
            startX + col * spacing;

        const y =
            55 + row * 50;

        enemies.push(
            new Enemy(x, y, type)
        );
    }
}

function spawnVFormation(count, type) {

    const centerX =
        canvas.width / 2;

    const spacing = 40;

    for (let i = 0; i < count; i++) {

        const side =
            i % 2 === 0 ? 1 : -1;

        const offset =
            Math.floor(i / 2) * spacing;

        const x =
            centerX + side * offset;

        const y =
            50 + Math.abs(offset) * 0.5;

        enemies.push(
            new Enemy(x, y, type)
        );
    }
}

function spawnWaveFormation(count, type) {

    const spacing =
        canvas.width / (count + 1);

    for (let i = 0; i < count; i++) {

        const x =
            spacing * (i + 1);

        const y =
            50 +
            Math.sin(i * 0.5) * 30;

        enemies.push(
            new Enemy(x, y, type)
        );
    }
}

// ===============================
// INICIALIZACIÓN
// ===============================

function init() {

    canvas =
        document.getElementById(
            'gameCanvas'
        );

    ctx =
        canvas.getContext('2d');

    player =
        new Player();

    document.addEventListener(
        'keydown',
        handleKeyDown
    );

    document.addEventListener(
        'keyup',
        handleKeyUp
    );

    document
        .getElementById('startButton')
        .addEventListener(
            'click',
            startGame
        );

    document
        .getElementById('restartButton')
        .addEventListener(
            'click',
            restartGame
        );

    gameLoop();
}

// ===============================
// INICIAR
// ===============================

function startGame() {

    gameState =
        GAME_STATES.PLAYING;

    gameStartTime =
        Date.now();

    score = 0;

    level = 1;

    lives = 3;

    bullets = [];

    enemies = [];

    enemyBullets = [];

    explosions = [];

    player =
        new Player();

    spawnEnemies();

    document
        .getElementById('startScreen')
        .style.display = 'none';

    document
        .getElementById('gameUI')
        .style.display = 'block';

    updateHUD();
}

// ===============================
// REINICIAR
// ===============================

function restartGame() {

    document
        .getElementById('gameOverScreen')
        .style.display = 'none';

    document
        .getElementById('startScreen')
        .style.display = 'block';

    gameState =
        GAME_STATES.START;
}

// ===============================
// FIN DEL JUEGO
// ===============================

function gameOver(victory = false) {

    gameState =
        GAME_STATES.GAME_OVER;

    document
        .getElementById('gameUI')
        .style.display = 'none';

    document
        .getElementById('gameOverScreen')
        .style.display = 'block';

    const finalMessage =
        document.getElementById(
            'finalMessage'
        );

    if (victory) {

        finalMessage.innerHTML =
            'MISIÓN COMPLETADA<br>' +
            'La invasión ha sido detenida.';

        finalMessage.style.color =
            '#ff63c9';

    } else {

        finalMessage.innerHTML =
            'MISIÓN TERMINADA<br>' +
            'La invasión continúa...';

        finalMessage.style.color =
            '#ff6584';
    }

    document
        .getElementById('finalScore')
        .textContent = score;
}

// ===============================
// HUD
// ===============================

function updateHUD() {

    document
        .getElementById('score')
        .textContent = score;

    document
        .getElementById('level')
        .textContent = level;

    document
        .getElementById('lives')
        .textContent = lives;
}

// ===============================
// BUCLE PRINCIPAL
// ===============================

function gameLoop() {

    if (
        gameState ===
        GAME_STATES.PLAYING
    ) {

        update();
    }

    render();

    requestAnimationFrame(
        gameLoop
    );
}

// ===============================
// ACTUALIZAR JUEGO
// ===============================

function update() {

    player.update();

    // Disparos del jugador
    bullets.forEach(
        (bullet, index) => {

            bullet.update();

            if (
                bullet.y <
                -bullet.height
            ) {

                bullets.splice(
                    index,
                    1
                );
            }
        }
    );

    // Disparos enemigos
    enemyBullets.forEach(
        (bullet, index) => {

            bullet.update();

            if (
                bullet.y >
                canvas.height
            ) {

                enemyBullets.splice(
                    index,
                    1
                );
            }

            if (
                checkCollision(
                    bullet.getBounds(),
                    player.getBounds()
                )
            ) {

                enemyBullets.splice(
                    index,
                    1
                );

                if (
                    player.takeDamage()
                ) {

                    if (lives <= 0) {

                        gameOver(false);

                        return;
                    }
                }
            }
        }
    );

    // Enemigos
    enemies.forEach(
        (enemy, index) => {

            enemy.update();

            if (
                enemy.y + enemy.height >
                canvas.height - 50
            ) {

                gameOver(false);

                return;
            }

            if (
                checkCollision(
                    enemy.getBounds(),
                    player.getBounds()
                )
            ) {

                if (
                    player.takeDamage()
                ) {

                    enemies.splice(
                        index,
                        1
                    );

                    createExplosion(
                        enemy.x +
                            enemy.width / 2,
                        enemy.y +
                            enemy.height / 2,
                        enemy.color
                    );

                    if (lives <= 0) {

                        gameOver(false);

                        return;
                    }
                }
            }
        }
    );

    // Colisiones de disparos
    bullets.forEach(
        (bullet, bIndex) => {

            enemies.forEach(
                (enemy, eIndex) => {

                    if (
                        checkCollision(
                            bullet.getBounds(),
                            enemy.getBounds()
                        )
                    ) {

                        bullets.splice(
                            bIndex,
                            1
                        );

                        enemies.splice(
                            eIndex,
                            1
                        );

                        score +=
                            10 * level;

                        createExplosion(
                            enemy.x +
                                enemy.width / 2,
                            enemy.y +
                                enemy.height / 2,
                            enemy.color
                        );

                        if (
                            enemies.length === 0
                        ) {

                            level++;

                            if (
                                level >
                                settings.levels.length
                            ) {

                                gameOver(true);

                                return;

                            } else {

                                setTimeout(
                                    () => {
                                        spawnEnemies();
                                    },
                                    1000
                                );
                            }
                        }
                    }
                }
            );
        }
    );

    // Explosiones
    explosions.forEach(
        (explosion, index) => {

            explosion.update();

            if (
                explosion.isDead()
            ) {

                explosions.splice(
                    index,
                    1
                );
            }
        }
    );

    updateHUD();
}

// ===============================
// DIBUJAR
// ===============================

function render() {

    // Fondo
    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    gradient.addColorStop(
        0,
        '#09051a'
    );

    gradient.addColorStop(
        0.5,
        '#130a29'
    );

    gradient.addColorStop(
        1,
        '#05030d'
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawStarfield();

    // Luna/planeta decorativo
    ctx.save();

    ctx.globalAlpha = 0.12;

    ctx.fillStyle = '#9e8cff';

    ctx.beginPath();

    ctx.arc(
        canvas.width - 80,
        80,
        45,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();

    if (
        gameState ===
        GAME_STATES.PLAYING
    ) {

        player.draw();

        bullets.forEach(
            bullet => bullet.draw()
        );

        enemyBullets.forEach(
            bullet => bullet.draw()
        );

        enemies.forEach(
            enemy => enemy.draw()
        );

        explosions.forEach(
            explosion => explosion.draw()
        );
    }
}

// ===============================
// ESTRELLAS
// ===============================

function drawStarfield() {

    for (let i = 0; i < 75; i++) {

        const x =
            (i * 137.5) %
            canvas.width;

        const y =
            (
                i * 234.7 +
                Date.now() * 0.008
            ) %
            canvas.height;

        const size =
            (i % 3) + 1;

        const opacity =
            0.25 +
            (i % 4) * 0.15;

        ctx.fillStyle =
            `rgba(255,255,255,${opacity})`;

        ctx.fillRect(
            x,
            y,
            size,
            size
        );
    }
}

// ===============================
// TECLADO
// ===============================

function handleKeyDown(event) {

    keys[event.key] = true;

    if (event.key === ' ') {

        event.preventDefault();

        if (
            gameState ===
            GAME_STATES.PLAYING
        ) {

            bullets.push(
                new Bullet(
                    player.x +
                        player.width / 2 -
                        2,

                    player.y,

                    -1,

                    '#ffffff',

                    settings.bulletSpeed
                )
            );
        }
    }
}

function handleKeyUp(event) {

    keys[event.key] = false;
}

// ===============================
// INICIAR CUANDO CARGA
// ===============================

window.onload = init;