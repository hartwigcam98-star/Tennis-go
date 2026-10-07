"""Assemble the single-file game: python3 tools/build.py  ->  index.html"""
import json,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));S=os.path.join(R,'src')
rd=lambda *p:open(os.path.join(S,*p),encoding='utf-8').read()
mc=json.loads(rd('assets','mclips.json'))
au=rd('audio.js');dsp=au[au.index('/*DSP{*/'):au.index('/*}DSP*/')];au=au.replace('/*@DSPSRC*/','const DSP_SRC='+json.dumps(dsp)+';')
game=rd('game.js').replace('/*@VENUE*/',rd('venue.js')).replace('/*@AUDIO*/',au).replace('/*@FX*/',rd('fx.js')).replace('/*@LEARN*/',rd('learn.js')).replace('/*@PROGRESS*/',rd('progress.js')).replace('/*@TUNE*/',rd('tune.js')).replace('/*@DRAW*/',rd('draw.js')).replace('/*@SESSION*/',rd('session.js')).replace('/*@CAREER*/',rd('career.js')).replace('/*@STATS*/',rd('stats.js')).replace('/*@MOMENTS*/',rd('moments.js')).replace('/*@SEASON*/',rd('season.js')).replace('/*@HAWK*/',rd('hawk.js'))
out=rd('head.html')+rd('body.html')
out+='<script>'+rd('vendor','three.js')+'</script>\n'
out+='<script>'+rd('assets','boss.js')+'\nwindow.MCLIPS='+json.dumps(mc,separators=(',',':'))+';</script>\n'
out+='<script>'+game+'</script>\n</body>\n</html>\n'
open(os.path.join(R,'index.html'),'w',encoding='utf-8').write(out)
print('index.html',round(len(out)/1e6,2),'MB')
