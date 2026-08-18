import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Info } from "@phosphor-icons/react/dist/ssr";

import { getProject, projects } from "@/content/projects";
import { site } from "@/content/site";
import { CountUp } from "@/components/CountUp";
import { DetectorSamples } from "@/components/DetectorSamples";
import { HecateDiagram } from "@/components/HecateDiagram";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { Glow } from "@/components/ui";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Every project page is prerendered at build time. Static export has no
// server to fall back on, so this list is the complete set of routes.
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return { title: "Not found" };
  }

  // Per-page title and description rather than one inherited pair, so search
  // results and link previews describe the actual project.
  return {
    title: `${project.name}, ${project.kind.toLowerCase()}`,
    description: project.blurb,
    alternates: { canonical: `/work/${project.slug}/` },
    openGraph: {
      title: `${project.name}, ${project.kind.toLowerCase()}`,
      description: project.blurb,
      url: `${site.url}/work/${project.slug}/`,
      type: "article",
    },
  };
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
      {children}
    </h2>
  );
}

export default async function WorkPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    abstract: project.blurb,
    author: { "@type": "Person", name: site.handle, url: site.url },
    url: `${site.url}/work/${project.slug}/`,
    keywords: project.stack.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <SiteNav />

      <main>
        <article>
          <header className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20">
            <Glow />
            <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
              <Link
                href="/#work"
                className="inline-flex min-h-11 items-center gap-2 text-[0.9rem] text-muted transition-colors duration-500 ease-soft hover:text-ink"
              >
                <ArrowLeft size={15} weight="bold" aria-hidden />
                All work
              </Link>

              <p className="mt-6 font-mono text-[0.65rem] tracking-[0.18em] text-accent uppercase">
                {project.kind}
              </p>

              <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                {project.name}
              </h1>

              <p className="mt-5 text-lg leading-relaxed text-muted">{project.lede}</p>

              <p className="mt-6 inline-block rounded-full bg-surface px-4 py-2 text-[0.85rem] text-muted ring-1 ring-hairline">
                {project.status}
              </p>

              {project.links.length > 0 ? (
                <div className="mt-7 flex flex-wrap gap-3">
                  {project.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={`group inline-flex min-h-11 items-center gap-2.5 rounded-full px-5 font-display text-[0.92rem] font-medium transition-transform duration-500 ease-soft hover:-translate-y-px active:scale-[0.985] ${
                        link.kind === "live"
                          ? "bg-accent text-accent-ink shadow-cta"
                          : "bg-surface text-ink ring-1 ring-hairline"
                      }`}
                    >
                      {link.label}
                      <ArrowUpRight
                        size={14}
                        weight="bold"
                        aria-hidden
                        className="transition-transform duration-500 ease-soft group-hover:translate-x-0.5 group-hover:-translate-y-px"
                      />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </header>

          <div className="mx-auto max-w-3xl px-5 pb-24 sm:px-8 sm:pb-32">
            {project.note ? (
              <Reveal>
                <aside className="flex gap-3 rounded-[22px] bg-tint-2/70 p-5 ring-1 ring-hairline ring-inset">
                  <Info size={19} weight="bold" aria-hidden className="mt-0.5 shrink-0 text-accent" />
                  <p className="text-[0.93rem] leading-relaxed text-muted">{project.note}</p>
                </aside>
              </Reveal>
            ) : null}

            <Reveal className="mt-12">
              <dl className="grid grid-cols-1 gap-6 rounded-[26px] bg-surface p-7 ring-1 ring-hairline ring-inset sm:grid-cols-3">
                {project.metrics.map((metric) => (
                  <div key={metric.label} className="flex flex-col-reverse">
                    <dt className="mt-1 text-[0.83rem] leading-snug text-muted">
                      {metric.label}
                    </dt>
                    <dd className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                      <CountUp value={metric.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal className="mt-16">
              <SectionHeading>The problem</SectionHeading>
              <div className="mt-5 space-y-4 leading-[1.75] text-muted">
                {project.problem.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
            </Reveal>

            <Reveal className="mt-16">
              <SectionHeading>How it works</SectionHeading>
              <div className="mt-5 space-y-4 leading-[1.75] text-muted">
                {project.architecture.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>

              {project.slug === "hecate" ? <HecateDiagram /> : null}
            </Reveal>

            <Reveal className="mt-16">
              <SectionHeading>Where it landed</SectionHeading>
              <div className="mt-5 space-y-4 leading-[1.75] text-muted">
                {project.outcome.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
            </Reveal>

            {project.slug === "veritarach" ? (
              <Reveal className="mt-16">
                <SectionHeading>See for yourself</SectionHeading>
                <div className="mt-5">
                  <DetectorSamples />
                </div>
              </Reveal>
            ) : null}

            <Reveal className="mt-16">
              <SectionHeading>What it taught me</SectionHeading>
              <div className="mt-6 space-y-4">
                {project.lessons.map((lesson) => (
                  <div
                    key={lesson.title}
                    className="rounded-[26px] bg-surface p-6 ring-1 ring-hairline ring-inset sm:p-7"
                  >
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      {lesson.title}
                    </h3>
                    <p className="mt-2.5 leading-[1.75] text-muted">{lesson.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal className="mt-16">
              <SectionHeading>Built with</SectionHeading>
              <ul className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg bg-surface-2 px-3 py-1.5 text-[0.85rem]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
