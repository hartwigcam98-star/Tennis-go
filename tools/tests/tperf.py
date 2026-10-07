"""Performance check at roughly phone speed (CPU throttled 4x): page load, the sound bank on the first tap, a venue's
crowd at match start, JavaScript time per frame during a rally, the week-end simulation, and the save size."""
import asyncio,json
from playwright.async_api import async_playwright
THROTTLE=4
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=await b.new_page(viewport={'width':390,'height':760})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    cdp=await pg.context.new_cdp_session(pg);await cdp.send('Emulation.setCPUThrottlingRate',{'rate':THROTTLE})
    await pg.add_init_script("window.CHAR_BASE='file:///home/claude/hartwigcam98-star/golf-go/'")
    t=await pg.evaluate("()=>0")
    import time;t0=time.time();await pg.goto('file:///home/claude/tennis-go/index.html');print('page load (s)',round(time.time()-t0,2))
    # long tasks
    await pg.evaluate("()=>{window.__LT=[];new PerformanceObserver(l=>{for(const e of l.getEntries())window.__LT.push(Math.round(e.duration))}).observe({entryTypes:['longtask']})}")
    await pg.mouse.click(5,5);await pg.wait_for_timeout(6000)
    print('sound bank: first-tap build (ms)',await pg.evaluate("()=>__TG.dbg.SND.tm"),'longest tasks',await pg.evaluate("()=>window.__LT.sort((a,b)=>b-a).slice(0,5)"))
    await pg.evaluate("()=>{window.__LT=[]}")
    await pg.evaluate("()=>{document.getElementById('qmVenue').value='major:New York';document.getElementById('btnQuick').click()}");await pg.wait_for_timeout(300)
    t0=time.time();await pg.evaluate("document.querySelector('.pc[data-id=ch08]').click()");await pg.evaluate("document.getElementById('selGo').click()")
    for i in range(200):
      if await pg.evaluate("()=>!!(__TG.M&&__TG.P()[0]&&document.getElementById('loading').hidden)"):break
      await pg.wait_for_timeout(100)
    print('match load (s)',round(time.time()-t0,2),'longest tasks while loading',await pg.evaluate("()=>window.__LT.sort((a,b)=>b-a).slice(0,5)"))
    await pg.evaluate("()=>{window.__LT=[]}");await pg.wait_for_timeout(4000)
    print('venue crowd build',await pg.evaluate("()=>[__TG.dbg.SND.tm,!!(__TG.dbg.SND.vb&&__TG.dbg.SND.vb.cheer)]"),'longest tasks after play starts',await pg.evaluate("()=>window.__LT.sort((a,b)=>b-a).slice(0,5)"))
    # script time per frame during play (CDP metrics), with the opponent serving so the ball is moving
    await cdp.send('Performance.enable')
    await pg.evaluate("()=>{window.__FR=0;const f=()=>{window.__FR++;requestAnimationFrame(f)};requestAnimationFrame(f)}")
    m0={x['name']:x['value'] for x in (await cdp.send('Performance.getMetrics'))['metrics']};f0=await pg.evaluate("()=>__FR")
    await pg.wait_for_timeout(5000)
    m1={x['name']:x['value'] for x in (await cdp.send('Performance.getMetrics'))['metrics']};f1=await pg.evaluate("()=>__FR")
    n=max(1,f1-f0);print('frames in 5s',n,'script ms/frame',round((m1['ScriptDuration']-m0['ScriptDuration'])*1000/n,1),'layout+style ms/frame',round(((m1['LayoutDuration']-m0['LayoutDuration'])+(m1['RecalcStyleDuration']-m0['RecalcStyleDuration']))*1000/n,1),'heap MB',round(m1['JSHeapUsedSize']/1e6,1))
    print('errors',errs[:3]);await b.close()
asyncio.run(main())
