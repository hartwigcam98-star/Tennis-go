/* ================= walkouts: the TV-style entrance before big matches =================
   Majors, the Tour Finals, finals of any event, the late rounds of the bigger events and rival matches open like a
   broadcast: each player walks out of their own tunnel with the camera leading them and a caption with a few facts,
   the announcer calls their name, then a "tale of the tape" puts the two side by side before the first serve.
   Tap to skip ahead. */
const WALK={on:false,t:0,phase:'',who:-1,legs:null,cam:null,timers:[]};
const NAT_NAME={USA:'the United States',GBR:'Great Britain',ESP:'Spain',FRA:'France',ITA:'Italy',GER:'Germany',AUS:'Australia',ARG:'Argentina',CAN:'Canada',JPN:'Japan',BRA:'Brazil',
  SRB:'Serbia',CRO:'Croatia',NED:'the Netherlands',SWE:'Sweden',NOR:'Norway',CZE:'the Czech Republic',POL:'Poland',RSA:'South Africa',MEX:'Mexico',KOR:'Korea',CHN:'China',IND:'India',
  CHI:'Chile',BEL:'Belgium',SUI:'Switzerland',AUT:'Austria',POR:'Portugal',GRE:'Greece',DEN:'Denmark',NGR:'Nigeria',KAZ:'Kazakhstan'};
/* is this career match big enough for the full entrance? */
function walkoutWanted(ev,round,total,qual,opp){if(!ev||round<=qual)return false;const left=total-round;
  if(['Major','Finals','Junior major'].includes(ev.tier))return true;
  if(left===0)return true;                                              // any final
  if(['Masters','Tour 500','National','Conference'].includes(ev.tier)||/NCAA/.test(ev.n||''))return left<=2;   // quarterfinals on
  return!!(opp&&opp.rival!=null&&left<=2)}
function hashStr(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
/* a few made-up but stable facts for generated players: age by level, and height */
function factAge(key,stage){const [a,b]={junior:[15,18],college:[18,22],pro:[19,33]}[stage]||[19,30];return a+hashStr(key+'age')%(b-a+1)}
function factHeight(key){return 172+hashStr(key+'ht')%26}
function fmtHeight(cm){const inch=Math.round(cm/2.54);return Math.floor(inch/12)+'′'+(inch%12)+'″ ('+cm+' cm)'}
/* both players' tale-of-the-tape facts */
function walkFacts(){const c=M.cfg,o=c.opp,stage=c.stage||save.stage,line=stOf(o,stage)||stLine(),mine=myTotal(stage),okey=o.fid||o.id||o.name;
  const key=stKey(o),h=(save.log||[]).filter(x=>x.k===key).reduce((a,x)=>(a[x.w?0:1]++,a),[0,0]);
  const STY=STYLES.find(s=>s.id===c.style);
  return{label:RANK_SCALE[stage].label,stage,h2h:h,
    me:{name:c.me,nat:save.nat||'',rank:myRankIn(stage),seed:null,age:save.age,ht:save.height||factHeight((save.char||'')+c.me),plays:c.meLefty?'Left-handed':'Right-handed',style:STY?STY.name:'',rating:myRating(),w:mine.w,l:mine.l,t:mine.t,ace:mine.ace},
    op:{name:o.name,nat:o.nat||'',rank:o.rk||null,seed:o.seed||null,age:factAge(okey,stage),ht:factHeight(okey),plays:o.lefty?'Left-handed':'Right-handed',style:(OSTYLE[o.style]||{}).name||'',rating:o.skill,w:line.w,l:line.l,t:line.t,ace:line.ace,rival:o.rival!=null}}}
function stageWord(st){return{junior:'Junior',college:'College',pro:'Tour'}[st]}
function announce(F,i){const p=i?F.op:F.me,nat=NAT_NAME[p.nat];
  return(i?'Please welcome to the court, ':'And now, ')+(p.rank?'ranked number '+p.rank+(F.stage==='pro'?' in the world':'')+', ':'')+(nat?'from '+nat+', ':'')+p.name+'!'}
function walkCaption(F,i){const p=i?F.op:F.me,el=$('walkCard');
  el.innerHTML='<p class="eyebrow">'+(p.rank?F.label+' #'+p.rank:'Unranked')+(p.seed?' · '+p.seed+' seed':'')+(i&&p.rival?' · Rival':'')+(i?'':' · You')+'</p>'+
    '<h2>'+esc(p.name)+(p.nat?' <small>'+esc(p.nat)+'</small>':'')+'</h2>'+
    '<p>Age '+p.age+' · '+fmtHeight(p.ht).split(' (')[0]+' · '+p.plays+(p.style?' · '+p.style:'')+'</p>'+
    '<p class="wk-stats">'+(p.w+p.l?'<b>'+p.w+'–'+p.l+'</b> '+stageWord(F.stage)+' record'+(p.t?' · <b>'+p.t+'</b> title'+(p.t===1?'':'s'):'')+(p.ace?' · <b>'+p.ace+'</b> aces':''):'First '+stageWord(F.stage).toLowerCase()+' match on record')+'</p>';
  el.hidden=false;el.classList.remove('in');void el.offsetWidth;el.classList.add('in')}
function tapeHtml(F){const A=F.me,B=F.op,r=(k,a,b,cmp)=>{const better=cmp==null?-1:cmp>0?0:cmp<0?1:-1;
    return'<div class="tp-row"><b class="'+(better===0?'up':'')+'">'+a+'</b><span>'+k+'</span><b class="'+(better===1?'up':'')+'">'+b+'</b></div>'};
  const h=F.h2h,h2=h[0]+h[1]?(h[0]>h[1]?'You lead '+h[0]+'–'+h[1]:h[1]>h[0]?B.name.split(' ').pop()+' leads '+h[1]+'–'+h[0]:'Level at '+h[0]+'–'+h[1]):'First meeting';
  return'<p class="eyebrow">'+esc(M.cfg.label||'')+'</p><h3>Tale of the tape</h3>'+
    '<div class="tp-head"><span>'+esc(A.name)+'<small>'+esc(A.nat||'You')+'</small></span><i>vs</i><span>'+esc(B.name)+'<small>'+esc(B.nat||'')+'</small></span></div>'+
    r(F.label+' rank',A.rank?'#'+A.rank:'–',B.rank?'#'+B.rank:'–',A.rank&&B.rank?B.rank-A.rank:null)+
    r('Age',A.age,B.age)+r('Height',fmtHeight(A.ht).split(' (')[0],fmtHeight(B.ht).split(' (')[0])+r('Plays',A.plays.split('-')[0],B.plays.split('-')[0])+r('Style',A.style,B.style)+
    r('Rating',A.rating.toFixed(1),B.rating.toFixed(1),A.rating-B.rating)+r('Record',A.w+'–'+A.l,B.w+'–'+B.l,(A.w/Math.max(1,A.w+A.l))-(B.w/Math.max(1,B.w+B.l)))+
    r('Titles',A.t,B.t,A.t-B.t)+r('Aces',A.ace,B.ace,A.ace-B.ace)+
    '<p class="tp-h2h">Head to head · <b>'+h2+'</b></p><small>Tap to play</small>'}
/* where the tunnels are (set by the court builder) and the path from each one to the baseline */
function walkLegs(i){const T0=(W3.tunnels||{})[i?'op':'me']||{x:i?-9:9,z:i?-7:7,nx:i?1:-1,nz:0},end=toW(i?-0.3:0.3,i?1.08:-0.05);
  return[{x:T0.x-T0.nx*1.5,z:T0.z-T0.nz*1.5},{x:T0.x+T0.nx*1.6,z:T0.z+T0.nz*1.6},{x:end.x,z:end.z}]}
function startWalkout(){const F=walkFacts();WALK.on=true;WALK.t=0;WALK.F=F;WALK.cam=null;M.state='walkout';M.lock=true;
  document.querySelector('#match .hud.top').style.visibility='hidden';document.querySelector('#match .hud.bot').style.visibility='hidden';
  $('walk').hidden=false;$('walkSkip').hidden=false;$('tape').hidden=true;$('walkCard').hidden=true;W3.ball.visible=W3.bshadow.visible=false;
  for(const i of [0,1]){const L=walkLegs(i);P[i].pos.set(L[0].x,0,L[0].z);P[i].yaw=i?0:Math.PI;P[i].yawOff=0;P[i].runW=0;M.mv[i]={x:L[0].x,z:L[0].z,v:0,vz:0}}
  P[0].stroll=P[1].stroll=true;WALK.walker=[null,null];
  if(!WALK.light){WALK.light=new T.SpotLight(0xFFF0DC,0,24,0.42,0.75,1);W3.scene.add(WALK.light);W3.scene.add(WALK.light.target)}WALK.light.intensity=0;WALK.light.visible=true;   // a soft follow-spot on whoever is walking
  walkPhase(1)}
/* one player's entrance: the opponent first, then you */
function walkPhase(i){if(!WALK.on)return;WALK.phase='walk';WALK.who=i;WALK.walker[i]={legs:walkLegs(i),k:1,arrived:false};WALK.cam=null;
  const F=WALK.F,myT=++WALK.tok;
  after(()=>{if(WALK.tok===myT)walkCaption(F,i)},700);
  after(()=>{if(WALK.tok!==myT)return;sndApplause(i?0.75:1);if(!i)after(()=>sndCrowdVoice('cheer',0.9),400);speak(announce(F,i),{rate:0.95})},900)}
WALK.tok=0;
function walkArrived(i){if(!WALK.on||WALK.who!==i)return;const myT=WALK.tok;after(()=>{if(WALK.tok!==myT||!WALK.on)return;$('walkCard').hidden=true;if(i)walkPhase(0);else walkTape()},900)}
function walkTape(){if(!WALK.on)return;WALK.tok++;WALK.phase='tape';WALK.who=-1;WALK.tt=0;WALK.cam=null;$('walkCard').hidden=true;$('walkSkip').hidden=true;
  for(const i of [0,1]){const L=walkLegs(i),e=L[L.length-1];P[i].pos.set(e.x,0,e.z);M.mv[i]={x:e.x,z:e.z,v:0,vz:0};WALK.walker[i]=null}
  const el=$('tape');el.innerHTML=tapeHtml(WALK.F);el.hidden=false;el.classList.remove('in');void el.offsetWidth;el.classList.add('in');
  const myT=WALK.tok;after(()=>{if(WALK.tok===myT)endWalkout()},12000)}
function endWalkout(){if(!WALK.on)return;WALK.on=false;WALK.tok++;$('walk').hidden=true;$('tape').hidden=true;$('walkCard').hidden=true;
  document.querySelector('#match .hud.top').style.visibility='';document.querySelector('#match .hud.bot').style.visibility='';
  P[0].yaw=Math.PI;P[1].yaw=0;P[0].stroll=P[1].stroll=false;if(WALK.light)WALK.light.intensity=0;M.lock=false;M.state='between';if(M.cfg.intro)say(M.cfg.intro);after(nextPoint,700)}
/* tap: skip the entrances, or start the match from the tale of the tape */
function walkTap(){if(!WALK.on)return;if(WALK.phase==='tape')endWalkout();else walkTape()}
/* per frame while walking: move the walker along the path, face where they're going, then turn to the net */
function walkTick(dt){if(!WALK.on)return;WALK.t+=dt;const SPD=1.45;
  for(const i of [0,1]){const w=WALK.walker[i],pl=P[i],face=i?0:Math.PI;M.mv[i].v=0;M.mv[i].vz=0;
    if(w&&!w.arrived){const tg=w.legs[w.k],dx=tg.x-pl.pos.x,dz=tg.z-pl.pos.z,d=Math.hypot(dx,dz),step=SPD*dt;
      if(d<=step){pl.pos.set(tg.x,0,tg.z);w.k++;if(w.k>=w.legs.length){w.arrived=true;walkArrived(i)}}
      else{pl.pos.x+=dx/d*step;pl.pos.z+=dz/d*step;const want=Math.atan2(dx,dz);let dy=want-pl.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));pl.yaw+=dy*Math.min(1,dt*6);M.mv[i].vz=i?SPD:-SPD}}
    else{let dy=face-pl.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));pl.yaw+=dy*Math.min(1,dt*4)}
    pl.yawOff=0;pl.runW=0;M.mv[i].x=pl.pos.x;M.mv[i].z=pl.pos.z}
  W3.ball.visible=W3.bshadow.visible=false;
  const L=WALK.light;if(L){const on=WALK.phase==='walk'&&WALK.who>=0,pl=on?P[WALK.who]:null;L.intensity+=((on?38:0)-L.intensity)*Math.min(1,dt*2.5);
    if(pl){const c=W3.cam.position;L.position.set(pl.pos.x+(c.x-pl.pos.x)*0.6,7.5,pl.pos.z+(c.z-pl.pos.z)*0.6);L.target.position.set(pl.pos.x,0.9,pl.pos.z)}}}
/* the camera walks backwards in front of the player, a little to one side, at eye height */
function walkCam(dt){if(!WALK.on)return false;
  if(WALK.phase==='tape'){const a=0.85+WALK.tt*0.045,Dm=W3.dims||{xS:9,zF:18};WALK.tt+=dt;const tp=new T.Vector3(Math.sin(a)*(Dm.xS-1.3),5.6,Math.cos(a)*(Dm.zF-2.2)),tl=new T.Vector3(0,0.6,0);   // a slow crane around the court behind the card
    if(!WALK.cam)WALK.cam={p:tp.clone(),l:tl.clone()};const k=Math.min(1,dt*1.5);WALK.cam.p.lerp(tp,k);WALK.cam.l.lerp(tl,k);W3.cam.position.copy(WALK.cam.p);W3.cam.lookAt(WALK.cam.l);W3.camPos.copy(WALK.cam.p);W3.camLook.copy(WALK.cam.l);return true}
  if(WALK.phase!=='walk'||WALK.who<0)return false;const i=WALK.who,w=WALK.walker[i],pl=P[i];if(!w)return false;
  const tg=w.legs[Math.min(w.k,w.legs.length-1)],dx=tg.x-pl.pos.x,dz=tg.z-pl.pos.z,d=Math.hypot(dx,dz)||1;let ux=dx/d,uz=dz/d;
  if(w.arrived){ux=0;uz=i?1:-1}
  const tp=new T.Vector3(pl.pos.x+ux*5.4-uz*1.6,1.75,pl.pos.z+uz*5.4+ux*1.6),tl=new T.Vector3(pl.pos.x,0.7,pl.pos.z);
  if(!WALK.cam){WALK.cam={p:tp.clone(),l:tl.clone()}}const k=Math.min(1,dt*2.2);WALK.cam.p.lerp(tp,k);WALK.cam.l.lerp(tl,k);
  W3.cam.position.copy(WALK.cam.p);W3.cam.lookAt(WALK.cam.l);W3.camPos.copy(WALK.cam.p);W3.camLook.copy(WALK.cam.l);return true}
$('walk').onclick=e=>{e.stopPropagation();walkTap()};
