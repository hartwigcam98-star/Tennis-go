import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required'])
    pg=await b.new_page(viewport={'width':800,'height':400})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script("window.CHAR_BASE='file:///home/claude/hartwigcam98-star/golf-go/'")
    await pg.goto('file:///home/claude/tennis-go/index.html')
    await pg.select_option('#qmVenue','major:Melbourne');await pg.click('#btnQuick');await pg.click('.pc[data-id="ch08"]');await pg.evaluate("document.getElementById('selGo').click()")
    for i in range(80):
      if await pg.evaluate("()=>!!(window.__TG&&__TG.M&&__TG.P()[0])"):break
      await pg.wait_for_timeout(200)
    r=await pg.evaluate("""async()=>{const S=__TG.snd;S.sndResume();await new Promise(r=>setTimeout(r,300));
      S.sndHit(0.8);S.sndBounce(9);S.sndNet();S.sndApplause(1);S.sndCrowdVoice('ooh',0.7);S.sndCrowdVoice('cheer',1);S.lineCall('Out!');S.umpireScore(0,1);S.crowdCheer(1,6,6);
      return {state:S.ctx&&S.ctx.state,rate:S.ctx&&S.ctx.sampleRate}}""")
    print(r)
    await pg.wait_for_timeout(2500)
    await pg.evaluate("()=>{document.querySelector('.hud.top').style.display='none';document.querySelector('.hud.bot').style.display='none'}")
    await pg.screenshot(path='stand.png')
    print('errors',errs[:3])
    await b.close()
asyncio.run(main())
