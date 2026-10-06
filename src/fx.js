/* ================= feel: game clock (hit-stop, slow motion), contact bursts, ball trail, camera kick,
   bounce dust and clay marks, haptics, and slow-motion replays of the big points ================= */
const CLK={rt:performance.now(),ts:1,hsUntil:0,slow:1,slowT:1};
let GT=performance.now();
function clockTick(){const r=performance.now(),d=Math.min(100,r-CLK.rt);CLK.rt=r;
  CLK.slow+=(CLK.slowT-CLK.slow)*Math.min(1,d/120);CLK.ts=r<CLK.hsUntil?0.04:CLK.slow;GT+=d*CLK.ts}
function hitStop(ms){CLK.hsUntil=Math.max(CLK.hsUntil,performance.now()+ms)}
function slowMo(on){CLK.slowT=on?0.3:1}

/* ---- haptics: vibration where the phone supports it; on iPhone a system tick from a hidden switch, only inside a touch ---- */
const HAP={el:null};
function haptic(ms){try{if(navigator.vibrate){navigator.vibrate(ms);return}}catch(e){}}
function hapticTap(){if(navigator.vibrate){try{navigator.vibrate(10)}catch(e){}return}
  if(!IOS)return;try{if(!HAP.el){const l=document.createElement('label'),i=document.createElement('input');i.type='checkbox';i.setAttribute('switch','');l.appendChild(i);l.style.cssText='position:fixed;left:-99px;top:0;opacity:0;pointer-events:none';document.body.appendChild(l);HAP.el=l}HAP.el.click()}catch(e){}}

/* ---- effect objects, created once ---- */
const FX={trail:null,tp:[],trailOn:false,bursts:[],shake:0,shakeAmp:0,puffs:null,pp:[],marks:[],lastShot:null};
function fxInit(s){
  // trail: a fading string of glowing beads behind the ball
  const tm=new T.InstancedMesh(new T.SphereGeometry(0.06,8,6),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.9,blending:T.AdditiveBlending,depthWrite:false}),14);
  tm.frustumCulled=false;tm.count=0;s.add(tm);FX.trail=tm;tm.setColorAt(0,new T.Color());
  // contact bursts
  for(let i=0;i<4;i++){const m=new T.Mesh(new T.RingGeometry(0.55,0.7,32),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide}));m.visible=false;s.add(m);FX.bursts.push({m,t:9})}
  // dust / grass puffs
  const n=160,g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(n*3),3));g.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(n*3),3));
  const pm=new T.Points(g,new T.PointsMaterial({size:0.09,vertexColors:true,transparent:true,opacity:0.85,depthWrite:false}));pm.frustumCulled=false;s.add(pm);FX.puffs=pm;
  for(let i=0;i<n;i++)FX.pp.push({x:0,y:-9,z:0,vx:0,vy:0,vz:0,life:0})}
function ringBurst(pos,col,size){const b=FX.bursts.find(b=>b.t>=1)||FX.bursts[0];b.t=0;b.size=size||1;b.m.material.color.setHex(col);b.m.position.copy(pos);b.m.visible=true}
function kick(amp){FX.shakeAmp=Math.max(FX.shakeAmp*(FX.shake>0?1:0),amp);FX.shake=0.16}
function puff(x,z,surf,v){const col=surf==='clay'?[0.85,0.5,0.3]:surf==='grass'?[0.45,0.75,0.3]:[0.95,0.95,0.95],n=surf==='hard'?5:surf==='grass'?9:16,k=clamp(v/10,0.4,1.3);
  let c=0;for(const p of FX.pp){if(p.life>0)continue;p.x=x;p.y=0.03;p.z=z;const a=Math.random()*Math.PI*2,sp=(0.4+Math.random()*1.1)*k;p.vx=Math.cos(a)*sp;p.vz=Math.sin(a)*sp;p.vy=(0.4+Math.random()*1.2)*k;p.life=surf==='clay'?0.9:0.5;p.col=col;if(++c>=n)break}}
function ballMark(x,z,dir){if(!W3.venue||W3.venue.surf!=='clay')return;
  const m=new T.Mesh(new T.CircleGeometry(0.05,12),new T.MeshBasicMaterial({color:shade(W3.venue.court,0.72),transparent:true,opacity:0.8,depthWrite:false}));
  m.rotation.x=-Math.PI/2;m.rotation.z=-dir;m.scale.set(1,2.1,1);m.position.set(x,0.007,z);W3.scene.add(m);FX.marks.push(m);
  if(FX.marks.length>24){const o=FX.marks.shift();W3.scene.remove(o);o.geometry.dispose();o.material.dispose()}}
function clearMarks(){for(const o of FX.marks){W3.scene.remove(o);o.geometry.dispose();o.material.dispose()}FX.marks=[]}
/* called whenever someone hits: burst at the ball, camera kick and hit-stop for big ones, haptic for your own */
function onContact(who,pos,speed,perfect){
  const big=speed>=31,col=perfect?0xB8FF40:big?0xFFB347:0xFFFFFF;ringBurst(pos,col,perfect?1.6:big?1.3:0.9);
  if(who==='me'){if(big||perfect){kick(perfect?0.1:0.07);hitStop(perfect?75:55)}haptic(perfect?28:big?20:12)}
  else if(big)kick(0.04);
  FX.tp=[]}
function fxTick(dt){
  // bursts face the camera, grow and fade
  for(const b of FX.bursts){if(b.t>=1){b.m.visible=false;continue}b.t+=dt/0.22;const e=Math.min(1,b.t);b.m.lookAt(W3.cam.position);b.m.scale.setScalar((0.25+e*0.9)*b.size);b.m.material.opacity=0.9*(1-e)}
  // trail
  const tr=FX.trail;if(W3.ball.visible&&M&&M.shot&&M.state!=='between'){const p=W3.ball.position;const last=FX.tp[FX.tp.length-1];
    if(!last||last.distanceToSquared(p)>0.0025){FX.tp.push(p.clone());if(FX.tp.length>14)FX.tp.shift()}}else FX.tp=[];
  const n=FX.tp.length,mx=new T.Matrix4(),c=new T.Color();let spd=0;
  if(n>2)spd=FX.tp[n-1].distanceTo(FX.tp[n-3])/Math.max(dt*2,0.008);
  const sp=M&&M.shot?M.shot.speed||20:20,mine=M&&M.shot&&M.shot.who==='me'&&myTrailColor()!=null,base=mine?new T.Color(myTrailColor()):sp>=33?new T.Color(0xFF7A3D):sp>=26?new T.Color(0xFFD23F):new T.Color(0xFFFFFF);
  for(let i=0;i<n;i++){const f=(i+1)/n,s=0.35+0.65*f;mx.makeScale(s,s,s).setPosition(FX.tp[i]);tr.setMatrixAt(i,mx);c.copy(base).multiplyScalar(f*f*(sp>=26?0.9:0.45));tr.setColorAt(i,c)}
  tr.count=n;tr.instanceMatrix.needsUpdate=true;if(tr.instanceColor)tr.instanceColor.needsUpdate=true;
  // puffs
  const pa=FX.puffs.geometry.attributes.position,ca=FX.puffs.geometry.attributes.color;let i=0;
  for(const p of FX.pp){if(p.life>0){p.life-=dt;p.vy-=4*dt;p.x+=p.vx*dt;p.y=Math.max(0.01,p.y+p.vy*dt);p.z+=p.vz*dt;p.vx*=0.94;p.vz*=0.94;
      pa.setXYZ(i,p.x,p.y,p.z);const f=Math.max(0,p.life);ca.setXYZ(i,p.col[0]*f*1.1,p.col[1]*f*1.1,p.col[2]*f*1.1)}else pa.setXYZ(i,0,-9,0);i++}
  pa.needsUpdate=true;ca.needsUpdate=true;
  if(FX.shake>0)FX.shake-=dt}
function shakeOffset(){if(FX.shake<=0)return null;const a=FX.shakeAmp*(FX.shake/0.16);return new T.Vector3((Math.random()-0.5)*a,(Math.random()-0.5)*a,(Math.random()-0.5)*a)}

/* ================= replays: record the last few seconds of poses and ball, play back the best points slowly ================= */
const REP={buf:[],max:330,on:false,t:0,t0:0,t1:0,done:null,cam:0,camPos:new T.Vector3(),camLook:new T.Vector3(),lastPt:-9};
function recordFrame(){
  if(!P[0]||!P[1]||!M)return;
  const nb0=P[0].nb,nb1=P[1].nb,len=5+2*17+(nb0+nb1)*4;let f=REP.buf.length>=REP.max?REP.buf.shift():null;
  if(!f||f.a.length!==len)f={a:new Float32Array(len)};
  const a=f.a,b=W3.ball.position;a[0]=GT;a[1]=b.x;a[2]=b.y;a[3]=b.z;a[4]=W3.ball.visible?1:0;let o=5;
  for(const pl of P){a.set(pl.root.matrix.elements,o);o+=16;a[o++]=pl.bones[0].position.y;for(const bn of pl.bones){const q=bn.quaternion;a[o++]=q.x;a[o++]=q.y;a[o++]=q.z;a[o++]=q.w}}
  REP.buf.push(f)}
function startReplay(secs,done){
  const B=REP.buf;if(B.length<20){done();return}
  REP.t1=Math.min(B[B.length-1].a[0],(REP.endT||1e15)+500);REP.t0=Math.max(B[0].a[0],REP.t1-secs*1000);REP.t=REP.t0;REP.on=true;REP.done=done;REP.cam=(REP.cam+1)%2;
  $('replay').hidden=false;$('hint').style.visibility='hidden';REP.snap=true;W3.homeMark.visible=false;W3.aimRing.visible=W3.aimDisk.visible=W3.aimLine.visible=W3.landMark.visible=false;FX.trail.count=0}
function endReplay(){if(!REP.on)return;REP.on=false;$('replay').hidden=true;$('hint').style.visibility='';REP.buf=[];const d=REP.done;REP.done=null;
  // put the live pose back on the next update
  if(d)d()}
const _q1=new T.Quaternion(),_q2=new T.Quaternion();
function replayTick(dtr){
  REP.t+=dtr*1000*0.55;if(REP.t>=REP.t1){endReplay();return}
  const B=REP.buf;let i=1;while(i<B.length-1&&B[i].a[0]<REP.t)i++;const A=B[i-1].a,C=B[i].a,u=clamp((REP.t-A[0])/Math.max(1,C[0]-A[0]),0,1);
  W3.ball.position.set(A[1]+(C[1]-A[1])*u,A[2]+(C[2]-A[2])*u,A[3]+(C[3]-A[3])*u);W3.ball.visible=A[4]>0.5;W3.bshadow.visible=W3.ball.visible;
  W3.bshadow.position.set(W3.ball.position.x,0.012,W3.ball.position.z);
  let o=5;for(const pl of P){const e=pl.root.matrix.elements;for(let k=0;k<16;k++)e[k]=A[o+k]+(C[o+k]-A[o+k])*u;pl.root.matrixWorldNeedsUpdate=true;o+=16;
    pl.bones[0].position.y=A[o]+(C[o]-A[o])*u;o++;
    for(const bn of pl.bones){_q1.set(A[o],A[o+1],A[o+2],A[o+3]);_q2.set(C[o],C[o+1],C[o+2],C[o+3]);bn.quaternion.slerpQuaternions(_q1,_q2,u);o+=4}}
  // broadcast cameras: low courtside tracking the ball, or high behind the far baseline
  const b=W3.ball.position,tp=new T.Vector3(),tl=new T.Vector3(b.x*0.6,0.9,b.z);
  if(REP.cam===0)tp.set(-8.3,1.9,clamp(b.z*0.75+2.5,-14,14));else tp.set(b.x*0.3,4.8,CL/2+7.5);
  if(REP.snap){REP.snap=false;REP.camPos.copy(tp);REP.camLook.copy(tl)}
  const k=Math.min(1,dtr*2.5);REP.camPos.lerp(tp,k);REP.camLook.lerp(tl,Math.min(1,dtr*5));W3.cam.position.copy(REP.camPos);W3.cam.lookAt(REP.camLook);
  // the replay's own ball trail
  FX.tp.push(b.clone());if(FX.tp.length>14)FX.tp.shift()}
/* which points earn a replay */
function wantReplay(w,call){
  if(!M||!M.shot)return false;const sh=M.shot,big=(sh.speed||0)>=33,pt=M.pts[0]+M.pts[1]+M.sets.reduce((a,s)=>a+s[0]+s[1],0)*10;
  const momentous=M.over||M.sets.length>REP.setsN;REP.setsN=M.sets.length;
  let want=false;
  if(call==='ACE')want=big;
  else if(call==='WINNER')want=sh.smash||M.rally>=5||big||sh.kind==='pass';
  else if(w===1&&sh.who==='op'&&sh.unreach)want=M.rally>=6||sh.kind==='pass'||sh.kind==='wrongfoot';
  if(!want)return false;
  if(!momentous&&pt-REP.lastPt<3)return false;
  REP.lastPt=pt;return true}
