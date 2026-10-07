/* ================= sound: everything synthesised in code, no audio files =================
   At the first tap a bank of short sounds is rendered with simple physical models (damped string and ball modes,
   filtered noise, glottal pulses through vowel formants), several variants of each so repeats never sound identical.
   Shots: a different contact for drives, slices, volleys, smashes and serves, a crisper ring on perfect timing and a
   clunk off the frame. Swing whooshes, grunts on big hits, shoe squeaks / clay slides / grass scuffs and footsteps,
   surface-tuned bounces, the net. Crowds are built from individual clappers and voices. Everything is placed in
   stereo, quieter and wetter on the far side, through a venue echo sized from a club court up to a major stadium. */
const SND={ctx:null,on:true,amb:null,ambG:null,level:0,buf:{},bank:{},ready:false};
try{SND.on=localStorage.getItem('tennis-go-sound')!=='off'}catch(e){}
function mkBuf(L,R){const c=SND.ctx,b=c.createBuffer(R?2:1,L.length,SR());b.getChannelData(0).set(L);if(R)b.getChannelData(1).set(R);return b}
/*DSP{*/
const SR=()=>SND.srO||SND.ctx.sampleRate,rng=(a,b)=>a+Math.random()*(b-a),pickA=a=>a[Math.floor(Math.random()*a.length)];

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

/* ---- the sound bank ---- */
function mkHit(kind){const o=arr(0.25),soft=kind==='slice'||kind==='drop',vol=kind==='volley',f0=rng(470,600);
  nz(o,'bp',rng(2500,3500),0.7,0.0011,soft?0.3:0.85);                         // the contact click
  nz(o,'bp',rng(950,1250),3,0.0035,soft?0.35:0.9,0,0.0003);                   // the ball's hollow pock: resonant noise, not a tone
  nz(o,'bp',rng(380,520),1.8,0.006*(vol?1.3:1),soft?0.45:0.8,0,0.0005);       // the string bed's thock
  mode(o,f0,0.004,soft?0.08:0.12,0.0005,0.05);mode(o,f0*1.07,0.0035,0.07,0.0005);   // only a trace of string ring, detuned so it doesn't sing
  nz(o,'lp',320,0.8,0.012*(vol?1.5:1),vol?0.9:0.6,0,0.001);                   // racket and arm
  if(kind==='top')nz(o,'hp',3000,0.7,0.008,0.22,0.001,0.006);                 // strings brushing up the back of the ball
  if(kind==='slice')nz(o,'bp',1600,0.9,0.018,0.45,0,0.012);                   // the chop under it
  if(kind==='smash'||kind==='serve'){nz(o,'lp',5500,0.7,0.003,0.9,0);nz(o,'lp',200,0.8,0.02,0.7,0,0.001)}   // the crack and the weight behind it
  return mkBuf(norm(o))}
/* a perfect hit: a cleaner click and a deeper thump (not a ring) */
function mkPing(){const o=arr(0.15);nz(o,'bp',3000,0.8,0.0008,0.6,0);nz(o,'lp',230,0.8,0.02,1,0,0.001);nz(o,'bp',600,1.5,0.006,0.4,0);return mkBuf(norm(o,0.8))}
function mkFrame(){const o=arr(0.35);[[310,0.03,0.8],[820,0.02,0.5],[1490,0.014,0.3],[2640,0.01,0.15]].forEach(([f,t,a])=>mode(o,f*rng(0.95,1.05),t,a,0));
  nz(o,'bp',900,2,0.04,0.35,0.002,0,t=>0.5+0.5*Math.sign(Math.sin(2*Math.PI*70*t)));nz(o,'bp',2500,0.8,0.0015,0.4,0);return mkBuf(norm(o))}
function mkBounce(s){const o=arr(0.2);
  if(s==='hard'){nz(o,'bp',3000,0.8,0.0009,0.8);nz(o,'bp',rng(1000,1250),3,0.0035,0.9,0,0.0003);nz(o,'lp',220,0.8,0.01,0.7,0,0.0008)}
  else if(s==='clay'){nz(o,'bp',rng(800,950),2,0.003,0.45,0,0.0003);mode(o,rng(150,170),0.016,0.75,0);nz(o,'bp',2500,1,0.025,0.4,0.001,0.003,crackle(0.08))}
  else{nz(o,'lp',200,0.8,0.016,0.9,0,0.001);nz(o,'lp',700,0.7,0.012,0.6,0)}
  return mkBuf(norm(o))}
function mkNet(){const o=arr(0.45);nz(o,'bp',1400,1.2,0.07,0.6,0,0.004,t=>0.6+0.4*Math.sin(2*Math.PI*35*t));mode(o,85,0.05,0.7,0);nz(o,'hp',4000,0.7,0.03,0.2,0.005);return mkBuf(norm(o))}
/* a shoe squeak: rubber sticking and slipping on the court, a rough buzz (not a clean tone) through a shoe-sized resonance */
function mkSqueak(){const sr=SR(),dur=rng(0.06,0.12),o=arr(dur+0.04),f0=rng(650,1050);let ph=0,j=0;
  for(let i=0;i<o.length;i++){const t=i/sr,u=t/dur;if(i%Math.floor(sr/400)===0)j=(Math.random()-0.5)*0.16;const f=f0*(1+0.12*u+j);ph+=f/sr;if(ph>=1)ph-=1;
    const e=Math.min(1,t/0.006)*(u<1?1:Math.exp(-(t-dur)/0.008));o[i]=e*((ph*2-1)*0.7+(Math.random()*2-1)*0.3)}
  const a=filt(o,'bp',rng(1300,1800),2),b=filt(o,'bp',rng(2600,3200),3);for(let i=0;i<o.length;i++)o[i]=a[i]+0.4*b[i];
  return mkBuf(norm(o,0.6))}
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
/* ---- the crowd ----
   Real crowds sound the way they do because most of the people are far away (duller and quieter), every clap and
   voice is a little different, and the whole lot is smeared by the stadium. So: near / middle / far clappers with
   cupped and flat hands, voices with a soft breathy tone and their own "yeah" / "woo" / "ooh" shapes, and a reverb
   rendered into each sound. */
/* a small Freeverb (eight combs, four allpasses) run offline on a stereo pair */
function verbOff(L,R,size,wet,tail){const sr=SR(),k=sr/44100,n=L.length+Math.floor(sr*(tail||0.8)),oL=new Float32Array(n),oR=new Float32Array(n);
  const CB=[1116,1188,1277,1356,1422,1491,1557,1617],AP=[556,441,341,225],fb=0.7+0.28*size,damp=0.25;
  for(const [src,out,spread] of [[L,oL,0],[R,oR,23]]){const wetBuf=new Float32Array(n);
    for(const d0 of CB){const d=Math.floor((d0+spread)*k),buf=new Float32Array(d);let idx=0,f=0;
      for(let i=0;i<n;i++){const x=i<src.length?src[i]:0,y=buf[idx];f=y*(1-damp)+f*damp;buf[idx]=x*0.015+f*fb;idx=(idx+1)%d;wetBuf[i]+=y}}
    for(const a0 of AP){const d=Math.floor((a0+spread)*k),buf=new Float32Array(d);let idx=0;
      for(let i=0;i<n;i++){const b=buf[idx],x=wetBuf[i];buf[idx]=x+b*0.5;wetBuf[i]=b-x;idx=(idx+1)%d}}
    for(let i=0;i<n;i++)out[i]=(i<src.length?src[i]*(1-wet*0.5):0)+wetBuf[i]*wet}
  return[oL,oR]}
function lp1(x,fc){const a=1-Math.exp(-2*Math.PI*fc/SR());let y=0;for(let i=0;i<x.length;i++){y+=a*(x[i]-y);x[i]=y}return x}
function scale2(l,r,peak){let m=0;for(let i=0;i<l.length;i++)m=Math.max(m,Math.abs(l[i]),Math.abs(r[i]));const k=(peak||0.85)/(m||1);for(let i=0;i<l.length;i++){l[i]*=k;r[i]*=k}}
/* band-pass whose centre moves over time (a vowel changing shape) */
function fvar(x,fFn,Q){const sr=SR(),y=new Float32Array(x.length);let x1=0,x2=0,y1=0,y2=0,c=null;
  for(let i=0;i<x.length;i++){if(i%64===0)c=biq('bp',fFn(i/x.length),Q,sr);const v=c.b0*x[i]+c.b1*x1+c.b2*x2-c.a1*y1-c.a2*y2;x2=x1;x1=x[i];y2=y1;y1=v;y[i]=v}return y}
/* one person: a soft (not buzzy) voice source with breath, shaped by a pitch contour and a vowel path */
function person(dur,f0,pitch,F1,F2,breath){const sr=SR(),src=arr(dur+0.04),s0=0,m=Math.floor(dur*sr);let ph=0;const vib=rng(4.5,6.5),vd=rng(0.006,0.018);
  for(let i=0;i<m;i++){const u=i/m,f=f0*pitch(u)*(1+vd*Math.sin(2*Math.PI*vib*i/sr));ph+=f/sr;if(ph>=1)ph-=1;
    const g=ph<0.6?0.5-0.5*Math.cos(2*Math.PI*ph/0.6):0,e=Math.min(1,u/0.08)*Math.min(1,(1-u)/0.3);src[s0+i]=e*(g-0.3+breath*(Math.random()*2-1)*(0.3+g))}
  lp1(src,f0*7);const a=fvar(src,u=>F1(Math.min(1,u*(dur+0.04)/dur)),4),b=fvar(src,u=>F2(Math.min(1,u*(dur+0.04)/dur)),5),c=filt(src,'bp',2600,6);
  for(let i=0;i<src.length;i++)src[i]=a[i]+0.5*b[i]+0.15*c[i];return src}
const lerp=(a,b)=>u=>a+(b-a)*u;
function addAt(L,R,v,t,g,pan){const s0=Math.floor(t*SR());for(let i=0;i<v.length&&s0+i<L.length;i++){const x=v[i]*g;L[s0+i]+=x*(1-pan*0.6);R[s0+i]+=x*(0.4+pan*0.6)}}
const SHOUT={
  yeah:()=>({d:rng(0.35,0.8),p:u=>1+0.28*Math.sin(Math.PI*Math.min(1,u*1.4)),F1:lerp(rng(480,540),rng(720,800)),F2:lerp(rng(1800,2000),rng(1200,1300))}),
  woo:()=>({d:rng(0.6,1.3),p:u=>1+0.55*Math.min(1,u*2.2)-0.15*Math.max(0,u-0.6),F1:()=>320,F2:lerp(700,800)}),
  ahh:()=>({d:rng(0.5,1.1),p:u=>1+0.15*Math.sin(Math.PI*u),F1:()=>rng(720,780),F2:()=>1150}),
  ooh:()=>({d:rng(0.7,1.3),p:u=>1+0.3*Math.sin(Math.PI*Math.min(1,u*1.3)),F1:()=>330,F2:lerp(780,860)}),
  aww:()=>({d:rng(0.6,1.1),p:u=>1.15-0.25*u,F1:lerp(620,560),F2:lerp(1000,900)})};
/* where each person sits: near (bright), middle, far (dull and quiet) */
function seat(){const r=Math.random();return r<0.1?{g:1,lp:0}:r<0.4?{g:0.55,lp:4500}:{g:0.3,lp:2200}}
/* crowds have no real treble, so they are rendered at a lower rate: two to three times quicker to build */
function lowRate(f){return(...a)=>{SND.srO=22050;try{return f(...a)}finally{SND.srO=0}}}
const mkCrowdVoiceLR=lowRate((kind,n,room)=>mkCrowdVoice(kind,n,room)),mkRoomToneLR=lowRate((z,room,o)=>mkRoomTone(z,room,o)),mkApplauseLR=lowRate((n,l,z,w,t)=>mkApplause(n,l,z,w,t)),mkClapKernelsLR=lowRate(()=>mkClapKernels());
function mkCrowdVoice(kind,nV,room){const len=kind==='ooh'?2:3.2,L=arr(len+0.1),R=arr(len+0.1),n=Math.max(4,Math.round((nV||40)*(kind==='ooh'?0.8:1))),mix=kind==='ooh'?['ooh','ooh','ooh','aww']:['yeah','yeah','woo','ahh','woo'];
  for(let k=0;k<n;k++){const fem=Math.random()<0.45,f0=fem?rng(195,280):rng(100,155),S=SHOUT[pickA(mix)](),t0=rng(0,kind==='ooh'?0.18:0.45),d=Math.min(S.d,len-t0-0.05);
    const v=person(d,f0,S.p,S.F1,S.F2,rng(0.15,0.45)),st=seat();if(st.lp)lp1(v,st.lp);const pan=Math.random(),a=st.g*rng(0.5,1);addAt(L,R,v,t0,a,pan);
    if(kind!=='ooh'&&Math.random()<0.35){const S2=SHOUT[pickA(mix)](),t1=t0+d+rng(0.1,0.4);if(t1<len-0.4){const v2=person(Math.min(S2.d,len-t1-0.05),f0*rng(0.95,1.1),S2.p,S2.F1,S2.F2,0.3);if(st.lp)lp1(v2,st.lp);addAt(L,R,v2,t1,a,pan)}}}
  if(kind!=='ooh')for(let w=0;w<3;w++){const sr=SR(),t0=rng(0.2,1.4),s0=Math.floor(t0*sr),d=rng(0.35,0.7),f=rng(2200,3000),st=seat(),pan=Math.random();let ph=0;   // a few whistles
    for(let i=0;i<d*sr&&s0+i<L.length;i++){const u=i/(d*sr),fr=f*(1+0.2*Math.sin(Math.PI*u)+0.01*Math.sin(2*Math.PI*30*i/sr));ph+=2*Math.PI*fr/sr;const v=0.12*st.g*Math.sin(Math.PI*u)*Math.sin(ph);L[s0+i]+=v*(1-pan*0.6);R[s0+i]+=v*(0.4+pan*0.6)}}
  const rm=room||[0.75,0.45,1],[l,r]=verbOff(L,R,rm[0],rm[1],rm[2]);scale2(l,r);return mkBuf(l,r)}
/* applause */
function clapKernel(cupped,lp){const o=arr(0.05);nz(o,'bp',2500,1,0.0005,0.25,0);   // a soft edge, not a bright click
  if(cupped){nz(o,'bp',rng(600,1000),rng(2.5,4),rng(0.004,0.008),1,0,0.0004);mode(o,rng(330,450),0.005,0.35,0)}
  else{nz(o,'bp',rng(1300,2200),rng(1.5,2.8),rng(0.0025,0.0045),1,0,0.0003);mode(o,rng(800,1100),0.002,0.2,0)}
  nz(o,'bp',rng(700,1400),2,0.003,0.12,rng(0.006,0.012));   // the first reflection off the hands and body
  if(lp)lp1(lp1(o,lp),lp*1.3);return norm(o)}
function mkClapKernels(){const K={near:[],mid:[],far:[]};for(let k=0;k<8;k++){const c=k%2===0;K.near.push(clapKernel(c,7000));K.mid.push(clapKernel(c,3500));K.far.push(clapKernel(c,1800))}return K}
/* clappers sit in loose groups that drift in and out of time with each other, like a real crowd; a few close ones stand out */
function mkApplause(n,len,size,wet,tail){const sr=SR(),L=arr(len),R=arr(len),K=SND.bank.kern,small=n<30;
  const one=(pos,g,rate,ph,pan,t0,t1)=>{const kern=pickA(K[pos]),gl=1-pan*0.7,gr=0.3+pan*0.7;
    for(let t=t0+ph;t<t1;t+=(1/rate)*rng(0.94,1.06)){const s0=Math.floor(t*sr),u=(t-t0)/(t1-t0),e=g*rng(0.7,1)*Math.min(1,(t-t0)/0.15+0.3)*(1-0.3*u)*(t1-t<0.5?(t1-t)/0.5+0.2:1);
      for(let i=0;i<kern.length&&s0+i<L.length;i++){const v=kern[i]*e;L[s0+i]+=v*gl;R[s0+i]+=v*gr}}};
  let c=0;while(c<n){const gsz=Math.min(n-c,small?1+Math.floor(Math.random()*2):4+Math.floor(Math.random()*8)),rate=clamp(4.6+0.8*(Math.random()+Math.random()+Math.random()-1.5)*1.4,3,6.5),ph=Math.random()/rate;
    for(let k=0;k<gsz;k++,c++){const r=Math.random(),pos=small?(r<0.45?'near':'mid'):r<0.2?'near':r<0.6?'mid':'far',g={near:1,mid:0.5,far:0.25}[pos]*rng(0.6,1);
      const t0=-Math.log(1-Math.random()*0.95)*0.12,t1=len*(0.35+0.6*Math.pow(Math.random(),0.7));one(pos,g,rate*rng(0.97,1.03),ph+rng(-0.015,0.015),Math.random(),t0,t1)}}
  for(let k=0;k<(small?1:6);k++)one('near',1.3,rng(4,5.5),Math.random()*0.2,Math.random(),rng(0,0.1),len*rng(0.6,0.95));   // the keen ones near you
  const [l,r]=verbOff(filt(L,'hp',250,0.7),filt(R,'hp',250,0.7),size,wet!=null?wet:small?0.15:0.22,tail||(small?0.5:0.8));lp1(l,6000);lp1(r,6000);scale2(l,r);return mkBuf(l,r)}
/* the sound of a venue between points, with no voices in it (voices babbling read as eerie): a warm room tone with a slow
   swell and a soft rustle of people shifting in their seats; outdoors at the club, a light breeze instead */
function mkRoomTone(z,room,outdoor){const sr=SR(),len=6,n=Math.floor(sr*len),L=new Float32Array(n),R=new Float32Array(n);
  for(const [a,ph0] of [[L,0],[R,1.7]]){let b=0,p=0;const m1=rng(0.15,0.3),m2=rng(0.4,0.7);
    for(let i=0;i<n;i++){const w=Math.random()*2-1;b=(b+0.02*w)/1.02;p=0.97*p+0.03*w;   // brown and a little pink
      const t=i/sr,swell=1+0.18*Math.sin(2*Math.PI*m1*t+ph0)+0.08*Math.sin(2*Math.PI*m2*t);a[i]=(b*3*(outdoor?0.6:1)+p*(outdoor?0.6:0.25))*swell}}
  let l=filt(filt(L,'hp',60,0.7),'lp',outdoor?900:650,0.7),r=filt(filt(R,'hp',60,0.7),'lp',outdoor?900:650,0.7);
  if(!outdoor){const rs=[filt(noiseArr(n),'bp',2200,0.6),filt(noiseArr(n),'bp',2200,0.6)];   // rustle: little bursts, here and there
    for(let k=0;k<Math.round(6+z*30);k++){const s0=Math.floor(Math.random()*(n-sr)),d=Math.floor(sr*rng(0.08,0.3)),g=rng(0.02,0.06)*(0.5+z),c=Math.random()<0.5?0:1;
      for(let i=0;i<d;i++){const e=Math.sin(Math.PI*i/d);(c?r:l)[s0+i]+=rs[c][s0+i]*g*e}}}
  const fade=Math.floor(sr*0.4);for(const a of [l,r])for(let i=0;i<fade;i++){const q=i/fade;a[i]=a[i]*q+a[n-fade+i]*(1-q)}   // seamless loop
  scale2(l,r,0.8);return mkBuf(l,r)}
/* what the background worker builds: the shot and footwork sounds, and a venue's crowd */
function genBank(){const B={};B.hit={};for(const k of ['top','slice','volley','smash','serve','drop'])B.hit[k]=[0,1,2,3].map(()=>mkHit(k));
  B.ping=[0,1,2].map(mkPing);B.frame=[0,1,2].map(mkFrame);B.net=[0,1].map(mkNet);B.bounce={};for(const s of ['hard','clay','grass'])B.bounce[s]=[0,1,2,3].map(()=>mkBounce(s));
  B.whoosh=[0,1,2].map(mkWhoosh);B.squeak=[0,1,2,3].map(mkSqueak);B.slide=[0,1].map(mkSlide);B.scuff=[0,1].map(mkScuff);
  B.step={};for(const s of ['hard','clay','grass'])B.step[s]=[0,1,2].map(()=>mkStep(s));B.grunt={m:[0,1,2].map(()=>mkGrunt(rng(105,140))),f:[0,1,2].map(()=>mkGrunt(rng(200,240)))};B.clap1=[0,1,2].map(mkGroupClap);return B}
/* a dozen people clapping together, for the Hawk-Eye slow clap */
function mkGroupClap(){const L=arr(0.12);for(let k=0;k<12;k++){const ke=clapKernel(k%2===0,k<3?6000:3500),s0=Math.floor(rng(0,0.025)*SR()),g=rng(0.4,1);for(let i=0;i<ke.length&&s0+i<L.length;i++)L[s0+i]+=ke[i]*g}return mkBuf(norm(L,0.8))}
function genVenue(C){if(!SND.bank.kern)SND.bank.kern=mkClapKernelsLR();const V={clap:mkApplauseLR(C.claps,C.clapLen,C.room[0],C.room[1],C.room[2])};
  if(C.voices){V.ooh=mkCrowdVoiceLR('ooh',C.voices,C.room);V.cheer=mkCrowdVoiceLR('cheer',C.voices,C.room)}V.babble=mkRoomToneLR(C.z,C.room,C.outdoor);return V}
/*}DSP*/
/*@DSPSRC*/
/* sound building runs on a background thread (a Web Worker made from the code above) so the game never stutters;
   without workers it falls back to building here */
function rawToBuf(o){if(!o||(typeof AudioBuffer!=='undefined'&&o instanceof AudioBuffer))return o;
  if(o.L instanceof Float32Array){const b=SND.ctx.createBuffer(o.R?2:1,o.L.length,o.sr);b.getChannelData(0).set(o.L);if(o.R)b.getChannelData(1).set(o.R);return b}
  if(Array.isArray(o))return o.map(rawToBuf);if(typeof o==='object'){const r={};for(const k in o)r[k]=rawToBuf(o[k]);return r}return o}
let DSPW=null,DSPN=0;const DSPCB={};
function dspWorker(){if(DSPW!==null)return DSPW;DSPW=false;if(!window.Worker||typeof DSP_SRC!=='string')return false;
  try{const pre="const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const SND={srO:0,bank:{},ctx:{sampleRate:44100}};function mkBuf(L,R){return{L,R,sr:SR()}}\n";
    const post="\nonmessage=e=>{const d=e.data;SND.ctx.sampleRate=d.sr;let out;try{out=d.job==='bank'?genBank():genVenue(d.arg)}catch(err){postMessage({id:d.id,err:String(err)});return}const tr=[];(function walk(o){if(!o)return;if(o.L instanceof Float32Array){tr.push(o.L.buffer);if(o.R)tr.push(o.R.buffer);return}if(typeof o==='object')for(const k in o)walk(o[k])})(out);postMessage({id:d.id,out},tr)}";
    const w=new Worker(URL.createObjectURL(new Blob([pre+DSP_SRC+post],{type:'text/javascript'})));
    w.onmessage=e=>{const f=DSPCB[e.data.id];delete DSPCB[e.data.id];if(f)f(e.data.err?null:e.data.out)};
    w.onerror=e=>{e.preventDefault&&e.preventDefault();DSPW=false;for(const k in DSPCB){const f=DSPCB[k];delete DSPCB[k];f(null)}};DSPW=w}catch(e){DSPW=false}
  return DSPW}
function dsp(job,arg,cb){const inline=()=>job==='bank'?genBank():genVenue(arg),w=dspWorker();
  if(w){const id=++DSPN,t0=performance.now();DSPCB[id]=out=>{(SND.tm=SND.tm||[]).push(job+' '+Math.round(performance.now()-t0)+'ms (background)');cb(out?rawToBuf(out):inline())};w.postMessage({id,job,arg,sr:SND.ctx.sampleRate});return}
  const t0=performance.now();const r=inline();(SND.tm=SND.tm||[]).push(job+' '+Math.round(performance.now()-t0)+'ms (inline)');cb(r)}
/* venue echo: a short decaying noise tail with a couple of early reflections */
const VERB={club:[0.5,0.09],college:[0.9,0.13],tour:[1.4,0.17],masters:[1.6,0.19],major:[1.9,0.22]};
function mkIR(sec){const sr=SR(),n=Math.floor(sr*sec),b=SND.ctx.createBuffer(2,n,sr);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let lp=0;for(let i=0;i<n;i++){lp+=(Math.random()*2-1-lp)*0.35;d[i]=lp*Math.exp(-6.9*i/sr/sec)*0.6}
    for(const [t,a] of [[0.011,0.5],[0.023,0.35],[0.041,0.25],[0.067,0.15]]){const k=Math.floor((t+Math.random()*0.004)*sr);if(k<n)d[k]+=a*(ch?0.85:1)}}
  return b}
function setVerb(){if(!SND.ctx||!SND.conv)return;sndVenue();const V0=W3.venue||{},k=V0.kind==='tour'&&(V0.rows||12)>=16?'masters':V0.kind||'club',v=VERB[k]||VERB.club;if(SND.verbKind===k)return;SND.verbKind=k;
  try{SND.conv.buffer=mkIR(v[0])}catch(e){}SND.send.gain.setTargetAtTime(v[1],SND.ctx.currentTime,0.05)}

function sndInit(){
  if(SND.ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  let c;try{c=SND.ctx=new AC()}catch(e){return false}
  SND.master=c.createGain();SND.master.gain.value=SND.on?0.9:0;
  const comp=c.createDynamicsCompressor();comp.threshold.value=-10;comp.knee.value=8;comp.ratio.value=4;comp.attack.value=0.003;comp.release.value=0.2;
  SND.master.connect(comp);comp.connect(c.destination);
  SND.dry=c.createGain();SND.dry.connect(SND.master);SND.send=c.createGain();SND.send.gain.value=0.1;SND.conv=c.createConvolver();SND.send.connect(SND.conv);SND.conv.connect(SND.master);
  const g=SND.ambG=c.createGain();g.gain.value=0;g.connect(SND.dry);
  loadRecordings();
  dsp('bank',null,B=>{Object.assign(SND.bank,B);SND.ready=true;SND.kernOK=true;setVerb();sndVenue()});
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
/* the crowd you'd find at this venue: how many people, how many of them clap or shout, and how enclosed it is.
   Each major has its own character: New York loud, London polite. */
function crowdProfile(V){V=V||W3.venue||{kind:'club',fill:0.5};const f=V.fill||0.5,big=V.kind==='tour'&&(V.rows||12)>=16;
  const people=V.kind==='major'?16000*f:V.kind==='tour'?(big?8000:3500)*f:V.kind==='college'?260*f:30*f,z=clamp(Math.log10(Math.max(10,people))/4.2,0.1,1);
  const room=V.kind==='major'?[0.85,0.28,1.1]:V.kind==='tour'?(big?[0.8,0.25,1]:[0.7,0.22,0.8]):V.kind==='college'?[0.5,0.15,0.5]:[0.3,0.08,0.3];
  return{key:V.kind+'|'+(V.rows||0)+'|'+f+'|'+(V.major||''),people,z,room,outdoor:V.kind==='club',claps:clamp(Math.round(Math.sqrt(people)*1.6),5,130),clapLen:2.2+z*1.6,voices:z<0.3?0:Math.round(z*55*({'New York':1.25,London:0.65,Paris:1.05,Melbourne:1.1}[V.major]||1)),talkers:Math.round(4+z*22)}}
function crowdSize(){return crowdProfile().z}
SND.profile=()=>crowdProfile();
/* build this venue's applause, shouts and murmur (at the start of each match, a little at a time) */
function sndVenue(){if(!SND.ctx||!SND.kernOK)return;const C=crowdProfile();if(SND.vKey===C.key)return;SND.vKey=C.key;const key=C.key;
  dsp('venue',C,V=>{if(SND.vKey!==key)return;SND.vb=V;try{if(SND.ambSrc)SND.ambSrc.stop()}catch(e){}const s=SND.ambSrc=SND.ctx.createBufferSource();s.buffer=RECS.buf['crowd-ambience']||V.babble;s.loop=true;s.connect(SND.ambG);s.start()})}

/* ---- shots ---- */
function voiceOf(who){if(!M||!M.cfg)return'm';const id=who==='me'?M.cfg.meId:M.cfg.opp&&M.cfg.opp.id;return typeof FEMALE_BASE!=='undefined'&&FEMALE_BASE[id]?'f':'m'}
/* o: {pw 0..1.2, kind top|slice|volley|smash|serve|drop, q ok|perfect|frame, who me|op, x, z} */
function sndShot(o){if(!sndReady())return;const B=SND.bank,pw=clamp(o.pw==null?0.6:o.pw,0.15,1.2),P_=place(o.x,o.z);
  if(o.q==='frame'){play(pickA(B.frame),Object.assign({},P_,{gain:P_.gain*(0.5+0.4*pw),rate:rng(0.92,1.08)}));return}
  const kind=B.hit[o.kind]?o.kind:'top',lvl={top:0.75,slice:0.6,volley:0.7,smash:1.05,serve:0.95,drop:0.4}[kind]*(0.45+0.55*pw);
  play(pickA(B.hit[kind]),Object.assign({},P_,{gain:P_.gain*lvl,rate:rng(0.95,1.05)*(0.94+0.08*pw)}));
  if(o.q==='perfect')play(pickA(B.ping),Object.assign({},P_,{gain:P_.gain*0.5}));
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
  if(m.cool<=0&&psp>2.6&&(acc>12||(Math.sign(st.v)!==Math.sign(m.v)&&Math.abs(m.v)>2.2))){m.cool=0.7;
    const B=SND.bank;if(s==='clay')play(pickA(B.slide),Object.assign({},P_,{gain:P_.gain*0.32*clamp(psp/5,0.4,1),rate:rng(0.9,1.1)}));
    else if(s==='grass')play(pickA(B.scuff),Object.assign({},P_,{gain:P_.gain*0.25,rate:rng(0.9,1.1)}));
    else if(Math.random()<0.5)play(pickA(B.squeak),Object.assign({},P_,{gain:P_.gain*0.12*clamp(psp/5,0.5,1),rate:rng(0.92,1.08)}))}
  m.step+=sp*dt;if(sp>1.4&&m.step>1.35&&SND.bank.step){m.step=0;play(pickA(SND.bank.step[s]||SND.bank.step.hard),Object.assign({},P_,{gain:P_.gain*0.13*clamp(sp/5,0.5,1),rate:rng(0.9,1.1),wet:0.4}))}
  m.v=st.v;m.vz=st.vz}

/* ---- the crowd ---- */
/* ---- real recordings (optional) ----
   If sounds/sounds.json exists it lists recordings to use instead of the generated crowd, e.g.
   {"applause-small":"applause-small.mp3","applause-medium":"...","applause-large":"...","cheer":"...","ooh":"...","crowd-ambience":"..."}
   Anything not listed keeps the generated sound. Recordings still get each venue's size (which clip, how loud) and echo. */
const RECS={buf:{},tried:false};
function loadRecordings(){if(RECS.tried||!SND.ctx||typeof fetch!=='function'||location.protocol==='file:')return;RECS.tried=true;
  fetch('sounds/sounds.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(list=>{if(!list)return;
    for(const k in list)fetch('sounds/'+list[k]).then(r=>r.ok?r.arrayBuffer():null).then(a=>a&&SND.ctx.decodeAudioData(a)).then(b=>{if(b){RECS.buf[k]=b;if(k==='crowd-ambience')SND.vKey=null}}).catch(()=>{})}).catch(()=>{})}
function recClap(z){const R=RECS.buf;return z>0.6?R['applause-large']||R['applause-medium']:z>0.3?R['applause-medium']||R['applause-large']||R['applause-small']:R['applause-small']||R['applause-medium']}
function sndApplause(amp){if(!sndReady()||!SND.vb)return;const z=crowdSize(),rec=recClap(z);
  if(rec){play(rec,{gain:clamp(amp,0,1.2)*(0.35+0.6*z),rate:rng(0.97,1.03),wet:0.6});return}
  const b=SND.vb.clap;if(!b)return;
  play(b,{gain:clamp(amp,0,1.2)*(0.3+0.5*z)*1.6,rate:rng(0.96,1.04),wet:1})}
function sndCrowdVoice(kind,amp){if(!sndReady()||!SND.vb)return;const z=crowdSize();if(z<0.3)return;const b=RECS.buf[kind]||(kind==='ooh'?SND.vb.ooh:SND.vb.cheer);if(!b)return;
  play(b,{gain:amp*z*(kind==='ooh'?0.7:0.6),rate:rng(0.94,1.06),wet:1.4})}
/* the murmur between points, hushed during them */
function sndAmbience(live){if(!SND.ctx)return;setVerb();
  if(SND.ambG){const z=crowdSize(),target=SND.on?(live?0.006:0.04)*(0.35+z):0;if(Math.abs(target-SND.level)>0.002){SND.level=target;SND.ambG.gain.setTargetAtTime(target,SND.ctx.currentTime,live?0.25:0.8)}}
}
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
