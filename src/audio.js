/* ================= sound: everything synthesised in code, no audio files =================
   At the first tap a bank of short sounds is rendered with simple physical models (damped string and ball modes,
   filtered noise, glottal pulses through vowel formants), several variants of each so repeats never sound identical.
   Shots: a different contact for drives, slices, volleys, smashes and serves, a crisper ring on perfect timing and a
   clunk off the frame. Swing whooshes, grunts on big hits, shoe squeaks / clay slides / grass scuffs and footsteps,
   surface-tuned bounces, the net. Crowds are built from individual clappers and voices. Everything is placed in
   stereo, quieter and wetter on the far side, through a venue echo sized from a club court up to a major stadium. */
const SND={ctx:null,on:true,amb:null,ambG:null,level:0,buf:{},bank:{},ready:false};
try{SND.on=localStorage.getItem('tennis-go-sound')!=='off'}catch(e){}
const SR=()=>SND.ctx.sampleRate,rng=(a,b)=>a+Math.random()*(b-a),pickA=a=>a[Math.floor(Math.random()*a.length)];

/* ---- offline DSP helpers ---- */
function biq(type,f,Q,sr){const w=2*Math.PI*Math.min(f,sr*0.45)/sr,cs=Math.cos(w),sn=Math.sin(w),al=sn/(2*Q);let b0,b1,b2;
  if(type==='lp'){b0=(1-cs)/2;b1=1-cs;b2=(1-cs)/2}else if(type==='hp'){b0=(1+cs)/2;b1=-(1+cs);b2=(1+cs)/2}else{b0=al;b1=0;b2=-al}
  const a0=1+al;return{b0:b0/a0,b1:b1/a0,b2:b2/a0,a1:-2*cs/a0,a2:(1-al)/a0}}
function filt(x,type,f,Q){const c=biq(type,f,Q||0.707,SR());let x1=0,x2=0,y1=0,y2=0;const y=new Float32Array(x.length);
  for(let i=0;i<x.length;i++){const v=c.b0*x[i]+c.b1*x1+c.b2*x2-c.a1*y1-c.a2*y2;x2=x1;x1=x[i];y2=y1;y1=v;y[i]=v}return y}
function noiseArr(n){const a=new Float32Array(n);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;return a}
function arr(sec){return new Float32Array(Math.max(1,Math.floor(SR()*sec)))}
/* damped sinusoid (a string, the ball, the frame) added at t0; glide = pitch drop at the start */
function mode(out,f,tau,amp,t0,glide){const sr=SR(),s0=Math.floor((t0||0)*sr),n=Math.min(out.length-s0,Math.floor(tau*sr*7));let ph=Math.random()*6.283;
  for(let i=0;i<n;i++){const t=i/sr;ph+=2*Math.PI*f*(1+(glide||0)*Math.exp(-t/0.008))/sr;out[s0+i]+=amp*Math.exp(-t/tau)*Math.sin(ph)}}
/* filtered noise with an attack and an exponential tail; mod(t) can shape it further */
function nz(out,type,f,Q,tau,amp,t0,attack,mod){const sr=SR(),s0=Math.floor((t0||0)*sr),n=Math.min(out.length-s0,Math.floor((tau*7+(attack||0))*sr));if(n<=0)return;
  let x=noiseArr(n);if(type)x=filt(x,type,f,Q);const a=(attack||0)*sr;
  for(let i=0;i<n;i++){const e=i<a?i/a:Math.exp(-(i-a)/(tau*sr));out[s0+i]+=amp*e*x[i]*(mod?mod(i/sr):1)}}
function crackle(p){return()=>Math.random()<p?1:0.12}
function norm(o,peak){let m=0;for(let i=0;i<o.length;i++)m=Math.max(m,Math.abs(o[i]));const k=(peak||0.9)/(m||1);for(let i=0;i<o.length;i++)o[i]*=k;return o}
function mkBuf(L,R){const c=SND.ctx,b=c.createBuffer(R?2:1,L.length,SR());b.getChannelData(0).set(L);if(R)b.getChannelData(1).set(R);return b}

/* ---- the sound bank ---- */
function mkHit(kind){const o=arr(0.32),soft=kind==='slice'||kind==='drop',f0=rng(500,640),sm=kind==='volley'?0.55:1;
  nz(o,'bp',rng(2200,3300),0.8,kind==='volley'?0.0011:0.0015,soft?0.3:1);   // the contact click
  mode(o,rng(1050,1380),0.006,soft?0.3:0.8,0,0.08);                            // the ball's hollow "pok"
  [[1,1,0.022],[2.03,0.45,0.014],[3.1,0.22,0.009],[4.25,0.1,0.006]].forEach(([k,a,t])=>mode(o,f0*k*rng(0.985,1.015),t*sm,a*(soft?0.4:0.7),0.0004,0.03)); // the string bed
  mode(o,rng(140,185),0.016*(kind==='volley'?1.6:1),kind==='volley'?0.8:0.4,0);   // racket and arm
  if(kind==='top')nz(o,'hp',3000,0.7,0.009,0.28,0.001,0.007);                     // strings brushing up the back of the ball
  if(kind==='slice')nz(o,'bp',1700,0.9,0.02,0.5,0,0.014);                         // the chop under it
  if(kind==='smash'||kind==='serve'){nz(o,'lp',6500,0.7,0.0035,1,0);mode(o,rng(85,100),0.03,0.55,0)}   // the crack
  return mkBuf(norm(o))}
function mkPing(){const o=arr(0.25),f=rng(1100,1300);mode(o,f,0.05,0.5,0);mode(o,f*2.01,0.03,0.25,0);mode(o,80,0.04,0.7,0);return mkBuf(norm(o,0.8))}
function mkFrame(){const o=arr(0.35);[[310,0.05,0.8],[820,0.035,0.6],[1490,0.025,0.4],[2640,0.02,0.25]].forEach(([f,t,a])=>mode(o,f*rng(0.95,1.05),t,a,0));
  nz(o,'bp',900,2,0.04,0.35,0.002,0,t=>0.5+0.5*Math.sign(Math.sin(2*Math.PI*70*t)));nz(o,'bp',2500,0.8,0.0015,0.4,0);return mkBuf(norm(o))}
function mkBounce(s){const o=arr(0.2);
  if(s==='hard'){nz(o,'bp',3000,0.8,0.0009,0.8);mode(o,rng(1080,1250),0.005,0.9,0,0.05);mode(o,rng(105,125),0.012,0.6,0)}
  else if(s==='clay'){mode(o,rng(850,950),0.0035,0.45,0);mode(o,rng(150,170),0.016,0.75,0);nz(o,'bp',2500,1,0.025,0.4,0.001,0.003,crackle(0.08))}
  else{mode(o,rng(130,150),0.02,0.85,0);nz(o,'lp',700,0.7,0.012,0.6,0);mode(o,700,0.003,0.2,0)}
  return mkBuf(norm(o))}
function mkNet(){const o=arr(0.45);nz(o,'bp',1400,1.2,0.07,0.6,0,0.004,t=>0.6+0.4*Math.sin(2*Math.PI*35*t));mode(o,85,0.05,0.7,0);nz(o,'hp',4000,0.7,0.03,0.2,0.005);return mkBuf(norm(o))}
function mkSqueak(){const sr=SR(),dur=rng(0.11,0.22),o=arr(dur+0.05),base=rng(1700,2500),vr=rng(35,60);let ph=0;
  for(let i=0;i<o.length;i++){const t=i/sr,u=t/dur,sh=u<0.4?1+0.3*u/0.4:1.3-0.35*(u-0.4)/0.6,f=base*sh*(1+0.03*Math.sin(2*Math.PI*vr*t)+0.01*(Math.random()-0.5));ph+=2*Math.PI*f/sr;
    const e=Math.min(1,t/0.008)*(u<1?1:Math.exp(-(t-dur)/0.01));o[i]=e*(Math.sin(ph)+0.35*Math.sin(2*ph)+0.15*Math.sin(3*ph))}
  nz(o,'hp',3000,0.7,dur*0.4,0.08,0);return mkBuf(norm(o,0.7))}
function mkSlide(){const o=arr(0.5);nz(o,'bp',1300,0.8,0.12,0.7,0,0.03,crackle(0.15));nz(o,'lp',300,0.7,0.12,0.35,0,0.03);return mkBuf(norm(o,0.7))}
function mkScuff(){const o=arr(0.18);nz(o,'lp',900,0.7,0.04,0.7,0,0.01);return mkBuf(norm(o,0.6))}
function mkStep(s){const o=arr(0.08);
  if(s==='hard'){mode(o,rng(200,240),0.008,0.6,0);nz(o,'bp',1800,1,0.002,0.4,0)}
  else if(s==='clay'){nz(o,'bp',1500,0.7,0.012,0.5,0,0.002,crackle(0.2));mode(o,120,0.01,0.4,0)}
  else{mode(o,110,0.012,0.5,0);nz(o,'lp',500,0.7,0.01,0.3,0)}
  return mkBuf(norm(o,0.6))}
function mkWhoosh(){const sr=SR(),len=0.22,o=arr(len),x=noiseArr(o.length);let x1=0,x2=0,y1=0,y2=0,c=null;
  for(let i=0;i<o.length;i++){const u=i/o.length;if(i%32===0)c=biq('bp',350+1500*u*u,1.2,sr);const v=c.b0*x[i]+c.b1*x1+c.b2*x2-c.a1*y1-c.a2*y2;x2=x1;x1=x[i];y2=y1;y1=v;o[i]=v*Math.pow(Math.sin(Math.PI*u),2)}
  return mkBuf(norm(o,0.7))}
/* a voice: glottal pulses through vowel formants, with breath */
function voiceSrc(n,f0a,f0b,t0,dur,amp,out){const sr=SR(),s0=Math.floor(t0*sr),m=Math.min(out.length-s0,Math.floor(dur*sr));let ph=0;const vib=rng(4,6),jit=rng(0.003,0.01);
  for(let i=0;i<m;i++){const u=i/m,f=(f0a+(f0b-f0a)*u)*(1+jit*Math.sin(2*Math.PI*vib*i/sr));ph+=f/sr;if(ph>=1)ph-=1;
    const p=ph<0.4?Math.sin(Math.PI*ph/0.4):0,e=Math.min(1,u/0.06)*Math.min(1,(1-u)/0.35);out[s0+i]+=amp*e*(p-0.25)}}
function formants(src,F,breath){let o=new Float32Array(src.length);const parts=[[F[0],5,1],[F[1],6,0.55],[F[2],8,0.28]];
  for(const [f,q,g] of parts){const y=filt(src,'bp',f,q);for(let i=0;i<o.length;i++)o[i]+=g*y[i]}
  if(breath){const b=filt(noiseArr(src.length),'bp',1500,0.7);let env=0;for(let i=0;i<o.length;i++){env+=(Math.abs(src[i])-env)*0.002;o[i]+=breath*b[i]*Math.min(1,env*6)}}
  return o}
function mkGrunt(f0){const s=arr(0.36),dur=rng(0.18,0.28);voiceSrc(s,f0*1.12,f0*0.86,0.005,dur,1,s);return mkBuf(norm(formants(s,[rng(650,780),rng(1080,1250),rng(2400,2700)],0.45),0.8))}
/* crowd voices: dozens of people, each with their own pitch and timing, then the vowel */
function mkCrowdVoice(kind){const len=kind==='ooh'?1.7:2.8,L=arr(len),R=arr(len),n=kind==='ooh'?40:55;
  for(let k=0;k<n;k++){const fem=Math.random()<0.45,f0=fem?rng(190,270):rng(100,150),t0=rng(0,kind==='ooh'?0.15:0.25),dur=rng(len*0.45,len*0.9)-t0;
    const rise=kind==='ooh'?rng(1.15,1.35):rng(1.05,1.2),pan=Math.random(),src=arr(len);voiceSrc(src,f0,f0*rise,t0,dur,rng(0.4,1),src);
    for(let i=0;i<src.length;i++){L[i]+=src[i]*(1-pan*0.6);R[i]+=src[i]*(0.4+pan*0.6)}}
  const F=kind==='ooh'?[330,820,2400]:[760,1180,2600];let l=formants(L,F,0.35),r=formants(R,F,0.35);
  if(kind!=='ooh')for(let w=0;w<3;w++){const t0=rng(0.2,1.2),sr=SR(),s0=Math.floor(t0*sr),d=rng(0.4,0.8),f=rng(2200,3000);let ph=0;   // a few whistles
    for(let i=0;i<d*sr&&s0+i<l.length;i++){const u=i/(d*sr),fr=f*(1+0.25*Math.sin(Math.PI*u));ph+=2*Math.PI*fr/sr;const v=0.25*Math.sin(Math.PI*u)*Math.sin(ph);l[s0+i]+=v;r[s0+i]+=v*0.7}}
  const m=Math.max(...[l,r].map(a=>a.reduce((x,v)=>Math.max(x,Math.abs(v)),0)))||1;for(const a of [l,r])for(let i=0;i<a.length;i++)a[i]*=0.85/m;
  return mkBuf(l,r)}
/* applause: individual clappers, each clapping in their own rhythm with their own hand sound */
function mkClapKernels(){const K=[];for(let k=0;k<24;k++){const o=arr(0.03);nz(o,'bp',rng(800,2200),rng(1.5,3.5),rng(0.003,0.007),1,0,0.0005);mode(o,rng(300,500),0.004,0.3,0);K.push(norm(o))}return K}
function mkApplause(n,len){const sr=SR(),L=arr(len),R=arr(len),K=SND.bank.kern;
  for(let c=0;c<n;c++){const rate=rng(3.2,5.8),pan=Math.random(),gl=1-pan*0.7,gr=0.3+pan*0.7,t0=Math.random()*0.35,t1=len*rng(0.5,0.98),kern=pickA(K),loud=rng(0.5,1);
    for(let t=t0;t<t1;t+=(1/rate)*rng(0.88,1.12)){const s0=Math.floor(t*sr),e=loud*rng(0.6,1)*(t<0.25?0.4+t*2.4:Math.max(0.05,1-(t-0.25)/(t1-0.25))*0.9+0.1);
      for(let i=0;i<kern.length&&s0+i<L.length;i++){const v=kern[i]*e;L[s0+i]+=v*gl;R[s0+i]+=v*gr}}}
  const l=filt(filt(L,'hp',350,0.7),'lp',7000,0.7),r=filt(filt(R,'hp',350,0.7),'lp',7000,0.7);const m=Math.max(...[l,r].map(a=>a.reduce((x,v)=>Math.max(x,Math.abs(v)),0)))||1;for(const a of [l,r])for(let i=0;i<a.length;i++)a[i]*=0.85/m;
  return mkBuf(l,r)}
/* the murmur of a crowd between points: many voices talking, filtered and looped */
function mkBabble(){const sr=SR(),len=4,L=arr(len),R=arr(len);
  for(let k=0;k<26;k++){const src=arr(len),f0=Math.random()<0.45?rng(180,250):rng(95,140),pan=Math.random();let t=Math.random()*0.5;
    while(t<len-0.3){const d=rng(0.08,0.25);voiceSrc(src,f0*rng(0.9,1.15),f0*rng(0.85,1.1),t,d,rng(0.3,1),src);t+=d+rng(0.03,0.35)}
    const v=formants(src,[rng(400,800),rng(1000,1800),2500],0.3);for(let i=0;i<v.length;i++){L[i]+=v[i]*(1-pan*0.6);R[i]+=v[i]*(0.4+pan*0.6)}}
  const fade=Math.floor(sr*0.2);for(const a of [L,R])for(let i=0;i<fade;i++){const k=i/fade;a[i]=a[i]*k+a[a.length-fade+i]*(1-k)}   // seamless loop
  const l=filt(L,'lp',2200,0.7),r=filt(R,'lp',2200,0.7);norm(l,0.8);norm(r,0.8);return mkBuf(l,r)}
/* venue echo: a short decaying noise tail with a couple of early reflections */
const VERB={club:[0.5,0.09],college:[0.9,0.13],tour:[1.4,0.17],masters:[1.6,0.19],major:[1.9,0.22]};
function mkIR(sec){const sr=SR(),n=Math.floor(sr*sec),b=SND.ctx.createBuffer(2,n,sr);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let lp=0;for(let i=0;i<n;i++){lp+=(Math.random()*2-1-lp)*0.35;d[i]=lp*Math.exp(-6.9*i/sr/sec)*0.6}
    for(const [t,a] of [[0.011,0.5],[0.023,0.35],[0.041,0.25],[0.067,0.15]]){const k=Math.floor((t+Math.random()*0.004)*sr);if(k<n)d[k]+=a*(ch?0.85:1)}}
  return b}
function setVerb(){if(!SND.ctx||!SND.conv)return;const k=(W3.venue&&W3.venue.kind)||'club',v=VERB[k]||VERB.club;if(SND.verbKind===k)return;SND.verbKind=k;
  try{SND.conv.buffer=mkIR(v[0])}catch(e){}SND.send.gain.setTargetAtTime(v[1],SND.ctx.currentTime,0.05)}

function sndInit(){
  if(SND.ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  let c;try{c=SND.ctx=new AC()}catch(e){return false}
  SND.master=c.createGain();SND.master.gain.value=SND.on?0.9:0;
  const comp=c.createDynamicsCompressor();comp.threshold.value=-10;comp.knee.value=8;comp.ratio.value=4;comp.attack.value=0.003;comp.release.value=0.2;
  SND.master.connect(comp);comp.connect(c.destination);
  SND.dry=c.createGain();SND.dry.connect(SND.master);SND.send=c.createGain();SND.send.gain.value=0.1;SND.conv=c.createConvolver();SND.send.connect(SND.conv);SND.conv.connect(SND.master);
  const B=SND.bank;
  // the sounds a rally needs, right away
  B.hit={};for(const k of ['top','slice','volley','smash','serve','drop'])B.hit[k]=[0,1,2,3].map(()=>mkHit(k));
  B.ping=[0,1,2].map(mkPing);B.frame=[0,1,2].map(mkFrame);B.net=[0,1].map(mkNet);
  B.bounce={};for(const s of ['hard','clay','grass'])B.bounce[s]=[0,1,2,3].map(()=>mkBounce(s));
  B.whoosh=[0,1,2].map(mkWhoosh);setVerb();SND.ready=true;
  // the rest a moment later, in small pieces so the first tap stays smooth
  const later=[()=>{B.squeak=[0,1,2,3].map(mkSqueak);B.slide=[0,1].map(mkSlide);B.scuff=[0,1].map(mkScuff)},
    ()=>{B.step={};for(const s of ['hard','clay','grass'])B.step[s]=[0,1,2].map(()=>mkStep(s))},
    ()=>{B.grunt={m:[0,1,2].map(()=>mkGrunt(rng(105,140))),f:[0,1,2].map(()=>mkGrunt(rng(200,240)))}},
    ()=>{B.kern=mkClapKernels();B.clapS=mkApplause(14,2.4)},()=>{B.clapM=mkApplause(70,3)},()=>{B.clapL=mkApplause(260,3.6)},
    ()=>{B.ooh=mkCrowdVoice('ooh')},()=>{B.cheer=mkCrowdVoice('cheer')},
    ()=>{B.babble=mkBabble();const s=c.createBufferSource();s.buffer=B.babble;s.loop=true;const g=SND.ambG=c.createGain();g.gain.value=0;s.connect(g);g.connect(SND.dry);s.start()}];
  let i=0;const step=()=>{if(i<later.length){try{later[i++]()}catch(e){console.error(e)}setTimeout(step,30)}};setTimeout(step,60);
  return true}
/* iPhones play web audio as "ambient" sound, which the silent switch mutes. Asking for the playback session (newer iOS)
   and running a silent media loop (older iOS) makes the game sound like any video or music app instead. */
function silentLoopUrl(){const n=4000,b=new Uint8Array(44+n),v=new DataView(b.buffer),w=(o,s)=>{for(let i=0;i<s.length;i++)b[o+i]=s.charCodeAt(i)};
  w(0,'RIFF');v.setUint32(4,36+n,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,8000,true);v.setUint32(28,8000,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,'data');v.setUint32(40,n,true);b.fill(128,44);
  return URL.createObjectURL(new Blob([b],{type:'audio/wav'}))}
function sndUnlockIOS(){try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
  if(SND.tag||!SND.on)return;try{const a=SND.tag=document.createElement('audio');a.src=silentLoopUrl();a.loop=true;a.setAttribute('playsinline','');a.volume=0.01;a.style.display='none';document.body.appendChild(a);const p=a.play();if(p&&p.catch)p.catch(()=>{SND.tag=null})}catch(e){SND.tag=null}}
function sndResume(){if(!sndInit())return;sndUnlockIOS();if(SND.ctx.state!=='running')SND.ctx.resume().catch(()=>{})}
function sndToggle(){SND.on=!SND.on;if(SND.tag){if(SND.on)SND.tag.play().catch(()=>{});else SND.tag.pause()}try{localStorage.setItem('tennis-go-sound',SND.on?'on':'off')}catch(e){}if(SND.master)SND.master.gain.setTargetAtTime(SND.on?0.9:0,SND.ctx.currentTime,0.05);if(!SND.on&&window.speechSynthesis)speechSynthesis.cancel();return SND.on}
function sndReady(){return SND.ctx&&SND.on&&SND.ready&&SND.ctx.state==='running'}

/* ---- playback: stereo position, distance, venue echo ---- */
function play(buf,o){if(!buf)return;o=o||{};const c=SND.ctx,s=c.createBufferSource();s.buffer=buf;s.playbackRate.value=o.rate||1;let n=s;
  if(o.lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;n.connect(f);n=f}
  const g=c.createGain();g.gain.value=o.gain==null?1:o.gain;n.connect(g);n=g;
  if(o.pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=clamp(o.pan,-1,1);n.connect(p);n=p}
  n.connect(SND.dry);if(o.wet!==0){const w=c.createGain();w.gain.value=o.wet==null?1:o.wet;n.connect(w);w.connect(SND.send)}
  s.start(c.currentTime+(o.when||0))}
/* where a sound sits: x across the court, z along it (world units; the camera is behind your baseline) */
function place(x,z){const d=Math.max(6,23-(z==null?8:z)),g=clamp(13/d,0.38,1.15);return{pan:clamp((x||0)/(HW*1.7),-0.75,0.75),gain:g,wet:clamp(0.6+(d-10)/18,0.6,1.8),lp:d>24?6500:0}}
function surfNow(){return W3.venue?W3.venue.surf:'hard'}
function crowdSize(){const V=W3.venue||{};return V.kind==='major'?(V.fill>0.8?1:0.6):V.kind==='masters'?0.8:V.kind==='tour'?0.7:V.kind==='college'?0.35:0.12}

/* ---- shots ---- */
function voiceOf(who){if(!M||!M.cfg)return'm';const id=who==='me'?M.cfg.meId:M.cfg.opp&&M.cfg.opp.id;return typeof FEMALE_BASE!=='undefined'&&FEMALE_BASE[id]?'f':'m'}
/* o: {pw 0..1.2, kind top|slice|volley|smash|serve|drop, q ok|perfect|frame, who me|op, x, z} */
function sndShot(o){if(!sndReady())return;const B=SND.bank,pw=clamp(o.pw==null?0.6:o.pw,0.15,1.2),P_=place(o.x,o.z);
  if(o.q==='frame'){play(pickA(B.frame),Object.assign({},P_,{gain:P_.gain*(0.5+0.4*pw),rate:rng(0.92,1.08)}));return}
  const kind=B.hit[o.kind]?o.kind:'top',lvl={top:0.75,slice:0.6,volley:0.7,smash:1.05,serve:0.95,drop:0.4}[kind]*(0.45+0.55*pw);
  play(pickA(B.hit[kind]),Object.assign({},P_,{gain:P_.gain*lvl,rate:rng(0.95,1.05)*(0.94+0.08*pw)}));
  if(o.q==='perfect')play(pickA(B.ping),Object.assign({},P_,{gain:P_.gain*0.55}));
  // a grunt on the big ones
  const big=kind==='smash'||(kind==='serve'&&pw>0.75)||pw>0.92;
  if(big&&B.grunt&&Math.random()<0.6){const v=voiceOf(o.who);play(pickA(B.grunt[v]),Object.assign({},P_,{gain:P_.gain*0.42,rate:rng(0.94,1.06),when:0.025,wet:P_.wet*0.8}))}}
function sndHit(pw){sndShot({pw})}   // kept for the lessons
/* the racket through the air, timed to peak at contact */
function sndSwing(pl,type,offset){if(!sndReady()||!SND.bank.whoosh||!P||!SWINGS[type])return;const who=pl===P[0]?'me':'op',S=SWINGS[type],toHit=S.dur*S.cf-(offset||0);if(toHit<0.06)return;
  const p=pl.pos||{x:0,z:0},P_=place(p.x,p.z);play(pickA(SND.bank.whoosh),Object.assign({},P_,{gain:P_.gain*0.22*(type==='sv'||type==='sm'?1.3:1),rate:rng(0.9,1.15),when:Math.max(0,toHit-0.13),wet:P_.wet*0.5}))}
function sndBounce(v,x,z){if(!sndReady())return;const s=surfNow(),k=clamp(v/12,0.2,1),P_=place(x,z);
  play(pickA(SND.bank.bounce[s]||SND.bank.bounce.hard),Object.assign({},P_,{gain:P_.gain*(s==='grass'?0.45:0.6)*k,rate:rng(0.95,1.06)}))}
function sndNet(){if(!sndReady())return;play(pickA(SND.bank.net),Object.assign(place(0,0),{gain:0.55}))}
/* feet: squeaks and slides when a player plants and changes direction, light steps while running */
const MOVE=[{v:0,vz:0,step:0,cool:0},{v:0,vz:0,step:0,cool:0}];
function sndMove(i,st,dt){if(!sndReady()||!SND.bank.squeak||!dt)return;const m=MOVE[i],sp=Math.hypot(st.v,st.vz),psp=Math.hypot(m.v,m.vz),acc=Math.hypot(st.v-m.v,st.vz-m.vz)/dt;
  m.cool-=dt;const P_=place(st.x,st.z),s=surfNow();
  if(m.cool<=0&&psp>2.2&&(acc>9||(Math.sign(st.v)!==Math.sign(m.v)&&Math.abs(m.v)>1.6))){m.cool=0.45;
    const B=SND.bank;if(s==='clay')play(pickA(B.slide),Object.assign({},P_,{gain:P_.gain*0.32*clamp(psp/5,0.4,1),rate:rng(0.9,1.1)}));
    else if(s==='grass')play(pickA(B.scuff),Object.assign({},P_,{gain:P_.gain*0.25,rate:rng(0.9,1.1)}));
    else if(Math.random()<0.8)play(pickA(B.squeak),Object.assign({},P_,{gain:P_.gain*0.18*clamp(psp/5,0.5,1),rate:rng(0.9,1.12)}))}
  m.step+=sp*dt;if(sp>1.4&&m.step>1.35&&SND.bank.step){m.step=0;play(pickA(SND.bank.step[s]||SND.bank.step.hard),Object.assign({},P_,{gain:P_.gain*0.13*clamp(sp/5,0.5,1),rate:rng(0.9,1.1),wet:0.4}))}
  m.v=st.v;m.vz=st.vz}

/* ---- the crowd ---- */
function sndApplause(amp){if(!sndReady())return;const z=crowdSize(),B=SND.bank,b=z>0.6?B.clapL:z>0.25?B.clapM:B.clapS;if(!b)return;
  play(b,{gain:clamp(amp,0,1.2)*(0.3+0.5*z),rate:rng(0.95,1.05),wet:1.3})}
function sndCrowdVoice(kind,amp){if(!sndReady())return;const z=crowdSize();if(z<0.3)return;const b=kind==='ooh'?SND.bank.ooh:SND.bank.cheer;if(!b)return;
  play(b,{gain:amp*z*(kind==='ooh'?0.7:0.6),rate:rng(0.94,1.06),wet:1.4})}
/* the murmur between points, hushed during them; birds at the club */
function sndAmbience(live){if(!SND.ctx)return;setVerb();
  if(SND.ambG){const z=crowdSize(),target=SND.on?(live?0.02:0.11)*(0.15+z):0;if(Math.abs(target-SND.level)>0.002){SND.level=target;SND.ambG.gain.setTargetAtTime(target,SND.ctx.currentTime,live?0.25:0.8)}}
  const V=W3.venue;if(sndReady()&&V&&V.kind==='club'){const t=SND.ctx.currentTime;if(!SND.birdT)SND.birdT=t+rng(3,8);if(t>SND.birdT){SND.birdT=t+rng(5,13);chirp()}}}
function chirp(){const c=SND.ctx,t0=c.currentTime,n=2+Math.floor(Math.random()*3),f=rng(3200,4600),pan=rng(-0.8,0.8);
  for(let k=0;k<n;k++){const o=c.createOscillator(),g=c.createGain(),t=t0+k*rng(0.09,0.14);o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*rng(1.15,1.35),t+0.05);
    g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.025,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+0.07);o.connect(g);
    if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;g.connect(p);p.connect(SND.dry)}else g.connect(SND.dry);o.start(t);o.stop(t+0.09)}}
/* voices: line judges call it, the chair umpire calls the score (tour events and majors only) */
function hasOfficials(){const V=W3.venue;return V&&(V.kind==='tour'||V.kind==='major')}
function speak(txt,o){if(!SND.on||!window.speechSynthesis)return;try{const u=new SpeechSynthesisUtterance(txt);u.rate=(o&&o.rate)||1;u.pitch=(o&&o.pitch)||1;u.volume=(o&&o.vol)||0.9;u.lang='en-GB';
  if(o&&o.cut)speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
function lineCall(word){if(hasOfficials())speak(word,{rate:1.15,pitch:1.15,cut:true})}
function umpireScore(prevGames,prevSets){
  if(!hasOfficials()||!M)return;const nm=i=>i===0?M.cfg.me:M.cfg.opp.name,g=M.sets[M.sets.length-1];
  const games=M.sets.reduce((a,s)=>a+s[0]+s[1],0);
  if(M.over){speak('Game, set and match, '+nm(M.winner)+'.',{rate:0.95});return}
  if(M.sets.length!==prevSets){speak('Game and set, '+nm(M.setsWon[0]>M.setsWon[1]?0:1)+'.',{rate:0.95});return}
  if(games!==prevGames){    speak('Game, '+nm(M.lastGame)+'. '+(M.tb?'Tiebreak.':''),{rate:0.95});return}
  const s=M.server,a=M.pts[s],b=M.pts[1-s];
  if(M.tb){speak(M.pts[0]+', '+M.pts[1],{rate:0.95});return}
  const W=['love','fifteen','thirty','forty'];let t;
  if(a>=3&&b>=3)t=a===b?'Deuce':'Advantage, '+nm(a>b?s:1-s);else if(a===b)t=W[a]+' all';else t=W[a]+', '+W[b];
  speak(t.charAt(0).toUpperCase()+t.slice(1),{rate:0.95})}
