const gc = document.querySelector('#game_console');
var cols = 40; // 40 columnas
var rows = 22; // 22 filas
const tile_size = 25; // 1000px / 40 = 25px por bloque
const pl_size = 25; // Ancho y alto del personaje (25px)

document.body.style.setProperty('--tile-line-height', (tile_size * 2) + 'px');
gc.style.width = '1000px';
gc.style.height = (tile_size * rows) + 'px';

var gravity = 8, x_speed = 5, dead = false, d = {}, dbljump = false, timer = 0, level_num = -1, deaths = 0;
var timerInterval = null;

const levels = [
  { start:'19.5,0', map: [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,9,9,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8] },
  { start:'19.5,0', map: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0, 9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,8,8,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,8,8,8,8,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,8,8,8,8,8,8,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0, 8,8,8,8,0,1,1,1,1,1,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,1,1,1,1,1,0,8,8,8,8, 8,8,8,8,0,2,2,2,2,2,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,2,2,2,2,2,0,8,8,8,8, 8,8,8,8,0,0,0,0,0,0,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,8,8,8,8] },
  { start:'2,13', map: [8,8,8,8,8,8,8,8,0,0,0,0,0,0,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 8,0,0,0,0,8,8,8,0,1,1,1,1,0,8,8,8,0,0,0,0,0,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 8,0,1,1,0,8,8,8,0,1,1,1,1,0,8,0,0,0,1,1,1,0,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 8,0,1,1,0,8,8,8,0,1,1,1,1,0,8,0,1,1,1,1,1,0,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 8,0,1,1,0,8,8,8,0,1,1,1,1,0,8,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 8,0,1,1,0,8,8,8,0,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 8,0,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 8,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0, 0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,8,8,8,8,8,8, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,8,8,8,8,8, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,3,0,8,8,8,8,8, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,0,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,8,8,8, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,8, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,8, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,8, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,0,2,2,2,2,1,1,1,1,1,1,1,1,1,1,0,0,8,8, 1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,0,8,8,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,8,8, 1,1,1,1,1,1,1,1,1,1,0,8,0,1,1,1,1,1,0,8,8,8,8,8,8,0,1,1,1,1,1,1,1,1,1,1,1,0,0,8, 0,0,0,0,0,1,1,1,1,1,0,8,0,2,2,2,2,2,0,8,8,8,8,8,8,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0, 8,8,8,8,0,1,1,1,1,1,0,8,0,0,0,0,0,0,0,8,8,8,8,8,8,0,2,2,2,1,1,1,1,1,1,1,1,1,1,0, 8,8,8,8,0,2,2,2,2,2,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,2,2,2,2,2,2,2,2,2,2,0, 8,8,8,8,0,0,0,0,0,0,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0] },
  { start: '1,2', map: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,0, 1,1,1,1,1,1,1,1,0,1,1,1,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,0,1,1,1,1,1,1,1,0, 1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0, 1,1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,4,1,1,1,1,6,1,1,0, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0, 1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0, 0,0,0,0,0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,0,0,0,0,0,0, 0,1,1,1,1,0,1,1,0,1,1,1,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,1,1,1,0,1,1,0,1,1,1,1,0, 0,1,1,1,1,0,2,2,0,2,2,2,0,2,2,2,2,2,2,0,0,2,2,2,2,2,2,0,2,2,2,0,2,2,0,1,1,1,1,0, 0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0, 0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,4,1,1,1,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,1,1,1,4,1,1,1,1,1,1,1,9, 0,1,7,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,9, 0,1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,1,1,1,0,0,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1,1,1,1,9, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,9, 0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,0,0, 8,8,8,8,0,1,1,1,0,1,1,1,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,8,8,8,8, 8,8,8,8,0,2,2,2,0,2,2,2,0,2,2,2,2,2,2,0,0,2,2,2,2,2,2,0,2,2,2,0,2,2,2,0,8,8,8,8, 8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,8,8,8] },
  { start: '1,2', map: [0,0,0,0,0,8,8,8,0,0,0,0,0,0,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 1,1,1,1,0,0,0,0,0,4,4,4,4,0,8,8,8,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0, 1,1,1,1,1,1,1,1,0,1,1,1,1,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0, 1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0, 1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0, 1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0, 1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0, 0,0,0,0,0,0,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,0, 0,0,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,0, 0,1,1,1,1,1,1,1,0,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0, 0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,0, 0,1,1,1,0,0,0,0,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,9, 0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,9, 0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,9, 0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,0,1,1,1,9, 0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,0,1,0,1,1,1,9, 0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,8,0,1,1,1,1,1,1,1,1,1,0,1,1,1,9, 0,0,0,0,0,1,1,1,1,1,1,1,0,2,2,2,2,2,0,0,0,0,0,0,8,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0, 8,8,8,8,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,8,8,8,8,8,8,0,2,2,2,1,1,1,1,1,1,0,8,8,8,8, 8,8,8,8,0,2,2,2,2,2,0,0,0,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,1,1,1,1,1,1,0,8,8,8,8, 8,8,8,8,0,0,0,0,0,0,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,8,8,8,8] },
  { start: '2,13', map: [8,8,8,8,8,8,8,8,0,0,0,0,0,0,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 8,0,0,0,0,8,8,8,0,1,1,1,1,0,8,8,8,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 8,0,1,1,0,8,8,8,0,1,1,1,1,0,8,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 8,0,1,1,0,8,8,8,0,1,1,1,1,0,8,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 8,0,1,1,0,8,8,8,0,1,1,1,1,0,8,0,1,1,1,1,1,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 8,0,1,1,0,8,8,8,0,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 8,0,1,1,0,0,0,0,0,1,1,1,1,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9, 8,0,1,1,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0, 0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,8,8,8,8,8,8, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,8,8,8,8,8, 0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,8,8,8,8,8, 0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,8,8,8, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,8, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,8, 1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,8,8,8, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,8,8, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,8, 0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0, 8,8,8,8,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0, 8,8,8,8,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0, 8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] }
];

function getTileAt(col, row) {
  if (col < 0 || col >= cols || row < 0 || row >= rows) return 0; // Out of bounds is solid ground
  return levels[level_num].map[row * cols + col];
}

function isSolidTile(val) {
  return val === 0 || val === 8;
}

function secondsToTime(e) {
  var h = Math.floor(e / 3600).toString().padStart(2, '0'),
      m = Math.floor(e % 3600 / 60).toString().padStart(2, '0'),
      s = Math.floor(e % 60).toString().padStart(2, '0');
  return h + ':' + m + ':' + s;
}

function buildGame() {
  gc.innerHTML = "<div id='player2'></div><div id='game_alert'></div><div id='deaths_counter'></div><div id='time_counter'></div>";

  if (level_num < levels.length - 1) {
    level_num++;
  } else {
    level_num = 0;
  }

  // Reiniciar tiempo y muertes al volver al Nivel 0
  if (level_num === 0) {
    timer = 0;
    deaths = 0;
  }

  let tc = document.querySelector('#time_counter');
  let dc = document.querySelector('#deaths_counter');
  tc.innerHTML = 'TIME<br>' + secondsToTime(timer);
  dc.innerHTML = 'DEATHS<br>' + deaths;

  for (var i = 0; i < cols * rows; i++) {
    var dTile = document.createElement('div');
    dTile.className = 'tile';
    let val = levels[level_num].map[i];
    if (val === 0) dTile.className = 'tile ground';
    if (val === 2) dTile.className = 'tile lava';
    if (val === 3) dTile.className = 'tile lava spleft';
    if (val === 4) dTile.className = 'tile lava sptop';
    if (val === 5) dTile.className = 'tile lava spright';
    if (val === 6) dTile.className = 'tile portal1';
    if (val === 7) dTile.className = 'tile portal2';
    if (val === 8) dTile.className = 'tile innerwall';
    if (val === 9) dTile.className = 'tile nextlevel';

    dTile.setAttribute('grid_loc', (i % cols) + ',' + Math.floor(i / cols));
    dTile.style.width = tile_size + 'px';
    dTile.style.height = tile_size + 'px';
    dTile.style.position = 'absolute';
    dTile.style.left = (i % cols) * tile_size + 'px';
    dTile.style.top = Math.floor(i / cols) * tile_size + 'px';

    gc.appendChild(dTile);
  }

  const ga = document.querySelector('#game_alert');
  var pl = document.querySelector('#player2');
  pl.style.width = tile_size + 'px';
  pl.style.height = tile_size + 'px';

  let startParts = levels[level_num].start.split(',');
  var posX = parseFloat(startParts[0]) * tile_size;
  var posY = parseFloat(startParts[1]) * tile_size;
  var velY = 0;
  
  pl.style.left = posX + 'px';
  pl.style.top = posY + 'px';

  ga.innerHTML = 'Flechas para moverte y saltar<br>Doble salto / Deslizar por paredes (R para reiniciar)';
  ga.style.opacity = '1';
  setTimeout(() => { ga.style.opacity = '0'; }, 3000);

  function resetPlayerToStart() {
    let startParts = levels[level_num].start.split(',');
    posX = parseFloat(startParts[0]) * tile_size;
    posY = parseFloat(startParts[1]) * tile_size;
    velY = 0;
    pl.style.left = posX + 'px';
    pl.style.top = posY + 'px';
  }

  function gameLoop() {
    // 1. Movimiento Horizontal
    var moveX = 0;
    if (d[37] || d[65]) moveX -= x_speed; // Izquierda
    if (d[39] || d[68]) moveX += x_speed; // Derecha

    var onWallLeft = false;
    var onWallRight = false;

    if (moveX < 0) {
      // Probar mover a la izquierda
      var nextX = posX + moveX;
      var c1 = Math.floor(nextX / tile_size);
      var r1 = Math.floor(posY / tile_size);
      var r2 = Math.floor((posY + pl_size - 1) / tile_size);

      if (isSolidTile(getTileAt(c1, r1)) || isSolidTile(getTileAt(c1, r2))) {
        // Colisión con pared izquierda: ajustar pegado a la pared
        posX = (c1 + 1) * tile_size;
        onWallLeft = true;
        pl.className = '';
      } else {
        posX = nextX;
        pl.className = 'goleft';
      }
    } else if (moveX > 0) {
      // Probar mover a la derecha
      var nextX = posX + moveX;
      var c1 = Math.floor((nextX + pl_size - 1) / tile_size);
      var r1 = Math.floor(posY / tile_size);
      var r2 = Math.floor((posY + pl_size - 1) / tile_size);

      if (isSolidTile(getTileAt(c1, r1)) || isSolidTile(getTileAt(c1, r2))) {
        // Colisión con pared derecha: ajustar pegado a la pared
        posX = c1 * tile_size - pl_size;
        onWallRight = true;
        pl.className = '';
      } else {
        posX = nextX;
        pl.className = 'goright';
      }
    } else {
      pl.className = '';
    }

    // Limites de pantalla horizontales
    if (posX < 0) posX = 0;
    if (posX > 1000 - pl_size) posX = 1000 - pl_size;

    // 2. Gravedad y Salto de Pared
    var onGround = false;
    // Comprobar si los pies están sobre suelo firme
    var footC1 = Math.floor((posX + 2) / tile_size);
    var footC2 = Math.floor((posX + pl_size - 3) / tile_size);
    var footR = Math.floor((posY + pl_size + 1) / tile_size);

    if (isSolidTile(getTileAt(footC1, footR)) || isSolidTile(getTileAt(footC2, footR))) {
      onGround = true;
    }

    if (onGround) {
      velY = 0;
      dbljump = false;
      pl.style.transform = 'rotate(0deg)';
    } else {
      // Deslizamiento en pared (Wall Slide)
      if ((onWallLeft || onWallRight) && velY > 0) {
        velY = 1.5; // Deslizamiento suave
        dbljump = false;
        pl.style.transform = onWallLeft ? 'rotate(90deg)' : 'rotate(-90deg)';
      } else {
        velY += 0.5; // Aceleración por gravedad
        if (velY > 8) velY = 8; // Velocidad máxima de caída
      }
    }

    // Acciones de Salto (Teclas Arriba, W, Espacio)
    if (d[38] || d[87] || d[32]) {
      if (onGround) {
        velY = -9;
        dbljump = false;
        d[38] = d[87] = d[32] = false; // Consumir tecla
      } else if (onWallLeft) {
        velY = -8.5;
        posX += 4;
        dbljump = false;
        d[38] = d[87] = d[32] = false;
      } else if (onWallRight) {
        velY = -8.5;
        posX -= 4;
        dbljump = false;
        d[38] = d[87] = d[32] = false;
      } else if (!dbljump) {
        velY = -8.5;
        dbljump = true;
        d[38] = d[87] = d[32] = false;
      }
    }

    // Movimiento Vertical con ajuste exacto de colisión
    var nextY = posY + velY;

    if (velY < 0) {
      // Saltando hacia arriba (comprobar techo)
      var headC1 = Math.floor((posX + 2) / tile_size);
      var headC2 = Math.floor((posX + pl_size - 3) / tile_size);
      var headR = Math.floor(nextY / tile_size);

      if (isSolidTile(getTileAt(headC1, headR)) || isSolidTile(getTileAt(headC2, headR))) {
        posY = (headR + 1) * tile_size;
        velY = 0;
      } else {
        posY = nextY;
      }
    } else if (velY > 0) {
      // Cayendo hacia abajo (comprobar suelo)
      var footC1 = Math.floor((posX + 2) / tile_size);
      var footC2 = Math.floor((posX + pl_size - 3) / tile_size);
      var footR = Math.floor((nextY + pl_size) / tile_size);

      if (isSolidTile(getTileAt(footC1, footR)) || isSolidTile(getTileAt(footC2, footR))) {
        posY = footR * tile_size - pl_size;
        velY = 0;
        onGround = true;
      } else {
        posY = nextY;
      }
    }

    // Actualizar posición DOM
    pl.style.left = posX + 'px';
    pl.style.top = posY + 'px';

    // 3. Verificación de Interacciones (Lava, Portales, Siguiente Nivel)
    // Se toma el centro exacto del personaje
    var centerCol = Math.floor((posX + pl_size * 0.5) / tile_size);
    var centerRow = Math.floor((posY + pl_size * 0.5) / tile_size);
    var centerTile = getTileAt(centerCol, centerRow);

    // Muerte por Lava (2, 3, 4, 5)
    if ([2, 3, 4, 5].includes(centerTile)) {
      deaths++;
      dc.innerHTML = 'DEATHS<br>' + deaths;
      resetPlayerToStart();
      return setTimeout(gameLoop, 1000 / 45);
    }

    // Portal (6 -> 7)
    if (centerTile === 6) {
      let p2 = document.querySelector('.portal2');
      if (p2) {
        let p2_grid = p2.getAttribute('grid_loc').split(',');
        posX = parseFloat(p2_grid[0]) * tile_size;
        posY = parseFloat(p2_grid[1]) * tile_size;
        pl.style.left = posX + 'px';
        pl.style.top = posY + 'px';
      }
    }

    // Pasar de Nivel (9)
    if (centerTile === 9) {
      buildGame();
      return;
    }

    playerTrail(pl);
    setTimeout(gameLoop, 1000 / 45);
  }

  gameLoop();
}

// Iniciar temporizador global
if (!timerInterval) {
  timerInterval = setInterval(() => {
    timer++;
    let tc = document.querySelector('#time_counter');
    if (tc) tc.innerHTML = 'TIME<br>' + secondsToTime(timer);
  }, 1000);
}

function playerTrail(pl) {
  let gc_loc = gc.getBoundingClientRect();
  let pl_loc = pl.getBoundingClientRect();
  let b = document.createElement('div');
  b.className = 'trailBall';
  let xx = Math.floor(Math.random() * 15) + 5;
  b.style.left = (pl_loc.left + xx - gc_loc.left) + 'px';
  b.style.top = (pl_loc.top - 3 - gc_loc.top) + 'px';
  b.onanimationend = function () { b.remove(); };
  gc.appendChild(b);
}

// Eventos de teclado globales
window.addEventListener('keydown', function (e) {
  let key = e.keyCode || e.which;
  d[key] = true;
  if ([37, 38, 39, 40, 32].includes(key)) {
    e.preventDefault();
  }
  // Tecla R para reiniciar el nivel
  if (key === 82 || e.key === 'r' || e.key === 'R') {
    let startParts = levels[level_num].start.split(',');
    let pl = document.querySelector('#player2');
    if (pl) {
      pl.style.left = (tile_size * parseFloat(startParts[0])) + 'px';
      pl.style.top = (tile_size * parseFloat(startParts[1])) + 'px';
    }
  }
});

window.addEventListener('keyup', function (e) {
  let key = e.keyCode || e.which;
  d[key] = false;
  let pl = document.querySelector('#player2');
  if (pl) {
    pl.className = '';
    pl.style.transform = 'rotate(0deg)';
  }
});

window.addEventListener('load', buildGame);
