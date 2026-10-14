/* ==========================================================================
   engine.js — motor de carrossel animado (sem framework)
   - Lê atributos data-* dos elementos e monta as animações CSS
   - Pausa todas as animações e as "dirige" com um relógio mestre
     (preview em loop no navegador / seek determinístico para export)
   - Sintetiza música + efeitos sonoros com Web Audio, sincronizados
     nos mesmos instantes (data-at) dos elementos
   - Expõe window.__carousel para o render.mjs (PNG + MP4 com áudio)

   Atributos por elemento
     data-in="rise|fade|pop|drop|left|right|zoom|blur|wipe|wipe-up|grow|grow-y|draw|spin|marker|sink"
     data-at="0.5"        instante da entrada (s)
     data-dur="0.7"       duração da entrada (s)
     data-ease="out|in|pop|linear|inout"
     data-out="fade|up|down|left|shrink|blur|wipe"   saída (padrão: no fim do slide)
     data-out-at / data-out-dur
     data-loop="pulse 1.5|float 2|blink 1|nudge 1.5|spin 4|shimmer 2"  (use em wrapper separado)
     data-sfx="pop|tick|key|whoosh|swipe|rise|ding|thud|impact|success|error|ticker|type"
     data-sfx-at="0.5"    (padrão: data-at)   data-sfx-gain="0.8"   data-sfx-out="whoosh"
     data-count="184" data-from="0" data-decimals="1"   contador numérico (usa data-at / data-dur)
     data-type           efeito de digitação (usa data-at e data-cps, padrão 28 chars/s)
     data-progress       barra que acompanha o tempo do slide
   Atributos por slide (<section class="slide">)
     data-dur="6" data-hold="3.6" data-exit-dur="0.5" data-exit-at="5.4" data-music="cinematic|intimista|urbano|none" data-bpm="120"
   ========================================================================== */
(function () {
  'use strict';

  const EASE = {
    out: 'cubic-bezier(.2,.8,.2,1)', in: 'cubic-bezier(.6,0,.9,.4)',
    pop: 'cubic-bezier(.34,1.56,.64,1)', linear: 'linear', inout: 'cubic-bezier(.65,0,.35,1)'
  };
  const IN_DUR = { fade: .6, rise: .7, sink: .7, left: .7, right: .7, pop: .55, zoom: .8, blur: .8, wipe: .8, 'wipe-up': .8, grow: .9, 'grow-y': .9, drop: .9, draw: 1.6, spin: .7, marker: .55 };
  const IN_EASE = { pop: 'pop', drop: 'linear', draw: 'inout', grow: 'out', marker: 'out' };
  const AUTO_SFX = { pop: 'pop', drop: 'thud', draw: 'rise', marker: 'swipe', wipe: 'swipe', 'wipe-up': 'swipe', rise: 'whoosh', sink: 'whoosh', left: 'whoosh', right: 'whoosh', zoom: 'whoosh', blur: 'whoosh', grow: 'rise', 'grow-y': 'rise', spin: 'whoosh', fade: null };

  const S = [];               // slides parseados
  const isExport = /[?&]export/.test(location.search);
  const fmt = new Map();

  function numFmt(dec) {
    if (!fmt.has(dec)) fmt.set(dec, new Intl.NumberFormat('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }));
    return fmt.get(dec);
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOut = p => 1 - Math.pow(1 - p, 3);

  /* ------------------------------------------------------------------ */
  function parseSlide(slide, idx) {
    const d = slide.dataset;
    const dur = +d.dur || 6;
    const exitDur = d.exitDur != null ? +d.exitDur : .5;
    const exitAt = d.exitAt != null ? +d.exitAt : +(dur - exitDur - .1).toFixed(3);
    const s = {
      el: slide, idx, dur, exitAt, exitDur,
      hold: d.hold != null ? +d.hold : +(dur * .6).toFixed(2),
      label: d.label || ('Slide ' + (idx + 1)),
      music: d.music || document.body.dataset.music || 'cinematic',
      bpm: +(d.bpm || document.body.dataset.bpm || 120),
      sfx: [], dyn: [], anims: []
    };
    slide.dataset.label = s.label;

    slide.querySelectorAll('[data-in],[data-out],[data-loop]').forEach(el => {
      const e = el.dataset, parts = [];
      if (e.in) {
        const at = +e.at || 0;
        const idur = e.dur != null ? +e.dur : (IN_DUR[e.in] || .7);
        const ease = EASE[e.ease || IN_EASE[e.in] || 'out'];
        parts.push(`in-${e.in} ${idur}s ${ease} ${at}s both`);
        if (e.in === 'draw') {
          try { const len = el.getTotalLength(); el.style.strokeDasharray = len; el.style.setProperty('--len', len); } catch (_) { }
        }
        if (e.in === 'marker') el.classList.add('marker');
      }
      if (e.out) {
        const at = e.outAt != null ? +e.outAt : exitAt;
        const od = e.outDur != null ? +e.outDur : exitDur;
        parts.push(`out-${e.out} ${od}s ${EASE.in} ${at}s forwards`);
      }
      if (e.loop) {
        const [name, per = '1.5'] = e.loop.trim().split(/\s+/);
        parts.push(`loop-${name} ${per}s ${name === 'spin' || name === 'shimmer' ? 'linear' : 'ease-in-out'} ${e.loopAt || 0}s infinite`);
      }
      el.style.animation = parts.join(', ');

      if (e.sfx && e.sfx !== 'ticker' && e.sfx !== 'type') {
        const type = e.sfx === 'auto' ? AUTO_SFX[e.in] : e.sfx;
        if (type) s.sfx.push({ t: +(e.sfxAt != null ? e.sfxAt : (e.at || 0)), type, gain: e.sfxGain != null ? +e.sfxGain : 1 });
      }
      if (e.sfxOut) s.sfx.push({ t: e.outAt != null ? +e.outAt : exitAt, type: e.sfxOut, gain: e.sfxGain != null ? +e.sfxGain : 1 });
    });

    /* contador numérico */
    slide.querySelectorAll('[data-count]').forEach(el => {
      const e = el.dataset, to = +e.count, from = +(e.from || 0), at = +(e.at || 0), cd = +(e.dur || 1.5), dec = +(e.decimals || 0);
      const f = numFmt(dec);
      s.dyn.push(t => { const p = easeOut(clamp((t - at) / cd, 0, 1)); el.textContent = f.format(from + (to - from) * p); });
      if (e.sfx === 'ticker') { for (let tt = at; tt < at + cd; tt += .09) s.sfx.push({ t: +tt.toFixed(3), type: 'tick', gain: .5 }); }
    });

    /* digitação */
    slide.querySelectorAll('[data-type]').forEach(el => {
      const e = el.dataset, full = el.textContent, at = +(e.at || 0), cps = +(e.cps || 28);
      const total = full.length / cps;
      el.textContent = '';
      s.dyn.push(t => {
        const n = clamp(Math.floor((t - at) * cps), 0, full.length);
        el.textContent = full.slice(0, n);
        el.classList.toggle('done', n >= full.length || t < at);
        el.style.visibility = t < at ? 'hidden' : 'visible';
      });
      if (e.sfx === 'type') { for (let i = 0; i < full.length; i++) if (full[i] !== ' ') s.sfx.push({ t: +(at + i / cps).toFixed(3), type: 'key', gain: .6 }); }
      el.dataset.typeEnd = (at + total).toFixed(2);
    });

    /* barra de progresso */
    slide.querySelectorAll('[data-progress]').forEach(el => {
      const bar = el.querySelector('i') || el;
      s.dyn.push(t => { bar.style.transform = `scaleX(${clamp(t / dur, 0, 1)})`; });
    });

    s.sfx.sort((a, b) => a.t - b.t);
    return s;
  }

  function collectAnims(s) {
    s.anims = s.el.getAnimations({ subtree: true });
    s.anims.forEach(a => { a.pause(); });
  }

  function seek(i, t) {
    const s = S[i]; if (!s) return;
    const ms = t * 1000;
    for (const a of s.anims) a.currentTime = ms;
    for (const f of s.dyn) f(t);
  }

  /* ====================== ÁUDIO (Web Audio) ========================= */
  const noiseCache = new WeakMap();
  function noise(ctx) {
    let b = noiseCache.get(ctx);
    if (!b) {
      b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noiseCache.set(ctx, b);
    }
    return b;
  }
  function tone(ctx, dest, o) {
    const { t, dur, f, f2, type = 'sine', gain = .3, a = .005, curve = 'exp' } = o;
    const osc = ctx.createOscillator(); osc.type = type;
    osc.frequency.setValueAtTime(f, t);
    if (f2) osc.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + a);
    if (curve === 'exp') g.gain.exponentialRampToValueAtTime(.0001, t + dur); else g.gain.linearRampToValueAtTime(0, t + dur);
    let node = g;
    if (o.lp) { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.lp; g.connect(lp); node = lp; }
    osc.connect(g); node.connect(dest);
    osc.start(t); osc.stop(t + dur + .05);
  }
  function burst(ctx, dest, o) {
    const { t, dur, gain = .3, type = 'bandpass', f = 1000, f2, q = 1, a = .003 } = o;
    const src = ctx.createBufferSource(); src.buffer = noise(ctx); src.loop = true;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.Q.value = q;
    fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + a);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(fl); fl.connect(g); g.connect(dest);
    src.start(t, Math.random() * 1.5); src.stop(t + dur + .05);
  }

  const SFX = {
    pop:     (c, d, t, g) => { tone(c, d, { t, dur: .14, f: 560, f2: 240, gain: .55 * g, a: .003 }); burst(c, d, { t, dur: .03, f: 3000, gain: .15 * g }); },
    tick:    (c, d, t, g) => burst(c, d, { t, dur: .025, type: 'highpass', f: 5000, gain: .22 * g, a: .001 }),
    key:     (c, d, t, g) => { burst(c, d, { t, dur: .035, f: 2600 + Math.random() * 800, q: 2.5, gain: .18 * g, a: .001 }); tone(c, d, { t, dur: .03, f: 1800 + Math.random() * 400, type: 'triangle', gain: .05 * g }); },
    whoosh:  (c, d, t, g) => burst(c, d, { t: t - .05, dur: .42, f: 320, f2: 2600, q: .9, gain: .38 * g, a: .12 }),
    swipe:   (c, d, t, g) => burst(c, d, { t, dur: .22, f: 1800, f2: 500, q: 1.2, gain: .28 * g, a: .02 }),
    rise:    (c, d, t, g) => tone(c, d, { t, dur: .5, f: 220, f2: 880, type: 'triangle', gain: .22 * g, a: .05, lp: 2400 }),
    ding:    (c, d, t, g) => { tone(c, d, { t, dur: 1.0, f: 1318.5, gain: .28 * g, a: .002 }); tone(c, d, { t, dur: .6, f: 1318.5 * 2.76, gain: .07 * g, a: .002 }); tone(c, d, { t, dur: .5, f: 659, type: 'triangle', gain: .08 * g }); },
    thud:    (c, d, t, g) => { tone(c, d, { t, dur: .28, f: 130, f2: 38, gain: .9 * g, a: .002 }); burst(c, d, { t, dur: .09, type: 'lowpass', f: 300, gain: .35 * g, a: .001 }); },
    impact:  (c, d, t, g) => { tone(c, d, { t, dur: .35, f: 110, f2: 32, gain: 1 * g, a: .002 }); burst(c, d, { t, dur: .3, f: 900, f2: 200, q: .6, gain: .45 * g, a: .002 }); burst(c, d, { t, dur: .04, type: 'highpass', f: 3000, gain: .3 * g, a: .001 }); },
    success: (c, d, t, g) => { [523.25, 659.25, 783.99].forEach((f, i) => tone(c, d, { t: t + i * .085, dur: .55, f, type: 'triangle', gain: .22 * g, a: .004 })); },
    error:   (c, d, t, g) => { [330, 247].forEach((f, i) => tone(c, d, { t: t + i * .14, dur: .22, f, type: 'square', gain: .12 * g, a: .004, lp: 1200 })); },
  };

  /* --- música ------------------------------------------------------- */
  const NOTE = { C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98, A2: 110, B2: 123.47, C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196, A3: 220, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440 };
  const CHORDS = [ // Am  F  C  G  (raiz, notas do pad, notas do arpejo)
    { root: NOTE.A2, pad: [NOTE.A2, NOTE.C3, NOTE.E3, NOTE.A3], arp: [NOTE.E4, NOTE.C4, NOTE.A3] },
    { root: NOTE.F2, pad: [NOTE.F2, NOTE.A2, NOTE.C3, NOTE.F3], arp: [NOTE.F4, NOTE.C4, NOTE.A3] },
    { root: NOTE.C3, pad: [NOTE.C3, NOTE.E3, NOTE.G3, NOTE.C4], arp: [NOTE.G4, NOTE.E4, NOTE.C4] },
    { root: NOTE.G2, pad: [NOTE.G2, NOTE.B2, NOTE.D3, NOTE.G3], arp: [NOTE.G4, NOTE.D4, NOTE.B3] },
  ];
  const MOODS = {
    cinematic: { pad: .045, padLp: 620, bass: .16, kick: [0, 2], snare: [], hat: [.5, 1.5, 2.5, 3.5], hatG: .05, arp: 0, arpBeats: [] },
    intimista: { pad: .05, padLp: 900, bass: 0, kick: [], snare: [], hat: [], hatG: 0, arp: .11, arpBeats: [0, 1, 2.5, 3] },
    urbano:    { pad: .02, padLp: 1400, bass: .2, kick: [0, 1.5, 2.5], snare: [1, 3], hat: [0, .5, 1, 1.5, 2, 2.5, 3, 3.5], hatG: .07, arp: .09, arpBeats: [.5, 2] },
  };

  function music(ctx, dest, mood, t0, dur, bpm) {
    const m = MOODS[mood]; if (!m) return;
    const beat = 60 / bpm, bar = beat * 4, bars = Math.ceil(dur / bar);
    const g = ctx.createGain(); g.gain.value = .8; g.connect(dest);
    for (let b = 0; b < bars; b++) {
      const ch = CHORDS[b % CHORDS.length], bt = t0 + b * bar, end = Math.min(bt + bar, t0 + dur);
      if (m.pad) ch.pad.forEach(f => [-6, 6].forEach(det => {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = m.padLp; lp.Q.value = .7;
        const pg = ctx.createGain();
        pg.gain.setValueAtTime(0, bt); pg.gain.linearRampToValueAtTime(m.pad, bt + .3);
        pg.gain.setValueAtTime(m.pad, end - .25); pg.gain.linearRampToValueAtTime(0, end - .02);
        o.connect(lp); lp.connect(pg); pg.connect(g); o.start(bt); o.stop(end);
      }));
      if (m.bass) [0, 1.5, 2, 3.5].forEach(k => { const t = bt + k * beat; if (t < t0 + dur - .05) tone(ctx, g, { t, dur: .42, f: ch.root / 2, type: 'triangle', gain: m.bass, a: .01, lp: 400 }); });
      m.kick.forEach(k => { const t = bt + k * beat; if (t < t0 + dur - .05) tone(ctx, g, { t, dur: .2, f: 150, f2: 42, gain: .85, a: .002 }); });
      m.snare.forEach(k => { const t = bt + k * beat; if (t < t0 + dur - .05) { burst(ctx, g, { t, dur: .16, f: 1700, q: .7, gain: .28, a: .002 }); tone(ctx, g, { t, dur: .1, f: 210, f2: 160, gain: .25 }); } });
      m.hat.forEach(k => { const t = bt + k * beat - beat / 2 + beat / 2; if (t < t0 + dur - .05) burst(ctx, g, { t, dur: .045, type: 'highpass', f: 7500, gain: m.hatG, a: .001 }); });
      if (m.arp) m.arpBeats.forEach((k, i) => { const t = bt + k * beat; if (t < t0 + dur - .05) tone(ctx, g, { t, dur: .5, f: ch.arp[i % ch.arp.length], type: 'triangle', gain: m.arp, a: .006, lp: 3000 }); });
    }
  }

  /* monta a trilha completa de um slide num contexto (real ou offline) */
  function schedule(ctx, dest, s, t0) {
    const master = ctx.createGain(); master.gain.value = 1;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = .003; comp.release.value = .18;
    master.connect(comp); comp.connect(dest);
    music(ctx, master, s.music, t0, s.dur, s.bpm);
    const sfxBus = ctx.createGain(); sfxBus.gain.value = .9; sfxBus.connect(master);
    s.sfx.forEach(c => { const fn = SFX[c.type]; if (fn) fn(ctx, sfxBus, t0 + c.t, c.gain == null ? 1 : c.gain); });
    return { stop() { const n = ctx.currentTime; master.gain.setValueAtTime(master.gain.value, n); master.gain.linearRampToValueAtTime(0, n + .06); setTimeout(() => { try { master.disconnect(); } catch (_) { } }, 120); } };
  }

  async function renderAudio(i, sampleRate = 48000) {
    const s = S[i];
    const off = new OfflineAudioContext(2, Math.ceil(sampleRate * s.dur), sampleRate);
    schedule(off, off.destination, s, 0);
    const buf = await off.startRendering();
    return wavBase64(buf);
  }
  function wavBase64(buf) {
    const ch = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate;
    const bytes = 44 + n * ch * 2, ab = new ArrayBuffer(bytes), v = new DataView(ab);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); v.setUint32(4, bytes - 8, true); str(8, 'WAVE'); str(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true);
    str(36, 'data'); v.setUint32(40, n * ch * 2, true);
    const chans = []; for (let c = 0; c < ch; c++) chans.push(buf.getChannelData(c));
    let o = 44;
    for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const x = Math.max(-1, Math.min(1, chans[c][i])); v.setInt16(o, x < 0 ? x * 32768 : x * 32767, true); o += 2; }
    const u8 = new Uint8Array(ab); let s = '';
    for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(s);
  }

  /* ====================== PREVIEW ==================================== */
  function preview() {
    document.body.classList.add('preview');
    const bar = document.createElement('div'); bar.className = 'preview-bar';
    bar.innerHTML = `<b>Carrossel</b><span>o navegador só libera áudio depois de um clique: clique num slide (ou no botão) para ouvir</span>
      <button id="pv-sound" class="off">🔇 som</button>
      <label>música <select id="pv-music"><option value="cinematic">cinematográfica</option><option value="intimista">intimista</option><option value="urbano">urbana</option><option value="none">sem música</option></select></label>
      <span class="t" id="pv-time"></span><span class="hint">abra com ?export para o modo de exportação</span>`;
    document.body.prepend(bar);
    const fit = () => { document.querySelector('.deck').style.zoom = Math.min(1, (innerWidth - 40) / 1080); };
    fit(); addEventListener('resize', fit);

    let ctx = null, playing = null, soundOn = false;
    const now0 = performance.now(); S.forEach(s => { s.t0 = now0; });
    const sel = bar.querySelector('#pv-music'); sel.value = S[0].music;
    sel.onchange = () => { S.forEach(s => s.music = sel.value); if (playing) restart(playing.idx); };
    const nearest = () => { const mid = innerHeight / 2; let best = 0, bd = Infinity; S.forEach((s, i) => { const r = s.el.getBoundingClientRect(); const d = Math.abs((r.top + r.bottom) / 2 - mid); if (d < bd) { bd = d; best = i; } }); return best; };
    bar.querySelector('#pv-sound').onclick = e => {
      soundOn = !soundOn; e.target.className = soundOn ? '' : 'off'; e.target.textContent = soundOn ? '🔊 som' : '🔇 som';
      if (!soundOn && playing) { playing.h.stop(); playing = null; }
      if (soundOn) restart(nearest());
    };

    function restart(i) {
      const s = S[i];
      if (playing) { playing.h.stop(); playing = null; }
      if (soundOn) {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        const a0 = ctx.currentTime + .08;
        playing = { idx: i, a0, h: schedule(ctx, ctx.destination, s, a0) };
        s.t0 = performance.now() + 80;
      } else s.t0 = performance.now();
    }
    S.forEach((s, i) => s.el.addEventListener('click', () => { if (!soundOn) { soundOn = true; const b = bar.querySelector('#pv-sound'); b.className = ''; b.textContent = '🔊 som'; } restart(i); }));

    const timeEl = bar.querySelector('#pv-time');
    function frame(now) {
      S.forEach((s, i) => {
        let t;
        if (playing && playing.idx === i) {
          t = ctx.currentTime - playing.a0;
          if (t >= s.dur) { playing.h.stop(); const a0 = playing.a0 + s.dur; playing = { idx: i, a0, h: schedule(ctx, ctx.destination, s, a0) }; t = ctx.currentTime - a0; }
          if (t < 0) t = 0;
          timeEl.textContent = `${s.label} · ${t.toFixed(2)}s / ${s.dur}s`;
        } else {
          t = (now - s.t0) / 1000;
          if (t >= s.dur) { s.t0 += Math.floor(t / s.dur) * s.dur * 1000; t = (now - s.t0) / 1000; }
        }
        seek(i, t);
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ====================== INIT ======================================= */
  const ready = (async () => {
    if (document.readyState === 'loading') await new Promise(r => addEventListener('DOMContentLoaded', r));
    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (_) { } }
    document.querySelectorAll('.slide').forEach((el, i) => S.push(parseSlide(el, i)));
    document.body.offsetWidth; // força o cálculo de estilo
    S.forEach(collectAnims);
    S.forEach((s, i) => seek(i, 0));
    if (isExport) document.body.classList.add('export'); else preview();
    return S.length;
  })();

  window.__carousel = {
    ready,
    seek,
    slides: () => S.map(s => ({ idx: s.idx, label: s.label, dur: s.dur, hold: s.hold, music: s.music, bpm: s.bpm, sfx: s.sfx.length })),
    cues: i => S[i].sfx.slice(),
    setMusic: m => S.forEach(s => s.music = m),
    renderAudio,
  };
})();
