import asyncio,json
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=await b.new_page(viewport={'width':300,'height':420})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script("window.CHAR_BASE='file:///home/claude/hartwigcam98-star/golf-go/'")
    await pg.goto('file:///home/claude/tennis-go/index.html')
    await pg.click('#btnQuick');await pg.click('.pc[data-id="ch08"]');await pg.click('#selGo')
    for i in range(60):
      if await pg.evaluate("()=>!!(window.__TG&&__TG.M&&__TG.P()[0])"):break
      await pg.wait_for_timeout(200)
    r=await pg.evaluate("""()=>{window.__FREEZE=1;const T=__TG,M=T.M;M.state='between';M.lock=true;const out=[];
      // opponent lobs from their baseline over me at the net (my home y=0.3 -> z=+4.75)
      for(const [bx,by] of [[0,0.08],[0.4,0.15],[-0.5,0.2],[0.2,0.05]]){
        const from={x:0.1,y:1.05,z:0.55},D=Math.hypot((bx-0.1)*4.115,(by-1.05)*23.77);
        let sh=null;for(let k=0;k<5;k++){sh=T.makeShot(from,{x:bx,y:by},Math.sqrt(9.81*D)*1.08*Math.pow(0.95,k),140,{who:'op',lob:true,recv:{x:0,z:4.75}});const L=sh.land;if(!sh.net&&Math.abs(L.x)<=1&&L.y>=0&&L.y<0.5)break}
        let ymax=0;for(let i=0;i<sh.n;i++)ymax=Math.max(ymax,sh.S[i*3+1]);
        out.push({lob:[bx,by],land:[+sh.land.x.toFixed(2),+sh.land.y.toFixed(2)],ymax:+ymax.toFixed(1),smash:sh.smash,volley:sh.volley,hz:+sh.hz.toFixed(2),hy:+sh.hy.toFixed(2),T:+sh.T.toFixed(2),spd:+sh.speed.toFixed(1)})}
      // short lob: should be a smash for a net player
      {const sh=T.makeShot({x:0,y:1.05,z:0.55},{x:0,y:0.33},9,140,{who:'op',lob:true,recv:{x:0,z:4.75}});let ymax=0;for(let i=0;i<sh.n;i++)ymax=Math.max(ymax,sh.S[i*3+1]);out.push({shortlob:1,land:[+sh.land.x.toFixed(2),+sh.land.y.toFixed(2)],ymax,smash:sh.smash,hz:sh.hz,hy:+sh.hy.toFixed(2),T:sh.T})}
      // smashes from z=+4.5 (y=0.31) at 1.95 m
      for(const [tx,ty] of [[0.6,0.7],[-0.7,0.85],[0,0.95],[0.9,0.6]])for(const spd of [26,34,42]){const sh=T.makeShot({x:0.1,y:0.31,z:1.95/1.7},{x:tx,y:ty},spd,40,{who:'me',recv:{x:0,z:-5.2}});out.push({sm:[tx,ty,spd],land:[+sh.land.x.toFixed(2),+sh.land.y.toFixed(2)],net:sh.net})}
      return out}""")
    for x in r:print(json.dumps(x))
    print('errors',errs[:3])
    await b.close()
asyncio.run(main())
