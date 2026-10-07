/* ================= device quality and the tuning panel =================
   Quality: the first seconds of each match are timed; if the phone can't hold ~48 fps the game steps down
   (render resolution, then shadow detail, then crowd density, then shadows off) and remembers the level.
   Tuning: long-press the scoreboard (or Game settings on the title screen) for live fps and the feel numbers. */
const KEY_TUNE='tennis-go-tune',KEY_Q='tennis-go-quality';
const TUNE_DEF={perfect:0.42,slice:0.17,hitstop:1,replays:'normal',drain:1,gear:0.15,quality:'auto',cam:'baseline'};
let TUNE=Object.assign({},TUNE_DEF);try{Object.assign(TUNE,JSON.parse(localStorage.getItem(KEY_TUNE)||'{}'))}catch(e){}
function storeTune(){try{localStorage.setItem(KEY_TUNE,JSON.stringify(TUNE))}catch(e){}}
function applyTune(){PERFECT[1]=TUNE.perfect;GEAR_STEP=TUNE.gear}
applyTune();
const REPLAY_GAP={off:Infinity,rare:8,normal:3,often:1};

/* ---- quality levels ---- */
const QLV=[{name:'High',pr:2,shadow:2048,crowd:1},{name:'Medium',pr:1.5,shadow:1024,crowd:0.8},{name:'Low',pr:1.2,shadow:1024,crowd:0.5},{name:'Lowest',pr:1,shadow:0,crowd:0.3}];
let QAUTO=0;try{QAUTO=clamp(+(localStorage.getItem(KEY_Q)||0),0,3)}catch(e){}
function qLevel(){return TUNE.quality==='auto'?QAUTO:+TUNE.quality}
function applyQuality(){if(!W3.r)return;const q=QLV[qLevel()];
  W3.r.setPixelRatio(Math.min(window.devicePixelRatio||1,q.pr));onResize();
  const sh=W3.sun.shadow;if(q.shadow){W3.sun.castShadow=true;if(sh.mapSize.x!==q.shadow){sh.mapSize.set(q.shadow,q.shadow);if(sh.map){sh.map.dispose();sh.map=null}}}else W3.sun.castShadow=false;
  if(W3.crowdMeshes){const n=Math.max(W3.crowdStaff||0,Math.floor(W3.crowdN*q.crowd));for(const m of W3.crowdMeshes)m.count=n}}
/* ---- frame timing ---- */
const PERF={t:[],since:0,checked:false,fps:0,ema:16.7};
function perfFrame(dtMs,live){
  PERF.ema+=(dtMs-PERF.ema)*0.05;PERF.fps=1000/PERF.ema;
  if(!live||PERF.checked||TUNE.quality!=='auto'){PERF.since=0;return}
  PERF.since+=dtMs;if(PERF.since<1200){PERF.t=[];return}   // skip the hitches right after loading
  PERF.t.push(dtMs);if(PERF.since<4200)return;
  const a=PERF.t.slice().sort((x,y)=>x-y),med=a[a.length>>1],fps=1000/(a.reduce((s,v)=>s+v,0)/a.length);
  const capped30=med>31&&med<35&&a[Math.floor(a.length*0.9)]<38;   // steady 30 fps = a battery-saver cap, not overload
  if(fps<48&&!capped30&&QAUTO<3){QAUTO++;try{localStorage.setItem(KEY_Q,String(QAUTO))}catch(e){}applyQuality();PERF.since=0;PERF.t=[];return}
  PERF.checked=true}
function perfReset(){PERF.checked=false;PERF.since=0;PERF.t=[]}

/* ---- the panel ---- */
const TROWS=[
  {k:'perfect',l:'Perfect window',d:'How long the ball glows before contact',min:0.25,max:0.65,step:0.01,f:v=>Math.round((v-0.1)*1000)+' ms'},
  {k:'slice',l:'Slice curve',d:'How much a swipe must bend to count as a slice',min:0.1,max:0.3,step:0.01,f:v=>Math.round(v*100)+'% of length'},
  {k:'hitstop',l:'Hit-stop',d:'The freeze on big and perfect hits',min:0,max:2,step:0.1,f:v=>v?Math.round(v*65)+' ms':'Off'},
  {k:'drain',l:'Stamina drain',d:'How fast running tires players',min:0.5,max:1.5,step:0.05,f:v=>'×'+v.toFixed(2)},
  {k:'gear',l:'Gear bonus',d:'Stat gain per gear upgrade',min:0.05,max:0.25,step:0.01,f:v=>'+'+v.toFixed(2)+' (max +'+(v*10).toFixed(1)+')'}];
let tuneTimer=0;
function openTune(){const p=$('tunePanel');p.hidden=false;PAUSE.tune=true;syncPause();renderTune();clearInterval(tuneTimer);tuneTimer=setInterval(()=>{const e=$('tFps');if(e)e.textContent=Math.round(PERF.fps)+' fps · quality '+QLV[qLevel()].name+(TUNE.quality==='auto'?' (auto)':'')},400)}
function closeTune(){$('tunePanel').hidden=true;PAUSE.tune=false;syncPause();clearInterval(tuneTimer)}
function renderTune(){
  $('tBody').innerHTML='<p class="num" id="tFps" style="font-family:var(--display);font-size:20px"></p>'+
    '<label>Quality<select id="tQ"><option value="auto">Auto</option>'+QLV.map((q,i)=>'<option value="'+i+'">'+q.name+'</option>').join('')+'</select></label>'+
    TROWS.map(r=>'<label class="trow"><span><b>'+r.l+'</b><output id="o_'+r.k+'">'+r.f(TUNE[r.k])+'</output></span><input type="range" min="'+r.min+'" max="'+r.max+'" step="'+r.step+'" value="'+TUNE[r.k]+'" data-k="'+r.k+'"><small>'+r.d+'</small></label>').join('')+
    '<label>Camera<select id="tCam"><option value="baseline">Behind the baseline</option><option value="broadcast">TV broadcast (high)</option><option value="close">Close behind you</option></select></label>'+
    '<label>Replays<select id="tRep"><option value="off">Off</option><option value="rare">Rare</option><option value="normal">Normal</option><option value="often">Often</option></select></label>';
  $('tQ').value=TUNE.quality;$('tRep').value=TUNE.replays;$('tCam').value=TUNE.cam||'baseline';
  $('tCam').onchange=e=>{TUNE.cam=e.target.value;storeTune()};
  $('tQ').onchange=e=>{TUNE.quality=e.target.value;storeTune();if(TUNE.quality==='auto')perfReset();applyQuality()};
  $('tRep').onchange=e=>{TUNE.replays=e.target.value;storeTune()};
  $('tBody').querySelectorAll('input[type=range]').forEach(i=>i.oninput=()=>{const r=TROWS.find(x=>x.k===i.dataset.k);TUNE[r.k]=+i.value;$('o_'+r.k).textContent=r.f(TUNE[r.k]);applyTune();storeTune()});
  $('tMsg').textContent=''}
$('tClose').onclick=closeTune;$('tClose2').onclick=closeTune;
$('tReset').onclick=()=>{TUNE=Object.assign({},TUNE_DEF);storeTune();applyTune();applyQuality();renderTune();$('tMsg').textContent='Back to the defaults.'};
$('tCopy').onclick=async()=>{const txt='Tennis Go settings: '+JSON.stringify(Object.assign({},TUNE,{fps:Math.round(PERF.fps),autoQuality:QLV[QAUTO].name,device:navigator.userAgent.replace(/\s*\(KHTML.*$/,'')}));
  let ok=false;try{await navigator.clipboard.writeText(txt);ok=true}catch(e){}$('tMsg').textContent=ok?'Copied. Paste it into a message to send it over.':txt};
$('btnTune').onclick=openTune;
/* long-press the scoreboard to open it mid-match */
(()=>{const b=$('board');let t=0;const go=()=>{t=setTimeout(()=>{t=0;openTune()},600)},stop=()=>{if(t){clearTimeout(t);t=0}};
  b.addEventListener('pointerdown',go);b.addEventListener('pointerup',stop);b.addEventListener('pointerleave',stop);b.addEventListener('pointercancel',stop);b.addEventListener('contextmenu',e=>e.preventDefault())})();
