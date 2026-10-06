import asyncio,random
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script("window.__SIM=(cfg)=>Math.random()<0.8")
    await pg.goto('file:///home/claude/tennis-go/index.html')
    await pg.click('#btnNew');await pg.click('.pc[data-id="ch08"]');await pg.click('#selGo')
    await pg.click('#styles .pc[data-id="server"]');await pg.click('#styleGo')
    log=[];seen=set()
    for i in range(700):
      vis=await pg.evaluate("()=>['hub','result','season','recruit','title'].find(s=>!document.getElementById(s).hidden)")
      if vis=='hub':
        t=await pg.evaluate("()=>document.getElementById('nextCard').innerText.split('\\n').slice(0,2).join(' | ')+' || '+document.getElementById('playerCard').innerText.replace(/\\n/g,' ')")
        k=t[:70]
        if k not in seen and len(log)<400 and 'pro' in t.lower(): seen.add(k);log.append('HUB '+t[:200])
        note=await pg.evaluate("()=>{const n=document.querySelector('#nextCard .note');return n?n.innerText:''}")
        if False and note: seen.add('NOTE'+note[:60]);log.append('   note: '+note[:140])
        await pg.evaluate("()=>document.getElementById('btnPlay').click()");await pg.wait_for_timeout(15)
      elif vis=='result':
        await pg.evaluate("()=>document.getElementById('rGo').click()")
      elif vis=='season':
        t=await pg.evaluate("()=>document.getElementById('seTitle').innerText+' :: '+document.getElementById('seText').innerText")
        log.append('SEASON '+t[:260])
        btns=await pg.query_selector_all('#seBtns button')
        labels=[await x.inner_text() for x in btns]
        log.append('   buttons: '+str(labels))
        # stay in college until season 3 then turn pro; retire when asked
        tgt=0
        if any('Return' in l for l in labels):
          tgt=[j for j,l in enumerate(labels) if 'Return' in l][0] if 'season 3' in ' '.join(labels) else 0
        await btns[tgt].click()
      elif vis=='recruit':
        t=await pg.evaluate("()=>document.getElementById('recruitIntro').innerText+' :: '+[...document.querySelectorAll('#offers button')].map(b=>b.innerText.split('\\n')[1]+(b.disabled?'(locked)':'')).join(', ')")
        log.append('RECRUIT '+t);
        btn=await pg.query_selector('#offers button:not([disabled])');await btn.click()
      else:
        log.append('END '+str(vis));break
      st=await pg.evaluate("()=>{const s=JSON.parse(localStorage.getItem('tennis-go-v2'));return s&&s.stage+' s'+s.season+' age'+s.age}")
      if st and 'pro s6' in st: log.append('stop at '+st);break
    print('\n'.join(log));print('errors',errs[:5])
    s=await pg.evaluate("()=>localStorage.getItem('tennis-go-v2')")
    import json;d=json.loads(s);print({k:d[k] for k in ['stage','season','age','money','earnings','sponsors','rec','majors','careerW','careerL','stats','xp']})
    await b.close()
asyncio.run(main())
