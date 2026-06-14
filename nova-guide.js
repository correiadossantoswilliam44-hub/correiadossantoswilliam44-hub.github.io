/* ============================================================================
   Nova Guide — the site's AI receptionist, shared across every page.
   One engine for: opt-in voice narration (hybrid: cinematic /voice/*.mp3 through
   a Blade-Runner reverb chain when present, else the browser voice) + a
   holographic point-cloud head that materializes while it speaks and follows
   the visitor page to page (on/off lives in localStorage 'nova-voice').

   Include on any page:
     <script type="importmap"> … three + three/addons/ … </script>
     <script src="/nova-guide.js" data-page="main"></script>
   data-page ∈ main | demo | about | getstarted | demo2
   Head scan: "Lee Perry-Smith" by Infinite Realities (ir-ltd.net), CC-BY 3.0.
   ========================================================================== */
(function(){
  var SCRIPT = document.currentScript;
  var PAGE = (SCRIPT && SCRIPT.dataset && SCRIPT.dataset.page) || 'main';

  // ---- per-page script: greeting + lines that fire as sections scroll in ----
  var PAGES = {
    main: {
      greeting:'greeting',
      lines:{
        greeting:"You've reached Supernova. I'm the receptionist that never sleeps. Scroll — and I'll show you what I catch while you're gone.",
        phases:"Five phases. One supernova. Every business is a star, waiting to ignite.",
        built:"Built for the trades that build America. Tap any trade, and walk through a live demo.",
        services:"A custom website, live in forty-eight hours. And me — answering every call you can't.",
        work:"Real work, real clients. The day you sign on, we build yours.",
        "demo-call":"Want proof? Call me, right now. I answer in one ring.",
        pricing:"One flat fee for a site you own forever. I'm one ninety-nine a month — and I never take a day off.",
        contact:"Ready to ignite? Tell me about your business — your free preview lands in forty-eight hours."
      },
      sections:[ ['phases','phases'],['built','built'],['services','services'],['work','work'],['demo-call','demo-call'],['pricing','pricing'],['contact','contact'] ]
    },
    demo: {
      greeting:'demo-greeting',
      lines:{
        'demo-greeting':"This whole site? Yours in forty-eight hours — with me on your phones, answering the calls you miss and booking the jobs. That's how you land more clients. Scroll — I'll show you.",
        'demo-services':"Your services, front and center — so Google finds you, and customers pick you.",
        'demo-why':"While you're on a job, I'm on the phones. Every missed call becomes a booked one.",
        'demo-reviews':"Happy customers leave reviews. Reviews bring the next one. The cycle feeds itself.",
        'demo-book':"Like what you see? One flat fee — live in forty-eight hours. Or call the number, and ask me yourself."
      },
      sections:[ ['services','demo-services'],['why','demo-why'],['reviews','demo-reviews'],['book','demo-book'] ]
    },
    about: {
      greeting:'about-greeting',
      lines:{
        'about-greeting':"I'm Nova — and William built me to make sure your business never misses another call. Scroll, and meet the human behind me.",
        'about-cta':"Ready when you are. Book a free call — and let's light your business up."
      },
      sections:[ ['.cta','about-cta'] ]
    },
    getstarted: {
      greeting:'gs-greeting',
      lines:{ 'gs-greeting':"Smart move. Tell me about your business below, and your free preview lands within forty-eight hours. I'll take it from here." },
      sections:[]
    },
    demo2: {
      greeting:'d2-greeting',
      lines:{ 'd2-greeting':"This is every call I caught while the owner was busy. Each one's a customer that didn't slip away. Imagine this, for your shop." },
      sections:[]
    }
  };
  var CFG = PAGES[PAGE] || PAGES.main;
  var LINES = CFG.lines;

  // ---- inject styles (idempotent) ----
  if(!document.getElementById('nova-guide-css')){
    var css=document.createElement('style'); css.id='nova-guide-css';
    css.textContent =
      '#ng-holo-wrap{position:fixed;right:22px;bottom:86px;z-index:44;width:min(340px,32vw);aspect-ratio:1;pointer-events:none;opacity:0;transition:opacity .7s cubic-bezier(.16,1,.3,1)}'+
      '#ng-holo-wrap.live{opacity:1}'+
      '#ng-holo-wrap::before{content:"";position:absolute;inset:-10% -8% -4% -8%;z-index:-1;border-radius:50%;background:radial-gradient(60% 60% at 50% 46%,rgba(2,5,16,.85),rgba(2,5,16,.5) 50%,transparent 76%)}'+
      '#ng-holo-wrap::after{content:"";position:absolute;left:50%;bottom:-34px;width:58%;height:64px;transform:translateX(-50%);background:radial-gradient(50% 100% at 50% 0%,rgba(80,200,255,.28),transparent 72%);filter:blur(2px);animation:ngbeam 3.4s ease-in-out infinite}'+
      '@keyframes ngbeam{0%,100%{opacity:.7}43%{opacity:1}61%{opacity:.5}}'+
      '#ng-holo{width:100%;height:100%;display:block}'+
      '#ng-fab{position:fixed;right:18px;bottom:18px;z-index:47;width:46px;height:46px;border-radius:50%;display:none;place-items:center;border:1px solid rgba(255,255,255,.16);background:rgba(7,10,24,.85);color:#9aa6c8;cursor:pointer;backdrop-filter:blur(10px);transition:color .25s,border-color .25s,transform .25s cubic-bezier(.16,1,.3,1)}'+
      '#ng-fab.show{display:grid}#ng-fab:hover{transform:translateY(-2px);color:#eef2ff}'+
      '#ng-fab.on{color:#ffd76b;border-color:rgba(255,215,107,.5);box-shadow:0 0 18px rgba(255,215,107,.25)}'+
      '#ng-fab svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'+
      '@media(max-width:700px){#ng-holo-wrap{width:148px;right:6px;bottom:150px}}'+
      '@media(prefers-reduced-motion:reduce){#ng-holo-wrap{display:none}}';
    document.head.appendChild(css);
  }

  // ---- ensure markup: hologram canvas + (if the page has no pill) a launcher fab ----
  var holoWrap=document.getElementById('holoWrap')||document.getElementById('ng-holo-wrap');
  if(!holoWrap){
    holoWrap=document.createElement('div'); holoWrap.id='ng-holo-wrap'; holoWrap.setAttribute('aria-hidden','true');
    holoWrap.innerHTML='<canvas id="ng-holo"></canvas>';
    document.body.appendChild(holoWrap);
  }
  var holoCanvas=holoWrap.querySelector('canvas');

  var pills=[].slice.call(document.querySelectorAll('#voicePill,#vgPill,[data-nova-toggle]'));
  var fabs =[].slice.call(document.querySelectorAll('#voiceFab,#vgFab'));
  var hasPill=pills.length>0;
  if(!hasPill){
    var f=document.createElement('button'); f.id='ng-fab'; f.setAttribute('aria-pressed','false');
    f.setAttribute('aria-label','Play the AI guide');
    f.innerHTML='<svg viewBox="0 0 24 24"><path d="M11 5 6.5 9H3v6h3.5L11 19z"/><path d="M15 9.5a4 4 0 0 1 0 5"/><path d="M17.5 7a8 8 0 0 1 0 10"/></svg>';
    document.body.appendChild(f); fabs.push(f);
  }

  // ============================ VOICE ENGINE ==============================
  var level=0; window.__novaVoiceLevel=function(){ return level; };
  var enabled=false, ctx=null, analyser=null, useFiles=false, buffers={}, spoken={},
      curSrc=null, curUtter=null, fakeTimer=0, fft=null, holoBooted=false;
  window.__novaVoiceSpeaking=function(){ return !!(curSrc||curUtter); };

  fetch('/voice/'+CFG.greeting+'.mp3',{method:'HEAD'}).then(function(r){ useFiles=!!r.ok; }).catch(function(){});

  function makeIR(c,secs,decay){
    var rate=c.sampleRate, len=Math.floor(rate*secs), ir=c.createBuffer(2,len,rate);
    for(var ch=0;ch<2;ch++){ var d=ir.getChannelData(ch);
      for(var i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay); }
    return ir;
  }
  function initCtx(){
    if(ctx) return;
    var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    ctx=new AC();
    var master=ctx.createGain(); master.gain.value=.9;
    analyser=ctx.createAnalyser(); analyser.fftSize=512;
    var convolver=ctx.createConvolver(); convolver.buffer=makeIR(ctx,2.6,3.2);
    var wet=ctx.createGain(); wet.gain.value=.55;
    var dry=ctx.createGain(); dry.gain.value=.75;
    var dl=ctx.createDelay(1); dl.delayTime.value=.27;
    var fb=ctx.createGain(); fb.gain.value=.3; dl.connect(fb); fb.connect(dl);
    convolver.connect(wet); wet.connect(master); dl.connect(master); dry.connect(master);
    master.connect(analyser); analyser.connect(ctx.destination);
    ctx.__in=function(node){ node.connect(dry); node.connect(convolver); node.connect(dl); };
    if('speechSynthesis' in window) speechSynthesis.getVoices();
  }
  function pump(){
    if(!analyser || !curSrc){ if(!curUtter) level=0; return; }
    fft=fft||new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(fft);
    var s=0; for(var i=2;i<40;i++) s+=fft[i];
    level=Math.min(1,s/(38*140));
    requestAnimationFrame(pump);
  }
  function fakePump(){
    if(!curUtter){ level=0; return; }
    var t=performance.now()/1000;
    level=.22+.42*Math.abs(Math.sin(t*7.3))*(.6+.4*Math.sin(t*2.1));
    fakeTimer=requestAnimationFrame(fakePump);
  }
  function stop(){
    if(curSrc){ try{curSrc.stop();}catch(e){} curSrc=null; }
    if('speechSynthesis' in window) speechSynthesis.cancel();
    if(fakeTimer){ cancelAnimationFrame(fakeTimer); fakeTimer=0; }
    curUtter=null; level=0;
  }
  function pickVoice(){
    // Prefer a confident FEMALE voice (the brand voice). The real voice is the
    // ElevenLabs file when present; this only steers the browser fallback.
    var vs=speechSynthesis.getVoices(), best=null, femaleFallback=null,
        want=['samantha','victoria','serena','aria','jenny','michelle','sonia',
              'google uk english female','zira','karen','moira','tessa','fiona','female'],
        male=/(guy|daniel|david|mark|alex|fred|male|george|james|aaron|arthur|oliver)/;
    for(var i=0;i<vs.length;i++){ var v=vs[i];
      if((v.lang||'').indexOf('en')!==0) continue;
      if(!best) best=v;
      var n=v.name.toLowerCase();
      if(!femaleFallback && !male.test(n)) femaleFallback=v;
      for(var j=0;j<want.length;j++) if(n.indexOf(want[j])>-1) return v;
    }
    return femaleFallback||best;
  }
  function speakSynth(id){
    if(!('speechSynthesis' in window)) return;
    var u=new SpeechSynthesisUtterance(LINES[id]);
    var v=pickVoice(); if(v) u.voice=v;
    u.rate=.92; u.pitch=.85;
    u.onend=u.onerror=function(){ if(curUtter===u){ curUtter=null; level=0; } };
    curUtter=u; speechSynthesis.speak(u); fakePump();
  }
  function speak(id){
    if(!enabled || !LINES[id] || spoken[id]) return;
    spoken[id]=true; stop();
    if(useFiles && ctx){
      var go=function(buf){ var src=ctx.createBufferSource(); src.buffer=buf; ctx.__in(src);
        curSrc=src; src.onended=function(){ if(curSrc===src){ curSrc=null; level=0; } };
        src.start(); pump(); };
      if(buffers[id]) return go(buffers[id]);
      fetch('/voice/'+id+'.mp3').then(function(r){ if(!r.ok) throw 0; return r.arrayBuffer(); })
        .then(function(ab){ return ctx.decodeAudioData(ab); })
        .then(function(buf){ buffers[id]=buf; go(buf); })
        .catch(function(){ speakSynth(id); });
    } else speakSynth(id);
  }

  // ---- UI sync ----
  function pref(){ try{ return localStorage.getItem('nova-voice'); }catch(e){ return null; } }
  function setUI(){
    var p=pref();
    pills.forEach(function(el){
      el.setAttribute('aria-pressed',String(enabled)); el.classList.toggle('on',enabled);
      var t=el.querySelector('.vp-t,.vg-t');
      if(t) t.textContent = enabled ? (PAGE==='demo'?'Tour on — mute':'AI guide on — tap to mute')
                                    : (PAGE==='demo'?'AI tour':'Let the AI introduce itself');
    });
    fabs.forEach(function(el){
      var show = enabled || !!p || !hasPill;     // launcher fab on page w/o pill is always visible
      el.classList.toggle('show',show); el.classList.toggle('on',enabled);
      el.setAttribute('aria-pressed',String(enabled));
      el.setAttribute('aria-label',enabled?'Mute AI guide':'Unmute AI guide');
    });
  }
  function setEnabled(on,fromUser){
    enabled=on;
    try{ localStorage.setItem('nova-voice',on?'on':'off'); }catch(e){}
    if(on){ initCtx(); if(ctx&&ctx.state==='suspended') ctx.resume(); bootHolo(); if(fromUser) speak(CFG.greeting); }
    else stop();
    setUI();
  }
  pills.concat(fabs).forEach(function(el){ el.addEventListener('click',function(){ setEnabled(!enabled,true); }); });

  // Returning visitor (left it on): arm on first tap — page w/ pill skips greeting replay,
  // page w/o pill (about/forms) re-greets so the guide clearly "followed" them here.
  if(pref()==='on'){
    addEventListener('pointerdown',function(){
      if(!enabled){ if(hasPill) spoken[CFG.greeting]=true; setEnabled(true,!hasPill); }
    },{once:true,passive:true});
    bootHolo();   // pre-warm the head so it's ready the instant they speak
  }
  setUI();

  // ---- scroll narration ----
  if('IntersectionObserver' in window && CFG.sections.length){
    var io=new IntersectionObserver(function(es){ es.forEach(function(en){
      var id=en.target.getAttribute('data-ng-line'); if(en.isIntersecting&&id) speak(id);
    }); },{threshold:.25});
    CFG.sections.forEach(function(pair){
      var sel=pair[0], id=pair[1];
      var el = sel.charAt(0)==='.'||sel.charAt(0)==='#' ? document.querySelector(sel) : document.getElementById(sel);
      if(el){ el.setAttribute('data-ng-line',id); io.observe(el); }
    });
  }
  document.addEventListener('visibilitychange',function(){ if(document.hidden) stop(); });

  // ============================ HOLOGRAM HEAD =============================
  // If /holo-face.(png|jpg|webp) exists, render it as an animated hologram —
  // chromatic flicker, scanlines, materialize dissolve, audio-reactive glow —
  // on a plane, with a parallax bokeh/particle layer + HUD ring for real depth.
  // Until that image is dropped in, fall back to the procedural point-cloud head.
  function bootHolo(){
    if(holoBooted) return; holoBooted=true;
    var reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
    var save = !!(navigator.connection && navigator.connection.saveData);
    if(reduced || save) return;
    var IMGS=[]; var custom=SCRIPT&&SCRIPT.dataset&&SCRIPT.dataset.holoImg;
    if(custom) IMGS.push(custom);
    IMGS.push('/holo-face.webp','/holo-face.png','/holo-face.jpg');
    (async function(){
      try{
        var THREE = await import('three');
        var phone = innerWidth < 700;
        var SIZE = phone ? Math.min(150, innerWidth*0.42) : Math.min(340, innerWidth*0.32);
        var DPR = Math.min(devicePixelRatio, phone ? 1.5 : 2);
        var renderer = new THREE.WebGLRenderer({ canvas:holoCanvas, alpha:true, antialias:true });
        renderer.setPixelRatio(DPR); renderer.setSize(SIZE,SIZE);
        if('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
        var scene = new THREE.Scene();
        var cam = new THREE.PerspectiveCamera(32,1,.1,50); cam.position.set(0,.1,9);
        var uni = { uTime:{value:0}, uLevel:{value:0}, uOn:{value:0}, uPix:{value:SIZE*DPR} };

        var tx=0,ty=0,px=0,py=0;
        addEventListener('pointermove',function(e){ tx=e.clientX/innerWidth-.5; ty=e.clientY/innerHeight-.5; },{passive:true});
        if(window.DeviceOrientationEvent) addEventListener('deviceorientation',function(e){
          if(e.gamma!=null){ tx=Math.max(-.6,Math.min(.6,e.gamma/45)); ty=Math.max(-.6,Math.min(.6,(e.beta-40)/45)); }
        },{passive:true});

        function ringPoints(){
          var RN=phone?160:240, RP=[],RS=[];
          for(var k=0;k<RN;k++){ if(k%7===0) continue; var a=k/RN*Math.PI*2, r=3.15+(k%2)*.12;
            RP.push(Math.cos(a)*r, Math.sin(a)*r*.62, 0); RS.push(Math.random()); }
          var g=new THREE.BufferGeometry();
          g.setAttribute('position',new THREE.Float32BufferAttribute(RP,3));
          g.setAttribute('aSeed',new THREE.Float32BufferAttribute(RS,1));
          return new THREE.Points(g, new THREE.ShaderMaterial({
            uniforms:uni, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
            vertexShader:`uniform float uOn,uLevel,uPix; attribute float aSeed; varying float vS;
              void main(){ vS=aSeed; vec4 mv=modelViewMatrix*vec4(position,1.0);
              float ap=smoothstep(uOn*1.1,uOn*1.1-.2,aSeed);
              gl_PointSize=max((1.0+2.0*aSeed)*(1.0+uLevel*.6)*ap*uPix*.012/max(-mv.z,.1),0.0);
              gl_Position=projectionMatrix*mv; }`,
            fragmentShader:`precision highp float; uniform float uOn,uLevel; varying float vS;
              void main(){ float d=length(gl_PointCoord-.5); float disc=smoothstep(.5,.0,d);
              gl_FragColor=vec4(vec3(.4,.85,1.0)*(1.4+uLevel),disc*uOn*(.4+.6*vS)); }`
          }));
        }

        // Renders the face IMAGE or, if a talking-head VIDEO was provided, the video
        // (real mouth/eye/head movement). vid is null for a still image. The image
        // already carries its own ring + bokeh, so we add NO extra particles here —
        // just a calm hologram shimmer, a dark backing (CSS), breathing + head sway.
        function buildImage(tex, vid){
          tex.colorSpace=THREE.SRGBColorSpace;
          var iw = vid ? (vid.videoWidth||16) : ((tex.image&&tex.image.width)||16);
          var ih = vid ? (vid.videoHeight||9) : ((tex.image&&tex.image.height)||9);
          var aspect=iw/ih;
          var group=new THREE.Group(); scene.add(group);
          var plane=new THREE.Mesh(new THREE.PlaneGeometry(aspect,1), new THREE.ShaderMaterial({
            uniforms:Object.assign({uTex:{value:tex}}, uni), transparent:true, depthWrite:false,
            vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader:`precision highp float; uniform sampler2D uTex; uniform float uTime,uOn,uLevel; varying vec2 vUv;
              float hsh(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
              void main(){
                vec2 uv=vUv;
                float ca=.0013*(1.0+uLevel*1.6);                 // subtle chroma (was harsh/noisy)
                vec3 c; c.r=texture2D(uTex,uv+vec2(ca,0.)).r; c.g=texture2D(uTex,uv).g; c.b=texture2D(uTex,uv-vec2(ca,0.)).b;
                float lum=dot(c,vec3(.299,.587,.114));
                vec3 col=mix(c, vec3(.42,.86,1.2)*lum*1.22, .20);  // gentle cyan grade, keep the render's detail
                col+=vec3(.07,.32,.58)*lum*uLevel;                // glow swells with the voice
                float scan=.94+.06*sin(uv.y*430.0);               // faint scanlines
                float band=.96+.04*sin(uv.y*8.0-uTime*2.2);
                float flick=.965+.035*sin(uTime*36.0)*sin(uTime*22.0);
                float blink=1.0-.5*step(.9965,hsh(vec2(floor(uTime*11.0),3.0)));  // rare hologram-blink dip
                col*=scan*band*flick*blink;
                float a=smoothstep(.05,.26,lum);                  // dark bg keyed out -> floats
                a*=smoothstep(uOn*1.1,uOn*1.1-.2,hsh(floor(uv*120.0)));  // materialize
                a*=uOn; if(a<.004) discard;
                gl_FragColor=vec4(col*(1.0+uLevel*.5), a);
              }`
          }));
          var visH=2.0*Math.tan(cam.fov*Math.PI/360)*cam.position.z;
          var s=Math.min(visH/aspect, visH)*0.98; plane.scale.set(s,s,1); group.add(plane);
          scene.userData.update=function(t,_px,_py){
            var sp = window.__novaVoiceSpeaking && window.__novaVoiceSpeaking();
            group.rotation.y = _px*.32 + Math.sin(t*.5)*.045;     // pointer/tilt sway + idle drift
            group.rotation.x = -_py*.2 + Math.sin(t*.37)*.022;
            group.scale.setScalar(1 + Math.sin(t*1.05)*.012 + uni.uLevel.value*.045);  // breathing + speech swell
            group.position.x = _px*.35;
            group.position.y = Math.sin(t*.6)*.035 - _py*.2;
            if(vid){                                              // talking-head video: play while speaking, freeze when idle
              if(sp && uni.uOn.value>.25){ if(vid.paused){ var pr=vid.play(); if(pr&&pr.catch) pr.catch(function(){}); } }
              else if(!vid.paused){ vid.pause(); }
            }
          };
        }

        async function buildPoints(){
          var GL=await import('three/addons/loaders/GLTFLoader.js');
          var headMat=new THREE.ShaderMaterial({
            uniforms:uni, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
            vertexShader:`uniform float uTime,uOn,uLevel,uPix; attribute vec3 aNormal; attribute float aSeed;
              varying float vFres,vSeed,vGone; varying vec3 vW;
              float h(float n){return fract(sin(n)*43758.5453);}
              void main(){ vSeed=aSeed; vec3 p=position;
                float band=floor((p.y+2.0)*7.0); float g=step(.97,h(band+floor(uTime*8.0)));
                p.x+=g*(h(band*1.7+floor(uTime*8.0))-.5)*.35;
                p+=aNormal*(h(aSeed*97.0+floor(uTime*26.0))-.5)*.06*uLevel;
                vec3 vn=normalize(normalMatrix*aNormal); vFres=pow(1.0-abs(vn.z),1.5);
                vec4 w=modelMatrix*vec4(p,1.0); vW=w.xyz; vec4 mv=viewMatrix*w;
                float node=step(.975,aSeed); float twk=.8+.35*sin(uTime*3.0+aSeed*42.0);
                float appear=smoothstep(uOn*1.12,uOn*1.12-.18,aSeed); vGone=1.0-appear;
                float size=(.8+1.1*vFres+node*3.2)*twk*(1.0+uLevel*.9)*appear;
                gl_PointSize=max(size*uPix*.016/max(-mv.z,.1),0.0); gl_Position=projectionMatrix*mv; }`,
            fragmentShader:`precision highp float; uniform float uTime,uLevel,uOn;
              varying float vFres,vSeed,vGone; varying vec3 vW;
              void main(){ if(vGone>.995) discard;
                float d=length(gl_PointCoord-.5); float disc=smoothstep(.5,.0,d);
                float node=step(.975,vSeed);
                float scan=.65+.35*sin(vW.y*9.0-uTime*4.0);
                float flick=.9+.1*sin(uTime*41.0)*sin(uTime*27.3);
                vec3 cyan=vec3(.30,.80,1.0),deep=vec3(.10,.45,1.0);
                vec3 col=mix(deep,cyan,vFres); col=mix(col,vec3(.85,.97,1.0),node*.9);
                float a=disc*(.55+.9*vFres+node*1.3)*scan*flick*uOn;
                gl_FragColor=vec4(col*(1.3+uLevel*.9+node*1.5),a); }`
          });
          var gltf=await new GL.GLTFLoader().loadAsync('/holo-head.glb');
          var src=null; gltf.scene.traverse(function(o){ if(o.isMesh&&!src) src=o; });
          var pos=src.geometry.attributes.position, nrm=src.geometry.attributes.normal;
          var CAP=phone?12000:26000, total=pos.count, stride=total>CAP?Math.ceil(total/CAP):1;
          var P=[],N=[],S=[];
          for(var i=0;i<total;i+=stride){ P.push(pos.getX(i),pos.getY(i),pos.getZ(i));
            if(nrm) N.push(nrm.getX(i),nrm.getY(i),nrm.getZ(i)); else N.push(0,0,1); S.push(Math.random()); }
          var hg=new THREE.BufferGeometry();
          hg.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
          hg.setAttribute('aNormal',new THREE.Float32BufferAttribute(N,3));
          hg.setAttribute('aSeed',new THREE.Float32BufferAttribute(S,1));
          hg.center(); hg.computeBoundingBox();
          var sz=new THREE.Vector3(); hg.boundingBox.getSize(sz);
          var head=new THREE.Points(hg,headMat); head.scale.setScalar(4.7/sz.y); scene.add(head);
          var ring=ringPoints(); ring.position.set(.4,-.1,-1.1); ring.rotation.x=.9; scene.add(ring);
          scene.userData.update=function(t,_px,_py){
            head.rotation.y=Math.sin(t*.4)*.32+_px*.3;
            head.rotation.x=Math.sin(t*.23)*.07+uni.uLevel.value*.05-_py*.2;
            ring.rotation.z=t*.25; };
        }

        // 1) talking-head VIDEO (real lip-sync) if present, else 2) the still face image,
        //    else 3) the procedural point cloud.
        var built=false;
        var VIDS=['/holo-face.webm','/holo-face.mp4'];
        for(var vi=0; vi<VIDS.length && !built; vi++){
          var vid=document.createElement('video');
          vid.muted=true; vid.loop=true; vid.playsInline=true; vid.setAttribute('playsinline',''); vid.preload='auto';
          var ok=await new Promise(function(res){ var done=false;
            vid.addEventListener('loadeddata',function(){ if(!done){done=true;res(true);} },{once:true});
            vid.addEventListener('error',function(){ if(!done){done=true;res(false);} },{once:true});
            vid.src=VIDS[vi]; vid.load();
          });
          if(ok){ buildImage(new THREE.VideoTexture(vid), vid); built=true; }
        }
        if(!built){
          var tex=null;
          for(var ii=0; ii<IMGS.length && !tex; ii++){ try{ tex=await new THREE.TextureLoader().loadAsync(IMGS[ii]); }catch(e){} }
          if(tex) buildImage(tex, null); else await buildPoints();
        }

        var clock=new THREE.Clock(), on=0;
        (function loop(){
          requestAnimationFrame(loop);
          var t=clock.getElapsedTime();
          var speaking=window.__novaVoiceSpeaking && window.__novaVoiceSpeaking();
          var lvl=window.__novaVoiceLevel ? window.__novaVoiceLevel() : 0;
          on += ((speaking?1:0)-on)*(speaking?.06:.022);
          uni.uOn.value=on; uni.uTime.value=t; uni.uLevel.value += (lvl-uni.uLevel.value)*.3;
          px+=(tx-px)*.06; py+=(ty-py)*.06;
          if(scene.userData.update) scene.userData.update(t,px,py);
          holoWrap.classList.toggle('live', on>.02);
          if(on>.01 && !document.hidden) renderer.render(scene,cam);
        })();
      }catch(e){ console.warn('Hologram unavailable:',e); }
    })();
  }
})();