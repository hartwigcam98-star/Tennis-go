/* ================= match statistics and the Records screen =================
   Every career match records a full stat line for both players: serve (first serves in, points won behind the
   first and second serve, aces, double faults), break points, winners, unforced and forced errors, points won.
   Your own matches are counted point by point; matches between other players in your draws (and sims) get a
   believable line generated from their rating, style and the score. Lines are kept per league, so juniors and
   college records stay after you move up. */
const ST_KEYS=['m','w','l','t','sw','sl','gw','gl','sp','s1','s1w','s2','s2w','ace','df','bpf','bps','bpo','bpc','wn','ue','fe','pw','pt'];
function stLine(){const o={};for(const k of ST_KEYS)o[k]=0;return o}
function stAdd(a,b){for(const k of ST_KEYS)a[k]=(a[k]||0)+(b[k]||0);return a}

/* ---- point by point, during a match ---- */
function msStart(){M.ms=[stLine(),stLine()]}
/* called at the start of pointTo, before the score moves. kind: 'wn' winner by w, 'ue' / 'fe' error by the loser */
function msPoint(w,call,kind){if(!M||!M.ms)return;const sv=M.server,rc=1-sv,S=M.ms[sv],R=M.ms[rc],second=sv===0?!!M.fault:!!M.oFault;
  if(!M.tb&&pointWins(rc)>0){R.bpo++;S.bpf++;if(w===rc)R.bpc++;else S.bps++}
  S.sp++;if(second){S.s2++;if(w===sv)S.s2w++}else{S.s1++;if(w===sv)S.s1w++}
  M.ms[w].pw++;M.ms[0].pt++;M.ms[1].pt++;
  if(call==='ACE')S.ace++;else if(call==='DOUBLE FAULT')S.df++;
  else if(kind==='wn')M.ms[w].wn++;else if(kind==='ue')M.ms[1-w].ue++;else if(kind==='fe')M.ms[1-w].fe++}
/* the finished match: sets and games onto both lines */
let LAST_MS=null;
function msFinish(){if(!M||!M.ms)return null;const a=M.ms[0],b=M.ms[1];
  for(const g of M.sets){if(g[0]+g[1]===0)continue;a.gw+=g[0];a.gl+=g[1];b.gw+=g[1];b.gl+=g[0];if(g[0]>g[1])a.sw++,b.sl++;else if(g[1]>g[0])b.sw++,a.sl++}
  return[a,b]}

/* ---- a believable line for a match nobody watched ---- */
const SSTY={server:{ace:1.7,df:1.3,fi:-0.03,s1:0.04,wn:1.2,ue:1.15},baseliner:{ace:0.9,df:0.9,fi:0.02,s1:0,wn:1,ue:0.9},allcourt:{ace:1,df:1,fi:0,s1:0.01,wn:1.15,ue:1},counter:{ace:0.6,df:0.8,fi:0.05,s1:-0.03,wn:0.75,ue:0.75}};
function parseSets(score){return String(score).split(/,\s*|\s+/).filter(Boolean).map(s=>s.split('–').map(Number)).filter(x=>x.length===2&&!isNaN(x[0]))}
/* games: [[gA,gB],...] from A's side. returns [lineA,lineB] */
function synthMatch(sa,sb,styA,styB,games){
  const A=stLine(),B=stLine(),YA=SSTY[styA]||SSTY.baseliner,YB=SSTY[styB]||SSTY.baseliner;
  let GA=0,GB=0;for(const [x,y] of games){GA+=x;GB+=y;if(x>y)A.sw++,B.sl++;else B.sw++,A.sl++}
  A.gw=B.gl=GA;A.gl=B.gw=GB;const tot=GA+GB;
  const svA=Math.ceil(tot/2)-(Math.random()<0.5&&tot%2?1:0),svB=tot-svA;
  // breaks: GA = holds + breaks, so A's breaks minus B's breaks = GA - svA
  let bB=Math.round(rnd(0,0.18)*svA+Math.max(0,sb-sa)*0.3),bA=bB+GA-svA;if(bA<0){bB-=bA;bA=0}
  bB=Math.min(bB,svA);bA=Math.min(bA,svB);const hA=svA-bB,hB=svB-bA;
  const serve=(L,s,Y,held,broken)=>{const sp=Math.round(held*rnd(5,6.2)+broken*rnd(6,7.4)),won=Math.round(held*rnd(3.9,4.3)+broken*rnd(2.1,2.8));
    const fi=clamp(0.52+s*0.014+Y.fi+rnd(-0.05,0.05),0.42,0.78);L.sp=sp;L.s1=Math.round(sp*fi);L.s2=sp-L.s1;
    const r1=0.58+s*0.018+Y.s1,r2=r1-0.17,k=won/Math.max(1,L.s1*r1+L.s2*r2);L.s1w=Math.min(L.s1,Math.round(L.s1*r1*k));L.s2w=clamp(won-L.s1w,0,L.s2);
    L.ace=Math.min(L.s1w,Math.round(L.s1*(0.03+s*0.011)*Y.ace*rnd(0.6,1.4)));L.df=Math.min(L.s2-L.s2w,Math.round(L.s2*Math.max(0.02,0.11-s*0.008)*Y.df*rnd(0.5,1.5)));return won};
  const wA=serve(A,sa,YA,hA,bB),wB=serve(B,sb,YB,hB,bA);
  A.pw=wA+(B.sp-wB);B.pw=wB+(A.sp-wA);A.pt=B.pt=A.sp+B.sp;
  A.bpc=bA;A.bpo=bA+Math.round(rnd(0.6,1.6)*bA+rnd(0,2.2));B.bpf=A.bpo;B.bps=A.bpo-A.bpc;
  B.bpc=bB;B.bpo=bB+Math.round(rnd(0.6,1.6)*bB+rnd(0,2.2));A.bpf=B.bpo;A.bps=B.bpo-B.bpc;
  const rally=(L,O,s,Y)=>{L.wn=Math.round(Math.max(0,L.pw-L.ace-O.df)*(0.24+s*0.012)*Y.wn*rnd(0.8,1.2));L.ue=Math.round(O.pw*clamp(0.36-s*0.02,0.12,0.36)*Y.ue*rnd(0.8,1.2));L.fe=Math.round(O.pw*rnd(0.12,0.2))};
  rally(A,B,sa,YA);rally(B,A,sb,YB);return[A,B]}

/* ---- where lines are kept ---- */
function poolById(id,stage){const L=fieldFor(stage||save.stage);for(const p of L)if(p.id===id)return p;return null}
/* the record object for a player in a draw / finals / opponent: a field player, or a rival (by stage) */
function stOf(x,stage){stage=stage||save.stage;if(!x||x.me)return null;
  const ri=x.rival!=null?x.rival:null;
  if(ri!=null){const rv=save.rivals[ri];if(!rv)return null;if(rv.fid){const p=poolById(rv.fid,stage);if(p)return p.st=p.st||stLine()}rv.st=rv.st||{};return rv.st[stage]=rv.st[stage]||stLine()}
  const id=x.fid||x.id;const p=id&&poolById(id,stage);return p?p.st=p.st||stLine():null}
function myLine(stage,season){save.my=save.my||{};const S=save.my[stage||save.stage]=save.my[stage||save.stage]||{};const k=season||save.season;return S[k]=S[k]||stLine()}
function stMatch(L,won){L.m=1;L[won?'w':'l']=1;return L}
/* a simulated match between two non-you players (draw rounds, Tour Finals) */
function statSim(A,B,winId,score){try{const aw=winId===A.id,g=parseSets(score).map(s=>aw?s:[s[1],s[0]]);
  const [la,lb]=synthMatch(A.skill||5,B.skill||5,A.style,B.style,g);const ta=stOf(A),tb=stOf(B);
  if(ta)stAdd(ta,stMatch(la,aw));if(tb)stAdd(tb,stMatch(lb,!aw))}catch(e){console.error(e)}}
/* your match: from the point-by-point count, or generated if you simmed it */
function statMine(o,won,score,lines,ev,round){const sim=!LAST_MS;let me,op;
  if(LAST_MS){[me,op]=LAST_MS;LAST_MS=null}else{const g=parseSets(score);[me,op]=synthMatch(myRating(),o.skill||5,save.style,o.style,g)}
  stAdd(myLine(),stMatch(me,won));const t=stOf(o);if(t)stAdd(t,stMatch(op,!won));
  save.log=save.log||[];save.log.push({s:save.stage,se:save.season,e:ev,r:round,o:o.name,k:stKey(o),w:won?1:0,sc:score,a:me.ace,d:me.df,wn:me.wn,ue:me.ue,oa:op.ace,sim:sim?1:0});
  if(save.log.length>400)save.log.splice(0,save.log.length-400);
  lines.push(['1st serve in',pct(me.s1,me.sp)],['Double faults',me.df],['Unforced errors',me.ue]);return me}
function stKey(o){if(o.rival!=null){const rv=save.rivals[o.rival];return rv?(rv.fid||'R:'+rv.id):'?'}return o.fid||o.id}
function stTitle(x){const t=stOf(x);if(t)t.t++}

/* ---- numbers for display ---- */
const pct=(a,b)=>b?Math.round(a/b*100)+'%':'–';
function stRows(L){return[['Matches',L.w+'–'+L.l+(L.m?' ('+pct(L.w,L.m)+')':'')],['Titles',L.t],['Sets',L.sw+'–'+L.sl],['Games',L.gw+'–'+L.gl],
  ['Aces',L.ace],['Double faults',L.df],['1st serve in',pct(L.s1,L.sp)],['1st serve pts won',pct(L.s1w,L.s1)],['2nd serve pts won',pct(L.s2w,L.s2)],
  ['Break points saved',L.bpf?L.bps+'/'+L.bpf+' ('+pct(L.bps,L.bpf)+')':'–'],['Break points won',L.bpo?L.bpc+'/'+L.bpo+' ('+pct(L.bpc,L.bpo)+')':'–'],
  ['Winners',L.wn],['Unforced errors',L.ue],['Forced errors',L.fe],['Points won',pct(L.pw,L.pt)],['Aces per match',L.m?(L.ace/L.m).toFixed(1):'–']]}
function stGrid(L){return'<div class="stgrid">'+stRows(L).map(([k,v])=>'<div><small>'+k+'</small><strong class="num">'+v+'</strong></div>').join('')+'</div>'}
const SORTS=[['rank','Ranking'],['w','Wins'],['wp','Win %'],['t','Titles'],['ace','Aces'],['apm','Aces per match'],['df','Double faults'],['s1p','1st serve in'],['s1wp','1st serve pts won'],['bpp','Break points won %'],['wn','Winners'],['ue','Unforced errors']];
function sortVal(L,k){switch(k){case'wp':return L.m?L.w/L.m:-1;case'apm':return L.m?L.ace/L.m:-1;case's1p':return L.sp?L.s1/L.sp:-1;case's1wp':return L.s1?L.s1w/L.s1:-1;case'bpp':return L.bpo?L.bpc/L.bpo:-1;default:return L[k]||0}}
function sortShow(L,k){switch(k){case'wp':return pct(L.w,L.m);case'apm':return L.m?(L.ace/L.m).toFixed(1):'–';case's1p':return pct(L.s1,L.sp);case's1wp':return pct(L.s1w,L.s1);case'bpp':return pct(L.bpc,L.bpo);case'rank':return L.w+'–'+L.l;default:return L[k]||0}}

/* ---- the Records screen ---- */
const REC={stage:null,sort:'rank',back:null,player:null};
function stagesPlayed(){return['junior','college','pro'].filter(s=>s===save.stage||(save.my&&save.my[s])||(save.pool&&save.pool[s]))}
function openRecords(back,stage){REC.back=back||REC.back||(()=>renderHub());REC.stage=stage||REC.stage||save.stage;if(!stagesPlayed().includes(REC.stage))REC.stage=save.stage;REC.player=null;renderRecords();show('records')}
function allPlayers(stage){const L=rankingList(stage),out=[];
  for(const e of L){let line,info;
    if(e.me){line=myTotal(stage);info={me:true}}
    else if(e.rival!=null){const rv=save.rivals[e.rival];const p=rv.fid&&poolById(rv.fid,stage);line=p?(p.st||stLine()):(rv.st&&rv.st[stage])||stLine();info={rival:e.rival,skill:p?p.skill:null,lefty:isLefty({rival:e.rival})}}
    else{const p=poolById(e.id,stage);line=(p&&p.st)||stLine();info={skill:p&&p.skill,base:p&&p.base,lefty:p?isLefty(p):false}}
    out.push(Object.assign({id:e.id,name:e.name,nat:e.nat,style:e.style,rank:e.rank,line},info))}
  return out}
function myTotal(stage){const S=(save.my&&save.my[stage])||{},t=stLine();for(const k in S)stAdd(t,S[k]);return t}
function renderRecords(){const st=REC.stage,tabs=stagesPlayed(),LBL={junior:'Juniors',college:'College',pro:'Pro tour'};
  $('recTabs').innerHTML=tabs.map(s=>'<button class="pc" data-st="'+s+'" aria-pressed="'+(s===st)+'">'+LBL[s]+'</button>').join('');
  $('recTabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{REC.stage=b.dataset.st;REC.player=null;renderRecords()});
  if(REC.player){renderPlayerCard(REC.player);return}
  const me=myTotal(st),S=(save.my&&save.my[st])||{},seasons=Object.keys(S).map(Number).sort((a,b)=>a-b);
  const evs=save.history.filter(h=>h.stage===st);
  let h='<div class="card"><p class="eyebrow">You · '+LBL[st]+'</p><h3>'+esc(myName())+'</h3>'+(me.m?stGrid(me):'<p class="muted">No matches recorded here yet. Stats are kept from Build 30 on.</p>')+
    (seasons.length?'<table class="ftab"><tr><th>Season</th><th>W–L</th><th>Titles</th><th>Aces</th><th>Win/UE</th></tr>'+seasons.map(k=>{const L=S[k];return'<tr><td>Season '+k+'</td><td class="num">'+L.w+'–'+L.l+'</td><td class="num">'+L.t+'</td><td class="num">'+L.ace+'</td><td class="num">'+L.wn+'/'+L.ue+'</td></tr>'}).join('')+'</table>':'')+
    (evs.length?'<p class="muted" style="font-size:13px">'+evs.length+' events, '+evs.filter(e=>e.champ).length+' titles in '+LBL[st].toLowerCase()+'.</p>':'')+
    '<button class="ghost" id="recLog">Match log</button></div>';
  const P=allPlayers(st),k=REC.sort;
  const rows=P.slice().sort((a,b)=>k==='rank'?a.rank-b.rank:(sortVal(b.line,k)-sortVal(a.line,k))||a.rank-b.rank);
  h+='<div class="card"><div class="row between"><h3>Players</h3><label class="muted" style="font-size:13px">Sort <select id="recSort">'+SORTS.map(([v,l])=>'<option value="'+v+'"'+(v===k?' selected':'')+'>'+l+'</option>').join('')+'</select></label></div>'+
    '<p class="muted" style="font-size:13px;margin-top:-6px">Every player in the '+LBL[st].toLowerCase()+' field. Stats come from the events you play in. Tap a player for their full record.</p>'+
    '<ol class="rk-list">'+rows.slice(0,60).map(p=>'<li class="rk'+(p.me?' me':'')+(p.rival!=null?' rv':'')+'" data-pid="'+p.id+'" role="button" tabindex="0"><b class="num">'+p.rank+'</b><span>'+esc(p.name)+' <small class="nat">'+(p.me?'You':p.rival!=null?'Rival':p.nat||'')+'</small><small class="muted" style="display:block">'+p.line.w+'–'+p.line.l+(p.line.t?' · '+p.line.t+(p.line.t>1?' titles':' title'):'')+'</small></span><small class="num">'+(k==='rank'?(p.line.m?pct(p.line.w,p.line.m):'–'):sortShow(p.line,k))+'</small></li>').join('')+'</ol></div>';
  $('recBody').innerHTML=h;
  $('recSort').onchange=e=>{REC.sort=e.target.value;renderRecords()};
  $('recLog').onclick=()=>{REC.player='__log';renderRecords()};
  $('recBody').querySelectorAll('[data-pid]').forEach(li=>li.onclick=()=>{REC.player=li.dataset.pid;renderRecords();window.scrollTo(0,0)})}
function renderPlayerCard(pid){const st=REC.stage;
  if(pid==='__log'){const L=(save.log||[]).filter(x=>x.s===st).slice().reverse();
    $('recBody').innerHTML='<div class="card"><div class="row between"><h3>Match log</h3><button class="ghost" id="recPBack">Back</button></div>'+(L.length?'<ol class="rk-list">'+L.map(x=>'<li class="rk"><b class="num" style="font-size:16px;color:'+(x.w?'var(--win)':'var(--loss)')+'">'+(x.w?'W':'L')+'</b><span>'+esc(x.o)+'<small class="muted" style="display:block">'+esc(x.e)+' · '+esc(x.r)+' · Season '+x.se+(x.sim?' · simmed':'')+'</small></span><small class="num">'+esc(x.sc)+'<br>'+x.a+' aces</small></li>').join('')+'</ol>':'<p class="muted">No matches logged here yet.</p>')+'</div>';
    $('recPBack').onclick=()=>{REC.player=null;renderRecords()};return}
  const P=allPlayers(st).find(p=>p.id===pid);if(!P){REC.player=null;renderRecords();return}
  const key=P.rival!=null?stKey({rival:P.rival}):pid,meet=(save.log||[]).filter(x=>x.k===key);
  const h2=meet.reduce((a,x)=>(a[x.w?0:1]++,a),[0,0]);
  const LBL={junior:'Junior',college:'College',pro:'World'};
  $('recBody').innerHTML='<div class="card"><div class="row between"><p class="eyebrow">'+LBL[st]+' #'+P.rank+(P.rival!=null?' · Rival':'')+'</p><button class="ghost" id="recPBack">Back</button></div><h3 style="font-size:26px">'+esc(P.name)+' <small class="nat">'+(P.me?'You':P.nat||'')+'</small></h3>'+
    (P.me?'<p class="muted" style="font-size:14px">Rating '+myRating().toFixed(1)+' (current)</p>':'<p class="muted" style="font-size:14px">'+(OSTYLE[P.style]?OSTYLE[P.style].name:'')+(P.skill!=null?' · Rating '+(+P.skill).toFixed(1):'')+(P.lefty?' · Left-handed':'')+'</p>')+
    (P.line.m?stGrid(P.line):'<p class="muted">No recorded matches yet. Their stats build up as they play in your events.</p>')+
    (P.me?'':'<h3 style="margin-top:6px">Against you</h3><p class="num" style="font-size:20px">'+h2[0]+'–'+h2[1]+'</p>'+(meet.length?'<ol class="rk-list">'+meet.slice().reverse().map(x=>'<li class="rk"><b class="num" style="font-size:16px;color:'+(x.w?'var(--win)':'var(--loss)')+'">'+(x.w?'W':'L')+'</b><span>'+esc(x.e)+'<small class="muted" style="display:block">'+esc(x.r)+' · Season '+x.se+'</small></span><small class="num">'+esc(x.sc)+'</small></li>').join('')+'</ol>':'<p class="muted" style="font-size:14px">You haven’t played each other yet.</p>'))+'</div>';
  $('recPBack').onclick=()=>{REC.player=null;renderRecords()}}
$('recBack').onclick=()=>{const f=REC.back;REC.back=null;(f||renderHub)()};
