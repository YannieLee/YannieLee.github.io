(() => {
  'use strict';

  const STAR_COUNT = 7;
  const messages = [
    'You make ordinary days feel special.',
    'Your smile is one of my favourite places.',
    'Thank you for every little moment.',
    'Life is brighter with you in it.',
    'You make my world feel warmer.',
    'You are my favourite adventure.',
    'Happy birthday, my favourite human. ♡'
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
  const wishInput = document.querySelector('#kelvin-wish');
  const blowButton = document.querySelector('#kelvin-blow');
  const blowHint = document.querySelector('#kelvin-blow-hint');
  const keys = new Set();
  const player = { x: 80, y: 0, width: 38, height: 42, vx: 0, vy: 0, grounded: false, facing: 1 };
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

  const birthdayParts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date()).reduce((value, part) => { if (part.type !== 'literal') value[part.type] = part.value; return value; }, {});
  const isBirthday = birthdayParts.month === '08' && birthdayParts.day === '01';
  if (isBirthday) { archiveLock.hidden = true; intro.hidden = false; }

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const random = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);

  function buildLevel() {
    groundY = height - 30;
    platforms = [
      { x: 300, y: groundY - 96, w: 180, h: 22 },
      { x: 610, y: groundY - 165, w: 170, h: 22 },
      { x: 900, y: groundY - 105, w: 210, h: 22 },
      { x: 1240, y: groundY - 205, w: 190, h: 22 },
      { x: 1540, y: groundY - 120, w: 170, h: 22 },
      { x: 1830, y: groundY - 190, w: 215, h: 22 },
      { x: 2180, y: groundY - 105, w: 190, h: 22 },
      { x: 2490, y: groundY - 180, w: 210, h: 22 }
    ];
    stars = [
      { x: 390, y: groundY - 142 }, { x: 695, y: groundY - 212 },
      { x: 1000, y: groundY - 152 }, { x: 1335, y: groundY - 252 },
      { x: 1625, y: groundY - 167 }, { x: 1940, y: groundY - 238 },
      { x: 2595, y: groundY - 228 }
    ].map((star, index) => ({ ...star, radius: 18, phase: index * .73, found: false }));
    player.x = 80; player.y = groundY - player.height; player.vx = 0; player.vy = 0;
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
    ctx.save(); ctx.globalAlpha = .12; ctx.fillStyle = '#fff'; ctx.font = '900 52px system-ui';
    for (let x = -((cameraX * .18) % 560) - 100; x < width + 600; x += 560) {
      ctx.fillText('YANNIE ♥ KELVIN', x, height * .25 + Math.sin(time * .0005 + x) * 14);
    }
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

  function drawFox(time) {
    const x = player.x - cameraX + player.width / 2;
    const y = player.y + player.height / 2 + (player.grounded ? Math.sin(time * .014) * Math.min(1.5, Math.abs(player.vx) / 120) : 0);
    ctx.save(); ctx.translate(x, y); ctx.scale(player.facing, 1);
    ctx.shadowColor = 'rgba(255,145,70,.45)'; ctx.shadowBlur = 11; ctx.fillStyle = '#f47b35';
    ctx.beginPath(); ctx.moveTo(-18,-18);ctx.lineTo(-6,-11);ctx.lineTo(0,-20);ctx.lineTo(7,-11);ctx.lineTo(18,-18);ctx.lineTo(15,11);ctx.quadraticCurveTo(0,23,-15,11);ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;ctx.fillStyle='#fff0df';ctx.beginPath();ctx.moveTo(-13,2);ctx.quadraticCurveTo(-4,18,0,16);ctx.quadraticCurveTo(5,18,13,2);ctx.quadraticCurveTo(0,10,-13,2);ctx.fill();
    ctx.fillStyle='#20172d';ctx.fillRect(-8,-3,3,3);ctx.fillRect(6,-3,3,3);ctx.fillRect(-2,11,4,3);
    ctx.fillStyle='#d85f2c';ctx.beginPath();ctx.ellipse(-20,9,13,7,-.45,0,Math.PI*2);ctx.fill();
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
      player.y = landingY - player.height; player.vy = 0; player.grounded = true;
    }
    if (player.y > height + 100) { player.y = groundY - player.height; player.x = Math.max(30, player.x - 160); player.vy = 0; }
    const desiredCamera = clamp(player.x - width * .34, 0, worldWidth - width);
    cameraX += (desiredCamera - cameraX) * Math.min(1, delta * 5);
  }

  function jump() {
    if (player.grounded && running) { player.vy = -475; player.grounded = false; help.classList.add('fade'); }
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
    updatePlayer(delta); collectStars(time); drawSky(time); drawGround(); platforms.forEach(drawPlatform); stars.forEach(star => drawStar(star,time)); drawDust(delta); drawFox(time);
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
  blowButton.addEventListener('click',async()=>{
    if(blowing){extinguishCandles();return} blowing=true;
    if(wishInput.value.trim()){try{localStorage.setItem('kelvin-birthday-wish',wishInput.value.trim())}catch(_){}}
    const detected=await listenForBlow();
    if(detected||blowing)extinguishCandles();
  });

  function extinguishCandles() {
    if(surprise.classList.contains('night'))return;
    cake.classList.add('candles-out');blowButton.disabled=true;blowHint.textContent='Wish made ✦';
    setTimeout(()=>{surprise.classList.add('night');cakeScene.classList.add('fade')},700);
    setTimeout(()=>{cakeScene.hidden=true;finale.hidden=false;launchTextFireworks()},1550);
  }

  function launchTextFireworks() {
    const fireworks=document.querySelector('#kelvin-fireworks');const fx=fireworks.getContext('2d');const rect=surprise.getBoundingClientRect();const ratio=Math.min(devicePixelRatio||1,2);
    fireworks.width=Math.round(rect.width*ratio);fireworks.height=Math.round(rect.height*ratio);fx.setTransform(ratio,0,0,ratio,0,0);
    const buffer=document.createElement('canvas');buffer.width=Math.min(1200,Math.round(rect.width));buffer.height=220;const bx=buffer.getContext('2d');
    const fontSize=Math.max(25,Math.min(78,buffer.width/12.5));bx.font=`900 ${fontSize}px system-ui`;bx.textAlign='center';bx.textBaseline='middle';bx.fillStyle='#fff';bx.fillText('YANNIE ♥ KELVIN',buffer.width/2,buffer.height/2);
    const pixels=bx.getImageData(0,0,buffer.width,buffer.height).data;const points=[];const step=rect.width<600?7:6;
    for(let y=0;y<buffer.height;y+=step)for(let x=0;x<buffer.width;x+=step)if(pixels[(y*buffer.width+x)*4+3]>100)points.push({x:x+(rect.width-buffer.width)/2,y:y+rect.height*.27});
    const origins=Array.from({length:7},()=>({x:random(rect.width*.15,rect.width*.85),y:random(rect.height*.18,rect.height*.58)}));
    const particles=points.map((point,index)=>{const origin=origins[index%origins.length];return{x:origin.x,y:origin.y,tx:point.x,ty:point.y,vx:random(-2,2),vy:random(-2,2),delay:random(0,1.3),hue:index%3===0?45:index%3===1?340:285}});
    let start=performance.now();
    function animate(now){const elapsed=(now-start)/1000;fx.fillStyle='rgba(2,3,12,.22)';fx.fillRect(0,0,rect.width,rect.height);for(const p of particles){if(elapsed<p.delay)continue;const pull=Math.min(.085,(elapsed-p.delay)*.012);p.vx+=(p.tx-p.x)*pull;p.vy+=(p.ty-p.y)*pull;p.vx*=.82;p.vy*=.82;p.x+=p.vx;p.y+=p.vy;fx.fillStyle=`hsla(${p.hue},100%,72%,${Math.min(1,elapsed-p.delay)})`;fx.fillRect(p.x,p.y,2.4,2.4)}if(elapsed<7.5)requestAnimationFrame(animate)}
    requestAnimationFrame(animate);setTimeout(()=>{openLetter.hidden=false},5200);
  }

  openLetter.addEventListener('click',()=>{surprise.hidden=true;archiveLock.hidden=false;document.querySelector('#archive-password').focus()});

  const AUTH_DATA=new TextEncoder().encode('private-archive-v1');
  const form=document.querySelector('#archive-form');const passwordInput=document.querySelector('#archive-password');const status=document.querySelector('#archive-status');const entriesContainer=document.querySelector('#archive-entries');
  const decodeBase64=value=>Uint8Array.from(atob(value),character=>character.charCodeAt(0));
  function renderEntries(entries){entriesContainer.replaceChildren();for(const entry of entries){const article=document.createElement('article');article.className='archive-entry';const heading=document.createElement('h2');heading.textContent=entry.title;const time=document.createElement('time');time.dateTime=entry.createdAt;time.textContent=new Intl.DateTimeFormat(undefined,{dateStyle:'long'}).format(new Date(entry.createdAt));const body=document.createElement('div');body.className='archive-entry-body';body.textContent=entry.body;article.append(heading,time,body);entriesContainer.append(article)}archiveLock.hidden=true;entriesContainer.hidden=false}
  async function unlock(password){if(!window.isSecureContext||!window.crypto?.subtle)throw new Error('secure-context');const response=await fetch('/assets/data/archive.json',{cache:'no-store'});if(!response.ok)throw new Error('archive-unavailable');const documentData=await response.json();if(documentData.empty)throw new Error('archive-empty');const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);const key=await crypto.subtle.deriveKey({name:'PBKDF2',hash:documentData.kdf.hash,salt:decodeBase64(documentData.kdf.salt),iterations:documentData.kdf.iterations},material,{name:'AES-GCM',length:256},false,['decrypt']);const plaintext=await crypto.subtle.decrypt({name:'AES-GCM',iv:decodeBase64(documentData.cipher.iv),additionalData:AUTH_DATA,tagLength:documentData.cipher.tagLength},key,decodeBase64(documentData.ciphertext));return JSON.parse(new TextDecoder().decode(plaintext))}
  form.addEventListener('submit',async event=>{event.preventDefault();status.textContent='Unlocking…';try{renderEntries(await unlock(passwordInput.value));passwordInput.value=''}catch(error){status.textContent=error.message==='archive-empty'?'The archive has not been initialized yet.':error.message==='secure-context'?'Encrypted archives require HTTPS. Please reopen this page using https://.':'Unable to unlock the archive. Check the passphrase and try again.'}});
})();
