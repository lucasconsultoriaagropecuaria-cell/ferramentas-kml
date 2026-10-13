---
name: carrossel-animado
description: Cria um carrossel animado para Instagram (1080x1350, textos e elementos em movimento, música e efeitos sonoros sincronizados, loop perfeito) a partir de um pedido simples. Use quando o usuário pedir carrossel, post em carrossel, slides para Instagram, "carrossel vivo" ou animado.
---

# Carrossel animado

Você vai transformar um pedido curto num briefing completo e depois num
`carrossel/<slug>/index.html` que usa `carrossel/engine.css` + `carrossel/engine.js`.
Leia antes: `CLAUDE.md` (regras obrigatórias), `carrossel/README.md` (atributos
do motor) e `carrossel/referencias/` (o que o usuário já aprovou). Use
`carrossel/kml-propriedade/index.html` como exemplo de estrutura.

## 1. Expanda o pedido num briefing (escreva-o antes de codar)

Responda, em poucas linhas cada, e só pergunte ao usuário se algo for
impossível de inferir:

- **Público e dor**: quem vê, o que incomoda, o que ganha.
- **Promessa do gancho** (slide 1): uma frase, concreta, com prova visual (número, objeto, antes/depois).
- **Estrutura**: 5–8 slides, um título por slide, 1 ideia por slide, último = CTA. Liste título + sub + elemento visual de cada um.
- **Referência**: se o usuário passou site/produto/imagem, extraia paleta, tom de voz, nomes reais, prints ou formas que valham ser reproduzidas em CSS/SVG. Se citou fidelidade (baixa/média/alta), respeite.
- **Tom de copy**: automático (escolha), natural, didático, storyteller, especialista ou viral. Aplique em todos os textos.
- **Identidade**: paleta (padrão: a do repositório — verdes + lima `#c5f26b` + creme `#f3f1e6`), fonte Inter, chrome comum.
- **Ritmo**: 6 s por slide, 120 BPM, música (`cinematic` padrão). Para cada slide, a linha do tempo: `t → elemento → entrada → sfx`. Primeiro elemento ≤ 0,5 s; última entrada ≤ 4,8 s; saída em 5,4 s; `data-hold` quando tudo está visível.
- **Som**: só nos momentos que o olho segue (ver CLAUDE.md). Escreva a lista de SFX por slide.

## 2. Construa

1. Copie a estrutura de `kml-propriedade/index.html` (head, `<style>` da identidade, `<template id="chrome">`, scripts).
2. Escreva os slides com os atributos `data-*`. Texto grande, pouco texto, elementos visuais em CSS/SVG (polígonos, documentos, chips, barras, pinos, cards). Sem imagens externas, a menos que o usuário forneça arquivos; nesse caso, `<img>` na pasta do carrossel.
3. Tempos em múltiplos de 0,25 s. Irmãos em cascata de 0,25–0,4 s.

## 3. Verifique (obrigatório)

```bash
node carrossel/render.mjs carrossel/<slug>/index.html --png-only
```

Abra cada PNG e procure: texto cortado ou sobreposto, elementos fora da
margem, título > 2 linhas, chip estourando a largura, frame de hold sem
algum elemento. Corrija e repita. Depois:

```bash
node carrossel/render.mjs carrossel/<slug>/index.html
```

Extraia e olhe um frame no meio e um nos últimos 0,2 s de um MP4
(`ffmpeg -ss 5.9 -i out/01-<slug>.mp4 -frames:v 1 f.png`): o fim deve
estar vazio como o início.

## 4. Entregue

Diga onde estão os arquivos (`out/`), quais slides são vídeo, a música
escolhida e o que mudaria com outra. Ofereça: trocar música/tom, mais ou
menos slides, versão só estática. Se o usuário aprovar, registre em
`carrossel/referencias/` conforme o README de lá.
