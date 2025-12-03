const LEVELS = [
    { id:'easy', label:'Easy', range:10, baseScore:20, unlocked:true},
    { id:'medium', label:'Medium', range:50, baseScore:40, unlocked:false},
    { id:'hard', label:'Hard', range:100, baseScore:80, unlocked:false},
    { id:'extreme', label:'Extreme', range:200, baseScore:160, unlocked:false}
];

const LS_UNLOCK = 'gtn_unlocked-levels_v1';
const LS_HIGH = 'gtn_highscores_v1';

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
const useTimerCheckbox = document.getElementById('useTimer');
const useSoundCheckbox = document.getElementById('useSound');
const themeBtn = document.getElementById('themeBtn');
const globalBestEl = document.getElementById('globalBest');
const highScoresBox = document.getElementById('highScores');
const confettiContainer = document.getElementById('confettiCanvas');

let unlocked = JSON.parse(localStorage.getItem(LS_UNLOCK)) || LEVELS.reduce((a,v) => {a[v.id]=v.unlocked; return a},{});
let highs = JSON.parse(localStorage.getItem(LS_HIGH))
let current = null;
let timerInterval = null;


for(const L of LEVELS) if(unlocked[L.id]=== undefined) unlocked[L.id] = L.unlocked;

function init(){
    renderLevelButtons();
    renderHighScores();
    updateGlobalBest();
}

init();

function renderLevelButtons(){
  levelsList.innerHTML = '';
  LEVELS.forEach(L=>{
    const div = document.createElement('div');
    div.className = 'level-btn ' + (unlocked[L.id]? '':'locked');
    div.innerHTML = `<div>
      <strong>${L.label}</strong>
      <div style="font-size:13px;color:var(--muted)">1 - ${L.range}</div>
    </div>
    <div style="text-align:right">
      <div style="font-weight:800">${L.baseScore} pts</div>
      <div style="font-size:12px;color:var(--muted)">${unlocked[L.id]?'Unlocked':'Locked'}</div>
    </div>`;
    if(unlocked[L.id]){
      div.addEventListener('click', ()=>selectLevel(L.id));
    }
    levelsList.appendChild(div);
  });
}