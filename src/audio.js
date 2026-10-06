/* ================= sound: everything synthesised with Web Audio, no files =================
   racket pops, bounces, the net, crowd murmur that hushes during points, applause sized to the crowd,
   oohs on close calls, and line / umpire calls through the browser's speech voice */
const SND={ctx:null,on:true,amb:null,ambG:null,level:0,buf:{}};
try{SND.on=localStorage.getItem('tennis-go-sound')!=='off'}catch(e){}
function sndInit(){
  if(SND.ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  let c;try{c=SND.ctx=new AC()}catch(e){return false}
  SND.master=c.createGain();SND.master.gain.value=SND.on?0.9:0;SND.master.connect(c.destination);
  const sr=c.sampleRate,noise=c.createBuffer(1,sr*2,sr),d=noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;SND.buf.noise=noise;
  // brown noise for the murmur of a crowd
  const br=c.createBuffer(1,sr*4,sr),bd=br.getChannelData(0);let l=0;for(let i=0;i<bd.length;i++){l=(l+0.02*(Math.random()*2-1))/1.02;bd[i]=l*3.5}SND.buf.brown=br;
  SND.buf.clapS=applauseBuf(c,40,2.2);SND.buf.clapM=applauseBuf(c,420,3);SND.buf.clapL=applauseBuf(c,2600,3.6);
  // ambience
  const src=c.createBufferSource();src.buffer=br;src.loop=true;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=380;bp.Q.value=0.6;
  const g=SND.ambG=c.createGain();g.gain.value=0;src.connect(bp);bp.connect(g);g.connect(SND.master);src.start();
  return true}
function applauseBuf(c,n,len){// many short claps, each a few ms of decaying noise, scattered with a rise and a long tail
  const sr=c.sampleRate,b=c.createBuffer(2,Math.floor(sr*len),sr);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);
    for(let k=0;k<n*(ch?0.5:0.5);k++){const u=Math.random();let t=u<0.15?Math.random()*0.25:0.1+Math.pow(Math.random(),1.6)*(len-0.4);
      const env=t<0.25?t/0.25:Math.max(0,1-(t-0.25)/(len-0.25)),a=(0.3+Math.random()*0.7)*Math.min(1,env*1.3+0.05),s0=Math.floor(t*sr),tau=sr*(0.0015+Math.random()*0.002);
      for(let i=0;i<sr*0.012&&s0+i<d.length;i++)d[s0+i]+=(Math.random()*2-1)*a*Math.exp(-i/tau)}
    let mx=0;for(let i=0;i<d.length;i++)mx=Math.max(mx,Math.abs(d[i]));const k=0.9/(mx||1);for(let i=0;i<d.length;i++)d[i]*=k}
  return b}
function sndResume(){if(!sndInit())return;if(SND.ctx.state==='suspended')SND.ctx.resume()}
function sndToggle(){SND.on=!SND.on;try{localStorage.setItem('tennis-go-sound',SND.on?'on':'off')}catch(e){}if(SND.master)SND.master.gain.setTargetAtTime(SND.on?0.9:0,SND.ctx.currentTime,0.05);if(!SND.on&&window.speechSynthesis)speechSynthesis.cancel();return SND.on}
function sndReady(){return SND.ctx&&SND.on&&SND.ctx.state==='running'}
function burst(dur,type,freq,q,gain,when,attack){const c=SND.ctx,t=c.currentTime+(when||0),s=c.createBufferSource();s.buffer=SND.buf.noise;
  const f=c.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=c.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(gain,t+(attack||0.002));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(SND.master);s.start(t,Math.random()*1.5);s.stop(t+dur+0.05);return{f,g,t}}
function tone(freq,dur,gain,type,f1){const c=SND.ctx,t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(freq,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(SND.master);o.start(t);o.stop(t+dur+0.02)}
function sndHit(pw){if(!sndReady())return;pw=clamp(pw,0.15,1.2);// the pop of the strings and frame
  burst(0.05,'bandpass',1500+pw*900,1.1,0.55*pw+0.2);burst(0.02,'highpass',3500,0.7,0.25*pw);tone(240+pw*80,0.07,0.35*pw,'triangle',120)}
function sndBounce(v){if(!sndReady())return;const s=W3.venue?W3.venue.surf:'hard',k=clamp(v/12,0.2,1);
  burst(s==='clay'?0.06:0.035,'lowpass',s==='clay'?700:s==='grass'?500:1100,0.8,(s==='grass'?0.25:0.4)*k);tone(s==='grass'?95:130,0.06,0.3*k,'sine',70)}
function sndNet(){if(!sndReady())return;burst(0.18,'lowpass',320,0.9,0.5);tone(90,0.15,0.3,'sine',60)}
function crowdSize(){const V=W3.venue||{};return V.kind==='major'?(V.fill>0.8?1:0.6):V.kind==='tour'?0.7:V.kind==='college'?0.35:0.12}
function sndApplause(amp){if(!sndReady())return;const c=SND.ctx,z=crowdSize(),s=c.createBufferSource();s.buffer=z>0.6?SND.buf.clapL:z>0.25?SND.buf.clapM:SND.buf.clapS;s.playbackRate.value=0.92+Math.random()*0.16;
  const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=500;const g=c.createGain();g.gain.value=clamp(amp,0,1.2)*(0.35+0.5*z);s.connect(f);f.connect(g);g.connect(SND.master);s.start()}
function sndCrowdVoice(kind,amp){if(!sndReady())return;const z=crowdSize();if(z<0.3)return;const c=SND.ctx,t=c.currentTime,s=c.createBufferSource();s.buffer=SND.buf.brown;
  const f1=c.createBiquadFilter(),f2=c.createBiquadFilter(),g=c.createGain();f1.type=f2.type='bandpass';f1.Q.value=f2.Q.value=kind==='ooh'?6:3;
  if(kind==='ooh'){f1.frequency.setValueAtTime(330,t);f1.frequency.linearRampToValueAtTime(520,t+0.35);f1.frequency.linearRampToValueAtTime(400,t+1.3);f2.frequency.setValueAtTime(700,t);f2.frequency.linearRampToValueAtTime(820,t+0.35)}
  else{f1.frequency.setValueAtTime(600,t);f1.frequency.linearRampToValueAtTime(760,t+0.4);f2.frequency.setValueAtTime(1050,t);f2.frequency.linearRampToValueAtTime(1250,t+0.4)}
  const dur=kind==='ooh'?1.5:2.6,peak=amp*z*(kind==='ooh'?1.4:1.1);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(peak,t+0.3);g.gain.setValueAtTime(peak,t+dur*0.4);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(f1);s.connect(f2);f1.connect(g);f2.connect(g);g.connect(SND.master);s.start(t,Math.random()*2);s.stop(t+dur+0.1)}
function sndAmbience(live){if(!SND.ambG||!SND.ctx)return;const z=crowdSize(),target=SND.on?(live?0.012:0.05)*(0.3+z):0;if(Math.abs(target-SND.level)>0.002){SND.level=target;SND.ambG.gain.setTargetAtTime(target,SND.ctx.currentTime,live?0.25:0.8)}}
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
