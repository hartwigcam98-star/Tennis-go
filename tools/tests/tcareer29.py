"""Drive a whole career with the match engine stubbed out (window.__SIM) and the new Sim button,
picking rest weeks and smaller events now and then. Checks the schedule picker, fatigue, aging, earned rivals
and the Tour Finals flow. Run from a scratch folder: screenshots land in the current directory."""
import asyncio,json,random,sys
from playwright.async_api import async_playwright
STEPS=int(sys.argv[1]) if len(sys.argv)>1 else 2500
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    # stubbed matches: win often, more in the pros so the Tour Finals come up; report a match load for fatigue
    await pg.add_init_script("window.__SIM=(cfg)=>{return Math.random()<(cfg.stage==='pro'?0.82:0.75)}")
    await pg.goto('file:///home/claude/tennis-go/index.html')
    await pg.click('#btnNew');await pg.click('.pc[data-id="ch08"]');await pg.click('#selGo')
    await pg.click('#styles .pc[data-id="server"]');await pg.click('#styleGo')
    log=[];shots=set();seen={'rest':0,'alt':0,'sim':0,'play':0,'finals':0,'newrival':0,'finalsMatch':0}
    for i in range(STEPS):
      vis=await pg.evaluate("()=>['hub','result','season','recruit','title','draw'].find(s=>!document.getElementById(s).hidden)")
      if vis=='hub':
        await pg.evaluate("()=>{for(let k=0;k<30;k++){const bs=[...document.querySelectorAll('#statsCard button[data-k]:not([disabled])')];if(!bs.length)break;bs[Math.floor(Math.random()*bs.length)].click()}}")
        fm=await pg.evaluate("()=>!!__TG.dbg.finalsMode()")
        if fm:
          seen['finalsMatch']+=1
          if 'finals' not in shots:
            shots.add('finals');await pg.screenshot(path='finals_hub.png',full_page=True);log.append('FINALS HUB '+(await pg.inner_text('#nextCard'))[:400].replace('\n',' | '))
          await pg.evaluate("document.getElementById(Math.random()<0.5?'btnSim':'btnPlay').click()");await pg.wait_for_timeout(15);continue
        hasPick=await pg.evaluate("()=>!!document.querySelector('#nextCard [data-pick]')")
        if hasPick:
          opts=await pg.evaluate("()=>[...document.querySelectorAll('#nextCard [data-pick]')].map(b=>b.dataset.pick+(b.getAttribute('aria-pressed')==='true'?'*':''))")
          cur=[o for o in opts if o.endswith('*')][0][:-1]
          if 'pick' not in shots and 'alt' in ''.join(opts):
            shots.add('pick');await pg.screenshot(path='hub_pick.png',full_page=False)
          r=random.random()
          want='rest' if r<0.12 else ('alt' if r<0.3 and any(o.startswith('alt') for o in opts) else 'main')
          if want!=cur:
            await pg.evaluate(f"document.querySelector('#nextCard [data-pick={want}]').click()");await pg.wait_for_timeout(10)
          if want=='rest':seen['rest']+=1
          if want=='alt':seen['alt']+=1
          await pg.evaluate("document.getElementById('btnPlay').click()");await pg.wait_for_timeout(15);continue
        sim=await pg.evaluate("()=>!!document.getElementById('btnSim')")
        if sim and random.random()<0.5:
          seen['sim']+=1;await pg.evaluate("document.getElementById('btnSim').click()")
        else:
          seen['play']+=1;await pg.evaluate("document.getElementById('btnPlay').click()")
        await pg.wait_for_timeout(15)
      elif vis=='draw':
        await pg.evaluate("document.getElementById(Math.random()<0.5?'drSim':'drPlay').click()");await pg.wait_for_timeout(15)
      elif vis=='result':
        t=await pg.inner_text('#rText');st=await pg.inner_text('#rStats')
        if 'rival' in t.lower() and 'now one of your rivals' in t:seen['newrival']+=1;log.append('RIVAL '+t)
        if 'Tour Finals' in t or 'group' in t.lower():log.append('FIN '+t)
        await pg.evaluate("()=>document.getElementById('rGo').click()")
      elif vis=='season':
        t=await pg.evaluate("()=>document.getElementById('seTitle').innerText+' :: '+document.getElementById('seText').innerText")
        log.append('SEASON '+t[:330].replace('\n',' '))
        btns=await pg.query_selector_all('#seBtns button');labels=[(await x.text_content()).strip() for x in btns]
        tgt=0
        if any('Return' in l for l in labels):tgt=[j for j,l in enumerate(labels) if 'Return' in l][0] if 'season 3' in ' '.join(labels) else 0
        if any('Keep playing' in l for l in labels):tgt=[j for j,l in enumerate(labels) if l=='Retire'][0];await btns[tgt].click();log.append('RETIRED');break
        await btns[tgt].click()
      elif vis=='recruit':
        btn=await pg.query_selector('#offers button:not([disabled])');await btn.click()
      else:
        log.append('END on '+str(vis));break
    s=json.loads(await pg.evaluate("()=>localStorage.getItem('tennis-go-v2')"))
    print('\n'.join(log[-40:]))
    print('counts',seen)
    print({k:s.get(k) for k in ['stage','season','age','fat','careerW','careerL','stats','rec']})
    print('rivals',[(r.get('name') or r['id'],r.get('fid'),r['w'],r['l'],round(r['edge'],2)) for r in s['rivals']])
    print('ageMods',await pg.evaluate("()=>JSON.stringify(__TG.dbg.ageMods())"),'myRating',await pg.evaluate("()=>__TG.dbg.myRating().toFixed(2)"))
    print('errors',errs[:5])
    await b.close()
asyncio.run(main())
