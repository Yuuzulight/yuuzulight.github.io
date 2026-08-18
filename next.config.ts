import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages serves plain files, so every route is prerendered to HTML at build time.
  output: "export",
  // Repo is <user>.github.io, so the site lives at the domain root. No basePath needed.
  trailingSlash: true,
  images: {
    // The Next image optimizer needs a running server. Static export has none.
    unoptimized: true,
  },
};

export default nextConfig;
