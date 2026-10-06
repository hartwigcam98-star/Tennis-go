/* ================= progression: one profile across quick matches, career and lessons =================
   Level 1-60 (XP), coins, players unlocked by level, gear that lifts stats past 10, per-player mastery, cosmetics,
   achievements in tiers, and three daily challenges. Everything is earned by playing. */
const KEY_PROF='tennis-go-profile';
const PROF_NEW=()=>({v:1,xp:0,coins:0,gear:{},mastery:{},life:{},ach:{},cos:{own:{},paint:'paint_red',trail:'trail_classic',dance:'dance_samba'},daily:null,streak:0,lastFull:null});
let PROF=(()=>{try{const v=JSON.parse(localStorage.getItem(KEY_PROF)||'null');if(v&&v.v){const p=Object.assign(PROF_NEW(),v);p.cos=Object.assign(PROF_NEW().cos,v.cos||{});return p}}catch(e){}return PROF_NEW()})();
function storeProf(){try{localStorage.setItem(KEY_PROF,JSON.stringify(PROF))}catch(e){}}
const fmtN=n=>Math.round(n).toLocaleString('en-US');
const ONE={sets:'set',matches:'match',times:'time',titles:'title',majors:'major',opponents:'opponent',aces:'ace',smashes:'smash',volleys:'volley',winners:'winner',slices:'slice',players:'player',challenges:'challenge',shots:'shot'};
function nText(t,n){const s=t.replace('{n}',fmtN(n));return n===1?s.replace(/\b(sets|matches|times|titles|majors|opponents|aces|smashes|volleys|winners|slices|players|challenges|shots)\b/g,w=>ONE[w]):s}

/* ---- levels: each level needs a little more than the last; about 163k XP to reach 60 ---- */
const MAXLV=60;
function needXP(L){return Math.round(80+30*L+1.5*L*L)}
function levelOf(xp){let L=1,acc=0;while(L<MAXLV&&xp>=acc+needXP(L)){acc+=needXP(L);L++}return{L,into:xp-acc,need:L<MAXLV?needXP(L):0}}
const LV=()=>levelOf(PROF.xp).L;

/* ---- players: six to start, one more every three levels ---- */
const START_CHARS=['ch08','ch31','ch01','ch12','remy','boss'];
const CHAR_UNLOCK={ch09:3,ch06:6,ch23:9,ch24:12,ch28:15,ch42:18,brute:21,peasant:24,granny:27,ty:30,ch43:33,ch17:36,vegas:39,ch39:42};
function charUnlockLv(id){return START_CHARS.includes(id)?1:(CHAR_UNLOCK[id]||1)}
function charUnlocked(id){return LV()>=charUnlockLv(id)||(save&&save.char===id)||(PROF.mastery[id]||0)>0}
function unlockedCount(){return ROSTER.filter(r=>charUnlocked(r.id)).length}

/* ---- gear: five slots, ten upgrades each, +0.15 to one stat per upgrade (+1.5 at the top) ---- */
const GEAR=[
  {id:'racket',name:'Racket',stat:'power',tiers:['Club Classic','Graphite 100','Tour Carbon','Pro Frame','Signature Gold']},
  {id:'strings',name:'Strings',stat:'control',tiers:['Synthetic gut','Multifilament','Co-poly','Hybrid pro','Natural gut']},
  {id:'shoes',name:'Shoes',stat:'speed',tiers:['Club trainers','Court runners','Speed soles','Pro glide','Featherweight']},
  {id:'grip',name:'Overgrip',stat:'serve',tiers:['Basic wrap','Tacky wrap','Pro wrap','Leather grip','Custom mould']},
  {id:'fitness',name:'Fitness',stat:'stamina',tiers:['Jogging club','Interval plan','Altitude block','Pro conditioning','Iron lungs']}];
const GEAR_REQ=[1,3,6,10,15,21,28,36,45,54];
let GEAR_STEP=0.15;
const gearCost=n=>Math.round(100*Math.pow(1.45,n-1)/10)*10;
function gearLv(id){return PROF.gear[id]||0}
function gearName(g){const n=gearLv(g.id);return n?g.tiers[Math.min(4,Math.floor((n-1)/2))]:'Standard issue'}
function gearBonus(stat){const g=GEAR.find(x=>x.stat===stat);return g?gearLv(g.id)*GEAR_STEP:0}
function withGear(st){const o={};for(const k in st)o[k]=st[k]+gearBonus(k);return o}
function buyGear(id){const n=gearLv(id)+1;if(n>10)return false;if(LV()<GEAR_REQ[n-1]||PROF.coins<gearCost(n))return false;PROF.coins-=gearCost(n);PROF.gear[id]=n;storeProf();return true}

/* ---- mastery: per player, from playing them ---- */
const MASTERY=[250,700,1400,2400,3800,5600,8000,11000,15000,20000];
function masteryOf(id){const x=PROF.mastery[id]||0;let l=0;while(l<10&&x>=MASTERY[l])l++;return l}

/* ---- cosmetics ---- */
const COS=[
  {id:'paint_red',kind:'paint',name:'Classic red',col:0xE5484D,free:1},
  {id:'paint_white',kind:'paint',name:'Chalk white',col:0xEDEDE6,cost:300},
  {id:'paint_navy',kind:'paint',name:'Navy',col:0x23346B,cost:500},
  {id:'paint_lime',kind:'paint',name:'Ball lime',col:0xC6F04A,cost:900},
  {id:'paint_orange',kind:'paint',name:'Clay orange',col:0xE0703A,lv:10},
  {id:'paint_black',kind:'paint',name:'Stealth black',col:0x222226,cost:1500},
  {id:'paint_teal',kind:'paint',name:'Teal',col:0x2FB5A8,lv:25},
  {id:'paint_pink',kind:'paint',name:'Neon pink',col:0xF07AB8,cost:2500},
  {id:'paint_purple',kind:'paint',name:'Champion purple',col:0x7A4FD6,ach:'majors'},
  {id:'paint_gold',kind:'paint',name:'Gold',col:0xE3B341,mast:10},
  {id:'trail_classic',kind:'trail',name:'Classic (by pace)',col:null,free:1},
  {id:'trail_ice',kind:'trail',name:'Ice',col:0x7FD8FF,cost:700},
  {id:'trail_fire',kind:'trail',name:'Fire',col:0xFF5A2A,lv:15},
  {id:'trail_lime',kind:'trail',name:'Glow',col:0xB8FF40,ach:'perfect',tier:2},
  {id:'trail_violet',kind:'trail',name:'Violet',col:0xB07CFF,cost:3000},
  {id:'trail_gold',kind:'trail',name:'Gold',col:0xFFD25A,lv:50},
  {id:'dance_samba',kind:'dance',name:'Samba',clip:'samba',free:1},
  {id:'dance_uprock',kind:'dance',name:'Uprock',clip:'uprock',lv:8},
  {id:'dance_robot',kind:'dance',name:'Robot',clip:'robot',lv:20}];
function cosOwned(c){if(c.free||PROF.cos.own[c.id])return true;if(c.lv&&LV()>=c.lv)return true;if(c.ach&&(PROF.ach[c.ach]||0)>=(c.tier||1))return true;if(c.mast&&ROSTER.some(r=>masteryOf(r.id)>=c.mast))return true;return false}
function cosHow(c){return c.cost?fmtN(c.cost)+' coins':c.lv?'Level '+c.lv:c.ach?ACH.find(a=>a.id===c.ach).name+(c.tier>1?' tier '+c.tier:''):c.mast?'Mastery '+c.mast+' with any player':''}
const cosOf=kind=>COS.find(c=>c.id===PROF.cos[kind])||COS.find(c=>c.kind===kind&&c.free);

/* ---- achievements ---- */
const ACH=[
  {id:'wins',name:'Winner',d:'Win {n} matches',k:'wins',t:[5,50,250]},
  {id:'played',name:'Regular',d:'Play {n} matches',k:'matches',t:[10,100,500]},
  {id:'aces',name:'Ace machine',d:'Serve {n} aces',k:'aces',t:[10,100,500]},
  {id:'winners',name:'Shotmaker',d:'Hit {n} winners',k:'winners',t:[25,250,1500]},
  {id:'perfect',name:'In the zone',d:'Hit {n} perfect shots',k:'perfect',t:[25,300,2000]},
  {id:'smashes',name:'Overhead',d:'Land {n} smashes',k:'smashes',t:[5,50,300]},
  {id:'volleys',name:'Net rusher',d:'Land {n} volleys',k:'volleys',t:[10,150,800]},
  {id:'slices',name:'Slicer',d:'Land {n} slices',k:'slices',t:[20,250,1500]},
  {id:'rally',name:'Marathon',d:'Play a rally of {n} shots',k:'rallyMax',t:[10,20,35]},
  {id:'bagel',name:'Bakery',d:'Win {n} sets 6–0',k:'bagels',t:[1,10,40]},
  {id:'comeback',name:'Comeback',d:'Win {n} matches after losing the first set',k:'comebacks',t:[1,5,20]},
  {id:'streak',name:'On a roll',d:'Win {n} matches in a row',k:'bestStreak',t:[3,7,15]},
  {id:'surfaces',name:'All-surface',d:'Win {n} matches on every surface',k:'surfMin',t:[1,10,40]},
  {id:'venues',name:'Globetrotter',d:'Win at {n} different venues',k:'venuesWon',t:[3,6,8]},
  {id:'styles',name:'Tactician',d:'Beat every play style {n} times',k:'styleMin',t:[1,5,20]},
  {id:'pros',name:'Giant killer',d:'Beat {n} opponents rated 8 or higher',k:'proWins',t:[1,25,100]},
  {id:'titles',name:'Silverware',d:'Win {n} career titles',k:'titles',t:[1,10,40]},
  {id:'majors',name:'Major champion',d:'Win {n} majors',k:'majors',t:[1,4,10]},
  {id:'slam',name:'Career Grand Slam',d:'Win all four majors',k:'slam',t:[1]},
  {id:'daily',name:'Daily grind',d:'Complete {n} daily challenges',k:'dailies',t:[5,30,150]},
  {id:'mastery',name:'Master',d:'Reach mastery 10 with {n} players',k:'mast10',t:[1,5,20]},
  {id:'collector',name:'Full roster',d:'Unlock {n} players',k:'unlocked',t:[10,15,20]},
  {id:'learn',name:'Star pupil',d:'Finish every lesson',k:'lessons',t:[1]}];
const ACH_REW=[{xp:150,c:100},{xp:600,c:400},{xp:2000,c:1500}];
function lifeVal(k){const L=PROF.life;switch(k){
  case 'surfMin':return Math.min(...['hard','clay','grass'].map(s=>(L.surf||{})[s]||0));
  case 'venuesWon':return Object.keys(L.venues||{}).length;
  case 'styleMin':return Math.min(...['server','baseliner','allcourt','counter'].map(s=>(L.styles||{})[s]||0));
  case 'majors':return L.majors||0;
  case 'slam':return['Melbourne','Paris','London','New York'].every(m=>(L.majorSet||{})[m])?1:0;
  case 'mast10':return ROSTER.filter(r=>masteryOf(r.id)>=10).length;
  case 'unlocked':return unlockedCount();
  case 'lessons':return typeof LESSONS!=='undefined'&&LESSONS.every(l=>LEARN.done[l.id])?1:0;
  default:return L[k]||0}}
function achTier(a){const v=lifeVal(a.k);let t=0;while(t<a.t.length&&v>=a.t[t])t++;return t}

/* ---- daily challenges: three a day, picked from the date so they are the same all day ---- */
const DAILY_T=[
  {k:'perfect',n:[6,10,14],d:'Hit {n} perfect shots'},{k:'aces',n:[2,3,4],d:'Serve {n} aces'},{k:'winners',n:[6,10,15],d:'Hit {n} winners'},
  {k:'wins',n:[1,2,3],d:'Win {n} matches'},{k:'smashes',n:[1,2,3],d:'Land {n} smashes'},{k:'volleys',n:[3,6,9],d:'Land {n} volleys'},
  {k:'slices',n:[5,10,15],d:'Land {n} slices'},{k:'games',n:[10,16,24],d:'Win {n} games'},{k:'rally',n:[10,12,16],d:'Play a rally of {n} shots',max:1},
  {k:'surf:clay',n:[1],d:'Win a match on clay'},{k:'surf:grass',n:[1],d:'Win a match on grass'},{k:'surf:hard',n:[1],d:'Win a match on a hard court'},
  {k:'style:server',n:[1],d:'Beat a Big Server'},{k:'style:counter',n:[1],d:'Beat a Counterpuncher'},{k:'style:allcourt',n:[1],d:'Beat an All-Court player'},{k:'style:baseliner',n:[1],d:'Beat a Baseliner'}];
const DAILY_REW={xp:120,c:80},DAILY_ALL=150;
function todayKey(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function seeded(str){let h=2166136261;for(const ch of str){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);h^=h>>>16;return(h>>>0)/4294967296}}
function ensureDaily(){const k=todayKey();if(PROF.daily&&PROF.daily.day===k)return PROF.daily;
  const r=seeded('tg'+k),pool=DAILY_T.slice(),list=[],hard=Math.min(2,Math.floor(LV()/15));
  while(list.length<3){const i=Math.floor(r()*pool.length),t=pool.splice(i,1)[0];if(list.some(x=>x.k.split(':')[0]===t.k.split(':')[0]))continue;const n=t.n[Math.min(t.n.length-1,hard)];list.push({k:t.k,n,d:nText(t.d,n),p:0,done:false,max:!!t.max})}
  PROF.daily={day:k,list,bonus:false};storeProf();return PROF.daily}

/* ---- granting rewards ---- */
let LAST_REWARDS=null;
function grant(xp,coins,notes){const before=LV();PROF.xp+=Math.round(xp);PROF.coins+=Math.round(coins);const after=LV();
  for(let L=before+1;L<=after;L++){notes.push(['lvl','Level '+L+'!']);
    for(const r of ROSTER)if(CHAR_UNLOCK[r.id]===L)notes.push(['unlock','New player unlocked: '+r.name]);
    GEAR_REQ.forEach((q,i)=>{if(q===L&&i>0)notes.push(['unlock','Gear upgrade '+(i+1)+' now available in the locker room'])});
    for(const c of COS)if(c.lv===L)notes.push(['unlock','New '+(c.kind==='paint'?'racket paint':c.kind==='trail'?'ball trail':'victory dance')+': '+c.name])}}
function checkAch(notes){for(const a of ACH){const was=PROF.ach[a.id]||0,now=achTier(a);if(now>was){for(let t=was;t<now;t++){const R=a.t.length===1?{xp:1500,c:1000}:ACH_REW[t];
      notes.push(['ach','Achievement: '+a.name+(a.t.length>1?' '+['I','II','III'][t]:'')+' (+'+fmtN(R.xp)+' XP, +'+fmtN(R.c)+' coins)']);PROF.ach[a.id]=t+1;grant(R.xp,R.c,notes)}}}}
function lifeAdd(k,n){PROF.life[k]=(PROF.life[k]||0)+n}
/* called when a real match ends (not lessons, not retirements) */
function matchRewards(m){
  const notes=[],L=PROF.life,S=m.stat;
  const xp=Math.round((45+6*m.games+(m.won?70:0)+4*S.aces+2*S.winners+2*S.perfect+3*(S.smashes||0))*(0.7+0.06*m.skill)*(m.career?1.25:1)*(m.major?1.5:1));
  const coins=Math.round(xp*0.35)+(m.won?20:0);
  // lifetime stats
  lifeAdd('matches',1);if(m.won)lifeAdd('wins',1);for(const k of['aces','winners','perfect','smashes','volleys','slices'])lifeAdd(k,S[k]||0);
  L.rallyMax=Math.max(L.rallyMax||0,S.rallyMax||0);lifeAdd('bagels',m.bagels);lifeAdd('games',m.games);
  if(m.won&&m.lostFirst)lifeAdd('comebacks',1);
  L.streak=m.won?(L.streak||0)+1:0;L.bestStreak=Math.max(L.bestStreak||0,L.streak);
  if(m.won){L.surf=L.surf||{};L.surf[m.surf]=(L.surf[m.surf]||0)+1;L.venues=L.venues||{};L.venues[m.venue]=1;L.styles=L.styles||{};L.styles[m.style]=(L.styles[m.style]||0)+1;if(m.skill>=8)lifeAdd('proWins',1)}
  // mastery for the player you used
  const mb=masteryOf(m.meId);PROF.mastery[m.meId]=(PROF.mastery[m.meId]||0)+xp;const ma=masteryOf(m.meId);
  for(let l=mb+1;l<=ma;l++){notes.push(['mast',RBYID[m.meId].name+' mastery '+l+(l===10?': Master!':'')]);grant(l*40,l*75,notes)}
  grant(xp,coins,notes);
  // daily challenges
  const D=ensureDaily();
  for(const c of D.list){if(c.done)continue;const [k,arg]=c.k.split(':');let add=0;
    if(k==='surf')add=m.won&&m.surf===arg?1:0;else if(k==='style')add=m.won&&m.style===arg?1:0;else if(k==='wins')add=m.won?1:0;else if(k==='games')add=m.games;else if(k==='rally')add=0;else add=S[k]||0;
    if(c.max)c.p=Math.max(c.p,S.rallyMax||0);else c.p+=add;
    if(c.p>=c.n){c.done=true;lifeAdd('dailies',1);notes.push(['daily','Daily challenge done: '+c.d+' (+'+DAILY_REW.xp+' XP, +'+DAILY_REW.c+' coins)']);grant(DAILY_REW.xp,DAILY_REW.c,notes)}}
  if(!D.bonus&&D.list.every(c=>c.done)){D.bonus=true;const y=new Date(Date.now()-864e5),yk=y.getFullYear()+'-'+String(y.getMonth()+1).padStart(2,'0')+'-'+String(y.getDate()).padStart(2,'0');
    PROF.streak=PROF.lastFull===yk?PROF.streak+1:1;PROF.lastFull=D.day;const b=DAILY_ALL+50*Math.min(PROF.streak-1,6);notes.push(['daily','All three dailies done! +'+b+' coins'+(PROF.streak>1?' ('+PROF.streak+'-day streak)':'')]);grant(0,b,notes)}
  checkAch(notes);storeProf();
  LAST_REWARDS={xp,coins,notes};return LAST_REWARDS}
/* career milestones that land after the match result */
function careerMilestone(ev,champ){if(!champ)return;const notes=LAST_REWARDS?LAST_REWARDS.notes:[];lifeAdd('titles',1);
  if(ev.major){lifeAdd('majors',1);PROF.life.majorSet=PROF.life.majorSet||{};PROF.life.majorSet[ev.major]=1}
  checkAch(notes);storeProf()}
function lessonReward(){const notes=[];grant(100,50,notes);checkAch(notes);storeProf();return notes}

/* ---- the rewards panel on the result screen ---- */
function renderRewards(){const el=$('rRewards');const R=LAST_REWARDS;LAST_REWARDS=null;if(!R){el.hidden=true;return}
  const lv=levelOf(PROF.xp);el.hidden=false;
  el.innerHTML='<div class="row between"><strong class="lvl">Level '+lv.L+'</strong><span class="num">Match: +'+fmtN(R.xp)+' XP · +'+fmtN(R.coins)+' coins</span></div>'+
    '<div class="bar xpbar"><i style="width:'+(lv.need?Math.round(lv.into/lv.need*100):100)+'%"></i></div>'+
    '<p class="muted num" style="font-size:13px">'+(lv.need?fmtN(lv.need-lv.into)+' XP to level '+(lv.L+1):'Max level')+' · '+fmtN(PROF.coins)+' coins</p>'+
    (R.notes.length?'<ul class="notes">'+R.notes.map(([t,s])=>'<li class="n-'+t+'">'+esc(s)+'</li>').join('')+'</ul>':'')}

/* ================= locker room ================= */
let lockerTab='daily',lockerBack=null;
function openLocker(back){lockerBack=back||lockerBack||(()=>renderTitle());renderLocker();show('locker')}
function renderLocker(){
  const lv=levelOf(PROF.xp),D=ensureDaily();
  const nextChar=ROSTER.filter(r=>!charUnlocked(r.id)).sort((a,b)=>charUnlockLv(a.id)-charUnlockLv(b.id))[0];
  $('lkHead').innerHTML='<div class="row between"><h2 style="font-size:34px">Level '+lv.L+'</h2><span class="chip num coin">'+fmtN(PROF.coins)+' coins</span></div>'+
    '<div class="bar xpbar"><i style="width:'+(lv.need?Math.round(lv.into/lv.need*100):100)+'%"></i></div>'+
    '<p class="muted num" style="font-size:13px">'+(lv.need?fmtN(lv.into)+' / '+fmtN(lv.need)+' XP':'Max level')+(nextChar?' · Next player: '+esc(nextChar.name)+' at level '+charUnlockLv(nextChar.id):' · Every player unlocked')+'</p>';
  document.querySelectorAll('#lkTabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.t===lockerTab)));
  const B=$('lkBody');let h='';
  if(lockerTab==='daily'){
    h+='<p class="muted" style="font-size:14px">New challenges every day. Each pays '+DAILY_REW.xp+' XP and '+DAILY_REW.c+' coins; finish all three for '+DAILY_ALL+' more, plus 50 for every day of your streak.'+(PROF.streak>1?' Current streak: '+PROF.streak+' days.':'')+'</p>';
    h+=D.list.map(c=>'<div class="lk-item'+(c.done?' done':'')+'"><div style="min-width:0;flex:1"><strong>'+esc(c.d)+'</strong><div class="bar"><i style="width:'+Math.min(100,Math.round(c.p/c.n*100))+'%"></i></div></div><span class="chip num">'+(c.done?'Done':Math.min(c.p,c.n)+' / '+c.n)+'</span></div>').join('');}
  else if(lockerTab==='gear'){
    h+='<p class="muted" style="font-size:14px">Each upgrade adds '+GEAR_STEP+' to one stat, up to +1.5, which can take a stat past 10. Gear counts in quick matches and your career.</p>';
    h+=GEAR.map(g=>{const n=gearLv(g.id),nx=n+1,st=STATS.find(s=>s[0]===g.stat)[1];let btn;
      if(n>=10)btn='<button disabled>Maxed</button>';else if(LV()<GEAR_REQ[nx-1])btn='<button disabled>Level '+GEAR_REQ[nx-1]+'</button>';
      else btn='<button data-g="'+g.id+'" '+(PROF.coins<gearCost(nx)?'disabled':'class="go"')+'>Upgrade · '+fmtN(gearCost(nx))+' coins</button>';
      return'<div class="lk-item"><div style="min-width:0;flex:1"><p class="eyebrow">'+g.name+' · '+st+' +'+(n*GEAR_STEP).toFixed(2)+'</p><strong>'+esc(gearName(g))+'</strong><div class="pips">'+Array.from({length:10},(_,i)=>'<i class="'+(i<n?'on':'')+'"></i>').join('')+'</div></div>'+btn+'</div>'}).join('');}
  else if(lockerTab==='players'){
    h+='<p class="muted" style="font-size:14px">New players unlock as you level up. Playing a player raises their mastery (10 levels), which pays out coins and XP.</p><div class="lk-grid">'+
      ROSTER.map(r=>{const ok=charUnlocked(r.id),m=masteryOf(r.id),st=OSTYLE[styleOfChar(r)].name;
        return'<div class="lk-p'+(ok?'':' locked')+'"><strong>'+esc(r.name)+'</strong><small>'+st+'</small>'+(ok?'<div class="pips sm">'+Array.from({length:10},(_,i)=>'<i class="'+(i<m?'on':'')+'"></i>').join('')+'</div><small>Mastery '+m+'</small>':'<small>Unlocks at level '+charUnlockLv(r.id)+'</small>')+'</div>'}).join('')+'</div>';}
  else if(lockerTab==='style'){
    for(const [kind,title] of[['paint','Racket paint'],['trail','Ball trail'],['dance','Victory dance']]){
      h+='<h3 style="margin-top:6px">'+title+'</h3><div class="lk-grid">'+COS.filter(c=>c.kind===kind).map(c=>{const own=cosOwned(c),on=PROF.cos[kind]===c.id;
        const sw=c.col!=null?'<span class="sw" style="background:'+hex(c.col)+'"></span>':kind==='trail'?'<span class="sw" style="background:linear-gradient(90deg,#fff,#FFD23F,#FF7A3D)"></span>':'';
        const btn=on?'<button disabled>Equipped</button>':own?'<button data-eq="'+c.id+'">Use</button>':c.cost?'<button data-buy="'+c.id+'" '+(PROF.coins<c.cost?'disabled':'')+'>Buy · '+fmtN(c.cost)+' coins</button>':'<button disabled>'+esc(cosHow(c))+'</button>';
        return'<div class="lk-p'+(own?'':' locked')+'">'+sw+'<strong>'+esc(c.name)+'</strong>'+btn+'</div>'}).join('')+'</div>'}}
  else{
    const tot=ACH.reduce((a,x)=>a+x.t.length,0),got=ACH.reduce((a,x)=>a+(PROF.ach[x.id]||0),0);
    h+='<p class="muted num" style="font-size:14px">'+got+' of '+tot+' tiers earned.</p>';
    h+=ACH.map(a=>{const t=PROF.ach[a.id]||0,next=a.t[Math.min(t,a.t.length-1)],v=lifeVal(a.k),done=t>=a.t.length;
      return'<div class="lk-item'+(done?' done':'')+'"><div style="min-width:0;flex:1"><p class="eyebrow">'+(a.t.length>1?'Tier '+Math.min(t+1,a.t.length)+' of '+a.t.length:'One-off')+'</p><strong>'+esc(a.name)+'</strong><small class="muted" style="display:block">'+esc(nText(a.d,next))+'</small><div class="bar"><i style="width:'+(done?100:Math.min(100,Math.round(v/next*100)))+'%"></i></div></div><span class="chip num">'+(done?'Done':fmtN(Math.min(v,next))+' / '+fmtN(next))+'</span></div>'}).join('')}
  B.innerHTML=h;
  B.querySelectorAll('button[data-g]').forEach(b=>b.onclick=()=>{if(buyGear(b.dataset.g))renderLocker()});
  B.querySelectorAll('button[data-eq]').forEach(b=>b.onclick=()=>{const c=COS.find(x=>x.id===b.dataset.eq);PROF.cos[c.kind]=c.id;storeProf();renderLocker()});
  B.querySelectorAll('button[data-buy]').forEach(b=>b.onclick=()=>{const c=COS.find(x=>x.id===b.dataset.buy);if(PROF.coins>=c.cost){PROF.coins-=c.cost;PROF.cos.own[c.id]=1;PROF.cos[c.kind]=c.id;storeProf();renderLocker()}})}
document.querySelectorAll('#lkTabs button').forEach(b=>b.onclick=()=>{lockerTab=b.dataset.t;renderLocker()});
$('lkBack').onclick=()=>{const f=lockerBack;lockerBack=null;(f||renderTitle)()};
$('btnLocker').onclick=()=>openLocker(()=>renderTitle());
function lockerCardState(){const lv=levelOf(PROF.xp),D=ensureDaily(),left=D.list.filter(c=>!c.done).length;
  $('lockerSub').textContent='Level '+lv.L+' · '+fmtN(PROF.coins)+' coins · '+(left?left+' daily challenge'+(left>1?'s':'')+' left today':'Dailies done for today')}
/* cosmetics in the match */
function applyCosmetics(){const p=cosOf('paint');if(P[0]&&P[0].racket&&P[0].racket.userData.frame)P[0].racket.userData.frame.color.setHex(p.col)}
function myTrailColor(){const t=cosOf('trail');return t&&t.col!=null?t.col:null}
function myDance(){const d=cosOf('dance');return d?d.clip:'samba'}
