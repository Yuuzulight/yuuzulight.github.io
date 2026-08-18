import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

import { formatDate, getPost, getPosts } from "@/lib/posts";
import { site } from "@/content/site";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { Glow } from "@/components/ui";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) return { title: "Not found" };

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: `${site.url}/blog/${post.slug}/`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    author: { "@type": "Person", name: site.handle, url: site.url },
    url: `${site.url}/blog/${post.slug}/`,
    keywords: post.tags.join(", "),
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
          <header className="relative overflow-hidden pt-12 pb-10 sm:pt-16">
            <Glow />
            <div className="relative mx-auto max-w-2xl px-5 sm:px-8">
              <Link
                href="/blog/"
                className="inline-flex min-h-11 items-center gap-2 text-[0.9rem] text-muted transition-colors duration-500 ease-soft hover:text-ink"
              >
                <ArrowLeft size={15} weight="bold" aria-hidden />
                All posts
              </Link>

              <p className="mt-6 font-mono text-[0.7rem] tracking-[0.15em] text-muted uppercase">
                {formatDate(post.date)}
                <span className="mx-2">/</span>
                {post.readingMinutes} min read
              </p>

              <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                {post.title}
              </h1>

              <p className="mt-5 text-lg leading-relaxed text-muted">{post.summary}</p>
            </div>
          </header>

          <div className="mx-auto max-w-2xl px-5 pb-24 sm:px-8 sm:pb-32">
            {/* Markdown is authored locally by the site owner, so it is trusted. */}
            <div
              className="post-body"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />

            {post.tags.length > 0 ? (
              <ul className="mt-12 flex flex-wrap gap-1.5 border-t border-hairline pt-8">
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-lg bg-surface-2 px-2.5 py-1 text-[0.78rem]"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
