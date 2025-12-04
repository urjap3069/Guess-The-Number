/* PRO Guess The Number — Full Power
   Features:
   - Levels (easy/medium/hard/pro)
   - Score, Attempts
   - Timer (optional)
   - Sound (WebAudio)
   - Confetti
   - Dark mode toggle
   - Leaderboard (localStorage top scores)
   - Level unlock system (persisted)
*/

// CONFIG
const LEVELS = [
  {id:'easy', label:'Easy', range:10, baseScore:20, unlocked:true},
  {id:'medium', label:'Medium', range:50, baseScore:40, unlocked:false},
  {id:'hard', label:'Hard', range:100, baseScore:80, unlocked:false},
  {id:'pro', label:'Pro', range:500, baseScore:300, unlocked:false}
];
const LS_UNLOCK = 'gtn_unlocked_v2';
const LS_HIGH = 'gtn_high_v2';
const LS_LEADER = 'gtn_leader_v2';

// DOM refs
const levelsList = document.getElementById('levelsList');
const selectedLevelEl = document.getElementById('selectedLevel');
const rangeLabel = document.getElementById('rangeLabel');
const guessInput = document.getElementById('guessInput');
const checkBtn = document.getElementById('checkBtn');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const timeLeftEl = document.getElementById('timeLeft');
const messageEl = document.getElementById('message');
const attemptsEl = document.getElementById('attempts');
const useTimer = document.getElementById('useTimer');
const useSound = document.getElementById('useSound');
const useConfetti = document.getElementById('useConfetti');
const themeBtn = document.getElementById('themeBtn');
const confettiContainer = document.getElementById('confetti');
const highScoresBox = document.getElementById('highScores');
const leaderModal = document.getElementById('leaderModal');
const leaderBtn = document.getElementById('leaderBtn');
const leaderboardList = document.getElementById('leaderboardList');
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeHelp = document.getElementById('closeHelp');
const closeLeader = document.getElementById('closeLeader');
const newGameBtn = document.getElementById('newGame');
const resetProgressBtn = document.getElementById('resetProgress');
const shareBtn = document.getElementById('shareBtn');
const logEl = document.getElementById('log');
const logCard = document.getElementById('logCard');

// state
let unlocked = JSON.parse(localStorage.getItem(LS_UNLOCK)) || LEVELS.reduce((a,v)=>{a[v.id]=v.unlocked;return a},{});
let highs = JSON.parse(localStorage.getItem(LS_HIGH)) || {};
let leaders = JSON.parse(localStorage.getItem(LS_LEADER)) || []; // {score, level, attempts, date}
let current = null;
let timerInterval = null;

// init
function init(){
  // ensure default unlocked state
  for(const L of LEVELS) if(unlocked[L.id] === undefined) unlocked[L.id] = L.unlocked;
  renderLevels();
  renderHighScores();
  renderLeaders();
  updateGlobalBest();
}
init();

// render levels
function renderLevels(){
  levelsList.innerHTML = '';
  LEVELS.forEach(L=>{
    const div = document.createElement('div');
    div.className = 'level-btn ' + (unlocked[L.id] ? '' : 'locked');
    div.innerHTML = `<div><strong>${L.label}</strong><div style="font-size:13px;color:var(--muted)">1 - ${L.range}</div></div>
      <div style="text-align:right"><div style="font-weight:800">${L.baseScore} pts</div><div style="font-size:12px;color:var(--muted)">${unlocked[L.id] ? 'Unlocked':'Locked'}</div></div>`;
    if(unlocked[L.id]){
      div.addEventListener('click', ()=>selectLevel(L.id));
    }
    levelsList.appendChild(div);
  });
}

// render highs
function renderHighScores(){
  highScoresBox.innerHTML = '';
  LEVELS.forEach(L=>{
    const val = highs[L.id] || '—';
    const p = document.createElement('div');
    p.style.display='flex'; p.style.justifyContent='space-between'; p.style.marginBottom='6px';
    p.innerHTML = `<div style="color:var(--muted)">${L.label}</div><div style="font-weight:700">${val}</div>`;
    highScoresBox.appendChild(p);
  });
  highScoreEl.textContent = '—';
}

// render leaders
function renderLeaders(){
  leaderboardList && (leaderboardList.innerHTML = '');
  if(!leaders.length){
    leaderboardList && (leaderboardList.innerHTML = '<div style="color:var(--muted)">No scores yet.</div>');
    return;
  }
  const list = leaders.slice(0,10);
  list.forEach((it, idx)=>{
    const div = document.createElement('div'); div.className='leader-item';
    div.innerHTML = `<div>${idx+1}. ${it.level.toUpperCase()} — ${it.score} pts</div><div style="text-align:right"><div style="font-size:12px;color:var(--muted)">${it.attempts} tries</div><div style="font-size:11px;color:var(--muted)">${it.date}</div></div>`;
    leaderboardList.appendChild(div);
  });
}

// update global best in header
function updateGlobalBest(){
  let best = 0, bestLevel = '';
  for(const k in highs){ if(highs[k] > best){ best = highs[k]; bestLevel = k; } }
  document.getElementById('globalBest') && (document.getElementById('globalBest').textContent = best ? `${best} (${bestLevel})` : '—');
}

// select level
function selectLevel(id){
  const L = LEVELS.find(x=>x.id===id);
  if(!L) return;
  current = {
    levelId: L.id,
    range: L.range,
    secret: Math.floor(Math.random()*L.range)+1,
    score: L.baseScore,
    attempts: 0,
    timeLeft: useTimer.checked ? (L.id==='hard'?30:(L.id==='pro'?45:20)) : null,
    inProgress: true
  };
  selectedLevelEl.textContent = `${L.label} (1 - ${L.range})`;
  rangeLabel.textContent = `1 - ${L.range}`;
  guessInput.disabled = false; guessInput.value='';
  checkBtn.disabled = false;
  scoreEl.textContent = current.score;
  attemptsEl.textContent = 0;
  highScoreEl.textContent = highs[L.id] || '—';
  timeLeftEl.textContent = current.timeLeft !== null ? current.timeLeft + 's' : '—';
  messageEl.textContent = 'Game started! Good luck 🎯';
  log(`Started ${L.label} level`);
  if(current.timeLeft !== null) startTimer();
}

// Start timer
function startTimer(){
  clearInterval(timerInterval);
  timeLeftEl.textContent = current.timeLeft + 's';
  timerInterval = setInterval(()=>{
    if(!current || !current.inProgress){ clearInterval(timerInterval); return; }
    current.timeLeft--;
    timeLeftEl.textContent = current.timeLeft + 's';
    if(current.timeLeft <= 0){ clearInterval(timerInterval); messageEl.textContent = '⏱ Time up! You lost.'; playSound('lose'); endGame(false); }
  },1000);
}

// New game restart same level
newGameBtn.addEventListener('click', ()=>{
  if(!current) return messageEl.textContent='Select a level first';
  selectLevel(current.levelId);
});

// Reset progress
resetProgressBtn.addEventListener('click', ()=>{
  if(!confirm('Reset all progress & scores?')) return;
  unlocked = {}; LEVELS.forEach((L,i)=> unlocked[L.id] = (i===0));
  highs = {}; leaders = [];
  localStorage.setItem(LS_UNLOCK, JSON.stringify(unlocked));
  localStorage.setItem(LS_HIGH, JSON.stringify(highs));
  localStorage.setItem(LS_LEADER, JSON.stringify(leaders));
  renderLevels(); renderHighScores(); renderLeaders(); updateGlobalBest();
  messageEl.textContent = 'Progress reset.';
  log('Progress reset.');
});

// Give Up
document.getElementById('giveUpBtn').addEventListener('click', ()=>{
  if(!current) return messageEl.textContent='Select a level first.';
  messageEl.textContent = `The number was ${current.secret}.`;
  endGame(false);
});

// Check guess
checkBtn.addEventListener('click', ()=>{
  if(!current) return messageEl.textContent='Select a level first.';
  const val = Number(guessInput.value);
  if(!val || val < 1 || val > current.range){ messageEl.textContent = `Enter number 1 - ${current.range}`; playSound('error'); return; }
  current.attempts++; attemptsEl.textContent = current.attempts;
  if(val === current.secret){
    messageEl.textContent = '🎉 Correct! You win!';
    playSound('win'); if(useConfetti.checked) confettiBurst();
    document.body.style.background = 'linear-gradient(135deg,#0f5132,#64d19a)';
    handleWin();
  } else {
    current.score = Math.max(0, current.score - 1);
    scoreEl.textContent = current.score;
    if(val > current.secret){ messageEl.textContent = '📈 Too high!'; playSound('wrong'); } else { messageEl.textContent = '📉 Too low!'; playSound('wrong'); }
    if(current.timeLeft !== null){ current.timeLeft = Math.max(0, current.timeLeft - 2); timeLeftEl.textContent = current.timeLeft + 's'; }
    if(current.score <= 0){ messageEl.textContent = '💥 Score dropped to 0 — You lost.'; endGame(false); }
    shake(messageEl);
  }
});

// handle win
function handleWin(){
  endGame(true);
  const lvl = current.levelId, s = current.score, a = current.attempts;
  if(!highs[lvl] || s > highs[lvl]){ highs[lvl]=s; localStorage.setItem(LS_HIGH, JSON.stringify(highs)); renderHighScores(); }
  // update global leader list (push and sort desc)
  leaders.unshift({score:s, level:lvl, attempts:a, date:new Date().toLocaleString()});
  leaders = leaders.sort((a,b)=>b.score - a.score).slice(0,50);
  localStorage.setItem(LS_LEADER, JSON.stringify(leaders)); renderLeaders();
  updateGlobalBest();
  unlockNextLevel(lvl);
  log(`Won ${lvl} — ${s} pts — ${a} attempts`);
  // add leader modal auto-open when top score
  if(leaders.length && leaders[0].score === s) { openLeader(); }
}

// end game
function endGame(won){
  current.inProgress=false;
  clearInterval(timerInterval);
  guessInput.disabled = true; checkBtn.disabled = true;
  if(!won){ document.body.style.background = ''; }
}

// unlock next
function unlockNextLevel(levelId){
  const idx = LEVELS.findIndex(l=>l.id===levelId);
  if(idx < 0 || idx === LEVELS.length-1) return;
  const nextId = LEVELS[idx+1].id;
  if(!unlocked[nextId]){ unlocked[nextId]=true; localStorage.setItem(LS_UNLOCK, JSON.stringify(unlocked)); renderLevels(); log(`Unlocked ${LEVELS[idx+1].label}`); messageEl.textContent = `${LEVELS[idx+1].label} unlocked!`; }
}

// sound via WebAudio
function playSound(type){
  if(!useSound.checked) return;
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination); g.gain.value = 0.05;
    if(type==='win'){ o.type='sine'; o.frequency.value = 880; o.start(); setTimeout(()=>{ o.frequency.value = 440 },120); setTimeout(()=>{ o.stop(); ctx.close() },500); }
    else if(type==='wrong'){ o.type='triangle'; o.frequency.value=220; o.start(); setTimeout(()=>{ o.stop(); ctx.close() },180); }
    else if(type==='error'){ o.type='sawtooth'; o.frequency.value=120; o.start(); setTimeout(()=>{ o.stop(); ctx.close() },200); }
    else if(type==='lose'){ o.type='sine'; o.frequency.value=150; o.start(); setTimeout(()=>{ o.stop(); ctx.close() },400); }
  }catch(e){ /* ignore audio errors */ }
}

// confetti simple burst
function confettiBurst(){
  confettiContainer.innerHTML = '';
  confettiContainer.style.display = 'block';
  const count = 60;
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = 'c';
    el.style.position='fixed';
    el.style.left = Math.random()*window.innerWidth + 'px';
    el.style.top = '-20px';
    el.style.width = (6+Math.random()*10)+'px';
    el.style.height = (8+Math.random()*10)+'px';
    el.style.background = ['#ff7b7b','#ffd36b','#7ef29a','#7ad3ff','#e39bff'][Math.floor(Math.random()*5)];
    el.style.opacity = 0.9;
    el.style.borderRadius = '2px';
    confettiContainer.appendChild(el);
    const fall = el.animate([{transform:`translateY(0) rotate(0deg)`},{transform:`translateY(${window.innerHeight + 200}px) rotate(${Math.random()*720}deg)`}], { duration:2000+Math.random()*2000, easing:'cubic-bezier(.2,.7,.2,1)'});
    setTimeout(()=>el.remove(), 2600);
  }
  setTimeout(()=>confettiContainer.style.display='none', 3000);
}

// UI helpers
function shake(el){ el.animate([{transform:'translateX(0)'},{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'translateX(0)'}],{duration:300}); }
function log(text){ logCard.classList.remove('hide'); logEl.innerHTML = new Date().toLocaleTimeString() + ' — ' + text + '<br>' + logEl.innerHTML; }

// Share button
shareBtn.addEventListener('click', ()=>{
  if(!current) return alert('No active game');
  const txt = `I scored ${current.score} on ${current.levelId}!`;
  if(navigator.share) navigator.share({title:'My Score', text:txt}).catch(()=>alert(txt));
  else prompt('Copy share text', txt);
});

// Leaderboard modal handlers
leaderBtn.addEventListener('click', openLeader);
function openLeader(){ leaderModal.classList.remove('hide'); renderLeaders(); }
closeLeader.addEventListener('click', ()=>leaderModal.classList.add('hide'));

// help modal
helpBtn.addEventListener('click', ()=>helpModal.classList.remove('hide'));
closeHelp.addEventListener('click', ()=>helpModal.classList.add('hide'));

// theme toggle
themeBtn.addEventListener('click', ()=>{
  document.body.classList.toggle('dark-mode');
  themeBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// persist load
(function loadPersistent(){
  const u = JSON.parse(localStorage.getItem(LS_UNLOCK));
  if(u) { unlocked = u; renderLevels(); }
  const h = JSON.parse(localStorage.getItem(LS_HIGH));
  if(h) { highs = h; renderHighScores(); updateGlobalBest(); }
  const l = JSON.parse(localStorage.getItem(LS_LEADER));
  if(l) { leaders = l; renderLeaders(); }
})();

