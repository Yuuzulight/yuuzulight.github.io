import { GithubLogo, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/content/site";

export function SiteFooter() {
  // Rendered at build time. The deploy workflow runs on every push, so this
  // does not go stale the way a hardcoded year does.
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="relative border-t border-hairline">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <h2 className="max-w-[16ch] font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Looking for a data or AI engineering role.
        </h2>
        <p className="mt-4 max-w-[52ch] leading-relaxed text-muted">
          I am open to graduate and junior positions, in Singapore or remote. The
          fastest way to reach me is email, and the code for most of what is on
          this page is public.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`mailto:${site.email}`}
            className="group inline-flex min-h-11 items-center gap-2.5 rounded-full bg-accent px-5 font-display text-[0.95rem] font-medium text-accent-ink shadow-cta transition-transform duration-500 ease-soft hover:-translate-y-px active:scale-[0.985]"
          >
            <EnvelopeSimple size={17} weight="bold" aria-hidden />
            {site.email}
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex min-h-11 items-center gap-2.5 rounded-full bg-surface px-5 font-display text-[0.95rem] font-medium text-ink ring-1 ring-hairline transition-transform duration-500 ease-soft hover:-translate-y-px active:scale-[0.985]"
          >
            <GithubLogo size={17} weight="bold" aria-hidden />
            GitHub
          </a>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-hairline pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            {year} {site.handle}. {site.education}.
          </p>
          <p>Built with Next.js and deployed on GitHub Pages.</p>
        </div>
      </div>
    </footer>
  );
}
