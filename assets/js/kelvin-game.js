(() => {
  'use strict';

  const STAGES = ['I', 'LOVE', 'YOU'];
  const HEARTS_PER_STAGE = 3;
  const messages = [
    'You make ordinary days feel special.',
    'Your smile is one of my favourite places.',
    'Thank you for every little moment.',
    'Life is brighter with you in it.',
    'You make my world feel warmer.',
    'I hope this year is gentle with you.',
    'I will always be cheering for you.',
    'You are my favourite adventure.',
    'Happy birthday, my favourite human. ♡'
  ];

  const intro = document.querySelector('#kelvin-intro');
  const game = document.querySelector('#kelvin-game');
  const surprise = document.querySelector('#kelvin-surprise');
  const archiveLock = document.querySelector('#archive-lock');
  const startButton = document.querySelector('#kelvin-start');
  const skipButton = document.querySelector('#kelvin-skip');
  const letterButton = document.querySelector('#kelvin-open-letter');
  const canvas = document.querySelector('#kelvin-canvas');
  const stage = document.querySelector('#kelvin-stage');
  const score = document.querySelector('#kelvin-score');
  const message = document.querySelector('#kelvin-message');
  const help = document.querySelector('#kelvin-help');
  const stageWord = document.querySelector('#kelvin-word');
  const centerMessage = document.querySelector('#kelvin-center-message');
  const context = canvas.getContext('2d');
  const keys = new Set();
  const player = { x: 0, y: 0, size: 28, speed: 245 };
  let hearts = [];
  let particles = [];
  let stars = [];
  let running = false;
  let collected = 0;
  let stageIndex = 0;
  let stageCollected = 0;
  let changingStage = false;
  let lastTime = 0;
  let frame = 0;

  // The birthday adventure appears only on August 1 in Yannie's timezone.
  // Using a fixed timezone keeps the surprise consistent wherever it is opened.
  const singaporeDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Singapore',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date()).reduce((parts, part) => {
    if (part.type !== 'literal') parts[part.type] = part.value;
    return parts;
  }, {});
  const isKelvinBirthday = singaporeDate.month === '08' && singaporeDate.day === '01';

  if (isKelvinBirthday) {
    archiveLock.hidden = true;
    intro.hidden = false;
  }

  const random = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);

  function resizeCanvas() {
    const rect = stage.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    player.x = Math.min(player.x || rect.width / 2, rect.width - player.size);
    player.y = Math.min(player.y || rect.height / 2, rect.height - player.size);
    if (!stars.length) {
      stars = Array.from({ length: Math.max(45, Math.round(rect.width / 10)) }, () => ({
        x: random(0, rect.width), y: random(0, rect.height), r: random(.4, 1.7), a: random(.25, .9)
      }));
    }
  }

  function createHearts() {
    const rect = stage.getBoundingClientRect();
    const margin = 58;
    const stagePositions = [
      [[.22, .2], [.78, .3], [.28, .76]],
      [[.15, .24], [.83, .2], [.22, .76]],
      [[.18, .22], [.8, .35], [.72, .78]]
    ];
    const positions = stagePositions[stageIndex];
    hearts = positions.map(([x, y], index) => ({
      x: Math.max(margin, Math.min(rect.width - margin, rect.width * x + random(-18, 18))),
      y: Math.max(margin, Math.min(rect.height - margin, rect.height * y + random(-12, 12))),
      radius: 19,
      phase: index * .7,
      collected: false
    }));
  }

  function drawBackground(width, height, time) {
    const gradient = context.createRadialGradient(width * .5, height * .45, 10, width * .5, height * .45, width * .72);
    gradient.addColorStop(0, '#29204e');
    gradient.addColorStop(1, '#090916');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    for (const star of stars) {
      context.globalAlpha = star.a + Math.sin(time * .002 + star.x) * .15;
      context.fillStyle = '#fff';
      context.beginPath();
      context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }

  function heartPath(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size * .34);
    ctx.bezierCurveTo(x - size * 1.05, y - size * .25, x - size * .45, y - size, x, y - size * .42);
    ctx.bezierCurveTo(x + size * .45, y - size, x + size * 1.05, y - size * .25, x, y + size * .34);
    ctx.closePath();
  }

  function drawHeart(heart, time) {
    if (heart.collected) return;
    const pulse = 1 + Math.sin(time * .004 + heart.phase) * .1;
    context.save();
    context.shadowColor = '#ff477e';
    context.shadowBlur = 20;
    context.fillStyle = '#ff5c8a';
    heartPath(context, heart.x, heart.y, heart.radius * pulse);
    context.fill();
    context.restore();
  }

  function drawFox(time) {
    const x = player.x;
    const y = player.y + Math.sin(time * .008) * 2;
    const size = player.size;
    context.save();
    context.translate(x, y);
    context.shadowColor = 'rgba(255,145,70,.35)';
    context.shadowBlur = 12;
    context.fillStyle = '#f47b35';
    context.beginPath();
    context.moveTo(-size * .62, -size * .5);
    context.lineTo(-size * .18, -size * .28);
    context.lineTo(0, -size * .5);
    context.lineTo(size * .18, -size * .28);
    context.lineTo(size * .62, -size * .5);
    context.lineTo(size * .46, size * .28);
    context.quadraticCurveTo(0, size * .65, -size * .46, size * .28);
    context.closePath();
    context.fill();
    context.shadowBlur = 0;
    context.fillStyle = '#fff3e7';
    context.beginPath();
    context.moveTo(-size * .42, size * .03);
    context.quadraticCurveTo(-size * .1, size * .5, 0, size * .42);
    context.quadraticCurveTo(size * .1, size * .5, size * .42, size * .03);
    context.quadraticCurveTo(0, size * .24, -size * .42, size * .03);
    context.fill();
    context.fillStyle = '#22182e';
    context.beginPath(); context.arc(-size * .2, -size * .02, 2.2, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.arc(size * .2, -size * .02, 2.2, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.arc(0, size * .28, 3, 0, Math.PI * 2); context.fill();
    context.restore();
  }

  function burst(x, y) {
    for (let index = 0; index < 22; index += 1) {
      const angle = random(0, Math.PI * 2);
      const velocity = random(45, 150);
      particles.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, life: 1, size: random(2, 6) });
    }
  }

  function drawParticles(delta) {
    particles = particles.filter((particle) => particle.life > 0);
    for (const particle of particles) {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy += 80 * delta;
      particle.life -= delta * 1.4;
      context.globalAlpha = Math.max(0, particle.life);
      context.fillStyle = particle.life > .5 ? '#ffd166' : '#ff6f91';
      context.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
    context.globalAlpha = 1;
  }

  function collectHeart(heart) {
    if (changingStage) return;
    heart.collected = true;
    collected += 1;
    stageCollected += 1;
    score.textContent = `${stageCollected} / ${HEARTS_PER_STAGE}`;
    message.textContent = messages[collected - 1];
    centerMessage.textContent = messages[collected - 1];
    centerMessage.classList.remove('show');
    void centerMessage.offsetWidth;
    centerMessage.classList.add('show');
    message.classList.remove('pop');
    requestAnimationFrame(() => message.classList.add('pop'));
    setTimeout(() => message.classList.remove('pop'), 350);
    burst(heart.x, heart.y);
    if (navigator.vibrate) navigator.vibrate(35);
    if (stageCollected === HEARTS_PER_STAGE) {
      changingStage = true;
      if (stageIndex === STAGES.length - 1) {
        setTimeout(showSurprise, 2400);
      } else {
        setTimeout(nextStage, 2400);
      }
    }
  }

  function nextStage() {
    stageWord.classList.add('change');
    setTimeout(() => {
      stageIndex += 1;
      stageCollected = 0;
      stageWord.textContent = STAGES[stageIndex];
      score.textContent = `0 / ${HEARTS_PER_STAGE}`;
      createHearts();
      stageWord.classList.remove('change');
      changingStage = false;
    }, 360);
  }

  function update(delta) {
    const rect = stage.getBoundingClientRect();
    let horizontal = 0;
    let vertical = 0;
    if (keys.has('left')) horizontal -= 1;
    if (keys.has('right')) horizontal += 1;
    if (keys.has('up')) vertical -= 1;
    if (keys.has('down')) vertical += 1;
    if (horizontal && vertical) { horizontal *= .707; vertical *= .707; }
    player.x = Math.max(player.size * .65, Math.min(rect.width - player.size * .65, player.x + horizontal * player.speed * delta));
    player.y = Math.max(player.size * .65, Math.min(rect.height - player.size * .65, player.y + vertical * player.speed * delta));
    for (const heart of hearts) {
      if (!heart.collected && Math.hypot(player.x - heart.x, player.y - heart.y) < player.size + heart.radius * .65) collectHeart(heart);
    }
  }

  function loop(time) {
    if (!running) return;
    const delta = Math.min((time - lastTime) / 1000 || 0, .035);
    lastTime = time;
    const rect = stage.getBoundingClientRect();
    update(delta);
    drawBackground(rect.width, rect.height, time);
    hearts.forEach((heart) => drawHeart(heart, time));
    drawParticles(delta);
    drawFox(time);
    frame = requestAnimationFrame(loop);
  }

  function startGame() {
    intro.hidden = true;
    game.hidden = false;
    collected = 0;
    stageIndex = 0;
    stageCollected = 0;
    changingStage = false;
    stageWord.textContent = STAGES[0];
    score.textContent = `0 / ${HEARTS_PER_STAGE}`;
    requestAnimationFrame(() => {
      resizeCanvas();
      const rect = stage.getBoundingClientRect();
      player.x = rect.width / 2;
      player.y = rect.height / 2;
      createHearts();
      running = true;
      lastTime = performance.now();
      frame = requestAnimationFrame(loop);
    });
    setTimeout(() => help.classList.add('fade'), 5000);
  }

  function showSurprise() {
    running = false;
    cancelAnimationFrame(frame);
    game.hidden = true;
    surprise.hidden = false;
    launchFireworks();
  }

  function launchFireworks() {
    const fireworks = document.querySelector('#kelvin-fireworks');
    const ctx = fireworks.getContext('2d');
    const rect = surprise.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    fireworks.width = rect.width * ratio;
    fireworks.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    let sparks = [];
    let bursts = 0;
    const addFirework = () => {
      const x = random(rect.width * .12, rect.width * .88);
      const y = random(rect.height * .1, rect.height * .55);
      const hue = random(320, 420);
      for (let i = 0; i < 42; i += 1) {
        const angle = (Math.PI * 2 * i) / 42;
        const speed = random(35, 120);
        sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, hue });
      }
    };
    addFirework();
    const timer = setInterval(() => { if (++bursts < 7) addFirework(); else clearInterval(timer); }, 430);
    let previous = performance.now();
    const animate = (now) => {
      const delta = Math.min((now - previous) / 1000, .04); previous = now;
      ctx.clearRect(0, 0, rect.width, rect.height);
      sparks = sparks.filter((spark) => spark.life > 0);
      for (const spark of sparks) {
        spark.x += spark.vx * delta; spark.y += spark.vy * delta; spark.vy += 45 * delta; spark.life -= delta * .55;
        ctx.globalAlpha = Math.max(0, spark.life); ctx.fillStyle = `hsl(${spark.hue} 95% 70%)`;
        ctx.fillRect(spark.x, spark.y, 3, 3);
      }
      ctx.globalAlpha = 1;
      if (sparks.length || bursts < 7) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  const directionForKey = (key) => ({ ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' })[key];
  window.addEventListener('keydown', (event) => { const direction = directionForKey(event.key); if (direction && !game.hidden) { event.preventDefault(); keys.add(direction); help.classList.add('fade'); } });
  window.addEventListener('keyup', (event) => { const direction = directionForKey(event.key); if (direction) keys.delete(direction); });
  window.addEventListener('resize', () => { if (!game.hidden) { stars = []; resizeCanvas(); createHearts(); } });

  document.querySelectorAll('.kelvin-controls button').forEach((button) => {
    const direction = button.dataset.direction;
    const press = (event) => { event.preventDefault(); keys.add(direction); help.classList.add('fade'); };
    const release = (event) => { event.preventDefault(); keys.delete(direction); };
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
  });

  startButton.addEventListener('click', startGame);
  skipButton.addEventListener('click', showSurprise);
  letterButton.addEventListener('click', () => {
    surprise.hidden = true;
    archiveLock.hidden = false;
    document.querySelector('#archive-password').focus();
  });

  const AUTH_DATA = new TextEncoder().encode('private-archive-v1');
  const form = document.querySelector('#archive-form');
  const passwordInput = document.querySelector('#archive-password');
  const status = document.querySelector('#archive-status');
  const entriesContainer = document.querySelector('#archive-entries');
  const decodeBase64 = (value) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

  function renderEntries(entries) {
    entriesContainer.replaceChildren();
    for (const entry of entries) {
      const article = document.createElement('article'); article.className = 'archive-entry';
      const heading = document.createElement('h2'); heading.textContent = entry.title;
      const time = document.createElement('time'); time.dateTime = entry.createdAt;
      time.textContent = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(entry.createdAt));
      const body = document.createElement('div'); body.className = 'archive-entry-body'; body.textContent = entry.body;
      article.append(heading, time, body); entriesContainer.append(article);
    }
    archiveLock.hidden = true; entriesContainer.hidden = false;
  }

  async function unlock(password) {
    if (!window.isSecureContext || !window.crypto?.subtle) throw new Error('secure-context');
    const response = await fetch('/assets/data/archive.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('archive-unavailable');
    const documentData = await response.json();
    if (documentData.empty) throw new Error('archive-empty');
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: documentData.kdf.hash, salt: decodeBase64(documentData.kdf.salt), iterations: documentData.kdf.iterations }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decodeBase64(documentData.cipher.iv), additionalData: AUTH_DATA, tagLength: documentData.cipher.tagLength }, key, decodeBase64(documentData.ciphertext));
    return JSON.parse(new TextDecoder().decode(plaintext));
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); status.textContent = 'Unlocking…';
    try {
      renderEntries(await unlock(passwordInput.value)); passwordInput.value = '';
    } catch (error) {
      status.textContent = error.message === 'archive-empty' ? 'The archive has not been initialized yet.' : error.message === 'secure-context' ? 'Encrypted archives require HTTPS. Please reopen this page using https://.' : 'Unable to unlock the archive. Check the passphrase and try again.';
    }
  });
})();
