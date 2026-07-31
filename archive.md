---
layout: page
title: For Kelvin
permalink: /kelvin/
sitemap: false
noindex: true
comments: false
---

<link rel="stylesheet" href="{{ '/assets/css/kelvin-game.css' | relative_url }}">

<main class="kelvin-world" id="kelvin-world">
  <section class="kelvin-intro" id="kelvin-intro" hidden aria-labelledby="kelvin-title">
    <div class="kelvin-stars" aria-hidden="true"></div>
    <p class="kelvin-kicker">A tiny adventure made with love</p>
    <h1 id="kelvin-title">Happy Birthday, Kelvin!</h1>
    <p class="kelvin-intro-copy">Run, jump, and collect the seven birthday stars. Something magical is waiting at the end.</p>
    <div class="kelvin-pixel-star" aria-hidden="true">★</div>
    <button class="kelvin-primary" id="kelvin-start" type="button">Start the adventure</button>
  </section>

  <section class="kelvin-game" id="kelvin-game" hidden aria-label="Birthday star collecting platform game">
    <header class="kelvin-hud">
      <div><span class="kelvin-hud-label">STARS</span><strong id="kelvin-score">0 / 7</strong></div>
      <p id="kelvin-message" aria-live="polite">Run to the right and find every star ✦</p>
      <button class="kelvin-skip" id="kelvin-skip" type="button">Skip game</button>
    </header>
    <div class="kelvin-stage" id="kelvin-stage">
      <canvas id="kelvin-canvas" aria-label="Help the little fox run, jump, and collect seven stars"></canvas>
      <div class="kelvin-center-message" id="kelvin-center-message" aria-live="polite"></div>
      <div class="kelvin-help" id="kelvin-help">Move with <kbd>←</kbd><kbd>→</kbd> · Jump with <kbd>↑</kbd> or <kbd>Space</kbd></div>
    </div>
    <div class="kelvin-controls" aria-label="Touch controls">
      <button data-direction="left" aria-label="Move left">◀</button>
      <button data-direction="jump" aria-label="Jump">▲</button>
      <button data-direction="right" aria-label="Move right">▶</button>
    </div>
  </section>

  <section class="kelvin-surprise" id="kelvin-surprise" hidden aria-labelledby="surprise-title">
    <canvas id="kelvin-fireworks" aria-hidden="true"></canvas>
    <div class="kelvin-cake-scene" id="kelvin-cake-scene">
      <div class="kelvin-star-orbit" id="kelvin-star-orbit" aria-hidden="true"></div>
      <div class="kelvin-cake" id="kelvin-cake" aria-hidden="true">
        <div class="kelvin-candles"><i></i><i></i><i></i></div>
        <div class="kelvin-cake-layer layer-top"></div>
        <div class="kelvin-cake-layer layer-middle"></div>
        <div class="kelvin-cake-layer layer-bottom"></div>
      </div>
      <p class="kelvin-kicker">The stars made this for you</p>
      <h2 id="surprise-title">Happy Birthday, Kelvin ♡</h2>
      <label class="kelvin-wish-label" for="kelvin-wish">Make a birthday wish</label>
      <textarea id="kelvin-wish" rows="2" maxlength="240" placeholder="Your wish stays only on this device…"></textarea>
      <button class="kelvin-primary" id="kelvin-blow" type="button">Blow out the candles</button>
      <p class="kelvin-blow-hint" id="kelvin-blow-hint">Tap the button—or allow the microphone and blow gently.</p>
    </div>
    <div class="kelvin-finale" id="kelvin-finale" hidden>
      <p>The stars always find their way back to us.</p>
      <button class="kelvin-primary" id="kelvin-open-letter" type="button" hidden>Open my letters</button>
    </div>
  </section>

  <section class="archive-lock" id="archive-lock" aria-labelledby="archive-heading">
    <div class="archive-seal" aria-hidden="true">♥</div>
    <p class="kelvin-kicker">Our private corner</p>
    <h2 id="archive-heading">Letters for Kelvin</h2>
    <p>Enter our shared passphrase. The letters are decrypted only on this device.</p>
    <form class="archive-form" id="archive-form">
      <input class="form-control" id="archive-password" type="password" autocomplete="current-password" placeholder="Passphrase" required>
      <button class="kelvin-primary" type="submit">Unlock</button>
    </form>
    <p class="archive-status" id="archive-status" role="status" aria-live="polite"></p>
  </section>

  <section class="archive-entries" id="archive-entries" hidden></section>
</main>

<script src="{{ '/assets/js/kelvin-game.js' | relative_url }}"></script>
