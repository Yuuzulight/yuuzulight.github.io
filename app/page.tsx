import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { projects } from "@/content/projects";
import { about, experience, site, skillGroups } from "@/content/site";
import { ProjectCard, type CardTone } from "@/components/ProjectCard";
import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";
import { Stagger } from "@/components/Stagger";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { ActionLink, GhostLink, Glow } from "@/components/ui";

// Numbers sit in a strip under the hero rather than inside it, so the hero
// stays one message with one primary action.
const headlineStats = [
  { value: "63", label: "dbt models running on a daily schedule" },
  { value: "96,646", label: "rows in a training set I built" },
  { value: "50+", label: "hotels using the platform I worked on" },
  { value: "$1.20", label: "spent training a model that runs in production" },
];

// Grid order, lead project first. Anything not listed falls to the end in its
// content order, so a new project still appears without touching this.
const displayOrder = [
  "mana",
  "hecate",
  "veritarach",
  "hotel-guest-messaging",
  "euphonia",
  "data-artisan",
];

const rank = (slug: string) => {
  const index = displayOrder.indexOf(slug);
  return index === -1 ? displayOrder.length : index;
};

// Cell sizing and tone per project. One cell per project, no filler tile.
const layout: Record<string, { span: string; tone: CardTone }> = {
  mana: { span: "lg:col-span-4", tone: "wash" },
  hecate: { span: "lg:col-span-2 lg:row-span-2", tone: "tinted" },
  veritarach: { span: "lg:col-span-2", tone: "plain" },
  "hotel-guest-messaging": { span: "lg:col-span-2", tone: "plain" },
  euphonia: { span: "lg:col-span-3", tone: "tinted" },
  "data-artisan": { span: "lg:col-span-3", tone: "plain" },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.handle,
  alternateName: "Yuuzulight",
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: "Data and AI engineer",
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "James Cook University",
  },
  sameAs: [site.github],
  knowsAbout: [
    "Data engineering",
    "ETL pipelines",
    "dbt",
    "Machine learning",
    "Transformer fine-tuning",
    "Retrieval augmented generation",
  ],
};

export default function Home() {
  // Stable sort, so unlisted projects keep their content order.
  const orderedProjects = [...projects].sort((a, b) => rank(a.slug) - rank(b.slug));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <SiteNav />

      <main>
        {/* Hero. One eyebrow, one headline, one sentence, two actions. */}
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
          <Glow />
          <Stagger className="relative mx-auto max-w-6xl px-5 sm:px-8" delay={0.1}>
            <p className="inline-block rounded-full bg-tint-2 px-3.5 py-1.5 font-mono text-[0.65rem] tracking-[0.18em] text-accent uppercase">
              {site.role}
            </p>

            <h1 className="mt-6 max-w-[19ch] font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance md:text-5xl lg:text-6xl">
              I build data platforms that keep running after the{" "}
              <em className="font-bold text-accent not-italic">demo</em>.
            </h1>

            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted">
              {site.heroLede}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <ActionLink href="/#work">See the work</ActionLink>
              <GhostLink href={`mailto:${site.email}`}>Get in touch</GhostLink>
            </div>
          </Stagger>
        </section>

        {/* Numbers. A different layout family from the sections either side. */}
        <section className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-8 rounded-[30px] bg-surface/70 p-8 ring-1 ring-hairline ring-inset sm:p-10 lg:grid-cols-4">
              {headlineStats.map((stat) => (
                // Reversed column so the number reads first visually while the
                // label stays the <dt>. Avoids duplicating the label for
                // screen readers just to get the visual order right.
                <div key={stat.label} className="flex flex-col-reverse">
                  <dt className="mt-1.5 max-w-[22ch] text-[0.85rem] leading-snug text-muted">
                    {stat.label}
                  </dt>
                  <dd className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    <CountUp value={stat.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>

        {/* Work. Asymmetric bento, exactly one cell per project. */}
        <section
          id="work"
          className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32"
        >
          <Reveal>
            <h2 className="max-w-[20ch] font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Things I have built, and what each one taught me.
            </h2>
            <p className="mt-4 max-w-[58ch] leading-relaxed text-muted">
              Every project below has its own page with the architecture, the
              numbers, and the parts that went wrong. Source is public except for
              the internship work.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-6">
            {orderedProjects.map((project, index) => (
              <Reveal
                key={project.slug}
                delay={index * 0.05}
                className={layout[project.slug]?.span ?? "lg:col-span-2"}
              >
                <ProjectCard
                  project={project}
                  tone={layout[project.slug]?.tone}
                  className="h-full"
                />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Experience. A period rail, which is a different layout family from
            the bento above and the clusters below. */}
        <section
          id="experience"
          className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24 sm:px-8 sm:pb-32"
        >
          <Reveal>
            <h2 className="max-w-[20ch] font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Where I have worked.
            </h2>
          </Reveal>

          <ol className="mt-10">
            {experience.map((entry, index) => (
              <Reveal key={entry.title} delay={index * 0.06}>
                <li className="grid gap-3 border-t border-hairline py-8 sm:grid-cols-[9rem_1fr] sm:gap-10">
                  <p className="font-mono text-[0.7rem] tracking-[0.15em] text-muted uppercase sm:pt-1.5">
                    {entry.period}
                  </p>

                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                      {entry.title}
                    </h3>
                    <p className="mt-1 font-display text-[0.95rem] font-medium text-accent">
                      {entry.org}
                    </p>
                    {entry.body ? (
                      <p className="mt-3 max-w-[62ch] leading-relaxed text-muted">
                        {entry.body}
                      </p>
                    ) : null}

                    {entry.tags ? (
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {entry.tags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-lg bg-surface-2 px-2.5 py-1 text-[0.78rem]"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {entry.href ? (
                      <Link
                        href={entry.href}
                        className="group mt-5 inline-flex min-h-11 items-center gap-1.5 font-display text-[0.9rem] font-medium text-accent"
                      >
                        Read the full write-up
                        <ArrowRight
                          size={14}
                          weight="bold"
                          aria-hidden
                          className="transition-transform duration-500 ease-soft group-hover:translate-x-1"
                        />
                      </Link>
                    ) : null}
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Stack. Three clusters with a sentence each, not a badge wall. */}
        <section
          id="stack"
          className="scroll-mt-24 border-y border-hairline bg-surface/50"
        >
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
            <Reveal>
              <h2 className="max-w-[22ch] font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                What I actually work with.
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
              {skillGroups.map((group, index) => (
                <Reveal key={group.title} delay={index * 0.06}>
                  <div className="h-full border-t-2 border-accent/25 pt-6">
                    <h3 className="font-display text-xl font-semibold tracking-tight">
                      {group.title}
                    </h3>
                    <p className="mt-2.5 max-w-[38ch] text-[0.92rem] leading-relaxed text-muted">
                      {group.summary}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <li
                          key={item}
                          className="rounded-lg bg-surface-2 px-2.5 py-1 text-[0.78rem]"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* About. Single column, no split header, no floating corner paragraph. */}
        <section
          id="about"
          className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32"
        >
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              About
            </h2>
            <div className="mt-6 max-w-[62ch] space-y-5 text-[1.05rem] leading-[1.75] text-muted">
              {about.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
