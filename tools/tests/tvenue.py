import asyncio,sys
from playwright.async_api import async_playwright
from PIL import Image
VEN=sys.argv[1].split(',') if len(sys.argv)>1 else ['club','college','tour','masters','major:Melbourne','major:Paris','major:London','major:New York']
W,H=(int(sys.argv[2]),int(sys.argv[3])) if len(sys.argv)>3 else (300,560)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    tiles=[]
    for v in VEN:
      pg=await b.new_page(viewport={'width':W,'height':H})
      errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
      await pg.add_init_script("window.CHAR_BASE='file:///home/claude/hartwigcam98-star/golf-go/'")
      await pg.goto('file:///home/claude/tennis-go/index.html')
      await pg.select_option('#qmVenue',v);await pg.click('#btnQuick');await pg.click('.pc[data-id="ch08"]');await pg.evaluate("document.getElementById('selGo').click()")
      for i in range(80):
        if await pg.evaluate("()=>!!(window.__TG&&__TG.M&&__TG.P()[0])"):break
        await pg.wait_for_timeout(200)
      await pg.wait_for_timeout(2500)
      info=await pg.evaluate("()=>{document.querySelector('.hud.top').style.display='none';const r=__TG.W3.r.info.render;return{tri:r.triangles,calls:r.calls,crowd:__TG.W3.crowdN}}")
      f=f'ven_{len(tiles)}.png';await pg.screenshot(path=f);tiles.append(f)
      print(v,info,errs[:3])
      await pg.close()
    await b.close()
  ims=[Image.open(t) for t in tiles];w,h=ims[0].size;cols=min(4,len(ims));rows=(len(ims)+cols-1)//cols
  sheet=Image.new('RGB',(w*cols,h*rows))
  for i,im in enumerate(ims):sheet.paste(im,((i%cols)*w,(i//cols)*h))
  sheet.save('venues.png')
asyncio.run(main())
