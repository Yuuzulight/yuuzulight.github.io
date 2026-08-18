import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const postsDir = path.join(process.cwd(), "content", "posts");

export type PostMeta = {
  slug: string;
  title: string;
  /** ISO date, e.g. 2026-08-18. Used for sorting and the visible date. */
  date: string;
  summary: string;
  tags: string[];
  /** Rough reading time in minutes, derived from word count. */
  readingMinutes: number;
  draft: boolean;
};

export type Post = PostMeta & {
  html: string;
};

function readPostFile(fileName: string): Post {
  const slug = fileName.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(postsDir, fileName), "utf8");
  const { data, content } = matter(raw);

  const words = content.trim().split(/\s+/).length;

  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ""),
    summary: String(data.summary ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    // 200 wpm is the usual estimate. Never show zero.
    readingMinutes: Math.max(1, Math.round(words / 200)),
    draft: data.draft === true,
    // Posts are local files written by the site owner, so the markdown is
    // trusted and rendered as-is. Do not point this at user submissions.
    html: marked.parse(content, { async: false }) as string,
  };
}

/** Published posts, newest first. Drafts never reach the build. */
export function getPosts(): Post[] {
  if (!fs.existsSync(postsDir)) return [];

  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".md"))
    .map(readPostFile)
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((post) => post.slug === slug);
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
