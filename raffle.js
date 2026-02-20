module.exports = async function(supabase){

  const { data:users } = await supabase
    .from("users")
    .select("id, raffle_tickets");

  let pool = [];

  users.forEach(u=>{
    for(let i=0;i<u.raffle_tickets;i++){
      pool.push(u.id);
    }
  });

  if(pool.length === 0) return;

  const winner = pool[Math.floor(Math.random()*pool.length)];

  await supabase.from("raffles")
    .insert([{ winner_id: winner }]);

  await supabase.from("users")
    .update({ raffle_tickets:0 });
};

