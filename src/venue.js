/* ================= venues: club courts, college bleachers, tour stadiums, the four major arenas ================= */
const SPONSOR_BOARDS=['NORTHSTAR STRINGS','BASELINE APPAREL','TENNIS GO','ACE SPORTSWEAR','GRAND SLAM WATCHES','HOMETOWN PIZZA'];
const SCHOOL={lakeshore:{name:'LAKESHORE',c:0x1D2F5E,a:0xE2B53B},northstar:{name:'NORTH STAR STATE',c:0x6E1E2E,a:0xF2EFE6},driftless:{name:'DRIFTLESS',c:0x2E5B3A,a:0xD8C49A}};
const MAJOR_LOOK={
  Melbourne:{surf:'hard',court:0x2E6FC4,out:0x1C3C86,wall:0x142C5C,seat:0x2B4E92,seat2:0x3A64AE,acc:0x37B6E8,sky:0xA9D6F2,title:'MELBOURNE'},
  Paris:{surf:'clay',court:0xC65A2E,out:0xBC5428,wall:0x1D452B,seat:0x2F6440,seat2:0x3B7550,acc:0xE6893A,sky:0xA7CBE6,title:'PARIS'},
  London:{surf:'grass',court:0x5F9B3A,out:0x4E8A32,wall:0x1B3D29,seat:0x2B5A39,seat2:0x356B45,acc:0x5B2A86,sky:0xBCC8D2,title:'LONDON'},
  'New York':{surf:'hard',court:0x2F62B0,out:0x3B7C58,wall:0x111F3A,seat:0x22407A,seat2:0x2F5294,acc:0xF2B134,sky:0x0A1430,title:'NEW YORK',night:true}
};
const SURF_LOOK={hard:{court:0x2F6FB0,out:0x3E7A4B,wall:0x1C3A5E,seat:0x2B4C7E,seat2:0x365A8F,acc:0x8FC8F0},
  clay:{court:0xC9643A,out:0xB65A33,wall:0x24402B,seat:0x3B5F45,seat2:0x46705A,acc:0xE6A060},
  grass:{court:0x5E9A3A,out:0x4F8A33,wall:0x1E3B2A,seat:0x305C3D,seat2:0x3A6C48,acc:0xCFE3A0}};
/* pick the venue for a match: an explicit quick-match choice, or from the career event */
function venueFor(cfg){const V0=venueFor0(cfg);if(cfg.night!=null&&(V0.kind==='tour'||V0.kind==='major')){V0.night=!!cfg.night;if(V0.night)V0.sky=0x0A1430;else if(V0.sky===0x0A1430)delete V0.sky}return V0}
function venueFor0(cfg){
  const surf=cfg.surf,ev=cfg.ev||{},tier=ev.tier||'',v=cfg.venue||'';
  const L=Object.assign({},SURF_LOOK[surf]);
  const short=(ev.n||'').replace(/ (Major|Masters|500|250|Open|Classic|Invitational|Championships?|Regional|Sectionals)$/,'').replace(/^(Challenger|Futures) /,'').toUpperCase();
  let kind;
  if(v.startsWith('major:')||ev.major){const mk=v.startsWith('major:')?v.slice(6):ev.major;return Object.assign({kind:'major',fill:0.92,rows:20,brk:10,major:mk,events:true},MAJOR_LOOK[mk])}
  if(tier==='Junior major')return Object.assign({kind:'major',fill:0.5,rows:20,brk:10,major:'London',events:true},MAJOR_LOOK.London,{surf,title:'JUNIOR CHAMPIONSHIPS'});
  if(v)kind=v;
  else if(cfg.stage==='college'&&tier!=='Futures')kind='college';
  else if(['Local','Sectional','Regional','Futures'].includes(tier))kind='club';
  else if(['National','International','Challenger'].includes(tier))kind='college';
  else if(tier==='Masters'||tier==='Finals')kind='masters';
  else if(tier)kind='tour';
  else kind='tour';
  if(kind==='club')return Object.assign(L,{kind,fill:0.5,surf,wind:0x1F4433});
  if(kind==='college'){const sc=cfg.stage==='college'?SCHOOL[cfg.college]:null;
    return Object.assign(L,{kind,surf,fill:cfg.stage==='college'?0.55:0.35,wind:sc?sc.c:0x23415F,windText:sc?sc.name:(short||'TENNIS GO'),acc:sc?sc.a:0xF2EFE6})}
  return Object.assign(L,{kind:'tour',surf,fill:kind==='masters'?0.8:0.62,rows:kind==='masters'?16:12,title:short||'TENNIS GO',events:true})
}
function canvasTex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;
  t.anisotropy=Math.min(8,W3.r.capabilities.getMaxAnisotropy());if(rep){t.wrapS=T.RepeatWrapping}return t}
const hex=c=>'#'+c.toString(16).padStart(6,'0');
const shade=(c,f)=>{const r=(c>>16)&255,g=(c>>8)&255,b=c&255,k=v=>Math.max(0,Math.min(255,Math.round(v*f)));return(k(r)<<16)|(k(g)<<8)|k(b)};
/* the playing surface and its surround as one painted texture: grain, mowing stripes or brushed clay, and wear where players stand */
function surfaceTex(V,W,D){
  return canvasTex(512,1024,(g,w,h)=>{const sx=w/W,sz=h/D,cx=w/2,cz=h/2;
    g.fillStyle=hex(V.out);g.fillRect(0,0,w,h);
    const cw=10.97*sx,ch=CL*sz;
    g.fillStyle=hex(V.court);
    if(V.surf==='grass')g.fillRect(0,0,w,h);else g.fillRect(cx-cw/2-0.5*sx,cz-ch/2-0.5*sz,cw+sx,ch+sz);
    // grain
    const id=g.getImageData(0,0,w,h),d=id.data;
    for(let i=0;i<d.length;i+=4){const n=(Math.random()-0.5)*(V.surf==='hard'?14:V.surf==='clay'?22:18);d[i]+=n;d[i+1]+=n;d[i+2]+=n}
    g.putImageData(id,0,0);
    if(V.surf==='grass'){for(let i=0;i<26;i++){g.fillStyle=i%2?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)';g.fillRect(0,i*h/26,w,h/26)}}
    if(V.surf==='clay'){g.globalAlpha=0.08;for(let i=0;i<220;i++){g.fillStyle=Math.random()<0.5?'#fff':'#5a2410';g.fillRect(Math.random()*w,Math.random()*h,w*0.2+Math.random()*w*0.4,1)}g.globalAlpha=1}
    // wear behind the baselines and at the service T
    const wear=(x,z,rx,rz,a)=>{const gr=g.createRadialGradient(0,0,0,0,0,1);const col=V.surf==='grass'?'164,140,86':V.surf==='clay'?'236,170,120':'255,255,255';
      gr.addColorStop(0,'rgba('+col+','+a+')');gr.addColorStop(1,'rgba('+col+',0)');g.save();g.translate(cx+x*sx,cz+z*sz);g.scale(rx*sx,rz*sz);g.fillStyle=gr;g.beginPath();g.arc(0,0,1,0,7);g.fill();g.restore()};
    const wa=V.surf==='grass'?0.85:V.surf==='clay'?0.35:0.08;
    for(const s of[-1,1]){wear(0,s*(CL/2+0.6),3.2,1.6,wa);wear(0,s*(CL/2+0.2),1.6,0.9,wa*0.8);wear(0,s*6.4,1.0,1.4,wa*0.45);wear(-2.2,s*(CL/2+0.8),1.2,0.9,wa*0.5);wear(2.2,s*(CL/2+0.8),1.2,0.9,wa*0.5)}
  })
}
/* stepped grandstand swept along a path (straights and rounded corners): rows of seats, aisles, an optional upper-tier fascia */
function bowlPath(xS,zF,rc,zNear){const P=[],add=(x,z,nx,nz)=>P.push({x,z,nx,nz});
  const line=(x0,z0,x1,z1,nx,nz)=>{const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,z1-z0)/2));for(let i=0;i<n;i++)add(x0+(x1-x0)*i/n,z0+(z1-z0)*i/n,nx,nz)};
  const arc=(cx,cz,a0,a1)=>{for(let i=0;i<10;i++){const a=a0+(a1-a0)*i/10;add(cx+rc*Math.cos(a),cz+rc*Math.sin(a),Math.cos(a),Math.sin(a))}};
  line(-xS,zNear,-xS,-zF+rc,-1,0);arc(-xS+rc,-zF+rc,Math.PI,1.5*Math.PI);line(-xS+rc,-zF,xS-rc,-zF,0,-1);arc(xS-rc,-zF+rc,1.5*Math.PI,2*Math.PI);line(xS,-zF+rc,xS,zNear,1,0);add(xS,zNear,1,0);
  let s=0;P[0].s=0;for(let k=1;k<P.length;k++){s+=Math.hypot(P[k].x-P[k-1].x,P[k].z-P[k-1].z);P[k].s=s}return P}
function buildBowl(G,V,P,o){
  const {rows,rise,tread,y0,brk,gap}=o,pos=[],col=[],seats=[];
  const top=i=>y0+(i+1)*rise+(brk&&i>=brk?gap:0);
  const conc=new T.Color(0x8D939B),riser=new T.Color(0x6F757E),acc=new T.Color(V.acc),cA=new T.Color(V.seat),cB=new T.Color(V.seat2),tmp=new T.Color();
  const quad=(a,b,c,d,cl)=>{pos.push(...a,...b,...c,...a,...c,...d);for(let k=0;k<6;k++)col.push(cl.r,cl.g,cl.b)};
  const at=(p,off,y)=>[p.x+p.nx*off,y,p.z+p.nz*off];
  const aisle=s=>((s+3)%11)<1.1;
  for(let i=0;i<rows;i++){const o0=i*tread+(brk&&i>=brk?0.6:0),o1=o0+tread,yt=top(i),yb=i?top(i-1):y0;
    for(let k=0;k<P.length-1;k++){const a=P[k],b=P[k+1],sm=(a.s+b.s)/2,ai=aisle(sm);
      const sec=Math.floor(sm/11)%2;tmp.copy(ai?conc:(sec?cA:cB));if(!ai)tmp.offsetHSL(0,0,(i%2)*0.02);
      quad(at(a,o0,yt),at(b,o0,yt),at(b,o1,yt),at(a,o1,yt),tmp);
      quad(at(a,o0,yb),at(b,o0,yb),at(b,o0,yt),at(a,o0,yt),brk&&i===brk?acc:riser)}
    // seats along this row, skipping aisles
    const off=o0+tread*0.42;
    for(let k=0;k<P.length-1;k++){const a=P[k],b=P[k+1],ax=a.x+a.nx*off,az=a.z+a.nz*off,bx=b.x+b.nx*off,bz=b.z+b.nz*off,L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.round(L/0.56));
      for(let j=0;j<n;j++){const t=(j+0.5)/n,s=a.s+(b.s-a.s)*t;if(aisle(s))continue;const nx=a.nx+(b.nx-a.nx)*t,nz=a.nz+(b.nz-a.nz)*t;
        seats.push({x:ax+(bx-ax)*t,y:yt,z:az+(bz-az)*t,yaw:Math.atan2(-nx,-nz),row:i})}}}
  // back wall above the last row
  const oR=rows*tread+(brk?0.6:0),yR=top(rows-1);
  for(let k=0;k<P.length-1;k++)quad(at(P[k],oR,yR),at(P[k+1],oR,yR),at(P[k+1],oR,yR+1.6),at(P[k],oR,yR+1.6),V.night?acc:riser);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.computeVertexNormals();
  const m=new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}));G.add(m);
  if(V.night){// a ring of light along the rim
    const lp=[];for(let k=0;k<P.length-1;k+=2){const p=P[k];lp.push(...at(p,oR-0.1,yR+1.9))}
    const lg=new T.BufferGeometry();lg.setAttribute('position',new T.Float32BufferAttribute(lp,3));
    G.add(new T.Points(lg,new T.PointsMaterial({color:0xFFF6DA,size:1.6,sizeAttenuation:true,transparent:true,opacity:0.95,depthWrite:false})))}
  return{seats,oR,yR};
}
/* courtside wall with sponsor boards, following the bowl path */
function boardWall(G,V,P,h,off){
  const tex=canvasTex(2048,128,(g,w,hh)=>{g.fillStyle=hex(V.wall);g.fillRect(0,0,w,hh);const names=SPONSOR_BOARDS.slice(0,4);
    g.font='800 74px "Saira Condensed","Arial Narrow",sans-serif';g.textAlign='center';g.textBaseline='middle';
    names.forEach((n,i)=>{let fs=74;g.font='800 '+fs+'px "Saira Condensed","Arial Narrow",sans-serif';while(g.measureText(n).width>w/4*0.82&&fs>20){fs-=4;g.font='800 '+fs+'px "Saira Condensed","Arial Narrow",sans-serif'}
      g.fillStyle=i%2?hex(V.acc):'#F4F1E6';g.fillText(n,(i+0.5)*w/4,hh*0.55);g.fillStyle='rgba(255,255,255,0.12)';g.fillRect((i+1)*w/4-2,8,4,hh-16)})},true);
  const pos=[],uv=[];const at=(p,y)=>[p.x+p.nx*off,y,p.z+p.nz*off];
  for(let k=0;k<P.length-1;k++){const a=P[k],b=P[k+1],u0=a.s/32,u1=b.s/32;if(a.nz<-0.9&&Math.abs((a.x+b.x)/2)<8.6)continue;pos.push(...at(a,0),...at(b,0),...at(b,h),...at(a,0),...at(b,h),...at(a,h));uv.push(u0,0,u1,0,u1,1,u0,0,u1,1,u0,1)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();
  G.add(new T.Mesh(g,new T.MeshLambertMaterial({map:tex,side:T.DoubleSide})))
}
function textPlane(G,txt,w,h,col,bg,x,y,z,ry,font){
  const tex=canvasTex(1024,Math.round(1024*h/w),(g,cw,ch)=>{if(bg!=null){g.fillStyle=hex(bg);g.fillRect(0,0,cw,ch)}g.fillStyle=hex(col);g.textAlign='center';g.textBaseline='middle';
    let fs=ch*0.78;g.font='800 '+fs+'px "Saira Condensed","Arial Narrow",sans-serif';while(g.measureText(txt).width>cw*0.94&&fs>10){fs*=0.92;g.font='800 '+fs+'px "Saira Condensed","Arial Narrow",sans-serif'}g.fillText(txt,cw/2,ch*0.55)});
  const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,transparent:bg==null,depthWrite:bg!=null}));m.position.set(x,y,z);m.rotation.y=ry||0;G.add(m);return m}
/* chain-link fence with a windscreen along the bottom, around a rectangle */
function fenceRect(G,V,xS,zF,h,wh,text){
  const link=canvasTex(64,64,(g,w,hh)=>{g.strokeStyle='rgba(60,66,70,0.9)';g.lineWidth=3;g.beginPath();g.moveTo(0,0);g.lineTo(w,hh);g.moveTo(w,0);g.lineTo(0,hh);g.stroke()});
  link.wrapS=link.wrapT=T.RepeatWrapping;
  const wind=canvasTex(1024,96,(g,w,hh)=>{g.fillStyle=hex(V.wind);g.fillRect(0,0,w,hh);if(text){g.fillStyle=hex(V.acc||0xF2EFE6);g.font='800 64px "Saira Condensed","Arial Narrow",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,w*0.25,hh*0.55);g.fillText(text,w*0.75,hh*0.55)}},true);
  const post=new T.MeshLambertMaterial({color:0x2C3A33});
  const side=(L,x,z,ry)=>{const lt=link.clone();lt.needsUpdate=true;lt.repeat.set(L/0.12,(h-wh)/0.12);
    const f=new T.Mesh(new T.PlaneGeometry(L,h-wh),new T.MeshBasicMaterial({map:lt,transparent:true,depthWrite:false,side:T.DoubleSide}));f.position.set(x,wh+(h-wh)/2,z);f.rotation.y=ry;G.add(f);
    const wt=wind.clone();wt.needsUpdate=true;wt.repeat.set(Math.max(1,Math.round(L/14)),1);
    const w=new T.Mesh(new T.PlaneGeometry(L,wh),new T.MeshLambertMaterial({map:wt,side:T.DoubleSide}));w.position.set(x,wh/2,z);w.rotation.y=ry;G.add(w);
    const n=Math.round(L/3);for(let i=0;i<=n;i++){const t=-L/2+i*L/n,p=new T.Mesh(new T.CylinderGeometry(0.04,0.04,h,6),post);
      if(Math.abs(ry)<0.1||Math.abs(ry-Math.PI)<0.1)p.position.set(x+t,h/2,z);else p.position.set(x,h/2,z+t);G.add(p)}};
  side(2*xS,0,-zF,0);side(2*xS,0,zF,Math.PI);side(2*zF,-xS,0,Math.PI/2);side(2*zF,xS,0,-Math.PI/2);
}
/* aluminium bleachers; returns seat spots */
function bleacher(G,x,z,len,rows,ry,seats){
  const al=new T.MeshLambertMaterial({color:0xB9C0C8}),fr=new T.MeshLambertMaterial({color:0x7D858E}),grp=new T.Group();
  for(let i=0;i<rows;i++){const y=0.45+i*0.42,d=-i*0.78;
    const s=new T.Mesh(new T.BoxGeometry(len,0.05,0.3),al);s.position.set(0,y,d);grp.add(s);
    const f=new T.Mesh(new T.BoxGeometry(len,0.04,0.28),fr);f.position.set(0,y-0.38,d+0.36);grp.add(f);
    for(let j=0;j<Math.floor(len/0.56);j++)seats.push({lx:-len/2+0.28+j*0.56,y:y+0.025,lz:d+0.05,row:i})}
  for(const sx of[-1,1]){const b=new T.Mesh(new T.BoxGeometry(0.08,0.45+rows*0.42,0.08),fr);b.position.set(sx*len/2,(0.45+rows*0.42)/2,-(rows-1)*0.78);grp.add(b);
    const r=new T.Mesh(new T.BoxGeometry(0.06,0.06,rows*0.8),fr);r.position.set(sx*len/2,0.45+rows*0.21,-(rows-1)*0.39);r.rotation.x=-Math.atan2(0.42,0.78);grp.add(r)}
  grp.position.set(x,0,z);grp.rotation.y=ry;G.add(grp);
  const c=Math.cos(ry),s=Math.sin(ry);
  return seats.splice(0).map(p=>({x:x+p.lx*c+p.lz*s,y:p.y,z:z-p.lx*s+p.lz*c,yaw:ry,row:p.row}))
}
function trees(G,pts){const n=pts.length;if(!n)return;
  const fol=new T.InstancedMesh(new T.ConeGeometry(1.7,4.2,7),new T.MeshLambertMaterial({color:0xffffff}),n*2),tr=new T.InstancedMesh(new T.CylinderGeometry(0.16,0.22,1.6,6),new T.MeshLambertMaterial({color:0x5A4330}),n);
  const m=new T.Matrix4(),q=new T.Quaternion(),sc=new T.Vector3(),p=new T.Vector3();
  pts.forEach(([x,z],i)=>{const s=0.8+Math.random()*0.6;sc.set(s,s,s);p.set(x,0.8*s,z);m.compose(p,q,sc);tr.setMatrixAt(i,m);
    p.set(x,(1.6+2.1)*s,z);m.compose(p,q,sc);fol.setMatrixAt(i*2,m);sc.multiplyScalar(0.75);p.set(x,(1.6+3.6)*s,z);m.compose(p,q,sc);fol.setMatrixAt(i*2+1,m);
    const c=new T.Color(0x2F5B30).offsetHSL(rnd(-0.03,0.03),0,rnd(-0.05,0.05));fol.setColorAt(i*2,c);fol.setColorAt(i*2+1,c)});
  G.add(fol);G.add(tr)}
function lightPole(G,x,z,h){const m=new T.MeshLambertMaterial({color:0x6E767E});const p=new T.Mesh(new T.CylinderGeometry(0.1,0.14,h,8),m);p.position.set(x,h/2,z);G.add(p);
  const hd=new T.Mesh(new T.BoxGeometry(1.4,0.5,0.3),new T.MeshLambertMaterial({color:0xDDE3E8,emissive:0x333333}));hd.position.set(x,h,z);hd.lookAt(0,0,0);G.add(hd)}
function neighbourCourt(G,V,x,z){const tex=canvasTex(256,512,(g,w,h)=>{g.fillStyle=hex(V.out);g.fillRect(0,0,w,h);const sx=w/18.3,sz=h/36.6;g.fillStyle=hex(V.court);g.fillRect(w/2-5.485*sx,h/2-CL/2*sz,10.97*sx,CL*sz);
  g.strokeStyle='#F4F3EE';g.lineWidth=2;g.strokeRect(w/2-5.485*sx,h/2-CL/2*sz,10.97*sx,CL*sz);g.strokeRect(w/2-HW*sx,h/2-CL/2*sz,2*HW*sx,CL*sz);g.strokeRect(w/2-HW*sx,h/2-6.4*sz,2*HW*sx,12.8*sz);g.beginPath();g.moveTo(w/2,h/2-6.4*sz);g.lineTo(w/2,h/2+6.4*sz);g.moveTo(w/2-6.4*sx,h/2);g.lineTo(w/2+6.4*sx,h/2);g.stroke()});
  const g=new T.PlaneGeometry(18.3,36.6);g.rotateX(-Math.PI/2);const m=new T.Mesh(g,new T.MeshLambertMaterial({map:tex}));m.position.set(x,0.001,z);m.receiveShadow=true;G.add(m);
  const n=new T.Mesh(new T.PlaneGeometry(12.8,1),new T.MeshBasicMaterial({color:0x111418,transparent:true,opacity:.5,side:T.DoubleSide}));n.position.set(x,0.5,z);G.add(n)}
function umpireChair(G,V,x,people){const m=new T.MeshLambertMaterial({color:V.kind==='major'?V.wall:0x2A3440}),g=new T.Group();
  for(const [dx,dz] of[[-0.3,-0.3],[0.3,-0.3],[-0.3,0.3],[0.3,0.3]]){const l=new T.Mesh(new T.BoxGeometry(0.06,1.9,0.06),m);l.position.set(dx,0.95,dz);g.add(l)}
  const s=new T.Mesh(new T.BoxGeometry(0.8,0.08,0.8),m);s.position.set(0,1.9,0);g.add(s);const b=new T.Mesh(new T.BoxGeometry(0.8,0.7,0.06),m);b.position.set(-0.4,2.25,0);b.rotation.y=Math.PI/2;g.add(b);
  const st=new T.Mesh(new T.BoxGeometry(0.06,0.9,0.9),m);st.position.set(0.42,1.45,0);g.add(st);
  g.position.set(x,0,0);G.add(g);people.push({x:x,y:1.94,z:0,yaw:Math.PI/2,ex:0,shirt:V.kind==='major'?V.wall:0x1E2A3A,staff:1})}
/* lighting and sky for the venue */
function venueLight(V){const s=W3.scene,night=!!V.night;
  s.background=new T.Color(V.sky||0x9DC4E4);s.fog=new T.Fog(V.sky||0x9DC4E4,night?70:80,night?170:180);
  W3.hemi.color.set(night?0x8FA3D6:V.major==='London'?0xE6ECF0:0xDFEFFF);W3.hemi.groundColor.set(night?0x1C2430:0x5A6B4A);W3.hemi.intensity=night?0.75:V.major==='London'?1.45:1.25;
  W3.sun.color.set(night?0xF4F6FF:0xFFF3DD);W3.sun.intensity=night?2.1:V.major==='London'?1.7:2.3;W3.sun.position.set(night?-3:-12,night?30:26,night?4:8);
  W3.r.toneMappingExposure=night?1.12:1.05}

function disposeTree(G){G.traverse(o=>{if(o.geometry)o.geometry.dispose();const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of ms){if(m.map)m.map.dispose();m.dispose()}});while(G.children.length)G.remove(G.children[0])}
function buildCourt(surf,cfg){
  const G=W3.court;disposeTree(G);W3.crowdMeshes=null;
  const V=W3.venue=venueFor(Object.assign({},cfg||{},{surf}));venueLight(V);
  const hz=CL/2,people=[];
  const stadium=V.kind==='tour'||V.kind==='major';
  const xS=stadium?(V.kind==='major'?10.2:9.7):V.kind==='college'?9.2:8.9,zF=stadium?(V.kind==='major'?18.6:18.3):18.3;
  // ground: the painted surface inside the walls, plain ground outside
  const outer=new T.PlaneGeometry(260,260);outer.rotateX(-Math.PI/2);
  {const om=new T.Mesh(outer,new T.MeshLambertMaterial({color:stadium?shade(V.wall,0.8):0x5C8A45}));om.position.y=-0.02;G.add(om)}
  const W=stadium?2*xS+6:2*xS,D=stadium?2*zF+12:2*zF,sg=new T.PlaneGeometry(W,D);sg.rotateX(-Math.PI/2);
  const sm=new T.Mesh(sg,new T.MeshStandardMaterial({map:surfaceTex(V,W,D),roughness:V.surf==='grass'?0.95:0.85}));sm.receiveShadow=true;G.add(sm);
  // lines
  const lineM=new T.MeshStandardMaterial({color:0xF4F3EE,roughness:.6});
  const line=(x0,z0,x1,z1,w)=>{const Wd=Math.abs(x1-x0)||w,Dd=Math.abs(z1-z0)||w,g=new T.PlaneGeometry(Wd,Dd);g.rotateX(-Math.PI/2);const m=new T.Mesh(g,lineM);m.position.set((x0+x1)/2,0.006,(z0+z1)/2);m.receiveShadow=true;G.add(m)};
  const lw=0.05,sv=6.40;
  line(-5.485,hz,5.485,hz,0.1);line(-5.485,-hz,5.485,-hz,0.1);
  for(const x of[-5.485,-HW,HW,5.485])line(x,-hz,x,hz,lw);
  line(-HW,sv,HW,sv,lw);line(-HW,-sv,HW,-sv,lw);line(0,-sv,0,sv,lw);line(0,hz-0.15,0,hz,lw);line(0,-hz,0,-hz+0.15,lw);
  // net: posts, mesh, tape and centre strap
  const postX=5.485+0.914,postM=new T.MeshStandardMaterial({color:V.kind==='major'?V.wall:0x2a2f35,metalness:.5,roughness:.4});
  for(const x of[-postX,postX]){const p=new T.Mesh(new T.CylinderGeometry(.05,.05,1.07,10),postM);p.position.set(x,0.535,0);p.castShadow=true;G.add(p)}
  const ng=new T.PlaneGeometry(postX*2,1,24,1),pa=ng.attributes.position;
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),top=pa.getY(i)>0;const hgt=0.914+(1.07-0.914)*Math.pow(Math.abs(x)/postX,2);pa.setY(i,top?hgt:0.02)}
  ng.computeVertexNormals();
  const meshTex=canvasTex(32,32,(g,w,h)=>{g.strokeStyle='rgba(20,22,26,0.95)';g.lineWidth=3;g.strokeRect(0,0,w,h)},true);meshTex.wrapT=T.RepeatWrapping;meshTex.repeat.set(postX*2/0.045,1/0.045);
  G.add(new T.Mesh(ng,new T.MeshBasicMaterial({map:meshTex,transparent:true,side:T.DoubleSide,depthWrite:false,opacity:0.9})));
  const tp=[];for(let i=0;i<=24;i++){const x=-postX+i*postX*2/24;tp.push(new T.Vector3(x,0.914+(1.07-0.914)*Math.pow(Math.abs(x)/postX,2),0))}
  G.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(tp),48,0.03,5,false),new T.MeshStandardMaterial({color:0xF4F3EE,roughness:.6})));
  const strap=new T.Mesh(new T.PlaneGeometry(0.05,0.9),new T.MeshBasicMaterial({color:0xF4F3EE,side:T.DoubleSide}));strap.position.set(0,0.46,0.01);G.add(strap);
  // venue structures and where the fans sit
  let seats=[];
  if(stadium){
    const P=bowlPath(xS+0.3,zF+0.3,V.kind==='major'?7:5,zF+2);
    boardWall(G,V,P,V.kind==='major'?2.4:2.2,-0.3);
    const B=buildBowl(G,V,P,{rows:V.rows,rise:0.42,tread:0.85,y0:V.kind==='major'?2.4:2.2,brk:V.brk||0,gap:1.6});seats=B.seats;
    {const wh=V.kind==='major'?2.4:2.2;textPlane(G,V.title,17.4,wh,0xF4F1E6,V.wall,0,wh/2,-zF+0.03,0)}
    umpireChair(G,V,-(postX+0.9),people);
    // ball kids: two crouched at the net posts, two at the far corners
    for(const [x,z,yw] of[[postX+0.5,0.6,-Math.PI/2],[-(postX+0.4),-1.2,Math.PI/2],[-4.5,-(hz+4.6),0],[4.5,-(hz+4.6),0]])people.push({x,y:0.02,z,yaw:yw,ex:0.15,shirt:V.acc,staff:1});
    // line judges seated against the back wall
    if(V.kind==='major')for(const x of[-6.5,6.5])people.push({x,y:0.45,z:-(zF-0.6),yaw:0,ex:0,shirt:shade(V.wall,1.6),staff:1});
  }else{
    const club=V.kind==='club';
    fenceRect(G,V,xS,zF,3.6,club?2.2:2.4,club?null:V.windText);
    if(club){neighbourCourt(G,V,-18.3,0);neighbourCourt(G,V,18.3,0);
      seats=seats.concat(bleacher(G,-(xS+1.4),-6,8,3,Math.PI/2,[]),bleacher(G,-2.5,-(zF-1.2),7,2,0,[]),bleacher(G,0,zF+1.3,6,2,Math.PI,[]));
      const tp=[];for(let i=0;i<46;i++){const a=Math.random()*Math.PI*2,r=34+Math.random()*16;tp.push([Math.cos(a)*r,Math.sin(a)*r*1.1-6])}trees(G,tp);
      for(const [x,z] of[[-xS,-zF],[xS,-zF],[-xS,zF],[xS,zF]])lightPole(G,x,z,9);
      const bench=new T.Mesh(new T.BoxGeometry(0.5,0.45,2.2),new T.MeshLambertMaterial({color:0x3A5A40}));bench.position.set(-(postX+1.2),0.22,0);G.add(bench);
    }else{
      seats=seats.concat(bleacher(G,-(xS+1.3),-3,20,6,Math.PI/2,[]),bleacher(G,xS+1.3,-3,20,6,-Math.PI/2,[]),bleacher(G,0,-(zF+1.3),14,8,0,[]));
      const tp=[];for(let i=0;i<36;i++){const a=Math.random()*Math.PI*2,r=40+Math.random()*14;tp.push([Math.cos(a)*r,Math.sin(a)*r*1.1-8])}trees(G,tp);
      for(const [x,z] of[[-xS,-zF],[xS,-zF],[-xS,zF],[xS,zF]])lightPole(G,x,z,11);
      textPlane(G,V.windText,6,0.9,V.acc,V.wind,0,3.9,-(zF+0.05),0);
      umpireChair(G,V,-(postX+0.9),people);
    }
  }
  // fill the seats: fuller near the court
  for(const s of seats){const f=V.fill*(1.08-0.25*s.row/Math.max(1,V.rows||8));if(Math.random()<f)people.push({x:s.x,y:s.y,z:s.z,yaw:s.yaw+rnd(-0.18,0.18),ex:Math.random()})}
  buildCrowd(G,V,people);
  if(W3.sun){const sc=W3.sun.shadow.camera;sc.updateProjectionMatrix()}
}
/* ================= crowd: instanced low-poly fans animated in the vertex shader =================
   each fan follows the ball with head and shoulders, claps after points and stands up for big ones */
const CROWD_U={uT:{value:0},uBall:{value:new T.Vector3(0,1,0)},uClap:{value:0},uStand:{value:0},uLook:{value:0}};
const CROWD={clapAmp:0,clapUntil:0,standUntil:0,look:0};
function personGeo(){
  const parts=[],add=(w,h,d,x,y,z,arm,shade)=>{const g=new T.BoxGeometry(w,h,d).toNonIndexed();g.translate(x,y,z);const n=g.attributes.position.count;
    g.setAttribute('aArm',new T.Float32BufferAttribute(new Array(n).fill(arm),1));g.setAttribute('color',new T.Float32BufferAttribute(new Array(n*3).fill(shade),3));parts.push(g)};
  add(0.36,0.5,0.22,0,0.3,0,0,1);            // torso
  add(0.32,0.14,0.42,0,0.07,0.17,0,0.42);    // thighs
  add(0.28,0.42,0.12,0,-0.17,0.36,0,0.38);   // shins
  add(0.09,0.44,0.1,0.22,0.3,0,1,1);         // arms hang from the shoulders (pivot y 0.52)
  add(0.09,0.44,0.1,-0.22,0.3,0,-1,1);
  const pos=[],nor=[],arm=[],col=[];for(const g of parts){pos.push(...g.attributes.position.array);nor.push(...g.attributes.normal.array);arm.push(...g.attributes.aArm.array);col.push(...g.attributes.color.array)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));
  g.setAttribute('aArm',new T.Float32BufferAttribute(arm,1));g.setAttribute('color',new T.Float32BufferAttribute(col,3));return g}
function crowdMat(headF,arms,vcol){
  const m=new T.MeshLambertMaterial({vertexColors:!!vcol});
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,CROWD_U);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT,uClap,uStand,uLook;uniform vec3 uBall;attribute float aPh,aEx,aYaw;'+(arms?'attribute float aArm;':''))
      .replace('#include <begin_vertex>',`#include <begin_vertex>
      float st=clamp(uStand*1.7*aEx-0.35,0.,1.),cl=uClap*clamp(aEx*1.4+0.25,0.,1.);
      ${arms?`if(abs(aArm)>0.5){vec3 pv=vec3(0.22*aArm,0.52,0.);vec3 r=transformed-pv;
        float th=mix(mix(0.95,1.5,cl),2.85,st);float s=sin(th),c=cos(th);r=vec3(r.x,r.y*c+r.z*s,-r.y*s+r.z*c);
        r.x-=aArm*cl*(1.-st)*(0.12+0.06*sin(uT*17.+aPh*6.));transformed=pv+r;}`:''}
      vec3 ip=vec3(instanceMatrix[3]);vec2 dd=uBall.xz-ip.xz;float lk=atan(dd.x,dd.y)-aYaw;lk=atan(sin(lk),cos(lk));lk=clamp(lk,-1.2,1.2)*uLook*${headF.toFixed(2)};
      float sn=sin(lk),cs=cos(lk);transformed.xz=vec2(transformed.x*cs+transformed.z*sn,-transformed.x*sn+transformed.z*cs);
      transformed.y+=st*0.42+st*0.07*max(0.,sin(uT*8.+aPh*5.))+cl*0.015*sin(uT*9.+aPh)+0.01*sin(uT*1.3+aPh*7.);`)};
  m.customProgramCacheKey=()=>'crowd'+headF+arms;return m}
const SHIRTS=[0xE8E6DF,0xF4F4F0,0x2A3A5A,0xC8463E,0x3E6EB4,0xE0B040,0x2F2F35,0x6FA0D8,0xD87A9A,0x5E8E4E,0x9A5AA8,0xF08A3C,0x7FC8C0,0xB8B0A0];
const SKINS=[0xF1C9A5,0xE6B48F,0xD19A72,0xA8714E,0x7D4E33,0x5A3826,0xF6D8C2];
const HAIR=[0x1E1A18,0x3B2A1E,0x6B4A2A,0xC9A465,0x8A8A8A,0x2A2420];
function buildCrowd(G,V,people){
  const n=people.length;if(!n)return;
  // staff first, then the fans in random order so lowering crowd density thins every stand evenly
  {const st=people.filter(p=>p.staff),fans=people.filter(p=>!p.staff);for(let i=fans.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[fans[i],fans[j]]=[fans[j],fans[i]]}people=st.concat(fans);W3.crowdStaff=st.length}
  const ph=new Float32Array(n),ex=new Float32Array(n),yw=new Float32Array(n);
  const body=personGeo(),head=new T.IcosahedronGeometry(0.11,0).translate(0,0.68,0),top=new T.SphereGeometry(0.118,6,2,0,Math.PI*2,0,Math.PI/2).translate(0,0.70,0);
  const mk=(geo,mat)=>{const g=geo.clone();g.setAttribute('aPh',new T.InstancedBufferAttribute(ph,1));g.setAttribute('aEx',new T.InstancedBufferAttribute(ex,1));g.setAttribute('aYaw',new T.InstancedBufferAttribute(yw,1));
    const im=new T.InstancedMesh(g,mat,n);im.frustumCulled=false;G.add(im);return im};
  const B=mk(body,crowdMat(0.3,true,true)),H=mk(head,crowdMat(1,false)),Tp=mk(top,crowdMat(1,false));
  const m=new T.Matrix4(),q=new T.Quaternion(),sc=new T.Vector3(),p=new T.Vector3(),c=new T.Color(),up=new T.Vector3(0,1,0);
  const sunny=!V.night&&V.major!=='London';
  people.forEach((o,i)=>{ph[i]=Math.random()*6.28;ex[i]=o.ex;yw[i]=o.yaw;
    const s=o.staff?1:0.9+Math.random()*0.16;sc.set(s,s,s);q.setFromAxisAngle(up,o.yaw);p.set(o.x,o.y,o.z);m.compose(p,q,sc);B.setMatrixAt(i,m);H.setMatrixAt(i,m);Tp.setMatrixAt(i,m);
    c.set(o.shirt!=null?o.shirt:pick(SHIRTS));if(o.shirt==null)c.offsetHSL(rnd(-0.02,0.02),0,rnd(-0.06,0.04));B.setColorAt(i,c);
    c.set(pick(SKINS));H.setColorAt(i,c);
    const hat=!o.staff&&Math.random()<(sunny?0.35:0.12);c.set(hat?pick([0xF4F4F0,0xE8D9A8,0x2A3A5A,0xC8463E,V.acc]):pick(HAIR));Tp.setColorAt(i,c)});
  for(const im of[B,H,Tp]){im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true}
  W3.crowdN=n;W3.crowdMeshes=[B,H,Tp];if(typeof applyQuality==='function')applyQuality();
}
function crowdCheer(amp,dur,stand){const t=now();CROWD.clapAmp=Math.max(amp,t<CROWD.clapUntil?CROWD.clapAmp:0);CROWD.clapUntil=Math.max(CROWD.clapUntil,t+dur*1000);if(stand)CROWD.standUntil=Math.max(CROWD.standUntil,t+stand*1000)}
function crowdTick(dt){const t=now(),U=CROWD_U;U.uT.value+=dt;
  const ct=t<CROWD.clapUntil?CROWD.clapAmp:0;U.uClap.value+=(ct-U.uClap.value)*Math.min(1,dt*(ct>U.uClap.value?8:2.5));
  const stt=t<CROWD.standUntil?1:0;U.uStand.value+=(stt-U.uStand.value)*Math.min(1,dt*(stt?3:1.4));
  const live=M&&W3.ball.visible&&M.state!=='between';CROWD.look+=((live?1:0.15)-CROWD.look)*Math.min(1,dt*3);U.uLook.value=CROWD.look;
  if(W3.ball.visible)U.uBall.value.lerp(W3.ball.position,Math.min(1,dt*10));else U.uBall.value.lerp(new T.Vector3(0,1,0),Math.min(1,dt*2))}
