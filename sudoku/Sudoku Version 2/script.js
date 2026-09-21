// ==========================================
// SUDOKU NATURALEZA
// JavaScript Vanilla
// ==========================================


// VARIABLES PRINCIPALES

const tableroHTML = document.getElementById("tablero");
const tiempoHTML = document.getElementById("tiempo");
const movimientosHTML = document.getElementById("movimientos");
const mensajeHTML = document.getElementById("mensaje");

const botonNuevo = document.getElementById("nuevoJuego");
const botonComprobar = document.getElementById("comprobar");
const botonResolver = document.getElementById("resolver");

const botonesDificultad = document.querySelectorAll(".dificultad");
const botonesNumero = document.querySelectorAll(".teclado button[data-numero]");


let tablero = [];
let solucion = [];

let celdaSeleccionada = null;

let movimientos = 0;

let segundos = 0;
let temporizador = null;

let dificultadActual = "facil";


// CANTIDAD DE CASILLAS QUE SE DEJAN VACÍAS

const dificultades = {
    facil: 35,
    medio: 45,
    dificil: 52
};


// ==========================================
// CREAR TABLERO VACÍO
// ==========================================

function crearTableroVacio() {

    return Array.from(
        { length: 9 },
        () => Array(9).fill(0)
    );

}


// ==========================================
// MEZCLAR NÚMEROS
// ==========================================

function mezclar(array) {

    const copia = [...array];

    for (let i = copia.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [copia[i], copia[j]] = [copia[j], copia[i]];

    }

    return copia;
}


// ==========================================
// COMPROBAR SI UN NÚMERO ES VÁLIDO
// ==========================================

function numeroValido(tablero, fila, columna, numero) {

    // Revisar fila

    for (let c = 0; c < 9; c++) {

        if (tablero[fila][c] === numero) {
            return false;
        }

    }


    // Revisar columna

    for (let f = 0; f < 9; f++) {

        if (tablero[f][columna] === numero) {
            return false;
        }

    }


    // Revisar bloque 3x3

    const inicioFila = Math.floor(fila / 3) * 3;
    const inicioColumna = Math.floor(columna / 3) * 3;

    for (let f = inicioFila; f < inicioFila + 3; f++) {

        for (let c = inicioColumna; c < inicioColumna + 3; c++) {

            if (tablero[f][c] === numero) {
                return false;
            }

        }

    }

    return true;
}


// ==========================================
// GENERAR SOLUCIÓN
// ==========================================

function resolverTablero(tablero) {

    for (let fila = 0; fila < 9; fila++) {

        for (let columna = 0; columna < 9; columna++) {

            if (tablero[fila][columna] === 0) {

                const numeros = mezclar([
                    1, 2, 3, 4, 5, 6, 7, 8, 9
                ]);

                for (const numero of numeros) {

                    if (
                        numeroValido(
                            tablero,
                            fila,
                            columna,
                            numero
                        )
                    ) {

                        tablero[fila][columna] = numero;

                        if (resolverTablero(tablero)) {
                            return true;
                        }

                        tablero[fila][columna] = 0;
                    }

                }

                return false;
            }

        }

    }

    return true;
}


// ==========================================
// CREAR NUEVO SUDOKU
// ==========================================

function generarSudoku() {

    let nuevoTablero = crearTableroVacio();

    resolverTablero(nuevoTablero);

    solucion = nuevoTablero.map(fila => [...fila]);

    tablero = nuevoTablero.map(fila => [...fila]);


    // Eliminar números

    const cantidadEliminar =
        dificultades[dificultadActual];

    let eliminados = 0;

    while (eliminados < cantidadEliminar) {

        const fila =
            Math.floor(Math.random() * 9);

        const columna =
            Math.floor(Math.random() * 9);

        if (tablero[fila][columna] !== 0) {

            tablero[fila][columna] = 0;

            eliminados++;
        }

    }

}


// ==========================================
// MOSTRAR TABLERO
// ==========================================

function mostrarTablero() {

    tableroHTML.innerHTML = "";

    for (let fila = 0; fila < 9; fila++) {

        for (let columna = 0; columna < 9; columna++) {

            const celda = document.createElement("div");

            celda.classList.add("celda");

            celda.dataset.fila = fila;
            celda.dataset.columna = columna;


            const numero = tablero[fila][columna];

            if (numero !== 0) {

                celda.textContent = numero;

                celda.classList.add("original");

            }


            celda.addEventListener(
                "click",
                seleccionarCelda
            );


            tableroHTML.appendChild(celda);

        }

    }

}


// ==========================================
// SELECCIONAR CELDA
// ==========================================

function seleccionarCelda(event) {

    const celda = event.currentTarget;

    const fila = Number(celda.dataset.fila);
    const columna = Number(celda.dataset.columna);

    celdaSeleccionada = {
        fila,
        columna
    };

    actualizarSeleccion();

}


// ==========================================
// ACTUALIZAR SELECCIÓN
// ==========================================

function actualizarSeleccion() {

    const celdas =
        document.querySelectorAll(".celda");


    celdas.forEach(celda => {

        celda.classList.remove(
            "seleccionada",
            "relacionada",
            "mismo-numero"
        );

    });


    if (!celdaSeleccionada) {
        return;
    }


    const fila =
        celdaSeleccionada.fila;

    const columna =
        celdaSeleccionada.columna;


    const numero =
        tablero[fila][columna];


    celdas.forEach(celda => {

        const f =
            Number(celda.dataset.fila);

        const c =
            Number(celda.dataset.columna);


        if (
            f === fila ||
            c === columna ||
            (
                Math.floor(f / 3) === Math.floor(fila / 3) &&
                Math.floor(c / 3) === Math.floor(columna / 3)
            )
        ) {

            celda.classList.add("relacionada");

        }


        if (
            numero !== 0 &&
            Number(celda.textContent) === numero
        ) {

            celda.classList.add("mismo-numero");

        }

    });


    const seleccionada =
        document.querySelector(
            `.celda[data-fila="${fila}"][data-columna="${columna}"]`
        );


    if (seleccionada) {

        seleccionada.classList.add("seleccionada");

    }

}


// ==========================================
// COLOCAR NÚMERO
// ==========================================

function colocarNumero(numero) {

    if (!celdaSeleccionada) {

        mostrarMensaje(
            "Primero selecciona una casilla.",
            "error"
        );

        return;
    }


    const fila =
        celdaSeleccionada.fila;

    const columna =
        celdaSeleccionada.columna;


    // No modificar números originales

    const celdas =
        document.querySelectorAll(".celda");

    const celda =
        [...celdas].find(c =>
            Number(c.dataset.fila) === fila &&
            Number(c.dataset.columna) === columna
        );


    if (celda.classList.contains("original")) {

        mostrarMensaje(
            "Esa casilla no se puede modificar.",
            "error"
        );

        return;
    }


    // Borrar

    if (numero === "borrar") {

        tablero[fila][columna] = 0;

        celda.textContent = "";

        celda.classList.remove("error");

        movimientos++;

        actualizarMovimientos();

        actualizarSeleccion();

        return;
    }


    // Colocar número

    tablero[fila][columna] =
        Number(numero);


    celda.textContent = numero;

    movimientos++;

    actualizarMovimientos();


    // Revisar si el número es incorrecto

    if (
        Number(numero) !== solucion[fila][columna]
    ) {

        celda.classList.add("error");

    } else {

        celda.classList.remove("error");

    }


    actualizarSeleccion();

    comprobarVictoria();

}


// ==========================================
// BOTONES NUMÉRICOS
// ==========================================

botonesNumero.forEach(boton => {

    boton.addEventListener(
        "click",
        () => {

            colocarNumero(
                boton.dataset.numero
            );

        }
    );

});


// ==========================================
// TECLADO DEL COMPUTADOR
// ==========================================

document.addEventListener(
    "keydown",
    event => {

        if (!celdaSeleccionada) {
            return;
        }


        // Números

        if (
            event.key >= "1" &&
            event.key <= "9"
        ) {

            colocarNumero(event.key);

        }


        // Borrar

        if (
            event.key === "Backspace" ||
            event.key === "Delete"
        ) {

            colocarNumero("borrar");

        }


        // Movimiento con flechas

        if (
            [
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight"
            ].includes(event.key)
        ) {

            event.preventDefault();

            moverSeleccion(event.key);

        }

    }
);


// ==========================================
// MOVER SELECCIÓN
// ==========================================

function moverSeleccion(tecla) {

    let fila =
        celdaSeleccionada.fila;

    let columna =
        celdaSeleccionada.columna;


    if (tecla === "ArrowUp") {
        fila--;
    }

    if (tecla === "ArrowDown") {
        fila++;
    }

    if (tecla === "ArrowLeft") {
        columna--;
    }

    if (tecla === "ArrowRight") {
        columna++;
    }


    fila = Math.max(0, Math.min(8, fila));
    columna = Math.max(0, Math.min(8, columna));


    celdaSeleccionada = {
        fila,
        columna
    };

    actualizarSeleccion();

}


// ==========================================
// CONTADOR DE MOVIMIENTOS
// ==========================================

function actualizarMovimientos() {

    movimientosHTML.textContent =
        movimientos;

}


// ==========================================
// TEMPORIZADOR
// ==========================================

function iniciarTemporizador() {

    detenerTemporizador();

    segundos = 0;

    actualizarTiempo();


    temporizador = setInterval(
        () => {

            segundos++;

            actualizarTiempo();

        },
        1000
    );

}


function detenerTemporizador() {

    if (temporizador) {

        clearInterval(temporizador);

        temporizador = null;

    }

}


function actualizarTiempo() {

    const minutos =
        Math.floor(segundos / 60);

    const segundosRestantes =
        segundos % 60;


    tiempoHTML.textContent =
        String(minutos).padStart(2, "0") +
        ":" +
        String(segundosRestantes).padStart(2, "0");

}


// ==========================================
// COMPROBAR SOLUCIÓN
// ==========================================

botonComprobar.addEventListener(
    "click",
    () => {

        let errores = 0;
        let completos = true;


        const celdas =
            document.querySelectorAll(".celda");


        celdas.forEach(celda => {

            const fila =
                Number(celda.dataset.fila);

            const columna =
                Number(celda.dataset.columna);


            const numero =
                tablero[fila][columna];


            celda.classList.remove("error");


            if (numero === 0) {

                completos = false;

            } else if (
                numero !== solucion[fila][columna]
            ) {

                celda.classList.add("error");

                errores++;

            }

        });


        if (errores > 0) {

            mostrarMensaje(
                `Hay ${errores} número(s) incorrecto(s).`,
                "error"
            );

        } else if (!completos) {

            mostrarMensaje(
                "Vas muy bien. Todavía faltan algunas casillas.",
                ""
            );

        } else {

            terminarJuego();

        }

    }
);


// ==========================================
// COMPROBAR VICTORIA AUTOMÁTICA
// ==========================================

function comprobarVictoria() {

    for (let fila = 0; fila < 9; fila++) {

        for (let columna = 0; columna < 9; columna++) {

            if (
                tablero[fila][columna] !==
                solucion[fila][columna]
            ) {

                return;

            }

        }

    }

    terminarJuego();

}


// ==========================================
// TERMINAR JUEGO
// ==========================================

function terminarJuego() {

    detenerTemporizador();

    mostrarMensaje(
        "🌿 ¡Felicitaciones! Completaste el Sudoku. 🌿",
        "exito"
    );

}


// ==========================================
// RESOLVER SUDOKU
// ==========================================

botonResolver.addEventListener(
    "click",
    () => {

        const confirmar =
            confirm(
                "¿Quieres mostrar la solución del Sudoku?"
            );


        if (!confirmar) {
            return;
        }


        tablero =
            solucion.map(fila => [...fila]);


        mostrarTablero();

        movimientos++;

        actualizarMovimientos();

        detenerTemporizador();


        mostrarMensaje(
            "Sudoku resuelto. ¡Puedes comenzar otro cuando quieras!",
            "exito"
        );

    }
);


// ==========================================
// NUEVO JUEGO
// ==========================================

botonNuevo.addEventListener(
    "click",
    nuevoJuego
);


function nuevoJuego() {

    detenerTemporizador();

    generarSudoku();

    movimientos = 0;

    celdaSeleccionada = null;

    actualizarMovimientos();

    mostrarTablero();

    actualizarTiempo();

    mostrarMensaje(
        "🌱 Nuevo Sudoku preparado.",
        ""
    );

    iniciarTemporizador();

}


// ==========================================
// CAMBIAR DIFICULTAD
// ==========================================

botonesDificultad.forEach(boton => {

    boton.addEventListener(
        "click",
        () => {

            botonesDificultad.forEach(
                b => b.classList.remove("activo")
            );


            boton.classList.add("activo");


            dificultadActual =
                boton.dataset.nivel;


            nuevoJuego();

        }
    );

});


// ==========================================
// MOSTRAR MENSAJE
// ==========================================

function mostrarMensaje(texto, tipo) {

    mensajeHTML.textContent = texto;

    mensajeHTML.className = "mensaje";

    if (tipo) {

        mensajeHTML.classList.add(tipo);

    }

}


// ==========================================
// INICIAR EL JUEGO
// ==========================================

nuevoJuego();