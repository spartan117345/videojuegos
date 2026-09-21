// 1. Referencias del HTML
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const playButton = document.getElementById('play-button');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');

// Configuración del tablero (10 columnas x 20 filas)
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;

// Dimensionar el lienzo en píxeles reales
canvas.width = COLS * BLOCK_SIZE;   // 240px
canvas.height = ROWS * BLOCK_SIZE;  // 480px

// Escalamos el contexto para trabajar con unidades de 1x1 bloque
ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

// Colores Sangileños
const COLORS = [
  null,
  '#00B4D8', // Azul Río Fonce
  '#D4A373', // Piedra Barichara
  '#E07A5F', // Atardecer Chicamocha
  '#F4A261', // Hormiga Culona Dorada
  '#2A9D8F', // Hojas Gallineral
  '#6F4E37', // Café Sangileño
  '#E76F51'  // Kayak
];

// Definición de una pieza de prueba (Tetramino "T")
let piece = {
  x: 3,
  y: 0,
  colorIndex: 1,
  shape: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ]
};

// Variables de control de tiempo y animación
let requestId = null;
let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000; // Cae cada 1 segundo (1000ms)

let score = 0;
let lines = 0;
let level = 1;

// 2. Iniciar el juego
function play() {
  resetGame();

  if (requestId) {
    cancelAnimationFrame(requestId);
  }

  // Escuchar teclado para los movimientos
  document.removeEventListener('keydown', handleKeyPress);
  document.addEventListener('keydown', handleKeyPress);

  lastTime = performance.now();
  animate();
}

function resetGame() {
  score = 0;
  lines = 0;
  level = 1;
  piece.x = 3;
  piece.y = 0;
  updateScore();
}

function updateScore() {
  if (scoreElement) scoreElement.innerText = score;
  if (levelElement) levelElement.innerText = level;
  if (linesElement) linesElement.innerText = lines;
}

// Dibujar la pieza en el canvas
function drawPiece() {
  ctx.fillStyle = COLORS[piece.colorIndex];
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value > 0) {
        ctx.fillRect(piece.x + x, piece.y + y, 1, 1);
      }
    });
  });
}

// Bucle de juego con temporizador basado en tiempo real
function animate(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    piece.y++;
    // Si llega al fondo (fila 18 considerando el alto de la pieza)
    if (piece.y > ROWS - 2) {
      piece.y = 0; // Reiniciar arriba para la prueba
    }
    dropCounter = 0;
  }

  // Limpiar lienzo (dibujar fondo oscuro del río)
  ctx.fillStyle = '#0b132b';
  ctx.fillRect(0, 0, COLS, ROWS);

  // Dibujar pieza actual
  drawPiece();

  requestId = requestAnimationFrame(animate);
}

// Controles de movimiento
function handleKeyPress(event) {
  if (event.key === 'ArrowLeft' && piece.x > 0) {
    piece.x--;
  } else if (event.key === 'ArrowRight' && piece.x < COLS - 3) {
    piece.x++;
  } else if (event.key === 'ArrowDown') {
    piece.y++;
  }
}

// 3. Vincular el botón de inicio
if (playButton) {
  playButton.addEventListener('click', () => {
    play();
  });
}