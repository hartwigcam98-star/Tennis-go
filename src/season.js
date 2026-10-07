/* ================= season goals and the tour news feed =================
   Each season your coach (juniors, college) or agent (pro) sets three goals sized to where you are: win a title,
   reach a major quarterfinal, finish in the top 50... Each one pays training points (and money on tour) the moment
   you reach it; "finish" goals are judged when the season ends. The news feed follows the whole tour week by week. */
const DEPTH={W:7,F:6,SF:5,QF:4,R16:3,R32:2,R64:1,R1:1};
function niceRank(r){const L=[1,3,5,10,15,20,25,30,40,50,75,100,150,200,300];for(const x of L)if(x>=r)return x;return 300}
function goalTemplates(){const st=save.stage,r=myRankIn(st)||999,s=save.season,G=[];
  const rk=(k,xp,money)=>({id:'rank',type:'rank',max:k,text:k===1?'Finish the season as No. 1':'Finish the season in the top '+k,xp,money:money||0,atEnd:true});
  if(st==='junior'){G.push({id:'title',type:'title',text:'Win a junior title',xp:40});
    G.push(s>=2?{id:'jm',type:'reach',tier:'Junior major',depth:5,text:'Reach the Junior Major semifinals',xp:70}:{id:'nat',type:'reach',tier:'National',depth:4,text:'Reach a national quarterfinal',xp:50});
    G.push(rk(niceRank(Math.max(5,Math.round(r*(s>=2?0.4:0.6)))),50))}
  else if(st==='college'){G.push({id:'ncaa',type:'play',name:'NCAA Singles Championship',text:'Play in the NCAA Singles Championship',xp:70});
    G.push({id:'conf',type:'reach',tier:'Conference',depth:5,text:'Reach the Conference Championship semifinals',xp:50});
    G.push(rk(niceRank(Math.max(3,Math.round(r*0.5))),60))}
  else{if(r>150){G.push({id:'ch',type:'title',tiers:['Challenger','Futures'],text:'Win a Challenger or Futures title',xp:60,money:20000});G.push({id:'mj',type:'reach',tier:'Major',depth:1,text:'Play in a major main draw',xp:80,money:30000});G.push(rk(100,100,50000))}
    else if(r>50){G.push({id:'t5',type:'reach',tiers:['Tour 250','Tour 500'],depth:5,text:'Reach a 250 or 500 semifinal',xp:80,money:50000});G.push({id:'mjw',type:'reach',tier:'Major',depth:2,text:'Win a match at a major',xp:80,money:50000});G.push(rk(50,120,100000))}
    else if(r>10){G.push({id:'mqf',type:'reach',tier:'Major',depth:4,text:'Reach a major quarterfinal',xp:120,money:150000});G.push({id:'big',type:'title',tiers:['Masters','Tour 500'],text:'Win a Masters or 500 title',xp:120,money:200000});G.push(rk(niceRank(Math.max(10,Math.round(r*0.5))),150,250000))}
    else{G.push({id:'maj',type:'title',tiers:['Major'],text:'Win a major',xp:200,money:500000});G.push({id:'fin',type:'finals',text:'Qualify for the Tour Finals',xp:120,money:200000});G.push(rk(r<=3?1:5,200,500000))}}
  return G}
function ensureGoals(){const key=save.stage+save.season;if(save.goals&&save.goals.key===key)return save.goals;save.goals={key,list:goalTemplates().map(g=>Object.assign(g,{done:false}))};store();return save.goals}
function goalMet(g){const H=save.history.filter(h=>h.stage===save.stage&&h.season===save.season);
  if(g.type==='title')return H.some(h=>h.champ&&(!g.tiers||g.tiers.includes(h.tier)));
  if(g.type==='reach')return H.some(h=>(g.tier?h.tier===g.tier:g.tiers.includes(h.tier))&&(DEPTH[h.res]||0)>=g.depth);
  if(g.type==='play')return H.some(h=>h.name===g.name&&!/^Q\d/.test(h.res));
  if(g.type==='finals')return!!(save.finals&&save.finals.season===save.season&&save.finals.in);
  if(g.type==='rank')return(myRankIn(save.stage)||999)<=g.max;return false}
/* check after every event (and at season end for "finish" goals); pays out and adds lines to the result screen */
function checkGoals(lines,seasonEnd){const G=ensureGoals();let got=[];
  for(const g of G.list){if(g.done||(g.atEnd&&!seasonEnd))continue;if(goalMet(g)){g.done=true;save.xp+=g.xp;if(g.money){save.money+=g.money;save.earnings+=g.money}got.push(g)}}
  for(const g of got){if(lines)lines.push(['Goal reached',g.text]);newsAdd('Goal reached: '+g.text+'. +'+g.xp+' training pts'+(g.money?', '+money(g.money):''))}
  return got}
function goalsCard(){const G=ensureGoals(),who=save.stage==='pro'?'Your agent':'Your coach';
  return'<div class="row between"><h3>Season goals</h3><span class="chip">'+G.list.filter(g=>g.done).length+'/'+G.list.length+'</span></div><p class="muted" style="font-size:13px;margin-top:-6px">'+who+' set these for season '+save.season+'.</p>'+
    '<ul class="goals">'+G.list.map(g=>'<li class="'+(g.done?'on':'')+'"><span>'+(g.done?'✓':'○')+'</span><span>'+esc(g.text)+'<small class="muted" style="display:block">+'+g.xp+' training pts'+(g.money?' · '+money(g.money):'')+(g.atEnd&&!g.done?' · judged at season end':'')+'</small></span></li>').join('')+'</ul>'}

/* ---- news ---- */
function newsAdd(t){save.news=save.news||[];save.news.push({w:stageName()+' S'+save.season+' W'+Math.min(save.week+1,weeks().length+1),t});if(save.news.length>40)save.news.splice(0,save.news.length-40)}
/* headlines from a finished draw: who won, and the biggest upset */
function newsFromDraw(D,ev,mine){if(!D||!D.res||D.res.length<D.R)return;const RK={};for(const e of rankingList(save.stage))RK[e.id]=e.rank;
  const champ=D.res[D.R-1][0].w,P=D.players[champ];const big=['Major','Masters','Tour 500','Tour 250','Finals','Junior major','National','Conference','College'].includes(ev.tier);
  if(P&&!P.me&&(big||mine||P.rival!=null))newsAdd((P.rival!=null?'Your rival ':'')+P.name+(RK[champ]?' (#'+RK[champ]+')':'')+' wins the '+ev.n+'.');
  let up=null;for(const r of D.res)for(const m of r){const l=m.w===m.a?m.b:m.a,rw=RK[m.w]||999,rl=RK[l]||999;if(l==='me'||m.w==='me')continue;if(rl<=8&&rw>=rl*4&&(!up||rw/rl>up.k))up={k:rw/rl,w:m.w,l,rw,rl}}
  if(up&&big)newsAdd('Upset at the '+ev.n+': #'+up.rw+' '+D.players[up.w].name+' knocks out #'+up.rl+' '+D.players[up.l].name+'.')}
/* once a week: a new No. 1, and your own milestones */
function weekNews(){const L=rankingList(save.stage),top=L[0],me=L.find(e=>e.me);
  if(top&&save.no1!==top.id){if(save.no1)newsAdd(top.me?'You are the new No. 1!':top.name+' is the new No. 1.');save.no1=top.id}
  if(me){const marks=[100,50,20,10,5],k=save.stage+'best';save.mk=save.mk||{};for(const x of marks)if(me.rank<=x&&(save.mk[k]||9999)>x){newsAdd('You break into the top '+x+'.');save.mk[k]=x;break}}}
function newsCard(){const N=(save.news||[]).slice(-6).reverse();
  return'<h3>Tour news</h3>'+(N.length?'<ul class="news">'+N.map(n=>'<li><small class="muted">'+esc(n.w)+'</small>'+esc(n.t)+'</li>').join('')+'</ul>':'<p class="muted" style="font-size:14px">News from around the tour shows up here as the season goes on.</p>')}
