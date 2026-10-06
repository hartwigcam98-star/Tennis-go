import asyncio,json
from playwright.async_api import async_playwright
from PIL import Image
S='/tmp/claude-0/-home-claude/c059be0d-034d-5550-9882-6f1de26df84e/scratchpad/'
VS=[None,{'h':140,'t':200,'a':0.5,'l':1.0},{'h':260,'t':20,'a':0.45,'l':0.92},{'h':40,'t':300,'a':0.55,'l':1.1}]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=await b.new_page(viewport={'width':220,'height':330});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('file:///home/claude/tennis-go/index.html')
    tiles=[]
    for ch in ['ch08','ch31','brute']:
      for v in VS:
        cfg={'surf':'hard','bo':1,'g':6,'stats':{'power':5,'control':5,'speed':5,'serve':5,'stamina':5},'meId':ch,'meV':v,'me':'X','opp':{'id':'ch12','name':'Y','skill':5},'label':'t','venue':'club','style':None,'perks':0}
        await pg.evaluate("c=>{c.onEnd=()=>{};window.__FREEZE=1;__TG.dbg.startMatch(c)}",cfg)
        for i in range(60):
          if await pg.evaluate("()=>!!(__TG.M&&__TG.P()[0]&&document.getElementById('loading').hidden)"):break
          await pg.wait_for_timeout(200)
        await pg.evaluate("()=>{const M=__TG.M;M.state='between';M.lock=true;document.querySelector('.hud.top').style.display='none';document.querySelector('.hud.bot').style.display='none';window.__CAM=[0,1.3,-2.9,1.0];window.__POSE={type:'fh',u:0}}")
        await pg.wait_for_timeout(2500)
        f=S+f'var_{len(tiles)}.png';await pg.screenshot(path=f);tiles.append(f)
        await pg.evaluate("()=>{window.__POSE=null;window.__CAM=null;window.__FREEZE=0;const M=__TG.M;if(M){M.over=true;M.winner=0;M.retired=true;__TG.dbg.endMatch()}}");await pg.wait_for_timeout(300)
    print('errors',errs[:3]);await b.close()
  ims=[Image.open(t).crop((30,20,190,300)) for t in tiles];w,h=ims[0].size;sh=Image.new('RGB',(w*4,h*3))
  for i,im in enumerate(ims):sh.paste(im,((i%4)*w,(i//4)*h))
  sh.save(S+'variants.png')
asyncio.run(main())
