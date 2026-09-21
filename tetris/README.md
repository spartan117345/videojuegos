````markdown
# Tres en Raya

Un juego clásico de **Tres en Raya** desarrollado utilizando **HTML, CSS y JavaScript**.

El proyecto comenzó con una estructura sencilla y posteriormente fue mejorado para tener una apariencia más moderna, limpia y similar a la interfaz de un videojuego web.

---

## Descripción

**Tres en Raya** es un juego para dos jugadores en el que cada jugador utiliza un símbolo:

- **X**
- **O**

El objetivo es conseguir tres símbolos iguales en línea, ya sea:

- Horizontalmente
- Verticalmente
- Diagonalmente

El juego detecta automáticamente cuándo un jugador gana o cuándo se produce un empate.

---

## Tecnologías utilizadas

El proyecto está desarrollado completamente con tecnologías web:

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura de la página |
| CSS3 | Diseño y apariencia visual |
| JavaScript | Lógica y funcionamiento del juego |

No se utilizan frameworks ni librerías externas.

---

## Estructura del proyecto

```text
tres-en-raya/
│
├── index.html
├── style.css
├── script.js
└── README.md
````

### `index.html`

Contiene la estructura principal del juego:

* Título
* Información de la partida
* Tablero
* Nueve casillas
* Botón para comenzar una nueva partida

### `style.css`

Controla toda la apariencia visual:

* Fondo
* Tipografía
* Colores
* Tablero
* Casillas
* Botones
* Animaciones
* Efectos `hover`
* Adaptación para dispositivos móviles

### `script.js`

Contiene la lógica del juego:

* Turnos
* Colocación de X y O
* Comprobación de victorias
* Comprobación de empates
* Deshabilitación de casillas
* Reinicio de partidas

---

# Mejoras realizadas

El proyecto fue actualizado visualmente para dejar atrás el diseño básico original y conseguir una interfaz más moderna.

## 1. Nuevo fondo

Anteriormente el proyecto utilizaba principalmente un fondo sencillo.

Ahora se utiliza un degradado:

```css
background: linear-gradient(135deg, #111827, #1e1b4b, #312e81);
```

Esto proporciona una apariencia más moderna y crea una sensación de profundidad en la interfaz.

---

## 2. Diseño centrado

El contenedor principal utiliza Flexbox:

```css
.contenedor-juego {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
```

Esto permite colocar todos los elementos del juego en el centro de la pantalla.

También se utiliza:

```css
min-height: 100vh;
```

para que el contenido ocupe como mínimo toda la altura de la ventana.

---

## 3. Nuevo título

El título fue mejorado para darle una apariencia más cercana a la interfaz de un videojuego.

Ahora se utiliza:

```html
<span class="subtitulo">JUEGO CLÁSICO</span>
<h1>TRES EN RAYA</h1>
```

El texto:

```text
JUEGO CLÁSICO
```

funciona como subtítulo, mientras que:

```text
TRES EN RAYA
```

es el título principal.

---

## 4. Mejoras en la tipografía

El título principal utiliza una fuente de mayor tamaño y peso:

```css
.juego-titulo {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: 0.1rem;
}
```

También se añadió un efecto de sombra:

```css
text-shadow: 0 0 1rem rgba(255, 255, 255, 0.25);
```

Esto hace que el título destaque sobre el fondo.

---

# Nuevo diseño del tablero

Una de las principales modificaciones fue el diseño de la cuadrícula.

El tablero continúa utilizando CSS Grid:

```css
.juego-cuadricula {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
```

Esto permite crear las tres columnas necesarias para el Tres en Raya.

Además, se agregó separación entre las casillas:

```css
gap: 0.7rem;
```

---

## Efecto de vidrio

El tablero ahora utiliza una apariencia inspirada en el diseño **Glassmorphism**.

Se utiliza:

```css
background: rgba(255, 255, 255, 0.08);
```

junto con:

```css
border: 1px solid rgba(255, 255, 255, 0.15);
```

y:

```css
backdrop-filter: blur(10px);
```

Esto crea una superficie semitransparente sobre el fondo.

---

## Bordes redondeados

El tablero utiliza:

```css
border-radius: 1.2rem;
```

Esto elimina la apariencia completamente cuadrada del diseño original y proporciona una interfaz más moderna.

---

# Mejoras en las casillas

Cada casilla utiliza la clase:

```css
.cuadro
```

Las dimensiones fueron aumentadas:

```css
width: 6rem;
height: 6rem;
```

También se añadieron bordes redondeados:

```css
border-radius: 0.8rem;
```

y un fondo oscuro:

```css
background: rgba(17, 24, 39, 0.9);
```

---

## Efecto Hover

Cuando el cursor pasa sobre una casilla, cambia su apariencia:

```css
.cuadro:hover {
  background: rgba(55, 65, 81, 0.95);
  transform: translateY(-3px);
}
```

La casilla se desplaza ligeramente hacia arriba.

También se utiliza una sombra:

```css
box-shadow:
  0 0 1rem rgba(99, 102, 241, 0.35);
```

Esto proporciona una respuesta visual al usuario.

---

## Efecto al hacer clic

También se añadió:

```css
.cuadro:active {
  transform: scale(0.95);
}
```

Cuando el usuario presiona una casilla, esta se reduce ligeramente.

Esto hace que la interacción se sienta más dinámica.

---

# Transiciones

Las casillas utilizan transiciones:

```css
transition:
  transform 0.2s ease,
  background 0.2s ease,
  box-shadow 0.2s ease;
```

Esto evita cambios bruscos y hace que las animaciones sean más suaves.

---

# Nuevo botón

El botón original era un elemento `div`.

Ahora se utiliza correctamente un elemento HTML:

```html
<button id="juego-boton" class="juego-boton" type="button">
  Volver a jugar
</button>
```

Esto mejora la semántica del HTML y hace que el elemento sea reconocido como un botón real por el navegador.

---

## Diseño del botón

El botón utiliza un degradado:

```css
background: linear-gradient(135deg, #6366f1, #8b5cf6);
```

También tiene bordes redondeados:

```css
border-radius: 0.7rem;
```

y una sombra:

```css
box-shadow:
  0 0.5rem 1.5rem rgba(99, 102, 241, 0.3);
```

---

## Hover del botón

Cuando el usuario pasa el cursor sobre el botón:

```css
.juego-boton:hover {
  transform: translateY(-2px);
}
```

El botón se mueve ligeramente hacia arriba.

También aumenta la sombra para crear un efecto de elevación.

---

# Diseño responsive

El juego también fue preparado para pantallas pequeñas.

Se utiliza una Media Query:

```css
@media (max-width: 480px) {
```

Dentro de ella se reducen algunos tamaños:

```css
.cuadro {
  width: 5rem;
  height: 5rem;
}
```

También se reduce el tamaño del título:

```css
.juego-titulo {
  font-size: 2rem;
}
```

De esta manera, el tablero puede adaptarse mejor a teléfonos y pantallas pequeñas.

---

# Mejoras realizadas en HTML

Además del diseño visual, también se realizaron algunos cambios en la estructura HTML.

## Uso de `main`

El contenedor principal pasó de ser un `div` a:

```html
<main class="contenedor-juego">
```

Esto representa de manera más apropiada el contenido principal de la página.

---

## Uso de `header`

El título se encuentra dentro de:

```html
<header class="juego-titulo">
```

Esto permite separar semánticamente la cabecera del juego del resto de elementos.

---

## Casillas accesibles

Las casillas incluyen:

```html
role="button"
```

y:

```html
tabindex="0"
```

Por ejemplo:

```html
<div class="cuadro" role="button" tabindex="0"></div>
```

`tabindex="0"` permite que las casillas puedan recibir el foco mediante el teclado.

---

# Funcionamiento de JavaScript

El archivo `script.js` contiene la lógica principal del juego.

## Selección de las casillas

JavaScript obtiene las nueve casillas mediante:

```javascript
const cuadro_btn = document.querySelectorAll(".cuadro");
```

Esto permite trabajar con todas las casillas del tablero.

---

## Información del juego

El mensaje mostrado al jugador se controla mediante:

```javascript
const info = document.getElementById("juego-info");
```

Este elemento muestra mensajes como:

```text
Presione cualquier cuadro para iniciar
```

o:

```text
"X" Gana
```

y:

```text
Empate
```

---

# Combinaciones ganadoras

El juego utiliza un arreglo llamado:

```javascript
var pWin = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];
```

Estas son las ocho combinaciones posibles para ganar.

### Horizontales

```text
0 1 2
3 4 5
6 7 8
```

Las combinaciones son:

```text
0 - 1 - 2
3 - 4 - 5
6 - 7 - 8
```

### Verticales

```text
0 - 3 - 6
1 - 4 - 7
2 - 5 - 8
```

### Diagonales

```text
0 - 4 - 8
2 - 4 - 6
```

---

# Sistema de turnos

El programa utiliza la variable:

```javascript
var i = 1;
```

para controlar quién comienza.

Dependiendo del valor de `i`, se coloca:

```javascript
"X"
```

o:

```javascript
"O"
```

Después de cada movimiento:

```javascript
i++;
```

Cuando llega al tercer valor vuelve a comenzar:

```javascript
i == 3 ? (i = 1) : 0;
```

---

# Comprobación de victoria

La función:

```javascript
function comprobar()
```

se encarga de comprobar si alguno de los jugadores consiguió una combinación ganadora.

Por ejemplo:

```javascript
if (
  cuadro_btn[pWin[j][0]].innerHTML === "X" &&
  cuadro_btn[pWin[j][1]].innerHTML === "X" &&
  cuadro_btn[pWin[j][2]].innerHTML === "X"
)
```

Si las tres posiciones contienen `X`, el jugador gana.

El mensaje cambia a:

```javascript
info.innerHTML = '"X" Gana';
```

Lo mismo ocurre con el jugador `O`.

---

# Detección de empate

Después de comprobar las victorias, el programa revisa si las nueve casillas están ocupadas.

Si todas están ocupadas y ningún jugador ganó:

```javascript
info.innerHTML = "Empate";
```

La partida termina y las casillas quedan deshabilitadas.

---

# Deshabilitación de casillas

La función:

```javascript
function deshabilitarCasillas(y)
```

evita que el jugador pueda continuar haciendo movimientos después de terminar la partida.

Se utiliza:

```javascript
pointer-events: none;
```

para impedir que las casillas puedan seguir recibiendo clics.

---

# Reiniciar el juego

El botón:

```html
<button id="juego-boton">
```

permite comenzar una nueva partida.

JavaScript obtiene el botón mediante:

```javascript
const juego_btn = document.getElementById("juego-boton");
```

Al hacer clic:

* Se limpian las casillas.
* Se restablece el estado.
* Se habilitan nuevamente las casillas.
* Se determina quién empieza.
* Se muestra el mensaje correspondiente.

---

# Flujo del juego

El funcionamiento general puede resumirse de esta manera:

```text
        INICIO
           |
           v
    Determinar jugador
           |
           v
     Mostrar tablero
           |
           v
    Jugador selecciona
        una casilla
           |
           v
      Colocar X/O
           |
           v
    Comprobar victoria
        /          \
      Sí            No
      |              |
      v              v
   Ganador       ¿Tablero lleno?
                     /      \
                   Sí        No
                   |          |
                   v          v
                Empate    Cambiar turno
                              |
                              v
                         Continuar juego
```

---

# Diseño visual

La nueva interfaz utiliza principalmente:

* Fondo oscuro
* Degradados
* Superficies semitransparentes
* Bordes redondeados
* Sombras
* Animaciones
* Efectos `hover`
* Diseño responsive

El objetivo es mantener una interfaz sencilla pero con una apariencia más cercana a un videojuego moderno.

---

# Comparación antes y después

## Diseño original

El diseño original utilizaba:

```text
Fondo sencillo

┌─────┬─────┬─────┐
│     │     │     │
├─────┼─────┼─────┤
│     │     │     │
├─────┼─────┼─────┤
│     │     │     │
└─────┴─────┴─────┘

       BOTÓN
```

Era funcional, pero tenía una apariencia bastante básica.

## Diseño actualizado

La nueva versión incorpora:

```text
        JUEGO CLÁSICO
       TRES EN RAYA

     ┌───────────────┐
     │ ┌───┬───┬───┐ │
     │ │   │   │   │ │
     │ ├───┼───┼───┤ │
     │ │   │   │   │ │
     │ ├───┼───┼───┤ │
     │ │   │   │   │ │
     │ └───┴───┴───┘ │
     └───────────────┘

       VOLVER A JUGAR
```

El funcionamiento sigue siendo sencillo, pero la presentación es más moderna.

---

# Características principales

* Juego clásico de Tres en Raya.
* Tablero de 3 × 3.
* Dos jugadores.
* Turnos automáticos.
* Detección de ganador.
* Detección de empate.
* Botón para reiniciar la partida.
* Efectos visuales.
* Diseño responsive.
* Interfaz moderna.
* Sin librerías externas.
* Código separado por responsabilidades.

---

# Compatibilidad

El proyecto está pensado para ejecutarse directamente en un navegador moderno.

Puede abrirse en navegadores como:

* Google Chrome
* Mozilla Firefox
* Microsoft Edge
* Opera
* Chromium

No requiere servidor para funcionar, ya que utiliza únicamente HTML, CSS y JavaScript del lado del cliente.

---

# Cómo ejecutar el proyecto

## 1. Descargar o clonar el proyecto

Coloca los archivos en una misma carpeta:

```text
tres-en-raya/
├── index.html
├── style.css
└── script.js
```

## 2. Abrir `index.html`

Haz doble clic sobre:

```text
index.html
```

También puedes abrirlo desde un navegador.

---

# Organización del código

Una de las características importantes del proyecto es la separación de responsabilidades.

### HTML

Se encarga de:

```text
Estructura
    ↓
Contenido
    ↓
Elementos del juego
```

### CSS

Se encarga de:

```text
Diseño
    ↓
Colores
    ↓
Tamaños
    ↓
Animaciones
    ↓
Responsive
```

### JavaScript

Se encarga de:

```text
Interacción
    ↓
Turnos
    ↓
Reglas
    ↓
Victoria
    ↓
Empate
    ↓
Reinicio
```

Esta separación hace que el proyecto sea más fácil de entender y modificar.

---

# Posibles mejoras futuras

El proyecto puede continuar evolucionando con nuevas funcionalidades.

Algunas ideas son:

* Marcador de victorias.
* Contador de partidas.
* Animación de las fichas.
* Resaltar la línea ganadora.
* Sonidos para los movimientos.
* Efectos de sonido al ganar.
* Modo contra la computadora.
* Diferentes niveles de dificultad.
* Modo oscuro y claro.
* Selector de nombres para los jugadores.
* Personalización de X y O.
* Sistema de puntuación.
* Historial de partidas.
* Animaciones más avanzadas.
* Diseño para pantallas más grandes.
* Guardado de estadísticas con `localStorage`.

---

# Créditos

Proyecto basado en una implementación original de Tres en Raya en HTML, CSS y JavaScript.

Código de referencia:

**Esteban Carrillo — edeptec.com**

El proyecto fue posteriormente adaptado y rediseñado para utilizar una interfaz visual más moderna.

---

# Estado del proyecto

**Estado:** Funcional

**Versión:** 2.0

**Tipo:** Juego web

**Plataforma:** Navegador web

**Tecnologías:** HTML5, CSS3 y JavaScript

---

# Autor

Proyecto desarrollado como práctica de desarrollo web.

Tecnologías utilizadas:

```text
HTML
CSS
JavaScript
```

---

## Licencia

Este proyecto se utiliza con fines educativos y de aprendizaje.

Antes de redistribuir el código original o publicarlo como propio, se deben respetar las condiciones y créditos correspondientes al código de referencia utilizado.

```

Este README deja bastante claro **qué cambiaste tú en el proyecto**, especialmente la modernización del diseño, sin presentar como completamente original la parte de JavaScript que proviene del código de referencia.
```
