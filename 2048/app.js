const tablero = document.getElementById("tablero");
const puntuacion = document.getElementById("score");
const nuevoJuego = document.getElementById("nuevo-juego");
const mensaje = document.getElementById("mensaje");
const intentarNuevamente = document.getElementById("intentar-nuevamente");

let tableroJuego = [];
let score = 0;
let juegoTerminado = false;
let juegoGanado = false;


// ========================================
// CREAR TABLERO
// ========================================

function crearTablero() {

    tableroJuego = [];

    for (let i = 0; i < 4; i++) {

        tableroJuego.push([0, 0, 0, 0]);

    }
}


// ========================================
// AGREGAR UNA NUEVA FICHA
// ========================================

function agregarFicha() {

    const espacios = [];

    for (let fila = 0; fila < 4; fila++) {

        for (let columna = 0; columna < 4; columna++) {

            if (tableroJuego[fila][columna] === 0) {

                espacios.push({
                    fila: fila,
                    columna: columna
                });

            }

        }

    }

    if (espacios.length === 0) {

        return;

    }

    const posicion =
        espacios[Math.floor(Math.random() * espacios.length)];

    tableroJuego[posicion.fila][posicion.columna] =
        Math.random() < 0.9 ? 2 : 4;
}


// ========================================
// MOSTRAR TABLERO
// ========================================

function mostrarTablero() {

    tablero.innerHTML = "";

    for (let fila = 0; fila < 4; fila++) {

        for (let columna = 0; columna < 4; columna++) {

            const casilla = document.createElement("div");

            casilla.classList.add("casilla");

            const valor = tableroJuego[fila][columna];

            if (valor !== 0) {

                casilla.textContent = valor;

                casilla.classList.add(`numero-${valor}`);

            }

            tablero.appendChild(casilla);

        }

    }

    puntuacion.textContent = score;
}


// ========================================
// INICIAR JUEGO
// ========================================

function iniciarJuego() {

    crearTablero();

    score = 0;

    juegoTerminado = false;

    juegoGanado = false;

    mensaje.classList.add("oculto");

    agregarFicha();

    agregarFicha();

    mostrarTablero();
}


// ========================================
// QUITAR CEROS
// ========================================

function quitarCeros(fila) {

    return fila.filter(numero => numero !== 0);

}


// ========================================
// COMBINAR NÚMEROS
// ========================================

function combinarFila(fila) {

    const nuevaFila = quitarCeros(fila);

    for (
        let i = 0;
        i < nuevaFila.length - 1;
        i++
    ) {

        if (nuevaFila[i] === nuevaFila[i + 1]) {

            nuevaFila[i] *= 2;

            score += nuevaFila[i];

            nuevaFila[i + 1] = 0;

        }

    }

    return quitarCeros(nuevaFila);
}


// ========================================
// COMPLETAR FILA
// ========================================

function completarFila(fila) {

    while (fila.length < 4) {

        fila.push(0);

    }

    return fila;
}


// ========================================
// MOVER A LA IZQUIERDA
// ========================================

function moverIzquierda() {

    if (juegoTerminado) {

        return;

    }

    let cambio = false;

    for (let fila = 0; fila < 4; fila++) {

        const original = [
            ...tableroJuego[fila]
        ];

        let nuevaFila =
            combinarFila(tableroJuego[fila]);

        nuevaFila =
            completarFila(nuevaFila);

        tableroJuego[fila] =
            nuevaFila;

        if (
            JSON.stringify(original) !==
            JSON.stringify(nuevaFila)
        ) {

            cambio = true;

        }

    }

    if (cambio) {

        agregarFicha();

    }

    mostrarTablero();

    comprobarVictoria();

    if (!juegoGanado) {

        comprobarFin();

    }
}


// ========================================
// ROTAR TABLERO
// ========================================

function rotarTablero() {

    const nuevoTablero = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    for (let fila = 0; fila < 4; fila++) {

        for (let columna = 0; columna < 4; columna++) {

            nuevoTablero[columna][3 - fila] =
                tableroJuego[fila][columna];

        }

    }

    tableroJuego = nuevoTablero;
}


// ========================================
// MOVER A LA DERECHA
// ========================================

function moverDerecha() {

    if (juegoTerminado) {

        return;

    }

    rotarTablero();

    rotarTablero();

    moverIzquierda();

    rotarTablero();

    rotarTablero();
}


// ========================================
// MOVER ARRIBA
// ========================================

function moverArriba() {

    if (juegoTerminado) {

        return;

    }

    rotarTablero();

    rotarTablero();

    rotarTablero();

    moverIzquierda();

    rotarTablero();
}


// ========================================
// MOVER ABAJO
// ========================================

function moverAbajo() {

    if (juegoTerminado) {

        return;

    }

    rotarTablero();

    moverIzquierda();

    rotarTablero();

    rotarTablero();

    rotarTablero();
}


// ========================================
// COMPROBAR SI GANÓ
// ========================================

function comprobarVictoria() {

    for (let fila = 0; fila < 4; fila++) {

        for (let columna = 0; columna < 4; columna++) {

            if (
                tableroJuego[fila][columna] === 2048
            ) {

                juegoGanado = true;

                mostrarMensajeVictoria();

                return;

            }

        }

    }
}


// ========================================
// MOSTRAR VICTORIA
// ========================================

function mostrarMensajeVictoria() {

    mensaje.classList.remove("oculto");

    mensaje.innerHTML = `

        <div class="icono-montana">
            🏆
        </div>

        <h2>¡Llegaste a 2048!</h2>

        <p>
            ¡Felicitaciones! Completaste la aventura.
        </p>

        <button id="intentar-nuevamente">
            🎮 Jugar nuevamente
        </button>

    `;

    document
        .getElementById("intentar-nuevamente")
        .addEventListener(
            "click",
            iniciarJuego
        );
}


// ========================================
// COMPROBAR SI PERDIÓ
// ========================================

function comprobarFin() {

    // Si todavía hay espacios vacíos,
    // todavía se puede jugar.

    for (let fila = 0; fila < 4; fila++) {

        for (let columna = 0; columna < 4; columna++) {

            if (
                tableroJuego[fila][columna] === 0
            ) {

                return;

            }

        }

    }


    // Comprobar movimientos horizontales

    for (let fila = 0; fila < 4; fila++) {

        for (let columna = 0; columna < 3; columna++) {

            if (
                tableroJuego[fila][columna] ===
                tableroJuego[fila][columna + 1]
            ) {

                return;

            }

        }

    }


    // Comprobar movimientos verticales

    for (let fila = 0; fila < 3; fila++) {

        for (let columna = 0; columna < 4; columna++) {

            if (
                tableroJuego[fila][columna] ===
                tableroJuego[fila + 1][columna]
            ) {

                return;

            }

        }

    }


    // Si llegó aquí significa que no
    // existen movimientos disponibles.

    juegoTerminado = true;

    mostrarMensajeDerrota();
}


// ========================================
// MOSTRAR DERROTA
// ========================================

function mostrarMensajeDerrota() {

    mensaje.classList.remove("oculto");

    mensaje.innerHTML = `

        <div class="icono-montana">
            🏔️
        </div>

        <h2>¡Fin de la aventura!</h2>

        <p>
            No quedan movimientos disponibles.
        </p>

        <p>
            Tu puntuación fue:
            <strong>${score}</strong>
        </p>

        <button id="intentar-nuevamente">
            🔄 Intentar nuevamente
        </button>

    `;

    document
        .getElementById("intentar-nuevamente")
        .addEventListener(
            "click",
            iniciarJuego
        );
}


// ========================================
// DETECTAR TECLAS
// ========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (juegoTerminado) {

            return;

        }

        if (event.key === "ArrowLeft") {

            event.preventDefault();

            moverIzquierda();

        }

        else if (event.key === "ArrowRight") {

            event.preventDefault();

            moverDerecha();

        }

        else if (event.key === "ArrowUp") {

            event.preventDefault();

            moverArriba();

        }

        else if (event.key === "ArrowDown") {

            event.preventDefault();

            moverAbajo();

        }

    }
);


// ========================================
// BOTÓN NUEVO JUEGO
// ========================================

nuevoJuego.addEventListener(
    "click",
    function() {

        iniciarJuego();

    }
);


// ========================================
// INICIAR AUTOMÁTICAMENTE
// ========================================

iniciarJuego();