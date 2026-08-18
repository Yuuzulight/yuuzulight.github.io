# yuuzulight.github.io

My portfolio site. Next.js, statically exported, served from GitHub Pages.

## Running it

```bash
npm install
npm run dev
```

The production build writes plain HTML to `out/`:

```bash
npm run build
```

## How it is put together

All six project write-ups come from one file, `content/projects.ts`. The home
page cards and the `/work/<slug>` pages both read from it, so a project is
described in exactly one place. Copy that is not project-specific lives in
`content/site.ts`.

The palette is defined as theme tokens at the top of `app/globals.css`. There
is one accent colour and one tint, and the tint is only ever a surface, which is
what stops the page drifting into two competing colours.

`design/` holds the palette exploration this design came out of. It is not part
of the build.

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and
publishes `out/` to Pages. Repository Settings, Pages, Source needs to be set to
GitHub Actions once before the first run.
