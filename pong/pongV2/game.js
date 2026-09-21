// ==========================================================
// PROYECTO FINAL DE GRADO 11º - TECNOLOGÍA E INFORMÁTICA
// Desarrollado con HTML5 Canvas y Vanilla JavaScript (POO)
// Archivo: game.js
// ==========================================================

const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false; // Mantiene el aspecto Pixel Art

// --- SINTETIZADOR DE AUDIO RETRO (Web Audio API) ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playSound(freq, duration) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

// --- CLASE RAQUETA ---
class Paddle {
  constructor(x, y, isPlayer, colorMain, colorSecondary) {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 80;
    this.isPlayer = isPlayer;
    this.colorMain = colorMain;
    this.colorSecondary = colorSecondary;
    this.score = 0;
    this.speed = 6;
  }

  draw() {
    // Cuerpo principal
    ctx.fillStyle = this.colorMain;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Textura en píxeles
    ctx.fillStyle = this.colorSecondary;
    for (let i = 0; i < this.height; i += 16) {
      ctx.fillRect(this.x + 4, this.y + i, 8, 8);
    }

    // Borde
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  update(targetY, canvasHeight) {
    if (!this.isPlayer) {
      // Lógica de Inteligencia Artificial (IA)
      const center = this.y + this.height / 2;
      if (center < targetY - 10) {
        this.y += this.speed;
      } else if (center > targetY + 10) {
        this.y -= this.speed;
      }
    }
    // Colisión con los bordes superior e inferior
    this.y = Math.max(0, Math.min(canvasHeight - this.height, this.y));
  }
}

// --- CLASE PELOTA (HORMIGA CULONA) ---
class AntBall {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 12;
    this.speedX = 5;
    this.speedY = 3;
  }

  draw() {
    const p = 2; // Factor de escala para píxeles
    const x = this.x;
    const y = this.y;

    // Abdomen grande (Hormiga Culona)
    ctx.fillStyle = "#3a1d00";
    ctx.fillRect(x - 6*p, y - 3*p, 6*p, 6*p);
    ctx.fillStyle = "#613100"; 
    ctx.fillRect(x - 5*p, y - 2*p, 3*p, 3*p); // Brillo

    // Tórax y Cabeza
    ctx.fillStyle = "#211100";
    ctx.fillRect(x, y - 2*p, 3*p, 4*p);
    ctx.fillRect(x + 3*p, y - 2*p, 3*p, 3*p);

    // Patas
    ctx.fillStyle = "#000000";
    ctx.fillRect(x - 1*p, y - 4*p, 1*p, 2*p);
    ctx.fillRect(x - 1*p, y + 2*p, 1*p, 2*p);
    ctx.fillRect(x + 2*p, y - 4*p, 1*p, 2*p);
    ctx.fillRect(x + 2*p, y + 2*p, 1*p, 2*p);
  }

  update(canvasWidth, canvasHeight, p1, p2) {
    this.x += this.speedX;
    this.y += this.speedY;

    // Rebote superior e inferior
    if (this.y - this.size < 0 || this.y + this.size > canvasHeight) {
      this.speedY *= -1;
      playSound(220, 0.05);
    }

    // Colisión con Jugador 1 (San Gil)
    if (
      this.x - this.size < p1.x + p1.width &&
      this.y > p1.y &&
      this.y < p1.y + p1.height
    ) {
      this.speedX = Math.abs(this.speedX) + 0.3;
      this.x = p1.x + p1.width + this.size;
      playSound(440, 0.08);
    }

    // Colisión con Jugador 2 (Barichara)
    if (
      this.x + this.size > p2.x &&
      this.y > p2.y &&
      this.y < p2.y + p2.height
    ) {
      this.speedX = -Math.abs(this.speedX) - 0.3;
      this.x = p2.x - this.size;
      playSound(440, 0.08);
    }

    // Punto para Jugador 2
    if (this.x < 0) {
      p2.score++;
      playSound(150, 0.2);
      this.reset(canvasWidth, canvasHeight);
    }

    // Punto para Jugador 1
    if (this.x > canvasWidth) {
      p1.score++;
      playSound(600, 0.2);
      this.reset(canvasWidth, canvasHeight);
    }
  }

  reset(width, height) {
    this.x = width / 2;
    this.y = height / 2;
    this.speedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    this.speedY = (Math.random() > 0.5 ? 1 : -1) * 3;
  }
}

// --- INICIALIZACIÓN DEL JUEGO ---
const player = new Paddle(20, canvas.height/2 - 40, true, "#2e8b57", "#8fbc8f");
const ai = new Paddle(canvas.width - 36, canvas.height/2 - 40, false, "#d9534f", "#f0ad4e");
const ant = new AntBall(canvas.width / 2, canvas.height / 2);

const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// Dibuja el escenario del Río Fonce y la red
function drawBackground() {
  // Río Fonce
  ctx.fillStyle = "#2b5c6e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Red central estilo musgo
  ctx.fillStyle = "#4a7c59";
  for (let i = 10; i < canvas.height; i += 25) {
    ctx.fillRect(canvas.width / 2 - 4, i, 8, 12);
  }

  // Marcador y textos
  ctx.font = "24px 'Courier New', monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`SAN GIL: ${player.score}`, 100, 40);
  ctx.fillText(`BARICHARA: ${ai.score}`, 500, 40);
}

// Bucle principal de renderizado y animación
function gameLoop() {
  // Movimiento manual del jugador
  if (keys["w"] || keys["W"] || keys["ArrowUp"]) {
    player.y -= player.speed;
  }
  if (keys["s"] || keys["S"] || keys["ArrowDown"]) {
    player.y += player.speed;
  }
  player.update(0, canvas.height);

  // Actualizar IA y Pelota
  ai.update(ant.y, canvas.height);
  ant.update(canvas.width, canvas.height, player, ai);

  // Renderizar
  drawBackground();
  player.draw();
  ai.draw();
  ant.draw();

  requestAnimationFrame(gameLoop);
}

// --- CONTROLES DE INTERFAZ ---
document.getElementById("btnRestart").addEventListener("click", () => {
  player.score = 0;
  ai.score = 0;
  ant.reset(canvas.width, canvas.height);
});

const difficulties = [
  { name: "Fácil", speed: 3.5 },
  { name: "Normal", speed: 5.5 },
  { name: "Pro San Gil", speed: 7.5 }
];
let diffIndex = 1;

document.getElementById("btnDifficulty").addEventListener("click", (e) => {
  diffIndex = (diffIndex + 1) % difficulties.length;
  ai.speed = difficulties[diffIndex].speed;
  e.target.innerText = `Dificultad: ${difficulties[diffIndex].name}`;
});

// Iniciar el juego
gameLoop();