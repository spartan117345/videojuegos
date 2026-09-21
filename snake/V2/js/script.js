let cellsNo = 20;
let cellSize = 400 / cellsNo;
let difficulty = 1;
let score = 0;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const btnStart = document.querySelector(".btn-start");
const btnPause = document.querySelector(".btn-pause");
const scoreVal = document.querySelector(".score_val");
const highScoreVal = document.querySelector(".high_score_val");

let direction;

const DIR = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
};

// ==============================
// COMIDA
// ==============================

let foodType = null;

// ==============================
// CONFIGURACIÓN DEL CANVAS
// ==============================

ctx.strokeStyle = "#27373F";
ctx.fillStyle = "rgb(14, 198, 14)";

// ==============================
// VARIABLES DEL JUEGO
// ==============================

let snake = [];
let food = null;
let paused = false;
let gameOver = false;
let needsGrowth = false;

let lastUpdate;
let lastFood;
let tick;

let flash = false;
let lastKeyPressed;

// ==============================
// PUNTUACIÓN MÁXIMA
// ==============================

function getHighScore() {
  try {
    const saved = localStorage.getItem("snakeHighScore");
    return saved ? parseInt(saved, 10) : 0;
  } catch (e) {
    return 0;
  }
}

function setHighScore(value) {
  try {
    localStorage.setItem("snakeHighScore", value);
  } catch (e) {
    console.warn("No se pudo guardar el récord.");
  }
}

function updateHighScoreDisplay() {
  highScoreVal.textContent = getHighScore();
}

function updateHighScoreIfNeeded(currentScore) {
  const high = getHighScore();

  if (currentScore > high) {
    setHighScore(currentScore);
    updateHighScoreDisplay();
  }
}

// ==============================
// ACTUALIZAR EL JUEGO
// ==============================

function update() {
  if (gameOver) {
    return;
  }

  tick = Date.now();

  if (hasCollisions()) {
    flash = true;
    gameOver = true;
    updateHighScoreIfNeeded(score);
    return;
  }

  if (tick - lastUpdate > 500 / difficulty) {
    if (lastKeyPressed && lastKeyPressed !== direction) {
      setDirection(lastKeyPressed);
    }

    moveSnake();

    lastUpdate = tick;
  }

  if (tick - lastFood > foodTreshold()) {
    putFood();
  }

  if (headMeetsFood()) {
    needsGrowth = true;

    food = null;
    foodType = null;

    putFood();

    setScore(score + difficulty);
  }
}

// ==============================
// TIEMPO DE LA COMIDA
// ==============================

function foodTreshold() {
  return (5000 / difficulty) * cellsNo;
}

// ==============================
// COLISIONES
// ==============================

function hasCollisions() {
  const head = snake[0];
  const check = snake.concat([]);

  check.shift();

  return check.find(
    (c) => c.x === head.x && c.y === head.y
  );
}

// ==============================
// COMPROBAR SI LA SERPIENTE
// OCUPA UNA CELDA
// ==============================

function snakeContains(cell) {
  return snake.find(
    (c) => c.x === cell.x && c.y === cell.y
  );
}

// ==============================
// COMPROBAR SI COMIÓ
// ==============================

function headMeetsFood() {
  const head = snake[0];

  return (
    food &&
    head.x === food.x &&
    head.y === food.y
  );
}

// ==============================
// MOVER LA SERPIENTE
// ==============================

function moveSnake() {
  const head = snake[0];
  const next = Object.assign({}, head);

  switch (direction) {
    case DIR.LEFT:
      --next.x;
      break;

    case DIR.UP:
      --next.y;
      break;

    case DIR.RIGHT:
      ++next.x;
      break;

    case DIR.DOWN:
      ++next.y;
      break;
  }

  if (next.x >= cellsNo) {
    next.x = 0;
  }

  if (next.y >= cellsNo) {
    next.y = 0;
  }

  if (next.x < 0) {
    next.x = cellsNo - 1;
  }

  if (next.y < 0) {
    next.y = cellsNo - 1;
  }

  if (!needsGrowth) {
    snake.pop();
  }

  needsGrowth = false;

  snake.unshift(next);
}

// ==============================
// CREAR COMIDA
// ==============================

function putFood() {
  // Evitar bucle infinito si la serpiente ocupa todo el tablero
  if (snake.length >= cellsNo * cellsNo) {
    food = null;
    return;
  }

  do {
    food = {
      x: Math.floor(Math.random() * cellsNo),
      y: Math.floor(Math.random() * cellsNo),
    };
  } while (snakeContains(food));

  // Elegir aleatoriamente entre arepa y tamal
  if (Math.random() < 0.5) {
    foodType = "arepa";
  } else {
    foodType = "tamal";
  }

  lastFood = Date.now();
}

// ==============================
// DIBUJAR TODO
// ==============================

function draw() {
  ctx.clearRect(0, 0, 400, 400);

  drawCells();

  drawFood();

  if (
    flash &&
    ~~(Date.now() / 100) % 2 === 0
  ) {
    return;
  }

  drawSnake();
}

// ==============================
// DIBUJAR CUADRÍCULA
// ==============================

function drawCells() {
  for (let i = 0; i < cellsNo; ++i) {
    for (let j = 0; j < cellsNo; ++j) {
      drawCell(i, j);
    }
  }
}

function drawCell(i, j) {
  ctx.strokeRect(
    i * cellSize,
    j * cellSize,
    cellSize,
    cellSize
  );
}

// ==============================
// RELLENAR CELDA (SERPIENTE)
// ==============================

function fillCell(x, y) {
  ctx.fillRect(
    x * cellSize,
    y * cellSize,
    cellSize,
    cellSize
  );
  ctx.strokeRect(
    x * cellSize,
    y * cellSize,
    cellSize,
    cellSize
  );
}

// ==============================
// DIBUJAR COMIDA
// ==============================

function drawFood() {
  if (!food || !foodType) {
    return;
  }

  const x = food.x * cellSize;
  const y = food.y * cellSize;

  const centerX = x + cellSize / 2;
  const centerY = y + cellSize / 2;

  // ============================
  // AREPA
  // ============================

  if (foodType === "arepa") {
    ctx.beginPath();

    ctx.arc(
      centerX,
      centerY,
      cellSize * 0.38,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = "#F4C542";
    ctx.fill();

    ctx.strokeStyle = "#B8860B";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pequeño detalle de la arepa
    ctx.beginPath();

    ctx.arc(
      centerX,
      centerY,
      cellSize * 0.25,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle = "#E0A82E";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // ============================
  // TAMAL
  // ============================

  if (foodType === "tamal") {
    const margin = cellSize * 0.15;
    const size = cellSize - margin * 2;

    // Cuerpo del tamal
    ctx.fillStyle = "#4F8F3A";

    ctx.fillRect(
      x + margin,
      y + margin,
      size,
      size
    );

    // Borde
    ctx.strokeStyle = "#245C2A";
    ctx.lineWidth = 2;

    ctx.strokeRect(
      x + margin,
      y + margin,
      size,
      size
    );

    // Amarre horizontal
    ctx.beginPath();

    ctx.moveTo(
      x + margin,
      centerY
    );

    ctx.lineTo(
      x + margin + size,
      centerY
    );

    // Amarre vertical
    ctx.moveTo(
      centerX,
      y + margin
    );

    ctx.lineTo(
      centerX,
      y + margin + size
    );

    ctx.strokeStyle = "#E6C34A";
    ctx.lineWidth = 2;

    ctx.stroke();
  }

  // Restaurar los colores originales
  ctx.strokeStyle = "#27373F";
  ctx.fillStyle = "rgb(14, 198, 14)";
}

// ==============================
// DIBUJAR SERPIENTE
// ==============================

function drawSnake() {
  snake.forEach(({ x, y }, index) => {

    // Patrón de la coral sangileña
    // Rojo → amarillo → negro → amarillo
    const pattern = index % 4;

    if (pattern === 0) {
      ctx.fillStyle = "#C62828";
    } 
    else if (pattern === 1) {
      ctx.fillStyle = "#F2D32C";
    } 
    else if (pattern === 2) {
      ctx.fillStyle = "#171717";
    } 
    else {
      ctx.fillStyle = "#F2D32C";
    }

    fillCell(x, y);
  });

  // Restaurar el color original
  ctx.fillStyle = "rgb(14, 198, 14)";
}

// ==============================
// PUNTUACIÓN
// ==============================

function setScore(next) {
  score = next;
  scoreVal.textContent = score;
}

// ==============================
// INICIAR / REINICIAR JUEGO
// ==============================

function startGame() {
  btnStart.textContent = "restart";

  flash = false;
  gameOver = false;

  lastKeyPressed = null;

  food = null;
  foodType = null;

  setScore(0);

  direction = DIR.LEFT;

  lastFood = Date.now();
  lastUpdate = Date.now();

  paused = false;

  btnPause.textContent = "pause";

  updateHighScoreDisplay();

  const startX = Math.floor(cellsNo / 2);

  snake = [
    startX,
    startX + 1,
    startX + 2,
    startX + 3,
  ].map((x) => ({
    x,
    y: 15,
  }));

  putFood();
}

// ==============================
// BUCLE PRINCIPAL
// ==============================

function loop() {
  requestAnimationFrame(loop);

  draw();

  if (paused) {
    return;
  }

  update();
}

// ==============================
// INICIALIZACIÓN
// ==============================

updateHighScoreDisplay();

requestAnimationFrame(loop);

// ==============================
// BOTÓN START
// ==============================

btnStart.addEventListener(
  "click",
  startGame
);

// ==============================
// BOTÓN PAUSA
// ==============================

btnPause.addEventListener(
  "click",
  pause
);

function pause() {
  paused = !paused;

  btnPause.textContent = paused
    ? "resume"
    : "pause";
}

// ==============================
// TECLADO
// ==============================

window.addEventListener(
  "keydown",
  onKeyDown
);

function onKeyDown({ keyCode }) {
  switch (true) {
    case keyCode === DIR.DOWN &&
      direction === DIR.UP:

    case keyCode === DIR.UP &&
      direction === DIR.DOWN:

    case keyCode === DIR.LEFT &&
      direction === DIR.RIGHT:

    case keyCode === DIR.RIGHT &&
      direction === DIR.LEFT:

      return;
  }

  lastKeyPressed = keyCode;
}

// ==============================
// CAMBIAR DIRECCIÓN
// ==============================

function setDirection(keyCode) {
  if (
    (keyCode === DIR.DOWN &&
      direction === DIR.UP) ||

    (keyCode === DIR.UP &&
      direction === DIR.DOWN) ||

    (keyCode === DIR.LEFT &&
      direction === DIR.RIGHT) ||

    (keyCode === DIR.RIGHT &&
      direction === DIR.LEFT)
  ) {
    return;
  }

  direction = keyCode;
}

// ==============================
// COMPROBAR POSICIÓN DE COMIDA
// ==============================

function checkFood() {
  if (!food) {
    return;
  }

  if (food.x >= cellsNo) {
    food.x = cellsNo - 1;
  }

  if (food.y >= cellsNo) {
    food.y = cellsNo - 1;
  }
}

// ==============================
// SLIDER DE DIFICULTAD
// ==============================

class RangeSlider {
  constructor(el, cb) {
    this.input = el.querySelector("input");

    this.slider =
      el.querySelector(".range_inputSlider");

    this.value =
      el.querySelector(".range_inputValue");

    this.input.addEventListener(
      "input",
      () => this.onChange()
    );

    this.input.addEventListener(
      "keydown",
      (e) => {
        e.preventDefault();
      }
    );

    this.onChangeCallback = cb;

    this.onChange();
  }

  onChange() {
    this.value.textContent =
      this.input.value;

    this.slider.style.transform =
      `scaleX(${
        this.input.value /
        this.input.step /
        10
      })`;

    this.onChangeCallback(
      this.input.value
    );
  }
}

// ==============================
// CONTROL DE DIFICULTAD
// ==============================

new RangeSlider(
  document.querySelector(
    ".range-difficulty"
  ),

  (value) => {
    difficulty = Number(value);
  }
);

// ==============================
// CONTROL DEL NÚMERO DE CELDAS
// ==============================

new RangeSlider(
  document.querySelector(
    ".range-columns"
  ),

  (value) => {
    cellsNo = Number(value);

    cellSize = 400 / cellsNo;

    checkFood();
  }
);

// ==============================
// CONTROLES TÁCTILES
// ==============================

let isPointerDown;
let pointerStart;
let pointerPos;

function onTouchStart(e) {
  const {
    clientX,
    clientY
  } = e.touches[0];

  isPointerDown = true;

  pointerStart = {
    x: clientX,
    y: clientY
  };

  pointerPos =
    Object.assign({}, pointerStart);
}

function onTouchMove(e) {
  const {
    clientX,
    clientY
  } = e.touches[0];

  pointerPos = {
    x: clientX,
    y: clientY
  };
}

function onTouchEnd() {
  if (!isPointerDown) {
    return;
  }

  isPointerDown = false;

  const deltaX =
    pointerStart.x -
    pointerPos.x;

  const deltaY =
    pointerStart.y -
    pointerPos.y;

  const keyCode =
    touchToKeyCode(
      deltaX,
      deltaY
    );

  if (keyCode) {
    onKeyDown({
      keyCode
    });
  }
}

// ==============================
// CONVERTIR MOVIMIENTO TÁCTIL
// ==============================

function touchToKeyCode(x, y) {
  let keyCode;

  if (Math.abs(x) > Math.abs(y)) {
    if (x < -1) {
      keyCode = DIR.RIGHT;
    } else if (x > 1) {
      keyCode = DIR.LEFT;
    }
  } else {
    if (y < -1) {
      keyCode = DIR.DOWN;
    } else if (y > 1) {
      keyCode = DIR.UP;
    }
  }

  return keyCode;
}

canvas.addEventListener(
  "touchstart",
  onTouchStart
);

window.addEventListener(
  "touchmove",
  onTouchMove
);

window.addEventListener(
  "touchend",
  onTouchEnd
);

// ==============================
// BOTONES DIRECCIONALES
// ==============================

const btnUp =
  document.querySelector(".btn-up");

const btnDown =
  document.querySelector(".btn-down");

const btnLeft =
  document.querySelector(".btn-left");

const btnRight =
  document.querySelector(".btn-right");

// Arriba
btnUp.addEventListener(
  "click",
  () => {
    setDirection(DIR.UP);
  }
);

// Abajo
btnDown.addEventListener(
  "click",
  () => {
    setDirection(DIR.DOWN);
  }
);

// Izquierda
btnLeft.addEventListener(
  "click",
  () => {
    setDirection(DIR.LEFT);
  }
);

// Derecha
btnRight.addEventListener(
  "click",
  () => {
    setDirection(DIR.RIGHT);
  }
);