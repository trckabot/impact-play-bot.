require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const { createClient } = require("@supabase/supabase-js");
const runMonthlyRaffle = require("./raffle");

const app = express();
app.use(cors());
app.use(express.json());

/* SUPABASE */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/* HEALTH CHECK */
app.get("/", (req, res) => {
  res.send("Impact backend funcionando 🚀");
});

/* LOGIN TELEGRAM */
app.post("/auth", async (req, res) => {
  const { telegram_id, username } = req.body;

  let { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", telegram_id)
    .single();

  if (!user) {
    const referral_code = "IM" + Math.random().toString(36).substring(2, 8);

    const { data } = await supabase
      .from("users")
      .insert([{ telegram_id, username, referral_code }])
      .select()
      .single();

    user = data;
  }

  res.json(user);
});

/* OBTENER MISIONES */
app.get("/missions", async (req, res) => {
  const { data } = await supabase
    .from("missions")
    .select("*")
    .eq("active", true);

  res.json(data);
});

/* COMPLETAR MISIÓN */
app.post("/complete", async (req, res) => {
  const { user_id, mission_id } = req.body;

  await supabase.rpc("complete_mission", {
    uid: user_id,
    mid: mission_id,
  });

  res.json({ success: true });
});

/* DONAR */
app.post("/donate", async (req, res) => {
  const { user_id, amount } = req.body;

  await supabase
    .from("users")
    .update({
      coins: supabase.raw(`coins - ${amount}`),
      total_donated: supabase.raw(`total_donated + ${amount}`),
      raffle_tickets: supabase.raw(`raffle_tickets + 2`)
    })
    .eq("id", user_id);

  res.json({ success: true });
});

/* RANKING */
app.get("/ranking", async (req, res) => {
  const { data } = await supabase
    .from("users")
    .select("username,missions_completed,total_donated,level")
    .order("missions_completed", { ascending: false })
    .limit(50);

  res.json(data);
});

/* SORTEO MENSUAL */
cron.schedule("0 0 1 * *", async () => {
  await runMonthlyRaffle(supabase);
});

/* START SERVER (SOLO UNA VEZ) */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});
