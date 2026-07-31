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
    <p class="kelvin-intro-copy">There are seven little pieces of my heart hiding among the stars. Find them all to open your present.</p>
    <div class="kelvin-pixel-heart" aria-hidden="true">♥</div>
    <button class="kelvin-primary" id="kelvin-start" type="button">Start the adventure</button>
  </section>

  <section class="kelvin-game" id="kelvin-game" hidden aria-label="Birthday heart collecting game">
    <header class="kelvin-hud">
      <div>
        <span class="kelvin-hud-label">HEARTS</span>
        <strong id="kelvin-score">0 / 7</strong>
      </div>
      <p id="kelvin-message" aria-live="polite">Go find the first heart ✦</p>
      <button class="kelvin-skip" id="kelvin-skip" type="button">Skip game</button>
    </header>
    <div class="kelvin-stage" id="kelvin-stage">
      <canvas id="kelvin-canvas" aria-label="Move the little fox and collect hearts through three chapters: I, Love, and You"></canvas>
      <div class="kelvin-word" id="kelvin-word" aria-hidden="true">I</div>
      <div class="kelvin-center-message" id="kelvin-center-message" aria-live="polite"></div>
      <div class="kelvin-help" id="kelvin-help">Use <kbd>WASD</kbd> or <kbd>arrow keys</kbd> to move</div>
    </div>
    <div class="kelvin-controls" aria-label="Touch controls">
      <button data-direction="up" aria-label="Move up">▲</button>
      <button data-direction="left" aria-label="Move left">◀</button>
      <button data-direction="down" aria-label="Move down">▼</button>
      <button data-direction="right" aria-label="Move right">▶</button>
    </div>
  </section>

  <section class="kelvin-surprise" id="kelvin-surprise" hidden aria-labelledby="surprise-title">
    <canvas id="kelvin-fireworks" aria-hidden="true"></canvas>
    <div class="kelvin-surprise-card">
      <div class="kelvin-cake" aria-hidden="true">
        <i></i><i></i><i></i>
        <div class="kelvin-cake-top"></div>
        <div class="kelvin-cake-base"></div>
      </div>
      <p class="kelvin-kicker">Quest complete!</p>
      <h2 id="surprise-title">Happy Birthday, Kelvin ♡</h2>
      <p>You found every piece. There is one more thing waiting for you.</p>
      <button class="kelvin-primary" id="kelvin-open-letter" type="button">Open my letters</button>
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
