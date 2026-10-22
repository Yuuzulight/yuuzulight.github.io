// Single source of truth for both the home cards and the /work/<slug> pages.
// Everything here is checkable against the public repos. Nothing is rounded up.

export type MetricStat = {
  value: string;
  label: string;
};

export type Lesson = {
  title: string;
  body: string;
};

export type ProjectLink = {
  label: string;
  href: string;
  kind: "code" | "live" | "docs";
};

export type Project = {
  slug: string;
  name: string;
  kind: string;
  /** One sentence for the card. Plain language, no marketing verbs. */
  blurb: string;
  /** Lead paragraph on the detail page. */
  lede: string;
  status: string;
  /** Controls the bento cell size on the home grid. */
  size: "wide" | "tall" | "regular";
  metrics: MetricStat[];
  stack: string[];
  problem: string[];
  architecture: string[];
  outcome: string[];
  lessons: Lesson[];
  links: ProjectLink[];
  /** Honest framing note rendered as a callout. Used where status needs context. */
  note?: string;
  /** Optional real series behind the home card's hairline motif. Left unset
      for projects without an obvious number-per-day (or similar) series on
      hand -- an invented squiggle isn't worth the "real, not decorative"
      point this is meant to make. */
  motif?: number[];
};

export const projects: Project[] = [
  {
    slug: "hecate",
    name: "Hecate",
    kind: "Repository intelligence platform",
    blurb:
      "Tracks which software projects are actually growing, and answers plain-English questions about the trends, grounded in SQL against its own warehouse rather than a similarity search.",
    lede: "Star counts are a bad proxy for whether a project is alive. Hecate collects repository and package data from four sources, collects discussion from two more, and keeps a daily snapshot so growth can be measured rather than guessed. A forecasting stage predicts where a repository is headed next, and a question-answering service on top answers plain-English questions about the whole warehouse.",
    status: "v2.1.0, running daily on AWS (Sydney) since 14 October 2026, RAG-backed Q&A behind sign-in",
    size: "wide",
    // Repositories tracked per daily snapshot, 7-20 Aug 2026 -- the same
    // series charted in the momentum post, reused rather than re-derived.
    motif: [2010, 2012, 2013, 2022, 2029, 2033, 2035, 2042, 2046, 2064, 2068, 2075, 2079],
    metrics: [
      { value: "9", label: "dbt models, 54 tests, 63 nodes total" },
      { value: "21", label: "panels on the Grafana dashboard" },
      { value: "0.92", label: "mean faithfulness on the RAG evaluation harness" },
    ],
    stack: [
      "Python",
      "PostgreSQL",
      "dbt",
      "AWS ECS Fargate",
      "Aurora PostgreSQL",
      "Lambda and API Gateway",
      "Cognito",
      "Terraform",
      "Valkey",
      "Docker",
      "Prometheus",
      "Grafana",
      "FastAPI",
      "LangChain",
    ],
    problem: [
      "A repository with 60,000 stars and no commits in three years is a different thing from one with 8,000 stars and weekly releases, but most tooling treats them as comparable. Download counts say more about real use than either, and discussion says something different again, usually earlier.",
      "The harder problem is discovery. If you seed a tracker from cumulative popularity, which is what GitHub's most-starred and npm's most-installed give you, then anything trending before it is famous is excluded by the seeding itself. The tracker can only ever confirm what you already knew.",
    ],
    architecture: [
      "Four extractors pull projects from GitHub, npm, PyPI and GitLab. Two more pull conversation from Hacker News and Lobsters. Each one is rate-limit aware and retries on failure.",
      "A transformer normalises everything to a single schema, then loads into PostgreSQL idempotently. A run that dies halfway through can just be run again, which matters more than it sounds when the whole thing is unattended.",
      "Posts about projects Hecate does not yet track are the interesting case. They are not discarded. They are kept, ranked, and the projects behind them get fetched and added, so discussion decides what gets tracked rather than the other way round.",
      "Every tracked project is snapshotted daily. That table is the only history in the system, and it is the only reason growth can be measured at all, because everything else describes the present and upserts in place.",
      "dbt turns the raw tables into staging views, then facts, dimensions, growth and momentum models: nine models backed by fifty-four tests. Grafana reads the result across 21 panels, Prometheus watches the jobs, and alerts fire when a run does not land.",
      "A forecasting stage predicts each repository's star count a week out, gated by a confidence check so a forecast that has not cleared the bar is written as NULL rather than shown as if it were real, with its own backtest tool that checks predictions against what actually happened.",
      "Since 14 October 2026 production runs on AWS in Sydney rather than on a machine at home. EventBridge Scheduler starts one ECS Fargate batch each day at 04:00 Singapore time: it extracts, runs dbt, refreshes embeddings, launches an on-demand TimesFM forecast task, and writes a PostgreSQL backup to a private S3 bucket. The warehouse is Aurora PostgreSQL Express, embeddings live in Valkey Serverless (IAM auth and TLS), and the question-answering API runs on Lambda and API Gateway behind Cognito. The infrastructure is Terraform, and a check on the day of the move found no drift. The earlier Docker Desktop Kubernetes setup is kept as a rollback path.",
      "A question-answering service sits on top, provider-selectable across Gemini, Anthropic and OpenAI when run locally. Answers are built from SQL against the analytics models rather than a similarity search, since the questions people ask are aggregates and the whole corpus is small enough that picking the right rows beats finding similar ones. Every citation is checked against what the model was actually shown before it reaches the caller, and an evaluation harness scores whether the answer is grounded at all.",
    ],
    outcome: [
      "The platform is at v2.1.0. All six sources collect, dbt rebuilds the models daily, and the whole thing runs unattended on AWS with nightly backups to S3. As of 14 October 2026 the cloud warehouse holds 2,360 repositories across 65 snapshot days and 5,675 mentions, and the live forecast run produced 100 forecast rows across 50 repositories, with 20 more suppressed for insufficient history. The Grafana dashboard now exposes 21 panels on anonymous read, up from the 15 it shipped with, including a forecast panel for the newest stage.",
      "The deployed question-answering API uses OpenAI gpt-5-mini with minimal reasoning, behind a shared limit of 50 questions per UTC day, 2 requests per second and 500-character questions. The only full evaluation, 0.92 mean faithfulness and zero hallucinations on 12 fixed questions on 14 August 2026, graded by a second model call, was run with Anthropic. The production gpt-5-mini path has not been evaluated separately.",
    ],
    lessons: [
      {
        title: "A green panel can still be measuring the wrong thing",
        body: "Three dashboard panels were rendering correctly, refreshing on time, and reporting a number that did not mean what the panel title claimed. Nothing in the monitoring could catch that, because the failure was in the definition rather than the pipeline. I now write down what a metric is supposed to mean before building the panel, and check the query against that sentence.",
      },
      {
        title: "Idempotency is a scheduling feature, not a database one",
        body: "Making every load idempotent looked like extra work during the build. It is the single reason the daily schedule is safe to leave alone, because recovery from a partial run is just running it again rather than working out what landed.",
      },
      {
        title: "Scheduled jobs fail quietly in ways live services do not",
        body: "A job that never starts produces no error, no log line, and no alert unless you are specifically watching for absence. Catching a container image mismatch took far longer than it should have because the run simply was not there to fail.",
      },
    ],
    links: [
      { label: "Source on GitHub", href: "https://github.com/Yuuzulight/Hecate", kind: "code" },
    ],
  },

  {
    slug: "veritarach",
    name: "Veritarach",
    kind: "Fine-tuned AI-text detector",
    blurb:
      "A DeBERTa-v3 classifier that separates AI-written text from human text, deployed as a live service and registered on-chain as an inference node for Telegraph Hackathon Season 1, retired once the hackathon ended.",
    lede: "A binary text classifier fine-tuned from microsoft/deberta-v3-base, trained on a dataset I built, deployed behind HTTPS on a real server, and registered on a decentralised inference protocol. Then I built a separate harness to check whether the headline number actually meant anything. The server came down on 9 September 2026, once the hackathon it was built for was over.",
    status: "Retired 9 September 2026 after Telegraph Hackathon Season 1 ended; code and results stand",
    size: "tall",
    metrics: [
      { value: "96,646", label: "rows in the training set" },
      { value: "99.86%", label: "F1 on its own held-out split" },
      { value: "$1.20", label: "spent across three rented-GPU training runs" },
    ],
    stack: [
      "PyTorch",
      "DeBERTa-v3",
      "scikit-learn",
      "FastAPI",
      "Docker",
      "Caddy",
      "DigitalOcean",
    ],
    problem: [
      "Public AI-text detection datasets skew heavily toward one generator. HC3 pairs human answers with ChatGPT answers, which is a good starting point and a narrow one, because a classifier trained on it learns the habits of a single model family rather than the general shape of generated text.",
      "So the dataset had to be built rather than downloaded. HC3 for the paired human and AI examples, Wikipedia for human writing that is not answer-shaped, and around 593 samples I generated myself across three different providers to cover styles the base data missed.",
    ],
    architecture: [
      "The data pipeline handles fetching, generation and splitting. Sample generation tracks spend against a budget and writes a manifest, so an interrupted run resumes instead of restarting and re-billing.",
      "Splitting uses a group-aware strategy from scikit-learn, because HC3's human and AI answers come in pairs. A naive random split puts one half of a pair in train and the other in test, and the resulting score measures leakage rather than learning.",
      "Training ran on rented GPUs across three runs, under $1.20 in total compute: an early NaN-loss run while debugging precision handling, a second run that silently trained without a GPU at all because a driver/CUDA mismatch made torch.cuda.is_available() report False, and a third run on a compatible instance that converged normally.",
      "Serving ran as a FastAPI application in a Docker container on a DigitalOcean droplet, with Caddy terminating TLS and pulling certificates from Let's Encrypt automatically. That droplet was deleted on 9 September once the hackathon ended, so the responses shown on this page are from while it was live, not a service you can query today.",
      "Registration on the protocol meant setting up an EVM wallet, funding it on a testnet, and submitting an on-chain transaction to activate the service as a node for the text-detection intent.",
    ],
    outcome: [
      "The model reports 99.86% F1 on its own held-out test set, and while it was live the deployed service was registered and active on the protocol. I verified the registration by querying the protocol's own backend and checking the wallet's transaction nonce, rather than trusting the success message the tooling returned.",
      "That 99.86% is from the second training run, not the first. The checkpoint originally deployed had silently trained without a GPU at all: a driver only supported CUDA 12.4 while the pinned PyTorch build defaulted to a CUDA 13 wheel, so torch.cuda.is_available() returned False and training proceeded on CPU thinking it had an accelerator, with no metrics saved to catch it. Confidence never left roughly a 0.5-0.7 band, even on the opening line of Pride and Prejudice. Loading the deployed checkpoint directly and testing it against unambiguous input caught it; a retrain on a compatible instance converged normally and was verified three separate ways before redeploy: the saved test metrics, ten sampled held-out rows scored straight from the checkpoint, and six requests against the live redeployed endpoint.",
      "Then I built Veracia, a separate evaluation harness with an independently constructed holdout, and pointed it at the live deployment. It found that the score does not survive contact with text outside the training distribution: recall dropped to 0.042, catching one of 24 AI samples, and the 23 misses were returned as human with 0.98 or higher confidence. Across a wider cross-model set, 38 of 100 clearly-AI samples came back as human.",
      "The model had learned a narrower rule than the metric implied, roughly \"call it human unless it looks like the training data\". That is a real result about the project, and it is the reason the F1 figure on this page is always stated against its own split.",
      "The droplet was deleted on 9 September 2026, the day Telegraph Hackathon Season 1 ended, and Terraform was never told: its state file still records the droplet as active at its old IP. Rather than take that on faith, I checked the address directly and got a timeout on a connection that reaches everything else fine, so the shutdown is confirmed, not assumed. Whether the on-chain registration still reads active for a server that no longer exists is a separate, unresolved question this repo doesn't track.",
    ],
    lessons: [
      {
        title: "Verify runtime state, not configured intent",
        body: "Training loss went to NaN almost immediately. Five hypotheses in a row failed: the precision config, learning-rate warmup, dataloader workers, the attention implementation. The actual cause was that the model loader was silently returning float16 weights regardless of the training flag that was supposed to control precision. I only found it by inspecting the dtype of a loaded tensor directly. The fix was one parameter. The habit it produced is worth more than the fix. It paid off again later: a second, unrelated run had torch.cuda.is_available() silently return False on a driver/CUDA mismatch, trained on CPU while believing it had a GPU, and shipped a degenerate checkpoint that nothing caught because the run's metrics were never saved. Same category of bug, same fix, checking what the code actually did rather than what it was told to do.",
      },
      {
        title: "Some bugs only appear statistically",
        body: "A batch generation script ran through hundreds of successful API calls and then crashed. The provider runs adaptive reasoning on some prompts and not others, so the response occasionally contained a non-text block where the code assumed plain text. Indexing a fixed position works until it does not. Selecting by block type works always.",
      },
      {
        title: "A high score is a claim, not a conclusion",
        body: "Shipping at 99.86% and stopping would have been the easy path, and the number would have been technically true the whole time. Building the thing that could disprove it is what turned a metric into an actual understanding of what the model does.",
      },
      {
        title: "A state file only knows what you tell it",
        body: "Terraform's config for this droplet was written carefully, right down to leaving ssh_keys unset because setting a mismatched value risked a forced destroy-and-recreate of a live, registered node. All of that care assumed the droplet would only ever change through Terraform. Deleting it directly instead, once the hackathon was over, left the state file confidently wrong: it still says active, at an address that times out. The tool that's supposed to be the source of truth about infrastructure is only ever a record of the last thing it was told, not a live view of what's actually there.",
      },
    ],
    links: [
      { label: "Source on GitHub", href: "https://github.com/Yuuzulight/Veritarach", kind: "code" },
      { label: "Veracia, the evaluation harness", href: "https://github.com/Yuuzulight/Veracia", kind: "code" },
    ],
    note: "This was a live, queryable service through Telegraph Hackathon Season 1. The DigitalOcean droplet was deleted on 9 September 2026 once the hackathon ended, so there is no live endpoint to try anymore. The code, the training pipeline, and the Veracia evaluation results are all still real and unchanged. The interactive samples below are recordings from while it was live, not a live call.",
  },

  {
    slug: "hotel-guest-messaging",
    name: "Hotel guest messaging platform",
    kind: "Internship project, Worldtech",
    blurb:
      "A production omnichannel messaging platform for hotels, with retrieval-backed replies and the data pipelines behind them.",
    lede: "My internship project, working as a data engineer on a guest messaging platform that hotels use to handle conversations across several channels from one place. It is in production with over 50 hotel clients.",
    status: "In production, 50+ hotel clients",
    size: "regular",
    metrics: [
      { value: "50+", label: "hotel clients in production" },
      { value: "Azure", label: "AI Search backing the retrieval layer" },
    ],
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "PostgreSQL",
      "Azure AI Search",
      "RAG",
    ],
    problem: [
      "Hotel guests arrive through whichever channel they already use, and staff end up switching between inboxes to keep up. Messages get answered twice or not at all, and the same guest appears as several different people depending on which channel they came in through.",
      "The answers themselves are also mostly repetitive. Check-in times, amenities, policies. That work is well suited to retrieval over a hotel's own documents, provided the retrieval is grounded in the right property's content and staff can see and correct what it produced.",
    ],
    architecture: [
      "The platform brings several messaging channels into one queue, with the pipelines that normalise incoming messages and attach them to the right guest record.",
      "Guest identity is its own problem. The same person can appear through different channels with different identifiers, so the system supports reviewing and merging those records, and splitting them again when a merge turns out to be wrong.",
      "Replies are backed by retrieval over each property's own content using Azure AI Search, so answers come from that hotel's documented policies rather than a general model's assumptions.",
      "The work also covered data protection requirements and accessibility conformance, both of which shaped how records are stored, masked and navigated rather than being bolted on at the end.",
    ],
    outcome: [
      "The platform is deployed and in use across more than 50 hotel clients. My contributions ran across the data layer, the retrieval integration, and the operational surfaces staff use, delivered as reviewed pull requests against a team codebase.",
    ],
    lessons: [
      {
        title: "Review catches what tests do not",
        body: "Working in a team codebase with mandatory review changed how I write changes. The review loop caught a real defect in nearly every non-trivial pull request I opened, usually something about an interaction between my change and code I had not read. Tests confirm what you thought of. Review finds what you did not.",
      },
      {
        title: "Identity merging needs an undo",
        body: "Merging two guest records is easy. Discovering later that they were two different people, and having no way back, is the expensive part. Designing the split path alongside the merge path was worth more than making the merge cleverer.",
      },
      {
        title: "Compliance is a design input",
        body: "Data protection and accessibility requirements arrived as constraints on the schema and the navigation order, not as a checklist at the end. Treating them as design inputs was considerably cheaper than retrofitting them.",
      },
    ],
    links: [],
    note: "Built in a private company repository, so there is no public code link for this one. The description covers architecture and my role without reproducing any client code.",
  },

  {
    slug: "mana",
    name: "Mana",
    kind: "Local-first AI companion",
    blurb:
      "A Windows desktop assistant that listens, replies out loud and reads the screen, with every model running on the local machine.",
    lede: "A desktop companion built to find out how close a local assistant can get to feeling like a person rather than a prompt box. It listens, answers out loud, remembers, watches the screen and has a face, with every model running on the machine itself.",
    status: "v0.3.0 developer preview, actively developed",
    size: "regular",
    metrics: [
      { value: "100%", label: "of default inference running on-device" },
      { value: "3", label: "client apps built against one Node backend" },
    ],
    stack: [
      "Electron",
      "Node.js",
      "C#/.NET",
      "llama.cpp",
      "whisper.cpp",
      "Live2D",
      "SearXNG",
    ],
    problem: [
      "The goal was presence rather than convenience. Not a faster way to run a command, but something you talk to: it listens, replies out loud, remembers what you told it last week, and has a face on screen next to the chat window rather than instead of it.",
      "The reference point I keep coming back to is Alice from Sword Art Online, and the useful part is not the science fiction. That series separates an AI scripted to respond to stimuli from one that grows out of what it has actually lived through, and the character who matters is the one shaped by a relationship with a single person rather than by more training. Mana is not an attempt at the second thing, and models available today cannot be. It is pointed in that direction, which in practice means one instance whose memory is built from one person's conversations instead of a service answering everybody at once.",
      "A hosted assistant is the same assistant for everybody. Claude and ChatGPT answer millions of people at once, and whatever they come to know about you sits inside a service built for all of them. I wanted one instance belonging to one person, shaped by their conversations and nobody else's. I also did not want to hand my own information to a company to keep, and I did not want a monthly bill for the privilege. Running the models locally settles all three at once: it is mine, nothing said to it leaves the machine, and there is no subscription and no per-token cost.",
      "Running it locally answers that and creates a harder engineering problem, because the transcription, the model, the voice and the vision all now have to fit and stay responsive on a single consumer machine.",
    ],
    architecture: [
      "Two Electron applications, a launcher and a desktop client, share one Node backend. Any feature has to land in both, which is a constraint the codebase enforces on itself.",
      "Speech in runs through whisper.cpp, replies through llama.cpp, and speech out through a local synthesiser. A vision model plus OCR handle screen awareness, and local web search runs through a self-hosted SearXNG instance.",
      "The avatar is Live2D, rendered in a transparent always-on-top overlay window.",
      "A third app, a native C#/.NET launcher, is being built alongside the two Electron ones to cut the runtime's memory footprint. It already has a full voice loop of its own: real WASAPI mic capture, Silero VAD segmentation, wake-word matching, a barge-in gate, and streaming reply playback, talking to the same Node backend over HTTP. It is not yet the default; the Electron launcher stays the supported path until it reaches feature parity.",
      "Code is Apache-2.0. The artwork and avatar assets are not, and the Live2D runtime is fetched at setup under its own licence rather than vendored into the repository.",
    ],
    outcome: [
      "The project is a working developer preview rather than a finished product. Voice conversation, local memory, screen reading and the avatar all function on a real Windows setup, and the release notes are honest about which parts are still rough.",
      "The native launcher is further along than the repo's own planning doc admits: it still lists native mic capture as a future step, while the code sitting next to it already does mic capture, VAD, wake-word matching and streaming playback, with its own test suite and Cubism avatar rendering including idle motion and mood-driven expressions, and commits landing on it the same week this was written. Undersold, not oversold, which is the direction I'd rather be wrong in.",
    ],
    lessons: [
      {
        title: "The bug was in the window, not the animation",
        body: "The avatar stuttered and snapped during playback, which looks exactly like an animation timing problem, so that is where I spent the first pass. The real cause was Electron throttling background rendering on the non-focusable overlay window the avatar lives in. No amount of animation tuning would have fixed it, because the frames were not being scheduled in the first place.",
      },
      {
        title: "Two frontends punish every shortcut",
        body: "Shipping a change into one of the two apps and not the other produces a drift that is invisible until someone uses the other one. Parity has to be part of the definition of done, not a follow-up.",
      },
    ],
    links: [
      { label: "Source on GitHub", href: "https://github.com/Yuuzulight/Mana", kind: "code" },
    ],
    note: "This one is under active development and labelled a developer preview. I list it because the engineering is real, not because it is finished.",
  },

  {
    slug: "euphonia",
    name: "Euphonia",
    kind: "Voice training tool",
    blurb:
      "Records a take, analyses it with real acoustic measures, and shows the results as trackable metrics rather than a verdict.",
    lede: "A voice-feminization training tool. You read a passage, it analyses the recording locally and surfaces pitch, resonance, steadiness and vocal weight as metrics you can track across takes. It ships as a Windows desktop app and a browser version from the same interface code, the browser one audited down to phone width rather than just assumed to work.",
    status: "Shipped, Windows installer and web app, mobile-audited",
    size: "regular",
    metrics: [
      { value: "8", label: "themes, three light and five dark" },
      { value: "320px", label: "narrowest viewport checked by the responsive audit" },
    ],
    stack: [
      "Electron",
      "React",
      "TypeScript",
      "Python",
      "Praat",
      "WebAssembly",
    ],
    problem: [
      "Voice training feedback is usually either subjective or locked behind a clinical appointment. The acoustic measures that matter, things like fundamental frequency and formant positions, are well established in the research literature and perfectly computable from a recording.",
      "The design problem is presentation. A number attached to someone's voice reads as a judgement very easily, so every metric had to be framed as a direction to move in rather than a score to be graded against.",
    ],
    architecture: [
      "Analysis uses Praat, the standard acoustic phonetics toolkit, driven from Python. The desktop build runs it locally, so recordings never leave the machine.",
      "One React and TypeScript interface serves both targets. The desktop app wraps it in Electron with auto-updating, and the browser build runs the analysis path compiled to WebAssembly.",
      "The dashboard reports pitch, resonance from formants, loudness, steadiness from jitter and shimmer, vocal weight, and a breakdown of where the voice sits relative to a target range. Each card explains what it measures and which direction is which.",
      "Written insights are generated from the metrics directly, with an optional path to richer AI-written commentary for anyone who supplies their own key.",
      "The browser build carries an automated responsive audit across eight viewports down to 320px wide, checking horizontal overflow, chart label legibility, 44px touch targets, and modal reachability with plain assertions rather than screenshots for a human to squint at.",
    ],
    outcome: [
      "Euphonia is published as a Windows installer with background auto-updates, and as a browser version that needs no install. Recordings and results stay in the user's own folder on desktop.",
      "The mobile claim in the README was wrong once, and got caught by the same audit meant to prove it. The first pass tested empty state only, recordings.json shipped as [] and the theme screenshots captured a blank page, so chart labels rendering at 3px on a populated dashboard went unnoticed. Seeding real takes before auditing surfaced it, the layout and touch targets got fixed, and the README now says exactly what was checked and by what, including that viewport emulation is not a real handset and that microphone capture specifically has not been verified on physical hardware.",
    ],
    lessons: [
      {
        title: "Framing is a feature when the data is personal",
        body: "The same number can read as encouragement or as a verdict depending entirely on the copy around it. Writing every metric card as a compass rather than a grade took longer than computing the metrics did, and it is the part that determines whether the tool is usable at all.",
      },
      {
        title: "One codebase, two runtimes, one honest limitation",
        body: "Sharing the interface between Electron and the browser worked well. Being straightforward in the documentation about what is not there, including the unbuilt macOS target and the unsigned installer warning, turned out to be better than papering over it.",
      },
      {
        title: "An audit of an empty state is not an audit",
        body: "The first responsive pass ran clean across every viewport, which felt like proof mobile worked. It was proof an empty dashboard fits on a small screen. No seed data meant no populated charts, so 3px chart labels on a real take sat undetected behind a passing test. Fixing it meant seeding real takes before auditing, not just widening the viewport list.",
      },
    ],
    links: [
      { label: "Source on GitHub", href: "https://github.com/Yuuzulight/Euphonia", kind: "code" },
      { label: "Use it in the browser", href: "https://yuuzulight.github.io/Euphonia", kind: "live" },
    ],
    note: "Euphonia is a fork of voice-training-ui by scratchyone. My work on it is the Gemini-backed insights, the standalone desktop application, and the browser version. The original project deserves the credit for the foundation.",
  },

  {
    slug: "data-artisan",
    name: "Data Artisan",
    kind: "Agent skills for data engineering",
    blurb:
      "One portable skill file that teaches coding agents production-grade SQL schema design, the first of nine planned skills covering data patterns agents otherwise skip.",
    lede: "Ask a coding agent for a database schema and you get working code. You often do not get the indexes, the partition strategy, or the data quality checks, because nothing in the request said the thing has to survive contact with a terabyte. Data Artisan is a set of skill files meant to supply that missing context, one skill at a time rather than all at once.",
    status: "One of nine planned skills shipped, MIT licensed, CI green",
    size: "regular",
    metrics: [
      { value: "1", label: "of 9 planned skills shipped: schema design" },
      { value: "MIT", label: "licensed and portable across agents" },
    ],
    stack: ["SQL", "PostgreSQL", "dbt", "DuckDB", "Agent Skills", "Markdown"],
    problem: [
      "Generated data code tends to be correct and naive at the same time. It runs, it passes a smoke test, and it is missing indexes on high-cardinality columns, has no partitioning story, no data quality checks, and no lineage or observability. Designs that are fine at a gigabyte fall over at a terabyte.",
      "The gap is not the model's ability to write SQL. It is that nobody told it which patterns separate a working schema from a production one.",
    ],
    architecture: [
      "The one shipped skill is a single portable file describing schema design patterns and the reasoning behind them, in a format agents can load directly: indexing and partitioning strategy, constraints as defense rather than app-level validation, and per-database guidance across Postgres, Snowflake and BigQuery.",
      "Because the file is plain and portable, it works in several agent tools (Claude Code, Cursor, Codex) rather than being tied to one vendor, and it can be pasted directly if the tooling is not supported.",
      "Eight more skills are on the roadmap and not yet built: an ETL pattern library, a data quality framework, DuckDB and analytics, a local AI data stack, Kafka and streaming, advanced dbt patterns, data governance, and cloud cost optimisation. The README lists them as a roadmap, not a feature list, on purpose.",
    ],
    outcome: [
      "The repository is published under MIT with a markdown-lint CI workflow running against it. One skill, schema design, installs through the agent skills CLI or by copying the file; the other eight are documented as planned, not implied as shipped.",
    ],
    lessons: [
      {
        title: "Writing the patterns down exposed the ones I was improvising",
        body: "Turning working knowledge into instructions another system has to follow is a good way to discover which parts were habit rather than reasoning. The one skill that exists got substantially clearer once I had to justify each rule instead of just applying it.",
      },
    ],
    links: [
      { label: "Source on GitHub", href: "https://github.com/Yuuzulight/db-artisan", kind: "code" },
    ],
    note: "One skill exists today, schema design. The other eight named in the architecture above are a roadmap, not shipped work. I'm listing the project now because the one skill that exists is real and used, not because the whole set is built.",
  },

  {
    slug: "argos",
    name: "Argos",
    kind: "Desktop widget engine",
    blurb:
      "A from-scratch Rainmeter-style widget engine for Windows: the rendering engine, skin format, and four bundled skins are merged into main, and the manager application is being built on its own branch.",
    lede: "A native Win32 and Direct2D desktop widget engine, in the spirit of Rainmeter: transparent, always-on-top windows that draw live system data like a clock, CPU, RAM and disk usage, configured through a plain-text skin format. Components 1 through 3, the rendering engine, the skin format, and the four bundled v1 skins, are merged into main behind CI. Component 4, the manager application, is in progress on its own branch: a skin registry that scans a directory and merges rescans, and a manager window that lists skins and hit-tests clicks, reusing the same Direct2D rendering path the widgets themselves use. Two components remain as plan, and this page still says exactly that rather than rounding up.",
    status: "Components 1-3 of 6 merged to main; component 4 (manager app) in progress on its own branch",
    size: "regular",
    metrics: [
      { value: "4", label: "of 6 components with real code, 3 merged to main" },
      { value: "0", label: "third-party dependencies beyond the Windows SDK" },
    ],
    stack: ["C++17", "Win32", "Direct2D", "DirectWrite", "CMake", "Inno Setup"],
    problem: [
      "Widget engines in this space have a habit of reaching for process injection or shell hooks to do interesting things with the desktop, which is also exactly the kind of behaviour that gets a small unsigned tool flagged as malware and makes it fragile against the next Windows update. The design draws a hard line against that before any code exists: every widget is Argos's own transparent, layered window, drawn with documented Win32 and Direct2D APIs, and the engine never touches, injects into, or patches explorer.exe or any other process, for any feature, ever.",
      "The other constraint is honesty about scope for a v1. No plugin system, no scripting language in the skin format, no property editor, no code signing. Four bundled sample skins prove the mechanism end to end rather than a wide library that would take attention away from getting the engine itself right.",
    ],
    architecture: [
      "Each widget is a layered, borderless, always-on-top window with per-pixel alpha transparency, drawn through Direct2D and DirectWrite rather than Win32 Common Controls, so the widgets and the manager application share exactly one rendering technology and one visual style.",
      "Drag-to-reposition is built into the window engine itself rather than bolted on later, specifically so the manager application's own reposition feature can reuse it directly instead of implementing dragging a second time.",
      "A widget's position is stored as a monitor plus an offset from that monitor's origin, not a raw virtual-desktop pixel coordinate, so a saved layout still makes sense after monitors get rearranged. Per-monitor DPI awareness is handled by rescaling the render target and repositioning into the rect Windows itself suggests on a DPI change.",
      "The skin format is plain-text and INI-style, conceptually similar to Rainmeter's Measure and Meter split without being byte-compatible with Rainmeter's own syntax. A skin that fails to parse is logged and shown in the manager as failed with a reason, never a crash of the whole app.",
      "Zero third-party dependencies beyond the Windows SDK. The skin format and the persisted application state both reuse the same hand-written INI parser rather than pulling in a second text format for one or the other.",
      "Component 4 pulls the shared rendering path out into a D2DWindow base class, so the manager window that lists and manages skins draws through the exact same Direct2D setup the widgets themselves use, rather than reaching for a second UI toolkit for the one application window that isn't a widget.",
    ],
    outcome: [
      "Components 1 through 3 are merged into main behind CI: the rendering and window engine (layered, per-pixel-alpha windows with drag-to-reposition and per-monitor DPI rescaling), the skin format with its parser and first four measures and two meters, and four bundled v1 skins, Clock, CPU, RAM and disk usage, that exercise the format end to end rather than just the demo skin used during development.",
      "Component 4, the manager application, is in progress on its own branch: a skin registry that scans a directory and merges rescans without losing state, and a manager window that renders the skin list and hit-tests clicks, built on the new shared D2DWindow base class. Two components remain, each still one GitHub issue, one branch, one PR, gated on the same Windows CI build as the rest.",
    ],
    lessons: [
      {
        title: "A non-goals list is a design decision, not a placeholder",
        body: "Writing down what v1 explicitly will not do, no plugin system, no shell modification, no code signing, did more to shape the actual engine architecture than the feature list did. Ruling out process injection up front is what made every later choice, like drawing widgets as ordinary layered windows, the obvious one instead of a corner cut later under pressure.",
      },
      {
        title: "A helper hidden in an anonymous namespace is a helper nobody else can use",
        body: "Measure.cpp's UTF-8-to-UTF-16 conversion was correct but scoped to its own translation unit, so the one other place that needed it, the skin-load error path, reinvented a version that mishandled non-ASCII text instead of calling the real one. Moving it into the shared namespace fixed that and surfaced a second bug for free: the original never guarded against the Windows API call returning zero, which would have underflowed a length calculation into a crash.",
      },
    ],
    links: [
      { label: "Source on GitHub", href: "https://github.com/Yuuzulight/Argos", kind: "code" },
    ],
    note: "Components 1 through 3, the rendering engine, the skin format, and the four bundled skins, are merged into main. Component 4, the manager application, is in progress on its own branch. Two components are still just a plan. I'm listing it now because the engineering that exists is real, not because the engine as a whole is finished.",
  },

  {
    slug: "hephastion",
    name: "Hephastion",
    kind: "Obsidian memory plugin",
    blurb:
      "A plugin that gives Hermes Desktop long-term memory in your own Obsidian vault, reading relevant notes into context and writing approved ones back as plain markdown.",
    lede: "Hermes Desktop is a local AI chat app, and this plugin gives it memory that lives in a folder of your own Obsidian notes rather than inside a provider's account. The shipped half, Knowledge, reads relevant notes into a conversation and writes approved memories back afterward. The half being rebuilt, Creator, is a Claude-Artifacts equivalent for the same app: durable, versioned, live-previewed outputs instead of text that scrolls away.",
    status: "Knowledge module shipped (v1); Creator rebuilding across three branches, not yet merged to main",
    size: "regular",
    metrics: [
      { value: "99", label: "commits in the repo's first week" },
      { value: "3", label: "of 4 Creator phases rebuilt, not yet merged to main" },
    ],
    stack: ["Python", "SQLite FTS5", "JavaScript", "React", "CodeMirror 6", "esbuild-wasm", "Tailwind CSS"],
    problem: [
      "A local chat app that forgets everything between sessions is only local in one sense. The obvious fix, a provider-hosted memory feature, moves the same lock-in problem from the model to the memory: the notes live in someone else's account, in a private format, until you no longer have the client that reads it. An Obsidian vault is a folder of plain markdown files with none of that, so it becomes the memory store instead.",
      "Separately, a chat app that can talk but only ever produces scrollback has no equivalent to Claude's Artifacts: a durable output that persists, gets versioned, and can be a live-rendered React component instead of a wall of text. Creator is that surface, built as a second module in the same plugin.",
    ],
    architecture: [
      "Knowledge has two directions. Read is a composer toggle: an SQLite FTS5 index searches the vault and prepends the relevant notes to a message before it is sent. Write is a command run after a conversation: the active model extracts candidate memories, you approve each one individually, and approved ones are appended under a note's `## History` section as a single dated bullet, byte-identical to a line typed by hand, no metadata and no markers, so the vault never grows a private format only this plugin understands.",
      "Every write shows a diff first, keeps a `.bak` of the touched note, and a single command undoes the most recent batch. The whole plugin core is framework-free Python and JavaScript with no build step, and `selftest.py` runs every module's self-check plus a full HTTP read, write, and reversible round-trip.",
      "Creator's design is four phases, each meant to be a working increment on its own: agent tools plus a persistent versioned store and a pane with a per-type preview for code, HTML, SVG, Markdown and Mermaid; a live React runtime that bundles an artifact and its imports through esbuild-wasm into a sandboxed iframe with per-artifact Tailwind; a real CodeMirror 6 editor plus standalone HTML export and Publish to Gist; and a `window.hermes` bridge that gives an artifact its own storage and file access.",
      "An earlier attempt at Creator landed partway on main, including a first pass at the phase 4 bridge, before being pulled back out wholesale, keeping only the design docs. The current rebuild redid phases 1 through 3 in order across three sequential branches instead, each one a complete increment rather than another partial cut.",
    ],
    outcome: [
      "Knowledge is real and shipped: the read and write paths both work against a live vault, and the self-test suite exercises the full round-trip rather than just importing the modules.",
      "Creator is a substantial rebuild, not a stub: three phases and 47 commits since the restart, covering the versioned store, the agent tools, the sandboxed React runtime with Tailwind, the CodeMirror editor, and export and Gist publishing. None of it is merged to main yet, so it isn't claimed as shipped here.",
      "The repository itself is named Hephastion on GitHub, but the plugin's own README, its install paths, and its folder name still say Hermes Workspace and hermes-workspace throughout. That rename hasn't finished propagating internally, which is worth stating plainly rather than smoothing over on this page.",
    ],
    lessons: [
      {
        title: "Half a feature on main is worse than a design doc",
        body: "The first attempt at Creator got partway built, including an early cut of the last phase, directly on the branch everyone else builds from. Pulling all of it back out and keeping only the design docs was the actual fix, not a patch on top. The rebuild that followed shipped each phase as something complete in itself instead of leaving another half-finished cut sitting in the default branch.",
      },
      {
        title: "Durable memory means writing in the user's own format",
        body: "An approved memory is appended as one plain dated bullet under a heading, with no metadata and no marker distinguishing it from something typed by hand. The tempting version tags its own writes for easier programmatic review later. The shipped version chose to be invisible in the vault instead, because the whole point of an Obsidian vault as memory is that it stays a normal vault.",
      },
    ],
    links: [
      { label: "Source on GitHub", href: "https://github.com/Yuuzulight/Hephastion", kind: "code" },
    ],
    note: "Knowledge is shipped and real. Creator is a genuine, substantial rebuild in progress across branches, not yet merged to main, so it isn't claimed as finished here. The project's own README hasn't caught up to the GitHub rename yet either, still calling itself Hermes Workspace throughout its own install instructions.",
  },

  {
    slug: "folio",
    name: "Folio Artifacts",
    kind: "HTML rendering engine for .NET",
    blurb:
      "A lightweight HTML/CSS rendering engine written from scratch in C#, built to render and run AI-written HTML artifacts inside Mana's own window. It is an artifact-focused renderer, not a complete browser.",
    lede: "Mana writes HTML artifacts such as reports, tables, charts and small interactive pages, and needs somewhere light to show them. Folio Artifacts draws them natively with SkiaSharp inside the host application, as a WinForms control with a headless render-to-image API alongside it. Anything it cannot handle yet opens in the system browser.",
    status: "Milestones 1 to 5 delivered (5 on a dependency-backed path); milestone 6 in progress",
    size: "regular",
    metrics: [
      { value: "5", label: "of 7 numbered milestones delivered" },
      { value: "45", label: "open issues in milestone 6, still in progress" },
    ],
    stack: ["C#", ".NET 10", "SkiaSharp", "HarfBuzzSharp", "WinForms"],
    problem: [
      "Mana's native launcher is designed to stay light on memory, which rules out embedding a full Chromium just to show an artifact. Free C# engines with modern CSS exist, but none is an interactive on-screen control, which is the gap this fills.",
      "The goal is narrower than a browser on purpose: no address bar, tabs, logins or extensions, and none of the web platform that artifacts do not use.",
    ],
    architecture: [
      "Parsing, the cascade, block, inline, flex and grid layout, text and painting are Folio's own code, drawn through SkiaSharp. Complex-script shaping, the JavaScript engine and the 2D graphics library stay dependencies behind Folio's own interfaces so they can be replaced later.",
      "Scripts run sandboxed with strict limits in a separate content process, and nothing touches the network unless the host allows it.",
      "Progress is measured against a conformance suite of realistic artifacts, a fuzzer over the parsers and decoders, and a benchmark harness with memory targets.",
    ],
    outcome: [
      "Milestones 1 to 5 are delivered: static rendering, static parity, interaction, scripting foundations, and scripted parity. Milestone 5 is delivered on the dependency-backed path, not with everything built in-house. Mana's native launcher already draws its HTML artifacts with Folio.",
      "Milestone 6 (WebGL, audio and video, workers, WebAssembly, iframes, service workers and WebRTC) is in progress. Its acceptance audit lists GPU/GLSL execution, media playback, native WebAssembly, capture and transport, and service-worker isolation as unfinished.",
    ],
    lessons: [
      {
        title: "A completion claim needs an audit behind it",
        body: "Earlier claims that milestone 6 was complete were premature. The README now says so, and the milestone is marked in progress until the acceptance audit's gaps are closed.",
      },
    ],
    links: [
      { label: "Source on GitHub", href: "https://github.com/Yuuzulight/Folio", kind: "code" },
    ],
    note: "This project was called Folio Browser until 1 October 2026. The repository, packages and namespaces are still named Folio.",
  },

  {
    slug: "arcana",
    name: "Arcana",
    kind: "Agent-focused browser runtime",
    blurb:
      "A lightweight browser runtime for Mana's browser automation: a native CLI, MCP server and .NET API wrapped around a pinned, patched build of the Obscura engine.",
    lede: "Mana's browser automation originally drove a locally installed Chrome or Edge through Playwright. Arcana gives it a self-contained runtime instead, with an engine-neutral page contract (page API v1) so the engine behind it can change without changing the caller. The engine today is Obscura by h4ckf0r0day, built from a pinned upstream commit with four small patches applied.",
    status: "Early: native CLI, all 37 MCP tools and the .NET API work; being integrated into Mana",
    size: "regular",
    metrics: [
      { value: "37", label: "MCP browser tools exposed" },
      { value: "4", label: "patches carried on top of the pinned engine" },
    ],
    stack: ["C#", ".NET 10", "Rust (engine build)", "CDP", "MCP"],
    problem: [
      "A browser automation plugin that depends on a full Chromium install costs hundreds of megabytes of memory, can leave orphaned processes behind, and ties the caller to one vendor's debugging protocol.",
    ],
    architecture: [
      "The engine is built from a pinned Obscura commit recorded in a lock file, with each patch checked against a digest before it is applied. The patches add child-frame support for debugging-protocol clients, multipart form uploads, re-announced frames when a document changes, and frames that follow their own links.",
      "Arcana owns the host and integration layer: it starts the engine under process containment, exposes the native CLI and the MCP tools, and offers a .NET API for pages, forms, input, capture, storage and tabs. It is not an independent renderer.",
      "Page API v1 is engine-neutral. Folio is a possible future engine behind the same contract; that is planned work, not something that exists yet.",
    ],
    outcome: [
      "Arcana exposes the native CLI, all 37 MCP tools and the CDP surface of the pinned engine revision, and its parity matrix lists the verified limits. Integration into Mana is in progress.",
    ],
    lessons: [
      {
        title: "Pin the engine, patch it in the open",
        body: "Keeping the engine as a pinned upstream commit plus numbered patches, each checked by digest, makes it clear which behaviour is upstream's and which is Arcana's, and keeps the credit where it belongs.",
      },
    ],
    links: [
      { label: "Source on GitHub", href: "https://github.com/Yuuzulight/Arcana", kind: "code" },
      { label: "Obscura, the upstream engine", href: "https://github.com/h4ckf0r0day/obscura", kind: "code" },
    ],
    note: "The browser engine is Obscura, by h4ckf0r0day, licensed Apache-2.0. Arcana does not include it in the repository; it builds it from a pinned commit and applies its own patches.",
  },

  {
    slug: "gradcompass",
    name: "GradCompass",
    kind: "Resume-to-job match scoring",
    blurb:
      "A web app that scores how well a resume matches a job posting, aimed at new graduates and career switchers whose resumes are thin or non-traditional.",
    lede: "Applicant tools tend to assume a conventional resume. GradCompass is for people without one: bootcamp graduates, internship-only candidates, career changers and the self-taught, in any field. It scores a resume against a posting with a language model and shows where the match is weak.",
    status: "Live at gradcompass.co",
    size: "regular",
    metrics: [
      { value: "1", label: "developer, no team" },
    ],
    stack: ["Next.js", "TypeScript", "Supabase", "Netlify", "Cloudflare Turnstile", "Sentry"],
    problem: [
      "Most scoring tools are tuned for candidates with a long, conventional work history, and give little to someone whose experience is a bootcamp, an internship or a different industry.",
    ],
    architecture: [
      "Scoring runs through a primary language model with a second as fallback. A free local pre-filter rejects junk input, such as text that is too short, an identical resume and posting, or repetitive spam, before Turnstile or any paid model call.",
      "Sign-in is by emailed one-time code or Google and LinkedIn, backed by Supabase. Errors are captured with Sentry, and traffic is counted by a first-party, cookie-free analytics table.",
    ],
    outcome: [
      "The site is public at gradcompass.co and payments are enabled. There is no revenue figure to report.",
    ],
    lessons: [
      {
        title: "Reject the cheap cases before paying for the expensive ones",
        body: "Putting a free input check in front of the bot check and the model call means obvious junk never costs anything.",
      },
    ],
    links: [
      { label: "gradcompass.co", href: "https://gradcompass.co", kind: "live" },
    ],
    note: "The source lives in a private repository, so there is no public code link for this one.",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
