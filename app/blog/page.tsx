import type { Metadata } from "next";

import { getPosts } from "@/lib/posts";
import { BlogList } from "@/components/BlogList";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { Glow } from "@/components/ui";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on the things I build: what broke, what the fix turned out to be, and what the bug was actually about.",
  alternates: { canonical: "/blog/" },
  openGraph: {
    title: "Blog",
    description: "Notes on the things I build, and what each bug turned out to be about.",
    url: "https://yuuzulight.github.io/blog/",
    type: "website",
  },
};

export default function BlogIndex() {
  const posts = getPosts();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog",
    url: `${site.url}/blog/`,
    author: { "@type": "Person", name: site.handle, url: site.url },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.date,
      url: `${site.url}/blog/${post.slug}/`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <SiteNav />

      <main>
        <section className="relative overflow-hidden pt-12 pb-12 sm:pt-16">
          <Glow />
          <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Blog
            </h1>
            <p className="mt-5 max-w-[54ch] text-lg leading-relaxed text-muted">
              Mostly post-mortems. When something takes me far longer than it should
              have, the reason is usually more interesting than the fix, and writing
              it down is how I make sure I actually learned it.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-5 pb-24 sm:px-8 sm:pb-32">
          {posts.length === 0 ? (
            <p className="text-muted">Nothing published yet.</p>
          ) : (
            <BlogList posts={posts} />
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
