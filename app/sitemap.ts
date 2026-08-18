import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { getPosts } from "@/lib/posts";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date();

  return [
    { url: `${site.url}/`, lastModified: updated, priority: 1 },
    ...projects.map((project) => ({
      url: `${site.url}/work/${project.slug}/`,
      lastModified: updated,
      priority: 0.8,
    })),
    { url: `${site.url}/blog/`, lastModified: updated, priority: 0.7 },
    ...getPosts().map((post) => ({
      url: `${site.url}/blog/${post.slug}/`,
      lastModified: new Date(post.date),
      priority: 0.6,
    })),
  ];
}
