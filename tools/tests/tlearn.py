import asyncio,random,time
from playwright.async_api import async_playwright
SL=0.3
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=await b.new_page(viewport={'width':300,'height':560})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script("(()=>{const o=performance.now.bind(performance);const t0=o();performance.now=()=>t0+(o()-t0)*%s})();window.CHAR_BASE='file:///home/claude/hartwigcam98-star/golf-go/'"%SL)
    await pg.goto('file:///home/claude/tennis-go/index.html')
    print('title first card:',await pg.evaluate("document.querySelector('#title .card').id"),'|',await pg.text_content('#btnLearn'))
    await pg.click('#btnLearn');await pg.wait_for_timeout(300)
    await pg.screenshot(path='/tmp/claude-0/-home-claude/c059be0d-034d-5550-9882-6f1de26df84e/scratchpad/learn_screen.png',full_page=True)
    await pg.evaluate("document.querySelector('#lessons button[data-l=\"0\"]').click()")
    async def swipe(dx,dy,steps=2,wait=130):
      x0,y0=150,470
      await pg.evaluate(f"document.getElementById('gl').dispatchEvent(new PointerEvent('pointerdown',{{clientX:{x0},clientY:{y0},pointerId:1,bubbles:true,isPrimary:true}}))")
      for k in range(1,steps+1):
        await pg.wait_for_timeout(wait)
        t='pointermove' if k<steps else 'pointerup'
        await pg.evaluate(f"document.getElementById('gl').dispatchEvent(new PointerEvent('{t}',{{clientX:{x0+dx*k/steps},clientY:{y0+dy*k/steps},pointerId:1,bubbles:true,isPrimary:true}}))")
    async def tap(wx,wz):
      await pg.evaluate(f"(()=>{{const v=new THREE.Vector3({wx},0,{wz}).project(__TG.W3.cam);const x=(v.x+1)/2*innerWidth,y=(1-v.y)/2*innerHeight,c=document.getElementById('gl');const ev=t=>c.dispatchEvent(new PointerEvent(t,{{clientX:x,clientY:y,pointerId:1,bubbles:true,isPrimary:true}}));ev('pointerdown');ev('pointerup')}})()")
    k=300/360
    for li in range(9):
      t0=time.time();lid=None;swipes=0;tapped=False
      while time.time()-t0<900:
        s=await pg.evaluate("()=>{const M=__TG.M;if(!M)return {gone:1};const D=M.drill;return{id:D&&D.L.id,cnt:D&&D.count,done:!document.getElementById('dDone').hidden,st:M.state,c:!!M.commit,tc:M.shot?(M.t0+0.9*M.shot.T*1000-__TG.dbg.GT)/1000:9,z:D&&D.zone,msg:document.getElementById('msg').textContent}}")
        if s.get('gone'):await pg.wait_for_timeout(300);continue
        lid=s['id']
        if s['done']:break
        if lid=='net' and s['st'] in('between','op') and not tapped:
          await tap(0,3.2);tapped=True
        if s['st']=='serveMe':
          need=await pg.evaluate("()=>{const t=(__TG.M.drill.types)||{};return ['flat','slice','kick'].find(x=>!t[x])||'kick'}")
          await pg.evaluate(f"document.querySelector('#svType button[data-t=\"{need}\"]').click()")
          await swipe(-8*k,-90*k);swipes+=1;await pg.wait_for_timeout(600);continue
        if s['st']=='op' and not s['c']:
          tc=s['tc']
          if lid=='timing':
            if 0.18<tc<0.36:
              await swipe(random.uniform(-15,15)*k,-80*k,1,10);swipes+=1   # one quick move: release lands inside the glow
            await pg.wait_for_timeout(20);continue
          if tc<1.2*SL+0.5:
            if lid=='aim':dx=-55 if s['z']=='left' else 55;await swipe(dx*k,-100*k)
            elif lid=='depth':await swipe(random.uniform(-10,10)*k,-150*k)
            elif lid=='slice':
              x0,y0=150,470
              pts=[(x0+28*k,y0-35*k),(x0+38*k,y0-70*k),(x0+22*k,y0-105*k),(x0,y0-130*k)]
              await pg.evaluate(f"document.getElementById('gl').dispatchEvent(new PointerEvent('pointerdown',{{clientX:{x0},clientY:{y0},pointerId:1,bubbles:true,isPrimary:true}}))")
              for j,(px,py) in enumerate(pts):
                await pg.wait_for_timeout(130)
                t='pointermove' if j<len(pts)-1 else 'pointerup'
                await pg.evaluate(f"document.getElementById('gl').dispatchEvent(new PointerEvent('{t}',{{clientX:{px},clientY:{py},pointerId:1,bubbles:true,isPrimary:true}}))")
            elif lid=='pace':await swipe(random.uniform(-6,6)*k,-75*k,2,130)
            else:await swipe(random.uniform(-15,15)*k,-95*k)
            swipes+=1
        await pg.wait_for_timeout(60)
      print(f'lesson {li+1} {lid}: done={s.get("done")} swipes={swipes} time={time.time()-t0:.0f}s last="{s.get("msg","")[:60]}"')
      if not s.get('done'):break
      if li==8:
        await pg.screenshot(path='/tmp/claude-0/-home-claude/c059be0d-034d-5550-9882-6f1de26df84e/scratchpad/learn_done.png')
        break
      await pg.evaluate("document.getElementById('dNext').click()");await pg.wait_for_timeout(2500)
      if li==1:await pg.screenshot(path='/tmp/claude-0/-home-claude/c059be0d-034d-5550-9882-6f1de26df84e/scratchpad/learn_lesson.png')
    print('learn state',await pg.evaluate("localStorage.getItem('tennis-go-learn')"))
    print('errors',errs[:3])
    await b.close()
asyncio.run(main())
