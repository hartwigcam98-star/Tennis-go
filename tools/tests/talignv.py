import asyncio
from playwright.async_api import async_playwright
from PIL import Image
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=await b.new_page(viewport={'width':300,'height':420})
    await pg.add_init_script("window.CHAR_BASE='file:///home/claude/hartwigcam98-star/golf-go/'")
    await pg.goto('file:///home/claude/tennis-go/index.html')
    await pg.click('#btnQuick');await pg.click('.pc[data-id="ch08"]');await pg.click('#selGo')
    for i in range(60):
      if await pg.evaluate("()=>!!(window.__TG&&__TG.M&&__TG.P()[0])"):break
      await pg.wait_for_timeout(200)
    await pg.evaluate("()=>{window.__FREEZE=1;const M=__TG.M;M.state='between';M.lock=true;document.querySelector('.hud.top').style.display='none';document.querySelector('.hud.bot').style.display='none'}")
    tiles=[];out=[]
    for typ,off in [('fv',[0.62,0.55]),('bv',[-0.55,0.55])]:
      for cam in ([0,1.4,-3.2,1.0],[0,4,1.2,0.6]):
        await pg.evaluate(f"()=>{{window.__CAM={cam};window.__POSE={{type:'{typ}',u:0.5}}}}");await pg.wait_for_timeout(800)
        # the game stands the player so the ball is {off[0]} m to their right and {off[1]} m in front (me: right=+X, front=-Z), at ~1.0 m
        d=await pg.evaluate(f"""()=>{{const P=__TG.P()[0],b=__TG.W3.ball;b.visible=true;b.position.set(P.pos.x+{off[0]},1.05,P.pos.z-{off[1]});
          P.root.updateMatrixWorld(true);const r=P.racket.children[2].getWorldPosition(new THREE.Vector3());return [r.x-b.position.x,r.y-b.position.y,r.z-b.position.z].map(v=>+v.toFixed(2))}}""")
        out.append((typ,d));await pg.wait_for_timeout(100)
        f=f'al_{len(tiles)}.png';await pg.screenshot(path=f);tiles.append(f)
    print(out)
    await b.close()
  ims=[Image.open(t) for t in tiles];w,h=ims[0].size;sheet=Image.new('RGB',(w*len(ims),h))
  for i,im in enumerate(ims):sheet.paste(im,(i*w,0))
  sheet.save('alignv.png')
asyncio.run(main())
