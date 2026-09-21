# mi_juego
# Vanilla JS Tetris 🎮

Una implementación clásica y ligera del juego **Tetris** construida utilizando **JavaScript puro (Vanilla JS)**, **HTML5 Canvas** y **CSS3**, sin frameworks ni dependencias externas.

---

## 🚀 Características

* **Cero dependencias:** Escrito completamente en JS nativo para máxima velocidad y ligereza.
* **Mecánicas clásicas:** Rotación de piezas, colisiones, aceleración de caída y eliminación de filas completas.
* **Puntuación y niveles:** Cálculo de puntos dinámico según el número de líneas limpiadas simultáneamente.
* **Vista previa de pieza:** Muestra cuál será el siguiente tetromino en caer.
* **Diseño limpio y adaptable:** Interfaz moderna y minimalista.

---

## 🛠️ Tecnologías utilizadas

* **HTML5:** Renderizado con el elemento `<canvas>`.
* **CSS3:** Estilos responsivos y disposición gráfica.
* **JavaScript (ES6+):** Lógica del juego, detección de colisiones y bucle de juego (*Game Loop*).

---

## 📁 Estructura del proyecto

```text
vanilla-js-tetris/
├── index.html      # Estructura principal y Canvas
├── style.css       # Diseños y estilos del juego
└── script.js       # Lógica del juego y eventos de teclado