const BACKEND="https://TU_BACKEND_URL";

const tg = window.Telegram.WebApp;
tg.expand();

let userData;

const sujetos=["Tu impacto","Tu esfuerzo","Tu misión"];
const verbos=["transforma","eleva","cambia"];
const objetos=["vidas","destinos","el mundo"];

function frase(){
  return sujetos[Math.random()*3|0]+" "+
         verbos[Math.random()*3|0]+" "+
         objetos[Math.random()*3|0];
}

document.getElementById("phrase").innerText = frase();

async function init(){
  const user = tg.initDataUnsafe.user;

  const res = await fetch(BACKEND+"/auth",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      telegram_id:user.id,
      username:user.username
    })
  });

  userData = await res.json();
  updateUI();
}

function updateUI(){
  document.getElementById("welcome").innerText="Hola "+userData.username;
  document.getElementById("stats").innerText=
    "Nivel "+userData.level+
    " | Puntos "+userData.coins;
}

async function loadMissions(){
  const res = await fetch(BACKEND+"/missions");
  const missions = await res.json();

  let html="";
  missions.forEach(m=>{
    html+=`<button onclick="complete('${m.id}')">${m.title}</button><br>`;
  });

  document.getElementById("content").innerHTML=html;
}

async function complete(id){
  await fetch(BACKEND+"/complete",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      user_id:userData.id,
      mission_id:id
    })
  });

  location.reload();
}

async function donar(){
  const amount=prompt("Cantidad a donar:");
  await fetch(BACKEND+"/donate",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      user_id:userData.id,
      amount:Number(amount)
    })
  });

  location.reload();
}

init();
