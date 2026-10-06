import asyncio,json
from playwright.async_api import async_playwright
JS=r"""()=>{window.__FREEZE=1;const T=__TG,M=T.M,D=T.dbg;M.state='between';M.lock=true;const HW=4.115,CL=23.77,out=[];
 const peakAfter=sh=>{const b=sh.r.bounces[0];if(!b)return null;let m=0;for(let i=Math.ceil(b.t/sh.dt);i<sh.n;i++){m=Math.max(m,sh.S[i*3+1]);if(sh.r.bounces[1]&&i*sh.dt>sh.r.bounces[1].t)break}return +m.toFixed(2)};
 const curve=sh=>{const b=sh.r.bounces[0],S=sh.S,n=Math.floor(b.t/sh.dt);let mx=0;const x0=S[0],z0=S[2],x1=b.x,z1=b.z,L=Math.hypot(x1-x0,z1-z0);for(let i=0;i<n;i++){const d=Math.abs((x1-x0)*(z0-S[i*3+2])-(x0-S[i*3])*(z1-z0))/L;mx=Math.max(mx,d)}return +mx.toFixed(2)};
 for(const surf of ['hard','grass','clay']){M.surf=D.SURF[surf];
  for(const [ty,spd,w,ss] of [['flat',47,50,0],['slice',41.6,20,360],['kick',36,430,-70]])for(const tx of [-0.85,-0.5,-0.15]){
    const sh=T.makeShot({x:0.4,y:-0.08,z:2.25/1.7},{x:tx,y:0.7},spd,w,{who:'me',type:'serve',ss});
    out.push({surf,ty,tgt:tx,land:[+sh.land.x.toFixed(2),+sh.land.y.toFixed(2)],net:sh.net,curveM:curve(sh),bounceH:peakAfter(sh)})}
  for(const [nm,spd,w] of [['topspin',26,200],['slice',21,-180]]){const sh=T.makeShot({x:0,y:-0.03,z:0.55},{x:0.3,y:0.85},spd,w,{who:'me',type:'drive'});out.push({surf,shot:nm,land:[+sh.land.x.toFixed(2),+sh.land.y.toFixed(2)],net:sh.net,bounceH:peakAfter(sh),hitH:+sh.hz.toFixed(2)})}}
 return out}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=await b.new_page(viewport={'width':200,'height':300});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script("window.CHAR_BASE='file:///home/claude/hartwigcam98-star/golf-go/'")
    await pg.goto('file:///home/claude/tennis-go/index.html')
    await pg.select_option('#qmVenue','club');await pg.click('#btnQuick');await pg.wait_for_timeout(400);await pg.evaluate("document.querySelector('.pc[data-id=\"ch08\"]').click()");await pg.evaluate("document.getElementById('selGo').click()")
    for i in range(80):
      if await pg.evaluate("()=>!!(window.__TG&&__TG.M&&__TG.P()[0])"):break
      await pg.wait_for_timeout(200)
    for r in await pg.evaluate(JS):print(json.dumps(r))
    print('errors',errs[:3]);await b.close()
asyncio.run(main())
