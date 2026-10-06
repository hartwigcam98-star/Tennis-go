import asyncio
from playwright.async_api import async_playwright
S='/tmp/claude-0/-home-claude/c059be0d-034d-5550-9882-6f1de26df84e/scratchpad/'
async def waitM(pg):
  for i in range(100):
    if await pg.evaluate("()=>!!(window.__TG&&__TG.M&&__TG.P()[0]&&document.getElementById('loading').hidden)"):return
    await pg.wait_for_timeout(200)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    ctx=await b.new_context(viewport={'width':390,'height':760});pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('file:///home/claude/tennis-go/index.html')
    # ---- quick match: pause freezes everything
    await pg.click('#btnQuick');await pg.wait_for_timeout(400);await pg.evaluate("document.querySelector('.pc[data-id=ch08]').click()");await pg.evaluate("document.getElementById('selGo').click()")
    await waitM(pg);await pg.wait_for_timeout(3000)
    await pg.click('#quit');await pg.wait_for_timeout(300)
    g0=await pg.evaluate("__TG.dbg.GT");st0=await pg.evaluate("__TG.M.state");await pg.wait_for_timeout(3000)
    g1=await pg.evaluate("__TG.dbg.GT");st1=await pg.evaluate("__TG.M.state")
    print('pause menu:',await pg.evaluate("!document.getElementById('pauseMenu').hidden"),'| clock frozen:',g0==g1,'| state held:',st0,'->',st1,'|',await pg.text_content('#pmScore'))
    await pg.screenshot(path=S+'pause.png')
    await pg.click('#pmResume');await pg.wait_for_timeout(800);print('resumed, clock moving:',await pg.evaluate("__TG.dbg.GT")>g1)
    # ---- score a few points, then reload
    for k in range(3):
      await pg.evaluate("()=>{const M=__TG.M;M.lock=false;M.state='me';M.rally=2;M.shot=__TG.makeShot({x:0,y:-0.03,z:0.55},{x:0.6,y:0.9},30,170,{who:'me',type:'drive'});__TG.dbg.pointTo(0,'Winner!','WINNER')}")
      for i in range(60):
        if await pg.evaluate("()=>{const M=__TG.M;return M.state==='serveMe'||M.state==='oppServe'}"):break
        await pg.wait_for_timeout(250)
    sc=await pg.evaluate("JSON.stringify([__TG.M.sets,__TG.M.pts])");print('score before leaving:',sc)
    # app goes to the background: auto-pause and save
    await pg.evaluate("Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))")
    print('auto-paused on background:',await pg.evaluate("!document.getElementById('pauseMenu').hidden"))
    await pg.reload();await pg.wait_for_timeout(600)
    print('title live card:',await pg.evaluate("!document.getElementById('liveCard').hidden"),'|',await pg.text_content('#liveSub'))
    await pg.click('#btnLiveGo');await waitM(pg);await pg.wait_for_timeout(1500)
    print('resumed score:',await pg.evaluate("JSON.stringify([__TG.M.sets,__TG.M.pts])"),'| msg:',await pg.text_content('#msg'))
    # ---- career: start a match, score, reload, resume from the hub, finish
    await pg.evaluate("()=>{const M=__TG.M;M.over=true;M.winner=0;M.retired=true;__TG.dbg.endMatch()}");await pg.wait_for_timeout(400)
    await pg.goto('file:///home/claude/tennis-go/index.html');await pg.wait_for_timeout(400)
    await pg.click('#btnNew');await pg.evaluate("document.querySelector('.pc[data-id=ch08]').click()");await pg.evaluate("document.getElementById('selGo').click()")
    await pg.click('#styles .pc >> nth=1');await pg.click('#styleGo');await pg.wait_for_timeout(300)
    await pg.evaluate("document.getElementById('btnPlay').click()");await pg.wait_for_timeout(400);await pg.evaluate("document.getElementById('drPlay').click()")
    await waitM(pg);await pg.wait_for_timeout(2500)
    await pg.evaluate("()=>{const M=__TG.M;M.lock=false;M.state='me';M.rally=2;M.shot=__TG.makeShot({x:0,y:-0.03,z:0.55},{x:0.6,y:0.9},30,170,{who:'me',type:'drive'});__TG.dbg.pointTo(0,'Winner!','WINNER')}")
    for i in range(60):
      if await pg.evaluate("()=>{const M=__TG.M;return M.state==='serveMe'||M.state==='oppServe'}"):break
      await pg.wait_for_timeout(250)
    await pg.reload();await pg.wait_for_timeout(500)
    await pg.click('#btnContinue');await pg.wait_for_timeout(300)
    print('hub play button:',await pg.text_content('#btnPlay'))
    await pg.evaluate("document.getElementById('btnPlay').click()");await waitM(pg);await pg.wait_for_timeout(1200)
    print('career resumed score:',await pg.evaluate("JSON.stringify([__TG.M.sets,__TG.M.pts])"),'mode',await pg.evaluate("__TG.M.cfg.mode"))
    await pg.evaluate("()=>{const M=__TG.M;M.sets=[[6,2]];M.over=true;M.winner=0;M.lock=true;__TG.dbg.endMatch()}");await pg.wait_for_timeout(600)
    print('after finishing: result shown',await pg.evaluate("!document.getElementById('result').hidden"),'| live save cleared',await pg.evaluate("localStorage.getItem('tennis-go-live')===null"))
    print('errors',errs[:3]);await b.close()
asyncio.run(main())
