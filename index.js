require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const { createClient } = require("@supabase/supabase-js");
const runMonthlyRaffle = require("./raffle");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   SUPABASE
========================= */
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error("Faltan variables de entorno SUPABASE");
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("Impact backend funcionando 🚀");
});

/* =========================
   LOGIN TELEGRAM
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

/* =========================
   OBTENER MISIONES
========================= */
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

/* =========================
   COMPLETAR MISIÓN
========================= */
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

/* =========================
   DONAR
========================= */
app.post("/donate", async (req, res) => {
  try {
    const { user_id, amount } = req.body;

    const { data: user } = await supabase
      .from("users")
      .select("coins, total_donated, raffle_tickets")
      .eq("id", user_id)
      .single();

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

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

/* =========================
   RANKING
========================= */
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
   SORTEO MENSUAL
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
   START SERVER (Railway)
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Backend corriendo en puerto " + PORT);
});
      
