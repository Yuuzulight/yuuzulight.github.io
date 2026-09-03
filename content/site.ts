export const site = {
  handle: "Yuuzu",
  // Shown as the mark in the nav. The GitHub handle is already public.
  wordmark: "Yuuzulight",
  role: "Data and AI engineering",
  url: "https://yuuzulight.github.io",
  github: "https://github.com/Yuuzulight",
  email: "yuuzulight@gmail.com",
  // Hero subtext is capped at 20 words on purpose. Longer copy pushes the
  // primary action below the fold on a laptop screen.
  heroLede:
    "I build data pipelines, train the models that run on them, and keep both alive in production.",
  education: "BSc Data Science, James Cook University, 2026",
};

export type SkillGroup = {
  title: string;
  summary: string;
  items: string[];
};

// Grouped by what the work actually is, rather than a flat wall of logos.
export const skillGroups: SkillGroup[] = [
  {
    title: "Data engineering",
    summary:
      "Moving data between systems without losing any of it, on a schedule nobody has to babysit.",
    items: [
      "Python",
      "SQL",
      "PostgreSQL",
      "dbt",
      "Idempotent ETL",
      "Kubernetes CronJobs",
      "Docker",
      "Prometheus",
      "Grafana",
      "DuckDB",
    ],
  },
  {
    title: "Machine learning and AI",
    summary:
      "Fine-tuning, dataset construction, and the evaluation work that decides whether a metric means anything.",
    items: [
      "PyTorch",
      "Transformer fine-tuning",
      "Dataset construction",
      "Leak-free splitting",
      "Evaluation harnesses",
      "RAG",
      "Azure AI Search",
      "llama.cpp",
      "whisper.cpp",
    ],
  },
  {
    title: "Full stack",
    summary:
      "The interfaces and services that make the data layer usable by somebody other than me.",
    items: [
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "FastAPI",
      "Electron",
      "Tailwind",
      "Caddy and TLS",
      "GitHub Actions",
    ],
  },
];

export const about = [
  "I came to this from game design. My diploma was mostly art and production, but there was coding in it, and that turned out to be the part I wanted to keep doing. I had always been good with numbers, which helped, and it turned out that I'd been learning Python since I was fourteen and just didn't have the vocabulary yet to know what it was called.",
  "The placement at the end of that degree put me on a hotel messaging platform that real hotels use every day. That was the first time my code had users who had no idea I existed, which changes how you write. The system handles thousands of guest conversations an hour across email, SMS, WhatsApp and form submissions, and every new slot I added to the database schema was one that would live somewhere in production and stay there for years. I spent the whole placement terrified of nullable columns.",
  "Most of what I build outside work comes from wanting a thing to exist. A tracker that could tell me which projects were actually gaining ground. A voice tool that gives useful feedback without feeling like a bad stepmother. A Discord bot that owns the room. The pattern with all of them is they started because I was annoyed something didn't exist yet, and they got good because I was willing to throw real time at a thing that was only my problem.",
  "The habit I care most about is checking my own results. On the text detector I built a second, separate evaluation harness specifically to try to break the first one, and it worked, which was awful — a 99% F1 score that I trusted went down to 92% once I got serious about looking for false positives. That drop made the model better because it meant I stopped shipping half a defense.",
  "Away from all this I came out of game art and it still shows. I play a lot of FFXIV, and I stream on Twitch when I can hold a schedule together. It is also most of the reason Mana has a face at all — a voice companion can sound strange if she doesn't have eyes and a body that reacts, so a lot of the work that sounds like infrastructure is actually art direction.",
];

export type ExperienceEntry = {
  kind: "role" | "education";
  period: string;
  title: string;
  org: string;
  /** Optional, so an entry can be added before the detail is confirmed. */
  body?: string;
  tags?: string[];
  href?: string;
  /** Defaults to the internal write-up wording. */
  linkLabel?: string;
};

export const experience: ExperienceEntry[] = [
  {
    kind: "role",
    period: "May to Aug 2026",
    title: "Data Engineering Intern",
    org: "Worldtech",
    body: "Worked on a guest messaging platform that hotels use to handle conversations across several channels from one place. My work covered the data layer, the retrieval integration behind support QA, and the embedding pipeline that makes search understand intent without exact phrase matches. Built on PostgreSQL, Ray, and Azure AI Search; backend in FastAPI, frontend in React.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Azure AI Search", "RAG"],
    href: "/work/hotel-guest-messaging/",
  },
  {
    kind: "role",
    period: "May to Aug 2019",
    title: "Game Art Intern",
    org: "Centre for Healthy and Sustainable Cities, NTU",
    body: "Made the art and 3D models for Xbox Kinect games that get older adults exercising, built for I-SING, the International-Singapore Intergenerational National Games. I-SING is an exergaming competition for seniors across Southeast Asia; the games were custom-built, not off-the-shelf.",
    tags: ["Game art", "3D modelling", "Xbox Kinect"],
    href: "https://www.ntu.edu.sg/arise/research-focus/gerontechnology-for-active-ageing/international-singapore-intergenerational-national-games-(i-sing)",
    linkLabel: "About the I-SING programme",
  },
  {
    kind: "education",
    period: "Graduated 2026",
    title: "BSc Data Science",
    org: "James Cook University",
    body: "Coursework across statistics, machine learning and data systems, with the final placement spent building the platform above rather than writing about one.",
  },
  {
    kind: "education",
    period: "Graduated 2019",
    title: "Diploma in Digital Art and Game Design",
    org: "Nanyang Polytechnic",
    body: "Studio training in art and game production, with the industry placement spent on the Kinect games above.",
  },
];

export type Update = {
  /** Kept for ordering and for knowing how old an entry is. Not rendered.
      A visible date is the part that ages badly; the sentence does not. */
  date: string;
  text: string;
  href?: string;
};

// Recent work, newest first. Curated by hand rather than complete, and four or
// five entries is plenty.
export const updates: Update[] = [
  {
    date: "2026-09-02",
    text: "Mana's new add-on router is commented as lazy-loaded after consent approval, but the require() it depends on runs unconditionally at server startup. A missing brace proved it: the module failed to parse, and it would have taken the whole node-bot server down before anyone consented to anything.",
    href: "/blog/the-consent-route-that-wasnt-lazy-at-all/",
  },
  {
    date: "2026-08-25",
    text: "Mana's fish-speech TTS server needed WSL2 because torch.compile was supposedly unsupported on native Windows. It was two fixable bugs, a stale triton-windows pin and a CUDA pointer overflow, and fixing them left native Windows 1.3-1.8x faster.",
    href: "/blog/the-static-launcher-that-couldnt-fit-a-pointer/",
  },
  {
    date: "2026-08-24",
    text: "windows-launcher's main window disabled Chromium's background throttling to keep the avatar smooth while unfocused, but that flag stayed off even once the window was genuinely hidden, running 100% CPU in a hidden process. Fixed by checking `document.hidden`.",
    href: "/blog/the-throttle-that-forgot-the-window-could-hide/",
  },
  {
    date: "2026-08-23",
    text: "Mana's coding-agent test runner now executes against a scratch copy instead of the live workspace. My first cut of the node_modules junction only checked the workspace root, which would miss node_modules inside subdirectories, leaving a stale copy alive inside the scratch dir on re-run.",
    href: "/blog/the-scratch-copy-that-only-checked-the-top-level/",
  },
  {
    date: "2026-08-21",
    text: "Consolidated Mana's chat and vision onto one model after a same-day benchmark showed the chat model already beat both vision candidates outright, deleting a second model instead of picking between them.",
    href: "/blog/the-vision-model-that-didnt-need-to-exist/",
  },
];
