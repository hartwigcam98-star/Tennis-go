import asyncio
from playwright.async_api import async_playwright
S='/tmp/claude-0/-home-claude/c059be0d-034d-5550-9882-6f1de26df84e/scratchpad/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=await b.new_page(viewport={'width':390,'height':760});errs=[];reqs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('request',lambda r:reqs.append(r.url))
    await pg.goto('file:///home/claude/tennis-go/index.html')   # no CHAR_BASE override: must use the bundled characters
    await pg.click('#btnTune');await pg.wait_for_timeout(300);print('panel from title open:',await pg.evaluate("!document.getElementById('tunePanel').hidden"))
    await pg.click('#tClose')
    await pg.select_option('#qmVenue','major:London');await pg.click('#btnQuick');await pg.wait_for_timeout(400)
    await pg.evaluate("document.querySelector('.pc[data-id=\"ch08\"]').click()");await pg.evaluate("document.getElementById('selGo').click()")
    for i in range(100):
      if await pg.evaluate("()=>!!(window.__TG&&__TG.M&&__TG.P()[0])"):break
      await pg.wait_for_timeout(200)
    print('char requests:',[u.split('/')[-1] for u in reqs if 'char' in u],'| golf-go requests:',sum('golf-go' in u for u in reqs))
    print('boss fallback used?',await pg.evaluate("__TG.P()[0].D.id"))
    n0=await pg.evaluate("__TG.W3.crowdMeshes[0].count")
    for k in range(6):
      await pg.wait_for_timeout(5000)
      print(' t',(k+1)*5,'s quality',await pg.evaluate("localStorage.getItem('tennis-go-quality')"),'crowd',await pg.evaluate("__TG.W3.crowdMeshes[0].count"),'of',await pg.evaluate("__TG.W3.crowdN"),'pr',await pg.evaluate("__TG.W3.r.getPixelRatio()"),'shadow',await pg.evaluate("__TG.W3.sun.castShadow"))
    # long-press the scoreboard
    bb=await pg.evaluate("(()=>{const r=document.getElementById('board').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()")
    await pg.mouse.move(*bb);await pg.mouse.down();await pg.wait_for_timeout(800);await pg.mouse.up();await pg.wait_for_timeout(500)
    print('panel open:',await pg.evaluate("!document.getElementById('tunePanel').hidden"),'clock paused ts:',await pg.evaluate("__TG.dbg.CLK.ts"))
    await pg.screenshot(path=S+'tune.png')
    await pg.evaluate("(()=>{const i=document.querySelector('#tBody input[data-k=perfect]');i.value=0.5;i.dispatchEvent(new Event('input'))})()")
    print('perfect window now:',await pg.text_content('#o_perfect'),'| saved',await pg.evaluate("JSON.parse(localStorage.getItem('tennis-go-tune')).perfect"))
    await pg.click('#tClose');await pg.wait_for_timeout(1200);print('resumed: hidden',await pg.evaluate("document.getElementById('tunePanel').hidden"),'paused',await pg.evaluate("__TG.dbg.CLK.paused"),'ts',await pg.evaluate("__TG.dbg.CLK.ts"),'slow',await pg.evaluate("__TG.dbg.CLK.slow"))
    print('errors',errs[:3]);await b.close()
asyncio.run(main())
