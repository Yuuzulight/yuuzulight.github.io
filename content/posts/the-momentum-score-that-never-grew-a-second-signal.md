---
title: The momentum score that never grew a second signal
date: 2026-08-21
summary: Hecate's growth windows filled right on schedule a week after launch. The raw momentum score built on top of them still ties five unrelated repositories at a cap, and the fix for that lives in a dashboard query, not in the underlying data.
tags: ["hecate", "data-engineering", "sql"]
draft: false
---

On 2026-08-07, Hecate had exactly one day of snapshot history for every repository it
tracks, so every 7- and 30-day growth window was correctly NULL, and the momentum
ranking meant to blend growth, usage and attention into one score had nothing to blend.
It scored on attention alone, `growth_component` was NULL across all 2,011 rows, and
`signals_measured` was 1 everywhere. The plan was to check again once a week of real
history existed and see whether that resolved on its own.

A week later, the data problem is genuinely fixed, though not without a gap. Snapshots
landed on thirteen of the fourteen days between 2026-08-07 and 2026-08-20; 2026-08-18 has
no snapshot at all, because Docker Desktop failed to start that morning and the day's
collection never ran. A missed day like that can't be backfilled after the fact, it
describes a moment that's already passed. It didn't corrupt anything downstream, though:
every 7-day comparison here lands on an exact snapshot match seven days out, so a
repository's growth figure either exists from a real pair of snapshots or doesn't exist
at all, it never quietly falls back to a stale day.

<figure class="mt-8">
  <div class="overflow-x-auto rounded-[26px] bg-surface p-5 ring-1 ring-hairline ring-inset sm:p-7">
    <svg viewBox="0 0 560 250" role="img" aria-label="Line chart: repositories tracked per daily snapshot, 7 to 20 August 2026. The line rises from 2,010 to 2,079 with one break: no snapshot exists for 18 August." style="width:100%;height:auto;min-width:480px">
      <line x1="30" y1="220" x2="530" y2="220" stroke="var(--color-hairline)" stroke-width="1" />
      <line x1="445.9" y1="40" x2="445.9" y2="220" stroke="var(--color-accent)" stroke-width="1.5" stroke-dasharray="4,4" />
      <text x="445.9" y="30" text-anchor="middle" font-family="var(--font-sans)" font-size="11.5" fill="var(--color-accent)">18 Aug — missing</text>
      <polyline points="40,200 76.9,196 113.8,194 150.7,176 187.6,162 224.5,154 261.4,150 298.3,136 335.2,128 372.1,92 409,84" fill="none" stroke="var(--color-accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      <polyline points="482.8,70 519.7,62" fill="none" stroke="var(--color-accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      <circle cx="40" cy="200" r="4" fill="var(--color-accent)" stroke="var(--color-surface)" stroke-width="2" />
      <circle cx="76.9" cy="196" r="4" fill="var(--color-accent)" stroke="var(--color-surface)" stroke-width="2" />
      <circle cx="113.8" cy="194" r="4" fill="var(--color-accent)" stroke="var(--color-surface)" stroke-width="2" />
      <circle cx="150.7" cy="176" r="4" fill="var(--color-accent)" stroke="var(--color-surface)" stroke-width="2" />
      <circle cx="187.6" cy="162" r="4" fill="var(--color-accent)" stroke="var(--color-surface)" stroke-width="2" />
      <circle cx="224.5" cy="154" r="4" fill="var(--color-accent)" stroke="var(--color-surface)" stroke-width="2" />
      <circle cx="261.4" cy="150" r="4" fill="var(--color-accent)" stroke="var(--color-surface)" stroke-width="2" />
      <circle cx="298.3" cy="136" r="4" fill="var(--color-accent)" stroke="var(--color-surface)" stroke-width="2" />
      <circle cx="335.2" cy="128" r="4" fill="var(--color-accent)" stroke="var(--color-surface)" stroke-width="2" />
      <circle cx="372.1" cy="92" r="4" fill="var(--color-accent)" stroke="var(--color-surface)" stroke-width="2" />
      <circle cx="409" cy="84" r="4" fill="var(--color-accent)" stroke="var(--color-surface)" stroke-width="2" />
      <circle cx="482.8" cy="70" r="4" fill="var(--color-accent)" stroke="var(--color-surface)" stroke-width="2" />
      <circle cx="519.7" cy="62" r="4" fill="var(--color-accent)" stroke="var(--color-surface)" stroke-width="2" />
      <text x="40" y="188" text-anchor="start" font-family="var(--font-display)" font-weight="600" font-size="13" fill="var(--color-ink)">2,010</text>
      <text x="409" y="72" text-anchor="middle" font-family="var(--font-display)" font-weight="600" font-size="13" fill="var(--color-ink)">2,068</text>
      <text x="474.8" y="74" text-anchor="end" font-family="var(--font-display)" font-weight="600" font-size="13" fill="var(--color-ink)">2,075</text>
      <text x="519.7" y="50" text-anchor="end" font-family="var(--font-display)" font-weight="600" font-size="13" fill="var(--color-ink)">2,079</text>
      <text x="40" y="236" text-anchor="middle" font-family="var(--font-sans)" font-size="12.5" fill="var(--color-muted)">7 Aug</text>
      <text x="519.7" y="236" text-anchor="middle" font-family="var(--font-sans)" font-size="12.5" fill="var(--color-muted)">20 Aug</text>
    </svg>
  </div>
  <figcaption class="mt-3 text-[0.83rem] leading-relaxed text-muted">Repositories tracked per daily snapshot. The count climbs from 2,010 to 2,079 as discovery adds new repos, with one real break: no snapshot exists for 18 August.</figcaption>
</figure>

2,010 of the roughly 2,079 tracked repositories now have thirteen days of observed
history and a populated `stars_gained_7d`. Net star growth across the whole catalog for
the week was +611,090 (46,590,814 → 47,201,904), and the absolute leaders look exactly
like leaders should: `public-apis` up 11,138 stars, `skills` up 9,794, `MoneyPrinterTurbo`
up 9,733.

<figure class="mt-8">
  <div class="overflow-x-auto rounded-[26px] bg-surface p-5 ring-1 ring-hairline ring-inset sm:p-7">
    <svg viewBox="0 0 560 345" role="img" aria-label="Horizontal bar chart: top 10 repositories by absolute 7-day star growth. public-apis +11,138, skills +9,794, MoneyPrinterTurbo +9,733, pi +4,841, ponytail +4,532, strix +4,303, open-design +4,153, hermes-agent +3,450, spec-kit +3,243, superpowers +3,183." style="width:100%;height:auto;min-width:480px">
      <line x1="200" y1="18" x2="200" y2="332" stroke="var(--color-hairline)" stroke-width="1" />
      <path d="M200,33 L476,33 Q480,33 480,37 L480,53 Q480,57 476,57 L200,57 Z" fill="var(--color-accent)" />
      <path d="M200,63 L442.2,63 Q446.2,63 446.2,67 L446.2,83 Q446.2,87 442.2,87 L200,87 Z" fill="var(--color-accent)" />
      <path d="M200,93 L440.7,93 Q444.7,93 444.7,97 L444.7,113 Q444.7,117 440.7,117 L200,117 Z" fill="var(--color-accent)" />
      <path d="M200,123 L317.7,123 Q321.7,123 321.7,127 L321.7,143 Q321.7,147 317.7,147 L200,147 Z" fill="var(--color-accent)" />
      <path d="M200,153 L309.9,153 Q313.9,153 313.9,157 L313.9,173 Q313.9,177 309.9,177 L200,177 Z" fill="var(--color-accent)" />
      <path d="M200,183 L304.2,183 Q308.2,183 308.2,187 L308.2,203 Q308.2,207 304.2,207 L200,207 Z" fill="var(--color-accent)" />
      <path d="M200,213 L300.4,213 Q304.4,213 304.4,217 L304.4,233 Q304.4,237 300.4,237 L200,237 Z" fill="var(--color-accent)" />
      <path d="M200,243 L282.7,243 Q286.7,243 286.7,247 L286.7,263 Q286.7,267 282.7,267 L200,267 Z" fill="var(--color-accent)" />
      <path d="M200,273 L277.5,273 Q281.5,273 281.5,277 L281.5,293 Q281.5,297 277.5,297 L200,297 Z" fill="var(--color-accent)" />
      <path d="M200,303 L276,303 Q280,303 280,307 L280,323 Q280,327 276,327 L200,327 Z" fill="var(--color-accent)" />
      <text x="190" y="49" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">public-apis</text>
      <text x="190" y="79" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">skills</text>
      <text x="190" y="109" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">MoneyPrinterTurbo</text>
      <text x="190" y="139" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">pi</text>
      <text x="190" y="169" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">ponytail</text>
      <text x="190" y="199" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">strix</text>
      <text x="190" y="229" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">open-design</text>
      <text x="190" y="259" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">hermes-agent</text>
      <text x="190" y="289" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">spec-kit</text>
      <text x="190" y="319" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">superpowers</text>
      <text x="488" y="49" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">+11,138</text>
      <text x="454.2" y="79" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">+9,794</text>
      <text x="452.7" y="109" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">+9,733</text>
      <text x="329.7" y="139" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">+4,841</text>
      <text x="321.9" y="169" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">+4,532</text>
      <text x="316.2" y="199" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">+4,303</text>
      <text x="312.4" y="229" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">+4,153</text>
      <text x="294.7" y="259" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">+3,450</text>
      <text x="289.5" y="289" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">+3,243</text>
      <text x="288" y="319" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">+3,183</text>
    </svg>
  </div>
  <figcaption class="mt-3 text-[0.83rem] leading-relaxed text-muted">Top 10 repositories by absolute stars gained in 7 days. These figures are genuinely differentiated, not tied at a cap.</figcaption>
</figure>

Not every one of those 2,010 rows is a meaningful comparison, though. Only 1,026
repositories have a real star-based growth figure at all: GitHub and GitLab are the only
sources that report stars, so npm and PyPI repositories carry a structural zero, not a
measured one. Filtered down to the sources where growth can actually mean something, the
shape is unremarkable, most of the catalog barely moved.

<figure class="mt-8">
  <div class="overflow-x-auto rounded-[26px] bg-surface p-5 ring-1 ring-hairline ring-inset sm:p-7">
    <svg viewBox="0 0 560 300" role="img" aria-label="Bar chart: distribution of 7-day growth across 1,026 repositories with a star-based comparison. Declined: 63. No change: 447. 0 to 0.5%: 365. 0.5 to 1%: 88. 1 to 2%: 40. 2 to 5%: 20. 5% or more: 3." style="width:100%;height:auto;min-width:480px">
      <line x1="15" y1="250" x2="545" y2="250" stroke="var(--color-hairline)" stroke-width="1" />
      <path d="M28,250 L28,225.8 Q28,221.8 32,221.8 L52,221.8 Q56,221.8 56,225.8 L56,250 Z" fill="var(--color-accent)" />
      <path d="M108,250 L108,54 Q108,50 112,50 L132,50 Q136,50 136,54 L136,250 Z" fill="var(--color-accent)" />
      <path d="M188,250 L188,90.7 Q188,86.7 192,86.7 L212,86.7 Q216,86.7 216,90.7 L216,250 Z" fill="var(--color-accent)" />
      <path d="M268,250 L268,214.6 Q268,210.6 272,210.6 L292,210.6 Q296,210.6 296,214.6 L296,250 Z" fill="var(--color-accent)" />
      <path d="M348,250 L348,236.1 Q348,232.1 352,232.1 L372,232.1 Q376,232.1 376,236.1 L376,250 Z" fill="var(--color-accent)" />
      <path d="M428,250 L428,245.1 Q428,241.1 432,241.1 L452,241.1 Q456,241.1 456,245.1 L456,250 Z" fill="var(--color-accent)" />
      <path d="M508,250 L508,249.35 Q508,248.7 508.65,248.7 L515.35,248.7 Q516,248.7 516,249.35 L516,250 Z" fill="var(--color-accent)" />
      <text x="40" y="209.8" text-anchor="middle" font-family="var(--font-display)" font-weight="600" font-size="13" fill="var(--color-ink)">63</text>
      <text x="120" y="40" text-anchor="middle" font-family="var(--font-display)" font-weight="600" font-size="13" fill="var(--color-ink)">447</text>
      <text x="200" y="76.7" text-anchor="middle" font-family="var(--font-display)" font-weight="600" font-size="13" fill="var(--color-ink)">365</text>
      <text x="280" y="200.6" text-anchor="middle" font-family="var(--font-display)" font-weight="600" font-size="13" fill="var(--color-ink)">88</text>
      <text x="360" y="222.1" text-anchor="middle" font-family="var(--font-display)" font-weight="600" font-size="13" fill="var(--color-ink)">40</text>
      <text x="440" y="231.1" text-anchor="middle" font-family="var(--font-display)" font-weight="600" font-size="13" fill="var(--color-ink)">20</text>
      <text x="520" y="244" text-anchor="middle" font-family="var(--font-display)" font-weight="600" font-size="13" fill="var(--color-ink)">3</text>
      <text x="40" y="270" text-anchor="middle" font-family="var(--font-sans)" font-size="11" fill="var(--color-muted)">Declined</text>
      <text x="120" y="270" text-anchor="middle" font-family="var(--font-sans)" font-size="11" fill="var(--color-muted)">No change</text>
      <text x="200" y="270" text-anchor="middle" font-family="var(--font-sans)" font-size="11" fill="var(--color-muted)">0–0.5%</text>
      <text x="280" y="270" text-anchor="middle" font-family="var(--font-sans)" font-size="11" fill="var(--color-muted)">0.5–1%</text>
      <text x="360" y="270" text-anchor="middle" font-family="var(--font-sans)" font-size="11" fill="var(--color-muted)">1–2%</text>
      <text x="440" y="270" text-anchor="middle" font-family="var(--font-sans)" font-size="11" fill="var(--color-muted)">2–5%</text>
      <text x="520" y="270" text-anchor="middle" font-family="var(--font-sans)" font-size="11" fill="var(--color-muted)">5%+</text>
    </svg>
  </div>
  <figcaption class="mt-3 text-[0.83rem] leading-relaxed text-muted">7-day growth across the 1,026 repositories where a star-based figure is actually measurable. Most of the catalog didn't move.</figcaption>
</figure>

The raw momentum table didn't get the same care. Query `fct_momentum` directly, `ORDER
BY momentum DESC`, and the top of the ranking is a tie: `systemd`, `h3.c`, a scanned repo
named `skitter-creek-bath-salts`, `cua`, and the npm package `skills` all sit at exactly
100.00, each pegged there by a single signal hitting the score's normalisation cap, not
by three signals agreeing a repository is interesting. Across the whole table, only 32
rows out of roughly 2,068 have `signals_measured = 2`. Not one has all three.

<figure class="mt-8">
  <div class="overflow-x-auto rounded-[26px] bg-surface p-5 ring-1 ring-hairline ring-inset sm:p-7">
    <svg viewBox="0 0 560 300" role="img" aria-label="Bar chart: repositories grouped by how many momentum signals are measured. 0 signals: 23 repositories. 1 signal: 2,013 repositories. 2 signals: 32 repositories. 3 signals: 0 repositories." style="width:100%;height:auto;min-width:480px">
      <line x1="30" y1="250" x2="530" y2="250" stroke="var(--color-hairline)" stroke-width="1" />
      <path d="M58,250 L58,248.9 Q58,247.7 59.2,247.7 L80.8,247.7 Q82,247.7 82,248.9 L82,250 Z" fill="var(--color-accent)" />
      <path d="M198,250 L198,54 Q198,50 202,50 L218,50 Q222,50 222,54 L222,250 Z" fill="var(--color-accent)" />
      <path d="M338,250 L338,248.4 Q338,246.8 339.6,246.8 L360.4,246.8 Q362,246.8 362,248.4 L362,250 Z" fill="var(--color-accent)" />
      <text x="70" y="237.7" text-anchor="middle" font-family="var(--font-display)" font-weight="600" font-size="14" fill="var(--color-ink)">23</text>
      <text x="210" y="40" text-anchor="middle" font-family="var(--font-display)" font-weight="600" font-size="14" fill="var(--color-ink)">2,013</text>
      <text x="350" y="236.8" text-anchor="middle" font-family="var(--font-display)" font-weight="600" font-size="14" fill="var(--color-ink)">32</text>
      <text x="490" y="240" text-anchor="middle" font-family="var(--font-display)" font-weight="600" font-size="14" fill="var(--color-ink)">0</text>
      <text x="70" y="272" text-anchor="middle" font-family="var(--font-sans)" font-size="12.5" fill="var(--color-muted)">0 signals</text>
      <text x="210" y="272" text-anchor="middle" font-family="var(--font-sans)" font-size="12.5" fill="var(--color-muted)">1 signal</text>
      <text x="350" y="272" text-anchor="middle" font-family="var(--font-sans)" font-size="12.5" fill="var(--color-muted)">2 signals</text>
      <text x="490" y="272" text-anchor="middle" font-family="var(--font-sans)" font-size="12.5" fill="var(--color-muted)">3 signals</text>
    </svg>
  </div>
  <figcaption class="mt-3 text-[0.83rem] leading-relaxed text-muted">2,013 of 2,068 momentum rows measure exactly one signal. A week after the milestone meant to fix that, almost nothing has moved past it.</figcaption>
</figure>

This dashboard already knows that, and works around it: repositories are ranked by how
many signals corroborate the score first, raw score second, and anything resting on a
single signal gets demoted into its own section below a divider rather than competing
with real multi-signal movement. `pi` leads at 54.7 on two signals, growth and attention.
The next five, `rosenbridge`, `asm-hall-of-shame`, `msword`, `wyzer`,
`linkedin-feed-blocker`, are single-signal attention movers, real Hacker News and Lobsters
posts, ranked below `pi` even though their raw scores sit close to it. `skills` and
`standardwebhooks` score higher than all of them in isolation, 100.0 and 82.3, and rank
last anyway: single-signal usage numbers that would otherwise have swamped the top of the
list exactly the way `systemd` and `cua` swamp it in the raw table.

<figure class="mt-8">
  <div class="overflow-x-auto rounded-[26px] bg-surface p-5 ring-1 ring-hairline ring-inset sm:p-7">
    <svg viewBox="0 0 560 345" role="img" aria-label="Horizontal bar chart: this dashboard's momentum leaders, ranked by signal count first. Bar shade marks how many signals corroborate the score, full accent for two signals, lighter for one. pi 54.7, growth and attention. rosenbridge 50.0, asm-hall-of-shame 50.0, msword 46.5, wyzer 44.9, linkedin-feed-blocker 39.9, all single-signal attention. Ranked separately below: skills 100.0 and standardwebhooks 82.3, both single-signal usage." style="width:100%;height:auto;min-width:480px">
      <circle cx="200" cy="12" r="4" fill="var(--color-accent)" />
      <text x="209" y="15" font-family="var(--font-sans)" font-size="11" fill="var(--color-muted)">2 signals corroborate</text>
      <circle cx="368" cy="12" r="4" fill="var(--color-accent-soft)" fill-opacity="0.5" />
      <text x="377" y="15" font-family="var(--font-sans)" font-size="11" fill="var(--color-muted)">1 signal only</text>
      <line x1="200" y1="38" x2="200" y2="227" stroke="var(--color-hairline)" stroke-width="1" />
      <line x1="200" y1="263" x2="200" y2="317" stroke="var(--color-hairline)" stroke-width="1" />
      <path d="M200,53 L354.6,53 Q358.6,53 358.6,57 L358.6,73 Q358.6,77 354.6,77 L200,77 Z" fill="var(--color-accent)" />
      <path d="M200,83 L341,83 Q345,83 345,87 L345,103 Q345,107 341,107 L200,107 Z" fill="var(--color-accent-soft)" fill-opacity="0.5" />
      <path d="M200,113 L341,113 Q345,113 345,117 L345,133 Q345,137 341,137 L200,137 Z" fill="var(--color-accent-soft)" fill-opacity="0.5" />
      <path d="M200,143 L330.85,143 Q334.85,143 334.85,147 L334.85,163 Q334.85,167 330.85,167 L200,167 Z" fill="var(--color-accent-soft)" fill-opacity="0.5" />
      <path d="M200,173 L326.21,173 Q330.21,173 330.21,177 L330.21,193 Q330.21,197 326.21,197 L200,197 Z" fill="var(--color-accent-soft)" fill-opacity="0.5" />
      <path d="M200,203 L311.71,203 Q315.71,203 315.71,207 L315.71,223 Q315.71,227 311.71,227 L200,227 Z" fill="var(--color-accent-soft)" fill-opacity="0.5" />
      <text x="380" y="248" text-anchor="middle" font-family="var(--font-sans)" font-size="10.5" letter-spacing="1" fill="var(--color-muted)">SINGLE SIGNAL — RANKED SEPARATELY</text>
      <path d="M200,263 L486,263 Q490,263 490,267 L490,283 Q490,287 486,287 L200,287 Z" fill="var(--color-accent-soft)" fill-opacity="0.5" />
      <path d="M200,293 L434.67,293 Q438.67,293 438.67,297 L438.67,313 Q438.67,317 434.67,317 L200,317 Z" fill="var(--color-accent-soft)" fill-opacity="0.5" />
      <text x="190" y="69" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">pi</text>
      <text x="190" y="82" text-anchor="end" font-family="var(--font-sans)" font-size="9.5" fill="var(--color-muted)" fill-opacity="0.75">growth + attention</text>
      <text x="190" y="99" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">rosenbridge</text>
      <text x="190" y="112" text-anchor="end" font-family="var(--font-sans)" font-size="9.5" fill="var(--color-muted)" fill-opacity="0.75">attention</text>
      <text x="190" y="129" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">asm-hall-of-shame</text>
      <text x="190" y="142" text-anchor="end" font-family="var(--font-sans)" font-size="9.5" fill="var(--color-muted)" fill-opacity="0.75">attention</text>
      <text x="190" y="159" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">msword</text>
      <text x="190" y="172" text-anchor="end" font-family="var(--font-sans)" font-size="9.5" fill="var(--color-muted)" fill-opacity="0.75">attention</text>
      <text x="190" y="189" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">wyzer</text>
      <text x="190" y="202" text-anchor="end" font-family="var(--font-sans)" font-size="9.5" fill="var(--color-muted)" fill-opacity="0.75">attention</text>
      <text x="190" y="219" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">linkedin-feed-blocker</text>
      <text x="190" y="232" text-anchor="end" font-family="var(--font-sans)" font-size="9.5" fill="var(--color-muted)" fill-opacity="0.75">attention</text>
      <text x="190" y="279" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">skills (npm)</text>
      <text x="190" y="292" text-anchor="end" font-family="var(--font-sans)" font-size="9.5" fill="var(--color-muted)" fill-opacity="0.75">usage</text>
      <text x="190" y="309" text-anchor="end" font-family="var(--font-sans)" font-size="12" fill="var(--color-muted)">standardwebhooks</text>
      <text x="190" y="322" text-anchor="end" font-family="var(--font-sans)" font-size="9.5" fill="var(--color-muted)" fill-opacity="0.75">usage</text>
      <text x="366.6" y="69" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">54.7</text>
      <text x="353" y="99" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">50.0</text>
      <text x="353" y="129" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">50.0</text>
      <text x="342.85" y="159" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">46.5</text>
      <text x="338.21" y="189" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">44.9</text>
      <text x="323.71" y="219" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">39.9</text>
      <text x="498" y="279" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">100.0</text>
      <text x="446.67" y="309" font-family="var(--font-display)" font-weight="600" font-size="12.5" fill="var(--color-ink)">82.3</text>
    </svg>
  </div>
  <figcaption class="mt-3 text-[0.83rem] leading-relaxed text-muted">This dashboard's momentum leaders, ranked by signal count first. Full accent marks pi's two corroborating signals; every single-signal row, including the two usage-only repositories that score higher in isolation, gets the lighter shade and ranks below it.</figcaption>
</figure>

That's a real fix, but it lives in this dashboard's own query, not in `fct_momentum`
itself. Anything else that reads that table directly, an API response, a different
report, this same panel rebuilt from scratch next month, inherits the tie all over again.
The underlying score still caps at 100 and still can't tell a real three-signal mover
from a repo that happens to have one metric pegged at its ceiling.

A routine sanity check catches a version of the same problem from another angle. Sorting
`fct_repository_growth` by `stars_growth_pct_7d` instead of absolute growth is supposed
to surface small repos accelerating fast. It doesn't: the top ten by percentage were ten
packages with zero stars, `click`, `PyYAML`, `numpy`, `eslint`, `rimraf` among them, all
showing `0 / 0` growth with nothing to divide by. It's the same root cause the
1,026-repository filter above already worked around for the distribution chart, just
unfixed in this particular column.

Discovery is still doing its job: 49 of the 2,079 tracked repositories arrived because
Hecate found them itself. And the forecast job, which couldn't even create its CronJob as
of this morning's run, `cronjobs.batch "hecate-forecast" not found`, got redeployed later
today and produced its first usable predictions; every batch before this one came back
100% `insufficient_history`. There's nothing to compare against yet, the target date is
2026-08-28, but it's running.

One honest caveat on all of this: today's dbt job didn't complete, 0 of 1, so the marts I
queried directly reflect the last successful build, not necessarily this morning's fresh
snapshot.

The lesson isn't really about Hecate specifically. A fix that lives in a dashboard's
query is a real fix for anyone looking at that dashboard, and it is not a fix for the
data underneath it. Both were true here at once: the growth window filled right on
schedule, a smarter ranking already exists and already gets it right for this one view,
and the raw table one layer down still ties five unrelated repositories at a
normalisation cap, waiting for the next thing that queries it directly to rediscover the
same problem from scratch.
