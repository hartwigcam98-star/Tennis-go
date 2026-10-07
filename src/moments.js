/* ================= big moments: match-point replay, the title ceremony, stats at changeovers =================
   Match point always gets a slow-motion replay (unless replays are off). Winning a final ends with a ceremony: the
   champion lifts the trophy (each major has its own), confetti falls, the camera circles and the crowd stands.
   At changeovers and set breaks a TV-style stats card shows how the match is going. */

/* ---- trophies ---- */
const TROPHY_LOOK={Melbourne:{c:0xE9C766,h:1.0},Paris:{c:0xD9DDE2,h:1.1},London:{c:0xE6C15A,h:0.95,lid:true},'New York':{c:0xD5D9DE,h:1.15,tall:true}};
function makeTrophy(ev){const lk=ev&&ev.major?TROPHY_LOOK[ev.major]:ev&&ev.tier==='Finals'?{c:0xD5D9DE,h:1.05}:ev&&ev.tier==='Masters'?{c:0xD9DDE2,h:0.9}:{c:0xE2BE5E,h:ev&&/Junior|Local|Sectional|College|Dual/.test(ev.tier||'')?0.65:0.8};
  const g=new T.Group(),m=new T.MeshStandardMaterial({color:lk.c,metalness:0.55,roughness:0.28,emissive:lk.c,emissiveIntensity:0.12}),s=0.36*lk.h;
  const prof=lk.tall?[[0,0],[0.16,0],[0.16,0.05],[0.06,0.1],[0.05,0.5],[0.12,0.62],[0.2,0.9],[0.21,1.05],[0,1.05]]:[[0,0],[0.18,0],[0.18,0.05],[0.07,0.1],[0.05,0.32],[0.1,0.38],[0.22,0.55],[0.26,0.8],[0.27,0.84],[0,0.84]];
  const lathe=new T.LatheGeometry(prof.map(([x,y])=>new T.Vector2(x*s,y*s)),28);g.add(new T.Mesh(lathe,m));
  if(!lk.tall)for(const sx of [-1,1]){const h=new T.Mesh(new T.TorusGeometry(0.09*s,0.018*s,8,18,Math.PI*1.3),m);h.position.set(sx*0.27*s,0.62*s,0);h.rotation.z=sx>0?-0.6:Math.PI+0.6;g.add(h)}
  if(lk.lid){const l=new T.Mesh(new T.ConeGeometry(0.2*s,0.18*s,24),m);l.position.y=0.93*s;g.add(l);const k=new T.Mesh(new T.SphereGeometry(0.035*s,10,8),m);k.position.y=1.03*s;g.add(k)}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}

/* ---- confetti ---- */
const CONF={mesh:null,n:360,p:[],on:false};
function confettiStart(at){const s=W3.scene;if(!CONF.mesh){const geo=new T.PlaneGeometry(0.05,0.08);CONF.mesh=new T.InstancedMesh(geo,new T.MeshStandardMaterial({side:T.DoubleSide,roughness:0.6}),CONF.n);CONF.mesh.frustumCulled=false;
    const pal=[0xF5D04A,0xFFFFFF,0x74D493,0xF28A78,0x4CA3FF,0xD3E86B],c=new T.Color();for(let i=0;i<CONF.n;i++){c.setHex(pal[i%pal.length]);CONF.mesh.setColorAt(i,c)}s.add(CONF.mesh)}
  CONF.p=[];for(let i=0;i<CONF.n;i++)CONF.p.push({x:at.x+rnd(-4,4),y:rnd(4,9),z:at.z+rnd(-4,4),vx:rnd(-0.3,0.3),vy:-rnd(0.6,1.1),r:Math.random()*6,vr:rnd(2,7),ph:Math.random()*6});
  CONF.mesh.visible=true;CONF.on=true}
const _cm=new T.Matrix4(),_cq=new T.Quaternion(),_ce=new T.Euler(),_cs=new T.Vector3(1,1,1),_cp=new T.Vector3();
function confettiTick(dt){if(!CONF.on)return;let i=0;for(const q of CONF.p){q.ph+=dt*3;q.x+=(q.vx+0.25*Math.sin(q.ph))*dt;q.y+=q.vy*dt;q.r+=q.vr*dt;if(q.y<0.02){q.y=0.02;q.vy=0;q.vx=0;q.vr=0}
    _ce.set(q.r,q.r*0.7,q.r*0.3);_cq.setFromEuler(_ce);_cp.set(q.x,q.y,q.z);_cm.compose(_cp,_cq,_cs);CONF.mesh.setMatrixAt(i++,_cm)}CONF.mesh.instanceMatrix.needsUpdate=true}
function confettiStop(){CONF.on=false;if(CONF.mesh)CONF.mesh.visible=false}

/* ---- the ceremony ---- */
const CER={on:false,t:0,done:null,trophy:null,minT:2.2};
function isTitleMatch(){return!!(M&&M.cfg&&M.cfg.mode==='career'&&M.cfg.final&&M.winner===0&&!M.retired)}
function afterMatch(){if(isTitleMatch())startCeremony(endMatch);else endMatch()}
function startCeremony(done){if(!M||!P[0]){done();return}CER.on=true;CER.t=0;CER.done=done;M.state='ceremony';
  const pl=P[0],ev=M.cfg.ev||{};pl.react=null;pl.swing=null;pl.post=null;pl.trophyT=0;if(pl.racket)pl.racket.visible=false;
  CER.trophy=makeTrophy(ev);W3.scene.add(CER.trophy);confettiStart(pl.pos);
  crowdCheer(1,9,8);sndApplause(1.2);after(()=>sndCrowdVoice('cheer',1.2),300);after(()=>sndApplause(1),2600);
  const title=ev.major?ev.major+' champion':ev.tier==='Finals'?'Tour Finals champion':(ev.n||'Tournament')+' champion';
  $('cerTitle').textContent=title;$('cerSub').textContent=M.cfg.me+(ev.major?' · Major title':'')+' · '+M.sets.map(g=>g[0]+'–'+g[1]).join(', ');
  $('cer').hidden=false;document.querySelector('#match .hud.top').style.visibility='hidden';document.querySelector('#match .hud.bot').style.visibility='hidden';
  if(hasOfficials())after(()=>speak('Ladies and gentlemen, your champion, '+M.cfg.me+'!',{rate:0.95}),1200)}
function endCeremony(){if(!CER.on||CER.t<CER.minT)return;CER.on=false;$('cer').hidden=true;
  document.querySelector('#match .hud.top').style.visibility='';document.querySelector('#match .hud.bot').style.visibility='';
  if(CER.trophy){W3.scene.remove(CER.trophy);CER.trophy=null}confettiStop();if(P[0]){P[0].trophyT=null;if(P[0].racket)P[0].racket.visible=true}
  const d=CER.done;CER.done=null;if(d)d()}
/* the trophy pose: both hands come up to the chest, then lift it overhead, with a couple of pumps */
function trophyPose(t){const lift=clamp((t-0.4)/0.9,0,1),e=lift*lift*(3-2*lift),pump=t>1.5?Math.max(0,Math.sin((t-1.5)*4.2))*6*(t<4.5?1:0):0,y=118+(62+pump)*e,z=24-12*e;
  return Object.assign({},READYS,{pel:0,sh:0,pitch:-0.05*e,roll:0,body:0,gw:0,hand:[-9,y,z],L:[9,y,z],rd:[0,1,0.15],pole:[-0.7,-0.3,-0.4]})}
function ceremonyTick(dt){if(!CER.on)return;CER.t+=dt;confettiTick(dt);const pl=P[0];
  if(pl&&CER.trophy){pl.trophyT=CER.t;const B=pl.bones,I=pl.idx,a=B[I.RightHand],b=B[I.LeftHand];
    if(a&&b){const pa=a.getWorldPosition(new T.Vector3()),pb=b.getWorldPosition(new T.Vector3());CER.trophy.position.copy(pa).add(pb).multiplyScalar(0.5);CER.trophy.position.y-=0.06;CER.trophy.rotation.y=pl.yaw+Math.PI}}
  if(CER.t>11)endCeremony()}
/* the camera circles the champion */
function ceremonyCam(){const pl=P[0];if(!pl)return false;const a=Math.PI+0.5+CER.t*0.22,r=4.6-Math.min(1.2,CER.t*0.25),c=pl.pos;
  W3.cam.position.set(c.x+Math.sin(a)*r,1.5+0.3*Math.sin(CER.t*0.4),c.z+Math.cos(a)*r);W3.cam.lookAt(c.x,1.45,c.z);return true}

/* ---- stats card at changeovers and set breaks ---- */
function statCardRows(){const a=M.ms[0],b=M.ms[1],pc=(x,y)=>y?Math.round(x/y*100)+'%':'–';
  return[['Aces',a.ace,b.ace],['Double faults',a.df,b.df],['1st serve in',pc(a.s1,a.sp),pc(b.s1,b.sp)],['1st serve pts won',pc(a.s1w,a.s1),pc(b.s1w,b.s1)],
    ['2nd serve pts won',pc(a.s2w,a.s2),pc(b.s2w,b.s2)],['Break points won',a.bpc+'/'+a.bpo,b.bpc+'/'+b.bpo],['Winners',a.wn,b.wn],['Unforced errors',a.ue,b.ue],['Points won',a.pw,b.pw]]}
function showStatCard(title){if(!M||!M.ms)return;const el=$('statCard');
  el.innerHTML='<p class="eyebrow">'+esc(title)+'</p><div class="sc-head"><span>'+esc(M.cfg.me)+'</span><span></span><span>'+esc(M.cfg.opp.name)+'</span></div>'+
    statCardRows().map(([k,x,y])=>{const nx=parseFloat(x),ny=parseFloat(y),better=k==='Double faults'||k==='Unforced errors'?(nx<ny?0:nx>ny?1:-1):(nx>ny?0:nx<ny?1:-1);
      return'<div class="sc-row"><b class="num'+(better===0?' up':'')+'">'+x+'</b><span>'+k+'</span><b class="num'+(better===1?' up':'')+'">'+y+'</b></div>'}).join('')+'<small>Tap to continue</small>';
  el.hidden=false;el.onclick=()=>{hideStatCard();if(M&&M.cardFn)hurry(M.cardFn)}}
function hideStatCard(){$('statCard').hidden=true}
/* bring a scheduled game-clock timer forward to now */
function hurry(fn){for(const x of TIMERS)if(x.fn===fn)x.t=GT}

/* ---- conditions: night sessions, wind, heat ----
   Wind pushes the ball through the air. Players allow for most of it when they aim (WIND_K 0.8 while the shot is planned)
   but not all, so lobs and long balls drift. Heat makes running more tiring. Indoors and at night it is calm and cool. */
let WIND={x:0,z:0},WIND_K=1;
function weatherFor(cfg,night){const ev=cfg.ev||{},major=ev.major||(cfg.venue&&cfg.venue.startsWith('major:')?cfg.venue.slice(6):null),indoor=ev.tier==='Finals';
  if(cfg.drill||indoor)return{wind:0,dir:0,temp:indoor?21:20,indoor};
  const r=Math.random(),windy=major==='London'?1.3:major==='Paris'?1.1:1,wind=(r<0.5?rnd(0,1.5):r<0.85?rnd(2,4):rnd(4,7))*windy*(night?0.6:1);
  const base=major==='Melbourne'?31:major==='New York'?28:major==='Paris'?22:major==='London'?21:24,temp=Math.round(base+(night?-6:rnd(-4,7)));
  return{wind:+wind.toFixed(1),dir:Math.random()*Math.PI*2,temp}}
function heatFactor(){const t=M&&M.cfg.weather?M.cfg.weather.temp:22;return 1+clamp((t-28)*0.035,0,0.3)}
function applyWeather(cfg){const W=cfg.weather;WIND=W&&W.wind?{x:Math.sin(W.dir)*W.wind,z:Math.cos(W.dir)*W.wind}:{x:0,z:0}}
/* the label beside the surface: "Night", wind with an arrow as you see it, and the temperature when it's hot */
function conditionsText(cfg){const W=cfg.weather,parts=[];if(cfg.night)parts.push(W&&W.indoor?'Indoor':'Night');
  if(W&&W.wind>=1.5){const a=Math.atan2(W.wind?Math.sin(W.dir):0,W.wind?Math.cos(W.dir):1),arrows=['↓','↘','→','↗','↑','↖','←','↙'],k=((Math.round(a/(Math.PI/4))%8)+8)%8;
    parts.push(arrows[k]+' '+Math.round(W.wind*2.237)+' mph')}
  if(W&&W.temp>=30)parts.push(W.temp+'°C');return parts.join(' · ')}
function conditionsSay(cfg){const W=cfg.weather;if(!W)return'';const bits=[];
  if(W.wind>=4)bits.push('It’s windy out there, so give your lobs and deep balls some margin.');else if(W.wind>=2)bits.push('A light breeze will push the high balls.');
  if(W.temp>=32)bits.push('It’s hot: long rallies will tire both of you faster.');return bits.join(' ')}
/* which matches are under the lights */
function nightFor(ev,roundsLeft,venueKind){if(!ev)return false;if(ev.tier==='Finals')return true;
  if(ev.major)return ev.major==='New York'?roundsLeft<=3:roundsLeft<=1||Math.random()<0.2;
  if(['Masters','Tour 500','Tour 250'].includes(ev.tier))return roundsLeft===0?Math.random()<0.6:Math.random()<0.2;
  return false}
