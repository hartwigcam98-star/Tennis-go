import asyncio,json,sys
from playwright.async_api import async_playwright
JS=r"""(lv)=>{window.__FREEZE=1;const T=__TG,D=T.dbg,M=T.M;M.state='between';M.lock=true;M.os=lv;M.surf=D.SURF.hard;
 const HW=4.115,CL=23.77,out={};
 const setOpp=(x,y)=>{M.mv[1]={x:x*HW,v:0,z:(0.5-y)*CL,vz:0}},setMe=(x,y)=>{M.mv[0]={x:x*HW,v:0,z:(0.5-y)*CL,vz:0}};
 const ue=(pr,s)=>Math.max(0.01,0.05-s*0.004)+Math.pow(pr,1.6)*(0.55-s*0.03);
 // 1) my first serves: random swipes as a player would make them (power 0.4-1.1, aimed around the box)
 let n=0,ace=0,err=0,inn=0,prs=0;
 for(let k=0;k<1500;k++){const deuce=k%2==0;M.pts=[deuce?0:1,0];M.fault=false;const ctr=deuce?-0.5:0.5;
   setOpp(deuce?-0.45:0.45,1.05);
   const pw=0.4+Math.random()*0.7,ax=ctr+(Math.random()*2-1)*0.55,ay=0.62+Math.random()*0.12,a={x:ax,y:ay,pw,f:0.5,r:0.03+pw*pw*0.15*(1.15-5*0.07)};
   const l=D.scatter(a),spd=(12.8+20*Math.min(pw,1.1)+2*window.__SV)*1.04;const sh=T.makeShot({x:deuce?0.4:-0.4,y:-0.08,z:2.25/1.7},{x:l.x,y:l.y},spd,50,{who:'me',type:'serve'});
   const lo=deuce?-1:0,hi=deuce?0:1,L=sh.land,ok=!sh.net&&L.x>=lo-0.01&&L.x<=hi+0.01&&L.y>=0.5&&L.y<=0.772;n++;if(!ok)continue;inn++;
   D.fallbackHit(1,sh);if(!D.canReach(1,sh)){ace++;continue}const pr=D.pressureOf(1,sh);prs+=pr;if(Math.random()<ue(pr,lv))err++}
 out.myServe={inPct:+(inn/n*100).toFixed(0),acePctOfIn:+(ace/inn*100).toFixed(1),returnErrPct:+(err/(inn-ace)*100).toFixed(1),avgPress:+(prs/(inn-ace)).toFixed(2)};
 // 2) their serves to me
 n=0;ace=0;prs=0;for(let k=0;k<1500;k++){const deuce=k%2==0;M.pts=[deuce?0:1,0];const s=lv,d=deuce,lo=d?0:-1,hi=d?1:0;
   setMe(d?0.45:-0.45,-0.05);const spd=(31.2+s*2.64+(Math.random()*4-2))*1.0,wide=Math.random()<0.3+s*0.04;
   const bx=wide?(d?(Math.random()<0.5?0.1:0.88):(Math.random()<0.5?-0.1:-0.88)):lo+0.25+Math.random()*0.5,by=0.24+Math.random()*0.1;
   let sh=null;for(let j=0;j<4;j++){sh=T.makeShot({x:d?-0.4:0.4,y:1.08,z:2.25/1.7},{x:bx,y:by},spd*Math.pow(0.88,j),120+j*70,{who:'op',serve:true,recv:null});if(!sh.net&&sh.land.y>0.2&&sh.land.y<0.5)break}
   n++;D.fallbackHit(0,sh);if(!D.canReach(0,sh)){ace++;continue}prs+=D.pressureOf(0,sh)}
 out.theirServe={acePct:+(ace/n*100).toFixed(1),myAvgPress:+(prs/(n-ace)).toFixed(2)};
 // 3) rally: me on my baseline hitting typical swipes, them on theirs
 const cases={rally:[0.3,0.75],deepCorner:[0.85,0.92],drop:[0.4,0.6],bigCross:[0.8,0.85]};
 for(const [nm,[tx,ty]] of Object.entries(cases)){let r=0,ee=0,pp=0,N=600;
   for(let k=0;k<N;k++){setOpp(-0.1+Math.random()*0.2,1.06);setMe(0,-0.04);const pw=nm=='drop'?0.2:nm=='rally'?0.5:0.95;
     const x=(Math.random()<0.5?-1:1)*tx,a={x,y:ty,pw,f:nm=='drop'?0.1:0.7,r:0.03+pw*pw*0.2*0.8+0.02};const l=D.scatter(a);
     const spd=nm=='drop'?Math.max(9+2.5*pw,Math.sqrt(9.81*Math.hypot(l.x*HW,(l.y)*CL))*1.3):8+18*pw+1.3*window.__PW,w=nm=='drop'?-170:170+70*(1-pw)+30;
     const sh=T.makeShot({x:0,y:-0.03,z:0.55},{x:l.x,y:l.y},spd,w,{who:'me',type:nm=='drop'?'drop':'drive',recv:{x:M.mv[1].x,z:M.mv[1].z}});sh.w=w;
     if(sh.net||Math.abs(sh.land.x)>1||sh.land.y>1||sh.land.y<0.5)continue;D.fallbackHit(1,sh);if(!D.canReach(1,sh)){r++;continue}const pr=D.pressureOf(1,sh);pp+=pr;if(Math.random()<ue(pr,lv))ee++}
   out[nm]={winnerPct:+(r/N*100).toFixed(1),errPct:+(ee/(N-r)*100).toFixed(1),press:+(pp/(N-r)).toFixed(2)}}
 return out}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=await b.new_page(viewport={'width':200,'height':300})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script("window.CHAR_BASE='file:///home/claude/hartwigcam98-star/golf-go/'")
    await pg.goto('file:///home/claude/tennis-go/index.html')
    await pg.select_option('#qmVenue','club');await pg.click('#btnQuick');await pg.wait_for_timeout(400);await pg.evaluate("document.querySelector('.pc[data-id=ch08]').click()");await pg.evaluate("document.getElementById('selGo').click()")
    for i in range(80):
      if await pg.evaluate("()=>!!(window.__TG&&__TG.M&&__TG.P()[0])"):break
      await pg.wait_for_timeout(200)
    for lv,sv,pwr in [(2,3,3),(5,6,6),(8,10,10)]:
      await pg.evaluate(f"()=>{{window.__SV={sv};window.__PW={pwr}}}")
      r=await pg.evaluate(JS,lv);print('opp level',lv,'my serve/power',sv,json.dumps(r))
    print('errors',errs[:3])
    await b.close()
asyncio.run(main())
