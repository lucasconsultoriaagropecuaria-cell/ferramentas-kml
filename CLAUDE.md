# Ferramentas da Consultoria — instruções para o Claude Code

Páginas HTML estáticas, sem build, em pt-BR. Identidade: verdes (`#173a16`,
`#1f5121`, `#2e7d32`, `#e9f3e2`), tipografia Inter/sistema. Tudo roda no
navegador do usuário e **nenhum documento sai do computador dele**; não
introduza chamadas a servidores externos nas ferramentas.

## Carrosséis animados (`carrossel/`)

Ao criar ou editar um carrossel, leia `carrossel/README.md` e use a skill
`carrossel-animado`. Regras obrigatórias:

**Formato**
- 1080×1350 (4:5), 5 a 8 slides, cada um `<section class="slide">` em `carrossel/<slug>/index.html`, usando `../engine.css` e `../engine.js`. Nunca reescreva o motor para um carrossel; se faltar um preset, adicione-o ao motor com nome genérico.
- Margem segura de 90 px. Nada de texto importante nos 140 px inferiores (barra de progresso e "arraste").
- Tamanhos mínimos em 1080 px: título 76 px, corpo 36 px, legenda 26 px. Peso 700+ nos títulos. Máximo ~12 palavras por título, ~25 por slide.

**Ritmo e movimento**
- Duração por slide: 6 s (ou 8 s), múltiplo do compasso de 2 s em 120 BPM. `data-at` em múltiplos de 0,25 s.
- Primeiro elemento entra em ≤ 0,5 s. Última entrada termina até `dur − 1,2 s`. Saída de todos juntos nos últimos 0,5 s (`data-out`), para que o último frame seja igual ao primeiro e o loop feche.
- Uma ideia por vez: elementos aparecem em sequência, com 0,25–0,4 s entre irmãos. No máximo 3 tipos de entrada por slide; use `rise` como padrão, `pop` para chips/selos, `draw` para traços, `drop` para objetos "que caem".
- Entradas de 0,5–0,8 s com `ease out`; saídas de 0,4–0,5 s com `ease in`. Nunca `transition` CSS: só `@keyframes` (o motor navega nas animações).
- `data-loop` só em wrapper separado do elemento que tem `data-in` com transform.
- `data-hold` num instante em que **todo** o conteúdo está visível (é o PNG estático).

**Som**
- Efeito sonoro somente em momentos que o olho acompanha: título principal (`whoosh`), chips/selos (`pop`), check (`ding`), objeto que cai (`thud`), carimbo (`impact`), contador (`ticker`), digitação (`type`), CTA final (`success`). Máximo 1 SFX por elemento, ~6–12 por slide; use `data-sfx-gain=".5"` em séries.
- Música: `cinematic` por padrão; `intimista` para conteúdo calmo/educativo; `urbano` para promessas fortes. Mesma música em todos os slides.

**Copy e estrutura**
- Slide 1 = gancho (promessa ou dor em uma frase + prova visual). Último = CTA ("link na bio", "salva", "manda pra alguém"). No meio: um passo/ideia por slide.
- Voz direta, 2ª pessoa, concreta. Números reais ou plausíveis do domínio (hectares, vértices, páginas). Nada de jargão de IA no texto do carrossel.
- Mantenha o chrome comum (marca, contador `n / total`, "arraste →", barra de progresso) via `<template id="chrome">`.

**Entrega**
- Sempre rode `node carrossel/render.mjs carrossel/<slug>/index.html --png-only`, olhe os PNGs e corrija sobreposições/cortes antes de gerar os MP4.
- Depois do render completo, confira 1 frame no meio e 1 nos últimos 0,2 s de ao menos um MP4 (o fim deve estar vazio como o início).
- Se o resultado ficou bom, registre em `carrossel/referencias/` (ver README de lá).
