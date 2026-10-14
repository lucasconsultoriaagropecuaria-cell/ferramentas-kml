# -*- coding: utf-8 -*-
"""Gera a série "A Linha em 1 Minuto" — 1 carrossel animado por linha de
investimento, esqueleto comum de 5 slides. Rodar: py _build_linha1min.py
Fontes: MCR 757 (7-4, 7-7, 8-1, 11-3, 11-4, 11-5, 11-7, 11-9) e
Circulares BNDES 96-98 e 100/2026 — tudo auditado nos gauntlets das
semanas 2-6 (ver memória do projeto instagram)."""
import sys
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")

BASE = Path(__file__).parent

TPL = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Carrossel — Linha em 1 minuto: %%NOME%%</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../engine.css">
<style>
  :root{
    --g900:#0e2318; --g800:#143524; --g700:#1f5c3a; --g600:#2e7d4f;
    --lime:#cbe96a; --cream:#f3f1e6; --mute:#a3b8a4; --paper:#fffdf6; --ink:#23291f; --red:#d9442b;
    --accent:var(--lime); --marker:rgba(203,233,106,.9);
  }
  .slide{background:radial-gradient(120% 90% at 20% 0%, #1b4a33 0%, var(--g800) 45%, var(--g900) 100%);color:var(--cream)}
  .slide .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px);background-size:90px 90px;mask-image:radial-gradient(80% 70% at 50% 40%,#000 40%,transparent 100%)}
  .h1 em,.h2 em,.h3 em{font-style:normal;color:var(--g900)}
  .h1 .lime,.h2 .lime,.h3 .lime{color:var(--lime)}
  .mute{color:var(--mute)}
  .col{position:absolute;left:var(--pad);right:var(--pad);display:flex;flex-direction:column;gap:28px}
  .col.top{top:180px}.col.bottom{bottom:150px}
  .chrome-top{position:absolute;top:70px;left:var(--pad);right:var(--pad);display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:26px;letter-spacing:.06em;color:var(--mute)}
  .chrome-top b{color:var(--cream)}
  .chrome-bottom{position:absolute;bottom:60px;right:var(--pad);font-weight:700;font-size:26px;letter-spacing:.08em;color:var(--lime);text-transform:uppercase}
  .chrome-bottom span{display:inline-block}
  .chip{display:inline-flex;align-items:center;gap:16px;padding:18px 30px;border-radius:999px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.14);font-weight:700;font-size:33px;color:var(--cream);width:max-content;max-width:100%}
  .chip.lime{background:var(--lime);border-color:var(--lime);color:var(--g900)}
  .card{background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.12);border-radius:28px;padding:34px 38px}
  .cta{display:inline-flex;align-items:center;gap:18px;background:var(--lime);color:var(--g900);font-weight:900;font-size:42px;padding:28px 50px;border-radius:999px;box-shadow:0 20px 50px rgba(203,233,106,.25)}
  .foot{font-weight:600;font-size:24px;color:var(--mute);line-height:1.5}
  .s1 .h1{font-size:88px;line-height:1.14}
  .selo{display:inline-flex;align-items:center;gap:14px;padding:14px 28px;border-radius:999px;background:var(--lime);color:var(--g900);font-weight:900;font-size:30px;letter-spacing:.06em;text-transform:uppercase;width:max-content}
  .lista{display:flex;flex-direction:column;gap:16px}
  .cond{display:flex;flex-direction:column;gap:18px;margin-top:14px}
  .cond .row{display:flex;align-items:center;gap:24px;padding:26px 34px;border-radius:22px;background:rgba(255,255,255,.07);border:2px solid rgba(255,255,255,.12)}
  .cond .lbl{flex:1;font-weight:600;font-size:34px}
  .cond .val{font-weight:900;font-size:40px;color:var(--lime);font-variant-numeric:tabular-nums;white-space:nowrap}
</style>
</head>
<body data-music="%%MUSICA%%" data-bpm="120">
<div class="deck">

<section class="slide s1" data-dur="6" data-hold="4.6" data-label="Capa">
  <div class="grid"></div>
  <div class="col top" style="gap:26px">
    <div class="selo" data-in="pop" data-at="0.4" data-sfx="pop" data-out="shrink">A linha em 1 minuto</div>
    <h1 class="h1">
      <span style="display:block" data-in="rise" data-at="0.8" data-sfx="whoosh" data-out="up">%%CAPA1%%</span>
      <span style="display:block" data-in="rise" data-at="1.1" data-out="up">%%CAPA2%%</span>
    </h1>
    <p class="h3 mute" data-in="rise" data-at="2.0" data-out="up">%%SUB%%</p>
  </div>
  <div class="col bottom">
    <p class="p mute" data-in="fade" data-at="3.0" data-out="fade">Salva a coleção: uma linha por fim de semana.</p>
  </div>
</section>

<section class="slide" data-dur="6" data-hold="5.0" data-label="O que compra">
  <div class="grid"></div>
  <div class="col top">
    <h2 class="h2" data-in="rise" data-at="0.4" data-sfx="whoosh" data-out="up">O que ela<br><span class="lime">compra</span></h2>
    <div class="lista" style="margin-top:16px">
      <div class="chip" data-in="rise" data-at="1.2" data-sfx="pop" data-sfx-gain=".5" data-out="down">%%C1%%</div>
      <div class="chip" data-in="rise" data-at="1.5" data-sfx="pop" data-sfx-gain=".5" data-out="down">%%C2%%</div>
      <div class="chip" data-in="rise" data-at="1.8" data-sfx="pop" data-sfx-gain=".5" data-out="down">%%C3%%</div>
      <div class="chip" data-in="rise" data-at="2.1" data-sfx="pop" data-sfx-gain=".5" data-out="down">%%C4%%</div>
      <div class="chip" data-in="rise" data-at="2.4" data-sfx="pop" data-sfx-gain=".5" data-out="down">%%C5%%</div>
    </div>
  </div>
  <div class="col bottom">
    <p class="foot" data-in="fade" data-at="4.0" data-out="fade">%%QUEM%%</p>
  </div>
</section>

<section class="slide" data-dur="6" data-hold="5.0" data-label="Condições">
  <div class="grid"></div>
  <div class="col top">
    <h2 class="h2" data-in="rise" data-at="0.4" data-sfx="whoosh" data-out="up">As condições<br><span class="lime">(sempre "até")</span></h2>
    <div class="cond" data-out="fade">
      <div class="row" data-in="left" data-at="1.1" data-sfx="swipe"><span class="lbl">%%K1%%</span><span class="val">%%V1%%</span></div>
      <div class="row" data-in="left" data-at="1.5" data-sfx="swipe" data-sfx-gain=".5"><span class="lbl">%%K2%%</span><span class="val">%%V2%%</span></div>
      <div class="row" data-in="left" data-at="1.9" data-sfx="swipe" data-sfx-gain=".5"><span class="lbl">%%K3%%</span><span class="val">%%V3%%</span></div>
      <div class="row" data-in="left" data-at="2.3" data-sfx="swipe" data-sfx-gain=".5"><span class="lbl">%%K4%%</span><span class="val">%%V4%%</span></div>
    </div>
  </div>
  <div class="col bottom">
    <p class="foot" data-in="fade" data-at="4.2" data-out="fade">%%CONDNOTA%%</p>
  </div>
</section>

<section class="slide" data-dur="6" data-hold="5.0" data-label="O truque">
  <div class="grid"></div>
  <div class="col top" style="gap:26px">
    <h2 class="h2" data-in="rise" data-at="0.4" data-sfx="whoosh" data-out="up">O detalhe que<br><span class="lime">ninguém te conta</span></h2>
    <div class="card" data-in="drop" data-at="1.2" data-sfx="thud" data-out="down">
      <p class="p" style="line-height:1.55">%%TRUQUE%%</p>
    </div>
    <div class="chip lime" data-in="pop" data-at="3.0" data-sfx="ding" data-out="down">%%TRUQUECHIP%%</div>
  </div>
  <div class="col bottom">
    <p class="foot" data-in="fade" data-at="4.3" data-out="fade">%%TRUQUENOTA%%</p>
  </div>
</section>

<section class="slide" data-dur="6" data-hold="4.6" data-label="CTA" data-no-swipe>
  <div class="grid"></div>
  <div class="col top" style="gap:24px">
    <h1 class="h1" style="font-size:84px;line-height:1.14">
      <span style="display:block" data-in="rise" data-at="0.4" data-sfx="whoosh" data-out="up">%%CTA1%%</span>
      <span style="display:block" data-in="rise" data-at="0.7" data-out="up"><em data-in="marker" data-at="1.3" data-sfx="swipe">%%CTA2%%</em></span>
    </h1>
  </div>
  <div class="col bottom" style="gap:24px">
    <div data-loop="pulse 1.5" style="width:max-content"><div class="cta" data-in="pop" data-at="2.4" data-sfx="success" data-out="shrink">%%CTABTN%%</div></div>
    <p class="foot" data-in="fade" data-at="3.2" data-out="fade">Sujeito à análise do banco · agricultura familiar: Pronaf<br>%%FONTES%%</p>
  </div>
</section>

</div>
<template id="chrome">
  <div class="chrome-top"><span>🌱 <b>@creditoruralsp</b></span><span><b class="n"></b> / <span class="total"></span></span></div>
  <div class="chrome-bottom" data-in="fade" data-at="1.6" data-out="fade"><span data-loop="nudge 1.5">arraste →</span></div>
  <div class="progress" data-progress><i></i></div>
</template>
<script>
  (function(){const tpl=document.getElementById('chrome'),slides=document.querySelectorAll('.slide');slides.forEach((s,i)=>{const c=tpl.content.cloneNode(true);c.querySelector('.n').textContent=i+1;c.querySelector('.total').textContent=slides.length;if(s.hasAttribute('data-no-swipe'))c.querySelector('.chrome-bottom').remove();s.appendChild(c);});})();
</script>
<script src="../engine.js"></script>
</body>
</html>
"""

LINHAS = {
"linha-renovagro": dict(
  NOME="RenovAgro", MUSICA="cinematic",
  CAPA1="RENOVAGRO:", CAPA2='o juro que <span class="lime">recupera a fazenda</span>',
  SUB="Pasto degradado, floresta e solo —<br>a partir de 8,5% ao ano.",
  C1="🌱 Recuperar pastagem degradada", C2="🌾 Plantio direto e correção de solo",
  C3="🐂 Integração lavoura-pecuária-floresta", C4="🌳 Florestas, APP e Reserva Legal",
  C5="♻️ Biodigestor e bioinsumos",
  QUEM="Produtores e cooperativas — sem régua de renda pra entrar.",
  K1="Taxa (Recuperação/Ambiental)", V1="até 8,5% a.a.", K2="Demais finalidades", V2="até 9,5% a.a.",
  K3="Limite por ano", V3="R$ 5 milhões", K4="Prazo (florestas: 12)", V4="até 10 anos",
  CONDNOTA="Até 100% financiado · carência de até 60 meses (florestas: até 96).",
  TRUQUE='O limite dos R$ 5 milhões é <b style="color:var(--lime)">independente dos seus outros créditos</b> de taxa tabelada — e admite mais de uma operação por ano.',
  TRUQUECHIP="Atenção: vedado onde houve supressão de vegetação nativa",
  TRUQUENOTA="Projeto pede croqui, histórico da área e análise de solo com matéria orgânica.",
  CTA1="O pasto cansado", CTA2="tem juro de prioridade.", CTABTN="Salva — linha 1 da coleção",
  FONTES="Fontes: MCR 11-7 e 7-7 · Circular BNDES 96/2026"),

"linha-moderfrota": dict(
  NOME="Moderfrota", MUSICA="urbano",
  CAPA1="MODERFROTA:", CAPA2='a porta do <span class="lime">trator</span>',
  SUB="Trator, colheitadeira e autopropelidas —<br>novos e usados, sem teto de valor.",
  C1="🚜 Tratores e implementos associados", C2="🌾 Colheitadeiras e plataformas",
  C3="💧 Autopropelidas de pulverização", C4="☕ Equipamentos de café",
  C5="🔧 Usados com certificado de concessionária",
  QUEM="Produtores e cooperativas com renda até R$ 45 mi/ano (somando o grupo econômico).",
  K1="Taxa geral", V1="até 12,5% a.a.", K2="Taxa Pronamp", V2="até 11,5% a.a.",
  K3="Financiamento do bem", V3="até 85–100%", K4="Prazo novos / usados", V4="7 / 4 anos",
  CONDNOTA="1ª parcela em até 14 meses — comprou no plantio, a colheita paga.",
  TRUQUE='Quem cabe na régua do Pronamp (renda até R$ 3,5 mi) leva <b style="color:var(--lime)">100% do bem financiado</b> — entrada zero — e a taxa cai pra até 11,5%.',
  TRUQUECHIP="Máquina a biometano de dejetos: 100% pra qualquer porte",
  TRUQUENOTA="Usados têm idade máxima: trator 8 anos, colheitadeira 10, plantadeira 5.",
  CTA1="Peça o enquadramento", CTA2="junto com a proposta.", CTABTN="Salva — linha 2 da coleção",
  FONTES="Fontes: MCR 11-5 e 7-7 · Circular BNDES 100/2026"),

"linha-inovagro": dict(
  NOME="Inovagro", MUSICA="intimista",
  CAPA1="INOVAGRO:", CAPA2='a fazenda <span class="lime">conectada</span>',
  SUB="Automação, energia e gestão —<br>até R$ 4 mi por ano, fora dos outros limites.",
  C1="🤖 Automação de granja, ordenha e corte", C2="☀️ Energia renovável p/ consumo próprio",
  C3="📡 Precisão e internet no campo", C4="💻 Softwares, consultorias e genética",
  C5="🏗️ Galpões de máquinas e insumos",
  QUEM="Produtores e cooperativas — sem régua de renda pra entrar.",
  K1="Taxa", V1="até 11,5% a.a.", K2="Financiamento do bem", V2="até 100%",
  K3="Limite individual/ano", V3="R$ 4 milhões", K4="Prazo", V4="até 10 anos",
  CONDNOTA="Carência de até 24 meses · pecuária leiteira amortiza até MENSALMENTE.",
  TRUQUE='Cerca elétrica, brinco, poço artesiano e estação do tempo estão na lista expressa — e a norma já os considera <b style="color:var(--lime)">aprovados nos programas de qualidade</b>, sem burocracia extra.',
  TRUQUECHIP="Trator aqui? Só pra forragem, e no máx. 30%",
  TRUQUENOTA="O que cabe no Moderfrota é vedado no Inovagro — cada bem na sua porta.",
  CTA1="Junte as miudezas", CTA2="num projeto só.", CTABTN="Salva — linha 3 da coleção",
  FONTES="Fontes: MCR 11-4 e 7-7 · Circular BNDES 98/2026"),

"linha-pca": dict(
  NOME="PCA", MUSICA="cinematic",
  CAPA1="PCA:", CAPA2='o armazém a <span class="lime">até 8%</span>',
  SUB="Construir, ampliar, reformar e modernizar —<br>silos e câmaras frias.",
  C1="🌾 Silos e armazéns de grãos", C2="🍊 Câmaras frias p/ fruta e hortaliça",
  C3="🔧 Reforma e modernização do que existe", C4="⚙️ Secador, elevador e balança",
  C5="📦 Até açúcar e derivados (exceto etanol)",
  QUEM="Produtores e cooperativas — a taxa depende da capacidade, não do seu tamanho.",
  K1="Grãos (réguas de 12 mil t)", V1="até 8% a.a.", K2="Demais (câmara fria)", V2="até 9,5% a.a.",
  K3="Limite grãos/ano", V3="R$ 50 milhões", K4="Prazo", V4="até 10 anos",
  CONDNOTA="Até 100% financiado · carência de até 2 anos · amortização até mensal.",
  TRUQUE='As duas réguas de 12.000 t (o que você TEM e o que vai FINANCIAR) <b style="color:var(--lime)">não se somam</b>: 8 mil existentes + 5 mil novas = 13 mil finais, ainda a até 8%.',
  TRUQUECHIP="Capacidade estática se mede ANTES do orçamento",
  TRUQUENOTA="Exige projeto técnico específico por profissional habilitado (item 8.2).",
  CTA1="Quem guarda,", CTA2="escolhe quando vender.", CTABTN="Salva — linha 4 da coleção",
  FONTES="Fontes: MCR 11-9 e 7-7 · Circular BNDES 97/2026"),

"linha-pronamp-invest": dict(
  NOME="Pronamp Investimento", MUSICA="viola",
  CAPA1="PRONAMP:", CAPA2='o até 9% que constrói <span class="lime">a fazenda</span>',
  SUB="Benfeitoria, pastagem, solo e canavial —<br>pro médio produtor.",
  C1="🏗️ Barracão e benfeitorias permanentes", C2="🌱 Formar e recuperar pastagem",
  C3="🪨 Calcário e correção de solo", C4="🎋 Reforma de canavial",
  C5="💧 Irrigação e energia própria",
  QUEM="Renda bruta anual até R$ 3,5 mi (80% do campo) — vale arrendatário, parceiro e posseiro.",
  K1="Taxa", V1="até 9% a.a.", K2="Limite por ano", V2="R$ 600 mil",
  K3="Prazo (equalizado)", V3="até 8 anos", K4="Carência (equalizado)", V4="até 2 anos",
  CONDNOTA="Animais de reprodução: permitidos no equalizado até 30% do projeto.",
  TRUQUE='O 9% <b style="color:var(--lime)">não compra máquina</b>: trator e colheitadeira são vedados aqui (MCR 8-1-5) — eles saem pelo Moderfrota, com até 100% financiado pro Pronamp.',
  TRUQUECHIP="Cada dinheiro tem a sua porta",
  TRUQUENOTA="Máquina usada fora do Moderfrota entra com laudo do responsável técnico.",
  CTA1="O enquadramento vem", CTA2="antes do orçamento.", CTABTN="Salva — linha 5 da coleção",
  FONTES="Fontes: MCR 8-1 e 7-4 (Res CMN 5.229, 5.322 e 5.324)"),

"linha-proirriga": dict(
  NOME="Proirriga", MUSICA="intimista",
  CAPA1="PROIRRIGA:", CAPA2='água e estufa <span class="lime">financiadas</span>',
  SUB="Irrigação completa e cultivo protegido —<br>até R$ 3,5 mi por ano.",
  C1="💧 Sistema de irrigação completo", C2="⚡ Infraestrutura elétrica do pivô",
  C3="🏞️ Reserva de água e monitoramento de umidade", C4="🏠 Estufas p/ horta, fruta, flor e café",
  C5="🧊 Tela antigranizo na fruticultura",
  QUEM="Produtores e cooperativas — sem régua de renda pra entrar.",
  K1="Taxa", V1="até 11,5% a.a.", K2="Limite individual/ano", V2="R$ 3,5 milhões",
  K3="Coletivo", V3="R$ 10,5 milhões", K4="Prazo", V4="até 8 anos",
  CONDNOTA="Carência de até 12 meses — mais curta que a dos irmãos: fluxo tem que fechar cedo.",
  TRUQUE='O limite é <b style="color:var(--lime)">independente dos seus outros créditos</b> controlados — e a infraestrutura elétrica e a reserva de água entram JUNTO com o sistema, num projeto só.',
  TRUQUECHIP="Irrigação anda junto com a outorga (ou dispensa) da água",
  TRUQUENOTA="Estação meteorológica entra, autorizando o compartilhamento dos dados.",
  CTA1="Quem irriga, colhe", CTA2="quando os outros esperam.", CTABTN="Salva — linha 6 da coleção",
  FONTES="Fontes: MCR 11-3 e 7-7 (Res CMN 5.228)"),
}

for slug, d in LINHAS.items():
    html = TPL
    for k, v in d.items():
        html = html.replace(f"%%{k}%%", v)
    pasta = BASE / slug
    pasta.mkdir(exist_ok=True)
    (pasta / "index.html").write_text(html, encoding="utf-8")
    print(f"{slug} ok")
print("6 carrosséis da série gerados.")
