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
};

export const projects: Project[] = [
  {
    slug: "hecate",
    name: "Hecate",
    kind: "Repository intelligence platform",
    blurb:
      "Tracks which software projects are actually growing, by joining package and repo data against what people are saying about them.",
    lede: "Star counts are a bad proxy for whether a project is alive. Hecate collects repository and package data from four sources, collects discussion from two more, and keeps a daily snapshot so growth can be measured rather than guessed.",
    status: "v1.2.0, running unattended on a daily schedule",
    size: "wide",
    metrics: [
      { value: "63", label: "dbt models in the transform layer" },
      { value: "6", label: "upstream sources normalised to one schema" },
      { value: "32", label: "issues closed to reach v1.2.0" },
    ],
    stack: [
      "Python",
      "PostgreSQL",
      "dbt",
      "Kubernetes",
      "Docker",
      "Prometheus",
      "Grafana",
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
      "dbt turns the raw tables into staging views, then facts, dimensions, growth and momentum models. Grafana reads the result, Prometheus watches the jobs, and alerts fire when a run does not land.",
    ],
    outcome: [
      "The platform reached v1.2.0 with all 32 tracked issues closed, and now runs on a daily schedule without anyone starting it. The Grafana dashboard exposes 15 panels on anonymous read, so the data is inspectable without an account.",
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
      "A DeBERTa-v3 classifier that separates AI-written text from human text, deployed as a live service and registered on-chain as an inference node.",
    lede: "A binary text classifier fine-tuned from microsoft/deberta-v3-base, trained on a dataset I built, deployed behind HTTPS on a real server, and registered on a decentralised inference protocol. Then I built a separate harness to check whether the headline number actually meant anything.",
    status: "Live and serving, registered as an active node",
    size: "tall",
    metrics: [
      { value: "96,646", label: "rows in the training set" },
      { value: "99.86%", label: "F1 on its own held-out split" },
      { value: "$1.20", label: "spent on rented GPU training" },
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
      "Training ran on rented GPUs, two full runs, under $1.20 in total compute.",
      "Serving is a FastAPI application in a Docker container on a DigitalOcean droplet, with Caddy terminating TLS and pulling certificates from Let's Encrypt automatically.",
      "Registration on the protocol meant setting up an EVM wallet, funding it on a testnet, and submitting an on-chain transaction to activate the service as a node for the text-detection intent.",
    ],
    outcome: [
      "The model reports 99.86% F1 on its own held-out test set, and the deployed service is registered and active on the protocol. I verified the registration by querying the protocol's own backend and checking the wallet's transaction nonce, rather than trusting the success message the tooling returned.",
      "Then I built Veracia, a separate evaluation harness with an independently constructed holdout, and pointed it at the live deployment. It found that the score does not survive contact with text outside the training distribution: recall dropped to 0.042, catching one of 24 AI samples, and the 23 misses were returned as human with 0.98 or higher confidence. Across a wider cross-model set, 38 of 100 clearly-AI samples came back as human.",
      "The model had learned a narrower rule than the metric implied, roughly \"call it human unless it looks like the training data\". That is a real result about the project, and it is the reason the F1 figure on this page is always stated against its own split.",
    ],
    lessons: [
      {
        title: "Verify runtime state, not configured intent",
        body: "Training loss went to NaN almost immediately. Five hypotheses in a row failed: the precision config, learning-rate warmup, dataloader workers, the attention implementation. The actual cause was that the model loader was silently returning float16 weights regardless of the training flag that was supposed to control precision. I only found it by inspecting the dtype of a loaded tensor directly. The fix was one parameter. The habit it produced is worth more than the fix.",
      },
      {
        title: "Some bugs only appear statistically",
        body: "A batch generation script ran through hundreds of successful API calls and then crashed. The provider runs adaptive reasoning on some prompts and not others, so the response occasionally contained a non-text block where the code assumed plain text. Indexing a fixed position works until it does not. Selecting by block type works always.",
      },
      {
        title: "A high score is a claim, not a conclusion",
        body: "Shipping at 99.86% and stopping would have been the easy path, and the number would have been technically true the whole time. Building the thing that could disprove it is what turned a metric into an actual understanding of what the model does.",
      },
    ],
    links: [
      { label: "Source on GitHub", href: "https://github.com/Yuuzulight/Veritarach", kind: "code" },
      { label: "Veracia, the evaluation harness", href: "https://github.com/Yuuzulight/Veracia", kind: "code" },
    ],
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
    status: "v0.2.0 developer preview, actively developed",
    size: "regular",
    metrics: [
      { value: "100%", label: "of default inference running on-device" },
      { value: "2", label: "Electron apps sharing one Node backend" },
    ],
    stack: [
      "Electron",
      "Node.js",
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
      "Code is Apache-2.0. The artwork and avatar assets are not, and the Live2D runtime is fetched at setup under its own licence rather than vendored into the repository.",
    ],
    outcome: [
      "The project is a working developer preview rather than a finished product. Voice conversation, local memory, screen reading and the avatar all function on a real Windows setup, and the release notes are honest about which parts are still rough.",
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
    lede: "A voice-feminization training tool. You read a passage, it analyses the recording locally and surfaces pitch, resonance, steadiness and vocal weight as metrics you can track across takes. It ships as a Windows desktop app and a browser version from the same interface code.",
    status: "Shipped, Windows installer and web app",
    size: "regular",
    metrics: [
      { value: "8", label: "themes, three light and five dark" },
      { value: "2", label: "delivery targets from one UI codebase" },
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
    ],
    outcome: [
      "Euphonia is published as a Windows installer with background auto-updates, and as a browser version that needs no install. Recordings and results stay in the user's own folder on desktop.",
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
      "Portable skill files that teach coding agents the production data patterns they otherwise skip, like indexing, partitioning and quality checks.",
    lede: "Ask a coding agent for a database schema and you get working code. You often do not get the indexes, the partition strategy, or the data quality checks, because nothing in the request said the thing has to survive contact with a terabyte. Data Artisan is a set of skill files that supply that missing context.",
    status: "Published, MIT licensed, CI green",
    size: "regular",
    metrics: [
      { value: "5", label: "skills covering schema, ETL, quality and analytics" },
      { value: "MIT", label: "licensed and portable across agents" },
    ],
    stack: ["SQL", "PostgreSQL", "dbt", "DuckDB", "Agent Skills", "Markdown"],
    problem: [
      "Generated data code tends to be correct and naive at the same time. It runs, it passes a smoke test, and it is missing indexes on high-cardinality columns, has no partitioning story, no data quality checks, and no lineage or observability. Designs that are fine at a gigabyte fall over at a terabyte.",
      "The gap is not the model's ability to write SQL. It is that nobody told it which patterns separate a working schema from a production one.",
    ],
    architecture: [
      "Each skill is a single portable file describing the patterns and the reasoning behind them, in a format agents can load directly.",
      "Schema design covers indexing, partitioning and data type strategy across Postgres, Snowflake and BigQuery. The ETL library covers slowly changing dimensions, incremental loads and full refreshes with idempotency.",
      "The quality skill generates dbt tests, Great Expectations suites or plain SQL validation for completeness, uniqueness and referential integrity. Two further skills cover DuckDB analytics patterns and running against local models.",
      "Because the files are plain and portable, they work in several agent tools rather than being tied to one vendor, and they can be pasted directly if the tooling is not supported.",
    ],
    outcome: [
      "The repository is published under MIT with continuous integration running against it, and the skills install through the agent skills CLI or by copying the file.",
    ],
    lessons: [
      {
        title: "Writing the patterns down exposed the ones I was improvising",
        body: "Turning working knowledge into instructions another system has to follow is a good way to discover which parts were habit rather than reasoning. Several skills got substantially clearer once I had to justify each rule instead of just applying it.",
      },
    ],
    links: [
      { label: "Source on GitHub", href: "https://github.com/Yuuzulight/db-artisan", kind: "code" },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
