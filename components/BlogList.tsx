"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { formatDate } from "@/lib/formatDate";
import type { PostMeta } from "@/lib/posts";
import { PostSpark } from "@/components/PostSpark";
import { Reveal } from "@/components/Reveal";

/**
 * Posts are already fully loaded (this is a static export, nothing to
 * fetch), so the tag filter is just hiding rows client-side rather than
 * re-requesting anything. The page around this stays a Server Component
 * for the JSON-LD schema and metadata; only the interactive list itself
 * needs to be a client island.
 */
export function BlogList({ posts }: { posts: PostMeta[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const post of posts) {
      for (const tag of post.tags) set.add(tag);
    }
    return [...set].sort();
  }, [posts]);

  const visible = activeTag ? posts.filter((post) => post.tags.includes(activeTag)) : posts;

  return (
    <>
      {tags.length > 1 ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter posts by tag">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            aria-pressed={activeTag === null}
            className={`min-h-8 rounded-lg px-2.5 py-1 text-[0.78rem] transition-colors duration-500 ease-soft ${
              activeTag === null
                ? "bg-accent text-accent-ink"
                : "bg-surface-2 text-muted hover:text-ink"
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              aria-pressed={tag === activeTag}
              className={`min-h-8 rounded-lg px-2.5 py-1 text-[0.78rem] transition-colors duration-500 ease-soft ${
                tag === activeTag
                  ? "bg-accent text-accent-ink"
                  : "bg-surface-2 text-muted hover:text-ink"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}

      <ol className="mt-8">
        {visible.map((post, index) => (
          <Reveal key={post.slug} delay={index * 0.04}>
            <li className="flex items-start justify-between gap-6 border-t border-hairline py-8">
              <div>
                <p className="font-mono text-[0.7rem] tracking-[0.15em] text-muted uppercase">
                  {formatDate(post.date)}
                  <span className="mx-2 text-hairline">/</span>
                  {post.readingMinutes} min read
                </p>

                <h2 className="mt-2.5 font-display text-2xl font-semibold tracking-tight">
                  <Link
                    href={`/blog/${post.slug}/`}
                    className="transition-colors duration-500 ease-soft hover:text-accent"
                  >
                    {post.title}
                  </Link>
                </h2>

                <p className="mt-2.5 max-w-[62ch] leading-relaxed text-muted">{post.summary}</p>

                {post.tags.length > 0 ? (
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <li key={tag} className="rounded-lg bg-surface-2 px-2.5 py-1 text-[0.78rem]">
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <Link
                  href={`/blog/${post.slug}/`}
                  className="group mt-5 inline-flex min-h-11 items-center gap-1.5 font-display text-[0.9rem] font-medium text-accent"
                >
                  Read it
                  <ArrowRight
                    size={14}
                    weight="bold"
                    aria-hidden
                    className="transition-transform duration-500 ease-soft group-hover:translate-x-1"
                  />
                </Link>
              </div>

              {post.sparkline ? (
                <PostSpark values={post.sparkline} className="mt-1 hidden h-14 w-32 sm:block" />
              ) : null}
            </li>
          </Reveal>
        ))}
      </ol>
    </>
  );
}
