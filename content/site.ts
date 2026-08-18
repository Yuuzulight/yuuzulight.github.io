export const site = {
  handle: "Yuuzu",
  role: "Data and AI engineering",
  url: "https://yuuzulight.github.io",
  github: "https://github.com/Yuuzulight",
  email: "yuuzulight@gmail.com",
  // Hero subtext is capped at 20 words on purpose. Longer copy pushes the
  // primary action below the fold on a laptop screen.
  heroLede:
    "I build data pipelines, train the models that run on them, and keep both alive in production.",
  education: "BSc Data Science, James Cook University Singapore, 2026",
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
  "I just finished a BSc in Data Science at James Cook University Singapore, and spent my placement as a data engineer on a hotel messaging platform that real hotels use every day. That was the first time my code had users who had no idea I existed, which changes how you think about a schema migration.",
  "Most of what I build outside work comes from wanting a thing to exist. A tracker that could tell me which projects were actually gaining ground. A voice tool that gives useful feedback without a clinical appointment. An assistant that runs on my own machine. They are all small enough to finish and complicated enough to teach me something.",
  "The habit I care most about is checking my own results. On the text detector I built a second, separate evaluation harness specifically to try to break the first one, and it worked, which was annoying and much more useful than the original score. I would rather find that myself than have a reviewer find it for me.",
];
