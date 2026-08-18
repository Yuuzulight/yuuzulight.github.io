import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
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
  ];
}
