(() => {
  'use strict';

  const STAR_COUNT = 7;
  const messages = [
    '⭐ You made my heart skip a beat.',
    '⭐ Then I started falling for you.',
    '⭐ Soon, I missed you every day.',
    '⭐ You quietly hacked into my heart.',
    '⭐ Distance only made me want you more.',
    '⭐ My heart keeps choosing you.',
    '⭐ One day, I want every birthday beside you.'
  ];
  const intro = document.querySelector('#kelvin-intro');
  const game = document.querySelector('#kelvin-game');
  const surprise = document.querySelector('#kelvin-surprise');
  const archiveLock = document.querySelector('#archive-lock');
  const stage = document.querySelector('#kelvin-stage');
  const canvas = document.querySelector('#kelvin-canvas');
  const ctx = canvas.getContext('2d');
  const score = document.querySelector('#kelvin-score');
  const topMessage = document.querySelector('#kelvin-message');
  const centerMessage = document.querySelector('#kelvin-center-message');
  const help = document.querySelector('#kelvin-help');
  const cakeScene = document.querySelector('#kelvin-cake-scene');
  const cake = document.querySelector('#kelvin-cake');
  const finale = document.querySelector('#kelvin-finale');
  const openLetter = document.querySelector('#kelvin-open-letter');
  const skyTitle = document.querySelector('#kelvin-sky-title');
  const wishInput = document.querySelector('#kelvin-wish');
  const blowButton = document.querySelector('#kelvin-blow');
  const blowHint = document.querySelector('#kelvin-blow-hint');
  const sendWishCheckbox = document.querySelector('#kelvin-send-wish');
  const wishStatus = document.querySelector('#kelvin-wish-status');
  const keys = new Set();
  const player = { x: 80, y: 0, width: 38, height: 42, vx: 0, vy: 0, grounded: true, airJumpUsed: false, facing: 1 };
  const worldWidth = 2920;
  let width = 0;
  let height = 0;
  let groundY = 0;
  let cameraX = 0;
  let stars = [];
  let platforms = [];
  let dust = [];
  let collected = 0;
  let running = false;
  let lastTime = 0;
  let animationFrame = 0;
  let finishQueued = false;

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const random = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);

  function buildLevel() {
    groundY = height - 30;
    platforms = [
      { x: 270, y: groundY - 78, w: 230, h: 22 },
      { x: 570, y: groundY - 132, w: 230, h: 22 },
      { x: 865, y: groundY - 82, w: 260, h: 22 },
      { x: 1200, y: groundY - 155, w: 240, h: 22 },
      { x: 1510, y: groundY - 90, w: 230, h: 22 },
      { x: 1810, y: groundY - 145, w: 260, h: 22 },
      { x: 2160, y: groundY - 80, w: 240, h: 22 },
      { x: 2470, y: groundY - 135, w: 250, h: 22 }
    ];
    stars = [
      { x: 385, y: groundY - 124 }, { x: 685, y: groundY - 179 },
      { x: 995, y: groundY - 128 }, { x: 1320, y: groundY - 202 },
      { x: 1625, y: groundY - 137 }, { x: 1940, y: groundY - 192 },
      { x: 2595, y: groundY - 182 }
    ].map((star, index) => ({ ...star, radius: 18, phase: index * .73, found: false }));
    player.x = 80; player.y = groundY - player.height; player.vx = 0; player.vy = 0; player.grounded = true; player.airJumpUsed = false;
  }

  function resizeGame() {
    const rect = stage.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (!running) buildLevel();
  }

  function starPath(context, x, y, outer, inner = outer * .45) {
    context.beginPath();
    for (let point = 0; point < 10; point += 1) {
      const radius = point % 2 ? inner : outer;
      const angle = -Math.PI / 2 + point * Math.PI / 5;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (!point) context.moveTo(px, py); else context.lineTo(px, py);
    }
    context.closePath();
  }

  function drawSky(time) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#111747'); gradient.addColorStop(.62, '#4a3271'); gradient.addColorStop(1, '#dd6f8d');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.globalAlpha = .16;
    ctx.fillStyle = '#fff';
    ctx.font = `900 ${clamp(width / 11.5, 28, 62)}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255, 163, 200, .75)';
    ctx.shadowBlur = 18;
    ctx.fillText('YANNIE ♥ KELVIN', width / 2, height * .25);
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,.65)';
    for (let index = 0; index < 42; index += 1) {
      const x = ((index * 137 - cameraX * .1) % (width + 80) + width + 80) % (width + 80) - 40;
      const y = 30 + ((index * 67) % Math.max(80, height * .55));
      const r = .6 + (index % 3) * .35 + Math.sin(time * .003 + index) * .15;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    for (let layer = 0; layer < 3; layer += 1) {
      ctx.fillStyle = ['#2a245b', '#211d4b', '#18163d'][layer];
      ctx.beginPath(); ctx.moveTo(0, groundY);
      for (let x = -80; x <= width + 100; x += 110) {
        const worldX = x + cameraX * (.15 + layer * .1);
        const peak = groundY - 90 - layer * 22 - Math.abs(Math.sin(worldX * .004)) * 90;
        ctx.lineTo(x + 55, peak); ctx.lineTo(x + 110, groundY);
      }
      ctx.closePath(); ctx.fill();
    }
  }

  function drawPlatform(platform) {
    const x = platform.x - cameraX;
    if (x > width + 40 || x + platform.w < -40) return;
    ctx.fillStyle = '#7b3f2b'; ctx.fillRect(x, platform.y, platform.w, platform.h);
    ctx.fillStyle = '#65b96e'; ctx.fillRect(x, platform.y, platform.w, 7);
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    for (let tile = 10; tile < platform.w; tile += 31) ctx.fillRect(x + tile, platform.y + 10, 15, 4);
  }

  function drawGround() {
    ctx.fillStyle = '#6f3827'; ctx.fillRect(0, groundY, width, height - groundY);
    ctx.fillStyle = '#63b66d'; ctx.fillRect(0, groundY, width, 8);
    ctx.fillStyle = '#4b251e';
    for (let x = -((cameraX * .75) % 34); x < width; x += 34) ctx.fillRect(x, groundY + 17, 18, 5);
  }

  function drawPig(time) {
    const x = player.x - cameraX + player.width / 2;
    const y = player.y + player.height / 2 + (player.grounded ? Math.sin(time * .014) * Math.min(1.5, Math.abs(player.vx) / 120) : 0);
    ctx.save(); ctx.translate(x, y); ctx.scale(player.facing, 1);
    ctx.shadowColor='rgba(255,124,174,.5)';ctx.shadowBlur=12;ctx.fillStyle='#ff91bd';
    ctx.beginPath();ctx.ellipse(0,2,18,17,0,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;ctx.fillStyle='#f67eaa';
    ctx.beginPath();ctx.moveTo(-14,-10);ctx.lineTo(-18,-21);ctx.lineTo(-6,-15);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(14,-10);ctx.lineTo(18,-21);ctx.lineTo(6,-15);ctx.closePath();ctx.fill();
    ctx.fillStyle='#3b2037';ctx.beginPath();ctx.arc(-7,-3,2.1,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(7,-3,2.1,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-7.6,-3.8,.75,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(6.4,-3.8,.75,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,70,135,.42)';ctx.beginPath();ctx.arc(-12,4,3.6,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(12,4,3.6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffb3cf';ctx.beginPath();ctx.ellipse(0,7,9,6.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#a84c74';ctx.beginPath();ctx.ellipse(-3,7,1.6,2.2,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(3,7,1.6,2.2,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#ff91bd';ctx.lineWidth=3;ctx.beginPath();ctx.arc(-20,8,6,Math.PI*.2,Math.PI*1.8);ctx.stroke();
    ctx.fillStyle='#dc6597';ctx.fillRect(-13,16,7,5);ctx.fillRect(6,16,7,5);
    ctx.fillStyle='#ffd166';ctx.beginPath();ctx.moveTo(-10,-16);ctx.lineTo(-3,-31);ctx.lineTo(5,-16);ctx.closePath();ctx.fill();ctx.fillStyle='#ff6f91';ctx.beginPath();ctx.arc(-3,-31,3,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }

  function drawStar(star, time) {
    if (star.found) return;
    const x = star.x - cameraX; if (x < -40 || x > width + 40) return;
    const y = star.y + Math.sin(time * .004 + star.phase) * 7;
    ctx.save();ctx.shadowColor='#ffd166';ctx.shadowBlur=22;ctx.fillStyle='#ffe27a';starPath(ctx,x,y,star.radius);ctx.fill();ctx.restore();
  }

  function showCollectedMessage(text) {
    topMessage.textContent = text; centerMessage.textContent = text;
    centerMessage.classList.remove('show'); void centerMessage.offsetWidth; centerMessage.classList.add('show');
  }

  function collectStars(time) {
    for (const star of stars) {
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;
      if (!star.found && Math.hypot(playerCenterX - star.x, playerCenterY - star.y) < 38) {
        star.found = true; collected += 1; score.textContent = `${collected} / ${STAR_COUNT}`;
        showCollectedMessage(messages[collected - 1]);
        if (navigator.vibrate) navigator.vibrate(35);
        for (let i=0;i<22;i+=1) dust.push({x:star.x,y:star.y,vx:random(-150,150),vy:random(-170,30),life:1});
        if (collected === STAR_COUNT && !finishQueued) { finishQueued = true; setTimeout(showCake, 2300); }
      }
    }
  }

  function updatePlayer(delta) {
    const acceleration = player.grounded ? 1500 : 900;
    if (keys.has('left')) { player.vx -= acceleration * delta; player.facing = -1; }
    if (keys.has('right')) { player.vx += acceleration * delta; player.facing = 1; }
    if (!keys.has('left') && !keys.has('right')) player.vx *= Math.pow(.0015, delta);
    player.vx = clamp(player.vx, -280, 280);
    player.vy += 1120 * delta;
    const previousBottom = player.y + player.height;
    player.x = clamp(player.x + player.vx * delta, 0, worldWidth - player.width);
    player.y += player.vy * delta; player.grounded = false;
    let landingY = groundY;
    for (const platform of platforms) {
      const overlaps = player.x + player.width > platform.x && player.x < platform.x + platform.w;
      if (overlaps && previousBottom <= platform.y + 7 && player.y + player.height >= platform.y && player.vy >= 0) landingY = Math.min(landingY, platform.y);
    }
    if (player.y + player.height >= landingY && previousBottom <= landingY + 7 && player.vy >= 0) {
      player.y = landingY - player.height; player.vy = 0; player.grounded = true; player.airJumpUsed = false;
    }
    if (player.y > height + 100) { player.y = groundY - player.height; player.x = Math.max(30, player.x - 160); player.vy = 0; }
    const desiredCamera = clamp(player.x - width * .34, 0, worldWidth - width);
    cameraX += (desiredCamera - cameraX) * Math.min(1, delta * 5);
  }

  function jump() {
    if (!running || (!player.grounded && player.airJumpUsed)) return;
    if (!player.grounded) player.airJumpUsed = true;
    player.vy = -590; player.grounded = false; help.classList.add('fade');
  }

  function drawDust(delta) {
    dust = dust.filter(particle => particle.life > 0);
    for (const particle of dust) {
      particle.x += particle.vx * delta; particle.y += particle.vy * delta; particle.vy += 210 * delta; particle.life -= delta * 1.25;
      ctx.globalAlpha=Math.max(0,particle.life);ctx.fillStyle=particle.life>.5?'#fff4b0':'#ff7ca3';ctx.fillRect(particle.x-cameraX,particle.y,5,5);
    }
    ctx.globalAlpha=1;
  }

  function gameLoop(time) {
    if (!running) return;
    const delta = Math.min((time - lastTime) / 1000 || 0, .034); lastTime = time;
    updatePlayer(delta); collectStars(time); drawSky(time); drawGround(); platforms.forEach(drawPlatform); stars.forEach(star => drawStar(star,time)); drawDust(delta); drawPig(time);
    animationFrame = requestAnimationFrame(gameLoop);
  }

  function startGame() {
    intro.hidden = true; game.hidden = false; collected = 0; finishQueued = false; cameraX = 0; dust = [];
    score.textContent = `0 / ${STAR_COUNT}`; topMessage.textContent = 'Run to the right and find every star ✦';
    requestAnimationFrame(() => { resizeGame(); buildLevel(); running = true; lastTime = performance.now(); animationFrame = requestAnimationFrame(gameLoop); });
    setTimeout(() => help.classList.add('fade'), 6000);
  }

  function showCake() {
    running = false; cancelAnimationFrame(animationFrame); game.hidden = true; surprise.hidden = false;
    const orbit = document.querySelector('#kelvin-star-orbit'); orbit.replaceChildren();
    for (let index=0;index<STAR_COUNT;index+=1) {
      const star=document.createElement('span');star.className='kelvin-star-piece';star.textContent='★';
      star.style.setProperty('--sx',`${random(-44,44)}vw`);star.style.setProperty('--sy',`${random(-38,38)}vh`);orbit.append(star);
    }
    try { const saved=localStorage.getItem('kelvin-birthday-wish'); if(saved) wishInput.value=saved; } catch (_) {}
  }

  const keyDirection = key => ({ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'})[key];
  window.addEventListener('keydown', event => {
    const direction=keyDirection(event.key);
    if (!game.hidden && (direction || ['ArrowUp','w','W',' '].includes(event.key))) event.preventDefault();
    if(direction) keys.add(direction); if(['ArrowUp','w','W',' '].includes(event.key)) jump();
  });
  window.addEventListener('keyup',event=>{const direction=keyDirection(event.key);if(direction)keys.delete(direction)});
  window.addEventListener('resize',()=>{if(!game.hidden)resizeGame()});
  document.querySelectorAll('.kelvin-controls button').forEach(button=>{
    const direction=button.dataset.direction;
    const press=event=>{event.preventDefault();if(direction==='jump')jump();else keys.add(direction);help.classList.add('fade')};
    const release=event=>{event.preventDefault();keys.delete(direction)};
    button.addEventListener('pointerdown',press);button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('pointerleave',release);
  });
  let swipeStart = null;
  canvas.addEventListener('pointerdown', event => { swipeStart = { x: event.clientX, y: event.clientY }; });
  canvas.addEventListener('pointerup', event => {
    if (!swipeStart) return;
    const horizontal = event.clientX - swipeStart.x;
    const vertical = event.clientY - swipeStart.y;
    if (vertical < -28 && Math.abs(vertical) > Math.abs(horizontal) * .75) jump();
    swipeStart = null;
  });
  canvas.addEventListener('pointercancel', () => { swipeStart = null; });
  document.querySelector('#kelvin-start').addEventListener('click',startGame);
  document.querySelector('#kelvin-skip').addEventListener('click',showCake);

  async function listenForBlow() {
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) return false;
    try {
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const audioContext=new (window.AudioContext||window.webkitAudioContext)();
      const analyser=audioContext.createAnalyser();analyser.fftSize=256;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      const data=new Uint8Array(analyser.frequencyBinCount);let loudFrames=0;
      blowButton.textContent='Blow gently now…';blowHint.textContent='Listening for your breath. Tap again if you prefer.';
      return await new Promise(resolve=>{
        const timeout=setTimeout(()=>finish(false),8000);
        const finish=detected=>{clearTimeout(timeout);stream.getTracks().forEach(track=>track.stop());audioContext.close();resolve(detected)};
        const sample=()=>{analyser.getByteFrequencyData(data);const level=data.slice(2,35).reduce((sum,value)=>sum+value,0)/33;loudFrames=level>38?loudFrames+1:0;if(loudFrames>4)finish(true);else if(stream.active)requestAnimationFrame(sample)};
        sample();
      });
    } catch (_) { return false; }
  }

  let blowing=false;
  async function submitWish() {
    const wish=wishInput.value.trim();
    if(!sendWishCheckbox.checked||!wish)return;
    wishStatus.textContent='Sending your wish privately…';
    try{
      const response=await fetch('https://yannie-waline-server.vercel.app/api/wish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({wish,consent:true})});
      if(!response.ok)throw new Error('send-failed');
      wishStatus.textContent='Your wish was delivered privately to Yannie ✦';
      sendWishCheckbox.disabled=true;
    }catch(_){wishStatus.textContent='The wish stayed on this device because delivery failed.'}
  }
  blowButton.addEventListener('click',async()=>{
    if(blowing){extinguishCandles();return} blowing=true;
    if(wishInput.value.trim()){try{localStorage.setItem('kelvin-birthday-wish',wishInput.value.trim())}catch(_){}}
    await submitWish();
    const detected=await listenForBlow();
    if(detected||blowing)extinguishCandles();
  });

  function extinguishCandles() {
    if(surprise.classList.contains('night'))return;
    cake.classList.add('candles-out');blowButton.disabled=true;blowHint.textContent='Wish made ✦';
    setTimeout(()=>{surprise.classList.add('night');cakeScene.classList.add('fade')},800);
    setTimeout(()=>{cakeScene.hidden=true;finale.hidden=false;launchTextFireworks()},1800);
  }

  function launchTextFireworks() {
    const fireworks=document.querySelector('#kelvin-fireworks');const fx=fireworks.getContext('2d');const rect=surprise.getBoundingClientRect();const ratio=Math.min(devicePixelRatio||1,2);
    fireworks.width=Math.round(rect.width*ratio);fireworks.height=Math.round(rect.height*ratio);fx.setTransform(ratio,0,0,ratio,0,0);
    const phrase='YANNIE ♥ KELVIN';const fontSize=Math.max(26,Math.min(76,rect.width/12.3));
    const buffer=document.createElement('canvas');buffer.width=Math.round(rect.width);buffer.height=Math.round(fontSize*1.7);const bx=buffer.getContext('2d');
    bx.font=`900 ${fontSize}px system-ui`;bx.textAlign='center';bx.textBaseline='middle';bx.fillStyle='#fff';bx.fillText(phrase,buffer.width/2,buffer.height/2);
    const pixels=bx.getImageData(0,0,buffer.width,buffer.height).data;const points=[];const step=rect.width<600?5:6;const textTop=rect.height*.31;
    for(let y=0;y<buffer.height;y+=step)for(let x=0;x<buffer.width;x+=step)if(pixels[(y*buffer.width+x)*4+3]>110)points.push({x,y:y+textTop});
    const particles=points.map((point,index)=>{const angle=index*.31+random(-.4,.4);const radius=random(Math.min(rect.width,rect.height)*.32,Math.max(rect.width,rect.height)*.72);return{sx:rect.width/2+Math.cos(angle)*radius,sy:rect.height*.43+Math.sin(angle)*radius*.62,tx:point.x,ty:point.y,angle,hue:[42,330,285][index%3],delay:random(.4,1.55)}});
    const meteors=Array.from({length:7},(_,index)=>({
      sx:index%2?-80:rect.width+80,sy:random(-100,rect.height*.2),
      tx:rect.width*(.2+index*.1),ty:rect.height*(.3+Math.sin(index)*.12),delay:index*.17
    }));
    const ambient=Array.from({length:24},()=>({x:random(-rect.width,rect.width),y:random(-rect.height,rect.height*.8),speed:random(120,260),delay:random(3.8,7.5),length:random(35,90)}));
    const start=performance.now();
    const ease=value=>1-Math.pow(1-value,3);
    function streak(x,y,length,alpha,hue=45){const gradient=fx.createLinearGradient(x-length,y-length*.55,x,y);gradient.addColorStop(0,'transparent');gradient.addColorStop(1,`hsla(${hue},100%,78%,${alpha})`);fx.strokeStyle=gradient;fx.lineWidth=2.2;fx.beginPath();fx.moveTo(x-length,y-length*.55);fx.lineTo(x,y);fx.stroke();fx.fillStyle=`hsla(${hue},100%,90%,${alpha})`;fx.beginPath();fx.arc(x,y,3.2,0,Math.PI*2);fx.fill()}
    function animate(now){
      const elapsed=(now-start)/1000;fx.clearRect(0,0,rect.width,rect.height);fx.globalCompositeOperation='lighter';
      for(const meteor of meteors){const local=clamp((elapsed-meteor.delay)/1.25,0,1);if(local<=0||local>=1)continue;const progress=ease(local);const x=meteor.sx+(meteor.tx-meteor.sx)*progress;const y=meteor.sy+(meteor.ty-meteor.sy)*progress;streak(x,y,75,Math.sin(local*Math.PI),45)}
      for(const meteor of ambient){const local=elapsed-meteor.delay;if(local<0||local>1.5)continue;const x=meteor.x+local*meteor.speed;const y=meteor.y+local*meteor.speed*.55;streak(x,y,meteor.length,Math.sin(local/1.5*Math.PI)*.55,285)}
      for(const particle of particles){const local=clamp((elapsed-particle.delay)/2.65,0,1);if(local<=0)continue;const progress=ease(local);const spiral=(1-progress)*44;const x=particle.sx+(particle.tx-particle.sx)*progress+Math.cos(particle.angle+progress*9)*spiral;const y=particle.sy+(particle.ty-particle.sy)*progress+Math.sin(particle.angle+progress*9)*spiral*.55;const particleAlpha=Math.min(1,local*1.6)*clamp((4.55-elapsed)/.65,0,1);fx.shadowColor=`hsl(${particle.hue},100%,70%)`;fx.shadowBlur=local>.88?7:3;fx.fillStyle=`hsla(${particle.hue},100%,80%,${particleAlpha})`;fx.beginPath();fx.arc(x,y,local>.9?2.1:1.45,0,Math.PI*2);fx.fill()}
      fx.shadowBlur=0;fx.globalCompositeOperation='source-over';if(elapsed<9)requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate);
    setTimeout(()=>{skyTitle.hidden=false},3900);
    setTimeout(()=>{openLetter.hidden=false},6500);
  }

  openLetter.addEventListener('click',()=>{surprise.hidden=true;skyTitle.hidden=true;archiveLock.hidden=false;document.querySelector('#archive-password').focus()});

  const AUTH_DATA=new TextEncoder().encode('private-archive-v1');
  const form=document.querySelector('#archive-form');const passwordInput=document.querySelector('#archive-password');const status=document.querySelector('#archive-status');const entriesContainer=document.querySelector('#archive-entries');
  const decodeBase64=value=>Uint8Array.from(atob(value),character=>character.charCodeAt(0));
  function renderEntries(entries){entriesContainer.replaceChildren();for(const entry of entries){const article=document.createElement('article');article.className='archive-entry';const heading=document.createElement('h2');heading.textContent=entry.title;const time=document.createElement('time');time.dateTime=entry.createdAt;time.textContent=new Intl.DateTimeFormat(undefined,{dateStyle:'long'}).format(new Date(entry.createdAt));const body=document.createElement('div');body.className='archive-entry-body';body.textContent=entry.body;article.append(heading,time,body);entriesContainer.append(article)}archiveLock.hidden=true;entriesContainer.hidden=false}
  async function unlock(password){if(!window.isSecureContext||!window.crypto?.subtle)throw new Error('secure-context');const response=await fetch('/assets/data/archive.json',{cache:'no-store'});if(!response.ok)throw new Error('archive-unavailable');const documentData=await response.json();if(documentData.empty)throw new Error('archive-empty');const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);const key=await crypto.subtle.deriveKey({name:'PBKDF2',hash:documentData.kdf.hash,salt:decodeBase64(documentData.kdf.salt),iterations:documentData.kdf.iterations},material,{name:'AES-GCM',length:256},false,['decrypt']);const plaintext=await crypto.subtle.decrypt({name:'AES-GCM',iv:decodeBase64(documentData.cipher.iv),additionalData:AUTH_DATA,tagLength:documentData.cipher.tagLength},key,decodeBase64(documentData.ciphertext));return JSON.parse(new TextDecoder().decode(plaintext))}
  form.addEventListener('submit',async event=>{event.preventDefault();status.textContent='Unlocking…';try{renderEntries(await unlock(passwordInput.value));passwordInput.value=''}catch(error){status.textContent=error.message==='archive-empty'?'The archive has not been initialized yet.':error.message==='secure-context'?'Encrypted archives require HTTPS. Please reopen this page using https://.':'Unable to unlock the archive. Check the passphrase and try again.'}});
})();
