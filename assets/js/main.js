/* ═══════════════════════════════════════════════════════
   BRIVENT — GLOBAL JS v2.0
   Cursor · Nav · Reveal · Count · Tilt · Magnetic
   3D Engine: Stars · Icosahedron · Rings · Particles
═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── PAGE LOADER ─── */
  window.addEventListener('load', () => {
    const l = document.getElementById('loader');
    if (l) setTimeout(() => l.classList.add('gone'), 700);
  });

  /* ─── CURSOR ─── */
  const dot  = document.getElementById('curDot');
  const ring = document.getElementById('curRing');
  if (dot && ring) {
    let mx=0, my=0, rx=0, ry=0;
    document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
    document.addEventListener('mouseleave', () => { dot.style.opacity='0'; ring.style.opacity='0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity='1'; ring.style.opacity='1'; });
    (function animCursor() {
      dot.style.left=mx+'px'; dot.style.top=my+'px';
      rx += (mx-rx)*.1; ry += (my-ry)*.1;
      ring.style.left=rx+'px'; ring.style.top=ry+'px';
      requestAnimationFrame(animCursor);
    })();
    document.querySelectorAll('a,button,[data-hov]').forEach(el => {
      el.addEventListener('mouseenter', () => { dot.classList.add('hov'); ring.classList.add('hov'); });
      el.addEventListener('mouseleave', () => { dot.classList.remove('hov'); ring.classList.remove('hov'); });
    });
  }

  /* ─── NAV ─── */
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const mmenu  = document.getElementById('mMenu');
  if (nav) {
    const sync = () => nav.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', sync, { passive: true });
    sync();
  }
  if (burger && mmenu) {
    burger.addEventListener('click', () => {
      const o = burger.classList.toggle('open');
      mmenu.classList.toggle('open', o);
      document.body.style.overflow = o ? 'hidden' : '';
    });
    mmenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('open');
      mmenu.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }
  const pg = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(a => {
    const h = a.getAttribute('href');
    if (h===pg||(pg===''&&h==='index.html')) a.classList.add('active');
  });

  /* ─── SCROLL REVEAL ─── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el=e.target, d=parseInt(el.dataset.d||0);
        setTimeout(() => el.classList.add('vis'), d*80);
        io.unobserve(el);
      });
    }, { threshold: .08, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('vis'));
  }

  /* ─── COUNT-UP ─── */
  function runCount(el) {
    const target=parseFloat(el.dataset.count), suf=el.dataset.suffix||'', pre=el.dataset.prefix||'';
    const dur=2200, dec=el.dataset.decimals?parseInt(el.dataset.decimals):0;
    const t0=performance.now();
    function tick(now) {
      const p=Math.min((now-t0)/dur,1), ease=1-Math.pow(1-p,4);
      el.textContent=pre+(dec?(target*ease).toFixed(dec):Math.floor(target*ease))+suf;
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const cio=new IntersectionObserver(e=>e.forEach(en=>{
    if(en.isIntersecting&&!en.target._counted){en.target._counted=true;runCount(en.target);}
  }),{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));

  /* ─── 3D CARD TILT ─── */
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r=card.getBoundingClientRect();
      const x=((e.clientX-r.left)/r.width-.5)*10;
      const y=((e.clientY-r.top)/r.height-.5)*10;
      card.style.transform=`perspective(900px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-6px)`;
      card.style.transition='none';
    });
    card.addEventListener('mouseleave',()=>{
      card.style.transform='';
      card.style.transition='transform .55s cubic-bezier(.22,1,.36,1)';
    });
  });

  /* ─── MAGNETIC BUTTONS ─── */
  document.querySelectorAll('[data-mag]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left-r.width/2)*.28;
      const y=(e.clientY-r.top-r.height/2)*.28;
      el.style.transform=`translate(${x}px,${y}px)`;
      el.style.transition='none';
    });
    el.addEventListener('mouseleave',()=>{
      el.style.transform='';
      el.style.transition='transform .45s cubic-bezier(.22,1,.36,1)';
    });
  });

  /* ─── CONTACT FORM ─── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn=form.querySelector('[type=submit]'), msg=document.getElementById('formMsg');
      btn.disabled=true;
      btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
      try {
        const res=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
        if(res.ok){
          msg.className='form-msg success';
          msg.textContent="Message sent! We'll get back to you shortly.";
          form.reset();
        } else throw new Error();
      } catch {
        msg.className='form-msg error';
        msg.textContent='Something went wrong. Email us at hello@brivent.co';
      }
      btn.disabled=false;
      btn.innerHTML='Send Message <i class="fa-solid fa-arrow-right"></i>';
      setTimeout(()=>{msg.className='form-msg';msg.textContent='';},6000);
    });
  }

  /* ═══════════════════════════════════════════════════
     3D ENGINE — Pure Canvas · No Libraries
  ═══════════════════════════════════════════════════ */

  /* ─── MATH ─── */
  window.R3D = {
    rotX(p,a){ const c=Math.cos(a),s=Math.sin(a); return {x:p.x,y:p.y*c-p.z*s,z:p.y*s+p.z*c}; },
    rotY(p,a){ const c=Math.cos(a),s=Math.sin(a); return {x:p.x*c+p.z*s,y:p.y,z:-p.x*s+p.z*c}; },
    rotZ(p,a){ const c=Math.cos(a),s=Math.sin(a); return {x:p.x*c-p.y*s,y:p.x*s+p.y*c,z:p.z}; },
    proj(p,fov,cx,cy){
      const z=p.z+fov;
      if(z<=10) return null;
      const s=fov/z;
      return {x:p.x*s+cx,y:p.y*s+cy,s,z:p.z};
    }
  };

  /* ─── ICOSAHEDRON ─── */
  const phi=(1+Math.sqrt(5))/2;
  window.ICO={
    verts:(function(){
      return [[-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],
        [0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],
        [phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]
      ].map(([x,y,z])=>{const l=Math.sqrt(x*x+y*y+z*z);return{x:x/l,y:y/l,z:z/l};});
    })(),
    edges:[
      [0,1],[0,5],[0,7],[0,10],[0,11],[1,5],[1,7],[1,8],[1,9],
      [2,3],[2,4],[2,6],[2,10],[2,11],[3,4],[3,6],[3,8],[3,9],
      [4,5],[4,9],[4,11],[5,9],[5,11],[6,7],[6,8],[6,10],[7,8],[7,10],[8,9],[10,11]
    ]
  };

  /* ─── STAR FIELD (shared) ─── */
  window.createStars = function(W,H,count=1200) {
    return Array.from({length:count},()=>({
      x:(Math.random()-.5)*W*4,
      y:(Math.random()-.5)*H*4,
      z:Math.random()*2500+100,
      speed:Math.random()*.25+.04,
      size:Math.random()*1.5+.3,
      bright:Math.random()
    }));
  };

  /* ─── MAIN 3D SCENE (homepage) ─── */
  const sceneCanvas = document.getElementById('scene3d');
  if (sceneCanvas) initHeroScene(sceneCanvas);

  function initHeroScene(canvas) {
    const ctx=canvas.getContext('2d');
    let W,H,cx,cy,FOV;
    const resize=()=>{
      W=canvas.width=canvas.offsetWidth;
      H=canvas.height=canvas.offsetHeight;
      cx=W/2; cy=H/2;
      FOV=Math.min(W,H)*.75;
    };
    window.addEventListener('resize',resize); resize();

    const {rotX,rotY,proj}=R3D;
    const stars=createStars(W,H,500);

    const ICO_R=Math.min(W,H)*.18;
    const iVerts=ICO.verts.map(v=>({x:v.x*ICO_R,y:v.y*ICO_R,z:v.z*ICO_R}));

    /* Rings — fewer segments */
    const RSEG=60;
    const rings=[
      {R:ICO_R*1.62,tX:.38,tZ:.55,col:'21,43,249',  spd:.009,phase:0},
      {R:ICO_R*1.88,tX:1.28,tZ:.18,col:'150,180,255',spd:-.006,phase:2.1},
      {R:ICO_R*1.48,tX:.72,tZ:1.82,col:'255,80,60',  spd:.012,phase:4.2},
    ];
    function ringPts(ring){
      const pts=[];
      for(let i=0;i<=RSEG;i++){
        const t=(i/RSEG)*Math.PI*2;
        let x=ring.R*Math.cos(t),y=ring.R*Math.sin(t),z=0;
        const cx1=Math.cos(ring.tX),sx1=Math.sin(ring.tX);
        [y,z]=[y*cx1-z*sx1,y*sx1+z*cx1];
        const cz1=Math.cos(ring.tZ),sz1=Math.sin(ring.tZ);
        [x,y]=[x*cz1-y*sz1,x*sz1+y*cz1];
        const cy1=Math.cos(ring.phase),sy1=Math.sin(ring.phase);
        [x,z]=[x*cy1+z*sy1,-x*sy1+z*cy1];
        pts.push({x,y,z});
      }
      return pts;
    }

    /* Energy particles — reduced count */
    const EPARTS=Array.from({length:70},()=>({
      theta:Math.random()*Math.PI*2,
      phi:Math.random()*Math.PI,
      r:ICO_R*(1.05+Math.random()*.55),
      spd:(Math.random()-.5)*.022,
      size:Math.random()*2.2+.5,
      life:Math.random(),
      col:Math.random()>.7?'255,80,60':'21,43,249',
    }));

    let iRx=0,iRy=0,iPulse=1,iPDir=1;
    let mouseX=0,mouseY=0;
    document.addEventListener('mousemove',e=>{
      mouseX=(e.clientX/window.innerWidth-.5)*40;
      mouseY=(e.clientY/window.innerHeight-.5)*28;
    });

    /* 30fps cap — avoids pegging the main thread at 60fps */
    const FPS=30, INTERVAL=1000/FPS;
    let lastT=0, frame=0;

    (function animate(ts){
      requestAnimationFrame(animate);
      if(ts-lastT < INTERVAL) return;
      lastT=ts-(ts-lastT)%INTERVAL;
      frame++;

      ctx.fillStyle='rgba(3,3,45,0.16)';
      ctx.fillRect(0,0,W,H);

      const ox=mouseX,oy=mouseY;

      /* Stars — no shadowBlur */
      ctx.save();
      stars.forEach(s=>{
        s.z-=s.speed;
        if(s.z<1){s.z=2500;s.x=(Math.random()-.5)*W*4;s.y=(Math.random()-.5)*H*4;}
        const p=proj({x:s.x,y:s.y,z:s.z-1000},FOV,cx,cy);
        if(!p) return;
        const br=Math.min(1,(2500-s.z)/1500)*s.bright;
        ctx.globalAlpha=br*.75;
        ctx.fillStyle='rgba(215,215,255,1)';
        ctx.fillRect(p.x-.5,p.y-.5,s.size*p.s*2.5,s.size*p.s*2.5);
      });
      ctx.globalAlpha=1;
      ctx.restore();

      /* Nebula glow (every 6 frames) */
      if(frame%6===0){
        ctx.save();
        ctx.globalCompositeOperation='lighter';
        ctx.globalAlpha=.006;
        const g=ctx.createRadialGradient(cx*.55,cy*.45,0,cx*.55,cy*.45,W*.4);
        g.addColorStop(0,'rgba(21,43,249,1)'); g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
        const g2=ctx.createRadialGradient(cx*1.35,cy*1.2,0,cx*1.35,cy*1.2,W*.3);
        g2.addColorStop(0,'rgba(255,17,11,1)'); g2.addColorStop(1,'transparent');
        ctx.fillStyle=g2; ctx.fillRect(0,0,W,H);
        ctx.globalAlpha=1;
        ctx.restore();
      }

      /* Rings — shadowBlur set once per ring, not per segment */
      ctx.save();
      ctx.globalCompositeOperation='lighter';
      rings.forEach(ring=>{
        ring.phase+=ring.spd;
        const pts=ringPts(ring);
        ctx.shadowBlur=6;
        ctx.shadowColor=`rgba(${ring.col},.8)`;
        ctx.beginPath();
        for(let i=0;i<RSEG;i++){
          const pa=proj({x:pts[i].x+ox,y:pts[i].y+oy,z:pts[i].z},FOV,cx,cy);
          const pb=proj({x:pts[i+1].x+ox,y:pts[i+1].y+oy,z:pts[i+1].z},FOV,cx,cy);
          if(!pa||!pb) continue;
          const depth=(pts[i].z+ring.R)/(ring.R*2);
          ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y);
        }
        ctx.strokeStyle=`rgba(${ring.col},.35)`;
        ctx.lineWidth=.8;
        ctx.stroke();
        /* Trailing bright particle */
        const pidx=Math.abs(Math.floor(((ring.phase*2)%(Math.PI*2))/(Math.PI*2)*RSEG))%RSEG;
        const pp=pts[pidx];
        const ppp=proj({x:pp.x+ox,y:pp.y+oy,z:pp.z},FOV,cx,cy);
        if(ppp){
          const d=(pp.z+ring.R)/(ring.R*2);
          ctx.shadowBlur=20;
          ctx.beginPath(); ctx.arc(ppp.x,ppp.y,2+d*3,0,Math.PI*2);
          ctx.fillStyle=`rgba(255,255,255,${.55+d*.35})`; ctx.fill();
        }
      });
      ctx.restore();

      /* Icosahedron — shadowBlur set once before edge loop */
      iRx+=.0038; iRy+=.0072;
      iPulse+=.003*iPDir;
      if(iPulse>1.07||iPulse<.93) iPDir*=-1;

      const tverts=iVerts.map(v=>{
        let p={x:v.x*iPulse,y:v.y*iPulse,z:v.z*iPulse};
        p=rotX(p,iRx); p=rotY(p,iRy);
        return {x:p.x+ox,y:p.y+oy,z:p.z};
      });
      const pverts=tverts.map(v=>proj(v,FOV,cx,cy));

      ctx.save();
      ctx.globalCompositeOperation='lighter';

      /* Core glow */
      const igrd=ctx.createRadialGradient(cx+ox,cy+oy,0,cx+ox,cy+oy,ICO_R*.85);
      igrd.addColorStop(0,'rgba(21,43,249,.1)');
      igrd.addColorStop(1,'transparent');
      ctx.beginPath(); ctx.arc(cx+ox,cy+oy,ICO_R*.85,0,Math.PI*2);
      ctx.fillStyle=igrd; ctx.fill();

      /* All edges in one pass — one shadowBlur call */
      ctx.shadowBlur=10;
      ctx.shadowColor='rgba(21,43,249,.9)';
      ICO.edges.forEach(([a,b])=>{
        const pa=pverts[a],pb=pverts[b]; if(!pa||!pb) return;
        const depth=((tverts[a].z+tverts[b].z)/2+ICO_R)/(ICO_R*2);
        ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y);
        ctx.strokeStyle=`rgba(80,140,255,${.15+depth*.55})`;
        ctx.lineWidth=.4+depth*1.2;
        ctx.stroke();
      });

      /* Vertices — one shadowBlur call */
      ctx.shadowBlur=14;
      ctx.shadowColor='rgba(21,43,249,1)';
      pverts.forEach((p,i)=>{
        if(!p) return;
        const depth=(tverts[i].z+ICO_R)/(ICO_R*2);
        ctx.beginPath(); ctx.arc(p.x,p.y,1.5+depth*4,0,Math.PI*2);
        ctx.fillStyle=`rgba(160,200,255,${.4+depth*.55})`; ctx.fill();
      });
      ctx.restore();

      /* Energy particles — no shadowBlur */
      ctx.save();
      ctx.globalCompositeOperation='lighter';
      EPARTS.forEach(p=>{
        p.theta+=p.spd;
        p.life+=.007; if(p.life>1) p.life=0;
        const x=p.r*Math.sin(p.phi)*Math.cos(p.theta);
        const y=p.r*Math.cos(p.phi);
        const z=p.r*Math.sin(p.phi)*Math.sin(p.theta);
        const pp=proj({x:x+ox,y:y+oy,z},FOV,cx,cy);
        if(!pp) return;
        const alpha=Math.sin(p.life*Math.PI)*.4;
        ctx.beginPath(); ctx.arc(pp.x,pp.y,p.size,0,Math.PI*2);
        ctx.fillStyle=`rgba(${p.col},${alpha})`; ctx.fill();
      });
      ctx.restore();
    })(0);
  }

  /* ─── DNA HELIX (about page) ─── */
  const dnaCanvas = document.getElementById('dnaCanvas');
  if (dnaCanvas) initDNA(dnaCanvas);

  function initDNA(canvas){
    const ctx=canvas.getContext('2d');
    let W,H;
    const resize=()=>{ W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; };
    window.addEventListener('resize',resize); resize();
    let t=0;
    (function draw(){
      ctx.clearRect(0,0,W,H);
      const cx=W/2, SEGS=40, VERT_SPAN=H*.7, TOP=H*.15;
      const AMP=W*.12, FREQ=3;
      const pts1=[],pts2=[];
      for(let i=0;i<=SEGS;i++){
        const y=TOP+(i/SEGS)*VERT_SPAN;
        const phase=(i/SEGS)*Math.PI*2*FREQ+t;
        pts1.push({x:cx+Math.cos(phase)*AMP,y});
        pts2.push({x:cx+Math.cos(phase+Math.PI)*AMP,y});
      }
      /* Rungs */
      ctx.save();
      ctx.globalCompositeOperation='lighter';
      for(let i=0;i<=SEGS;i+=2){
        const p1=pts1[i],p2=pts2[i];
        const depth=(Math.cos((i/SEGS)*Math.PI*2*FREQ+t)+1)/2;
        const grd=ctx.createLinearGradient(p1.x,p1.y,p2.x,p2.y);
        grd.addColorStop(0,`rgba(21,43,249,${.15+depth*.35})`);
        grd.addColorStop(.5,`rgba(150,180,255,${.2+depth*.4})`);
        grd.addColorStop(1,`rgba(21,43,249,${.15+depth*.35})`);
        ctx.shadowBlur=8; ctx.shadowColor='rgba(21,43,249,.8)';
        ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y);
        ctx.strokeStyle=grd; ctx.lineWidth=.8+depth*1.2; ctx.stroke();
      }
      /* Strand 1 */
      ctx.shadowBlur=14; ctx.shadowColor='rgba(21,43,249,.9)';
      ctx.beginPath(); ctx.moveTo(pts1[0].x,pts1[0].y);
      for(let i=1;i<=SEGS;i++) ctx.lineTo(pts1[i].x,pts1[i].y);
      ctx.strokeStyle='rgba(21,43,249,.7)'; ctx.lineWidth=1.5; ctx.stroke();
      /* Strand 2 */
      ctx.shadowColor='rgba(255,17,11,.9)';
      ctx.beginPath(); ctx.moveTo(pts2[0].x,pts2[0].y);
      for(let i=1;i<=SEGS;i++) ctx.lineTo(pts2[i].x,pts2[i].y);
      ctx.strokeStyle='rgba(255,80,60,.7)'; ctx.lineWidth=1.5; ctx.stroke();
      /* Nodes */
      pts1.forEach((p,i)=>{
        const depth=(Math.cos((i/SEGS)*Math.PI*2*FREQ+t)+1)/2;
        ctx.shadowBlur=18; ctx.shadowColor='rgba(21,43,249,1)';
        ctx.beginPath(); ctx.arc(p.x,p.y,2+depth*3,0,Math.PI*2);
        ctx.fillStyle=`rgba(150,190,255,${.4+depth*.6})`; ctx.fill();
      });
      pts2.forEach((p,i)=>{
        const depth=(Math.cos((i/SEGS)*Math.PI*2*FREQ+t+Math.PI)+1)/2;
        ctx.shadowBlur=18; ctx.shadowColor='rgba(255,17,11,1)';
        ctx.beginPath(); ctx.arc(p.x,p.y,2+depth*3,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,120,100,${.4+depth*.6})`; ctx.fill();
      });
      ctx.restore();
      t+=.025;
      requestAnimationFrame(draw);
    })();
  }

  /* ─── HOLOGRAPHIC SPHERE (products page) ─── */
  const sphereCanvas = document.getElementById('sphereCanvas');
  if (sphereCanvas) initSphere(sphereCanvas);

  function initSphere(canvas){
    const ctx=canvas.getContext('2d');
    let W,H,FOV;
    const resize=()=>{
      W=canvas.width=canvas.offsetWidth;
      H=canvas.height=canvas.offsetHeight;
      FOV=Math.min(W,H)*.6;
    };
    window.addEventListener('resize',resize); resize();
    const {rotX,rotY,proj}=R3D;
    const R=Math.min(W,H)*.22;
    const LATS=12, LONS=18, SEGS=60;
    let rx=.2,ry=0;
    /* Data points orbiting */
    const dpts=Array.from({length:30},()=>({
      lat:(Math.random()-.5)*Math.PI,
      lon:Math.random()*Math.PI*2,
      spd:(Math.random()-.5)*.01,
      size:Math.random()*3+1.5,
      pulse:Math.random()*Math.PI*2,
    }));
    (function draw(){
      ctx.clearRect(0,0,W,H);
      ctx.save();
      ctx.globalCompositeOperation='lighter';
      const cx=W/2,cy=H/2;
      /* Lat lines */
      for(let i=1;i<LATS;i++){
        const lat=(i/LATS)*Math.PI-Math.PI/2;
        const r=Math.cos(lat)*R;
        const y=Math.sin(lat)*R;
        ctx.beginPath();
        for(let j=0;j<=SEGS;j++){
          const lon=(j/SEGS)*Math.PI*2;
          let p={x:r*Math.cos(lon),y,z:r*Math.sin(lon)};
          p=rotX(p,rx); p=rotY(p,ry);
          const pp=proj(p,FOV,cx,cy);
          if(!pp) continue;
          const depth=(p.z-(-R))/(R*2);
          if(j===0) ctx.moveTo(pp.x,pp.y); else ctx.lineTo(pp.x,pp.y);
        }
        ctx.strokeStyle='rgba(21,43,249,.18)'; ctx.lineWidth=.6; ctx.stroke();
      }
      /* Lon lines */
      for(let j=0;j<LONS;j++){
        const lon=(j/LONS)*Math.PI*2;
        ctx.beginPath();
        for(let i=0;i<=SEGS;i++){
          const lat=(i/SEGS)*Math.PI-Math.PI/2;
          let p={x:Math.cos(lat)*R*Math.cos(lon),y:Math.sin(lat)*R,z:Math.cos(lat)*R*Math.sin(lon)};
          p=rotX(p,rx); p=rotY(p,ry);
          const pp=proj(p,FOV,cx,cy);
          if(!pp) continue;
          if(i===0) ctx.moveTo(pp.x,pp.y); else ctx.lineTo(pp.x,pp.y);
        }
        ctx.strokeStyle='rgba(21,43,249,.18)'; ctx.lineWidth=.6; ctx.stroke();
      }
      /* Data points */
      dpts.forEach(d=>{
        d.lon+=d.spd; d.pulse+=.06;
        const x=Math.cos(d.lat)*R*Math.cos(d.lon);
        const y=Math.sin(d.lat)*R;
        const z=Math.cos(d.lat)*R*Math.sin(d.lon);
        let p={x,y,z}; p=rotX(p,rx); p=rotY(p,ry);
        const pp=proj(p,FOV,cx,cy);
        if(!pp) return;
        const depth=(p.z-(-R))/(R*2);
        const alpha=(.3+depth*.7)*((.5+Math.sin(d.pulse)*.5)*.6+.4);
        ctx.shadowBlur=14; ctx.shadowColor='rgba(21,43,249,1)';
        ctx.beginPath(); ctx.arc(pp.x,pp.y,d.size*(depth*.5+.5),0,Math.PI*2);
        ctx.fillStyle=`rgba(100,160,255,${alpha})`; ctx.fill();
        /* Pulse ring */
        if(Math.sin(d.pulse)>.7){
          ctx.beginPath(); ctx.arc(pp.x,pp.y,d.size*3*(depth*.5+.5),0,Math.PI*2);
          ctx.strokeStyle=`rgba(21,43,249,${alpha*.4})`; ctx.lineWidth=.5; ctx.stroke();
        }
      });
      /* Core glow */
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,R*.8);
      g.addColorStop(0,'rgba(21,43,249,.08)'); g.addColorStop(1,'transparent');
      ctx.beginPath(); ctx.arc(cx,cy,R*.8,0,Math.PI*2);
      ctx.fillStyle=g; ctx.fill();
      ctx.restore();
      rx+=.004; ry+=.006;
      requestAnimationFrame(draw);
    })();
  }

  /* ─── GLOBE (contact page) ─── */
  const globeCanvas = document.getElementById('globeCanvas');
  if (globeCanvas) initGlobe(globeCanvas);

  function initGlobe(canvas){
    const ctx=canvas.getContext('2d');
    let W,H,FOV;
    const resize=()=>{
      W=canvas.width=canvas.offsetWidth;
      H=canvas.height=canvas.offsetHeight;
      FOV=Math.min(W,H)*.55;
    };
    window.addEventListener('resize',resize); resize();
    const {rotX,rotY,proj}=R3D;
    const R=Math.min(W,H)*.25;
    const cities=[
      {lat:6.5*Math.PI/180,  lon:3.4*Math.PI/180,   name:'Lagos',  col:'255,17,11', main:true},
      {lat:51.5*Math.PI/180, lon:-.1*Math.PI/180,   name:'London', col:'21,43,249'},
      {lat:40.7*Math.PI/180, lon:-74*Math.PI/180,   name:'NYC',    col:'21,43,249'},
      {lat:-33.9*Math.PI/180,lon:18.4*Math.PI/180,  name:'Cape Town',col:'21,43,249'},
      {lat:1.3*Math.PI/180,  lon:103.8*Math.PI/180, name:'Singapore',col:'21,43,249'},
      {lat:25.2*Math.PI/180, lon:55.3*Math.PI/180,  name:'Dubai',  col:'21,43,249'},
    ];
    const conns=[[0,1],[0,2],[0,3],[0,4],[0,5]];
    let ry=0;
    const linePts=[];
    conns.forEach(([a,b])=>{
      linePts.push({a:cities[a],b:cities[b],t:Math.random(),spd:Math.random()*.008+.004,col:cities[a].col});
    });
    (function draw(){
      ctx.clearRect(0,0,W,H);
      ctx.save();
      ctx.globalCompositeOperation='lighter';
      const cx=W/2,cy=H/2;
      const SEGS=50;
      /* Grid lines */
      for(let lat=-80;lat<=80;lat+=20){
        const latr=lat*Math.PI/180;
        ctx.beginPath();
        for(let j=0;j<=SEGS;j++){
          const lon=(j/SEGS)*Math.PI*2;
          let p={x:Math.cos(latr)*R*Math.cos(lon),y:Math.sin(latr)*R,z:Math.cos(latr)*R*Math.sin(lon)};
          p=rotY(p,ry);
          const pp=proj(p,FOV,cx,cy);
          if(!pp) continue;
          if(j===0) ctx.moveTo(pp.x,pp.y); else ctx.lineTo(pp.x,pp.y);
        }
        ctx.strokeStyle='rgba(21,43,249,.12)'; ctx.lineWidth=.5; ctx.stroke();
      }
      for(let lon=0;lon<360;lon+=20){
        const lonr=lon*Math.PI/180;
        ctx.beginPath();
        for(let i=0;i<=SEGS;i++){
          const latr=(i/SEGS)*Math.PI-Math.PI/2;
          let p={x:Math.cos(latr)*R*Math.cos(lonr),y:Math.sin(latr)*R,z:Math.cos(latr)*R*Math.sin(lonr)};
          p=rotY(p,ry);
          const pp=proj(p,FOV,cx,cy);
          if(!pp) continue;
          if(i===0) ctx.moveTo(pp.x,pp.y); else ctx.lineTo(pp.x,pp.y);
        }
        ctx.strokeStyle='rgba(21,43,249,.12)'; ctx.lineWidth=.5; ctx.stroke();
      }
      /* Connection arcs */
      conns.forEach(([ai,bi],ci)=>{
        const ca=cities[ai],cb=cities[bi];
        const lp=linePts[ci];
        lp.t+=lp.spd; if(lp.t>1) lp.t=0;
        /* Arc points */
        const ARC_PTS=40;
        for(let i=0;i<ARC_PTS;i++){
          const t1=i/ARC_PTS, t2=(i+1)/ARC_PTS;
          const lat1=ca.lat+(cb.lat-ca.lat)*t1;
          const lon1=ca.lon+(cb.lon-ca.lon)*t1;
          const lat2=ca.lat+(cb.lat-ca.lat)*t2;
          const lon2=ca.lon+(cb.lon-ca.lon)*t2;
          const arc=Math.sin(t1*Math.PI)*R*.4;
          const arc2=Math.sin(t2*Math.PI)*R*.4;
          let p1={x:Math.cos(lat1)*(R+arc)*Math.cos(lon1),y:Math.sin(lat1)*(R+arc),z:Math.cos(lat1)*(R+arc)*Math.sin(lon1)};
          let p2={x:Math.cos(lat2)*(R+arc2)*Math.cos(lon2),y:Math.sin(lat2)*(R+arc2),z:Math.cos(lat2)*(R+arc2)*Math.sin(lon2)};
          p1=rotY(p1,ry); p2=rotY(p2,ry);
          const pp1=proj(p1,FOV,cx,cy), pp2=proj(p2,FOV,cx,cy);
          if(!pp1||!pp2) continue;
          const inRange=Math.abs(t1-lp.t)<.15;
          const alpha=inRange?(.3+Math.cos((t1-lp.t)/0.15*Math.PI*.5)*.25):.04;
          ctx.beginPath(); ctx.moveTo(pp1.x,pp1.y); ctx.lineTo(pp2.x,pp2.y);
          ctx.strokeStyle=`rgba(21,43,249,${alpha})`;
          ctx.lineWidth=inRange?1.2:.4;
          if(inRange){ctx.shadowBlur=10;ctx.shadowColor='rgba(21,43,249,.8)';}
          else ctx.shadowBlur=0;
          ctx.stroke();
        }
      });
      /* City dots */
      cities.forEach(city=>{
        const lat=city.lat, lon=city.lon;
        let p={x:Math.cos(lat)*R*Math.cos(lon),y:Math.sin(lat)*R,z:Math.cos(lat)*R*Math.sin(lon)};
        p=rotY(p,ry);
        const pp=proj(p,FOV,cx,cy);
        if(!pp) return;
        const depth=(p.z-(-R))/(R*2);
        const sz=city.main?5:3;
        ctx.shadowBlur=city.main?25:12;
        ctx.shadowColor=`rgba(${city.col},1)`;
        ctx.beginPath(); ctx.arc(pp.x,pp.y,sz,0,Math.PI*2);
        ctx.fillStyle=`rgba(${city.col},${.5+depth*.5})`;
        ctx.fill();
        if(city.main){
          ctx.beginPath(); ctx.arc(pp.x,pp.y,sz*2.5,0,Math.PI*2);
          ctx.strokeStyle=`rgba(${city.col},.3)`; ctx.lineWidth=1; ctx.stroke();
        }
      });
      /* Core glow */
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,R*.7);
      g.addColorStop(0,'rgba(21,43,249,.07)'); g.addColorStop(1,'transparent');
      ctx.beginPath(); ctx.arc(cx,cy,R*.7,0,Math.PI*2);
      ctx.fillStyle=g; ctx.fill();
      ctx.restore();
      ry+=.005;
      requestAnimationFrame(draw);
    })();
  }

  /* ─── GEOMETRIC MINI-SHAPES (services page) ─── */
  document.querySelectorAll('[data-shape]').forEach(el => {
    const type=el.dataset.shape;
    const canvas=document.createElement('canvas');
    canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    el.style.position='relative';
    el.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    let W,H;
    const resize=()=>{ W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; };
    window.addEventListener('resize',resize); resize();
    const {rotX,rotY,rotZ,proj}=R3D;
    const R=Math.min(W,H)*.28;
    let rx=Math.random(),ry=Math.random(),rz=Math.random();
    const vrx=.005+Math.random()*.005, vry=.007+Math.random()*.007, vrz=.003;
    /* Shape verts/edges */
    let verts,edges;
    if(type==='cube'){
      const s=R*.8;
      verts=[[-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],[-s,-s,s],[s,-s,s],[s,s,s],[-s,s,s]].map(([x,y,z])=>({x,y,z}));
      edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    } else if(type==='tetra'){
      const s=R;
      verts=[{x:0,y:-s,z:0},{x:s*.94,y:s*.33,z:0},{x:-s*.47,y:s*.33,z:s*.82},{x:-s*.47,y:s*.33,z:-s*.82}];
      edges=[[0,1],[0,2],[0,3],[1,2],[2,3],[3,1]];
    } else {
      verts=ICO.verts.map(v=>({x:v.x*R*.9,y:v.y*R*.9,z:v.z*R*.9}));
      edges=ICO.edges;
    }
    const col=type==='cube'?'21,43,249':type==='tetra'?'255,17,11':'150,200,100';
    (function draw(){
      ctx.clearRect(0,0,W,H);
      const FOV=Math.min(W,H)*.9;
      rx+=vrx; ry+=vry; rz+=vrz;
      const tv=verts.map(v=>{let p={...v};p=rotX(p,rx);p=rotY(p,ry);return p;});
      const pv=tv.map(v=>proj(v,FOV,W/2,H/2));
      ctx.save(); ctx.globalCompositeOperation='lighter';
      edges.forEach(([a,b])=>{
        const pa=pv[a],pb=pv[b]; if(!pa||!pb) return;
        const depth=(tv[a].z+tv[b].z)/2;
        const dr=(depth-(-R))/(R*2);
        const grd=ctx.createLinearGradient(pa.x,pa.y,pb.x,pb.y);
        grd.addColorStop(0,`rgba(${col},${.15+dr*.5})`);
        grd.addColorStop(.5,`rgba(200,220,255,${.2+dr*.55})`);
        grd.addColorStop(1,`rgba(${col},${.15+dr*.5})`);
        ctx.shadowBlur=10; ctx.shadowColor=`rgba(${col},.9)`;
        ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y);
        ctx.strokeStyle=grd; ctx.lineWidth=.5+dr*1.3; ctx.stroke();
      });
      pv.forEach((p,i)=>{
        if(!p) return;
        const depth=(tv[i].z-(-R))/(R*2);
        ctx.shadowBlur=18; ctx.shadowColor=`rgba(${col},1)`;
        ctx.beginPath(); ctx.arc(p.x,p.y,1.5+depth*3.5,0,Math.PI*2);
        ctx.fillStyle=`rgba(200,220,255,${.4+depth*.6})`; ctx.fill();
      });
      ctx.restore();
      requestAnimationFrame(draw);
    })();
  });

})();
