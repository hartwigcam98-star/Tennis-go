"""How fast does the ranking move? Plays careers with every match decided by a fixed win chance (window.__SIM)
and logs your rank after each event. Usage: python3 trank.py 0.8"""
import asyncio,json,sys
from playwright.async_api import async_playwright
P=float(sys.argv[1]) if len(sys.argv)>1 else 0.75
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script(f"window.__SIM=(cfg)=>Math.random()<{P}")
    await pg.goto('file:///home/claude/tennis-go/index.html')
    await pg.click('#btnNew');await pg.click('.pc[data-id="ch08"]');await pg.click('#selGo')
    await pg.click('#styles .pc[data-id="server"]');await pg.click('#styleGo')
    rows=[];last=None
    for i in range(1500):
      vis=await pg.evaluate("()=>['hub','result','season','recruit','title','draw'].find(s=>!document.getElementById(s).hidden)")
      if vis=='hub':
        info=await pg.evaluate("()=>{const t=document.getElementById('playerCard').innerText.replace(/\\n/g,' ');const m=t.match(/(Junior|College|World) rank #(\\d+)/i);const s=t.match(/(Juniors|College|Pro tour) season (\\d+)/i);return [m?m[1]+' #'+m[2]:'?',s?s[0]:'?',document.querySelector('#nextCard h3')?document.querySelector('#nextCard h3').innerText:'']}")
        key=info[1]+'|'+info[0]
        if key!=last:
          rows.append(info);last=key
        await pg.evaluate("document.getElementById('btnPlay').click()");await pg.wait_for_timeout(10)
      elif vis=='draw':await pg.evaluate("document.getElementById('drPlay').click()");await pg.wait_for_timeout(10)
      elif vis=='result':await pg.evaluate("document.getElementById('rGo').click()")
      elif vis=='season':
        btns=await pg.query_selector_all('#seBtns button');labels=[(await x.text_content()).strip() for x in btns]
        t=0
        if any('Return' in l for l in labels) and 'season 3' in ' '.join(labels):t=[j for j,l in enumerate(labels) if 'Return' in l][0]
        if any(l=='Retire' for l in labels):break
        await btns[t].click()
        if 'Pro tour season 5' in str(rows[-1:]):break
      elif vis=='recruit':
        btn=await pg.query_selector('#offers button:not([disabled])');await btn.click()
      else:break
    cur=None
    for r in rows:
      if r[1]!=cur:print();print(r[1],end=': ');cur=r[1]
      print(r[0].split('#')[1],end=' ')

    print();print('errors',errs[:3]);await b.close()
asyncio.run(main())
