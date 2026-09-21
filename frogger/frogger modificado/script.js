/**
 * Frogger Game Engine (Nivel Intermedio)
 */

const COLS = 13;
const ROWS = 13;
const CELL = 40;
const WIDTH = COLS * CELL;
const HEIGHT = ROWS * CELL;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Estado global
const state = {
  score: 0,
  lives: 3,
  timer: 30,
  homes: [false, false, false, false, false],
  lastTime: 0,
  gameOver: false
};

const homeCols = [1, 3, 6, 9, 11];

// Clase Base de Entidades (Carros y Troncos)
class Entity {
  constructor(x, y, w, h, speed, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = speed;
    this.color = color;
  }

  update(dt) {
    this.x += this.speed * dt;
    if (this.speed > 0 && this.x > WIDTH) this.x = -this.w;
    if (this.speed < 0 && this.x + this.w < 0) this.x = WIDTH;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y + 4, this.w, this.h - 8);
  }

  getBounds() {
    return { x: this.x + 2, y: this.y + 4, w: this.w - 4, h: this.h - 8 };
  }
}

// Clase Jugador (Rana)
class Frog {
  constructor() {
    this.reset();
  }

  reset() {
    this.col = 6;
    this.row = 12;
    this.x = this.col * CELL;
    this.y = this.row * CELL;
    this.riding = null;
  }

  move(dir) {
    if (state.gameOver) return;

    if (dir === "up" && this.row > 0) this.row--;
    if (dir === "down" && this.row < ROWS - 1) this.row++;
    if (dir === "left" && this.col > 0) this.col--;
    if (dir === "right" && this.col < COLS - 1) this.col++;

    this.x = this.col * CELL;
    this.y = this.row * CELL;
    this.riding = null;
  }

  update(dt) {
    if (this.riding) {
      this.x += this.riding.speed * dt;
      this.col = Math.floor((this.x + CELL / 2) / CELL);
    }
  }

  draw(ctx) {
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(this.x + CELL / 2, this.y + CELL / 2, CELL / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
  }

  getBounds() {
    return { x: this.x + 6, y: this.y + 6, w: CELL - 12, h: CELL - 12 };
  }
}

// Inicialización de Arreglos de Objetos
const frog = new Frog();
const cars = [];
const logs = [];

function initEntities() {
  cars.length = 0;
  logs.length = 0;

  // Filas de la carretera (Filas 7 a 11)
  const carSpecs = [
    { row: 11, speed: 80, len: 1.5, color: "#ef4444" },
    { row: 10, speed: -110, len: 1.2, color: "#f97316" },
    { row: 9, speed: 130, len: 1.8, color: "#eab308" },
    { row: 8, speed: -90, len: 1.4, color: "#a855f7" },
    { row: 7, speed: 150, len: 1.2, color: "#ec4899" }
  ];

  carSpecs.forEach(s => {
    for (let i = 0; i < 3; i++) {
      cars.push(new Entity((i * 200) % WIDTH, s.row * CELL, CELL * s.len, CELL, s.speed, s.color));
    }
  });

  // Filas del río (Filas 1 a 5)
  const logSpecs = [
    { row: 5, speed: -70, len: 2.5 },
    { row: 4, speed: 90, len: 2.0 },
    { row: 3, speed: -110, len: 3.0 },
    { row: 2, speed: 80, len: 2.2 },
    { row: 1, speed: -100, len: 2.8 }
  ];

  logSpecs.forEach(s => {
    for (let i = 0; i < 2; i++) {
      logs.push(new Entity((i * 260) % WIDTH, s.row * CELL, CELL * s.len, CELL, s.speed, "#78350f"));
    }
  });
}

// Detección de colisiones (AABB)
function isColliding(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function handleLogic(dt) {
  state.timer -= dt;
  if (state.timer <= 0) return loseLife("¡Se acabó el tiempo!");

  frog.update(dt);
  cars.forEach(c => c.update(dt));
  logs.forEach(l => l.update(dt));

  const fBounds = frog.getBounds();

  // Colisión en carretera
  if (frog.row >= 7 && frog.row <= 11) {
    if (cars.some(car => isColliding(fBounds, car.getBounds()))) {
      return loseLife("Te atropelló un carro.");
    }
  }

  // Lógica de río
  if (frog.row >= 1 && frog.row <= 5) {
    const log = logs.find(l => isColliding(fBounds, l.getBounds()));
    if (log) {
      frog.riding = log;
    } else {
      return loseLife("Te caíste al agua.");
    }
  }

  // Fuera de límites laterales
  if (frog.x < 0 || frog.x + CELL > WIDTH) {
    return loseLife("Te saliste del área.");
  }

  // Meta (Fila 0)
  if (frog.row === 0) {
    const idx = homeCols.indexOf(frog.col);
    if (idx !== -1 && !state.homes[idx]) {
      state.homes[idx] = true;
      state.score += 200 + Math.floor(state.timer) * 10;
      frog.reset();
      state.timer = 30;

      if (state.homes.every(Boolean)) {
        endGame("¡Felicidades!", "Has completado todas las metas.");
      }
    } else {
      return loseLife("Casilla de meta no válida u ocupada.");
    }
  }

  updateHUD();
}

function loseLife(msg) {
  state.lives--;
  if (state.lives <= 0) {
    endGame("¡Juego Terminado!", msg);
  } else {
    frog.reset();
    state.timer = 30;
  }
}

function updateHUD() {
  document.getElementById("score").textContent = state.score;
  document.getElementById("lives").textContent = state.lives;
  document.getElementById("timer").textContent = Math.ceil(state.timer);
}

function endGame(title, msg) {
  state.gameOver = true;
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalMsg").textContent = msg;
  document.getElementById("overlay").classList.remove("hidden");
}

function drawScenario() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Zonas: Río (1-5), Carretera (7-11), Zonas seguras
  ctx.fillStyle = "#15803d"; ctx.fillRect(0, 0, WIDTH, CELL); // Meta
  ctx.fillStyle = "#0284c7"; ctx.fillRect(0, CELL, WIDTH, 5 * CELL); // Río
  ctx.fillStyle = "#166534"; ctx.fillRect(0, 6 * CELL, WIDTH, CELL); // Descanso
  ctx.fillStyle = "#334155"; ctx.fillRect(0, 7 * CELL, WIDTH, 5 * CELL); // Carretera
  ctx.fillStyle = "#166534"; ctx.fillRect(0, 12 * CELL, WIDTH, CELL); // Inicio

  // Renderizar metas
  homeCols.forEach((col, i) => {
    ctx.fillStyle = state.homes[i] ? "#22c55e" : "#0f172a";
    ctx.fillRect(col * CELL + 4, 4, CELL - 8, CELL - 8);
  });

  logs.forEach(l => l.draw(ctx));
  cars.forEach(c => c.draw(ctx));
  frog.draw(ctx);
}

// Bucle de renderizado basado en tiempo delta
function gameLoop(timestamp) {
  if (!state.lastTime) state.lastTime = timestamp;
  const dt = (timestamp - state.lastTime) / 1000;
  state.lastTime = timestamp;

  if (!state.gameOver) {
    handleLogic(Math.min(dt, 0.1));
    drawScenario();
  }

  requestAnimationFrame(gameLoop);
}

// Eventos de teclado y controles
window.addEventListener("keydown", e => {
  const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" };
  if (map[e.key]) frog.move(map[e.key]);
});

document.querySelectorAll(".btn-ctrl").forEach(btn => {
  btn.addEventListener("click", () => frog.move(btn.dataset.dir));
});

document.getElementById("restartBtn").addEventListener("click", () => {
  state.score = 0;
  state.lives = 3;
  state.timer = 30;
  state.homes.fill(false);
  state.gameOver = false;
  frog.reset();
  initEntities();
  document.getElementById("overlay").classList.add("hidden");
});

// Arrancar Juego
initEntities();
requestAnimationFrame(gameLoop);
