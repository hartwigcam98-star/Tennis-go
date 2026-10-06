/* ================= learn to play: guided lessons with Coach Dot feeding balls, and an endless practice court =================
   Lessons run on the real match engine. Coach Dot never plays the ball back: every ball you hit is judged, then she feeds the next. */
const KEY_LEARN='tennis-go-learn';
let LEARN={done:{}};try{const v=JSON.parse(localStorage.getItem(KEY_LEARN)||'null');if(v&&v.done)LEARN=v}catch(e){}
function storeLearn(){try{localStorage.setItem(KEY_LEARN,JSON.stringify(LEARN))}catch(e){}}
const ZONE={left:{x0:-1,x1:-0.2,y0:0.6,y1:1,label:'left'},right:{x0:0.2,x1:1,y0:0.6,y1:1,label:'right'},deep:{x0:-1,x1:1,y0:0.77,y1:1,label:'deep'}};
const inZone=(z,l)=>l&&l.x>=z.x0&&l.x<=z.x1&&l.y>=z.y0&&l.y<=z.y1;
const LESSONS=[
  {id:'swipe',t:'Swipe to hit',d:'When Coach Dot feeds you a ball, swipe up anywhere on the screen. Your player runs to the ball and swings for you. Land 3 balls in the court.',need:3,feed:'fh',
    judge:e=>e.in?['ok','In!']:['no',e.why]},
  {id:'aim',t:'Aim with the angle',d:'The angle of your swipe sets the direction. Tilt it toward the glowing target: 2 to the left, then 2 to the right.',need:4,feed:'mix',zones:['left','left','right','right'],
    judge:(e,z)=>!e.in?['no',e.why]:inZone(ZONE[z],e.land)?['ok','On target!']:['no','In, but missed the target. Tilt your swipe more to the '+ZONE[z].label+'.']},
  {id:'depth',t:'Depth',d:'The length of your swipe sets how deep it goes. Land 2 balls in the deep zone past the service line. Too long sails it out.',need:2,feed:'mix',zones:['deep','deep'],
    judge:(e,z)=>!e.in?['no',e.why]:inZone(ZONE.deep,e.land)?['ok','Deep!']:['no','A little short. Make your swipe longer.']},
  {id:'pace',t:'Pace',d:'The speed of your swipe is your power. Flick it fast to hit one over 100 km/h and keep it in. Harder hits stray more.',need:1,feed:'mix',
    judge:e=>!e.in?['no',e.why+' Power costs accuracy; flick fast but not too long.']:e.kmh>=100?['ok','Big hit: '+e.kmh+' km/h!']:['no',e.kmh+' km/h. Flick faster.']},
  {id:'timing',t:'Timing',d:'Watch the ball: it glows green just before it reaches you. Swipe while it glows for a perfect hit, tighter and a little harder. Get 2 perfect hits.',need:2,feed:'mix',
    judge:e=>e.tim==='perfect'&&e.in?['ok','Perfect timing!']:e.tim==='perfect'?['no','Perfect timing, but it missed. Keep the swipe in the court.']:['no',e.tim==='early'?'Too early. Wait for the glow.':e.tim==='late'?'Too late. Swipe as soon as it glows.':'Close. Wait a beat longer, until the ball glows.']},
  {id:'slice',t:'Slice',d:'Curve your swipe like an arc, like drawing a C, to hit a slice: backspin that stays low and skids. It is slower but safer when you are stretched. Hit 2 slices in.',need:2,feed:'mix',
    judge:e=>!e.in?['no',e.why]:e.slice?['ok','Slice!']:['no','That was topspin. Curve the swipe more, like an arc.']},
  {id:'net',t:'Come to the net',d:'Tap your court near the net to move there, then volley 2 balls before they bounce. A blue ring marks where you are heading.',need:2,feed:'net',
    judge:e=>!e.in?['no',e.why]:e.volley?['ok','Volley!']:['no','That one bounced first. Tap close to the net, then swipe.']},
  {id:'smash',t:'The smash',d:'At the net, a ball over your head becomes an overhead. Your player backs up under it; swipe to smash it in.',need:1,feed:'lob',
    judge:e=>!e.in?['no',e.why]:e.smash?['ok','Smash!']:['no','Stay near the net so the lob comes over your head.']},
  {id:'serve',t:'Serve',d:'Pick a serve with the buttons, then swipe up into the glowing box. Flat is fastest, Slice curves away, Kick is safest. Land one of each.',need:3,serve:true,
    judge:e=>{const D=M.drill;D.types=D.types||{};if(D.practice&&e.in)return['ok',SVT[e.ty].name+' serve in, '+e.kmh+' km/h.'];if(!e.in)return['no','Fault, '+e.why+'. '+(e.ty==='flat'?'Flat serves need a calmer swipe.':'Aim for the middle of the box.')];
      if(D.types[e.ty])return['no',SVT[e.ty].name+' is done. Pick a different serve with the buttons.'];D.types[e.ty]=1;return['ok',SVT[e.ty].name+' serve in, '+e.kmh+' km/h.']}}
];
const TIPS=[['Stamina','Running drains the bar under your name; you get some back between points. Tired players move slower and spray shots, so make your opponent run.'],
  ['Pressure','Balls you have to stretch for are harder to control. When the hint says Stretched, swipe safer.'],
  ['Slice','Curve your swipe like an arc for a low, skidding slice. Great when you are stretched, and nasty on grass.'],
  ['Touch','A short, slow swipe plays a drop shot. When they come to the net, a long, slow swipe floats a lob over them.'],
  ['Reading you','Hit to the same side over and over and opponents start reading it. Mix it up.']];

/* ---- the learn screen ---- */
function openLearn(){
  const done=LESSONS.filter(l=>LEARN.done[l.id]).length,all=done===LESSONS.length;
  $('learnIntro').textContent=all?'All lessons done. Replay any of them, or practise one as long as you like.':'Eight short lessons with Coach Dot, about five minutes in all. Each one teaches one thing; the next unlocks when you finish.';
  $('lessons').innerHTML=LESSONS.map((l,i)=>{const ok=LEARN.done[l.id],open=i===0||LEARN.done[LESSONS[i-1].id]||ok;
    return'<div class="lesson'+(ok?' done':'')+'"><div style="min-width:0"><p class="eyebrow">Lesson '+(i+1)+(ok?' · Done':'')+'</p><strong>'+esc(l.t)+'</strong></div>'+
      '<div class="row" style="flex-wrap:nowrap"><button '+(open?'':'disabled ')+'data-l="'+i+'" class="'+(open&&!ok?'go':'')+'">'+(ok?'Replay':'Start')+'</button>'+(ok?'<button class="ghost" data-p="'+i+'">Practise</button>':'')+'</div></div>'}).join('')+
    '<div class="card" style="gap:10px"><h3>Good to know</h3>'+TIPS.map(([a,b])=>'<p class="tip"><b>'+a+'</b>'+b+'</p>').join('')+'</div>';
  $('lessons').querySelectorAll('button[data-l]').forEach(b=>b.onclick=()=>startLesson(+b.dataset.l,false));
  $('lessons').querySelectorAll('button[data-p]').forEach(b=>b.onclick=()=>startLesson(+b.dataset.p,true));
  show('learn')}
$('btnLearn').onclick=openLearn;$('learnBack').onclick=()=>renderTitle();
function learnCardState(){const done=LESSONS.filter(l=>LEARN.done[l.id]).length;
  $('learnSub').textContent=done===0?'New here? Learn the swipe, aiming, timing, net play and serving with Coach Dot in about five minutes.':done<LESSONS.length?done+' of '+LESSONS.length+' lessons done. Pick up where you left off.':'All lessons done. Practise any shot on the practice court.';
  $('btnLearn').textContent=done===0?'Start the lessons':done<LESSONS.length?'Continue lessons':'Practice court';
  $('btnLearn').className=done===0&&!save?'go':'';
  // new players see the lessons first
  const t=$('title'),lc=$('learnCard'),cc=$('careerCard');if(done===0&&!save)t.insertBefore(lc,cc);else t.insertBefore(lc,$('saveCard'))}

/* ---- running a lesson ---- */
function startLesson(i,practice){
  const coach=RBYID.granny||ROSTER[0],me=RBYID[save&&save.char]||RBYID.ch08||ROSTER[0],stats={};for(const [k] of STATS)stats[k]=save?clamp(save.stats[k]+2,3,8):5;
  startMatch({surf:'hard',bo:1,g:6,stats,meId:me.id,me:me.name,opp:{id:coach.id,name:'Coach Dot',skill:4},label:'Lesson',style:null,perks:0,venue:'club',drill:{i,practice},
    onEnd:()=>openLearn()})}
function drillBegin(cfg){
  const L=LESSONS[cfg.drill.i];M.drill={i:cfg.drill.i,L,practice:cfg.drill.practice,count:0,tries:0,rep:0,stats:{in:0,hits:0,perfect:0,best:0},finished:false};
  document.querySelector('.hud.top .board').hidden=true;$('drillP').hidden=false;$('dDone').hidden=true;
  $('dStep').textContent=(cfg.drill.practice?'Practice · ':'Lesson '+(cfg.drill.i+1)+' of '+LESSONS.length+' · ')+L.t;$('dTitle').textContent=L.t;$('dText').textContent=L.d;
  $('quit').textContent='Leave';drillProgress();say(cfg.drill.practice?'Practise as long as you like. Leave when you are done.':'Coach Dot: “'+L.d.split('. ')[0]+'.”');
  {const hy=L.id==='smash'?0.33:-0.05;M.home=[{x:0,y:hy},{x:0,y:1.08}];M.me={x:0,y:hy};M.op={x:0,y:1.08};
    M.mv[0]={x:0,v:0,z:toW(0,hy).z,vz:0};M.mv[1]={x:0,v:0,z:toW(0,1.08).z,vz:0};P[0].pos.set(0,0,M.mv[0].z);P[1].pos.set(0,0,M.mv[1].z)}
  setTimeout(drillNext,1800)}
function drillProgress(){const D=M.drill,L=D.L;
  if(D.practice){const s=D.stats;$('dDots').innerHTML='<span class="chip num">'+s.in+' of '+s.hits+' in</span>'+(L.serve?'':'<span class="chip num">'+s.perfect+' perfect</span>')+'<span class="chip num">Best '+s.best+' km/h</span>';return}
  $('dDots').innerHTML=Array.from({length:L.need},(_,k)=>'<i class="'+(k<D.count?'on':'')+'"></i>').join('')}
function drillZone(){const D=M.drill,z=D.L.zones&&D.L.zones[Math.min(D.count,D.L.zones.length-1)],mz=W3.zone||(W3.zone=(()=>{const g=new T.PlaneGeometry(1,1);g.rotateX(-Math.PI/2);
    const m=new T.Mesh(g,new T.MeshBasicMaterial({color:0x9BE15D,transparent:true,opacity:0.28,depthWrite:false}));m.renderOrder=2;W3.scene.add(m);return m})());
  if(!z||!M.drill){mz.visible=false;return null}const Z=ZONE[z],a=toW(Z.x0,Z.y1),b=toW(Z.x1,Z.y0);mz.visible=true;mz.position.set((a.x+b.x)/2,0.009,(a.z+b.z)/2);mz.scale.set(Math.abs(b.x-a.x),1,Math.abs(b.z-a.z));return z}
function drillNext(){
  if(!M||!M.drill)return;const D=M.drill,L=D.L;M.lock=false;M.en=[1,1];M.cap=[1,1];M.shot=null;M.land=null;M.aim=null;M.commit=null;M.pending=null;M.fault=false;M.rally=0;
  if(!D.practice&&D.count>=L.need){drillComplete();return}
  D.zone=drillZone();
  if(L.serve){M.pts=[0,0];M.server=0;M.me={x:0.4,y:-0.05};M.mv[0]={x:0.4*HW,v:0,z:toW(0,-0.05).z,vz:0};M.mv[1]={x:-0.45*HW,v:0,z:toW(0,1.08).z,vz:0};M.home=[{x:0.4,y:-0.05},{x:-0.45,y:1.08}];M.state='serveMe';return}
  M.state='between';M.home[1]={x:0,y:1.08};
  // Coach Dot swings and feeds
  P[1].startSwing('fh');setTimeout(()=>{if(!M||!M.drill)return;const st=M.mv[1];drillFeed({x:st.x/HW,y:0.5-st.z/CL,z:0.55})},SWINGS.fh.dur*SWINGS.fh.cf*1000)}
function drillFeed(from){
  const D=M.drill,f=D.L.feed;D.rep++;let bx,by,spd=17,w=150,lob=false;
  if(f==='lob'){bx=rnd(-0.25,0.25);by=0.18;lob=true;w=140;spd=Math.sqrt(9.81*Math.hypot((bx-from.x)*HW,(by-from.y)*CL))*1.08}
  else if(f==='net'){bx=(D.rep%2?0.32:-0.32);by=0.3;spd=15;w=60}
  else{const side=f==='fh'?1:(D.rep%2?1:-1);bx=side*rnd(0.28,0.42);by=rnd(0.14,0.22)}
  const sh=makeShot(from,{x:bx,y:by},spd,w,{who:'op',kind:'feed',lob,recv:recvPos(0)});sh.w=w;sh.kind='feed';
  M.shot=sh;onContact('op',toW(from.x,from.y,from.z),sh.speed,false);sndHit(0.5);
  setReach(M.shot);M.meSide=sideFor(0,M.shot.hx,M.shot.volley,M.shot.smash);M.t0=now();M.state='op';P[0].hop=0.15}
/* judged events from the engine: every rally shot and serve you hit, and balls you never reached */
function drillEvent(e){
  const D=M&&M.drill;if(!D||D.finished)return;const L=D.L;
  if(e.k==='hit'||e.k==='serve'){D.stats.hits++;if(e.in)D.stats.in++;if(e.tim==='perfect'&&e.in)D.stats.perfect++;if(e.in)D.stats.best=Math.max(D.stats.best,e.kmh||0)}
  if(!!L.serve!==(e.k==='serve')&&e.k!=='none')return;
  const [v,msg]=e.k==='none'?['no',e.why]:L.judge(e,D.zone);
  if(D.practice){say(msg);drillProgress();return}
  if(v==='ok'){D.count++;drillProgress();say(msg+(D.count<L.need?' '+(L.need-D.count)+' to go.':''));haptic(16)}else say(msg)}
function drillPoint(w,text,call){
  if(!M||M.lock)return;M.lock=true;M.state='between';slowMo(false);
  if(w===1&&!call&&text&&M.shot&&M.shot.who==='op')drillEvent({k:'none',why:/swipe in time/.test(text)?'Swipe before the ball reaches you.':'Out of reach. Swipe as soon as the ball is fed.'});
  setTimeout(drillNext,1100)}
function drillComplete(){
  const D=M.drill,L=D.L,i=D.i;D.finished=true;LEARN.done[L.id]=true;storeLearn();M.state='between';drillZone();
  crowdCheer(0.8,2);sndApplause(0.6);callOut('NICE!');
  const last=i===LESSONS.length-1;$('dDone').hidden=false;
  $('dDoneT').textContent=last?'You’re ready':'Lesson complete';
  $('dDoneP').textContent=last?'That’s everything. Coach Dot says: make them run, mix it up, and watch the glow. Your career is waiting.':'Nice work. Next up: '+LESSONS[i+1].t+'.';
  $('dNext').textContent=last?(save?'Back to the menu':'Start a career'):'Next lesson';
  $('dNext').onclick=()=>{const m=M;if(m){m.over=true;m.winner=0;m.cfg.onEnd=last?(()=>{renderTitle();if(!save)openSelect('career')}):(()=>startLesson(i+1,false))}endMatch()};
  $('dMenu').onclick=()=>{if(M){M.over=true;M.winner=0}endMatch()}}
function drillCleanup(){document.querySelector('.hud.top .board').hidden=false;$('drillP').hidden=true;$('dDone').hidden=true;if(W3.zone)W3.zone.visible=false}
