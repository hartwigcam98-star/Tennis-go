/* ================= career depth: schedule, fatigue, sims, aging, rivals, Tour Finals =================
   Schedule: each week you pick the big event, a smaller one, or a week off to rest and train.
   Fatigue: a long match leaves you tired for the next round; a night's sleep takes some of it away (more with
   higher stamina), a new week more, and a rest week all of it.
   Sim: let your ratings play a round for you (less training XP than playing it).
   Aging: from 30, speed and stamina slip each year; experience adds a little control.
   Rivals: a player who beats you in a semifinal or final, or twice anywhere, becomes a rival. Rivals' level and
   ranking follow yours, so they stay a threat all career.
   Tour Finals: the top 8 at the end of a pro season play two groups of four, then semifinals and a final. */

/* ---- your level on the opponent skill scale (used by sims and to size rivals) ---- */
function careerStats(){return withAge(withGear(save.stats))}
function myRating(){const s=careerStats();return (s.power+s.control+s.speed+s.serve)/4*0.85+(s.stamina||5)*0.05+0.05+perkLevel()*0.1}

/* ---- aging ---- */
function ageMods(age){const a=age==null?save.age:age,m={};const y=Math.max(0,a-29);
  if(y){m.speed=-0.3*y;m.stamina=-0.25*y;if(a>31)m.power=-0.12*(a-31)}
  if(a>=26)m.control=Math.min(0.5,0.1*(a-25));
  for(const k in m)m[k]=Math.round(m[k]*100)/100;return m}
function withAge(st){const m=ageMods(),o={};for(const k in st)o[k]=Math.max(1,st[k]+(m[k]||0));return o}
function ageText(){const m=ageMods(),L={speed:'Speed',stamina:'Stamina',power:'Power',control:'Control'},parts=[];
  for(const k of ['speed','stamina','power','control'])if(m[k])parts.push(L[k]+' '+(m[k]>0?'+':'−')+Math.abs(m[k]).toFixed(1));
  return parts.length?parts.join(' · '):''}

/* ---- fatigue ---- */
function fitness(){return 1-(save.fat||0)}
function sleepOff(){const st=withAge(save.stats).stamina||5;save.fat=(save.fat||0)*clamp(0.62-st*0.035,0.22,0.6)}
function weekOff(){save.fat=(save.fat||0)*0.45}
function fitChip(){const f=Math.round(fitness()*100),c=f>=90?'var(--win)':f>=75?'#F5A524':'var(--loss)';
  return'<span class="chip num" title="Energy you start the next match with"><span class="dot" style="background:'+c+'"></span>Fitness '+f+'%</span>'}
/* set after each career match: how tired you finished */
let LAST_LOAD=null;
function matchLoad(){return M&&M.cap?clamp(1-M.cap[0],0,0.55):null}

/* ---- the weekly choice ---- */
function pickOf(wk){const p=save.pick;return p&&p.wk===wk&&p.season===save.season&&p.stage===save.stage?p.k:'main'}
function weekOptions(wk){const W=weeks()[wk],E=entry(wk),o=[{k:'main',E}];
  if(E.how!=='alt'){const alt=save.stage==='pro'?proAlt(wk):W.alt||null;if(alt)o.push({k:'alt',E:{ev:alt,how:'pick',qual:0}})}
  o.push({k:'rest'});return o}
function chosenEntry(wk){const k=pickOf(wk),o=weekOptions(wk).find(x=>x.k===k)||weekOptions(wk)[0];return o.k==='rest'?null:o.E}
function restXP(){return Math.round(({junior:15,college:20,pro:25}[save.stage]||20)*xpMult())}
function pickerHtml(wk){const o=weekOptions(wk),k=pickOf(wk);
  const lab=x=>x.k==='rest'?['Rest and train','+'+restXP()+' training pts · fitness back to 100%']:
    [x.E.ev.n,x.E.ev.tier+' · '+x.E.ev.pts+' pts'+(save.stage==='pro'&&PRIZE[x.E.ev.tier]?' · '+money(PRIZE[x.E.ev.tier]):'')+(x.E.how==='qual'?' · qualifying':'')];
  return'<p class="eyebrow">This week</p><div class="wkpick">'+o.map(x=>{const [a,b]=lab(x);return'<button class="pc" data-pick="'+x.k+'" aria-pressed="'+(x.k===k)+'"><strong>'+esc(a)+'</strong><small class="muted">'+esc(b)+'</small></button>'}).join('')+'</div>'}
function wirePicker(wk){document.querySelectorAll('#nextCard [data-pick]').forEach(b=>b.onclick=()=>{save.pick={wk,season:save.season,stage:save.stage,k:b.dataset.pick};store();renderHub()})}
function restWeek(){const xp=restXP();save.xp+=xp;save.fat=0;
  save.history.push({stage:save.stage,season:save.season,wk:save.week,name:'Rest week',res:'Rest',champ:false});save.week++;save.pick=null;store();
  seasonScreen('Week '+save.week+' · '+stageName(),'A week off','You skip the event, train and recover. +'+xp+' training points, and you are back to full fitness.',[['Back to hub','go',()=>renderHub()]])}

/* ---- sim a match ---- */
let SIMMED=false;
function simWinP(oppSkill,bo){const p=1/(1+Math.exp(-(myRating()-(save.fat||0)*2-oppSkill)*1.1));return bo===3?p*p*(3-2*p):p}
function simScore(won,f){const sets=setScore(f,true);return sets.map(s=>won?s[0]+'–'+s[1]:s[1]+'–'+s[0]).join(', ')}
function simLoad(sets){const st=withAge(save.stats).stamina||5;return clamp((save.fat||0)+sets*0.08*(1.25-st*0.06),0,0.55)}
function simNow(){if(!save)return;clearLive();const F=finalsMode();
  let opp,f;if(F){F.next=finOppId(F);opp=F.P[F.next];f={bo:3,g:6}}else{if(!save.cur)return;if(!save.cur.opp)makeOpp();opp=save.cur.opp;f=fmt(save.stage,save.cur.ev)}
  const won=Math.random()<simWinP(opp.skill,f.bo),score=simScore(won,f);LAST_LOAD=simLoad(score.split(', ').length);LAST_REWARDS=null;LAST_MS=null;SIMMED=true;
  careerResult(won,score,{aces:'–',winners:'–',perfect:'–'});SIMMED=false}

/* ---- rivals ---- */
const STYLE_RIVAL={server:0,allcourt:2,baseliner:1,counter:1};
function rvName(rv){return rv.fid?rv.name:RBYID[rv.id].name}
function rvChar(rv){return rv.fid?rv.base:rv.id}
function rvStyle(rv){return rv.fid?rv.style:styleOfChar(RBYID[rv.id])}
/* rivals grow with you: about your level, the Ice-cold type a touch above, the Showman a touch below */
function rivalSkill(rv,ev){return Math.round(clamp(myRating()+(rv.edge-0.9)*0.8+0.35,ev.sk[0],ev.sk[1]+0.8)*10)/10}
function rivalPts(stage,rv){return roll(stage)+(rv.edge-0.9)*RANK_SCALE[stage].K*0.35}
function h2hNote(fid,won){save.h2h=save.h2h||{};const h=save.h2h[fid]=save.h2h[fid]||{w:0,l:0};if(won)h.w++;else h.l++;return h}
/* after a loss: does this player become a rival? */
function maybeNewRival(o,c,lines){if(!o.fid||o.rival!=null)return null;const h=save.h2h[o.fid];if(!h)return null;
  // a semifinal or final, or the second loss to the same player; at most one new rival a season
  const late=c.round>c.qual&&c.total-c.round<=1;if(!(late||h.l===2))return null;
  if(save.rivals.some(r=>r.fid===o.fid))return null;
  const sk=save.stage+save.season;if(save.rivalSeason===sk)return null;
  const n=save.history.length;let slot=-1,best=1e9;
  save.rivals.forEach((r,i)=>{const fresh=r.since!=null&&n-r.since<15;const sc=(r.w+r.l)+(fresh?100:0)+(r.fid?0:-0.5);if(sc<best){best=sc;slot=i}});
  if(slot<0||best>=100)return null;
  const old=rvName(save.rivals[slot]);
  save.rivals[slot]={fid:o.fid,id:o.id,base:o.id,name:o.name,v:o.v||null,nat:o.nat||'',style:o.style||'baseliner',edge:clamp(0.9+(o.skill-myRating())*0.2,0.6,1.3),type:STYLE_RIVAL[o.style]!=null?STYLE_RIVAL[o.style]:1,w:h.w,l:h.l,last:'l',since:n};
  save.rivalSeason=sk;lines.push(['New rival',o.name]);return{name:o.name,old}}

/* ---- Tour Finals ---- */
const FIN_EV=EV('Tour Finals','Finals','hard',3,[7.5,9.3],0);
const FIN_PTS={rr:200,sf:400,f:500},FIN_PAY={base:300000,rr:400000,sf:1100000,f:2200000};
const RR_DAYS=[[[0,1],[2,3]],[[0,2],[1,3]],[[0,3],[1,2]]];
function finalsState(){if(save.stage!=='pro')return null;const F=save.finals;if(F&&F.season===save.season)return F;
  const L=rankingList('pro').slice(0,8),pool=fieldFor('pro'),byId={};for(const p of pool)byId[p.id]=p;
  const P={};L.forEach((e,i)=>{let p;if(e.me)p={id:'me',name:e.name,me:true,skill:0};
    else if(e.rival!=null){const rv=save.rivals[e.rival];p={id:e.id,name:rvName(rv),base:rvChar(rv),v:rv.v||null,nat:'RIV',style:rvStyle(rv),skill:rivalSkill(rv,FIN_EV),rival:e.rival}}
    else{const q=byId[e.id];p=Object.assign({},q)}p.rank=e.rank;p.seed=i+1;P[p.id]=p});
  const ids=L.map(e=>e.me?'me':e.id),A=[ids[0],ids[3],ids[4],ids[7]],B=[ids[1],ids[2],ids[5],ids[6]];
  const F2={season:save.season,P,groups:[A,B],rr:[[],[],[]],day:0,phase:'rr',sf:null,fin:null,done:false,res:[],in:ids.includes('me')};
  if(F2.in){const g=A.includes('me')?A:B;g.splice(g.indexOf('me'),1);g.unshift('me');F2.next=g[1]}
  save.finals=F2;if(!F2.in){finalsSimAll(F2);finBank(F2)}store();return F2}
function finalsMode(){if(!save||save.stage!=='pro'||save.week<weeks().length)return null;const F=finalsState();return F&&F.in&&!F.done?F:null}
function finPair(F,a,b,meWon,meScore){const f={bo:3,g:6};
  if(a==='me'||b==='me'){const o=a==='me'?b:a;return{a,b,w:meWon?'me':o,score:meScore}}
  const A=F.P[a],B=F.P[b],p=1/(1+Math.exp(-(A.skill-B.skill)*1.25)),aw=Math.random()<p,r={a,b,w:aw?a:b,score:simScore(true,f)};statSim(A,B,r.w,r.score);return r}
function finTable(F,g){const G=F.groups[g],t={};G.forEach(id=>t[id]={id,w:0,l:0,sw:0,sl:0});
  for(const day of F.rr)for(const m of day){if(!t[m.a]||!t[m.b])continue;const W=t[m.w],Lr=t[m.w===m.a?m.b:m.a];W.w++;Lr.l++;
    const sets=m.score.split(', ').map(s=>s.split('–').map(Number));let x=0,y=0;for(const [p,q] of sets){if(p>q)x++;else y++}
    W.sw+=Math.max(x,y);W.sl+=Math.min(x,y);Lr.sw+=Math.min(x,y);Lr.sl+=Math.max(x,y)}
  return Object.values(t).sort((a,b)=>b.w-a.w||(b.sw-b.sl)-(a.sw-a.sl)||(F.P[b.id].me?1:0)-(F.P[a.id].me?1:0)||F.P[b.id].skill-F.P[a.id].skill)}
/* play out a group day: your match (if any) is passed in, the rest are simulated */
function finDay(F,meWon,meScore){const d=F.day;
  for(let g=0;g<2;g++){const G=F.groups[g];for(const [i,j] of RR_DAYS[d]){const a=G[i],b=G[j];if(a==='me'||b==='me')F.rr[d].push(finPair(F,a,b,meWon,meScore));else F.rr[d].push(finPair(F,a,b))}}
  F.day++}
function finSemis(F){const A=finTable(F,0),B=finTable(F,1);F.sf=[[A[0].id,B[1].id],[B[0].id,A[1].id]];F.phase='sf'}
function finalsSimAll(F){while(F.day<3)finDay(F,false,'');if(!F.sf)finSemis(F);
  if(!F.sfRes)F.sfRes=F.sf.map(([a,b])=>finPair(F,a,b));if(!F.fin)F.fin=[F.sfRes[0].w,F.sfRes[1].w];if(!F.finRes)F.finRes=finPair(F,F.fin[0],F.fin[1]);F.phase='done';F.done=true;F.champ=F.finRes.w}
/* field players bank their Tour Finals wins like you do */
function finBank(F){if(F.banked)return;const byId={};for(const p of fieldFor('pro'))byId[p.id]=p;
  const add=(m,pts)=>{const p=byId[m.w];if(p)p.cur=(p.cur||0)+pts};F.rr.flat().forEach(m=>add(m,FIN_PTS.rr));(F.sfRes||[]).forEach(m=>add(m,FIN_PTS.sf));if(F.finRes)add(F.finRes,FIN_PTS.f);
  F.banked=true;save.fieldV=(save.fieldV||0)+1}
function finalsNote(F){if(!F||!F.done)return'';const c=F.P[F.champ];return c&&c.me?'You won the Tour Finals.':'Tour Finals: '+(c?c.name:'?')+' won the title'+(F.in?'.':', and you finished outside the top 8 who qualify.')}
function finRoundName(F){return F.phase==='rr'?'Group stage · match '+(F.day+1)+' of 3':F.phase==='sf'?'Semifinal':'Final'}
function finOppId(F){if(F.phase==='rr'){const G=F.groups.find(g=>g.includes('me'));return G[F.day+1]}
  if(F.phase==='sf'){const s=F.sf.find(p=>p.includes('me'));return s?s[0]==='me'?s[1]:s[0]:null}
  if(F.phase==='f')return F.fin[0]==='me'?F.fin[1]:F.fin[0];return null}
function finalsOpp(F){const p=F.P[finOppId(F)];const o=oppFrom(p,1,p.rival!=null?pick(RIVAL_TYPES[save.rivals[p.rival].type].lines):null);o.seed=p.seed;o.rk=p.rank;F.next=p.id;return o}
function playFinals(){const F=finalsMode();if(!F)return;{const L=liveFor('career');if(L){resumeLive(L);return}}
  const o=finalsOpp(F);store();
  startMatch({mode:'career',ev:FIN_EV,stage:'pro',surf:'hard',bo:3,g:6,stats:careerStats(),meId:save.char,me:RBYID[save.char].name,opp:o,style:save.style,perks:perkLevel(),
    fat:save.fat||0,ofat:F.phase==='rr'?0.04*F.day:0.1,label:'Tour Finals · '+finRoundName(F),intro:o.line?o.name+': “'+o.line+'”':'Tour Finals. The best eight players of the season.',onEnd:careerResult})}
function finalsResult(won,score,st){const F=finalsMode(),lines=[],xp=Math.round((won?60:20)*(SIMMED?0.6:1));let text,champ=false,out=false;
  const opp=F.P[F.next],stageKey='pro';statMine(opp,won,score,lines,'Tour Finals',finRoundName(F));
  if(won)save.careerW++;else save.careerL++;
  if(opp.rival!=null){const rv=save.rivals[opp.rival];if(won)rv.w++;else rv.l++;rv.last=won?'w':'l'}
  let pts=0,pay=0;
  if(F.phase==='rr'){finDay(F,won,score);if(won){pts+=FIN_PTS.rr;pay+=FIN_PAY.rr}
    if(F.day<3)text=won?'A group win. '+(3-F.day)+' to go.':'A group loss. Still alive.';
    else{finSemis(F);const inSF=F.sf.some(p=>p.includes('me'));if(inSF)text=(won?'Group won':'Through')+' — into the semifinals.';else{out=true;text='Out in the group stage.'}}
    if(F.day===1){pay+=FIN_PAY.base}}
  else if(F.phase==='sf'){F.sfRes=F.sf.map(([a,b])=>finPair(F,a,b,won,score));if(won){pts+=FIN_PTS.sf;pay+=FIN_PAY.sf;F.fin=[F.sfRes[0].w,F.sfRes[1].w];F.phase='f';text='Into the Tour Finals final.'}else{out=true;text='Beaten in the semifinals.'}}
  else{F.finRes=finPair(F,F.fin[0],F.fin[1],won,score);if(won){pts+=FIN_PTS.f;pay+=FIN_PAY.f;champ=true;text='Tour Finals champion! The best player of the season.'}else{out=true;text='Runner-up at the Tour Finals.'}F.phase='done'}
  if(out)finalsSimAll(F);
  if(champ||out){F.done=true;F.champ=F.champ||(champ?'me':F.finRes&&F.finRes.w);
    if(!champ&&F.champ&&F.P[F.champ])stTitle(F.P[F.champ]);
    if(champ){myLine().t++;save.titles.push('Tour Finals '+save.season);save.rec.titles++;save.rec.finals=(save.rec.finals||0)+1;careerMilestone(FIN_EV,true)}
    const res=champ?'W':F.phase==='done'&&!champ&&F.fin&&F.fin.includes('me')?'F':F.sfRes&&F.sf.some(p=>p.includes('me'))?'SF':'RR';
    save.history.push({stage:stageKey,season:save.season,wk:weeks().length,name:'Tour Finals',res,champ});
    const r=proRank();save.rec.best=Math.min(save.rec.best,r)}
  if(F.done)finBank(F);
  save.pts.pro.cur+=pts;if(pts)lines.push(['Points','+'+pts]);
  if(pay){save.money+=pay;save.earnings+=pay;lines.push(['Prize money',money(pay)])}
  save.xp+=xp;lines.unshift(['Training pts','+'+xp]);
  save.fat=LAST_LOAD!=null?LAST_LOAD:save.fat;LAST_LOAD=null;sleepOff();
  if(F.done)checkSponsors(lines);
  store();showResult(won,score,st,(SIMMED?'Simulated. ':'')+text,lines,'Back to hub',()=>renderHub(),champ)}
function finalsCard(){const F=finalsMode(),me=F.P.me;
  const tbl=g=>{const t=finTable(F,g);return'<table class="ftab"><tr><th>Group '+(g?'B':'A')+'</th><th>W–L</th><th>Sets</th></tr>'+t.map((r,i)=>{const p=F.P[r.id];return'<tr class="'+(p.me?'me':'')+(i<2&&F.day===3?' q':'')+'"><td><small class="seed">'+p.seed+'</small>'+esc(p.name)+' <small class="nat">'+(p.me?'You':p.rival!=null?'Rival':p.nat||'')+'</small></td><td class="num">'+r.w+'–'+r.l+'</td><td class="num">'+r.sw+'–'+r.sl+'</td></tr>'}).join('')+'</table>'};
  const oid=finOppId(F),o=F.P[oid];
  const ko=F.sf?'<p class="muted" style="font-size:14px">Semifinals: '+F.sf.map(([a,b])=>esc(F.P[a].name)+' v '+esc(F.P[b].name)).join(' · ')+(F.fin?'<br>Final: '+esc(F.P[F.fin[0]].name)+' v '+esc(F.P[F.fin[1]].name):'')+'</p>':'';
  return'<p class="eyebrow">Season finale · Top 8 only</p><h3 style="font-size:26px">Tour Finals</h3>'+
    '<div class="row"><span class="chip"><span class="dot s-hard"></span>Indoor hard</span><span class="chip">Best of 3 sets</span><span class="chip num">You are seed '+me.seed+'</span>'+fitChip()+'</div>'+
    '<p class="note">Two groups of four. Everyone plays everyone in their group, the top two go through to the semifinals. Each group win is worth '+FIN_PTS.rr+' points.</p>'+
    tbl(0)+tbl(1)+ko+
    '<div class="opp"><p class="eyebrow">'+finRoundName(F)+(o.rival!=null?' · Rival':'')+'</p><p style="font-weight:600;font-size:18px"><small class="seed">'+o.seed+'</small>'+esc(o.name)+' <small class="nat">#'+o.rank+'</small></p><p class="muted" style="font-size:14px">'+OSTYLE[o.style||'baseliner'].name+' · Rating '+o.skill.toFixed(1)+'</p></div>'+
    '<div class="row"><button class="go" id="btnPlay" style="flex:1">Play '+(F.phase==='rr'?'group match':F.phase==='sf'?'semifinal':'final')+'</button><button class="ghost" id="btnSim">Sim</button></div>'}
