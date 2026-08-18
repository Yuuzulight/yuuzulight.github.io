// Generates design/typography.html: the same Milky Grape composition rendered
// in four type systems, so the only variable is the typography.
const fs = require("fs");
const path = require("path");

const options = [
  {
    key: "outfit",
    title: "Outfit + Public Sans",
    display: "'Outfit', sans-serif",
    body: "'Public Sans', sans-serif",
    mono: "'JetBrains Mono', monospace",
    emphasis: "weight",
    note: "Current build. Geometric and round, friendly without being cute. No true italic, so emphasis has to come from weight and colour.",
    tracking: "-0.03em",
  },
  {
    key: "bricolage",
    title: "Bricolage Grotesque + Public Sans",
    display: "'Bricolage Grotesque', sans-serif",
    body: "'Public Sans', sans-serif",
    mono: "'JetBrains Mono', monospace",
    emphasis: "weight",
    note: "Most personality. Slightly irregular letterforms give the page a voice that a neutral grotesque cannot. Also has no italic.",
    tracking: "-0.025em",
  },
  {
    key: "jakarta",
    title: "Plus Jakarta Sans, one family",
    display: "'Plus Jakarta Sans', sans-serif",
    body: "'Plus Jakarta Sans', sans-serif",
    mono: "'IBM Plex Mono', monospace",
    emphasis: "italic",
    note: "Display and body from one family, which reads as the most deliberate. The only option here with a real drawn italic, so emphasis is genuine rather than synthesised.",
    tracking: "-0.028em",
  },
  {
    key: "grotesk",
    title: "Space Grotesk + Instrument Sans",
    display: "'Space Grotesk', sans-serif",
    body: "'Instrument Sans', sans-serif",
    mono: "'Space Mono', monospace",
    emphasis: "weight",
    note: "Most technical. Reads as engineering rather than design, which suits a data role, at the cost of some of the softness the palette is going for.",
    tracking: "-0.02em",
  },
];

const fontHref =
  "https://fonts.googleapis.com/css2" +
  "?family=Outfit:wght@400;500;600;700" +
  "&family=Public+Sans:ital,wght@0,400;0,500;1,400" +
  "&family=JetBrains+Mono:wght@400;500" +
  "&family=Bricolage+Grotesque:opsz,wght@12..96,400..800" +
  "&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,600;1,700" +
  "&family=IBM+Plex+Mono:wght@400;500" +
  "&family=Space+Grotesk:wght@400;500;600;700" +
  "&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,600" +
  "&family=Space+Mono:wght@400;700" +
  "&display=swap";

function emphasisMarkup(mode) {
  // Emphasis always comes from the same family as the headline. Injecting a
  // second family for one word is the amateur move.
  return mode === "italic"
    ? '<em class="em-italic">demo</em>'
    : '<b class="em-weight">demo</b>';
}

function mock(o) {
  return `
<div class="mock" style="--display:${o.display};--body:${o.body};--mono:${o.mono};--tracking:${o.tracking}">
  <div class="bleed"></div>
  <div class="inner">
    <nav class="nav">
      <div class="mark">yuuzu<span>.</span></div>
      <ul><li><a href="#">Work</a></li><li><a href="#">Stack</a></li><li><a href="#">About</a></li></ul>
      <a class="navcta" href="#">Contact</a>
    </nav>

    <span class="eyebrow">Data and AI engineering</span>
    <h2 class="h1">I build data platforms that keep running after the ${emphasisMarkup(o.emphasis)}.</h2>
    <p class="lede">I build data pipelines, train the models that run on them, and keep both alive in production.</p>
    <div class="ctas">
      <a class="btn primary" href="#">See the work<span class="cap">&#8594;</span></a>
      <a class="btn ghost" href="#">Get in touch</a>
    </div>

    <div class="stats">
      <div><b>63</b><span>dbt models on a daily schedule</span></div>
      <div><b>96,646</b><span>rows in a training set I built</span></div>
      <div><b>50+</b><span>hotels using the platform</span></div>
    </div>

    <div class="grid">
      <div class="shell"><div class="core">
        <span class="kind">Repository intelligence platform</span>
        <h3>Hecate</h3>
        <p>Tracks which software projects are actually growing, by joining package and repo data against what people are saying about them.</p>
        <div class="metric">63 dbt models in the transform layer</div>
        <div class="tags"><span>Python</span><span>dbt</span><span>Kubernetes</span><span>PostgreSQL</span></div>
      </div></div>
      <div class="shell alt"><div class="core">
        <span class="kind">Fine-tuned AI-text detector</span>
        <h3>Veritarach</h3>
        <p>A DeBERTa-v3 classifier deployed as a live service and registered on-chain as an inference node.</p>
        <div class="metric">99.65% F1 on its held-out split</div>
        <div class="tags"><span>PyTorch</span><span>FastAPI</span><span>Docker</span></div>
      </div></div>
    </div>
  </div>
</div>`;
}

const blocks = options
  .map(
    (o, i) => `
<div class="vbar">
  <span class="n">Option ${i + 1}</span>
  <span class="t">${o.title}</span>
  <span class="d">${o.note}</span>
</div>
${mock(o)}`
  )
  .join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Typography previews</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontHref}" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:#e9e8ee;color:#1b1922;font-family:'Public Sans',system-ui,sans-serif}

.chrome{max-width:1080px;margin:0 auto;padding:56px 24px 8px}
.chrome h1{font-family:'Outfit',sans-serif;font-weight:600;font-size:26px;letter-spacing:-.02em;margin:0 0 10px}
.chrome p{margin:0;max-width:64ch;line-height:1.6;font-size:15px;color:#4d4a57}
.vbar{max-width:1080px;margin:60px auto 14px;padding:0 24px}
.vbar .n{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#8a8694;margin-right:12px}
.vbar .t{font-family:'Outfit',sans-serif;font-weight:600;font-size:19px;letter-spacing:-.01em}
.vbar .d{display:block;margin-top:6px;font-size:14px;line-height:1.55;color:#5f5c69;max-width:70ch}

/* Milky Grape, held constant across all four */
.mock{
  --paper:#f1f0fa; --surface:#fff; --surface-2:#eae8f7; --ink:#1f1b2e; --muted:#5f5978;
  --accent:#5b2bb8; --tint:#dcd9f5; --tint-2:#e7e4fa; --hairline:rgba(31,27,46,.10);
  position:relative;overflow:hidden;background:var(--paper);color:var(--ink);
  border-radius:26px;max-width:1080px;margin:0 auto;
  box-shadow:0 30px 70px -50px rgba(20,16,40,.55);
  font-family:var(--body);
}
.bleed{position:absolute;inset:0;pointer-events:none}
.bleed::before{content:"";position:absolute;width:720px;height:720px;left:-240px;top:-360px;
  background:radial-gradient(circle at center,rgba(196,190,244,.55) 0%,transparent 66%)}
.bleed::after{content:"";position:absolute;width:780px;height:780px;right:-300px;top:-240px;
  background:radial-gradient(circle at center,rgba(146,120,226,.32) 0%,transparent 64%)}
.inner{position:relative;padding:30px 40px 40px}

.nav{display:flex;align-items:center;gap:22px;margin-bottom:56px}
.mark{font-family:var(--display);font-weight:700;font-size:17px;letter-spacing:-.02em}
.mark span{color:var(--accent)}
.nav ul{list-style:none;display:flex;gap:20px;margin:0 0 0 auto;padding:0}
.nav a{font-size:13.5px;color:var(--muted);text-decoration:none}
.navcta{background:var(--accent);color:#fff !important;border-radius:999px;padding:9px 16px;
  font-family:var(--display);font-weight:500;font-size:13.5px;text-decoration:none}

.eyebrow{display:inline-block;font-family:var(--mono);font-size:10.5px;letter-spacing:.18em;
  text-transform:uppercase;color:var(--accent);background:var(--tint-2);border-radius:999px;padding:6px 13px}
.h1{font-family:var(--display);font-weight:600;font-size:clamp(34px,4.3vw,52px);line-height:1.05;
  letter-spacing:var(--tracking);margin:22px 0 18px;max-width:19ch}
.em-italic{font-style:italic;color:var(--accent);display:inline-block;line-height:1.14;padding-bottom:2px}
.em-weight{font-weight:700;color:var(--accent)}
.lede{margin:0 0 28px;font-size:17px;line-height:1.68;color:var(--muted);max-width:48ch}

.ctas{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:44px}
.btn{display:inline-flex;align-items:center;gap:12px;text-decoration:none;font-family:var(--display);
  font-weight:500;font-size:14.5px;border-radius:999px;min-height:44px;padding:0 8px 0 20px}
.btn.primary{background:var(--accent);color:#fff;box-shadow:0 16px 34px -18px rgba(91,43,184,.8)}
.btn.primary .cap{width:30px;height:30px;border-radius:999px;background:rgba(255,255,255,.2);
  display:grid;place-items:center;font-size:13px}
.btn.ghost{background:var(--surface);color:var(--ink);padding:0 20px;box-shadow:inset 0 0 0 1px var(--hairline)}

.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:26px 28px;margin-bottom:38px;
  background:rgba(255,255,255,.7);border-radius:26px;box-shadow:inset 0 0 0 1px var(--hairline)}
.stats b{display:block;font-family:var(--display);font-weight:600;font-size:30px;letter-spacing:-.02em}
.stats span{display:block;margin-top:5px;font-size:13px;line-height:1.35;color:var(--muted)}

.grid{display:grid;grid-template-columns:1.3fr 1fr;gap:16px}
.shell{background:var(--tint);border-radius:30px;padding:7px;box-shadow:inset 0 0 0 1px var(--hairline)}
.shell.alt{background:linear-gradient(135deg,rgba(123,82,212,.3),var(--tint))}
.core{background:var(--surface);border-radius:23px;padding:24px 26px;height:100%;
  box-shadow:inset 0 1px 1px rgba(255,255,255,.9)}
.kind{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted)}
.core h3{font-family:var(--display);font-weight:600;font-size:22px;letter-spacing:-.02em;margin:12px 0 8px}
.core p{margin:0 0 14px;font-size:14px;line-height:1.62;color:var(--muted)}
.metric{font-family:var(--mono);font-size:12px;color:var(--accent);margin-bottom:14px}
.tags{display:flex;gap:6px;flex-wrap:wrap}
.tags span{font-size:11.5px;background:var(--surface-2);border-radius:8px;padding:4px 9px}

@media (max-width:820px){
  .inner{padding:24px 20px 30px}
  .grid,.stats{grid-template-columns:1fr}
  .nav ul{display:none}
}
</style>
</head>
<body>
<div class="chrome">
  <h1>Four type systems, same palette and layout</h1>
  <p>Milky Grape and the composition are held constant, so the only thing changing is the typography. Note how each one handles the emphasised word in the headline: only Plus Jakarta Sans has a real drawn italic. The others use weight and colour instead, because faking an italic the family does not have is a visible tell.</p>
</div>
${blocks}
<div style="height:80px"></div>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, "typography.html"), html, "utf8");
console.log("wrote typography.html, " + html.length + " bytes, " + options.length + " options");
