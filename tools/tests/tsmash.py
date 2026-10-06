import asyncio
from playwright.async_api import async_playwright
from PIL import Image
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=await b.new_page(viewport={'width':300,'height':420})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script("window.CHAR_BASE='file:///home/claude/hartwigcam98-star/golf-go/'")
    await pg.goto('file:///home/claude/tennis-go/index.html')
    await pg.click('#btnQuick');await pg.click('.pc[data-id="ch08"]');await pg.click('#selGo')
    for i in range(60):
      if await pg.evaluate("()=>!!(window.__TG&&__TG.M&&__TG.P()[0])"):break
      await pg.wait_for_timeout(200)
    await pg.evaluate("()=>{window.__FREEZE=1;const M=__TG.M;M.state='between';M.lock=true;document.querySelector('.hud.top').style.display='none';document.querySelector('.hud.bot').style.display='none';__TG.W3.ball.visible=false;__TG.W3.bshadow.visible=false}")
    for i in range(2):
      await pg.evaluate("()=>{window.__CAM=[0,1.4,-3.5,1.4];window.__POSE={type:'sm',u:0.6}}");await pg.wait_for_timeout(800)
    d=await pg.evaluate("""()=>{const P=__TG.P()[0];P.root.updateMatrixWorld(true);const r=P.racket.children[2].getWorldPosition(new THREE.Vector3());return [r.x-P.pos.x,r.y,r.z-P.pos.z].map(v=>+v.toFixed(2))}""")
    print('racket rel (x right=+X, y, z fwd=-Z):',d)
    tiles=[]
    for cam in ([0,1.6,-4.5,1.4],[3.5,1.6,0.5,1.4],[-3,4,3,1.2]):
      for u in (0.22,0.44,0.53,0.6,0.78,1.0):
        await pg.evaluate(f"()=>{{window.__CAM={cam};window.__POSE={{type:'sm',u:{u}}}}}");await pg.wait_for_timeout(600)
        f=f'sm_{len(tiles)}.png';await pg.screenshot(path=f);tiles.append(f)
    print('errors',errs[:3])
    await b.close()
  ims=[Image.open(t).resize((150,210)) for t in tiles];sheet=Image.new('RGB',(150*6,210*3))
  for i,im in enumerate(ims):sheet.paste(im,((i%6)*150,(i//6)*210))
  sheet.save('sm.png')
asyncio.run(main())
