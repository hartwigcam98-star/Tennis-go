/* ================= pause, game-time timers, and picking a match back up =================
   Match timers run on the game clock (after()), so pausing really stops everything: serves, the gap
   between points, replays. The score is saved at the start of every point (and when the app goes to
   the background), so a match you leave resumes from that point. */
let TIMERS=[];
function after(fn,ms){TIMERS.push({t:GT+(ms||0),fn})}
function runTimers(){if(!TIMERS.length)return;const due=TIMERS.filter(x=>x.t<=GT);if(!due.length)return;TIMERS=TIMERS.filter(x=>x.t>GT);
  for(const x of due){try{x.fn()}catch(e){console.error(e)}}}
function clearTimers(){TIMERS=[]}

/* ---- pause ---- */
const PAUSE={menu:false,tune:false};
function syncPause(){CLK.paused=PAUSE.menu||PAUSE.tune;if(CLK.paused){try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}}}
function scoreText(sets,pts,tb){const W=['0','15','30','40'],a=pts[0],b=pts[1];
  const g=tb?a+'–'+b:(a>=3&&b>=3)?(a===b?'Deuce':a>b?'Ad in':'Ad out'):W[Math.min(a,3)]+'–'+W[Math.min(b,3)];
  return sets.map(s=>s[0]+'–'+s[1]).join(', ')+(a+b?' · '+g:'')}
function openPause(){if(!M||$('match').hidden||M.over)return;PAUSE.menu=true;syncPause();$('pauseMenu').hidden=false;
  $('pmScore').textContent=M.drill?'Lesson: '+M.drill.L.t:M.cfg.me+' vs '+M.cfg.opp.name+' · '+scoreText(M.sets,M.pts,M.tb);
  $('pmSnd').textContent=SND.on?'Sound: on':'Sound: off';$('pmRetire').textContent=M.drill?'Leave the lesson':'Retire from the match';$('pmRetire').dataset.arm=''}
function closePause(){PAUSE.menu=false;syncPause();$('pauseMenu').hidden=true}
function retireMatch(){if(!M)return;closePause();
  if(M.drill){M.over=true;M.winner=0;M.lock=true;endMatch();return}
  M.over=true;M.winner=1;M.lock=true;M.retired=true;M.state='between';say('You retire from the match.');after(endMatch,600)}
$('pmResume').onclick=closePause;
$('pmSnd').onclick=()=>{sndResume();$('pmSnd').textContent=sndToggle()?'Sound: on':'Sound: off'};
$('pmSettings').onclick=()=>openTune();
$('pmRetire').onclick=()=>{const b=$('pmRetire');if(M&&!M.drill&&b.dataset.arm!=='1'){b.dataset.arm='1';b.textContent='Tap again to retire (counts as a loss)';return}retireMatch()};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&M&&!$('match').hidden){saveLive();if(!M.over&&!PAUSE.menu)openPause()}});

/* ---- saving the match in progress ---- */
const KEY_LIVE='tennis-go-live';
function saveLive(){if(!M||M.drill||M.over||!M.cfg.mode)return;
  const c=Object.assign({},M.cfg,{onEnd:null,resume:null,stats:M.cfg.baseStats||M.cfg.stats});
  const s={v:1,mode:M.cfg.mode,cfg:c,sets:M.sets,setsWon:M.setsWon,pts:M.pts,tb:M.tb,tbFirst:M.tbFirst,server:M.server,stat:M.stat,en:M.en,cap:M.cap,
    career:M.cfg.mode==='career'?liveKey():null,t:Date.now()};
  try{localStorage.setItem(KEY_LIVE,JSON.stringify(s))}catch(e){}}
/* which career match this is: a tournament round, or a Tour Finals match */
function liveKey(){if(!save)return null;if(save.cur)return{ev:save.cur.ev.n,round:save.cur.round,season:save.season,week:save.week,stage:save.stage};
  const F=finalsMode();return F?{ev:'Tour Finals',round:F.phase+F.day,season:save.season,week:save.week,stage:save.stage}:null}
function clearLive(){try{localStorage.removeItem(KEY_LIVE)}catch(e){}}
function loadLive(){try{const L=JSON.parse(localStorage.getItem(KEY_LIVE)||'null');return L&&L.v===1?L:null}catch(e){return null}}
function liveFor(mode){const L=loadLive();if(!L||L.mode!==mode)return null;
  if(mode==='career'){const a=liveKey(),k=L.career;if(!a||!k||JSON.stringify(a)!==JSON.stringify(k))return null}
  return L}
function liveScore(L){return scoreText(L.sets,L.pts,L.tb)}
/* put a saved score back into a fresh match */
function applyResume(L){M.sets=L.sets;M.setsWon=L.setsWon;M.pts=L.pts;M.tb=L.tb;M.tbFirst=L.tbFirst;M.server=L.server;M.stat=Object.assign(M.stat,L.stat);M.en=L.en||M.en;M.cap=L.cap||M.cap;renderBoard();renderEnergy()}
function quickEnd(won,score,st){showResult(won,score,st,won?'Nice set. Try a tougher opponent next.':'Shake it off and run it back.',[],'Back to menu',()=>renderTitle())}
function resumeLive(L){startMatch(Object.assign({},L.cfg,{resume:L,onEnd:L.mode==='career'?careerResult:quickEnd}))}
/* title screen: a quick match left mid-way */
function liveCardState(){const L=liveFor('quick'),card=$('liveCard');if(!L){card.hidden=true;return}card.hidden=false;
  $('liveSub').textContent=L.cfg.me+' vs '+L.cfg.opp.name+' · '+liveScore(L)}
$('btnLiveGo').onclick=()=>{const L=liveFor('quick');if(L)resumeLive(L)};
$('btnLiveDrop').onclick=()=>{clearLive();liveCardState()};
