// 1. Configuración de Idiomas AXON
const translations = {
    es: { done: "¡Video completado! Valida tu victoria.", win: "Has ganado 10 monedas para AXON.", donateMsg: "¡Gracias! Donación enviada para personas y animales.", noCoins: "Entrena más para poder donar." },
    en: { done: "Video completed! Validate your victory.", win: "You earned 10 coins for AXON.", donateMsg: "Thanks! Donation sent for people and animals.", noCoins: "Train more to be able to donate." },
    ru: { done: "Видео завершено! Подтвердите победу.", win: "Вы заработали 10 монет для AXON.", donateMsg: "Спасибо! Пожертвование отправлено.", noCoins: "Тренируйтесь больше." },
    ar: { done: "اكتمل الفيديو! تحقق من فوزك.", win: "لقد ربحت 10 عملات لـ AXON.", donateMsg: "شكراً! تم إرسال التبرع.", noCoins: "تدرب أكثر لتتمكن من التبرع." }
};

const userLang = navigator.language.split('-')[0] || 'en';
const t = translations[userLang] || translations.en;

// 2. Variables de juego
let player;
let videoEnded = false;
let coins = 0;
let lastTime = 0; // Para el bloqueo de adelanto

// 3. Cargar API de YouTube con Bloqueo
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '360', width: '100%',
        videoId: 'TU_ID_DE_VIDEO', 
        playerVars: { 'controls': 0, 'disablekb': 1, 'rel': 0, 'modestbranding': 1, 'playsinline': 1 },
        events: { 
            'onStateChange': onPlayerStateChange,
            'onReady': startAntiCheat
        }
    });
}

function startAntiCheat() {
    setInterval(() => {
        if (player && player.getCurrentTime) {
            let curr = player.getCurrentTime();
            if (curr > lastTime + 2) { // Si salta más de 2 segundos
                player.seekTo(lastTime); 
            } else {
                lastTime = curr;
            }
        }
    }, 1000);
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        videoEnded = true;
        const btn = document.getElementById('validateCode');
        btn.style.display = 'block';
        btn.disabled = false;
        alert(t.done);
    }
}

// 4. Lógica de botones mejorada
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('readTerms').addEventListener('change', (e) => {
        document.getElementById('startButton').disabled = !e.target.checked;
    });

    document.getElementById('startButton').addEventListener('click', () => {
        document.getElementById('registration').style.display = 'none';
        document.getElementById('miniapppanel').style.display = 'block';
    });

    document.getElementById('validateCode').addEventListener('click', () => {
        if (videoEnded) {
            coins += 10;
            document.getElementById('coins').textContent = coins;
            document.getElementById('validateCode').disabled = true;
            alert(t.win);
        }
    });

    document.getElementById('donateButton').addEventListener('click', () => {
        if (coins > 0) {
            alert(t.donateMsg + " [cite: 2026-02-14]");
            coins = 0;
            document.getElementById('coins').textContent = coins;
        } else {
            alert(t.noCoins);
        }
    });
});
