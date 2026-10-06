import asyncio,sys
from playwright.async_api import async_playwright
from PIL import Image
STROKE=sys.argv[1];US=[float(x) for x in sys.argv[2].split(',')];VIEWS=sys.argv[3].split(';');OUT=sys.argv[4];CH=sys.argv[5] if len(sys.argv)>5 else 'ch08'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=await b.new_page(viewport={'width':300,'height':420})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script("window.CHAR_BASE='file:///home/claude/hartwigcam98-star/golf-go/'")
    await pg.goto('file:///home/claude/tennis-go/index.html')
    await pg.click('#btnQuick');await pg.click(f'.pc[data-id="{CH}"]');await pg.click('#selGo')
    for i in range(60):
      ok=await pg.evaluate("()=>!!(window.__TG&&__TG.M&&__TG.P()[0])")
      if ok:break
      await pg.wait_for_timeout(200)
    await pg.evaluate("()=>{window.__FREEZE=1;const M=__TG.M;M.state='between';M.lock=true;document.querySelector('.hud.top').style.display='none';document.querySelector('.hud.bot').style.display='none';__TG.W3.ball.visible=false;__TG.W3.bshadow.visible=false}")
    tiles=[]
    for v in VIEWS:
      cam=[float(x) for x in v.split(',')]
      for u in US:
        await pg.evaluate(f"()=>{{window.__CAM={cam};window.__POSE={{type:'{STROKE}',u:{u}}}}}")
        await pg.wait_for_timeout(700)
        if STROKE=='sv':
          await pg.evaluate(f"()=>{{const P=__TG.P()[0];const b=__TG.W3.ball;const bp=P.tossPos({u});b.visible={1 if u>=0 else 0};b.position.copy(bp)}}")
          await pg.wait_for_timeout(150)
        f=f'{OUT}_{len(tiles)}.png';await pg.screenshot(path=f);tiles.append(f)
    print('errors',errs[:3])
    await b.close()
  ims=[Image.open(t) for t in tiles];w,h=ims[0].size;cols=len(US);rows=len(VIEWS)
  sheet=Image.new('RGB',(w*cols,h*rows))
  for i,im in enumerate(ims):sheet.paste(im,((i%cols)*w,(i//cols)*h))
  sheet.save(OUT+'.png');print(OUT+'.png',sheet.size)
asyncio.run(main())
