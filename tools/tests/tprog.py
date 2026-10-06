import asyncio
from playwright.async_api import async_playwright
S='/tmp/claude-0/-home-claude/c059be0d-034d-5550-9882-6f1de26df84e/scratchpad/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=await b.new_page(viewport={'width':390,'height':844});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script("window.CHAR_BASE='file:///home/claude/hartwigcam98-star/golf-go/'")
    await pg.goto('file:///home/claude/tennis-go/index.html')
    print('locker card:',await pg.text_content('#lockerSub'))
    await pg.click('#btnQuick');await pg.wait_for_timeout(400)
    print('locked cards:',await pg.evaluate("document.querySelectorAll('.pc.locked').length"),'| first locked text:',await pg.evaluate("document.querySelector('.pc.locked small').textContent"))
    await pg.screenshot(path=S+'roster.png')
    await pg.evaluate("document.querySelector('.pc[data-id=\"ch08\"]').click()");await pg.evaluate("document.getElementById('selGo').click()")
    for i in range(80):
      if await pg.evaluate("()=>!!(window.__TG&&__TG.M&&__TG.P()[0])"):break
      await pg.wait_for_timeout(200)
    await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{const M=__TG.M;M.sets=[[6,0]];M.over=true;M.winner=0;M.lock=true;M.stat.aces=12;M.stat.winners=30;M.stat.perfect=28;M.stat.smashes=2;M.stat.rallyMax=11;__TG.dbg.endMatch()}")
    await pg.wait_for_timeout(600)
    await pg.screenshot(path=S+'rewards.png',full_page=True)
    print('rewards:',(await pg.text_content('#rRewards'))[:300])
    await pg.click('#rGo');await pg.wait_for_timeout(400)
    await pg.click('#btnLocker');await pg.wait_for_timeout(300)
    for t in ['daily','gear','players','style','trophies']:
      await pg.click(f'#lkTabs button[data-t="{t}"]');await pg.wait_for_timeout(200);await pg.screenshot(path=S+f'lk_{t}.png',full_page=True)
    await pg.click('#lkTabs button[data-t="gear"]');await pg.wait_for_timeout(200)
    c0=await pg.evaluate("__TG.dbg.PROF.coins");await pg.click('#lkBody button[data-g="racket"]');await pg.wait_for_timeout(200)
    print('bought racket:',await pg.evaluate("__TG.dbg.PROF.gear.racket"),'coins',c0,'->',await pg.evaluate("__TG.dbg.PROF.coins"))
    await pg.click('#lkBack');await pg.click('#btnBackup');await pg.wait_for_timeout(200);code=await pg.input_value('#saveCode');print('backup code prefix',code[:4],len(code))
    print('errors',errs[:3]);await b.close()
asyncio.run(main())
