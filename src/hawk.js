/* ================= line calls and Hawk-Eye challenges =================
   At tour events and majors, a ball within about 5 cm of a line is now and then miscalled. The player the call goes
   against can challenge: three per set, one more in a tiebreak, kept when the challenge is right. The Hawk-Eye
   close-up shows where the ball landed. An overturned "out" gives the point to the hitter if the shot couldn't have
   been returned and otherwise replays it; an overturned "in" makes it out (a fault on a first serve). */
function hawkVenue(){return!!(M&&!M.drill&&hasOfficials())}
/* signed distance (metres) from the ball to the line that matters; positive = in */
function lineMargin(sh,serve,toOpp){const l=sh.land;if(!l)return{d:9,line:'base'};const de=side()==='deuce';let c;
  if(serve){if(toOpp){const lo=de?-1:0,hi=de?0:1;c=[[(l.x-(lo-0.01))*HW,lo<0?'side':'center'],[((hi+0.01)-l.x)*HW,hi>0?'side':'center'],[(0.772-l.y)*CL,'service']]}
    else{const lo=de?0:-1,hi=de?1:0;c=[[(l.x-(lo-0.01))*HW,lo<0?'side':'center'],[((hi+0.01)-l.x)*HW,hi>0?'side':'center'],[(l.y-0.228)*CL,'service']]}}
  else c=[[(1.012-Math.abs(l.x))*HW,'side'],[toOpp?(1.004-l.y)*CL:(l.y+0.004)*CL,'base']];
  let m=c[0];for(const x of c)if(x[0]<m[0])m=x;return{d:m[0],line:m[1]}}
/* the line judge's call: right almost always, but now and then wrong on a ball that is very close */
function judge(sh,serve,toOpp){if(sh.net)return false;const r=lineMargin(sh,serve,toOpp),realIn=r.d>=0;let calledIn=realIn;
  if(hawkVenue()&&Math.abs(r.d)<0.05&&Math.random()<0.32*(1-Math.abs(r.d)/0.05))calledIn=!realIn;
  sh.hawk={d:r.d,line:r.line,realIn,calledIn,serve:!!serve};return calledIn}
function chalReset(){M.chal=[3,3];M.chalSet=M.sets.length;M.chalTb=false}
function chalCheck(){if(!M.chal||M.chalSet!==M.sets.length)chalReset();if(M.tb&&!M.chalTb){M.chal[0]++;M.chal[1]++;M.chalTb=true}}
/* a close call has gone against `loser`: offer (or decide) a challenge. Returns true if the challenge flow takes over */
function hawkOffer(sh,loser,onStand,onOverturn){if(!hawkVenue()||!sh||!sh.hawk||Math.abs(sh.hawk.d)>=0.06)return false;chalCheck();if(M.chal[loser]<=0)return false;
  if(loser===1){const wrong=sh.hawk.realIn!==sh.hawk.calledIn,p=wrong?0.75:Math.abs(sh.hawk.d)<0.03?0.2:0.04;if(Math.random()>=p)return false;
    M.lock=true;M.state='review';say(M.cfg.opp.name+' challenges the call.');after(()=>hawkReview(1,sh,onStand,onOverturn),900);return true}
  M.lock=true;M.state='review';const b=$('chalBtn');b.innerHTML='Challenge<small>'+M.chal[0]+' left</small><i></i>';b.hidden=false;b.classList.remove('go2');void b.offsetWidth;b.classList.add('go2');
  let taken=false;b.onclick=e=>{e.stopPropagation();if(taken)return;taken=true;b.hidden=true;hawkReview(0,sh,onStand,onOverturn)};
  after(()=>{if(taken)return;taken=true;b.hidden=true;onStand()},2800);return true}
/* the review: Hawk-Eye close-up, a slow clap, then the verdict */
function hawkReview(who,sh,onStand,onOverturn){const h=sh.hawk,over=h.realIn!==h.calledIn;if(!over)M.chal[who]--;
  hawkDraw(h);$('hawk').hidden=false;slowClap();
  after(()=>{const v=$('hkVerdict');v.textContent=h.realIn?'IN':'OUT';v.className=h.realIn?'in':'out';
    $('hkSub').textContent=(h.realIn?(h.d<0.01?'Just touching the line':'In by '+(h.d*100).toFixed(1)+' cm'):'Out by '+(-h.d*100).toFixed(1)+' cm')+' · '+(over?'call overturned':'call stands')+(who===0?' · '+M.chal[0]+' challenge'+(M.chal[0]===1?'':'s')+' left':'');
    $('hawk').classList.add('done');sndCrowdVoice(over?'cheer':'ooh',0.7);if(hasOfficials())speak(over?'Call overturned.':'The call stands.',{rate:1})},2300);
  after(()=>{$('hawk').hidden=true;$('hawk').classList.remove('done');(over?onOverturn:onStand)()},4300)}
function hawkDraw(h){const S=3.6,vert=h.line==='side'||h.line==='center',r=3.3,c=r-h.d*100;   // cm; c = ball centre measured outward from the line's outer edge
  const W=320,H=190,lineW=5*S,mid=vert?W/2:H/2,edge=mid+lineW/2,cx=vert?edge+c*S:W/2,cy=vert?H/2:edge+c*S,surf=(W3.venue&&W3.venue.court)||0x2F62B0,col='#'+surf.toString(16).padStart(6,'0');
  const line=vert?'<rect x="'+(mid-lineW/2)+'" y="0" width="'+lineW+'" height="'+H+'" fill="#f4f4ee"/>':'<rect x="0" y="'+(mid-lineW/2)+'" width="'+W+'" height="'+lineW+'" fill="#f4f4ee"/>';
  const trail=[0.2,0.4,0.6,0.8].map((t,i)=>'<circle class="hk-t" style="animation-delay:'+(0.25+i*0.15)+'s" cx="'+(vert?cx-40*(1-t):cx+60*(1-t))+'" cy="'+(vert?cy+70*(1-t):cy-40*(1-t))+'" r="'+(r*S*(0.5+0.4*t))+'" fill="rgba(211,232,107,.45)"/>').join('');
  $('hkSvg').innerHTML='<svg viewBox="0 0 '+W+' '+H+'" width="100%"><rect width="'+W+'" height="'+H+'" fill="'+col+'"/>'+line+'<text x="'+(vert?mid-lineW/2-10:12)+'" y="'+(vert?18:mid-lineW/2-8)+'" fill="rgba(255,255,255,.6)" font-size="12" text-anchor="'+(vert?'end':'start')+'">IN</text><text x="'+(vert?edge+10:12)+'" y="'+(vert?18:edge+18)+'" fill="rgba(255,255,255,.6)" font-size="12">OUT</text>'+trail+
    '<ellipse class="hk-mark" cx="'+cx+'" cy="'+cy+'" rx="'+(vert?r*S:r*S*1.6)+'" ry="'+(vert?r*S*1.6:r*S)+'" fill="#D3E86B" stroke="#7c8c22" stroke-width="2"/></svg>';
  $('hkVerdict').textContent='';$('hkSub').textContent='Hawk-Eye';}
function slowClap(){const B=SND.bank;if(!sndReady()||!B.clap1)return;let t=0,gap=0.55;for(let k=0;k<9;k++){play(pickA(B.clap1),{gain:0.25+k*0.06,rate:rng(0.95,1.05),when:t,wet:1});t+=gap;gap*=0.8}}
/* the corrected outcome after an overturned call */
function hawkCorrect(sh){const h=sh.hawk,hitter=sh.who==='me'?0:1,recv=1-hitter,serve=h.serve,bypass=(w,t,c,k)=>{M.lock=false;M.hawkBypass=true;pointTo(w,t,c,k)};
  if(!h.calledIn&&h.realIn){// called out but it was in
    const reach=hitter===0?canReach(1,sh):canReach(0,sh);
    if(!reach){if(hitter===0){if(serve)M.stat.aces++;else M.stat.winners++}bypass(hitter,serve?'In on review: an ace.':'In on review: a winner.',serve?'ACE':'WINNER','wn')}
    else{M.lock=false;say('The ball was in. Replay the point.');const second=serve&&sh.second;nextPoint();if(second){if(hitter===0)M.fault=true;else M.oFault=true}}}
  else{// called in but it was out
    if(serve&&!sh.second){M.lock=false;say('Out on review: fault. Second serve.');nextPoint();if(hitter===0)M.fault=true;else M.oFault=true}
    else bypass(recv,serve?'Out on review: double fault.':'Out on review.',serve?'DOUBLE FAULT':'OUT',serve?null:'ue')}}
/* a point is about to be scored: if the call that decided it was close and went against someone, they may challenge */
function hawkPoint(w,text,call,kind){if(M.hawkBypass){M.hawkBypass=false;return false}const sh=M.shot;if(!sh||!sh.hawk)return false;
  return hawkOffer(sh,1-w,()=>{M.lock=false;M.hawkBypass=true;pointTo(w,text,call,kind)},()=>hawkCorrect(sh))}
/* a first-serve fault (no point is scored): the server may challenge */
function hawkFault(sh,server,go){return hawkOffer(sh,server,()=>{M.lock=false;go()},()=>hawkCorrect(sh))}
