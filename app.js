// Configuración inicial
let player;
let videoEnded = false;
let coins = 0;
let level = 1;

// 1. Cargar la API de YouTube
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '360',
        width: '640',
        videoId: 'ID_DE_TU_VIDEO', // <--- CAMBIA ESTO por el ID de tu video de YouTube
        playerVars: {
            'controls': 0,      // Desactiva controles visuales
            'disablekb': 1,    // Desactiva atajos de teclado
            'rel': 0,           // No muestra videos relacionados al final
            'modestbranding': 1 // Quita el logo grande de YouTube
        },
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

// 2. Detectar cuando el video termina
function onPlayerStateChange(event) {
    // YT.PlayerState.ENDED es igual a 0
    if (event.data === YT.PlayerState.ENDED) {
        videoEnded = true;
        document.getElementById('validateCode').style.display = 'block';
        document.getElementById('validateCode').disabled = false;
        alert("¡Video completado! Ya puedes validar tu código.");
    }
}

// 3. Lógica de los botones
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const readTerms = document.getElementById('readTerms');
    const validateCodeBtn = document.getElementById('validateCode');
    const donateBtn = document.getElementById('donate');

    // Habilitar botón de inicio al aceptar términos
    readTerms.addEventListener('change', () => {
        startButton.disabled = !readTerms.checked;
    });

    // Iniciar la experiencia
    startButton.addEventListener('click', () => {
        document.getElementById('registration').style.display = 'none';
        document.getElementById('miniapppanel').style.display = 'block';
    });

    // Validar código y sumar monedas
    validateCodeBtn.addEventListener('click', () => {
        if (videoEnded) {
            coins += 10; // Suma 10 monedas
            document.getElementById('coins').textContent = coins;
            validateCodeBtn.disabled = true;
            validateCodeBtn.textContent = "¡Validado!";
            alert("Has ganado 10 monedas para el proyecto Impact Play.");
        }
    });

    // Donar monedas
    donateBtn.addEventListener('click', () => {
        if (coins > 0) {
            alert(`¡Gracias! Has donado ${coins} monedas al próximo rescate.`);
            coins = 0;
            document.getElementById('coins').textContent = coins;
        } else {
            alert("No tienes monedas para donar todavía. ¡Mira un video!");
        }
    });
});
