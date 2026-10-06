import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=await b.new_page(viewport={'width':200,'height':430})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script("(()=>{const o=performance.now.bind(performance);const t0=o();performance.now=()=>t0+(o()-t0)*0.7;const st=window.setTimeout;window.setTimeout=(f,ms,...a)=>st(f,(ms||0)/0.7,...a)})();window.CHAR_BASE='file:///home/claude/hartwigcam98-star/golf-go/'")
    await pg.goto('file:///home/claude/tennis-go/index.html')
    await pg.select_option('#qmLevel','2');await pg.click('#btnQuick');await pg.click('.pc[data-id="ch08"]');await pg.click('#selGo')
    await pg.evaluate("""()=>{window.__log=[];setInterval(()=>{const M=__TG.M;if(!M)return;const s=M.shot;const k=M.state+(s?s.who+(s.volley?'V':''):'');if(k!==window.__lk){window.__lk=k;window.__log.push([M.state,s&&s.who,s&&!!s.volley,+M.me.y.toFixed(2),+M.op.y.toFixed(2),M.home&&M.home[0].y,document.getElementById('msg').textContent.slice(0,44)])}},20)}""")
    tapped=False
    for i in range(500):
      st=await pg.evaluate("()=>{const M=__TG.M;return M&&{s:M.state,c:!!M.commit,p:M.shot?(performance.now()-M.t0)/1000/M.shot.T:0,who:M.shot&&M.shot.who,hy:M.home&&M.home[0].y}}")
      if not st: await pg.wait_for_timeout(50);continue
      if st['s']=='me' and st['who']=='me' and st['hy']<0:
        await pg.evaluate("()=>{const M=__TG.M;M.home[0]={x:0,y:0.37};M.mv[0].z=3.0;M.mv[0].x=0}")
      if False:
        # tap a spot ~3 m behind the net on my side
        await pg.evaluate("""()=>{const v=new THREE.Vector3(0,0,3).project(__TG.W3.cam);const x=(v.x+1)/2*innerWidth,y=(1-v.y)/2*innerHeight;const c=document.getElementById('gl');
          const ev=(t)=>c.dispatchEvent(new PointerEvent(t,{clientX:x,clientY:y,pointerId:1,bubbles:true,isPrimary:true}));ev('pointerdown');ev('pointerup')}""")
      if st['s']=='serveMe' or (st['s']=='op' and not st['c'] and st['p']>0.25):
        await pg.evaluate('''async()=>{const c=document.getElementById('gl');const k=innerWidth/360;const ev=(t,x,y)=>c.dispatchEvent(new PointerEvent(t,{clientX:x,clientY:y,pointerId:1,bubbles:true,isPrimary:true}));
          ev('pointerdown',100,330);await new Promise(r=>setTimeout(r,40));ev('pointermove',98,330-45*k);await new Promise(r=>setTimeout(r,40));ev('pointerup',96,330-95*k)}''')
      await pg.wait_for_timeout(20)
    for l in await pg.evaluate("()=>window.__log"):print(l)
    print('errors',errs[:3])
    await b.close()
asyncio.run(main())
