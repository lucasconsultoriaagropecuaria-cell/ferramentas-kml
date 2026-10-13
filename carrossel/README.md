# Carrosséis animados ("carrossel vivo") com Claude Code

Carrosséis para Instagram em que **tudo se move**: textos, elementos, transições e
efeitos sonoros sincronizados com a música. Feito só com código (HTML + CSS + JS),
sem ferramenta de animação, sem banco de música, sem framework de vídeo.

A ideia central: o Claude não gera vídeo. Ele escreve **uma página que controla,
segundo a segundo, o que acontece na animação**. Por isso o loop fecha perfeito,
o texto fica nítido e o som bate exatamente no instante certo.

```
carrossel/
├── engine.css           presets de animação (entradas, saídas, loops) + tipografia 1080px
├── engine.js            relógio mestre, parser dos data-*, música + SFX (Web Audio), API de export
├── render.mjs           exporta PNG (estático) e MP4 (animado, com áudio) por slide
├── referencias/         acervo: carrosséis que você gostou (o Claude consulta antes de criar)
└── kml-propriedade/     exemplo completo: "A matrícula vira KML em 2 min."
    ├── index.html
    └── out/             01..06 .png + .mp4 prontos para postar
```

## Como usar

**Pré-visualizar** (abre no navegador, cada slide roda em loop; clique num slide
para ouvir o áudio sincronizado; troque a música na barra superior):

```
carrossel/kml-propriedade/index.html
```

**Exportar** para o Instagram (uma vez por máquina: `npm i -D playwright && npx playwright install chromium`, e `ffmpeg` no PATH):

```bash
node carrossel/render.mjs carrossel/kml-propriedade/index.html             # PNG + MP4 com áudio
node carrossel/render.mjs carrossel/kml-propriedade/index.html --png-only  # só as imagens estáticas
node carrossel/render.mjs carrossel/kml-propriedade/index.html --music urbano --slides 1,6
```

Saída em `<pasta>/out/`: `01-slug.png` (frame de hold, a versão estática) e
`01-slug.mp4` (1080×1350, 30 fps, H.264 + AAC, loop perfeito). No Instagram,
misture: capa em vídeo, slides em vídeo ou PNG, conforme o ritmo que quiser.

**Criar um carrossel novo**: peça ao Claude Code. A skill `carrossel-animado`
(em `.claude/skills/`) transforma um pedido simples num briefing completo e
gera `carrossel/<slug>/index.html` usando este motor. As regras que ele é
obrigado a seguir estão no `CLAUDE.md` da raiz.

## Como funciona o motor

Cada slide é um `<section class="slide" data-dur="6">` de 1080×1350. Os elementos
declaram **o que** fazem e **quando**, por atributos:

```html
<h2 data-in="rise" data-at="0.4" data-sfx="whoosh" data-out="up">Título</h2>
<div data-in="pop"  data-at="1.0" data-sfx="pop">chip</div>
<span data-count="184" data-at="1.9" data-dur="1.5" data-sfx="ticker">0</span>
<p data-type data-at="1.3" data-cps="100" data-sfx="type">texto digitado…</p>
<path data-in="draw" data-at="0.4" data-dur="1.8" data-sfx="rise" d="…"/>
```

| atributo | o que faz |
|---|---|
| `data-in` | entrada: `fade rise sink left right pop zoom blur wipe wipe-up grow grow-y drop draw spin marker` |
| `data-at` / `data-dur` / `data-ease` | instante (s), duração (s) e curva (`out in pop linear inout`) |
| `data-out` | saída: `fade up down left shrink blur wipe` (padrão: no fim do slide, todos juntos) |
| `data-out-at` / `data-out-dur` | saída fora do padrão |
| `data-loop` | `pulse 1.5`, `float 2`, `blink 1`, `nudge 1.5`, `spin 4`, `shimmer 2` (use num wrapper separado) |
| `data-sfx` | `pop tick key whoosh swipe rise ding thud impact success error` + `ticker` (contador) e `type` (digitação); `auto` escolhe pelo preset |
| `data-sfx-at` / `data-sfx-gain` / `data-sfx-out` | ajustes finos do som |
| `data-count` / `data-from` / `data-decimals` | contador numérico (formato pt-BR) |
| `data-type` / `data-cps` | efeito de digitação |
| `data-progress` | barra que acompanha o tempo do slide |

No `<section>`: `data-dur` (duração), `data-hold` (instante do frame estático),
`data-exit-dur`, `data-music` (`cinematic` `intimista` `urbano` `none`), `data-bpm`, `data-label`.

O JS lê esses atributos, monta as `@keyframes`, **pausa todas as animações** e
passa a dirigi-las com um relógio mestre (`currentTime`). No preview o relógio é
o do navegador (ou o do áudio, quando tocando). No export o `render.mjs` chama
`__carousel.seek(slide, t)` frame a frame e tira screenshots; o áudio é
renderizado por `OfflineAudioContext` para WAV e mixado pelo ffmpeg. Nada é
gravado "ao vivo", por isso o resultado é determinístico.

A música é sintetizada (pad, baixo, bumbo, chimbal, arpejo) em 120 BPM. Com
slides de 6 s = 3 compassos, o loop fecha no compasso. Coloque os `data-at`
em múltiplos de 0,25 s para caírem nas batidas (0,5 s) e meias-batidas.

## A escada dos 7 níveis (resumo da aula)

1. **Prompt simples, sem instrução** — já sai algo interessante, mas genérico.
2. **CLAUDE.md + prompt** — regras fixas de ritmo, suavidade, peso, loop, sincronia. Resultado muito melhor.
3. **+ referência visual** — passe o site/produto; o Claude extrai paleta, tom e copy.
4. **Skill** — o Claude expande seu pedido curto num prompt completo e segue o processo. É a `carrossel-animado`.
5. **+ imagens geradas** (ferramenta externa, paga por crédito) para produtos/objetos complexos. Opcional; o motor aceita `<img>` normalmente.
6. **Sistema com memória** — tons de copy, kit de marca, fidelidade à referência, acervo.
7. **O processo aprende com você** — tudo que ficou bom vai para `carrossel/referencias/`. A skill olha lá antes de criar.

Este repositório cobre 1, 2, 3, 4 e 7 sem gastar nada.
