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
      M.mv[1]={x:0,v:0,z:-(0.72-0.5)*23.77,vz:0};
      for(const ty of [0.75,0.85,0.95])for(const bx of [0,0.6]){const from={x:0,y:-0.03,z:0.55},Dm=Math.hypot(bx*4.115,(ty+0.03)*23.77);
        const sh=T.makeShot(from,{x:bx,y:ty},Math.sqrt(9.81*Dm)*1.08,140,{who:'me',type:'lob',lob:true,recv:{x:0,z:M.mv[1].z}});
        T.fallbackHit(1,sh);out.push({to:[bx,ty],land:[+sh.land.x.toFixed(2),+sh.land.y.toFixed(2)],smash:sh.smash,reach:T.canReach(1,sh),hy:+sh.hy.toFixed(2),hz:+sh.hz.toFixed(2)})}
      // opponent smash replies from y=0.85 / 0.7
      const res=[];for(const fy of [0.7,0.85])for(let k=0;k<6;k++){M.shot={smash:true,volley:false};M.me.y=-0.05;T.oppHit({x:0.1,y:fy,z:1.15});const s=M.shot;res.push([fy,s.kind,+s.speed.toFixed(1),s.err,+s.land.x.toFixed(2),+s.land.y.toFixed(2)])}
      out.push(res);return out}""")
    for x in r:print(json.dumps(x))
    print('errors',errs[:3])
    await b.close()
asyncio.run(main())
