import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { Glow } from "@/components/ui";
import { ActionLink } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="relative overflow-hidden">
        <Glow />
        <div className="relative mx-auto flex min-h-[70dvh] max-w-3xl flex-col justify-center px-5 py-24 sm:px-8">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            That page does not exist.
          </h1>
          <p className="mt-4 max-w-[48ch] leading-relaxed text-muted">
            The link may be old, or I may have renamed something. The work is all
            reachable from the home page.
          </p>
          <div className="mt-8">
            <ActionLink href="/">Back to the start</ActionLink>
          </div>
          <p className="mt-10 text-sm text-muted">
            Still stuck? <Link href="/#contact" className="text-accent underline underline-offset-4">Send me a message</Link>.
          </p>
        </div>
      </main>
    </>
  );
}
