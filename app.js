// Configuración de Idiomas (Diccionario Global)
const translations = {
    es: { start: "INICIAR", validate: "Validar Código", donate: "Donar al Rescate", coins: "Monedas", level: "Nivel", alertDone: "¡Video completado!", terms: "Acepto que los pagos dependen de la monetización de YouTube (Estonia EU Law)" },
    en: { start: "START", validate: "Validate Code", donate: "Donate to Rescue", coins: "Coins", level: "Level", alertDone: "Video completed!", terms: "I accept that payments depend on YouTube monetization (Estonia EU Law)" },
    fr: { start: "COMMENCER", validate: "Valider le Code", donate: "Faire un don", coins: "Pièces", level: "Niveau", alertDone: "Vidéo terminée !", terms: "J'accepte que los paiements dépendent de la monétisation YouTube" },
    pt: { start: "INICIAR", validate: "Validar Código", donate: "Doar para Resgate", coins: "Moedas", level: "Nível", alertDone: "Vídeo concluído!", terms: "Aceito que os pagamentos dependem da monetização do YouTube" },
    ar: { start: "ابدأ", validate: "تحقق من الرمز", donate: "تبرع للإنقاذ", coins: "عملات", level: "مستوى", alertDone: "اكتمل الفيديو!", terms: "أوافق على أن المدفوعات تعتمد على تحقيق الربح من YouTube" }
};

// Detectar idioma (por defecto inglés si no existe el detectado)
const userLang = navigator.language.split('-')[0] || 'en';
const lang = translations[userLang] || translations['en'];

// Aplicar traducciones a la UI al cargar
document.addEventListener('DOMContentLoaded', () => {
    if(userLang === 'ar') document.body.style.direction = 'rtl';
    
    document.getElementById('startButton').textContent = lang.start;
    document.getElementById('validateCode').textContent = lang.validate;
    document.getElementById('donate').textContent = lang.donate;
    document.querySelector('label').innerText = lang.terms;
    // Actualizar etiquetas de texto
    document.body.innerHTML = document.body.innerHTML.replace("Monedas", lang.coins).replace("Nivel", lang.level);
});

let player;
let videoEnded = false;
let coins = 0;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '360', width: '640',
        videoId: 'TU_ID_DE_VIDEO', 
        playerVars: { 'controls': 0, 'disablekb': 1, 'rel': 0, 'modestbranding': 1 },
        events: { 'onStateChange': onPlayerStateChange }
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        videoEnded = true;
        const btn = document.getElementById('validateCode');
        btn.style.display = 'block';
        btn.disabled = false;
        alert(lang.alertDone);
    }
}

// Lógica de botones (Suma de monedas y donación)
// [Aquí sigue el resto de tu lógica de coins...]
