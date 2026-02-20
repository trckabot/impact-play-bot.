require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const { createClient } = require("@supabase/supabase-js");
const TelegramBot = require("node-telegram-bot-api");
const runMonthlyRaffle = require("./raffle");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   VARIABLES
========================= */

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const APP_URL = process.env.APP_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN no está definido");
  process.exit(1);
}

if (!APP_URL) {
  console.error("❌ APP_URL no está definido");
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Variables de Supabase no definidas");
  process.exit(1);
}

/* =========================
   TELEGRAM BOT
========================= */

const bot = new TelegramBot(BOT_TOKEN, { webHook: true });

const webhookPath = `/bot${BOT_TOKEN}`;
const webhookURL = `${APP_URL}${webhookPath}`;

app.post(webhookPath, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🚀 Bienvenido a Impact Play!\n\nPulsa el botón para empezar:",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🔥 Abrir App",
              web_app: { url: APP_URL },
            },
          ],
        ],
      },
    }
  );
});

/* =========================
   SUPABASE
========================= */

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  res.send("Impact backend funcionando 🚀");
});

/* =========================
   RUTAS
========================= */

app.post("/auth", async (req, res) => {
  try {
    const { telegram_id, username } = req.body;

    let { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", telegram_id)
      .single();

    if (!user) {
      const referral_code =
        "IM" + Math.random().toString(36).substring(2, 8);

      const { data } = await supabase
        .from("users")
        .insert([{ telegram_id, username, referral_code }])
        .select()
        .single();

      user = data;
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en /auth" });
  }
});

app.get("/missions", async (req, res) => {
  try {
    const { data } = await supabase
      .from("missions")
      .select("*")
      .eq("active", true);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en /missions" });
  }
});

app.post("/complete", async (req, res) => {
  try {
    const { user_id, mission_id } = req.body;

    await supabase.rpc("complete_mission", {
      uid: user_id,
      mid: mission_id,
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en /complete" });
  }
});

app.post("/donate", async (req, res) => {
  try {
    const { user_id, amount } = req.body;

    const { data: user } = await supabase
      .from("users")
      .select("coins, total_donated, raffle_tickets")
      .eq("id", user_id)
      .single();

    await supabase
      .from("users")
      .update({
        coins: user.coins - amount,
        total_donated: user.total_donated + amount,
        raffle_tickets: user.raffle_tickets + 2,
      })
      .eq("id", user_id);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en /donate" });
  }
});

app.get("/ranking", async (req, res) => {
  try {
    const { data } = await supabase
      .from("users")
      .select("username, missions_completed, total_donated, level")
      .order("missions_completed", { ascending: false })
      .limit(50);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en /ranking" });
  }
});

/* =========================
   CRON
========================= */

cron.schedule("0 0 1 * *", async () => {
  try {
    await runMonthlyRaffle(supabase);
    console.log("Sorteo mensual ejecutado");
  } catch (err) {
    console.error("Error en sorteo mensual:", err);
  }
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, async () => {
  console.log(`🔥 Backend corriendo en puerto ${PORT}`);

  try {
    await bot.setWebHook(webhookURL);
    console.log("✅ Webhook configurado:", webhookURL);
  } catch (err) {
    console.error("❌ No se pudo configurar webhook:", err.message);
  }
});
