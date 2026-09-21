const canvas=document.getElementById("juego");
const ctx=canvas.getContext("2d");

let condor={
    x:80,
    y:250,
    radio:18,
    velocidad:0
};

const gravedad=0.5;
const salto=-8;

let obstaculos=[];
let puntos=0;
let juegoTerminado=false;

function crearObstaculo(){

    let espacio=160;
    let altura=Math.random()*250+80;

    obstaculos.push({
        x:400,
        arriba:altura,
        abajo:altura+espacio,
        ancho:60
    });

}

setInterval(()=>{

    if(!juegoTerminado){
        crearObstaculo();
    }

},1800);

document.addEventListener("keydown",e=>{

    if(e.code==="Space" && !juegoTerminado){
        condor.velocidad=salto;
    }

});

function dibujarFondo(){

    ctx.fillStyle="#87CEEB";
    ctx.fillRect(0,0,400,600);

    ctx.fillStyle="#5DA130";
    ctx.fillRect(0,520,400,80);

    ctx.fillStyle="#3B7A1A";

    ctx.beginPath();
    ctx.moveTo(0,520);
    ctx.lineTo(80,400);
    ctx.lineTo(160,520);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(120,520);
    ctx.lineTo(220,350);
    ctx.lineTo(320,520);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(250,520);
    ctx.lineTo(360,420);
    ctx.lineTo(400,520);
    ctx.fill();

}

function dibujarCondor(){

    ctx.fillStyle="#222";

    ctx.beginPath();
    ctx.arc(condor.x,condor.y,condor.radio,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle="white";
    ctx.beginPath();
    ctx.arc(condor.x+5,condor.y-5,5,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle="orange";
    ctx.beginPath();
    ctx.moveTo(condor.x+12,condor.y);
    ctx.lineTo(condor.x+25,condor.y+4);
    ctx.lineTo(condor.x+12,condor.y+8);
    ctx.fill();

    ctx.strokeStyle="#111";
    ctx.lineWidth=5;

    ctx.beginPath();
    ctx.moveTo(condor.x-15,condor.y);
    ctx.lineTo(condor.x-40,condor.y-18);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(condor.x-15,condor.y);
    ctx.lineTo(condor.x-40,condor.y+18);
    ctx.stroke();

}

function dibujarObstaculos(){

    ctx.fillStyle="#6E4A2E";

    obstaculos.forEach(o=>{

        ctx.fillRect(o.x,0,o.ancho,o.arriba);

        ctx.fillRect(o.x,o.abajo,o.ancho,600-o.abajo);

        o.x-=2;

        if(o.x+o.ancho<0){

            obstaculos.shift();
            puntos++;

        }

        if(
            condor.x+condor.radio>o.x &&
            condor.x-condor.radio<o.x+o.ancho &&
            (condor.y-condor.radio<o.arriba ||
             condor.y+condor.radio>o.abajo)
        ){

            terminarJuego();

        }

    });

}

function dibujarPuntaje(){

    ctx.fillStyle="black";
    ctx.font="26px Arial";
    ctx.fillText("Puntos: "+puntos,15,35);

}

function actualizar(){

    if(juegoTerminado) return;

    condor.velocidad+=gravedad;
    condor.y+=condor.velocidad;

    if(condor.y>520 || condor.y<0){

        terminarJuego();

    }

}

function terminarJuego(){

    juegoTerminado=true;

    document.getElementById("gameOver").classList.remove("oculto");
    document.getElementById("puntajeFinal").innerText=puntos;

}

function reiniciarJuego(){

    condor.y=250;
    condor.velocidad=0;
    obstaculos=[];
    puntos=0;
    juegoTerminado=false;

    document.getElementById("gameOver").classList.add("oculto");

}

function loop(){

    dibujarFondo();
    actualizar();
    dibujarObstaculos();
    dibujarCondor();
    dibujarPuntaje();

    requestAnimationFrame(loop);

}

loop();