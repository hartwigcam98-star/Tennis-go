/* ================= tournament draws and the player field =================
   Each career keeps a field of fictional players for every stage (juniors, college, pro): a generated name,
   a country, a play style and a rating, and a look that is a recoloured variant of one of the roster models.
   Every event gets a real seeded draw; the other matches are simulated round by round, and your opponents
   come out of the draw. Rivals are the named roster players, placed in the draw so you meet late. */
const NAMES_M=['Mateo','Luca','Noah','Felix','Hugo','Oscar','Leo','Theo','Jonas','Elias','Rafael','Diego','Tomas','Nikolai','Andrei','Kenji','Hiro','Min-jun','Arjun','Rohan','Kofi','Tariq','Omar','Malik','Jace','Cole','Grant','Wes','Reid','Beau','Silas','Emil','Lars','Sven','Pavel','Marek','Ivan','Dario','Paolo','Enzo','Gael','Bruno','Caio','Thiago','Santi','Joaquin','Liam','Owen','Finn','Callum','Ruben','Stefan','Viktor','Yannick','Pierre','Bastien','Kai','Tane','Ari','Duncan'];
const NAMES_F=['Elena','Sofia','Maya','Ines','Clara','Ana','Lena','Mia','Zara','Nadia','Yuki','Aiko','Priya','Amara','Lucia','Irina','Petra','Freya','Isla','Chloe','Camila','Valentina','Marta','Greta'];
const SURNAMES=['Alvarez','Brandt','Castillo','Duval','Eriksen','Ferreira','Gallo','Hartmann','Ibarra','Janssen','Kovac','Lindqvist','Moreau','Novak','Okafor','Petrov','Quintero','Rossi','Sato','Tanaka','Ueda','Vargas','Weber','Xu','Yilmaz','Zielinski','Abara','Bianchi','Costa','Dimitrov','Engel','Fischer','Garcia','Horvat','Ivanova','Jensen','Kim','Laurent','Mendes','Nakamura','Olsen','Park','Rahman','Silva','Torres','Varga','Walsh','Young','Adeyemi','Bauer','Chen','Dubois','Esposito','Fontaine','Gruber','Haddad','Iqbal','Jovanovic','Keller','Lopez','Marin','Nilsson','Ortega','Patel','Reyes','Schulz','Takahashi','Vidal','Wright','Zhou'];
const NATS=['USA','GBR','ESP','FRA','ITA','GER','AUS','ARG','CAN','JPN','BRA','SRB','CRO','NED','SWE','NOR','CZE','POL','RSA','MEX','KOR','CHN','IND','CHI','BEL','SUI','AUT','POR','GRE','DEN','NGR','KAZ'];
const FEMALE_BASE={granny:1,ch31:1};
const FIELD_BASES=['ch08','ch31','ch01','ch12','remy','boss','ch09','ch06','ch23','ch24','ch28','ch42','brute','peasant','ty','ch43','ch17','vegas'];
const STAGE_SKILL={junior:[0.8,5.9],college:[3,7.6],pro:[4.6,9.3]};
function rngFrom(seed){let h=seed>>>0||1;return()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return(h>>>0)/4294967296}}
function fieldFor(stage){
  save.pool=save.pool||{};if(save.pool[stage])return save.pool[stage];
  if(!save.seed)save.seed=Math.floor(Math.random()*2147483647);
  const r=rngFrom(save.seed+({junior:11,college:23,pro:37}[stage])),pk=a=>a[Math.floor(r()*a.length)],[s0,s1]=STAGE_SKILL[stage],used={};
  const list=[];
  for(let i=0;i<96;i++){const base=pk(FIELD_BASES),f=!!FEMALE_BASE[base];let name;do{name=pk(f?NAMES_F:NAMES_M)+' '+pk(SURNAMES)}while(used[name]);used[name]=1;
    const u=Math.pow(r(),1.35),skill=Math.round((s1-(s1-s0)*u)*10)/10;   // fewer players near the top
    const nat=styleOfChar(RBYID[base]),style=r()<0.55?nat:pk(['server','baseliner','allcourt','counter']);
    list.push({id:stage[0]+i,name,base,nat:pk(NATS),style,skill,v:{h:Math.round(r()*360),t:Math.round(r()*360),a:Math.round((0.25+r()*0.35)*100)/100,l:Math.round((0.88+r()*0.24)*100)/100}})}
  list.sort((a,b)=>b.skill-a.skill);list.forEach((p,i)=>p.rank=i+1);
  save.pool[stage]=list;return list}
/* standard bracket order: where seed k sits in a draw of n */
function seedOrder(n){let s=[1,2];while(s.length<n){const m=s.length*2+1;s=s.flatMap(x=>[x,m-x])}return s}
function setScore(f,winHigh){const g=f.g;const one=()=>{const lose=Math.random()<0.18?g:Math.floor(Math.random()*(g-1));return lose===g?[g+1,g]:[g,lose]};
  if(f.bo===1)return[one()];const a=one(),b=one();if(Math.random()<0.62)return[a,b];const c=one();return[a,[b[1],b[0]],c]}
function fmtSets(sets,flip){return sets.map(s=>flip?s[1]+'–'+s[0]:s[0]+'–'+s[1]).join(' ')}
function simPair(D,a,b){const A=D.players[a],B=D.players[b],p=1/(1+Math.exp(-(A.skill-B.skill)*1.25)),aw=Math.random()<p;
  return{w:aw?a:b,l:aw?b:a,score:fmtSets(setScore(D.f,true))}}
/* build a draw for the event you just entered */
function makeDraw(c){
  const ev=c.ev,stage=save.stage,R=ev.rounds,size=1<<R,f=fmt(stage,ev),field=fieldFor(stage),[k0,k1]=ev.sk;
  const players={me:{id:'me',name:RBYID[save.char].name,me:true,nat:'YOU',skill:0}},picked=new Set();
  // entrants spread across the event's level: weakest near the bottom of the range, top seed near the top
  const need=size-1,targets=Array.from({length:need},(_,i)=>k1+0.3-(k1-k0+0.5)*(need>1?i/(need-1):0));
  for(const t of targets){let best=null,bd=1e9;for(const p of field){if(picked.has(p.id))continue;const d=Math.abs(p.skill-t)+Math.random()*0.25;if(d<bd){bd=d;best=p}}
    if(best){picked.add(best.id);players[best.id]=Object.assign({},best)}}
  // a rival waits in the draw at the bigger events: the final, or the semifinal at a major
  let rivalId=null;
  if(R>=3){const ri=save.history.length%3,rv=save.rivals[ri],C=RBYID[rv.id];
    const weakest=Object.values(players).filter(p=>!p.me).sort((a,b)=>a.skill-b.skill)[0];delete players[weakest.id];
    rivalId='rv'+ri;players[rivalId]={id:rivalId,name:C.name,base:rv.id,v:null,nat:'RIV',style:styleOfChar(C),skill:Math.round((k1+rv.edge*0.5)*10)/10,rival:ri}}
  // seed by rating; you slot in by ranking when it is good enough, otherwise as an unseeded player (or a qualifier)
  const others=Object.values(players).filter(p=>!p.me).sort((a,b)=>b.skill-a.skill);
  let myRank=size;if(stage==='pro'&&!c.qual){const r=proRank();myRank=r<=4?r:r<=16?Math.min(size,4+Math.ceil((r-4)/2)):size}
  {const ns=size>=8?size/4:size>=4?2:0;if(myRank>ns)myRank=ns+1+Math.floor(Math.random()*(size-ns))}   // unseeded: a random unseeded spot, like a real draw
  myRank=clamp(myRank,1,size);
  const order=others.slice();order.splice(myRank-1,0,players.me);
  const sl=seedOrder(size),slots=new Array(size);sl.forEach((k,pos)=>{slots[pos]=order[k-1].id});
  // seeds are the highest-rated entrants (you only carry a seed on the pro tour)
  const nSeeds=size>=8?size/4:size>=4?2:0,seeds={};order.slice(0,nSeeds).forEach((p,i)=>{if(!p.me||stage==='pro')seeds[p.id]=i+1});
  // keep the rival away from you: opposite half (final) or the other quarter of your half at a major (semifinal)
  if(rivalId){const myPos=slots.indexOf('me'),rp=slots.indexOf(rivalId),half=ev.major?size>>2:size>>1;
    const same=(a,b)=>Math.floor(a/half)===Math.floor(b/half);
    if(same(rp,myPos)||(ev.major&&Math.floor(rp/(half*2))!==Math.floor(myPos/(half*2)))){const want=myPos^half;
      // swap the rival with whoever sits in the matching spot of the target section, keeping seeds where they are when possible
      let tgt=want;for(let j=0;j<half;j++){const c=(Math.floor(want/half)*half)+j;if(!seeds[slots[c]]&&slots[c]!=='me'){tgt=c;break}}
      [slots[rp],slots[tgt]]=[slots[tgt],slots[rp]]}}
  const D={size,R,f:{bo:f.bo,g:f.g},players,slots,seeds,res:[],ev:ev.n};
  // qualifying: weaker players who did not make the main draw
  if(c.qual){c.qualOpp=[];for(let q=0;q<c.qual;q++){const cand=field.filter(p=>!picked.has(p.id)&&p.skill<k0+0.4);const p=cand[Math.floor(Math.random()*cand.length)]||field[field.length-1-q];picked.add(p.id);
    c.qualOpp.push(Object.assign({},p,{skill:Math.round(clamp(k0-1.2+q*0.4+rnd(-0.3,0.3),1,10)*10)/10}))}}
  return D}
function entrantsAt(D,k){return k===0?D.slots:D.res[k-1].map(m=>m.w)}
/* who you face in main-draw round k (0-based) */
function drawOpp(D,k){const E=entrantsAt(D,k),p=E.indexOf('me');return p<0?null:D.players[E[p^1]]}
/* record your match in round k and play out the rest of that round (and the whole event if you are out) */
function drawRecord(D,k,won,score){const E=entrantsAt(D,k),res=[];
  for(let i=0;i<E.length;i+=2){const a=E[i],b=E[i+1];if(a==='me'||b==='me'){const o=a==='me'?b:a;res.push({a,b,w:won?'me':o,score:won?score.replace(/, /g,' '):score.split(', ').map(s=>s.split('–').reverse().join('–')).join(' '),me:true})}
    else{const m=simPair(D,a,b);res.push({a,b,w:m.w,score:m.score})}}
  D.res[k]=res;
  if(!won)while(D.res.length<D.R){const k2=D.res.length,E2=entrantsAt(D,k2),r2=[];for(let i=0;i<E2.length;i+=2){const m=simPair(D,E2[i],E2[i+1]);r2.push({a:E2[i],b:E2[i+1],w:m.w,score:m.score})}D.res.push(r2)}}
function drawSimAll(D){while(D.res.length<D.R){const k=D.res.length,E=entrantsAt(D,k),r=[];for(let i=0;i<E.length;i+=2){const m=simPair(D,E[i],E[i+1]);r.push({a:E[i],b:E[i+1],w:m.w,score:m.score})}D.res.push(r)}}
/* the opponent object the match uses, from a draw player */
function oppFrom(p,round,line){const skill=Math.round(clamp(p.skill,1,10)*10)/10;
  return{id:p.base,name:p.name,skill,rival:p.rival!=null?p.rival:null,line:line||null,v:p.v||null,style:p.style,nat:p.nat,seed:null}}

/* ---- the bracket screen ---- */
let drawBack=null;
function openDraw(D,title,back){drawBack=back||(()=>renderHub());renderDraw(D,title);show('draw')}
function renderDraw(D,title){
  $('drTitle').textContent=title||D.ev;const cur=save&&save.cur,live=cur&&cur.draw===D;
  const rn=k=>{const left=D.R-1-k;return left===0?'Final':left===1?'Semis':left===2?'Quarters':'Round of '+(D.size>>k)};
  const nm=id=>{const p=D.players[id];if(!p)return'<span class="muted">TBD</span>';const s=D.seeds[id];return(s?'<small class="seed">'+s+'</small>':'')+esc(p.name)+' <small class="nat">'+(p.me?'':p.rival!=null?'Rival':p.nat)+'</small>'};
  let q='';if(live&&cur.qualOpp){q='<div class="card" style="gap:6px"><p class="eyebrow">Your qualifying</p>'+cur.qualOpp.map((p,i)=>'<p>Q'+(i+1)+': '+esc(p.name)+' <small class="nat">'+p.nat+'</small>'+(cur.round>i+1?' <b class="res w">Won</b>':cur.round===i+1?' <b class="res next">Next</b>':'')+'</p>').join('')+'</div>'}
  let cols='';
  for(let k=0;k<D.R;k++){const E=k===0?D.slots:D.res[k-1]?D.res[k-1].map(m=>m.w):Array(D.size>>k).fill(null),R=D.res[k];let ms='';
    for(let i=0;i<E.length;i+=2){const a=E[i],b=E[i+1],m=R&&R[i>>1],mine=a==='me'||b==='me';
      const row=(id)=>'<div class="dr-p'+(m&&m.w===id?' w':m?' l':'')+(id==='me'?' me':'')+'"><span>'+nm(id)+'</span>'+(m&&m.w===id?'<small class="num">'+esc(m.score)+'</small>':'')+'</div>';
      ms+='<div class="dr-m'+(mine?' mine':'')+'">'+row(a)+row(b)+'</div>'}
    cols+='<div class="dr-col"><p class="eyebrow">'+rn(k)+'</p><div class="dr-ms">'+ms+'</div></div>'}
  const champ=D.res[D.R-1]&&D.res[D.R-1][0]?D.res[D.R-1][0].w:null;
  cols+='<div class="dr-col"><p class="eyebrow">Champion</p><div class="dr-ms"><div class="dr-m champ">'+(champ?'<div class="dr-p w'+(champ==='me'?' me':'')+'"><span>'+nm(champ)+'</span></div>':'<div class="dr-p"><span class="muted">?</span></div>')+'</div></div></div>';
  $('drBody').innerHTML=q+'<div class="dr-scroll"><div class="dr-grid" style="--n:'+(D.size/2)+'">'+cols+'</div></div>';
  const can=live&&!cur.done;$('drPlay').hidden=!can;if(can)$('drPlay').textContent='Play '+roundName(cur.round,cur.total,cur.qual).toLowerCase();
  // bring your match into view
  setTimeout(()=>{const m=document.querySelector('#drBody .dr-m.mine:last-of-type');if(m)m.scrollIntoView({block:'center',inline:'nearest'})},50)}
$('drBack').onclick=()=>{const f=drawBack;drawBack=null;(f||renderHub)()};
$('drPlay').onclick=()=>playNext();

/* ---- appearance variants: recolour the clothes, keep the skin ---- */
function variantTexture(D,v){D._vmaps=D._vmaps||{};const key=v.h+'_'+v.t+'_'+v.a+'_'+v.l;if(D._vmaps[key])return D._vmaps[key];
  const cv=document.createElement('canvas');cv.width=cv.height=1024;{const g0=cv.getContext('2d');g0.fillStyle='#8a8f96';g0.fillRect(0,0,1024,1024)}  // final size from the start: GPU textures cannot be resized after upload
  const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;D._vmaps[key]=t;
  const im=new Image();im.onload=()=>{const S=1024;const g=cv.getContext('2d');g.clearRect(0,0,S,S);g.drawImage(im,0,0,S,S);const id=g.getImageData(0,0,S,S),d=id.data;
    const tr=Math.cos(v.t*Math.PI/180),tg=Math.cos((v.t-120)*Math.PI/180),tb=Math.cos((v.t+120)*Math.PI/180),tint=[0.5+0.5*tr,0.5+0.5*tg,0.5+0.5*tb];
    const ch=Math.cos(v.h*Math.PI/180),sh=Math.sin(v.h*Math.PI/180);
    // hue rotation matrix in RGB space
    const m=[0.213+ch*0.787-sh*0.213,0.715-ch*0.715-sh*0.715,0.072-ch*0.072+sh*0.928,0.213-ch*0.213+sh*0.143,0.715+ch*0.285+sh*0.140,0.072-ch*0.072-sh*0.283,0.213-ch*0.213-sh*0.787,0.715-ch*0.715+sh*0.715,0.072+ch*0.928+sh*0.072];
    for(let i=0;i<d.length;i+=4){const r=d[i],gg=d[i+1],b=d[i+2],mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),val=mx/255,sat=mx?(mx-mn)/mx:0;
      if(d[i+3]<10)continue;
      let hue=0;if(mx!==mn){if(mx===r)hue=((gg-b)/(mx-mn)+6)%6;else if(mx===gg)hue=(b-r)/(mx-mn)+2;else hue=(r-gg)/(mx-mn)+4;hue*=60}
      const skin=hue>=4&&hue<=48&&sat>=0.16&&sat<=0.72&&val>=0.28&&r>gg&&gg>=b;
      if(skin)continue;
      let R=r,G=gg,B=b;
      if(val<0.38){const a=0.8*clamp((val-0.01)/0.1,0,1),lift=72+val*120;R=r*(1-a)+tint[0]*lift*a;G=gg*(1-a)+tint[1]*lift*a;B=b*(1-a)+tint[2]*lift*a}   // black kit becomes a deep colour
      else if(sat>=0.14){R=m[0]*r+m[1]*gg+m[2]*b;G=m[3]*r+m[4]*gg+m[5]*b;B=m[6]*r+m[7]*gg+m[8]*b}   // coloured kit changes hue
      else if(val>0.5){const a=v.a;R=r*(1-a)+r*tint[0]*a*1.1;G=gg*(1-a)+gg*tint[1]*a*1.1;B=b*(1-a)+b*tint[2]*a*1.1}   // white and grey kit takes a colour
      d[i]=clamp(R*v.l,0,255);d[i+1]=clamp(G*v.l,0,255);d[i+2]=clamp(B*v.l,0,255)}
    g.putImageData(id,0,0);t.needsUpdate=true};im.src=D.tex.d;return t}
