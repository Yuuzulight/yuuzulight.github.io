/** Split out of lib/posts.ts so client components can use it without
    pulling in that file's node:fs/gray-matter imports -- a bundler
    includes a module's own top-level imports for anyone importing even
    one value from it, regardless of which export they actually use. */
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
