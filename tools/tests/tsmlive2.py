import asyncio
from playwright.async_api import async_playwright
from PIL import Image
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=await b.new_page(viewport={'width':240,'height':430})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script("(()=>{const o=performance.now.bind(performance);const t0=o();performance.now=()=>t0+(o()-t0)*0.2;const st=window.setTimeout;window.setTimeout=(f,ms,...a)=>st(f,(ms||0)/0.2,...a)})();window.CHAR_BASE='file:///home/claude/hartwigcam98-star/golf-go/'")
    await pg.goto('file:///home/claude/tennis-go/index.html')
    await pg.select_option('#qmLevel','5');await pg.click('#btnQuick');await pg.click('.pc[data-id="ch08"]');await pg.click('#selGo')
    for i in range(60):
      if await pg.evaluate("()=>!!(window.__TG&&__TG.M&&__TG.P()[0])"):break
      await pg.wait_for_timeout(200)
    for k in range(300):
      if await pg.evaluate("()=>__TG.M&&(__TG.M.state==='serveMe'||__TG.M.state==='oppServe')"):break
      await pg.wait_for_timeout(100)
    results=[]
    for trial in range(1):
      await pg.evaluate("""()=>{const M=__TG.M;M.lock=false;M.over=false;M.shot=null;M.state='me';M.home[0]={x:0,y:0.35};M.mv[0]={x:0,v:0,z:(0.5-0.33)*23.77,vz:0};M.mv[1]={x:0.3*4.115,v:0,z:-(0.55)*23.77,vz:0};M.me.y=0.33;M.op.y=1.05;
        const R=Math.random;Math.random=()=>0.12+0.04*%d;try{__TG.oppHit({x:0.3,y:1.05,z:0.55})}finally{Math.random=R}
        window.__mind=9;window.__trace=[];}"""%trial)
      info=await pg.evaluate("()=>{const s=__TG.M.shot;return{kind:s.kind,smash:s.smash,volley:s.volley,unreach:s.unreach,err:s.err,hz:s.hz,hy:s.hy,T:s.T,side:__TG.M.meSide}}")
      shots=[]
      for i in range(1500):
        st=await pg.evaluate("""()=>{const M=__TG.M;if(!M)return null;const P=__TG.P()[0];
          if(P.swing&&P.swing.type==='sm'){P.root.updateMatrixWorld(true);const r=P.racket.children[2].getWorldPosition(new THREE.Vector3()),b=__TG.W3.ball.position;const d=r.distanceTo(b);if(P.swing.t/0.9>0.5&&P.swing.t/0.9<0.7)window.__trace.push([+(P.swing.t/0.9).toFixed(2),'pl',+P.pos.x.toFixed(2),+P.pos.z.toFixed(2),'b',+b.x.toFixed(2),+b.y.toFixed(2),+b.z.toFixed(2),'r',+r.x.toFixed(2),+r.y.toFixed(2),+r.z.toFixed(2),'hit',+(M.shot.hx*4.115).toFixed(2),+((0.5-M.shot.hy)*23.77).toFixed(2),M.shot.who]);if(d<window.__mind){window.__mind=d;window.__at=[+(r.x-b.x).toFixed(2),+(r.y-b.y).toFixed(2),+(r.z-b.z).toFixed(2),+(P.swing.t/0.9).toFixed(2)]}}
          if(M.state==='op'&&M.shot.smash)window.__last=[+P.pos.x.toFixed(2),+P.pos.z.toFixed(2),'want',+(M.shot.hx*4.115-0.31).toFixed(2),+((0.5-M.shot.hy)*23.77+0.29).toFixed(2),'p',+((performance.now()-M.t0)/1000/M.shot.T).toFixed(2)];return{s:M.state,c:!!M.commit,who:M.shot&&M.shot.who,p:M.shot?(performance.now()-M.t0)/1000/M.shot.T:0,msg:document.getElementById('msg').textContent,u:P.swing?P.swing.t/0.9:-1,ty:P.swing&&P.swing.type}}""")
        if not st or st['s']!='op':break
        if not st['c'] and st['p']>0.3:
          await pg.evaluate('''async()=>{const c=document.getElementById('gl');const k=innerWidth/360;const ev=(t,x,y)=>c.dispatchEvent(new PointerEvent(t,{clientX:x,clientY:y,pointerId:1,bubbles:true,isPrimary:true}));
            ev('pointerdown',120,330);await new Promise(r=>setTimeout(r,30));ev('pointermove',125,330-60*k);await new Promise(r=>setTimeout(r,30));ev('pointerup',130,330-120*k)}''')
        if trial==0 and st['ty']=='sm' and len(shots)<6 and st['u']>0.15*(len(shots)+1):
          f=f'sml_{len(shots)}.png';await pg.screenshot(path=f);shots.append(f)
        await pg.wait_for_timeout(15)
      await pg.wait_for_timeout(300)
      res=await pg.evaluate("()=>({last:window.__last,mind:window.__mind,at:window.__at,msg:document.getElementById('msg').textContent,state:__TG.M&&__TG.M.state,land:__TG.M&&__TG.M.land})")
      print(trial,info,res)
      if shots:
        ims=[Image.open(t) for t in shots];w,h=ims[0].size;sh=Image.new('RGB',(w*len(ims),h))
        for k,im in enumerate(ims):sh.paste(im,(k*w,0))
        sh.save('smlive.png')
      for k in range(80):
        if await pg.evaluate("()=>__TG.M&&(__TG.M.state==='serveMe'||__TG.M.state==='oppServe')"):break
        await pg.wait_for_timeout(100)
      await pg.wait_for_timeout(500)
    print('errors',errs[:3])
    await b.close()
asyncio.run(main())
