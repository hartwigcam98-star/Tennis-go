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
      vis=await pg.evaluate("()=>['hub','result','season','recruit','title','draw'].find(s=>!document.getElementById(s).hidden)")
      if vis=='hub':
        t=await pg.evaluate("()=>document.getElementById('nextCard').innerText.split('\\n').slice(0,2).join(' | ')+' || '+document.getElementById('playerCard').innerText.replace(/\\n/g,' ')")
        k=t[:70]
        if k not in seen and len(log)<400 and 'pro' in t.lower(): seen.add(k);log.append('HUB '+t[:200])
        note=await pg.evaluate("()=>{const n=document.querySelector('#nextCard .note');return n?n.innerText:''}")
        if False and note: seen.add('NOTE'+note[:60]);log.append('   note: '+note[:140])
        await pg.evaluate("()=>document.getElementById('btnPlay').click()");await pg.wait_for_timeout(15)
      elif vis=='draw':
        ttl=await pg.evaluate("()=>document.getElementById('drTitle').textContent")
        if 'Major' in ttl and 'shot' not in seen:
          seen.add('shot');await pg.set_viewport_size({'width':390,'height':844});await pg.wait_for_timeout(200)
          await pg.screenshot(path='draw_major.png',full_page=True);log.append('DRAW SHOT '+ttl)
        await pg.evaluate("()=>document.getElementById('drPlay').click()");await pg.wait_for_timeout(15)
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
      if st and 'pro s2' in st and await pg.evaluate("()=>JSON.parse(localStorage.getItem('tennis-go-v2')).week>=4"): log.append('stop at '+st);break
    chk=await pg.evaluate('''()=>{const s=JSON.parse(localStorage.getItem('tennis-go-v2'));const L=s.lastDraw;if(!L)return 'no lastDraw';const D=L.D;let ok=true,why='';
      for(let k=0;k<D.R;k++){const E=k===0?D.slots:D.res[k-1].map(m=>m.w);if(!D.res[k]||D.res[k].length!==E.length/2){ok=false;why='round '+k+' incomplete';break}
        D.res[k].forEach((m,i)=>{if(m.a!==E[2*i]||m.b!==E[2*i+1]||(m.w!==m.a&&m.w!==m.b)){ok=false;why='bad link r'+k}})}
      const path=D.res.map((r,k)=>{const m=r.find(x=>x.a==='me'||x.b==='me');return m?((m.w==='me'?'W ':'L ')+D.players[m.a==='me'?m.b:m.a].name+' '+m.score):'-'});
      const champ=D.players[D.res[D.R-1][0].w].name;return {title:L.t,size:D.size,ok,why,champ,path,seeds:Object.entries(D.seeds).slice(0,4).map(([id,n])=>n+':'+D.players[id].name+' '+D.players[id].skill),pool:Object.keys(s.pool||{})}}''')
    print('LAST DRAW CHECK',chk)
    await pg.set_viewport_size({'width':390,'height':844})
    if await pg.evaluate("()=>!document.getElementById('result').hidden"):await pg.evaluate("document.getElementById('rGo').click()");await pg.wait_for_timeout(300)
    vis=await pg.evaluate("()=>['hub','result','season','recruit','title','draw'].find(s=>!document.getElementById(s).hidden)");print('now on',vis)
    if vis=='hub':
      await pg.evaluate("document.getElementById('btnRank').click()");await pg.wait_for_timeout(300);await pg.screenshot(path='rankings.png',full_page=True)
      print('RANK SUB',await pg.text_content('#rkSub'))
      await pg.evaluate("document.getElementById('rkBack').click()");await pg.wait_for_timeout(200)
      await pg.evaluate("document.getElementById('btnPlay').click()");await pg.wait_for_timeout(500)
      await pg.screenshot(path='draw_ranked.png');print('DRAW SUB',await pg.text_content('#drSub'))
      chk2=await pg.evaluate('''()=>{const s=JSON.parse(localStorage.getItem('tennis-go-v2'));const D=s.cur.draw;return {seeds:Object.entries(D.seeds).map(([id,n])=>n+':'+D.players[id].name),meSeed:D.seeds.me||null,size:D.size,ev:D.ev}}''');print('NEW DRAW',chk2)
    print('\n'.join(log[-12:]));print('errors',errs[:5])
    s=await pg.evaluate("()=>localStorage.getItem('tennis-go-v2')")
    import json;d=json.loads(s);print({k:d[k] for k in ['stage','season','age','money','earnings','sponsors','rec','majors','careerW','careerL','stats','xp']})
    await b.close()
asyncio.run(main())
