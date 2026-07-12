"use client";

import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-slate-100">
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-sm uppercase tracking-[0.3em] text-slate-400">Error</div>
        <h1 className="mt-3 text-3xl font-semibold text-white">Something went wrong</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">{error.message}</p>
        <div className="mt-6 flex gap-3">
          <button onClick={reset} className="rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-400">Try again</button>
          <Link href="/" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-slate-100 transition hover:bg-white/10">Home</Link>
        </div>
      </div>
    </main>
  );
}
