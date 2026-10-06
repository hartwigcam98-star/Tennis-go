(function(){
'use strict';
const $=id=>document.getElementById(id);
const T=THREE;
const CHAR_BASE=window.CHAR_BASE||'https://hartwigcam98-star.github.io/golf-go/';
const SECTIONS=['title','learn','locker','select','style','hub','recruit','season','match','result'];
function show(id){SECTIONS.forEach(s=>{$(s).hidden=s!==id});if(id!=='match')window.scrollTo(0,0);if(id==='match')onResize()}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function rnd(a,b){return a+Math.random()*(b-a)}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
/*@FX*/
const now=()=>GT;

/* ================= roster ================= */
const ROSTER=[
 ['boss','The Boss','Club champion, 40 years running',6,5,5,6,6,5,6],
 ['granny','Coach Dot','Retired PE teacher, whistle included',2,10,5,7,8,1,7],
 ['brute','Brick','Strongman, all power',10,3,4,3,3,6,4],
 ['ch09','Scout','Junior club champ, age 12',3,5,10,6,6,3,8],
 ['ch43','El Chupacabra','Lucha libre legend, weekend hacker',8,3,5,4,3,10,6],
 ['ch06','Dex','College athlete, headphones on',8,8,5,3,3,6,8],
 ['remy','Remy','Twilight-league regular',5,6,5,6,8,3,5],
 ['ty','Ty','Sketchbook kid, scarf in July',1,5,8,8,5,6,4],
 ['vegas','Big Vegas','Lounge singer, plays in the jumpsuit',10,1,6,5,5,6,3],
 ['peasant','Farmer Hob','Grows hay, hits it low',8,6,3,5,5,6,9],
 ['ch01','Gary','Sales rep, Friday afternoons',5,8,5,6,6,3,3],
 ['ch08','Marco','Personal trainer, first lesson',8,5,8,3,3,6,9],
 ['ch12','Jordan','Ball kid turned player',5,6,5,8,7,2,8],
 ['ch17','Mack','Site foreman, plays in work boots',10,3,5,3,6,6,7],
 ['ch23','Preston','New racket every month',6,7,6,5,5,4,4],
 ['ch24','Shadow','Plays at dawn, never seen warming up',5,6,8,6,3,5,7],
 ['ch28','Andre','Club pro on his day off',8,8,5,3,5,4,6],
 ['ch31','Nina','College player, four-year starter',4,7,5,6,8,3,8],
 ['ch39','Master Ko','Ninety years old, still wins tiebreaks',1,7,6,8,8,3,2],
 ['ch42','Danny','Summer job stringing rackets',8,3,8,5,3,6,6]
].map(([id,name,nick,pow,ctl,imp,sg,putt,spin,sta])=>({id,name,nick,st:{power:pow,control:ctl,speed:Math.round((imp+sg)/2),serve:Math.round((pow+spin)/2),stamina:sta}}));
const RBYID=Object.fromEntries(ROSTER.map(r=>[r.id,r]));
const STATS=[['power','Power','Pace on drives'],['control','Control','Tighter stray circle'],['speed','Speed','Reach sharp angles'],['serve','Serve','Aces and serve pace'],['stamina','Stamina','Stay fresh in long rallies and long matches']];

/* ================= career data ================= */
/* bounce: restitution e (share of vertical speed kept) and friction mu (higher = slower court); clay ~0.85 and hard ~0.75 from bounce studies */
const SURF={hard:{name:'Hard',sp:1,b:1,e:0.76,mu:0.58},clay:{name:'Clay',sp:0.82,b:1.35,e:0.84,mu:0.72},grass:{name:'Grass',sp:1.2,b:0.6,e:0.70,mu:0.46}};
const KEY_V='tennis-go-v2';
/* each week: a main event with an entry rule, and the alternate you play if you miss the cut */
const EV=(n,tier,surf,rounds,sk,pts,extra)=>Object.assign({n,tier,surf,rounds,sk,pts},extra||{});
const JUNIOR_WEEKS=[
  {main:EV('Twin Cities Junior Open','Local','hard',2,[1,2],50)},
  {main:EV('Midwest Junior Sectionals','Sectional','clay',3,[1.5,3],120,{cut:40}),alt:EV('Minnesota Junior Classic','Local','clay',2,[1,2],40)},
  {main:EV('National Junior Hardcourts','National','hard',3,[2.5,4],220,{cut:150}),alt:EV('Great Lakes Regional','Regional','hard',3,[1.5,3],90)},
  {main:EV('National Junior Clay Courts','National','clay',3,[3,4.5],220,{cut:220}),alt:EV('Heartland Regional Clay','Regional','clay',3,[2,3],90)},
  {main:EV('Junior Major','Junior major','grass',4,[3.5,5.5],400,{cut:380}),alt:EV('Junior International Open','International','grass',3,[2.5,4],160)}
];
const PROGRAMS=[
  {id:'lakeshore',name:'Lakeshore University',need:900,o:1,xp:1.5,start:250,blurb:'National title contender. Tougher lineups, the big invitationals, best coaching (50% more training points).'},
  {id:'northstar',name:'North Star State',need:450,o:0,xp:1.25,start:120,blurb:'Solid conference team. Balanced schedule, good coaching (25% more training points).'},
  {id:'driftless',name:'Driftless College',need:0,o:-1,xp:1,start:0,blurb:'Small program where you play No. 1 from day one. Easier opponents, but you have to earn your way into the big events.'}
];
function collegeWeeks(id){const p=PROGRAMS.find(x=>x.id===id)||PROGRAMS[2],o=p.o;return[
  {main:EV('Fall Invitational','College','hard',2,[4+o,4.5+o],80)},
  {main:EV('Dual match: rival school','Dual match','hard',1,[4.5+o,4.5+o],60)},
  {main:EV('All-American Championships','National','hard',3,[5,6],200,{crank:60,topProgram:true}),alt:EV('Regional Championships','Regional','hard',3,[4+o,5+o],100)},
  {main:EV('Spring Clay Classic','College','clay',2,[4.5+o,5.5+o],120)},
  {main:EV('Conference Championship','Conference','hard',3,[5+o,6+o],250)},
  {main:EV('NCAA Singles Championship','National','hard',4,[5.5,7],500,{crank:64}),alt:EV('Summer Futures (as an amateur)','Futures','hard',3,[4.5,5.5],60)}
]}
const PRO_WEEKS=[
  ['Brisbane 250','Tour 250','hard',4,[6,7],250,{rank:80}],
  ['Melbourne Major','Major','hard',5,[6,9],2000,{major:'Melbourne'}],
  ['Rotterdam 500','Tour 500','hard',4,[6.5,8],500,{rank:40}],
  ['Desert Masters','Masters','hard',5,[7,8.5],1000,{rank:50}],
  ['Barcelona 500','Tour 500','clay',4,[6.5,8],500,{rank:40}],
  ['Madrid Masters','Masters','clay',5,[7,8.5],1000,{rank:50}],
  ['Paris Major','Major','clay',5,[6,9],2000,{major:'Paris'}],
  ['Queen’s 500','Tour 500','grass',4,[6.5,8],500,{rank:40}],
  ['London Major','Major','grass',5,[6,9],2000,{major:'London'}],
  ['Washington 500','Tour 500','hard',4,[6.5,8],500,{rank:40}],
  ['Cincinnati Masters','Masters','hard',5,[7,8.5],1000,{rank:50}],
  ['New York Major','Major','hard',5,[6,9],2000,{major:'New York'}]
].map(([n,t,s,r,sk,p,x])=>({main:EV(n,t,s,r,sk,p,x),alt:'pro'}));
const ALT_CITIES=['Canberra','Burnie','Tenerife','Monterrey','Sarasota','Aix','Bordeaux','Ilkley','Nottingham','Lexington','Granby','Cary'];
function proAlt(wk){const surf=PRO_WEEKS[wk].main.surf;return proRank()<=300?EV('Challenger '+ALT_CITIES[wk],'Challenger',surf,4,[5,6.5],150):EV('Futures '+ALT_CITIES[wk],'Futures',surf,3,[4,5.5],80)}
const PRIZE={Futures:15000,Challenger:40000,'Tour 250':100000,'Tour 500':250000,Masters:600000,Major:2500000};
const MAJORS=['Melbourne','Paris','London','New York'];
const STYLES=[
  {id:'server',name:'Big Server',d:'Builds points off the serve.',perks:['More aces on first serves','Second serves stray 40% less','Faster serves and even more aces']},
  {id:'baseliner',name:'Baseliner',d:'Lives on the baseline and grinds.',perks:['Deep shots stray 25% less','Reach wider balls','Deep shots force more errors']},
  {id:'allcourt',name:'All-Court',d:'Touch, angles and variety.',perks:['Drop shots are much harder to return','Sharp angles force more errors','Every shot strays 10% less']},
  {id:'counter',name:'Counterpuncher',d:'Gets everything back and waits.',perks:['Opponents make more unforced errors','Long rallies wear opponents down','Reach almost anything']}
];
const PERK_AT=[0,15,40];
/* how each style plays when the computer controls it.
   agg: how close to the lines it aims; risk: how much that aggression costs in errors; attack: chance to punish a short ball;
   approach: chance to follow an attack to the net; lob/drop/angle/bh/wrong: shot choice weights; pace/spin: shot shape;
   serve: extra serve speed (m/s); wide: share of serves out wide; sv: serve-and-volley chance; df: double-fault factor */
const OSERVE={server:[0.65,0.35,0],baseliner:[0.5,0.3,0.2],allcourt:[0.35,0.45,0.2],counter:[0.25,0.25,0.5]};
const OSTYLE={
  server:{name:'Big Server',tip:'Big first serves and quick points. Get the return deep and make them hit extra balls.',agg:0.65,risk:1.2,attack:0.8,approach:0.55,lob:0.15,drop:0.03,angle:0.12,bh:0.25,wrong:0.15,pace:2,spin:-20,serve:3,slice:0.08,wide:0.5,sv:0.35,df:1.15,ue:0,reach:0},
  baseliner:{name:'Baseliner',tip:'Heavy, deep topspin and a steady diet of backhands. Look for a short ball to attack.',agg:0.5,risk:1,attack:0.7,approach:0.2,lob:0.25,drop:0.04,angle:0.15,bh:0.42,wrong:0.2,pace:1,spin:80,serve:0,slice:0.12,wide:0.35,sv:0.05,df:1,ue:0,reach:0},
  allcourt:{name:'All-Court',tip:'Angles, drop shots and trips to the net. Stay balanced and be ready to come forward.',agg:0.55,risk:1,attack:0.65,approach:0.55,lob:0.3,drop:0.12,angle:0.28,bh:0.25,wrong:0.22,pace:0,spin:0,serve:0,slice:0.28,wide:0.4,sv:0.15,df:1,ue:0,reach:0},
  counter:{name:'Counterpuncher',tip:'Gets everything back and rarely misses. Be patient, then finish at the net.',agg:0.3,risk:0.6,attack:0.4,approach:0.05,lob:0.55,drop:0.04,angle:0.1,bh:0.3,wrong:0.15,pace:-1,spin:40,serve:-1,slice:0.22,wide:0.3,sv:0,df:0.7,ue:-0.015,reach:0.25}};
function styleOfChar(c){const t=c?c.st:{power:5,control:5,speed:5,serve:5,stamina:5};
  const sc={server:t.serve*1.25+t.power*0.55,counter:t.speed*0.9+(t.stamina||5)*0.9,allcourt:t.control*1.15+t.speed*0.45,baseliner:t.power*0.7+t.control*0.55+(t.stamina||5)*0.45+1.2};
  return Object.keys(sc).reduce((a,b)=>sc[b]>sc[a]?b:a)}
const SPONSORS=[
  {id:'nil',name:'Hometown Pizza NIL deal',pay:5000,when:'Top 25 college ranking'},
  {id:'strings',name:'Northstar Strings',pay:50000,when:'First pro title'},
  {id:'apparel',name:'Baseline Apparel',pay:150000,when:'Top 100 world ranking'},
  {id:'ace',name:'Ace Sportswear',pay:1000000,when:'Top 10 world ranking'},
  {id:'watch',name:'Grand Slam Watches',pay:3000000,when:'Win a major'}
];
const CAMPS=[{n:'Weekend clinic',cost:5000,xp:25},{n:'Pro academy block',cost:60000,xp:110},{n:'Elite coaching retreat',cost:600000,xp:400}];
const RIVAL_TYPES=[
  {t:'Showman',lines:['Hope you brought a camera. I put on a show.','The crowd came to see me, not you.','Last time was a warm-up.']},
  {t:'Grinder',lines:['I’ll be out here all day if I have to.','You’ll have to hit through me.','Bring your legs.']},
  {t:'Ice cold',lines:['Nothing personal.','I don’t lose finals.','Another day at the office.']}
];

let save=null;
function load(){try{const s=localStorage.getItem(KEY_V);return s?JSON.parse(s):null}catch(e){return null}}
function store(){try{localStorage.setItem(KEY_V,JSON.stringify(save))}catch(e){}}
save=load();
if(save&&save.stats&&save.stats.stamina==null){const c=RBYID[save.char];save.stats.stamina=Math.max(1,Math.round(((c&&c.st.stamina)||5)*0.45));store()}
const roll=k=>Math.round(save.pts[k].cur+0.5*save.pts[k].prev);
function proRank(){return Math.max(1,Math.round(1500*Math.exp(-roll('pro')/500)))}
function collegeRank(){return Math.max(1,Math.round(400*Math.exp(-roll('college')/300)))}
function program(){return PROGRAMS.find(p=>p.id===save.college)}
function xpMult(){return save.stage==='college'&&program()?program().xp:1}
function weeks(){return save.stage==='junior'?JUNIOR_WEEKS:save.stage==='college'?collegeWeeks(save.college):PRO_WEEKS}
function fmt(stage,ev){if(stage==='junior')return{bo:1,g:4};if(stage==='college')return{bo:1,g:6};return ev.tier==='Major'?{bo:3,g:6}:{bo:3,g:4}}
function perkLevel(){if(!save)return 0;return PERK_AT.filter(n=>save.careerW>=n).length}
function money(n){return n>=1e6?'$'+(n/1e6).toFixed(n>=1e7?0:1)+'M':n>=1e3?'$'+Math.round(n/1e3)+'k':'$'+n}
function hof(){const r=save.rec;return r.majors*100+r.masters*25+r.titles*10+r.weeks1*5+(MAJORS.every(m=>save.majors[m])?200:0)}
/* which event you play this week, and how you got in */
function entry(wk){
  const W=weeks()[wk],ev=W.main;
  if(save.stage==='junior'){if(!ev.cut||roll('junior')>=ev.cut)return{ev,how:'direct',qual:0};return{ev:W.alt,how:'alt',qual:0,missed:ev,why:'needs '+ev.cut+' junior points'}}
  if(save.stage==='college'){if(!ev.crank)return{ev,how:'direct',qual:0};
    if(collegeRank()<=ev.crank||(ev.topProgram&&program().o===1))return{ev,how:'direct',qual:0};
    return{ev:W.alt,how:'alt',qual:0,missed:ev,why:'needs a top-'+ev.crank+' college ranking'}}
  const r=proRank();
  if(ev.major){if(r<=100)return{ev,how:'direct',qual:0};if(r<=200)return{ev,how:'qual',qual:3};return{ev:proAlt(wk),how:'alt',qual:0,missed:ev,why:'needs a top-200 ranking for qualifying'}}
  if(r<=ev.rank)return{ev,how:'direct',qual:0};
  return{ev:proAlt(wk),how:'alt',qual:0,missed:ev,why:'needs a top-'+ev.rank+' ranking'};
}
function roundName(r,total,qual){if(r<=qual)return'Qualifying '+r;const left=total-r;return left===0?'Final':left===1?'Semifinal':left===2?'Quarterfinal':left===3?'Round of 16':left===4?'Round of 32':'Round of 64'}
function trainCost(l){return l*15}

/* ================= title ================= */
function stageName(){return{junior:'Juniors',college:'College',pro:'Pro tour'}[save.stage]}
function renderTitle(){
  const has=!!save;$('btnContinue').hidden=!has;$('btnNewConfirm').hidden=true;$('btnNew').hidden=false;
  $('careerChip').textContent=has?(RBYID[save.char].name+' · '+stageName()+' season '+save.season):'No save yet';
  $('btnNew').className=has?'':'go';renderSaveCard();learnCardState();lockerCardState();show('title');
}
$('btnContinue').onclick=()=>renderHub();
$('hubLocker').onclick=()=>openLocker(()=>renderHub());
/* ---- keeping the career safe: home-screen install, persistent storage, backup codes ---- */
const STANDALONE=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
const IOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('sw.js').catch(()=>{});
function renderSaveCard(){
  $('installHint').textContent=STANDALONE?'Tennis Go is installed on this device, so your career is kept here. A backup code is still handy if you change phones.'
    :IOS?'Safari can delete website data if you go a week without opening the game. Add it to your Home Screen (Share, then Add to Home Screen) and play from that icon. The installed app keeps its own data, so copy a backup code here first and restore it there.'
    :'Install Tennis Go (browser menu, then Install app or Add to Home screen) so your career is kept and the game works offline. Copy a backup code first, then restore it in the installed app.';
  $('btnBackup').disabled=!save&&!PROF.xp;$('saveMsg').textContent='';$('saveCode').hidden=true;$('btnRestoreGo').hidden=true;$('btnRestoreGo').dataset.arm=''}
function saveCode(){return'TG2:'+btoa(unescape(encodeURIComponent(JSON.stringify({c:save,p:PROF,l:LEARN}))))}
$('btnBackup').onclick=async()=>{if(!save&&!PROF.xp)return;const code=saveCode(),ta=$('saveCode');ta.hidden=false;ta.value=code;$('btnRestoreGo').hidden=true;
  let ok=false;try{await navigator.clipboard.writeText(code);ok=true}catch(e){}
  if(!ok){ta.focus();ta.select()}
  $('saveMsg').textContent=ok?'Copied. Paste it somewhere safe, like Notes or a message to yourself.':'Copy the code above and keep it somewhere safe, like Notes.'};
$('btnRestore').onclick=()=>{const ta=$('saveCode');ta.hidden=false;ta.value='';ta.focus();$('btnRestoreGo').hidden=false;$('btnRestoreGo').dataset.arm='';$('btnRestoreGo').textContent='Restore this career';$('saveMsg').textContent='Paste your backup code above.'};
$('btnRestoreGo').onclick=()=>{
  const raw=$('saveCode').value.trim().replace(/\s+/g,'');let obj=null;
  let prof=null,learn=null;
  try{if(!/^TG[12]:/.test(raw))throw 0;const d=JSON.parse(decodeURIComponent(escape(atob(raw.slice(4)))));if(raw[2]==='2'){obj=d.c;prof=d.p;learn=d.l}else obj=d}catch(e){obj=null;prof=null}
  const okC=obj&&obj.char&&obj.stage&&obj.stats&&RBYID[obj.char];if(!okC)obj=null;
  if(!obj&&!(prof&&prof.v)){$('saveMsg').textContent='That code doesn’t look right. Copy the whole code, starting with TG.';return}
  const b=$('btnRestoreGo');if(save&&b.dataset.arm!=='1'){b.dataset.arm='1';b.textContent='Tap again to replace your current career';return}
  if(obj){save=obj;store()}if(prof&&prof.v){PROF=Object.assign(PROF_NEW(),prof);storeProf()}if(learn&&learn.done){LEARN=learn;storeLearn()}
  renderTitle();$('saveMsg').textContent='Restored'+(obj?': '+RBYID[save.char].name+', '+stageName()+' season '+save.season:'')+(prof&&prof.v?' · Level '+LV():'')+'.'};
$('btnNew').onclick=()=>{if(save){$('btnNew').hidden=true;$('btnNewConfirm').hidden=false}else openSelect('career')};
$('btnNewConfirm').onclick=()=>openSelect('career');
$('btnQuick').onclick=()=>openSelect('quick');

/* ================= player select + play style ================= */
let selMode='career',selId=null,styleId=null;
/* every career starts from the same 14 points: 2 in each stat, plus 4 more shared out by the character's shape
   (weighted toward what they are best at), so players keep their personality without anyone starting behind */
const START_TOTAL=14,START_FLOOR=2;
function careerStart(c){const keys=STATS.map(s=>s[0]),full=keys.map(k=>c.st[k]),mn=Math.min(...full),w=full.map(v=>Math.pow(v-mn+1,1.5)),sw=w.reduce((a,b)=>a+b,0);
  const extra=START_TOTAL-START_FLOOR*keys.length,raw=w.map(x=>extra*x/sw),got=raw.map(Math.floor);let left=extra-got.reduce((a,b)=>a+b,0);
  raw.map((v,i)=>[v-Math.floor(v),full[i],i]).sort((a,b)=>b[0]-a[0]||b[1]-a[1]).forEach(([,,i])=>{if(left>0){got[i]++;left--}});
  const st={};keys.forEach((k,i)=>st[k]=START_FLOOR+got[i]);return st}
function openSelect(mode){
  selMode=mode;selId=mode==='quick'&&save?save.char:null;
  $('selEyebrow').textContent=mode==='career'?'New career':'Quick match';
  $('selIntro').textContent=mode==='career'?'Every career starts as a raw 16-year-old with the same 14 rating points, shaped like the player you pick. Win matches and train to grow into the full ratings shown here, and past them.':'Pick who you want to play as.';
  $('roster').innerHTML=ROSTER.map(r=>{const ok=charUnlocked(r.id);return'<button class="pc'+(ok?'':' locked')+'" data-id="'+r.id+'" aria-pressed="'+(r.id===selId)+'" '+(ok?'':'disabled')+'><strong>'+esc(r.name)+'</strong><small>'+(ok?esc(r.nick)+' · '+OSTYLE[styleOfChar(r)].name+(masteryOf(r.id)?' · Mastery '+masteryOf(r.id):''):'Unlocks at level '+charUnlockLv(r.id))+'</small><div class="mini">'+STATS.map(([k,l])=>'<span>'+l+'</span><div class="bar"><i style="width:'+r.st[k]*10+'%"></i></div>').join('')+'</div></button>'}).join('');
  $('roster').querySelectorAll('.pc:not(.locked)').forEach(b=>b.onclick=()=>{selId=b.dataset.id;$('roster').querySelectorAll('.pc').forEach(x=>x.setAttribute('aria-pressed',x===b));updSel()});
  updSel();show('select');
}
function updSel(){$('selGo').disabled=!selId;$('selGo').textContent=selId?(selMode==='career'?'Next: play style':'Play as '+RBYID[selId].name):'Pick a player'}
$('selBack').onclick=()=>renderTitle();
$('selGo').onclick=()=>{
  if(!selId)return;
  if(selMode==='career'){openStyle();return}
  const lvl=+$('qmLevel').value,me=RBYID[selId],stats={};for(const [k] of STATS)stats[k]=clamp(me.st[k],1,10);
  const o=pick(ROSTER.filter(r=>r.id!==selId));
  startMatch({surf:$('qmSurf').value,bo:1,g:6,stats,meId:selId,me:me.name,opp:{id:o.id,name:o.name,skill:lvl},label:'Quick match',style:null,perks:0,venue:$('qmVenue').value,
    onEnd:(won,score,st)=>showResult(won,score,st,won?'Nice set. Try a tougher opponent next.':'Shake it off and run it back.',[],'Back to menu',()=>renderTitle())});
};
function openStyle(){
  styleId=null;
  $('styles').innerHTML=STYLES.map(s=>'<button class="pc" data-id="'+s.id+'" aria-pressed="false"><strong>'+s.name+'</strong><small>'+s.d+'</small><ol class="perks">'+s.perks.map((p,i)=>'<li><span class="muted">'+(i===0?'Start':PERK_AT[i]+' wins')+'</span> '+p+'</li>').join('')+'</ol></button>').join('');
  $('styles').querySelectorAll('.pc').forEach(b=>b.onclick=()=>{styleId=b.dataset.id;$('styles').querySelectorAll('.pc').forEach(x=>x.setAttribute('aria-pressed',x===b));$('styleGo').disabled=false;$('styleGo').textContent='Start career as a '+STYLES.find(s=>s.id===styleId).name});
  $('styleGo').disabled=true;$('styleGo').textContent='Pick a play style';show('style');
}
$('styleBack').onclick=()=>openSelect('career');
$('styleGo').onclick=()=>{
  if(!styleId)return;
  const c=RBYID[selId],st=careerStart(c);
  const pool=ROSTER.filter(r=>r.id!==selId).sort(()=>Math.random()-0.5).slice(0,3);
  save={char:selId,style:styleId,stats:st,xp:0,stage:'junior',season:1,week:0,age:16,
    pts:{junior:{cur:0,prev:0},college:{cur:0,prev:0},pro:{cur:0,prev:0}},juniorTotal:0,
    history:[],titles:[],majors:{},money:0,earnings:0,sponsors:[],
    rec:{titles:0,majors:0,masters:0,weeks1:0,best:9999},
    rivals:pool.map((r,i)=>({id:r.id,edge:[0.6,0.9,1.2][i],type:i,w:0,l:0,last:null})),
    college:null,collegeSeasons:0,cur:null,careerW:0,careerL:0,retireAsked:false,retired:false};
  store();renderHub();
};

/* ================= hub ================= */
function standing(){
  if(save.stage==='junior')return['Junior points',roll('junior')];
  if(save.stage==='college')return['College rank','#'+collegeRank()];
  return['World rank','#'+proRank()];
}
function renderHub(){
  if(!save){renderTitle();return}
  if(save.week>=weeks().length){seasonEnd();return}
  const C=RBYID[save.char],S=STYLES.find(s=>s.id===save.style);
  const stages=[['junior','Juniors'],['college','College'],['pro','Pro tour']],si=stages.findIndex(s=>s[0]===save.stage);
  $('stepper').innerHTML=stages.map((s,i)=>'<div class="step '+(i<si?'done':i===si?'now':'')+'">'+s[1]+'</div>').join('');
  const [sl,sv]=standing();
  $('playerCard').innerHTML='<div style="min-width:0"><h2 style="font-size:32px">'+esc(C.name)+'</h2><p class="muted">'+S.name+' · Age '+save.age+' · '+stageName()+' season '+save.season+(save.stage==='college'?' · '+esc(program().name):'')+'</p></div>'+
    '<div class="kv"><div><small>'+sl+'</small><strong class="num">'+sv+'</strong></div><div><small>Record</small><strong class="num">'+save.careerW+'–'+save.careerL+'</strong></div><div><small>'+(save.stage==='pro'?'Bank':'Titles')+'</small><strong class="num">'+(save.stage==='pro'?money(save.money):save.titles.length)+'</strong></div></div>';
  const W=weeks(),wk=save.week;
  const E=save.cur?{ev:save.cur.ev,how:save.cur.how,qual:save.cur.qual,missed:save.cur.missed,why:save.cur.why}:entry(wk);
  const ev=E.ev,f=fmt(save.stage,ev),total=save.cur?save.cur.total:ev.rounds+E.qual;
  let note='';
  if(E.how==='alt')note='<p class="note">You missed the cut for the <b>'+esc(E.missed.n)+'</b> ('+E.why+'), so you play the alternate event this week.</p>';
  if(E.how==='qual')note='<p class="note">Your ranking gets you into qualifying. Win '+E.qual+' qualifying matches to reach the main draw.</p>';
  let oppHtml='';
  if(save.cur&&save.cur.opp){const o=save.cur.opp,rv=o.rival!=null?save.rivals[o.rival]:null;
    oppHtml='<div class="opp"><div class="row between"><div style="min-width:0"><p class="eyebrow">'+roundName(save.cur.round,total,save.cur.qual)+(rv?' · Rival · '+RIVAL_TYPES[rv.type].t:'')+'</p><p style="font-weight:600;font-size:18px">'+esc(o.name)+'</p><p class="muted" style="font-size:13px">'+OSTYLE[styleOfChar(RBYID[o.id])].name+'</p></div><div style="width:110px"><p class="muted" style="font-size:12px">Rating '+o.skill.toFixed(1)+'</p><div class="bar"><i style="width:'+o.skill*10+'%;background:var(--loss)"></i></div></div></div>'+
      (rv?'<p class="quote">“'+esc(o.line)+'”</p><p class="muted" style="font-size:13px">Head-to-head '+rv.w+'–'+rv.l+(rv.last==='l'?' · Revenge match':'')+'</p>':'')+'</div>'}
  $('nextCard').innerHTML='<p class="eyebrow">Week '+(wk+1)+' of '+W.length+' · '+esc(ev.tier)+(save.cur?' · In progress':'')+'</p><h3 style="font-size:26px">'+esc(ev.n)+'</h3>'+
    '<div class="row"><span class="chip"><span class="dot s-'+ev.surf+'"></span>'+SURF[ev.surf].name+'</span><span class="chip num">'+total+(total===1?' match':' rounds')+'</span><span class="chip">'+(f.bo===3?'Best of 3 sets':'One set')+' to '+f.g+'</span>'+
    '<span class="chip num">'+(save.stage==='pro'?money(PRIZE[ev.tier]||0)+' · ':'')+ev.pts+' pts</span></div>'+note+oppHtml+
    '<button class="go" id="btnPlay">'+(save.cur?'Play '+roundName(save.cur.round,total,save.cur.qual).toLowerCase():'Enter '+(E.how==='qual'?'qualifying':'tournament'))+'</button>';
  $('btnPlay').onclick=playNext;
  const pl=perkLevel();
  $('statsCard').innerHTML='<div class="row between"><h3>Training</h3><span class="chip num">'+save.xp+' training pts</span></div>'+
    STATS.map(([k,l,d])=>{const v=save.stats[k],c=trainCost(v);return'<div class="stat"><span title="'+d+'">'+l+(gearBonus(k)?' <small class="gearb">+'+gearBonus(k).toFixed(1)+'</small>':'')+'</span><div class="bar"><i style="width:'+v*10+'%"></i></div><button data-k="'+k+'" '+(v>=10||save.xp<c?'disabled':'')+'>'+(v>=10?'Max':'+1 · '+c)+'</button></div>'}).join('')+
    '<h3 style="margin-top:4px">'+S.name+' perks</h3><ul class="perklist">'+S.perks.map((p,i)=>'<li class="'+(i<pl?'on':'')+'"><span>'+(i<pl?'✓':PERK_AT[i]+' wins')+'</span>'+p+'</li>').join('')+'</ul>'+
    (save.stage!=='junior'?'<h3 style="margin-top:4px">Training camps</h3><p class="muted" style="font-size:13px;margin-top:-6px">Spend prize and sponsor money on extra training points. Bank: '+money(save.money)+'</p>'+
      CAMPS.map((c,i)=>'<div class="row between"><span>'+c.n+' <span class="muted">+'+c.xp+' pts</span></span><button data-camp="'+i+'" '+(save.money<c.cost?'disabled':'')+'>'+money(c.cost)+'</button></div>').join(''):'');
  $('statsCard').querySelectorAll('button[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k,c=trainCost(save.stats[k]);if(save.xp>=c&&save.stats[k]<10){save.xp-=c;save.stats[k]++;store();renderHub()}});
  $('statsCard').querySelectorAll('button[data-camp]').forEach(b=>b.onclick=()=>{const c=CAMPS[+b.dataset.camp];if(save.money>=c.cost){save.money-=c.cost;save.xp+=c.xp;store();renderHub()}});
  $('calCard').innerHTML='<h3>'+stageName()+' season '+save.season+'</h3><ul>'+W.map((w,i)=>{
    const h=save.history.find(x=>x.stage===save.stage&&x.season===save.season&&x.wk===i);
    const nm=h?h.name:(i===wk?ev.n:w.main.n);
    const r=h?'<span class="res '+(h.champ?'w':'')+'">'+h.res+'</span>':i===wk?'<span class="res next">Now</span>':'<span class="res up">'+(w.main.tier)+'</span>';
    return'<li class="'+(i===wk?'is-next':'')+'"><span class="dot s-'+w.main.surf+'"></span><span style="min-width:0">'+esc(nm)+'</span>'+r+'</li>'}).join('')+'</ul>';
  const rv=save.rivals.map(r=>'<div class="row between" style="font-size:15px"><span>'+esc(RBYID[r.id].name)+' <span class="muted">· '+RIVAL_TYPES[r.type].t+'</span></span><span class="num muted">'+r.w+'–'+r.l+'</span></div>').join('');
  const sp=save.sponsors.length?save.sponsors.map(id=>{const s=SPONSORS.find(x=>x.id===id);return'<div class="row between" style="font-size:15px"><span>'+s.name+'</span><span class="num muted">'+money(s.pay)+'/season</span></div>'}).join(''):'<p class="muted" style="font-size:14px">No deals yet. Next: '+SPONSORS.find(s=>!save.sponsors.includes(s.id)).when+'.</p>';
  const R=save.rec,slam=MAJORS.every(m=>save.majors[m]);
  $('trophyCard').innerHTML='<h3>Major titles</h3><div class="slots">'+MAJORS.map(m=>{const n=save.majors[m]||0;return'<div class="slot '+(n?'won':'')+'"><strong>'+m+'</strong><span class="num">'+(n?n+(n>1?' titles':' title'):'Not yet won')+'</span></div>'}).join('')+'</div>'+
    '<div class="kv"><div><small>Titles</small><strong class="num">'+R.titles+'</strong></div><div><small>Earnings</small><strong class="num">'+money(save.earnings)+'</strong></div><div><small>Hall of Fame</small><strong class="num">'+hof()+'</strong></div></div>'+
    '<div class="kv"><div><small>Best rank</small><strong class="num">'+(R.best<9999?'#'+R.best:'–')+'</strong></div><div><small>Weeks at No. 1</small><strong class="num">'+R.weeks1+'</strong></div><div><small>Career Slam</small><strong>'+(slam?'Yes':'Not yet')+'</strong></div></div>'+
    '<h3 style="margin-top:6px">Sponsors</h3>'+sp+
    '<h3 style="margin-top:6px">Rivals</h3>'+rv;
  show('hub');
}
$('hubMenu').onclick=()=>renderTitle();
function makeOpp(){
  const c=save.cur,ev=c.ev,r=c.round;
  let skill,rival=null,who,line=null;
  if(r<=c.qual)skill=ev.sk[0]-1.2+rnd(-0.3,0.3);
  else{const mr=r-c.qual,mt=c.total-c.qual;skill=ev.sk[0]+(ev.sk[1]-ev.sk[0])*(mt>1?(mr-1)/(mt-1):1)+rnd(-0.4,0.4)}
  const rivIds=save.rivals.map(x=>x.id);who=pick(ROSTER.filter(x=>x.id!==save.char&&!rivIds.includes(x.id)));
  const mainLeft=c.total-r;
  if(r>c.qual&&c.total-c.qual>=3&&(mainLeft===0||(mainLeft===1&&ev.tier==='Major'))){
    rival=(save.history.length+(mainLeft===1?1:0))%3;const rv=save.rivals[rival];who=RBYID[rv.id];skill=ev.sk[1]+rv.edge*0.5-(mainLeft===1?0.4:0);
    line=rv.last==='l'?'Back for more? I remember how the last one went.':pick(RIVAL_TYPES[rv.type].lines)}
  c.opp={id:who.id,name:who.name,skill:Math.round(clamp(skill,1,10)*10)/10,rival,line};
}
function playNext(){
  if(!save.cur){const E=entry(save.week);save.cur={ev:E.ev,how:E.how,qual:E.qual,missed:E.missed||null,why:E.why||null,round:1,total:E.ev.rounds+E.qual,opp:null,prize:0}}
  if(!save.cur.opp)makeOpp();store();
  const c=save.cur,f=fmt(save.stage,c.ev);
  startMatch({ev:c.ev,stage:save.stage,college:save.college,surf:c.ev.surf,bo:f.bo,g:f.g,stats:save.stats,meId:save.char,me:RBYID[save.char].name,opp:c.opp,style:save.style,perks:perkLevel(),
    label:c.ev.n+' · '+roundName(c.round,c.total,c.qual),intro:c.opp.line?c.opp.name+': “'+c.opp.line+'”':null,onEnd:careerResult});
}
const SHORT={Semifinal:'SF',Quarterfinal:'QF','Round of 16':'R16','Round of 32':'R32','Round of 64':'R64'};
function prizeFor(ev,winsInMain,mainRounds,champ){const P=PRIZE[ev.tier];if(!P||save.stage!=='pro')return 0;if(champ)return P;const fr=[0.015,0.03,0.06,0.12,0.25,0.5];return Math.round(P*(fr[clamp(winsInMain,0,5)]||0.5)*(mainRounds>=5?1:1.3))}
function checkSponsors(lines){
  const add=id=>{if(!save.sponsors.includes(id)){save.sponsors.push(id);const s=SPONSORS.find(x=>x.id===id);lines.push(['New sponsor',s.name]);}};
  if(save.stage==='college'&&collegeRank()<=25)add('nil');
  if(save.stage==='pro'){if(save.history.some(h=>h.stage==='pro'&&h.champ))add('strings');if(proRank()<=100)add('apparel');if(proRank()<=10)add('ace');if(Object.keys(save.majors).length)add('watch')}
}
function careerResult(won,score,st){
  const c=save.cur,ev=c.ev,o=c.opp,lines=[],stageKey=save.stage;
  let xp=Math.round((won?25+Math.round(ev.pts/40):10)*xpMult());
  if(won)save.careerW++;else save.careerL++;
  if(o.rival!=null){const rv=save.rivals[o.rival];if(won)rv.w++;else rv.l++;rv.last=won?'w':'l'}
  let text,champ=false,done=false,resLabel,prize=0;
  const mainRounds=c.total-c.qual,winsMain=Math.max(0,c.round-1-c.qual);
  if(won&&c.round===c.total){
    champ=true;done=true;careerMilestone(ev,true);xp+=Math.round(40*xpMult());save.pts[stageKey].cur+=ev.pts;save.titles.push(ev.n+' '+save.season);save.rec.titles++;
    if(ev.major)save.majors[ev.major]=(save.majors[ev.major]||0)+1,save.rec.majors++;if(ev.tier==='Masters')save.rec.masters++;
    if(stageKey==='junior')save.juniorTotal+=ev.pts;
    prize=prizeFor(ev,mainRounds,mainRounds,true);
    text=ev.major?'You are a major champion. '+ev.n+' is yours.':'Champion of the '+ev.n+'!';resLabel='W';lines.push(['Points','+'+ev.pts]);
  }else if(won){
    const wasQual=c.round===c.qual;c.round++;c.opp=null;
    text=wasQual?'Through qualifying! You are in the main draw.':'Into the '+roundName(c.round,c.total,c.qual).toLowerCase()+'.';
  }else{
    done=true;
    const earned=winsMain>0?Math.round(ev.pts*Math.pow(0.55,mainRounds-winsMain)):(c.round>c.qual?Math.round(ev.pts*0.03):0);
    save.pts[stageKey].cur+=earned;if(stageKey==='junior')save.juniorTotal+=earned;
    prize=c.round>c.qual?prizeFor(ev,winsMain,mainRounds,false):(save.stage==='pro'&&PRIZE[ev.tier]?Math.round(PRIZE[ev.tier]*0.005):0);
    const rn=roundName(c.round,c.total,c.qual);resLabel=c.round<=c.qual?'Q'+c.round:c.round===c.total?'F':(SHORT[rn]||'R1');
    text=o.rival!=null?'Your rival '+o.name+' gets the better of you this time.':'Out in the '+rn.toLowerCase()+'.';
    lines.push(['Points','+'+earned]);
  }
  if(prize){save.money+=prize;save.earnings+=prize;lines.push(['Prize money',money(prize)])}
  save.xp+=xp;lines.unshift(['Training pts','+'+xp]);
  if(done){
    if(save.stage==='pro'){const r=proRank();save.rec.best=Math.min(save.rec.best,r);if(r===1)save.rec.weeks1++}
    save.history.push({stage:stageKey,season:save.season,wk:save.week,name:ev.n,res:resLabel,champ});save.week++;save.cur=null;
    const before=perkLevel();checkSponsors(lines);
  }
  const pl=perkLevel(),S=STYLES.find(s=>s.id===save.style);
  if(won&&PERK_AT.includes(save.careerW)&&save.careerW>0)lines.push(['Perk unlocked',S.perks[PERK_AT.indexOf(save.careerW)]]);
  store();showResult(won,score,st,text,lines,'Back to hub',()=>renderHub(),champ);
}

/* ================= season transitions ================= */
function settle(amount){const k=save.stage+save.season;if(save.settled!==k){save.settled=k;if(amount){save.money+=amount;save.earnings+=amount}store()}}
function newSeasonPts(k){save.pts[k].prev=save.pts[k].cur;save.pts[k].cur=0}
function seasonScreen(eyebrow,title,text,buttons){
  $('seEyebrow').textContent=eyebrow;$('seTitle').textContent=title;$('seText').innerHTML=text;
  $('seBtns').innerHTML='';buttons.forEach(([label,cls,fn])=>{const b=document.createElement('button');b.textContent=label;if(cls)b.className=cls;b.onclick=fn;$('seBtns').appendChild(b)});
  show('season');
}
function seasonSummary(){const hs=save.history.filter(h=>h.stage===save.stage&&h.season===save.season);const w=hs.filter(h=>h.champ).length;return hs.length+' events, '+w+(w===1?' title':' titles')}
function seasonEnd(){
  const st=save.stage;
  if(st==='junior'){
    if(save.season<2){seasonScreen('Junior season 1 complete','On to season 2',seasonSummary()+'. You have '+roll('junior')+' junior points. Points carry into next season at half value, so keep climbing.',
      [['Start junior season 2','go',()=>{save.season=2;save.week=0;save.age++;newSeasonPts('junior');store();renderHub()}]]);return}
    renderRecruit();return}
  if(st==='college'){
    save.collegeSeasons=save.season;
    const nil=save.sponsors.includes('nil')?5000:0;settle(nil);
    const sum=seasonSummary()+'. College rank #'+collegeRank()+'.'+(nil?' Your NIL deal paid '+money(nil)+'.':'');
    const next=()=>{save.season++;save.week=0;save.age++;newSeasonPts('college');store();renderHub()};
    if(save.season<2){seasonScreen('College season 1 complete','Back for season 2',sum+' Every player stays at least two seasons.',[['Start college season 2','go',next]]);return}
    if(save.season>=4){seasonScreen('College career complete','Turning pro',sum+' Four seasons done. Time for the tour.',[['Turn pro','go',turnPro]]);return}
    seasonScreen('College season '+save.season+' complete','Stay or go pro?',sum+' You can come back for another season (up to four) to keep earning training points from the coaching staff, or turn pro now.',
      [['Turn pro','go',turnPro],['Return for season '+(save.season+1),'',next]]);return}
  // pro
  let pay=0;save.sponsors.forEach(id=>{if(id!=='nil')pay+=SPONSORS.find(s=>s.id===id).pay});
  settle(pay);
  const sum=seasonSummary()+'. World rank #'+proRank()+'.'+(pay?' Sponsors paid '+money(pay)+'.':'');
  const next=()=>{save.season++;save.week=0;save.age++;newSeasonPts('pro');store();renderHub()};
  if(save.age+1>=35&&!save.retireAsked){save.retireAsked=true;store();
    seasonScreen('Season '+save.season+' complete','Time to retire?',sum+'<br><br>'+legacyText(),[['Retire','go',retire],['Keep playing','',next]]);return}
  seasonScreen('Season '+save.season+' complete','On to season '+(save.season+1),sum,[['Start season '+(save.season+1),'go',next]]);
}
function legacyText(){const R=save.rec,slam=MAJORS.every(m=>save.majors[m]);
  return R.titles+' titles, '+R.majors+' majors'+(slam?' (a Career Slam)':'')+', best ranking #'+(R.best<9999?R.best:'–')+', '+R.weeks1+' weeks at No. 1, '+money(save.earnings)+' in earnings. Hall of Fame score '+hof()+(hof()>=600?': a first-ballot Hall of Famer.':hof()>=250?': Hall of Fame worthy.':'.')}
function retire(){save.retired=true;store();seasonScreen('Career over','Thanks for the memories',RBYID[save.char].name+' retires at '+(save.age+1)+'. '+legacyText(),[['Back to menu','go',()=>renderTitle()],['Keep playing anyway','',()=>{save.retired=false;save.season++;save.week=0;save.age++;newSeasonPts('pro');store();renderHub()}]])}
function turnPro(){save.stage='pro';save.season=1;save.week=0;save.age++;save.pts.pro={cur:Math.round(roll('college')*0.6),prev:0};store();
  seasonScreen('Welcome to the tour','Pro season 1','You start ranked #'+proRank()+'. Majors need a top-100 ranking for direct entry and top-200 for qualifying. Below that you play Challengers or Futures to climb.',[['Start pro season 1','go',()=>renderHub()]])}
function renderRecruit(){
  const p=save.juniorTotal;
  $('recruitIntro').textContent='You finished juniors with '+p+' junior points across two seasons. Pick where you play college tennis.';
  $('offers').innerHTML=PROGRAMS.map(pr=>{const ok=p>=pr.need;return'<button class="offer card" data-id="'+pr.id+'" '+(ok?'':'disabled')+'><span class="eyebrow">'+(ok?'Offer':'Needs '+pr.need+' junior points')+'</span><strong>'+pr.name+'</strong><span class="muted">'+pr.blurb+'</span></button>'}).join('');
  $('offers').querySelectorAll('button').forEach(b=>b.onclick=()=>{save.college=b.dataset.id;save.stage='college';save.season=1;save.week=0;save.age++;save.pts.college={cur:program().start,prev:0};save.cur=null;store();renderHub()});
  show('recruit');
}
let resultNext=null;
function showResult(won,score,st,text,lines,btn,next,champ){
  $('rBanner').textContent=champ?'Champion':won?'Match won':'Match lost';$('rBanner').className='banner '+(won?'w':'l');
  $('rScore').textContent=score;$('rText').textContent=text;
  const all=[['Aces',st.aces],['Winners',st.winners],['Perfect hits',st.perfect||0]].concat(lines||[]);
  $('rStats').innerHTML=all.map(([k,v])=>'<div><small>'+k+'</small><strong class="num" style="font-size:'+(String(v).length>10?'16px':'24px')+'">'+esc(v)+'</strong></div>').join('');
  $('rGo').textContent=btn;resultNext=next;renderRewards();show('result');
}
$('rGo').onclick=()=>{if(resultNext)resultNext()};

/* ================= characters ================= */
function b64(s,Ty){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new Ty(u.buffer)}
Object.assign(R3BOSS.clips,window.MCLIPS||{});
const CH={},WAIT={};
window.R3CHAR=function(D){CH[D.id]=D;const w=WAIT[D.id];if(w){delete WAIT[D.id];w.forEach(f=>f(D))}};
function loadChar(id,cb){
  if(id==='boss'){cb(R3BOSS);return}
  if(CH[id]){cb(CH[id]);return}
  if(WAIT[id]){WAIT[id].push(cb);return}
  WAIT[id]=[cb];
  const names=['char_'+id+'.js','char%20'+id+'.js','char'+id+'.js','char-'+id+'.js'];let k=0;
  const tryNext=()=>{const s=document.createElement('script');s.src=CHAR_BASE+names[k];
    s.onerror=()=>{s.remove();if(++k<names.length){tryNext();return}const w=WAIT[id];delete WAIT[id];if(w)w.forEach(f=>f(null))};
    document.head.appendChild(s)};
  tryNext();
}
function quatYaw(x,y,z,w){const fx=2*(x*z+w*y),fz=1-2*(x*x+y*y);return Math.atan2(fx,fz)}
function retarget(D){
  const B=R3BOSS,nbB=B.names.length,nb=D.names.length;
  const rot=(inv,k)=>{const m=new T.Matrix4().fromArray(inv,k*16).transpose().invert(),q=new T.Quaternion(),p=new T.Vector3();m.decompose(p,q,new T.Vector3());return{q,p}};
  const iB=b64(B.inv,Float32Array),iC=b64(D.inv,Float32Array),RB=[],RC=[];for(let k=0;k<nbB;k++)RB.push(rot(iB,k));for(let k=0;k<nb;k++)RC.push(rot(iC,k));
  const bI=Object.fromEntries(B.names.map((s,i)=>[s,i])),map=D.names.map(s=>bI[s]??-1);
  const sc=RC[D.names.indexOf('Hips')].p.y/RB[bI.Hips].p.y;
  const RBi=RB.map(r=>r.q.clone().invert()),RCi=RC.map(r=>r.q.clone().invert());
  const out={},WB=[],WC=[];for(let k=0;k<nbB;k++)WB.push(new T.Quaternion());for(let k=0;k<nb;k++)WC.push(new T.Quaternion());
  const ql=new T.Quaternion(),tmp=new T.Quaternion();
  for(const ck in B.clips){const c=B.clips[ck],Qa=b64(c.q,Int16Array),QS=b64(c.qs,Int16Array),H=b64(c.hip,Float32Array),na=c.anim.length,n=c.n;
    const Q=new Int16Array(n*nb*4),HC=new Float32Array(n*3),qb=new Float32Array(nbB*4);
    for(let f=0;f<n;f++){for(let k=0;k<nbB*4;k++)qb[k]=QS[k]/32767;for(let j=0;j<na;j++){const k=c.anim[j];for(let e=0;e<4;e++)qb[k*4+e]=Qa[(f*na+j)*4+e]/32767}
      for(let k=0;k<nbB;k++){ql.set(qb[k*4],qb[k*4+1],qb[k*4+2],qb[k*4+3]).normalize();const p=B.parent[k];if(p>=0)WB[k].copy(WB[p]).multiply(ql);else WB[k].copy(ql)}
      for(let k=0;k<nb;k++){const p=D.parent[k],jb=map[k];
        if(jb>=0)WC[k].copy(WB[jb]).multiply(RBi[jb]).multiply(RC[k].q);
        else if(p>=0)WC[k].copy(WC[p]).multiply(RCi[p]).multiply(RC[k].q);else WC[k].copy(RC[k].q);
        if(p>=0)tmp.copy(WC[p]).invert().multiply(WC[k]);else tmp.copy(WC[k]);
        const o=(f*nb+k)*4;Q[o]=Math.round(tmp.x*32767);Q[o+1]=Math.round(tmp.y*32767);Q[o+2]=Math.round(tmp.z*32767);Q[o+3]=Math.round(tmp.w*32767)}
      for(let e=0;e<3;e++)HC[f*3+e]=H[f*3+e]*sc}
    for(let f=1;f<n;f++)for(let k=0;k<nb;k++){const a=(f*nb+k)*4,b=((f-1)*nb+k)*4;if(Q[a]*Q[b]+Q[a+1]*Q[b+1]+Q[a+2]*Q[b+2]+Q[a+3]*Q[b+3]<0)for(let e=0;e<4;e++)Q[a+e]=-Q[a+e]}
    out[ck]={fps:c.fps,t0:c.t0||0,n,anim:[...Array(nb).keys()],Q,HIP:HC}}
  return out;
}
function clipsFor(D,isBoss){
  if(D._tc)return D._tc;
  let src;
  if(isBoss){src={};for(const k in R3BOSS.clips){const c=R3BOSS.clips[k];const nb=R3BOSS.names.length,Qa=b64(c.q,Int16Array),QS=b64(c.qs,Int16Array),na=c.anim.length,Q=new Int16Array(c.n*nb*4);
      for(let f=0;f<c.n;f++){Q.set(QS,f*nb*4);for(let j=0;j<na;j++){const k2=c.anim[j];for(let e=0;e<4;e++)Q[(f*nb+k2)*4+e]=Qa[(f*na+j)*4+e]}}
      src[k]={fps:c.fps,t0:c.t0||0,n:c.n,Q,HIP:b64(c.hip,Float32Array)}}}
  else src=retarget(D);
  const nb=D.names.length;
  for(const k in src){const c=src[k],o=0;c.yaw0=quatYaw(c.Q[o]/32767,c.Q[o+1]/32767,c.Q[o+2]/32767,c.Q[o+3]/32767);c.dur=(c.n-1)/c.fps;c.nb=nb;const H=c.HIP,L=(c.n-1)*3;c.spd=Math.max(Math.abs(H[L]-H[0]),Math.abs(H[L+2]-H[2]))/Math.max(c.dur,0.01)*0.01}
  D._tc=src;return src;
}

/* ---- rig-space swing keys: forward +z, the player's right is -x, up +y ---- */
/* ---- stroke animation ----
   Rig space, centimetres: +z toward the net, the player's right is -x, y up; hand heights are relative to a 96 cm hip height.
   The racket hand follows the stroke path (two-bone arm IK), the wrist points the racket, hips and shoulders turn separately
   (shoulders past the hips on the takeback), and the serve turns the whole body sideways for the toss.
   Phases from coaching and biomechanics sources: unit turn, takeback above ball height, racket drop below the ball,
   contact out in front, extension, finish; serve: sideways stance, toss release, trophy (trunk tilted ~25 deg, knees bent),
   racket drop, contact at full reach, pronation, finish across the body. */
const V=(x,y,z)=>new T.Vector3(x,y,z).normalize();
const K=(t,o)=>Object.assign({t},o);
const SWINGS={
  fh:{dur:0.8,cf:0.6,keys:[
    K(0,   {pel:0,  sh:0,   pitch:0,   roll:0,hand:[-22,100,38],rd:[0.1,0.35,0.93],  pole:[-0.6,-0.6,-0.2],left:'throat'}),
    K(0.16,{pel:-35,sh:-75, pitch:0.05,roll:0,hand:[-40,122,2], rd:[0,1,-0.15],      pole:[-0.5,-0.7,-0.3],left:[-14,122,40]}), // unit turn, racket up, free arm across toward the ball
    K(0.38,{pel:-50,sh:-105,pitch:0.08,roll:0,hand:[-48,118,-40],rd:[0.1,0.5,-0.86], pole:[-0.3,-0.8,-0.5],left:[-22,120,44]}), // takeback above ball height
    K(0.50,{pel:-30,sh:-70, pitch:0.1, roll:0,hand:[-46,84,-26],rd:[0,-0.85,-0.5],   pole:[-0.4,-0.8,-0.3],left:[2,112,36]}),   // racket drops below the ball
    K(0.60,{pel:10, sh:-5,  pitch:0.06,roll:0,hand:[-42,105,42],rd:[-0.92,0.12,0.37],pole:[-0.3,-0.9,0.1], left:[22,108,24]}),  // contact out in front
    K(0.76,{pel:30, sh:45,  pitch:0.04,roll:0,hand:[-2,128,62], rd:[-0.25,0.65,0.72],pole:[-0.2,-0.6,0.5], left:[28,108,8]}),   // extend through the ball
    K(1,   {pel:40, sh:80,  pitch:0.04,roll:0,hand:[30,140,8],  rd:[0.35,0.35,-0.87],pole:[0.3,-0.6,0.3],  left:[28,112,0]})]}, // finish over the opposite shoulder
  bh:{dur:0.8,cf:0.6,keys:[ // two-handed backhand: both hands on the grip the whole way
    K(0,   {pel:0,  sh:0,   pitch:0,   roll:0,hand:[-22,100,38],rd:[0.1,0.35,0.93],  pole:[-0.6,-0.6,-0.2],left:'grip'}),
    K(0.16,{pel:35, sh:85,  pitch:0.05,roll:0,hand:[18,122,2],  rd:[0,1,-0.15],      pole:[-0.2,-0.8,-0.3],left:'grip'}),   // unit turn, shoulders past the hips
    K(0.38,{pel:50, sh:115, pitch:0.08,roll:0,hand:[36,118,-36],rd:[-0.1,0.5,-0.86], pole:[0.1,-0.8,-0.5], left:'grip'}),   // takeback above ball height
    K(0.50,{pel:30, sh:75,  pitch:0.1, roll:0,hand:[36,84,-20], rd:[0,-0.85,-0.5],   pole:[0.1,-0.9,-0.2], left:'grip'}),   // racket drops below the ball
    K(0.60,{pel:-5, sh:-8,  pitch:0.06,roll:0,hand:[18,105,46], rd:[0.92,0.12,0.37], pole:[-0.3,-0.9,0.1], left:'grip'}),   // contact in front, both elbows slightly bent
    K(0.76,{pel:-25,sh:-45, pitch:0.04,roll:0,hand:[-4,128,60], rd:[0.25,0.65,0.72], pole:[-0.4,-0.6,0.3], left:'grip'}),   // arms extend toward the target
    K(1,   {pel:-35,sh:-85, pitch:0.04,roll:0,hand:[-30,142,6], rd:[-0.35,0.35,-0.87],pole:[-0.6,-0.3,0.2], left:'grip'})]}, // elbows finish high
  fv:{dur:0.5,cf:0.5,keys:[ // forehand volley: short takeback, racket head up, punch in front with a firm wrist
    K(0,   {pel:0,  sh:0,  pitch:0,   roll:0,hand:[-22,104,40],rd:[0.1,0.4,0.9],    pole:[-0.6,-0.6,-0.2],left:'throat'}),
    K(0.3, {pel:-15,sh:-35,pitch:0.08,roll:0,hand:[-38,120,16],rd:[-0.3,0.85,0.4],  pole:[-0.6,-0.5,-0.3],left:[-8,116,36]}),
    K(0.5, {pel:0,  sh:-12,pitch:0.12,roll:0,hand:[-40,114,52],rd:[-0.75,0.45,0.48],pole:[-0.5,-0.7,0.2], left:[10,112,30]}),
    K(0.75,{pel:4,  sh:-4, pitch:0.1, roll:0,hand:[-32,110,60],rd:[-0.6,0.42,0.68], pole:[-0.5,-0.7,0.3], left:[12,110,28]}),
    K(1,   {pel:0,  sh:0,  pitch:0.04,roll:0,hand:[-22,104,40],rd:[0.1,0.4,0.9],    pole:[-0.6,-0.6,-0.2],left:'throat'})]},
  bv:{dur:0.5,cf:0.5,keys:[ // backhand volley: free hand on the throat to turn, then a one-handed punch, free arm back for balance
    K(0,   {pel:0,  sh:0,  pitch:0,   roll:0,hand:[-22,104,40],rd:[0.1,0.4,0.9],    pole:[-0.6,-0.6,-0.2],left:'throat'}),
    K(0.3, {pel:20, sh:55, pitch:0.08,roll:0,hand:[18,122,14], rd:[0.3,0.85,0.4],   pole:[-0.2,-0.8,-0.3],left:'throat'}),
    K(0.5, {pel:5,  sh:22, pitch:0.12,roll:0,hand:[30,114,50], rd:[0.75,0.45,0.48], pole:[-0.1,-0.9,0.1], left:[6,112,8]}),
    K(0.75,{pel:0,  sh:10, pitch:0.1, roll:0,hand:[26,110,58], rd:[0.6,0.42,0.68],  pole:[-0.1,-0.9,0.2], left:[2,110,4]}),
    K(1,   {pel:0,  sh:0,  pitch:0.04,roll:0,hand:[-22,104,40],rd:[0.1,0.4,0.9],    pole:[-0.6,-0.6,-0.2],left:'throat'})]},
  sm:{dur:0.9,cf:0.6,keys:[ // overhead smash: turn side-on, free hand tracks the ball, racket to the trophy, drop, hit up and in front, pronate
    K(0,   {body:0,  pel:0,  sh:0,  pitch:0,    roll:0, hand:[-22,104,40], rd:[0.1,0.4,0.9],    pole:[-0.6,-0.6,-0.2],left:'throat'}),
    K(0.22,{body:-60,pel:-10,sh:-30,pitch:-0.1, roll:12,hand:[-40,150,-8], rd:[0,0.9,-0.4],     pole:[-0.7,0,-0.5],   left:[24,182,32]}), // side-on, racket up, free hand points at the ball
    K(0.44,{body:-70,pel:-15,sh:-42,pitch:-0.2, roll:20,hand:[-42,166,-22],rd:[-0.1,0.95,-0.25],pole:[-0.8,0.2,-0.4], left:[26,192,30]}), // trophy
    K(0.53,{body:-58,pel:0,  sh:-20,pitch:-0.18,roll:18,hand:[-28,158,-22],rd:[0,-0.9,-0.4],    pole:[-0.6,0.6,-0.4], left:[22,150,26]}), // racket drops behind the back
    K(0.60,{body:-28,pel:20, sh:22, pitch:0,    roll:6, hand:[-14,216,38], rd:[0.05,0.9,0.42],  pole:[-0.7,0,0],      left:[20,125,20]}), // contact up and in front
    K(0.78,{body:-8, pel:35, sh:55, pitch:0.3,  roll:0, hand:[10,138,62],  rd:[0.35,-0.42,0.84],pole:[-0.3,-0.8,0.3], left:[22,112,14]}), // pronation, snap down through the ball
    K(1,   {body:0,  pel:35, sh:65, pitch:0.12, roll:0, hand:[30,96,14],   rd:[0.6,-0.75,-0.25],pole:[0.2,-0.8,0.3],  left:[26,110,6]})]},
  sv:{dur:1.4,cf:0.66,keys:[ // body yaw: -80 = side-on, left shoulder to the net
    K(0,   {body:-75,pel:0,  sh:0,  pitch:0,    roll:0, hand:[-18,100,30], rd:[0.2,0.1,0.97],  pole:[-0.6,-0.6,-0.2],left:[8,100,32]}),  // side-on stance, ball against the strings
    K(0.18,{body:-80,pel:-10,sh:-15,pitch:0,    roll:5, hand:[-30,82,-6],  rd:[0,-0.9,-0.4],   pole:[-0.5,-0.8,0],   left:[18,84,24]}),  // arms drop together
    K(0.38,{body:-80,pel:-20,sh:-40,pitch:-0.15,roll:18,hand:[-50,118,-38],rd:[0.1,0.55,-0.83],pole:[-0.6,-0.4,-0.6],left:[28,180,22]}), // toss released, racket rising behind
    K(0.52,{body:-80,pel:-15,sh:-45,pitch:-0.25,roll:25,hand:[-42,168,-22],rd:[-0.1,0.95,-0.25],pole:[-0.8,0.2,-0.4],left:[26,190,24]}), // trophy: knees bent, trunk tilted
    K(0.60,{body:-70,pel:0,  sh:-20,pitch:-0.2, roll:20,hand:[-28,158,-22],rd:[0,-0.9,-0.4],   pole:[-0.6,0.6,-0.4], left:[22,150,26]}), // racket drops behind the back
    K(0.66,{body:-35,pel:20, sh:20, pitch:-0.05,roll:8, hand:[-14,222,30], rd:[0.05,0.95,0.3], pole:[-0.7,0,0],      left:[20,125,20]}), // contact at full reach
    K(0.80,{body:-10,pel:35, sh:55, pitch:0.25, roll:0, hand:[10,145,62],  rd:[0.35,-0.35,0.87],pole:[-0.3,-0.8,0.3],left:[22,112,14]}), // pronation, chest to the net
    K(1,   {body:0,  pel:40, sh:75, pitch:0.15, roll:0, hand:[32,92,12],   rd:[0.6,-0.75,-0.25],pole:[0.2,-0.8,0.3], left:[26,110,6]})]}  // racket finishes past the left leg
};
const READYP={body:0,pel:0,sh:0,pitch:0,roll:0,hand:[-22,100,38],rd:[0.1,0.35,0.93],pole:[-0.6,-0.6,-0.2],left:'throat'};
// resolve 'throat' / 'grip' to positions so every key is numeric; keep a grip weight to lock the hands together at runtime
function prepKey(k){const h=k.hand,r=V(...k.rd),off=k.left==='grip'?10:k.left==='throat'?28:0;
  k.L=Array.isArray(k.left)?k.left.slice():[h[0]+r.x*off+3,h[1]+r.y*off,h[2]+r.z*off];k.gw=k.left==='grip'?1:k.left==='throat'?0.6:0;if(k.body==null)k.body=0;return k}
for(const s in SWINGS)SWINGS[s].keys.forEach(prepKey);prepKey(READYP);
const NUM=['body','pel','sh','pitch','roll','gw'],VEC=['hand','rd','pole','L'];
function hermite(K,u,get){// cubic Hermite through keys with finite-difference tangents (smooth racket loops)
  let i=0;while(i<K.length-2&&u>K[i+1].t)i++;const a=K[i],b=K[i+1],h=b.t-a.t,s=clamp((u-a.t)/h,0,1);
  const pa=get(a),pb=get(b),ma=i>0?(pb-get(K[i-1]))/(b.t-K[i-1].t):0,mb=i+2<K.length?(get(K[i+2])-pa)/(K[i+2].t-a.t):0;
  const s2=s*s,s3=s2*s;return(2*s3-3*s2+1)*pa+(s3-2*s2+s)*h*ma+(-2*s3+3*s2)*pb+(s3-s2)*h*mb}
function sampleSwing(S,u){const K=S.keys,o={};
  for(const n of NUM)o[n]=hermite(K,u,k=>k[n]);
  for(const n of VEC)o[n]=[0,1,2].map(j=>hermite(K,u,k=>k[n][j]));return o}
function mixP(a,b,w){const o={};for(const n of NUM)o[n]=a[n]+(b[n]-a[n])*w;for(const n of VEC)o[n]=[0,1,2].map(j=>a[n][j]+(b[n][j]-a[n][j])*w);return o}
const READYS=mixP(READYP,READYP,0);

function makeRacket(){
  const g=new T.Group();
  const frameMat=new T.MeshStandardMaterial({color:0xE5484D,roughness:.45,metalness:.2});g.userData.frame=frameMat;
  const gripMat=new T.MeshStandardMaterial({color:0x1d1d1d,roughness:.9});
  const handle=new T.Mesh(new T.CylinderGeometry(1.5,1.7,24,8),gripMat);handle.position.y=8;g.add(handle);
  const throat=new T.Mesh(new T.CylinderGeometry(1.1,1.3,10,6),frameMat);throat.position.y=24;g.add(throat);
  const ring=new T.Mesh(new T.TorusGeometry(13,1.2,6,28),frameMat);ring.scale.set(1,1.28,1);ring.position.y=44;g.add(ring);
  const strings=new T.Mesh(new T.CircleGeometry(12.5,24),new T.MeshBasicMaterial({color:0xF1EFE8,transparent:true,opacity:.28,side:T.DoubleSide,depthWrite:false}));
  strings.scale.set(1,1.28,1);strings.position.y=44;g.add(strings);
  g.traverse(o=>{if(o.isMesh)o.castShadow=true});
  return g;
}

class Player{
  constructor(D,isBoss,scene){
    this.D=D;const nb=this.nb=D.names.length;
    const lt=b64(D.lt,Float32Array),inv=b64(D.inv,Float32Array);
    const bones=this.bones=[];for(let k=0;k<nb;k++){const b=new T.Bone();b.name=D.names[k];b.position.set(lt[k*3],lt[k*3+1],lt[k*3+2]);bones.push(b);if(D.parent[k]>=0)bones[D.parent[k]].add(b)}
    const root=this.root=new T.Group();root.matrixAutoUpdate=false;root.add(bones[0]);scene.add(root);
    const invs=[];for(let k=0;k<nb;k++){const m=new T.Matrix4();m.fromArray(inv,k*16);m.transpose();invs.push(m)}
    const M=D.mesh,n=M.n,pq=b64(M.p,Uint16Array),pos=new Float32Array(n*3);for(let i=0;i<n*3;i++){const a=i%3;pos[i]=M.lo[a]+pq[i]/65535*(M.hi[a]-M.lo[a])}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));
    g.setAttribute('normal',new T.BufferAttribute(b64(M.nr,Int8Array),3,true));
    const uq=b64(M.uv,Uint16Array),uv=new Float32Array(n*2);for(let i=0;i<n*2;i++)uv[i]=uq[i]/65535;g.setAttribute('uv',new T.BufferAttribute(uv,2));
    const si=b64(M.si,Uint8Array),si16=new Uint16Array(si.length);si16.set(si);g.setAttribute('skinIndex',new T.BufferAttribute(si16,4));
    g.setAttribute('skinWeight',new T.BufferAttribute(b64(M.sw,Uint8Array),4,true));
    g.setIndex(new T.BufferAttribute(M.i32?b64(M.idx,Uint32Array):b64(M.idx,Uint16Array),1));g.computeBoundingSphere();g.boundingSphere.radius=1e6;
    if(!D._map){const im=new Image(),t=new T.Texture(im);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;im.onload=()=>{t.needsUpdate=true};im.src=D.tex.d;D._map=t}
    const mo={map:D._map,roughness:.75,metalness:0};if(D.alpha){mo.alphaTest=.5;mo.side=T.DoubleSide}
    this.mat=new T.MeshStandardMaterial(mo);
    const mesh=this.mesh=new T.SkinnedMesh(g,this.mat);mesh.frustumCulled=false;mesh.castShadow=true;
    mesh.bind(new T.Skeleton(bones,invs),new T.Matrix4());scene.add(mesh);
    this.clips=clipsFor(D,isBoss);
    this.idx=Object.fromEntries(D.names.map((s,i)=>[s,i]));
    this.qa=new Float32Array(nb*4);this.qb=new Float32Array(nb*4);this.qc=new Float32Array(nb*4);this.ha=[0,0,0];this.hb=[0,0,0];this.hc=[0,0,0];this.ph=0;this.phR=0;this.phF=0;this.runW=0;this.yawOff=0;this.hop=0;
    this.L=[];this.W=[];this.Wd=[];for(let k=0;k<nb;k++){this.L.push(new T.Quaternion());this.W.push(new T.Quaternion());this.Wd.push(new T.Quaternion())}
    const ch=(a,b)=>{const i=this.idx[a],j=this.idx[b];return i!=null&&j!=null?new T.Vector3().copy(bones[j].position).normalize():null};
    this.dirArm={RightArm:ch('RightArm','RightForeArm'),RightForeArm:ch('RightForeArm','RightHand'),LeftArm:ch('LeftArm','LeftForeArm'),LeftForeArm:ch('LeftForeArm','LeftHand')};
    this.spine=['Spine','Spine1','Spine2'].map(s=>this.idx[s]).filter(v=>v!=null);
    this.PP=[];for(let k=0;k<nb;k++)this.PP.push(new T.Vector3());this._t=new T.Quaternion();this._v=new T.Vector3();
    const LG=(u,l,f,sx)=>{const I=this.idx;if(I[u]==null||I[l]==null||I[f]==null)return null;return[I[u],I[l],I[f],sx,bones[I[l]].position.length(),bones[I[f]].position.length()]};
    const lL=LG('LeftUpLeg','LeftLeg','LeftFoot',1),lR=LG('RightUpLeg','RightLeg','RightFoot',-1);this.legs=lL&&lR?[lL,lR]:null;this.depth=1;this.land=0;this.relax=false;
    const AR=(u,l,f)=>{const I=this.idx;if(I[u]==null||I[l]==null||I[f]==null)return null;return[I[u],I[l],I[f],bones[I[l]].position.length(),bones[I[f]].position.length()]};
    this.armR=AR('RightArm','RightForeArm','RightHand');this.armL=AR('LeftArm','LeftForeArm','LeftHand');
    this.armBones=['RightShoulder','RightArm','RightForeArm','RightHand','LeftShoulder','LeftArm','LeftForeArm','LeftHand'].map(n=>this.idx[n]).filter(v=>v!=null);
    this.sz=Math.max(0.7,Math.min(1.35,bones[0].position.y/96));this.qx=new Float32Array(nb*4);this.bodyYaw=0;this.post=null;this.lastP=null;
    this.racket=makeRacket();const hand=bones[this.idx.RightHand],mid=bones[this.idx.RightHandMiddle1];
    this.aH=mid?mid.position.clone().normalize():new T.Vector3(0,1,0);
    if(hand){const d=this.aH.clone();this.racket.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d);
      if(mid)this.racket.position.copy(mid.position).multiplyScalar(0.55);this.racket.rotateY(Math.PI/2);hand.add(this.racket)}
    this.loco={t:0,clip:'ready'};this.tReady=Math.random()*3;this.swing=null;this.react=null;this.wLoco=0;this.locoClip='walkR';
    this.pos=new T.Vector3();this.yaw=0;this.vx=0;this.prevX=null;
  }
  dispose(scene){scene.remove(this.root);scene.remove(this.mesh);this.mesh.geometry.dispose();this.mat.dispose()}
  sample(name,t,q,h,loop){
    const c=this.clips[name];if(!c){return false}
    let f=t*c.fps;if(loop){f=f%(c.n-1);if(f<0)f+=c.n-1}f=clamp(f,0,c.n-1);
    const i0=Math.floor(f),i1=Math.min(c.n-1,i0+1),a=f-i0,nb=this.nb;
    for(let k=0;k<nb;k++){let l=0;for(let e=0;e<4;e++){const v=(c.Q[(i0*nb+k)*4+e]*(1-a)+c.Q[(i1*nb+k)*4+e]*a)/32767;q[k*4+e]=v;l+=v*v}l=Math.sqrt(l)||1;for(let e=0;e<4;e++)q[k*4+e]/=l}
    h[0]=0;h[2]=0;h[1]=c.HIP[i0*3+1]*(1-a)+c.HIP[i1*3+1]*a;
    const hy=Math.sin(-c.yaw0/2),hw=Math.cos(-c.yaw0/2),x=q[0],y=q[1],z=q[2],w=q[3];
    q[0]=hw*x+hy*z;q[1]=hw*y+hy*w;q[2]=hw*z-hy*x;q[3]=hw*w-hy*y;
    return true;
  }
  blend(qa,ha,qb,hb,w){if(w<=0)return;if(w>=1){qa.set(qb);ha[1]=hb[1];return}const nb=this.nb;
    for(let k=0;k<nb;k++){let d=0;for(let e=0;e<4;e++)d+=qa[k*4+e]*qb[k*4+e];const s=d<0?-1:1;let l=0;
      for(let e=0;e<4;e++){qa[k*4+e]=qa[k*4+e]*(1-w)+qb[k*4+e]*s*w;l+=qa[k*4+e]*qa[k*4+e]}l=Math.sqrt(l)||1;for(let e=0;e<4;e++)qa[k*4+e]/=l}
    ha[1]=ha[1]*(1-w)+hb[1]*w}
  startSwing(type,offset,yo){this.swing={type,t:offset||0,yo:yo||0};this.post=null;if(type==='sv'){this.tossR=null;this.tossC=null}}
  startReact(name){const c=this.clips[name];if(c)this.react={name,t:0,dur:c.dur}}
  fk(q,h){const nb=this.nb,D=this.D,W=this.W,PP=this.PP,B=this.bones,v=this._v;
    for(let k=0;k<nb;k++){this.L[k].set(q[k*4],q[k*4+1],q[k*4+2],q[k*4+3]);const p=D.parent[k];
      if(p>=0){W[k].copy(W[p]).multiply(this.L[k]);PP[k].copy(B[k].position).applyQuaternion(W[p]).add(PP[p])}else{W[k].copy(this.L[k]);PP[k].set(h[0],h[1],h[2])}}}
  setLocal(q,k,Wnew,Wparent){const t=this._t.copy(Wparent).invert().multiply(Wnew).normalize();q[k*4]=t.x;q[k*4+1]=t.y;q[k*4+2]=t.z;q[k*4+3]=t.w}
  athletic(q,h,depth,widen,P,wT){
    if(!this.legs)return;
    const W=this.W,PP=this.PP,D=this.D;this.fk(q,h);
    const foot=[],footW=[],hint=[];
    for(const s of this.legs){const [u,l,f,sx]=s;foot.push(PP[f].clone().add(new T.Vector3(sx*widen,0,0)));footW.push(W[f].clone());hint.push(PP[l].clone().sub(PP[u]))}
    h[1]-=13*depth;
    const d2r=Math.PI/180,pel=(P?P.pel:0)*wT*d2r,shY=(P?P.sh:0)*wT*d2r,pit=0.26*depth+(P?P.pitch:0)*wT,rol=(P?P.roll:0)*wT*d2r;
    const Y=new T.Vector3(0,1,0),X=new T.Vector3(1,0,0),Z=new T.Vector3(0,0,1);
    const W0=new T.Quaternion().setFromAxisAngle(Y,pel).multiply(W[0]);q[0]=W0.x;q[1]=W0.y;q[2]=W0.z;q[3]=W0.w;
    const sp=this.spine;let prev=W0;
    for(let i=0;i<sp.length;i++){const k=sp[i],f=(i+1)/sp.length;
      const R=new T.Quaternion().setFromAxisAngle(Y,pel+(shY-pel)*f).multiply(new T.Quaternion().setFromAxisAngle(X,pit*f)).multiply(new T.Quaternion().setFromAxisAngle(Z,rol*f));
      const Wd=R.multiply(W[k]);this.setLocal(q,k,Wd,prev);prev=Wd}
    this.fk(q,h);
    const v=new T.Vector3(),dHT=new T.Vector3(),n=new T.Vector3(),K=new T.Vector3(),rq=new T.Quaternion();
    this.legs.forEach((s,j)=>{const [u,l,f,sx,a,b]=s,hip=PP[u],Tg=foot[j];
      dHT.copy(Tg).sub(hip);let d=dHT.length();d=clamp(d,Math.abs(a-b)+0.5,a+b-0.3);dHT.normalize();
      const cosA=clamp((a*a+d*d-b*b)/(2*a*d),-1,1),sinA=Math.sqrt(1-cosA*cosA);
      n.copy(hint[j]).add(new T.Vector3(sx*4,0,14));n.sub(v.copy(dHT).multiplyScalar(n.dot(dHT)));if(n.lengthSq()<1e-6)n.set(0,0,1);n.normalize();
      K.copy(hip).add(v.copy(dHT).multiplyScalar(a*cosA)).add(n.multiplyScalar(a*sinA));
      // thigh toward the knee
      const cur=v.copy(PP[l]).sub(hip).normalize(),des=K.clone().sub(hip).normalize();rq.setFromUnitVectors(cur,des);
      const Wu=rq.clone().multiply(W[u]);this.setLocal(q,u,Wu,W[D.parent[u]]);
      // shin toward the foot
      const Wl=Wu.clone().multiply(this.L[l]);const c2=this.bones[f].position.clone().normalize().applyQuaternion(Wl);
      const d2=Tg.clone().sub(K).normalize();rq.setFromUnitVectors(c2,d2);const Wl2=rq.clone().multiply(Wl);this.setLocal(q,l,Wl2,Wu);
      // foot keeps its angle to the ground
      this.setLocal(q,f,footW[j],Wl2)});
  }
  ik2(q,u,l,f,a,b,Tg,pole){// two-bone IK: joint u (shoulder), l (elbow), f (wrist) to target Tg; pole = direction the elbow points
    const W=this.W,PP=this.PP,D=this.D,v=new T.Vector3(),dHT=Tg.clone().sub(PP[u]);let d=dHT.length();d=clamp(d,Math.abs(a-b)+0.5,a+b-0.2);dHT.normalize();
    const cosA=clamp((a*a+d*d-b*b)/(2*a*d),-1,1),sinA=Math.sqrt(1-cosA*cosA);
    const n=pole.clone();n.sub(v.copy(dHT).multiplyScalar(n.dot(dHT)));if(n.lengthSq()<1e-6)n.set(0,-1,0);n.normalize();
    const Kp=PP[u].clone().add(v.copy(dHT).multiplyScalar(a*cosA)).add(n.multiplyScalar(a*sinA));
    const rq=new T.Quaternion().setFromUnitVectors(PP[l].clone().sub(PP[u]).normalize(),Kp.clone().sub(PP[u]).normalize());
    const Wu=rq.multiply(W[u].clone());this.setLocal(q,u,Wu,W[D.parent[u]]);
    const Wl=Wu.clone().multiply(this.L[l]),c2=this.bones[f].position.clone().normalize().applyQuaternion(Wl),d2=Tg.clone().sub(Kp).normalize();
    const Wl2=new T.Quaternion().setFromUnitVectors(c2,d2).multiply(Wl);this.setLocal(q,l,Wl2,Wu);return Wl2}
  arms(q,h,P,w){
    if(w<=0.01||!this.armR||!this.armL)return;
    const qa=this.qx;qa.set(q);this.fk(qa,h);
    const s=this.sz,hy=this.PP[0].y,tg=a=>new T.Vector3(a[0]*s,hy+(a[1]-96)*s,a[2]*s);
    const [ru,rl,rf,ra,rb]=this.armR,rd=V(...P.rd);
    const Wl=this.ik2(qa,ru,rl,rf,ra,rb,tg(P.hand),V(...P.pole));
    // wrist points the racket along the stroke direction
    const Wh=Wl.clone().multiply(this.L[rf]),cur=this.aH.clone().applyQuaternion(Wh);
    this.setLocal(qa,rf,new T.Quaternion().setFromUnitVectors(cur,rd).multiply(Wh),Wl);
    // free hand: its own path, or locked onto the grip (two-hander) / throat (ready)
    this.fk(qa,h);let Lt=tg(P.L);
    if(P.gw>0.01){const g=this.PP[rf].clone().add(rd.clone().multiplyScalar((P.gw>0.8?10:28)*s)).add(new T.Vector3(2*s,0,0));Lt.lerp(g,clamp(P.gw,0,1))}
    const [lu,ll,lf,la,lb]=this.armL;this.ik2(qa,lu,ll,lf,la,lb,Lt,new T.Vector3(0.6,-0.6,-0.25));
    for(const k of this.armBones){let d=0;for(let e=0;e<4;e++)d+=q[k*4+e]*qa[k*4+e];const sg=d<0?-1:1;let l=0;
      for(let e=0;e<4;e++){q[k*4+e]=q[k*4+e]*(1-w)+qa[k*4+e]*sg*w;l+=q[k*4+e]*q[k*4+e]}l=Math.sqrt(l)||1;for(let e=0;e<4;e++)q[k*4+e]/=l}
  }
  /* serve toss: in the tossing hand until release, then a parabola that peaks above and drops into the contact point */
  contactWorld(){const S=SWINGS.sv,k=S.keys.find(k=>Math.abs(k.t-S.cf)<1e-6),s=this.sz,r=V(...k.rd),hb=this.bones[0].position.y*0.985;
    const v=new T.Vector3(k.hand[0]*s+r.x*44*s,hb+(k.hand[1]-96)*s+r.y*44*s,k.hand[2]*s+r.z*44*s);
    const m=new T.Matrix4().makeRotationY(this.yaw+(k.body||0)*Math.PI/180).scale(new T.Vector3(.01*PSCALE,.01*PSCALE,.01*PSCALE)).setPosition(this.pos.x,this.pos.y,this.pos.z);return v.applyMatrix4(m)}
  tossPos(u){const rel=0.38,cf=SWINGS.sv.cf;this.root.updateMatrixWorld(true);
    if(u<rel||!this.tossR){const hb=this.bones[this.idx.LeftHand];const p=hb?hb.getWorldPosition(new T.Vector3()):this.pos.clone().setY(1);if(u>=rel){this.tossR=p.clone();this.tossC=this.contactWorld()}return p}
    const R=this.tossR,C=this.tossC,s=clamp((u-rel)/(cf-rel),0,1.3),peak=C.y+0.45,hA=peak-(R.y+C.y)/2;
    return new T.Vector3(R.x+(C.x-R.x)*s,R.y+(C.y-R.y)*s+4*hA*s*(1-s),R.z+(C.z-R.z)*s)}
  update(dt,facing,vx,vz){
    const q=this.qa,h=this.ha,qb=this.qb,hb=this.hb,qc=this.qc,hc=this.hc;
    vx=vx||0;vz=vz||0;this.vx=vx;const side=vx*facing,fwd=-vz*facing,sp=Math.hypot(vx,vz),wF=sp>0.05?Math.abs(fwd)/(Math.abs(side)+Math.abs(fwd)):0;
    this.tReady+=dt;this.sample('ready',this.tReady,q,h,true)||this.sample('idle',this.tReady,q,h,true);
    const moving=sp>0.12;this.wLoco+=((moving?1:0)-this.wLoco)*Math.min(1,dt*(moving?16:10));
    if(this.wLoco>0.01&&this.clips.walkR&&this.clips.strafeR){
      const r=side>=0,Wk=r?'walkR':'walkL',Sk=r?'strafeR':'strafeL',W=this.clips[Wk],S=this.clips[Sk];
      const fast=clamp((sp-3.1)/1.1,0,1),sW=Math.max(0.3,(W.spd||1.5)*W.dur*PSCALE),sS=Math.max(0.3,(S.spd||3.9)*S.dur*PSCALE);
      // one shared stride phase so feet land where the body actually travels
      this.ph=(this.ph+dt*sp/(sW*(1-fast)+sS*fast))%1;
      this.sample(Wk,this.ph*W.dur,qb,hb,true);this.sample(Sk,this.ph*S.dur,qc,hc,true);this.blend(qb,hb,qc,hc,fast);
      const F=this.clips.walkF;
      if(F&&wF>0.05){const sF=Math.max(0.3,(F.spd||1.5)*F.dur*PSCALE);this.phF=((this.phF+dt*(fwd>=0?1:-1)*sp/sF)%1+1)%1;
        this.sample('walkF',this.phF*F.dur,qc,hc,true);this.blend(qb,hb,qc,hc,clamp(wF*1.4-0.2,0,1))}
      if(this.runW>0.01&&this.clips.run){const R=this.clips.run;this.phR=(this.phR+dt*sp/Math.max(0.3,(R.spd||3.8)*R.dur*PSCALE))%1;this.sample('run',this.phR*R.dur,qc,hc,true);this.blend(qb,hb,qc,hc,this.runW)}
      this.blend(q,h,qb,hb,this.wLoco)}
    if(this.react){this.react.t+=dt;const r=this.react,w=Math.min(1,r.t/0.2,(r.dur-r.t)/0.3);if(r.t>=r.dur)this.react=null;else if(this.sample(r.name,r.t,qb,hb,false))this.blend(q,h,qb,hb,clamp(w,0,1))}
    // stroke parameters: swing keys, or the ready position; blended in, and eased back to ready after the finish
    let P=null,wT=0,wA=0,u=0;const base=this.react?0:(1-0.55*this.wLoco)*(this.relax?0.5:1);
    if(this.swing){const s=this.swing,S=SWINGS[s.type];s.t+=dt;u=s.t/S.dur;
      if(u>=1){this.post={P:this.lastP||READYS,t:0};this.swing=null}
      else{let Pk=sampleSwing(S,u);if(s.yo){const bell=Math.sin(Math.PI*clamp(u,0,1));Pk.hand[1]+=s.yo*bell;Pk.L[1]+=s.yo*bell*0.6}const wi=s.type==='sv'?1:Math.min(1,u/0.08);if(wi<1)Pk=mixP(READYS,Pk,wi);P=Pk;this.lastP=Pk;wT=1;wA=1}}
    if(!P){if(this.post){this.post.t+=dt;const a=clamp(this.post.t/0.4,0,1),e=a*a*(3-2*a);P=mixP(this.post.P,READYS,e);wT=1-e;wA=Math.max(base,1-e);if(a>=1)this.post=null}
      else if(this.serveReady){this._sv0=this._sv0||sampleSwing(SWINGS.sv,0);this.ssW=Math.min(1,(this.ssW||0)+dt*4);P=mixP(READYS,this._sv0,this.ssW);wT=1;wA=1}
      else{P=READYS;wT=0;wA=base}}
    if(!this.serveReady)this.ssW=0;
    this.bodyYaw=(P.body||0)*Math.PI/180;
    // posture: low and wide, deeper as a stroke loads, extending up through contact
    let dT=this.react?0.1:this.relax?0.45:1;
    if(this.swing){const S=SWINGS[this.swing.type],sm=x=>x*x*(3-2*x);
      if(this.swing.type==='sm')dT=u<0.44?0.7+0.6*sm(clamp(u/0.44,0,1)):u<0.6?1.3-1.15*sm((u-0.44)/0.16):0.15+0.65*sm(clamp((u-0.6)/0.4,0,1));
      else if(this.swing.type==='sv')dT=u<0.52?0.4+0.9*sm(clamp(u/0.52,0,1)):u<0.66?1.3-1.2*sm((u-0.52)/0.14):0.1+0.5*sm(clamp((u-0.66)/0.34,0,1));
      else dT=u<S.cf?1+0.45*sm(clamp(u/S.cf,0,1)):1.45-0.6*sm(clamp((u-S.cf)/0.15,0,1))+0.15*sm(clamp((u-S.cf-0.15)/0.2,0,1))}
    if(this.hop>0){const a=1-this.hop/0.15;dT=a<1?0.55:dT}
    if(this.land>0){this.land-=dt;dT+=0.35*Math.sin(Math.PI*clamp(1-this.land/0.25,0,1))}
    this.depth+=(dT-this.depth)*Math.min(1,dt*(this.swing?18:9));
    this.athletic(q,h,this.depth,9*this.depth*(1-this.wLoco),P,wT);
    this.arms(q,h,P,wA);
    let hopY=0;if(this.hop>0){this.hop-=dt;hopY=Math.sin(Math.PI*clamp(1-this.hop/0.15,0,1))*0.05;if(this.hop<=0)this.land=0.25}
    const B=this.bones;for(let k=0;k<this.nb;k++)B[k].quaternion.set(q[k*4],q[k*4+1],q[k*4+2],q[k*4+3]);B[0].position.set(0,h[1],0);
    const m=this.root.matrix;m.makeRotationY(this.yaw+this.yawOff+this.bodyYaw);m.scale(new T.Vector3(.01*PSCALE,.01*PSCALE,.01*PSCALE));m.setPosition(this.pos.x,this.pos.y+hopY,this.pos.z);this.root.matrixWorldNeedsUpdate=true;
  }
}

/* ================= 3D scene ================= */
const HW=4.115,CL=23.77,ZS=1.7,PSCALE=0.88;
const W3={};
function toW(x,y,z){return new T.Vector3(x*HW,(z||0)*ZS,(0.5-y)*CL)}
function initGL(){
  if(W3.r)return;
  const canvas=$('gl');
  const r=W3.r=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
  const s=W3.scene=new T.Scene();s.background=new T.Color(0x9DC4E4);s.fog=new T.Fog(0x9DC4E4,60,140);
  W3.cam=new T.PerspectiveCamera(50,1,0.1,300);
  s.add(W3.hemi=new T.HemisphereLight(0xdfefff,0x5a6b4a,1.25));
  const sun=W3.sun=new T.DirectionalLight(0xfff3dd,2.3);sun.position.set(-12,26,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  const sc=sun.shadow.camera;sc.left=-10;sc.right=10;sc.top=17;sc.bottom=-17;sc.near=1;sc.far=70;sun.shadow.bias=-0.0004;s.add(sun);s.add(sun.target);
  W3.court=new T.Group();s.add(W3.court);fxInit(s);
  // ball and shadow
  W3.ball=new T.Mesh(new T.SphereGeometry(0.075,16,12),new T.MeshStandardMaterial({color:0xD8EF5A,emissive:0x4a5a10,roughness:.6}));W3.ball.castShadow=true;s.add(W3.ball);
  W3.bshadow=new T.Mesh(new T.CircleGeometry(0.09,16),new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.35,depthWrite:false}));W3.bshadow.rotation.x=-Math.PI/2;s.add(W3.bshadow);
  // aim preview
  const ringGeo=new T.RingGeometry(0.88,1,48);ringGeo.rotateX(-Math.PI/2);
  W3.aimRing=new T.Mesh(new T.RingGeometry(0.8,1,48).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0x74D493,transparent:true,opacity:.95,depthWrite:false}));
  const diskGeo=new T.CircleGeometry(1,48);diskGeo.rotateX(-Math.PI/2);
  W3.aimDisk=new T.Mesh(diskGeo,new T.MeshBasicMaterial({color:0x74D493,transparent:true,opacity:.22,depthWrite:false}));
  W3.aimRing.renderOrder=W3.aimDisk.renderOrder=3;s.add(W3.aimRing);s.add(W3.aimDisk);
  W3.aimLine=new T.InstancedMesh(new T.SphereGeometry(0.07,8,6),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9,depthWrite:false}),18);W3.aimLine.renderOrder=3;W3.aimLine.frustumCulled=false;s.add(W3.aimLine);
  W3.homeMark=new T.Mesh(new T.RingGeometry(0.3,0.42,32).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0x4CA3FF,transparent:true,opacity:.85,depthWrite:false}));W3.homeMark.visible=false;W3.homeMark.renderOrder=3;s.add(W3.homeMark);
  W3.landMark=new T.Mesh(ringGeo,new T.MeshBasicMaterial({color:0x9BE15D,transparent:true,opacity:.9,depthWrite:false}));W3.landMark.renderOrder=3;s.add(W3.landMark);
  const boxGeo=new T.PlaneGeometry(1,1);boxGeo.rotateX(-Math.PI/2);
  W3.boxGlow=new T.Mesh(boxGeo,new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.18,depthWrite:false}));W3.boxGlow.renderOrder=2;s.add(W3.boxGlow);
  W3.camPos=new T.Vector3(0,4,20);W3.camLook=new T.Vector3(0,0,-4);
  window.addEventListener('resize',onResize);
  requestAnimationFrame(loop);
}
function onResize(){if(!W3.r)return;const w=window.innerWidth,h=window.innerHeight;W3.r.setSize(w,h,false);W3.cam.aspect=w/h;W3.cam.fov=w/h<1?52:40;W3.cam.updateProjectionMatrix()}
/*@VENUE*/
/*@AUDIO*/

/* ================= match engine (court units: x -1..1 singles, y 0 = your baseline, 1 = theirs) ================= */
let M=null,P=[null,null];
const ACC=16,DEC=10;
function drive2(st,tx,tz,vmax,dt){const dx=tx-st.x,dz=tz-st.z,dd=Math.hypot(dx,dz)||1;
  const ax={x:st.x,v:st.v},az={x:st.z,v:st.vz};drive(ax,tx,Math.max(vmax*Math.abs(dx)/dd,0.25*vmax),dt);drive(az,tz,Math.max(vmax*Math.abs(dz)/dd,0.25*vmax)*0.9,dt);
  st.x=ax.x;st.v=ax.v;st.z=az.x;st.vz=az.v}
function drive(st,target,vmax,dt){if(!isFinite(target))target=st.x;if(!isFinite(st.x)){st.x=0;st.v=0}const d=target-st.x,vd=Math.sign(d)*Math.min(vmax,Math.sqrt(2*DEC*Math.abs(d))),a=ACC*dt;st.v+=clamp(vd-st.v,-a,a);if(Math.abs(d)<0.03&&Math.abs(st.v)<0.25)st.v=0;st.x+=st.v*dt}
function say(t){$('msg').textContent=t}
let callTimer=0;
function callOut(t){if(t==='OUT')lineCall('Out!');else if(t==='FAULT'||t==='DOUBLE FAULT')lineCall(t==='FAULT'?'Fault!':'Double fault.');const c=$('call');c.textContent=t;c.classList.add('on');clearTimeout(callTimer);callTimer=setTimeout(()=>c.classList.remove('on'),900)}
function side(){return(M.pts[0]+M.pts[1])%2===0?'deuce':'ad'}
function hasPerk(style,lvl){return M&&M.style===style&&M.perks>=lvl}
function reach(){return 1.1}
const PB=2/3;
/* ---- ball physics, world metres: X across the court, Y up, Z along it (+Z toward your baseline) ----
   gravity, air drag (CD ~0.6-0.7 for a fuzzy ball), Magnus lift from spin (CL = 1/(2 + 1/S), S = r*w/v),
   and a bounce with the court's restitution and friction: the ball slides, or grips and rolls, depending on spin and angle */
const BALL={m:0.057,r:0.0335,A:Math.PI*0.0335*0.0335,rho:1.21,alpha:0.55,g:9.81};
const KAIR=0.5*BALL.rho*BALL.A/BALL.m;
const PDT=1/240,SAMPLE=2;
function netH(x){const a=Math.min(Math.abs(x)/6.4,1);return 0.914+(1.07-0.914)*a*a}
/* sidespin (rad/s about the vertical axis, + = a right-hander's slice) bends the ball sideways; set by makeShot for the shot being built */
let SS=0;
function simulate(p0,v0,w,sf,maxT,firstBounceOnly){
  let px=p0.x,py=p0.y,pz=p0.z,vx=v0.x,vy=v0.y,vz=v0.z,t=0,i=0;
  const r=BALL.r,out={S:[],bounces:[],net:null,crossT:null};
  const rec=()=>{out.S.push(px,py,pz)};rec();
  while(t<maxT){
    const s=Math.hypot(vx,vy,vz)||1e-6,S=Math.min(r*Math.abs(w)/s,1),CD=0.55+0.12*S,CL=S>0.001?1/(2+1/S):0;
    let ax=-KAIR*CD*s*vx,ay=-KAIR*CD*s*vy-BALL.g,az=-KAIR*CD*s*vz;
    if(w!==0){// lift acts perpendicular to the flight path in its vertical plane: down for topspin, up for backspin
      const ux=vx/s,uy=vy/s,uz=vz/s;let nx=-uy*ux,ny=1-uy*uy,nz=-uy*uz;const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;
      const f=-Math.sign(w)*KAIR*CL*s*s;ax+=f*nx;ay+=f*ny;az+=f*nz}
    if(SS!==0){const h=Math.hypot(vx,vz)||1e-6,S2=Math.min(r*Math.abs(SS)/s,1),C2=1/(2+1/S2),f=Math.sign(SS)*KAIR*C2*s*s;ax+=f*vz/h;az+=-f*vx/h}
    vx+=ax*PDT;vy+=ay*PDT;vz+=az*PDT;
    const ozPrev=pz;px+=vx*PDT;py+=vy*PDT;pz+=vz*PDT;t+=PDT;i++;
    if(out.crossT==null&&Math.sign(ozPrev)!==Math.sign(pz)&&ozPrev!==0){const f=ozPrev/(ozPrev-pz),hy=py-vy*PDT*(1-f),hx=px-vx*PDT*(1-f);
      out.crossT=t;out.netY=hy;
      if(hy<netH(hx)+r){out.net={x:hx,y:hy,t};pz=Math.sign(ozPrev)*0.05;vz=-vz*0.12;vx*=0.3;vy=Math.min(vy,0)*0.5}}
    if(py<=r&&vy<0){// bounce
      const e=sf.e*(1-0.0025*Math.max(0,-vy-8)),h=Math.hypot(vx,vz),dx=h>1e-6?vx/h:0,dz=h>1e-6?vz/h:0;
      const vc=h-r*w,jmax=sf.mu*(1+e)*(-vy),jroll=Math.abs(vc)/(1+1/BALL.alpha),j=Math.min(jmax,jroll),sg=Math.sign(vc);
      const h2=Math.max(0,h-j*sg);w=w+j*sg/(BALL.alpha*r);vx=dx*h2;vz=dz*h2;vy=-vy*e;py=r;
      out.bounces.push({t,x:px,z:pz,vy});if(firstBounceOnly)break;
      if(out.bounces.length>=4)break}
    if(i%SAMPLE===0)rec();
    if(!firstBounceOnly&&(Math.abs(pz)>22||Math.abs(px)>14))break;
  }
  rec();out.T=t;return out;
}
/* aim: find the launch angle that lands the ball on the target at this speed and spin (lowest workable angle) */
function launch(st,tgt,speed,w,sf,lob){
  const hx=tgt.x-st.x,hz=tgt.z-st.z,D=Math.hypot(hx,hz)||1,ux=hx/D,uz=hz/D;
  const range=th=>{const c=Math.cos(th),s=Math.sin(th),r=simulate(st,{x:ux*speed*c,y:speed*s,z:uz*speed*c},w,sf,4,true);
    if(r.net)return Math.hypot(r.net.x-st.x,0-st.z)*0.98;const b=r.bounces[0];if(!b)return 99;return (b.x-st.x)*ux+(b.z-st.z)*uz};
  const deg=Math.PI/180;
  if(lob){// lob: a fixed climb (~50 degrees, peaks 6-8 m) and the speed that carries it to the target
    const th=50*deg,c=Math.cos(th),sn=Math.sin(th);const rng=v=>{const r=simulate(st,{x:ux*v*c,y:v*sn,z:uz*v*c},w,sf,6,true);const b=r.bounces[0];return b?(b.x-st.x)*ux+(b.z-st.z)*uz:99};
    let L=4,H=45;if(rng(H)<D)return{x:ux*H*c,y:H*sn,z:uz*H*c,ok:false,short:false};for(let k=0;k<20;k++){const m=(L+H)/2;if(rng(m)<D)L=m;else H=m}const v=(L+H)/2;
    return{x:ux*v*c,y:v*sn,z:uz*v*c,ok:true,short:false}}
  let lo=-32*deg,rlo=range(lo),th=null;
  for(let a=-29;a<=58;a+=3){const hi=a*deg,rhi=range(hi);if(rlo<=D&&rhi>=D){let L=lo,H=hi;for(let k=0;k<16;k++){const m=(L+H)/2;if(range(m)<D)L=m;else H=m}th=H;break}lo=hi;rlo=rhi}
  const ok=th!=null;if(th==null)th=rlo<D?40*deg:-32*deg;
  const c=Math.cos(th),s=Math.sin(th);return{x:ux*speed*c,y:speed*s,z:uz*speed*c,ok,short:!ok&&rlo<D};
}
/* build a shot: from (court units) toward a landing target (court units), with speed m/s and spin rad/s (+ topspin) */
function makeShot(from,tgt,speed,w,o){
  o=o||{};const sf=M.surf;
  const st={x:from.x*HW,y:Math.max(0.25,(from.z!=null?from.z:0.5)*ZS),z:(0.5-from.y)*CL};
  const tw={x:tgt.x*HW,z:(0.5-tgt.y)*CL};
  SS=o.ss||0;
  let aim={x:tw.x,z:tw.z},v=launch(st,aim,speed,w,sf,o.lob);
  for(let k=0;k<5&&v.short;k++){speed*=1.15;v=launch(st,aim,speed,w,sf,o.lob)}  // too slow to get there: the player swings a bit harder
  if(SS)for(let k=0;k<3;k++){const q=simulate(st,v,w,sf,4,true).bounces[0];if(!q)break;aim.x+=tw.x-q.x;aim.z+=tw.z-q.z;v=launch(st,aim,speed,w,sf,o.lob)}  // aim off so the curve lands on target
  const r=simulate(st,v,w,sf,5,false);SS=0;
  const toMe=tw.z>0,b=r.bounces[0];
  const sh=Object.assign({S:r.S,n:r.S.length/3,dt:PDT*SAMPLE,who:o.who,net:!!r.net,speed},o);
  if(b){sh.land={x:b.x/HW,y:0.5-b.z/CL};sh.tb=b.t}else{sh.land={x:tgt.x,y:tgt.y};sh.tb=r.T}
  sh.toMe=toMe;sh.r=r;
  chooseHit(sh,o.recv);
  return sh;
}
/* where the receiver meets the ball. Up at the net (within ~7.5 m of it) they take it out of the air if it
   reaches them between knee and head height (a volley); otherwise after the bounce, dropping through waist height,
   or early if it would carry far behind the baseline */
function chooseHit(sh,recv){
  const r=sh.r,b=r.bounces[0],toMe=sh.toMe;let th=null;sh.volley=false;sh.smash=false;
  if(recv&&!r.net&&Math.abs(recv.z)<9){const iEnd=b?Math.floor(b.t/sh.dt):sh.n-1;
    let ym=0;for(let i=1;i<iEnd;i++){const z=r.S[i*3+2];ym=Math.max(ym,r.S[i*3+1]);if(toMe?z>=recv.z-0.2:z<=recv.z+0.2){const y=r.S[i*3+1];
      if(y>=0.3&&y<=SMH-0.15&&ym<3.5&&Math.abs(recv.z)<7.5){th=i*sh.dt;sh.volley=true}
      break}}
    if(th==null){// a high ball (over their head, or a short lob in front): move under it and hit an overhead as it drops to smash height
      let ymax=0;for(let j=1;j<iEnd;j++){const yj=r.S[j*3+1],zj=r.S[j*3+2];ymax=Math.max(ymax,yj);
        if(yj<r.S[(j-1)*3+1]&&yj<=SMH){if(ymax>SMH+0.5&&(toMe?zj>1.5:zj<-1.5)&&Math.abs(zj-recv.z)<6.5){th=j*sh.dt;sh.smash=true}break}}}}
  if(th==null){
    if(b&&!r.net){const i0=Math.ceil(b.t/sh.dt),base=toMe?CL/2:-CL/2;let peak=i0;
      for(let i=i0+1;i<sh.n;i++){const y=r.S[i*3+1],z=r.S[i*3+2];if(y>r.S[peak*3+1])peak=i;
        const behind=toMe?z-base:base-z;if(behind>4.5){th=i*sh.dt;break}
        if(i>peak&&y<=0.9){th=i*sh.dt;break}
        if(r.bounces[1]&&i*sh.dt>=r.bounces[1].t-0.02){th=(peak+2)*sh.dt;break}}
      if(th==null)th=Math.min((sh.n-2)*sh.dt,b.t+0.6)}
    else th=Math.min((sh.n-2)*sh.dt,(r.net?r.net.t:sh.tb)+0.6)}
  sh.T=th/0.9;sh.pb=sh.tb/sh.T;
  const H=pos(sh,0.9);sh.hx=H.x;sh.hy=H.y;sh.hz=H.z*ZS;
}
function pos(s,p){
  const t=Math.max(0,p*s.T),f=Math.min(t/s.dt,s.n-1.001),i=Math.floor(f),a=f-i,S=s.S,j=i*3,k=Math.min(i+1,s.n-1)*3;
  const X=S[j]+(S[k]-S[j])*a,Y=S[j+1]+(S[k+1]-S[j+1])*a,Z=S[j+2]+(S[k+2]-S[j+2])*a;
  return{x:X/HW,y:0.5-Z/CL,z:Math.max(0,Y-BALL.r)/ZS}
}
function landIn(sh,serve){if(sh.net)return false;const l=sh.land;if(serve){const d=side()==='deuce',lo=d?-1:0,hi=d?0:1;return l.x>=lo-0.01&&l.x<=hi+0.01&&l.y>=0.5&&l.y<=0.772}return Math.abs(l.x)<=1.012&&l.y>=0.5&&l.y<=1.004}



function startMatch(cfg){
  if(window.__SIM){setTimeout(()=>cfg.onEnd(window.__SIM(cfg),'6–4',{aces:0,winners:0,big:0}),0);return}
  if(!cfg.drill)cfg.stats=withGear(cfg.stats);
  initGL();show('match');$('loading').hidden=false;$('loadingSub').textContent=cfg.me+' vs '+cfg.opp.name;
  if(cfg.venue&&cfg.venue.startsWith('major:'))cfg.surf=MAJOR_LOOK[cfg.venue.slice(6)].surf;buildCourt(cfg.surf,cfg);
  let got={};const done=()=>{if(!('me' in got&&'op' in got))return;
    for(const p of P)if(p)p.dispose(W3.scene);
    const mk2=(D,id)=>{try{return new Player(D||R3BOSS,!D||id==='boss',W3.scene)}catch(e){console.error(e);return new Player(R3BOSS,true,W3.scene)}};
    P=[mk2(got.me,cfg.meId),mk2(got.op,cfg.opp.id)];
    $('loading').hidden=true;beginMatch(cfg)};
  loadChar(cfg.meId,D=>{got.me=D;done()});loadChar(cfg.opp.id,D=>{got.op=D;done()});
}
function beginMatch(cfg){
  M={cfg,surf:SURF[cfg.surf],S:cfg.stats,os:cfg.opp.skill,ostyle:styleOfChar(RBYID[cfg.opp.id]),pat:[],readMe:false,readSaid:false,ostam:clamp(Math.round(((RBYID[cfg.opp.id]&&RBYID[cfg.opp.id].st.stamina)||5)*0.5+cfg.opp.skill*0.5),1,10),sets:[[0,0]],setsWon:[0,0],pts:[0,0],tb:false,server:Math.random()<0.5?0:1,tbFirst:0,
    state:'between',shot:null,t0:0,me:{x:0.4,y:-0.05},op:{x:-0.4,y:1.08},fault:false,sw:null,preview:null,samples:[],land:null,aim:null,lock:false,commit:null,pending:null,
    stat:{aces:0,winners:0,big:0,perfect:0,smashes:0,volleys:0,slices:0,rallyMax:0},svType:['flat','kick'],en:[1,1],cap:[1,1],run:[0,0],tiredSaid:[false,false],home:[{x:0,y:-0.05},{x:0,y:1.08}],meSide:'fh',opSide:'fh',mv:[{x:0,v:0,z:0,vz:0},{x:0,v:0,z:0,vz:0}],style:cfg.style,perks:cfg.perks||0,rally:0};
  $('n0').textContent=cfg.me;$('n1').textContent=cfg.opp.name;$('bLabel').textContent=cfg.label;$('bSurf').textContent=SURF[cfg.surf].name;
  $('quit').textContent='Retire';M.quitArm=false;applyCosmetics();
  renderBoard();{const O=OSTYLE[M.ostyle];say(cfg.intro||(cfg.opp.name+' plays a '+O.name+' game. '+O.tip))}
  REP.setsN=1;REP.lastPt=-9;REP.buf=[];W3.camPos.set(0,4,22);
  if(cfg.drill){drillBegin(cfg);return}
  setTimeout(nextPoint,cfg.intro?2600:1100);
}
function ptLabel(i){const a=M.pts[i],b=M.pts[1-i];if(M.tb)return String(a);if(a>=3&&b>=3)return a===b?'40':a>b?'AD':'40';return['0','15','30','40'][Math.min(a,3)]}
function renderBoard(){for(let i=0;i<2;i++){$('s'+i).innerHTML=M.sets.map((g,k)=>'<span class="'+(k===M.sets.length-1?'cur':'')+'">'+g[i]+'</span>').join('');$('p'+i).textContent=ptLabel(i);$('srv'+i).classList.toggle('on',M.server===i)}}
function nextPoint(){
  if(!M||M.over)return;clearMarks();FX.tp=[];slowMo(false);
  M.lock=false;M.fault=false;M.shot=null;M.land=null;M.aim=null;M.commit=null;M.pending=null;M.rally=0;M.home=[{x:0,y:-0.05},{x:0,y:1.08}];W3.homeMark&&(W3.homeMark.visible=false);
  const d=side()==='deuce';
  if(M.server===0){M.me={x:d?0.4:-0.4,y:-0.05};M.op={x:d?-0.45:0.45,y:1.08};M.state='serveMe';say((M.tb?'Tiebreak. ':'')+'Your serve. Swipe up into the box.')}
  else{M.op={x:d?-0.4:0.4,y:1.08};M.me={x:d?0.45:-0.45,y:-0.05};M.state='oppServe';say(M.cfg.opp.name+' to serve.');setTimeout(oppServeStart,900)}
  M.mv[0]={x:M.me.x*HW,v:0,z:toW(0,-0.05).z,vz:0};M.mv[1]={x:M.op.x*HW,v:0,z:toW(0,1.08).z,vz:0};M.me.y=-0.05;M.op.y=1.08;P[0].pos.x=M.mv[0].x;P[1].pos.x=M.mv[1].x;P[0].runW=P[1].runW=0;
}
function pointTo(w,text,call){
  if(M&&M.drill){drillPoint(w,text,call);return}
  if(!M||M.lock)return;M.lock=true;M.state='between';slowMo(false);REP.endT=GT;M.stat.rallyMax=Math.max(M.stat.rallyMax,(M.rally||0)*2+1);if(text)say(text);if(call)callOut(call);if(w===0&&(call==='WINNER'||call==='ACE'))haptic([18,40,26]);
  {const rl=M.rally||0,big=call==='ACE'||call==='WINNER';
    if(big){crowdCheer(1,2.6,rl>=6||Math.random()<0.25?2.2:0);sndApplause(1);if(rl>=6)sndCrowdVoice('cheer',0.9)}
    else if(call==='NET'||call==='DOUBLE FAULT'){crowdCheer(0.35,1.4);sndCrowdVoice('ooh',0.7);setTimeout(()=>sndApplause(0.3),600)}
    else{if(call==='OUT'&&rl>=4)sndCrowdVoice('ooh',0.6);crowdCheer(0.55,1.8);sndApplause(0.55)}}
  const pg=M.sets.reduce((a,x)=>a+x[0]+x[1],0),ps=M.sets.length;
  for(let i=0;i<2;i++)recover(i,0.03);
  const o=1-w;
  if(call==='ACE'||call==='WINNER')P[w].startReact(pick(['nod','strut']));
  else if(call==='DOUBLE FAULT'||call==='NET'||call==='OUT')P[o].startReact(pick(['shake','slump']));
  if(M.tb){M.pts[w]++;if(M.pts[w]>=7&&M.pts[w]-M.pts[o]>=2)gameWon(w);else if((M.pts[0]+M.pts[1])%2===1)M.server=1-M.server}
  else{M.pts[w]++;if(M.pts[w]>=4&&M.pts[w]-M.pts[o]>=2)gameWon(w)}
  {const g2=M.sets.reduce((a,x)=>a+x[0]+x[1],0);if(M.sets.length!==ps)for(let i=0;i<2;i++)M.en[i]=Math.min(M.cap[i],M.en[i]+0.2);else if(g2!==pg&&g2%2===1)for(let i=0;i<2;i++)recover(i,0.07);}
  renderEnergy();renderBoard();setTimeout(()=>umpireScore(pg,ps),1000);
  const rp=wantReplay(w,call);
  if(M.over){crowdCheer(1,6,6);sndApplause(1.2);sndCrowdVoice('cheer',1.2);P[M.winner].startReact(M.winner===0?myDance():pick(['samba','uprock','robot']));P[1-M.winner].startReact('slump');if(rp)setTimeout(()=>{if(M)startReplay(3,()=>setTimeout(endMatch,1800))},1600);else setTimeout(endMatch,3200)}
  else if(rp)setTimeout(()=>{if(M)startReplay(2.8,()=>setTimeout(nextPoint,500))},900);else setTimeout(nextPoint,1700);
}
function gameWon(w){
  const o=1-w,g=M.sets[M.sets.length-1],G=M.cfg.g,wasTb=M.tb;M.lastGame=w;
  g[w]++;M.pts=[0,0];M.tb=false;
  if(wasTb)M.server=1-M.tbFirst;else M.server=1-M.server;
  const setOver=wasTb||(g[w]>=G&&g[w]-g[o]>=2);
  if(setOver){M.setsWon[w]++;crowdCheer(1,4,3.5);setTimeout(()=>sndCrowdVoice('cheer',1),200);
    if(M.setsWon[w]>M.cfg.bo/2){M.over=true;M.winner=w;setTimeout(()=>say(w===0?'Game, set and match!':'Game, set and match, '+M.cfg.opp.name+'.'),900);return}
    M.sets.push([0,0]);setTimeout(()=>say(w===0?'You take the set!':M.cfg.opp.name+' takes the set.'),900)}
  else if(g[0]===G&&g[1]===G){M.tb=true;M.tbFirst=M.server}
}
function endMatch(){if(!M)return;drillCleanup();
  if(!M.drill&&!M.retired&&M.over){const sets=M.sets,games=sets.reduce((a,g)=>a+g[0],0),V=W3.venue||{};
    matchRewards({won:M.winner===0,games,lostFirst:sets.length>1&&sets[0][0]<sets[0][1],bagels:sets.filter(g=>g[0]===6&&g[1]===0).length,
      surf:M.cfg.surf,venue:V.kind==='major'?'major:'+V.major:V.kind==='tour'&&V.rows>=16?'masters':V.kind||'tour',style:M.ostyle,skill:M.os,
      career:!!M.cfg.ev,major:!!(M.cfg.ev&&M.cfg.ev.major),meId:M.cfg.meId,stat:M.stat})}
  else if(M.retired){PROF.life.streak=0;storeProf();LAST_REWARDS=null}if(REP.on){REP.done=null;endReplay()}slowMo(false);const won=M.winner===0,score=M.sets.map(g=>g[0]+'–'+g[1]).join(', '),st=M.stat,cb=M.cfg.onEnd;M=null;cb(won,score,st)}
$('quit').onclick=()=>{
  if(!M)return;
  if(M.drill){M.over=true;M.winner=0;M.lock=true;endMatch();return}
  if(!M.quitArm){M.quitArm=true;$('quit').textContent='Tap to confirm';setTimeout(()=>{if(M){M.quitArm=false;$('quit').textContent='Retire'}},2500);return}
  M.over=true;M.winner=1;M.lock=true;M.retired=true;M.state='between';say('You retire from the match.');setTimeout(endMatch,600);
};
function recvPos(i){const st=M.mv[i],hm=M.home[i],hz=toW(0,hm.y).z;return{x:st.x,z:Math.abs(hz)<Math.abs(st.z)?hz:st.z}}
function pointWins(w){const o=1-w,p=M.pts.slice();p[w]++;const game=M.tb?(p[w]>=7&&p[w]-p[o]>=2):(p[w]>=4&&p[w]-p[o]>=2);if(!game)return 0;if(M.tb)return 2;
  const g=M.sets[M.sets.length-1].slice();g[w]++;return g[w]>=M.cfg.g&&g[w]-g[1-w]>=2?2:1}
function vmaxOf(i){return(i===0?4.4+M.S.speed*0.13+(hasPerk('baseliner',2)?0.35:0)+(hasPerk('counter',3)?0.45:0):4.2+M.os*0.13+OSTYLE[M.ostyle].reach)*(0.8+0.2*(M.en?M.en[i]:1))}
/* ---- stamina: running drains it (sprints cost more), hitting hard costs a little; it comes back between points,
   more at changeovers and set breaks, but a slow "deep fatigue" ceiling falls over a long match ---- */
function staOf(i){return i===0?(M.S.stamina||5):(M.ostam||5)}
function tire(i,amt){M.en[i]=clamp(M.en[i]-amt*(1.35-staOf(i)*0.07),0,1)}
function recover(i,amt){const st=staOf(i);M.cap[i]=clamp(M.cap[i]-M.run[i]*0.00012*(1.3-st*0.06),0.45,1);M.run[i]=0;M.en[i]=Math.min(M.cap[i],M.en[i]+amt*(0.6+st*0.08))}
function renderEnergy(){for(let i=0;i<2;i++){const e=$('e'+i);if(!e)continue;const v=M.en[i];e.style.width=Math.round(v*100)+'%';e.style.background=v>0.6?'#74D493':v>0.35?'#F5A524':'#F28A78'}}
/* reach: time the player needs to get to the ball (accelerating, top speed, a lunge at the end) against the time the ball
   gives them, less a reaction delay (longer when returning serve). The spare time becomes the shot's pressure. */
function reachMargin(i,sh){const st=M.mv[i],dx=sh.hx*HW-st.x,dz=toW(0,sh.hy).z-st.z,back=sh.smash?Math.max(0,i===0?dz:-dz):0;const dist=Math.max(0,Math.hypot(dx,dz)+back*0.7-(sh.smash?0.5:1.2)),vm=vmaxOf(i);
  const tNeed=dist<=vm*vm/(2*ACC)?Math.sqrt(2*dist/ACC):dist/vm+vm/(2*ACC);return 0.9*sh.T+0.18-reactOf(i,sh)-tNeed+(i===1&&M.readMe&&sh.type!=='serve'?0.12:0)}
function reactOf(i,sh){if(sh.type!=='serve'&&!sh.serve)return 0;const sk=i===0?(M.S.speed+M.S.control)/2:M.os;
  let r=0.33-sk*0.012;if(i===1&&sh.type==='serve'&&!sh.second)r+=(hasPerk('server',1)?0.04:0)+(hasPerk('server',3)?0.04:0);return r}
function canReach(i,sh){return reachMargin(i,sh)>=0}
/* pressure 0..1: little spare time, pace, heavy spin and depth all rush the receiver */
function pressureOf(i,sh){const m=reachMargin(i,sh);const L=sh.land||{y:0.5},deep=i===1?L.y>0.86:L.y<0.14;
  return clamp(clamp(1-m/0.7,0,1)*0.75+(sh.type==='serve'||sh.serve?clamp(((sh.speed||30)-34)/45,0,0.25):clamp(((sh.speed||20)-22)/30,0,0.45))+(Math.abs(sh.w||0)>260?0.08:0)+(deep?0.12:0)+((sh.hz||1)<0.62?0.1*({grass:1.3,hard:1,clay:0.6}[M.surf===SURF.grass?'grass':M.surf===SURF.clay?'clay':'hard']):0)+(sh.svType==='kick'?0.08:0),0,1)}
function spotFor(i,sh,side){const hz=toW(0,sh.hy).z,off={fh:0.75,bh:-0.45,fv:0.62,bv:-0.55,sm:0.31}[side]||0,zo=sh.smash?0.29:sh.volley?0.55:0.5;
  return i===0?{x:sh.hx*HW-off,z:hz+zo}:{x:sh.hx*HW+off,z:hz-zo}}
function contactPress(i,sh,side){const sp=spotFor(i,sh,side),st=M.mv[i];return clamp((Math.hypot(st.x-sp.x,st.z-sp.z)-0.35)/1.2,0,1)}
function fallbackHit(i,sh){if((sh.volley||sh.smash)&&!canReach(i,sh)){const st=M.mv[i];chooseHit(sh,{x:st.x,z:st.z});if((sh.volley||sh.smash)&&!canReach(i,sh))chooseHit(sh,null)}}
function setReach(sh){fallbackHit(0,sh);if(!canReach(0,sh))sh.unreach=true;else M.mePress=pressureOf(0,sh)}
const SMH=1.95; // racket-centre height at smash contact
function sideFor(who,hx,volley,smash){if(smash)return'sm';const f=who===0?hx>-0.12:hx<0.12;return volley?(f?'fv':'bv'):(f?'fh':'bh')}
function yoFor(side,hz){return(side==='fv'||side==='bv')?clamp(((hz||1.05)-1.05)/(0.01*PSCALE),-45,95):side==='sm'?clamp(((hz||SMH)-SMH)/(0.01*PSCALE),-40,40):0}
function oppServeStart(){
  if(!M||M.state!=='oppServe')return;
  M.state='oppServing';P[1].startSwing('sv');M.serveT0=now();M.server_who=1;
  setTimeout(oppServeLaunch,SWINGS.sv.dur*SWINGS.sv.cf*1000);
}
function oppServeLaunch(){
  if(!M||M.state!=='oppServing')return;
  const s=M.os,d=side()==='deuce',lo=d?0:-1,hi=d?1:0,C=P[1].tossC||P[1].contactWorld(),from={x:C.x/HW,y:0.5-C.z/CL,z:C.y/ZS};
  const O=OSTYLE[M.ostyle],mix=OSERVE[M.ostyle],q=Math.random(),oty=q<mix[0]?'flat':q<mix[0]+mix[1]?'slice':'kick',OV=SVT[oty],spd=(30+s*2.2+O.serve+rnd(-2,2))*(0.92+0.08*M.en[1])*OV.spd;tire(1,0.006);onContact('op',C.clone?C.clone():toW(from.x,from.y,from.z),spd*0.8,false);sndHit(Math.min(1.2,spd/45));
  if(Math.random()<(0.06-s*0.004)*O.df){
    M.shot=makeShot(from,{x:(lo+hi)/2,y:0.5},spd,120,{who:'op',err:true});M.t0=now();M.state='oppErr';
    setTimeout(()=>pointTo(0,'Double fault from '+M.cfg.opp.name+'.','DOUBLE FAULT'),900);return}
  // smarter servers mix the T and out wide, and go after the receiver's backhand
  const tact=Math.random()<clamp(0.25+s*0.085,0.3,0.97),wide=Math.random()<O.wide+s*0.03;
  const bx=wide?(d?(Math.random()<0.5?0.1:0.88):(Math.random()<0.5?-0.1:-0.88)):tact&&Math.random()<0.5?(d?0.12:-0.6):lo+0.25+Math.random()*0.5;
  const by=0.24+Math.random()*0.1;
  let sh=null;for(let k=0;k<4;k++){sh=makeShot(from,{x:bx,y:by},spd*Math.pow(0.88,k),OV.w+k*70,{who:'op',serve:true,recv:null,ss:OV.ss});sh.svType=oty;if(!sh.net&&sh.land.y>0.2&&sh.land.y<0.5)break}
  M.shot=sh;
  {const L=sh.land,inBox=!sh.net&&L.x>=lo-0.01&&L.x<=hi+0.01&&L.y>=0.228&&L.y<=0.5;if(!inBox){sh.err=true;M.t0=now();M.state='oppErr';setTimeout(()=>pointTo(0,'Double fault from '+M.cfg.opp.name+'.','DOUBLE FAULT'),900);return}}
  setReach(M.shot);if(M.shot.unreach)M.shot.ace=true;
  if(Math.random()<O.sv*(0.6+s*0.05)){M.home[1]={x:0,y:0.72};say(M.cfg.opp.name+' serves and volleys.')}else M.home[1]={x:0,y:1.08};
  M.meSide=sideFor(0,M.shot.hx,M.shot.volley,M.shot.smash);M.t0=now();M.state='op';P[0].hop=0.15;
}
function oppHit(from){
  P[0].hop=0.15;
  const s=M.os;let bx,by,err=false;
  M.rally++;const prev=M.shot||{},pr=clamp(Math.max(M.oppPress||0,contactPress(1,prev,M.opSide)),0,1);M.oppPress=0;
  const O=OSTYLE[M.ostyle],ue=Math.max(0.01,0.05-s*0.004+O.ue)+Math.pow(pr,1.6)*(0.55-s*0.03)+(prev.bonus||0)+0.08*(1-M.en[1])+(hasPerk('counter',1)?0.03:0)+(hasPerk('counter',2)&&M.rally>=4?0.05:0);
  let spd=(19+s*1.6+rnd(0,3))*(0.93+0.07*M.en[1]),w=170+s*12,kind='deep';const ovol=M.shot&&M.shot.volley,osm=M.shot&&M.shot.smash,meNet=M.me.y>0.2;if(ovol){spd=14+s*1.2;w=-70}if(osm){spd=(27+s*1.6+rnd(0,3))*(from.y>0.82?0.8:1);w=40;kind='smash'}
  if(Math.random()<ue){err=true;if(Math.random()<0.5){bx=(Math.random()-0.5)*1.2;by=-0.12}else{bx=(Math.random()<0.5?-1:1)*rnd(1.08,1.2);by=rnd(0.15,0.3)}}
  else if(pr>0.72&&!ovol&&!osm&&Math.random()<0.65){// on the run: a defensive slice or a lob to buy time
    if(meNet){kind='lob';bx=(Math.random()*2-1)*0.4;by=rnd(0.08,0.25);w=140;spd=Math.sqrt(9.81*Math.hypot((bx-from.x)*HW,(by-from.y)*CL))*1.08}
    else{kind='defend';bx=(Math.random()*2-1)*0.4;by=rnd(0.12,0.4);spd=14+s*0.4;w=-120}}
  else{const r=Math.random()*(1+pr),span=0.35+s*0.045,tact=Math.random()<clamp(0.25+s*0.085,0.3,0.97);
    // read the court: where the receiver is, which way they are running, and whether our ball was short
    const mx=M.mv[0].x/HW,my=0.5-M.mv[0].z/CL,mvx=M.mv[0].v,open=mx>0.08?-1:mx<-0.08?1:(Math.random()<0.5?-1:1),edge=a=>0.95-(1-a)*0.3;
    const shortBall=prev.land&&prev.type!=='serve'&&prev.land.y<0.76;
    spd+=O.pace;w+=O.spin;
    if(osm){bx=open*rnd(0.45,0.85);by=rnd(0.12,0.36)}
    else if(meNet&&!ovol){// passing shots: lob, dip at the feet, or rip it past
      if(Math.random()<O.lob*(my>0.32?1.4:0.8)){kind='lob';bx=(tact?open*rnd(0.15,0.55):(Math.random()*2-1)*0.5);by=rnd(0.05,0.2);w=140;spd=Math.sqrt(9.81*Math.hypot((bx-from.x)*HW,(by-from.y)*CL))*1.08}
      else if(Math.random()<0.3){kind='dip';bx=clamp(mx+rnd(-0.25,0.25),-0.8,0.8);by=rnd(0.36,0.44);spd=15+s*0.8;w=320}
      else{kind='pass';bx=(tact?open:(Math.random()<0.5?-1:1))*edge(O.agg+0.15)*rnd(0.85,1);by=rnd(0.08,0.3);spd=23+s*1.5;w=260}}
    else if(tact&&shortBall&&pr<0.45&&Math.random()<O.attack){kind='attack';bx=open*edge(O.agg)*rnd(0.8,1);by=rnd(0.08,0.25);spd=25+s*1.6+O.pace;w=200+O.spin*0.5}
    else if(pr<0.4&&Math.random()<O.drop*(my<0.02?1.6:0.5)){kind='drop';bx=(tact?open*rnd(0.2,0.6):(Math.random()*2-1)*0.55);by=rnd(0.38,0.45);spd=Math.sqrt(9.81*Math.hypot((bx-from.x)*HW,(by-from.y)*CL))*1.3;w=-170}
    else if(pr<0.5&&r<O.angle+s*0.01){kind='angle';bx=(tact?open:(Math.random()<0.5?-1:1))*rnd(0.65,0.9);by=rnd(0.28,0.38);spd=17+s*1.1;w=300}
    else if(tact){const q=Math.random();
      if(Math.abs(mvx)>2.2&&q<O.wrong){kind='wrongfoot';bx=clamp(mx-Math.sign(mvx)*0.6,-0.85,0.85);by=rnd(0.08,0.24)}  // behind the runner
      else if(q<O.wrong+O.bh){kind='backhand';bx=clamp(mx-rnd(0.45,0.75),-edge(O.agg),0.6);by=rnd(0.06,0.22)}
      else if(q<0.78){kind='open';bx=open*edge(O.agg)*rnd(0.6,0.95);by=rnd(0.06,0.24)}
      else{bx=(from.x>0?-1:1)*rnd(0.3,0.7);by=rnd(0.05,0.2)}}  // deep cross-court rally ball
    else{bx=(Math.random()*2-1)*span;by=rnd(0.06,0.28)}
    if(['deep','backhand','open','wrongfoot','attack'].includes(kind)&&Math.random()<O.slice*(kind==='attack'?1.4:1)){w=-150;spd*=0.82;M.oSlice=true}else M.oSlice=false
    // going for the lines costs: a style's risk turns some aggressive shots into misses
    {const rk=O.risk*(Math.max(0,Math.abs(bx)-0.75)*0.5+Math.max(0,0.09-by)*0.9+(kind==='attack'||kind==='pass'?0.04:0));
      if(kind!=='lob'&&Math.random()<rk){err=true;if(Math.random()<0.6)bx=Math.sign(bx||1)*rnd(1.05,1.18);else by=-rnd(0.03,0.12)}}
    if(!osm&&kind!=='lob'){spd*=1-0.32*pr;by+=pr*rnd(0.04,0.16);bx*=1-0.45*pr}}  // rushed: slower, shorter, more central
  let sh=null;
  for(let k=0;k<4;k++){sh=makeShot(from,{x:bx,y:by},spd*Math.pow(kind==='lob'?0.95:0.88,k),w,{who:'op',err,kind,lob:kind==='lob',recv:recvPos(0)});
    if(err)break;const L=sh.land;if(!sh.net&&Math.abs(L.x)<=1&&L.y>=0&&L.y<0.5)break}
  {const L=sh.land;sh.err=sh.net||Math.abs(L.x)>1.012||L.y<-0.004||L.y>0.5}  // the physics decides in or out
  M.shot=sh;sh.kind=kind;sh.w=w;sh.slice=!!M.oSlice;M.oSlice=false;onContact('op',toW(from.x,from.y,from.z),sh.speed,false);tire(1,0.004+0.004*clamp((sh.speed-18)/20,0,1));sndHit(Math.min(1.2,sh.speed/38));
  {const oy=from.y,app=ovol||osm||(kind==='attack'&&Math.random()<O.approach)||(oy<0.82&&Math.random()<O.approach*0.5);M.home[1]=app?{x:0,y:0.72}:{x:0,y:1.08};if(osm)say(M.cfg.opp.name+' smashes it!');else if(kind==='defend'&&!err)say(M.cfg.opp.name+' is on the run and slices it back.');else if(pr>0.55&&!err&&kind==='deep')say('Weak reply. Go after it.');else if(kind==='lob'&&!err)say(M.cfg.opp.name+' throws up a lob.');else if(kind==='attack'&&!err)say(M.cfg.opp.name+' attacks the short ball'+(M.home[1].y<1?' and comes in.':'.'));else if(kind==='pass'&&!err)say('Passing shot from '+M.cfg.opp.name+'.');else if(kind==='wrongfoot'&&!err)say('Behind you: '+M.cfg.opp.name+' wrong-foots you.');else if(M.home[1].y<1)say(M.cfg.opp.name+' is coming in.')}
  if(!sh.err){setReach(M.shot);if(M.shot.unreach&&pointWins(1)===2)slowMo(true)}
  M.meSide=sideFor(0,M.shot.hx,M.shot.volley,M.shot.smash);
  M.t0=now();M.state='op';M.land=null;M.aim=null;M.commit=null;
  if(M.pending&&!sh.err&&!M.shot.unreach){M.commit=M.pending;M.aim={x:M.pending.x,y:M.pending.y}}M.pending=null;
}
function executeShot(){
  const sh=M.shot,S=M.S,c=M.commit;M.commit=null;
  const mp=clamp(Math.max(M.mePress||0,contactPress(0,sh,M.meSide)),0,1);M.mePress=0;
  // timing: seconds between the swipe and the moment of contact (negative = swiped after it)
  const tc=M.t0+0.9*sh.T*1000,dts=((tc-(c.tSw||now()))/1000),tim=dts<0?'late':dts<=PERFECT[1]&&dts>=PERFECT[0]?'perfect':dts>0.8?'early':'ok';
  if(tim==='perfect')M.stat.perfect++;
  const tf=tim==='perfect'?0.68:tim==='late'?1.35:tim==='early'?1.12:1,E=M.en[0];
  const bp=pos(sh,clamp((now()-M.t0)/1000/sh.T,0.9,1.0)),l=scatter(Object.assign({},c,{r:c.r*(sh.smash?0.6:1)*(c.slice?0.85:1)*(1+1.6*mp*(c.slice?0.55:1))*tf*(1+0.55*(1-E))+0.05*mp}));let type=c.f<0.25?'drop':'drive';
  if(!P[0].swing)P[0].startSwing(M.meSide,SWINGS[M.meSide].dur*SWINGS[M.meSide].cf,yoFor(M.meSide,sh.hz));
  const pw=Math.min(c.pw,1.2-0.55*mp-0.3*(1-E))*(tim==='perfect'?1.06:tim==='late'?0.88:1),vol=sh.volley,smh=sh.smash,opNet=M.op.y<0.85||M.home[1].y<0.9;
  if(smh)type='drive';else if(!vol&&type!=='drop'&&opNet&&c.pw<0.35&&c.f>=0.6)type='lob';
  let Dm=Math.hypot((l.x-bp.x)*HW,(l.y-bp.y)*CL),spd=smh?(24+16*pw+S.power*0.5)*(Math.abs(bp.y-0.5)>0.32?0.8:1):type==='lob'?Math.sqrt(9.81*Dm)*1.08:type==='drop'?Math.max((vol?6:9)+2.5*pw,Math.sqrt(9.81*Dm)*(vol?1.15:1.3)):vol?13+12*pw+S.power*0.3:14+18*pw+S.power*0.5,w=smh?40:type==='lob'?140:type==='drop'?-170:vol?-70:170+70*(1-Math.min(pw,1))+S.control*6;
  const slc=!!c.slice&&type==='drive'&&!vol&&!smh;if(slc){spd*=0.82;w=-(150+50*Math.min(pw,1))}
  const shot=makeShot(bp,{x:l.x,y:l.y},spd,w,{who:'me',type,lob:type==='lob',slice:slc,recv:recvPos(1)});sndHit(Math.min(1.2,spd/38));tire(0,0.004+0.004*Math.min(pw,1));if(tim==='perfect')perfectFlash();onContact('me',toW(bp.x,bp.y,bp.z),spd,tim==='perfect');
  M.aim={x:c.x,y:c.y};M.land=shot.land;
  if(!landIn(shot,false)){
    const L=shot.land,why=shot.net?'Into the net. Swipe slower or a little longer.':Math.abs(L.x)>1?'Just wide.':'Long. Swipe a little shorter or slower.';
    shot.err=true;M.shot=shot;M.t0=now();M.state='err';drillEvent({k:'hit',in:false,why,tim,slice:!!c.slice});
    setTimeout(()=>pointTo(1,why,shot.net?'NET':'OUT'),shot.net?700:Math.min(1600,shot.tb*1000+250));return}
  if(c.pw>=0.85)M.stat.big++;
  const tx=shot.land.x,ty=shot.land.y;
  {const sd=Math.sign(tx);M.pat.push(sd);if(M.pat.length>4)M.pat.shift();const same=M.pat.length===4&&M.pat.every(v=>v===sd);
    if(same&&!M.readMe){M.readMe=true;if(!M.readSaid){M.readSaid=true;setTimeout(()=>{if(M&&M.state!=='between')say(M.cfg.opp.name+' is reading your pattern. Change direction.')},500)}}else if(!same)M.readMe=false}
  shot.w=w;shot.bonus=(type==='drop'&&hasPerk('allcourt',1)?0.12:0)+(Math.abs(tx)>0.7&&hasPerk('allcourt',2)?0.08:0)+(ty>0.85&&hasPerk('baseliner',3)?0.06:0)+(smh?0.12:0);
  M.shot=shot;M.t0=now();M.state='me';P[1].hop=0.15;
  fallbackHit(1,M.shot);M.returns=canReach(1,M.shot);M.oppPress=M.returns?pressureOf(1,M.shot):0;if(!M.returns&&(pointWins(0)===2||M.rally>=8))slowMo(true);
  if(smh)M.stat.smashes++;if(vol)M.stat.volleys++;if(slc)M.stat.slices++;
  if(M.drill){M.returns=false;M.oppPress=0;drillEvent({k:'hit',in:true,land:shot.land,kmh:Math.round(spd*3.6),tim,volley:vol,smash:smh,slice:slc})}
  M.opSide=sideFor(1,M.shot.hx,M.shot.volley,M.shot.smash);
  if(!M.drill)say((slc?'Slice. ':'')+(tim==='perfect'?'Perfect timing! ':tim==='late'?'Late. ':tim==='early'?'Early. ':'')+(mp>0.55?'On the run. ':'')+(smh?'Smash! '+Math.round(spd*3.6)+' km/h':type==='lob'?'Lob over the top.':vol?(type==='drop'?'Drop volley.':'Volley! '+Math.round(spd*3.6)+' km/h'):type==='drop'?'Drop shot.':c.pw>=0.85?'Big hit! '+Math.round(spd*3.6)+' km/h':c.pw<0.3?'Soft shot. Swipe faster for more pace.':'In play. '+Math.round(spd*3.6)+' km/h'));
}
function doServe(a){
  if(!M||M.state!=='serving')return;
  const second=M.fault,ty=M.svType[second?1:0],SV=SVT[ty];
  const S=M.S,d=side()==='deuce',lo=d?-1:0,hi=d?0:1,l=scatter(Object.assign({},a,{r:a.r*SV.r})),C=P[0].tossC||P[0].contactWorld(),from={x:C.x/HW,y:0.5-C.z/CL,z:C.y/ZS};
  const pw=Math.min(a.pw,1.1);
  let spd=(24+20*pw+S.serve*0.9+(hasPerk('server',3)?2.5:0))*(0.92+0.08*M.en[0])*SV.spd,w=SV.w;tire(0,0.006);
  const shot=makeShot(from,{x:l.x,y:l.y},spd,w,{who:'me',type:'serve',ss:SV.ss});shot.svType=ty;onContact('me',C.clone?C.clone():toW(from.x,from.y,from.z),spd*0.8,false);sndHit(Math.min(1.2,spd/45));
  M.aim={x:a.x,y:a.y};M.land=shot.land;
  if(!landIn(shot,true)){
    const L=shot.land,why=shot.net?'into the net':L.y>0.772?'long':'wide';
    shot.err=true;M.shot=shot;M.t0=now();M.state='err';
    if(M.drill){drillEvent({k:'serve',in:false,why,ty});setTimeout(drillNext,1300);return}
    if(M.fault)setTimeout(()=>pointTo(1,'Double fault, '+why+'.','DOUBLE FAULT'),900);
    else{M.fault=true;callOut('FAULT');setTimeout(()=>{if(!M||M.lock)return;M.state='serveMe';M.shot=null;M.land=null;M.aim=null;say('Fault, '+why+'. Second serve: kick is the safe choice.')},1100)}
    return}
  if(a.pw>=0.85)M.stat.big++;
  shot.second=second;shot.w=w;M.shot=shot;fallbackHit(1,shot);M.returns=canReach(1,shot);if(M.drill){M.returns=false;drillEvent({k:'serve',in:true,kmh:Math.round(spd*3.6),ty})}M.oppPress=M.returns?pressureOf(1,shot):0;M.t0=now();M.state='me';P[1].hop=0.15;
  M.opSide=sideFor(1,M.shot.hx,M.shot.volley,M.shot.smash);
  if(!M.drill)say((a.pw>=0.85?'Big '+SV.name.toLowerCase()+' serve! ':SV.name+' serve in. ')+Math.round(spd*3.6)+' km/h');
}

const PERFECT=[0.1,0.42]; // seconds before contact
function perfectFlash(){const b=W3.ball;b.scale.setScalar(1.8);setTimeout(()=>b.scale.setScalar(1),140);callOut('PERFECT')}
const MAXL=190;
/* serve types: speed factor, topspin, sidespin (+ curves a right-hander's slice away to their left), and stray factor */
const SVT={flat:{name:'Flat',spd:1.04,w:50,ss:0,r:1.15},slice:{name:'Slice',spd:0.92,w:20,ss:360,r:1},kick:{name:'Kick',spd:0.8,w:430,ss:-70,r:0.7}};
function renderSvType(){const i=M.fault?1:0;document.querySelectorAll('#svType button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.t===M.svType[i])))}
document.querySelectorAll('#svType button').forEach(b=>b.onclick=e=>{e.stopPropagation();if(!M)return;M.svType[M.fault?1:0]=b.dataset.t;renderSvType()});
/* how curved the swipe path is: the furthest the path strays from the straight line start-to-end, as a share of its length */
function swipeCurve(){const sm=M.samples;if(!sm||sm.length<3)return 0;const a=sm[0],b=sm[sm.length-1],L=Math.hypot(b.x-a.x,b.y-a.y);if(L<45)return 0;let mx=0;
  for(const p of sm)mx=Math.max(mx,Math.abs((b.x-a.x)*(a.y-p.y)-(a.x-p.x)*(b.y-a.y))/L);return mx/L}
const SLICE_CURVE=0.17;
function aimFromSwipe(dx,dy,serve,spd){
  const L0=Math.hypot(dx,dy);if(L0<20)return null;const fwd=Math.max(-dy,20);
  const f=clamp(L0/MAXL,0,1.25),pw=clamp(spd/1.4,0,1.2),S=M.S;
  let tx,ty;
  if(serve){const ctr=side()==='deuce'?-0.5:0.5;tx=ctr+(dx/fwd)*0.9;ty=0.5+f*0.3}
  else{tx=M.me.x*0.25+(dx/fwd)*1.0;ty=0.54+f*0.44}
  let r=0.03+pw*pw*(serve?0.15:0.2)*(1.15-S.control*0.07)+f*0.03;
  if(serve&&M.fault&&hasPerk('server',2))r*=0.6;
  if(!serve&&ty>0.85&&hasPerk('baseliner',1))r*=0.75;
  if(hasPerk('allcourt',3))r*=0.9;
  return{x:clamp(tx,-1.4,1.4),y:ty,f,pw,r,slice:!serve&&swipeCurve()>=SLICE_CURVE};
}
function swipeSpeed(){const sm=M.samples;if(!sm||sm.length<2)return 0;const last=sm[sm.length-1];let first=last;for(let i=sm.length-1;i>=0;i--){if(last.t-sm[i].t>90)break;first=sm[i]}const dt=last.t-first.t;return dt>0?Math.hypot(last.x-first.x,last.y-first.y)/dt:0}
function inPlay(a,serve){if(serve){const d=side()==='deuce',lo=d?-1:0,hi=d?0:1;return a.x>=lo&&a.x<=hi&&a.y>=0.52&&a.y<=0.77}return Math.abs(a.x)<=1&&a.y>=0.52&&a.y<=1}
function scatter(a){const ang=Math.random()*Math.PI*2,m=Math.sqrt(Math.random());return{x:a.x+Math.cos(ang)*a.r*m,y:a.y+Math.sin(ang)*a.r*0.7*m}}
/* ---- tap to move: tap your side of the court and your player heads there (tap near the net to come in) ---- */
function moveTap(e){
  const ndc=new T.Vector2(e.clientX/window.innerWidth*2-1,-(e.clientY/window.innerHeight)*2+1),rc=new T.Raycaster();rc.setFromCamera(ndc,W3.cam);
  const d=rc.ray.direction;if(d.y>=-1e-4)return;const t=-rc.ray.origin.y/d.y,X=rc.ray.origin.x+d.x*t,Z=rc.ray.origin.z+d.z*t;
  if(Z<1.5){say('Tap your own side of the court to move.');return}
  const y=clamp(0.5-Z/CL,-0.2,0.43),x=clamp(X/HW,-1.1,1.1);M.home[0]={x,y};
  W3.homeMark.visible=true;W3.homeMark.position.set(x*HW,0.012,toW(0,y).z);
  if(M.state==='op'&&M.shot&&!M.shot.err&&!M.commit){chooseHit(M.shot,recvPos(0));M.shot.unreach=false;setReach(M.shot);M.meSide=sideFor(0,M.shot.hx,M.shot.volley,M.shot.smash)}
  say(y>0.22?'Coming in to the net.':y<0.02?'Staying back on the baseline.':'Moving up.');
}
/* ---- input ---- */
const cv=$('gl');
function lp(e){const k=360/window.innerWidth;return{x:e.clientX*k,y:e.clientY*k}}
cv.addEventListener('pointerdown',e=>{
  if(REP.on){e.preventDefault();endReplay();return}
  if(!M||(M.state!=='op'&&M.state!=='serveMe'&&M.state!=='me'))return;e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}
  M.sw=lp(e);M.preview=null;M.samples=[{x:M.sw.x,y:M.sw.y,t:now()}];
});
cv.addEventListener('pointermove',e=>{if(!M||!M.sw)return;const q=lp(e);M.samples.push({x:q.x,y:q.y,t:now()});if(M.samples.length>40)M.samples.shift();M.preview=aimFromSwipe(q.x-M.sw.x,q.y-M.sw.y,M.state==='serveMe',swipeSpeed())});
cv.addEventListener('pointerup',e=>{
  if(!M||!M.sw)return;const q=lp(e);M.samples.push({x:q.x,y:q.y,t:now()});const dragLen=Math.hypot(q.x-M.sw.x,q.y-M.sw.y),dur=now()-M.samples[0].t;const a=aimFromSwipe(q.x-M.sw.x,q.y-M.sw.y,M.state==='serveMe',swipeSpeed());M.sw=null;M.preview=null;
  if(!a){if(dragLen<20&&dur<350&&M.state!=='serveMe'){moveTap(e);return}say('Swipe a little longer toward their court.');return}
  hapticTap();
  if(M.state==='serveMe'){M.state='serving';M.aim={x:a.x,y:a.y};P[0].startSwing('sv');M.serveT0=now();setTimeout(()=>doServe(a),SWINGS.sv.dur*SWINGS.sv.cf*1000);return}
  a.tSw=now();
  if(M.state==='me'&&M.shot&&M.shot.type!=='serve'&&M.returns){M.pending=a;M.aim={x:a.x,y:a.y};say('Shot locked in early.');return}
  if(M.state!=='op')return;
  const sh=M.shot;if(sh.err){say('That one is going out. Let it go.');return}if(sh.unreach){say('You can’t get there in time.');return}
  M.commit=a;M.aim={x:a.x,y:a.y};
  const p=(now()-M.t0)/1000/sh.T;if(p>=0.9)executeShot();else say('Shot locked in. Swipe again to change it.');
});
cv.addEventListener('pointercancel',()=>{if(M){M.sw=null;M.preview=null}});

/* ---- per frame ---- */
let lastT=0;
function loop(t){
  requestAnimationFrame(loop);
  const dtr=Math.min(0.05,(t-lastT)/1000||0.016);lastT=t;clockTick();
  if($('match').hidden||!P[0])return;
  if(REP.on){replayTick(dtr);crowdTick(dtr);fxTick(dtr*0.55);W3.r.render(W3.scene,W3.cam);return}
  const dt=dtr*CLK.ts;
  if(M&&!window.__FREEZE)step(dt);
  crowdTick(dtr);sndAmbience(!!M&&['op','me','oppServing','serving'].includes(M.state));
  if(window.__POSE&&P[0]){const Q=window.__POSE,S=SWINGS[Q.type];P[0].swing={type:Q.type,t:Q.u*S.dur-dt};P[0].post=null;if(Q.type==='sv'&&Q.u<0.38){P[0].tossR=null}}
  if(P[0]){P[0].serveReady=!!M&&M.state==='serveMe';P[1].serveReady=!!M&&M.state==='oppServe'}
  const rlx=!M||M.state==='between';P[0].relax=rlx;P[1].relax=rlx||(M&&(M.state==='serveMe'));
  P[0].update(dt,1,M?M.mv[0].v:0,M?M.mv[0].vz:0);P[1].update(dt,-1,M?M.mv[1].v:0,M?M.mv[1].vz:0);
  camera(dtr);fxTick(dt);if(M&&!window.__FREEZE)recordFrame();
  W3.r.render(W3.scene,W3.cam);
}
function swingFor(pl,side,tHit,hz){const S=SWINGS[side];if(!pl.swing&&now()>=tHit-S.dur*S.cf*1000){const yo=yoFor(side,hz);const off=Math.max(0,(now()-(tHit-S.dur*S.cf*1000))/1000);pl.startSwing(side,Math.min(off,S.dur*S.cf),yo)}}
function step(dt){
  const t=now(),sh=M.shot;let p=0;
  if(sh){p=(t-M.t0)/1000/sh.T;
    if(sh.r&&p<1.4){const tt=p*sh.T,lt=sh._lt||0;for(const b of sh.r.bounces)if(b.t>lt&&b.t<=tt){sndBounce(-b.vy);if(W3.venue){puff(b.x,b.z,W3.venue.surf,-b.vy);ballMark(b.x,b.z,Math.atan2(b.x-sh.S[0],b.z-sh.S[2]))}}if(sh.r.net&&sh.r.net.t>lt&&sh.r.net.t<=tt)sndNet();sh._lt=tt}
    if(M.state==='op'){
      if(M.commit&&!sh.err&&!sh.unreach)swingFor(P[0],M.meSide,M.t0+0.9*sh.T*1000,sh.hz);
      if(M.commit&&p>=0.9){executeShot()}else{
        if(sh.err&&p>(sh.net?0.3:sh.pb+0.02)&&!sh.called){sh.called=true;callOut(sh.net?'NET':'OUT');say(sh.net?'Into the net!':'Out!')}
        if(sh.err&&p>1.0)pointTo(0,sh.net?'Their shot found the net.':'Their shot was out.',null);
        else if(sh.unreach&&p>1.1){pointTo(1,sh.ace?'Ace from '+M.cfg.opp.name+'.':'Out of reach.',sh.ace?'ACE':null)}
        else if(!sh.err&&!sh.unreach&&p>1.0)pointTo(1,'You didn’t swipe in time.',null)}
    }
    else if(M.state==='me'&&sh.who==='me'){
      if(M.returns)swingFor(P[1],M.opSide,M.t0+0.9*sh.T*1000,sh.hz);
      if(M.returns&&p>=0.9)oppHit(pos(sh,p));
      else if(!M.returns&&p>1.15){if(sh.type==='serve'){M.stat.aces++;pointTo(0,'Ace!','ACE')}else{M.stat.winners++;pointTo(0,'Winner!','WINNER')}}
    }
  }
  // players: accelerate and brake like people, side to side and up and back; the body ends up beside the ball
  const mv=M.mv,fixed=M.state==='serveMe'||M.state==='serving'||M.state==='oppServe'||M.state==='oppServing';
  const zMe=toW(0,-0.05).z,zOp=toW(0,1.08).z;
  if(!fixed){
    const sh=M.shot;
    let x0=mv[0].x,z0=mv[0].z,x1=mv[1].x,z1=mv[1].z,vm0=vmaxOf(0),vm1=vmaxOf(1);
    if(M.state==='op'&&sh){if(!sh.err){x0=sh.hx*HW+({fh:-0.75,bh:0.45,fv:-0.62,bv:0.55,sm:-0.31}[M.meSide]);z0=toW(0,sh.hy).z+(sh.smash?0.29:sh.volley?0.55:0.5)}x1=M.home[1].x*HW;z1=toW(0,M.home[1].y).z}
    else if(M.state==='me'&&sh){const hz=toW(0,sh.hy).z;
      if(M.returns){x1=sh.hx*HW+({fh:0.75,bh:-0.45,fv:0.62,bv:-0.55,sm:0.31}[M.opSide]);z1=hz-(sh.smash?0.29:sh.volley?0.55:0.5)}else if(M.drill){x1=M.home[1].x*HW;z1=toW(0,M.home[1].y).z}else{const sp=spotFor(1,sh,M.opSide);x1=sp.x;z1=sp.z}
      if(sh.type!=='serve'){x0=M.home[0].x*HW;z0=toW(0,M.home[0].y).z}}
    drive2(mv[0],x0,z0,vm0,dt);drive2(mv[1],x1,z1,vm1,dt);
    for(let i=0;i<2;i++){const sp=Math.hypot(mv[i].v,mv[i].vz),d=sp*dt;M.run[i]+=d;tire(i,d*0.0022*(0.55+0.45*Math.min(1,sp/(i?vm1:vm0))))}
    renderEnergy();
    for(let i=0;i<2;i++)if(M.en[i]<0.35&&!M.tiredSaid[i]&&M.state!=='between'){M.tiredSaid[i]=true;if(i===1)say(M.cfg.opp.name+' is breathing hard. Keep making them run.')}
  }else{mv[0].v=mv[0].vz=0;mv[1].v=mv[1].vz=0}
  M.me.x=mv[0].x/HW;M.op.x=mv[1].x/HW;M.me.y=0.5-mv[0].z/CL;M.op.y=0.5-mv[1].z/CL;
  for(let i=0;i<2;i++){const pl=P[i],v=mv[i].v,vz=mv[i].vz,sp=Math.hypot(v,vz),want=(sp>3.6&&!pl.swing)?1:0;pl.runW+=(want-pl.runW)*Math.min(1,dt*(want?5:9));
    const base=i===0?Math.PI:0;let d=(sp>0.1?Math.atan2(v,vz):base)-base;d=Math.atan2(Math.sin(d),Math.cos(d));pl.yawOff=d*pl.runW}
  P[0].pos.set(mv[0].x,0,mv[0].z);P[0].yaw=Math.PI;
  P[1].pos.set(mv[1].x,0,mv[1].z);P[1].yaw=0;
  // ball
  let bw=null;
  if(M.state==='serving'||M.state==='oppServing'){const pl=M.state==='serving'?P[0]:P[1];bw=pl.swing&&pl.swing.type==='sv'?pl.tossPos(pl.swing.t/SWINGS.sv.dur):pl.tossPos(0)}
  else if(M.state==='serveMe'){bw=P[0].tossPos(0)}
  else if(M.state==='oppServe'){bw=P[1].tossPos(0)}
  else if(sh){const b=pos(sh,Math.min(p,1.3));bw=toW(b.x,b.y,b.z);bw.y+=0.075}
  {const tcl=M.state==='op'&&sh&&!sh.err&&!sh.unreach&&!M.commit?(M.t0+0.9*sh.T*1000-t)/1000:-1,on=tcl>=PERFECT[0]&&tcl<=PERFECT[1];
    W3.ball.material.emissive.setHex(on?0x9FE03A:0x4a5a10);W3.ball.material.emissiveIntensity=on?1.6:1}
  W3.ball.visible=W3.bshadow.visible=!!bw;
  if(bw){W3.ball.position.copy(bw);W3.bshadow.position.set(bw.x,0.012,bw.z);const sc=1/(1+bw.y*0.25);W3.bshadow.scale.setScalar(sc)}
  // serve box glow
  if(M.state==='serveMe'){const d=side()==='deuce',x0=d?-HW:0,x1=d?0:HW;W3.boxGlow.visible=true;W3.boxGlow.position.set((x0+x1)/2,0.008,-3.2);W3.boxGlow.scale.set(x1-x0,1,6.4);W3.boxGlow.material.opacity=0.12+0.08*Math.sin(t/180)}else W3.boxGlow.visible=false;
  // aim preview / landing
  const pv=M.sw&&M.preview?M.preview:(M.state==='op'&&M.commit?M.commit:(M.state==='me'&&M.pending?M.pending:null));
  const hint=$('hint');let ht='',warn=false;
  if(pv){const serve=M.state==='serveMe',ok=inPlay(pv,serve),col=M.sw?(ok?0x74D493:0xF28A78):0xD3E86B;
    const w=toW(pv.x,pv.y);W3.aimRing.visible=W3.aimDisk.visible=W3.aimLine.visible=true;
    const rx=Math.max(0.45,pv.r*HW),rz=Math.max(0.45,pv.r*0.7*CL);
    for(const m of[W3.aimRing,W3.aimDisk]){m.position.set(w.x,0.01,w.z);m.scale.set(rx,1,rz);m.material.color.setHex(col)}
    const from=P[0].pos,mx=new T.Matrix4(),ph=(t/600)%1;for(let i=0;i<18;i++){const u=(i+ph)/18;mx.makeTranslation(from.x+(w.x-from.x)*u,0.9+Math.sin(Math.PI*u)*2.2*(1-0.4*u),from.z-0.6+(w.z-from.z+0.6)*u);W3.aimLine.setMatrixAt(i,mx)}
    W3.aimLine.instanceMatrix.needsUpdate=true;W3.aimLine.material.color.setHex(col);
  }else W3.aimRing.visible=W3.aimDisk.visible=W3.aimLine.visible=false;
  if(M.land&&sh&&sh.who==='me'&&(M.state==='me'||M.state==='err'||M.state==='between')){const w=toW(M.land.x,M.land.y);W3.landMark.visible=true;W3.landMark.position.set(w.x,0.012,w.z);W3.landMark.scale.set(0.45,1,0.45);W3.landMark.material.color.setHex(M.state==='err'||sh.err?0xF28A78:0x9BE15D)}else W3.landMark.visible=false;
  const pw=$('power');
  if(M.sw){pw.hidden=false;const v=M.preview?M.preview.pw:0;const bar=pw.querySelector('i');bar.style.width=Math.min(100,v/1.25*100)+'%';bar.style.background=v>=0.85?'#F5A524':'#D3E86B'}else pw.hidden=true;
  {const sv=M.state==='serveMe';$('svType').hidden=!sv;if(sv)renderSvType()}
  if(M.state==='serveMe')ht=(M.sw?'Pace: swipe faster for more':'Swipe up into the box')+' · '+SVT[M.svType[M.fault?1:0]].name+' serve';
  else if(M.state==='op'&&sh){if(sh.err){ht='Going out, let it go';warn=true}else if(sh.unreach){ht='Out of reach';warn=true}else if(M.sw)ht=(M.preview&&M.preview.slice?'Slice · ':'Topspin · ')+'swipe faster for more pace';else if(M.commit)ht='Locked in. Swipe again to change';else if((M.mePress||0)>0.6&&!sh.smash)ht='Stretched: a safer swipe will keep it in';else ht=sh.smash?'Overhead! Swipe to smash it':sh.volley?'Volley! Swipe to punch it':M.en[0]<0.35?'Tired: keep the points short':'Swipe to hit · tap your court to move'}
  hint.textContent=ht;hint.className=warn?'warn':'';
}
function camera(dt){
  if(window.__CAM){const c=window.__CAM,me=P[0].pos;W3.cam.position.set(me.x+c[0],c[1],me.z+c[2]);W3.cam.lookAt(me.x,c[3],me.z);return}
  const me=P[0].pos;const tp=new T.Vector3(me.x*0.75,11.5,me.z+12.5),tl=new T.Vector3(me.x*0.4,0,0.5);
  const k=Math.min(1,dt*3);W3.camPos.lerp(tp,k);W3.camLook.lerp(tl,k);W3.cam.position.copy(W3.camPos);const sk=shakeOffset();if(sk)W3.cam.position.add(sk);W3.cam.lookAt(W3.camLook);
  W3.sun.target.position.set(0,0,0);
}
/*@LEARN*/
/*@PROGRESS*/
document.addEventListener('pointerdown',sndResume,{passive:true});
$('snd').textContent=SND.on?'Sound on':'Sound off';$('snd').onclick=()=>{sndResume();$('snd').textContent=sndToggle()?'Sound on':'Sound off'};
window.__TG={dbg:{get GT(){return GT},endMatch:()=>endMatch(),get PROF(){return PROF},pointTo:(w,t,c)=>pointTo(w,t,c),startReplay,onContact,puff,REP,CLK,FX,slowMo,reachMargin,pressureOf,canReach,fallbackHit,scatter,aimFromSwipe,side,SURF},snd:{sndResume,sndHit,sndBounce,sndNet,sndApplause,sndCrowdVoice,umpireScore,crowdCheer,lineCall,get ctx(){return SND.ctx}},get M(){return M},P:()=>P,pos,W3:W3,makeShot,canReach,fallbackHit,oppHit:f=>oppHit(f),exec:()=>executeShot()};
renderTitle();
})();
