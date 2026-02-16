const { Telegraf, Markup } = require('telegraf');

// TU TOKEN DE BOTFATHER
const bot = new Telegraf('8547341334:AAGlf8c1C_3-fH186c-HHXfrLY60xP2ZeE4');

// URL DE TU PROYECTO EN VERCEL
const webAppUrl = 'https://impact-play-bot.vercel.app/'; 

bot.start((ctx) => {
    // Usamos || "GUERRERO" por si el usuario no tiene nombre configurado
    const user = ctx.from.first_name || "GUERRERO";
    const userId = ctx.from.id;
    const referralLink = `https://t.me/Trckabot?start=${userId}`;

    // HE CORREGIDO LOS PUNTOS Y GUIONES PARA QUE TELEGRAM NO DE ERROR
    ctx.replyWithMarkdownV2(
        `🛡️ *¡BIENVENIDO GUERRERO ${user.toUpperCase()}\\!* \n\n` +
        `Estás en la red AXON\\. Aquí tu entrenamiento ayuda directamente a personas sin hogar y animales rescatados\\.\n\n` +
        `📢 *TU LINK DE REFERIDO:* \n` +
        `\`${referralLink}\``,
        Markup.inlineKeyboard([
            [Markup.button.webApp("🚀 ABRIR AXON APP", webAppUrl)],
            [Markup.button.switchToChat("📤 Invitar a otros", `¡Únete a AXON\\! Ayudamos a personas y animales 🐾🏠 ${referralLink}`)]
        ])
    );
});

bot.launch();

console.log("El Faro de AXON está encendido y el bot está corriendo...");
