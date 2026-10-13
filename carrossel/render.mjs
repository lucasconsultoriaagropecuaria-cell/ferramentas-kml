#!/usr/bin/env node
/* ==========================================================================
   render.mjs — exporta um carrossel para Instagram
     PNG  : 1 imagem por slide (frame "hold", a versão estática)
     MP4  : 1 vídeo por slide (loop perfeito, 30 fps, áudio sincronizado)

   uso:  node carrossel/render.mjs carrossel/<slug>/index.html [opções]
     --out <dir>      pasta de saída (padrão: <slug>/out)
     --fps 30         frames por segundo
     --png-only       só as imagens estáticas
     --slides 1,3     exporta só alguns slides (1-based)
     --music urbano   força a trilha (cinematic | intimista | urbano | none)
     --mute           vídeo sem áudio

   requisitos: node 18+, playwright (npm i -D playwright  ·  npx playwright install chromium), ffmpeg no PATH
   ========================================================================== */
import { spawn, execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname, basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const flag = k => args.includes(k);
const html = args.find(a => a.endsWith('.html'));
if (!html) { console.error('uso: node render.mjs <pasta>/index.html [--out dir] [--fps 30] [--png-only] [--slides 1,2] [--music x] [--mute]'); process.exit(1); }

const htmlPath = resolve(html);
const outDir = resolve(opt('--out', join(dirname(htmlPath), 'out')));
const fps = +opt('--fps', 30);
const only = opt('--slides', null)?.split(',').map(n => +n - 1);
const music = opt('--music', null);
const pngOnly = flag('--png-only'), mute = flag('--mute');
mkdirSync(outDir, { recursive: true });

/* carrega o playwright (local do projeto ou global via NODE_PATH) */
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { try { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); } catch { console.error('playwright não encontrado: npm i -D playwright && npx playwright install chromium'); process.exit(1); } }
try { execSync('ffmpeg -version', { stdio: 'ignore' }); } catch { if (!pngOnly) { console.error('ffmpeg não encontrado no PATH'); process.exit(1); } }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('erro na página:', e.message));
await page.goto(pathToFileURL(htmlPath).href + '?export=1');
await page.evaluate(() => window.__carousel.ready);
if (music) await page.evaluate(m => window.__carousel.setMusic(m), music);
const slides = await page.evaluate(() => window.__carousel.slides());
const slug = basename(dirname(htmlPath));
console.log(`${slides.length} slides · ${slug} → ${outDir}`);

const ffmpegFrames = (file, dur) => {
  const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-t', String(dur), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', file]);
  p.stderr.on('data', d => process.stderr.write(d));
  return p;
};

for (const s of slides) {
  if (only && !only.includes(s.idx)) continue;
  const n = String(s.idx + 1).padStart(2, '0');
  const loc = page.locator('.slide').nth(s.idx);

  /* ---- PNG estático (frame de hold) ---- */
  await page.evaluate(([i, t]) => window.__carousel.seek(i, t), [s.idx, s.hold]);
  await loc.screenshot({ path: join(outDir, `${n}-${slug}.png`), type: 'png' });
  console.log(`  ${n} ${s.label.padEnd(10)} png ✓ (hold ${s.hold}s)`);
  if (pngOnly) continue;

  /* ---- frames → ffmpeg ---- */
  const silent = join(outDir, `.${n}-silent.mp4`), final = join(outDir, `${n}-${slug}.mp4`);
  const ff = ffmpegFrames(silent, s.dur);
  const total = Math.round(s.dur * fps);
  const t0 = Date.now();
  for (let f = 0; f < total; f++) {
    await page.evaluate(([i, t]) => window.__carousel.seek(i, t), [s.idx, f / fps]);
    const buf = await loc.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % fps === 0) process.stdout.write(`\r  ${n} ${s.label.padEnd(10)} ${Math.round(f / total * 100)}%  `);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg saiu com ' + c))));

  /* ---- áudio (OfflineAudioContext → wav) + mux ---- */
  if (mute) { rmSync(final, { force: true }); execSync(`mv "${silent}" "${final}"`); }
  else {
    const wav = join(outDir, `.${n}.wav`);
    const b64 = await page.evaluate(i => window.__carousel.renderAudio(i), s.idx);
    writeFileSync(wav, Buffer.from(b64, 'base64'));
    execSync(`ffmpeg -y -loglevel error -i "${silent}" -i "${wav}" -c:v copy -c:a aac -b:a 160k -shortest "${final}"`);
    rmSync(wav); rmSync(silent);
  }
  console.log(`\r  ${n} ${s.label.padEnd(10)} mp4 ✓ (${s.dur}s, ${s.sfx} sfx, música ${music || s.music}, ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
await browser.close();
console.log('pronto:', outDir);
