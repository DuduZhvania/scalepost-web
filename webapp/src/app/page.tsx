// src/app/page.tsx
import Link from "next/link";

const features = [
  {
    title: "Multi-account autoposting",
    description:
      "Spin up and manage unlimited profiles across YouTube Shorts, TikTok, Instagram Reels, and more — launch campaigns in one click.",
  },
  {
    title: "AI-first clip generation",
    description:
      "Upload a long-form video and let our Opus Clips-powered engine surface the strongest hooks, trim highlights, and add captions automatically.",
  },
  {
    title: "Smart editing pipeline",
    description:
      "Automated reframing, on-brand templates, subtitles, and sound balancing happen in seconds so every short is ready to publish.",
  },
  {
    title: "Rehash & repost",
    description:
      "Refresh winning clips with new hooks, aspect ratios, and cover art to keep feeds warm without digging into old project files.",
  },
];

const workflow = [
  {
    title: "Upload once",
    description:
      "Drop a long-form recording or connect your cloud drive. Scalepost ingests raw footage and transcribes it instantly.",
  },
  {
    title: "Generate clips",
    description:
      "AI ranks standout moments, drafts platform-specific captions, and applies motion design that fits each channel automatically.",
  },
  {
    title: "Distribute everywhere",
    description:
      "Schedule or immediately deploy to every connected profile, track performance, and iterate without manual uploads.",
  },
];

const stats = [
  { label: "Clips produced automatically", value: "10x faster" },
  { label: "Manual editing hours saved", value: "40+/wk" },
  { label: "Publishing coverage", value: "7+ platforms" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-50">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]" />
        </div>

<<<<<<< HEAD
        <section className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 pb-24 pt-28 text-center">
          <span className="rounded-full border border-white/20 px-4 py-1 text-sm font-medium uppercase tracking-[0.3em] text-white/80">
            Automate Your Content Engine
          </span>
          <h1 className="text-balance text-5xl font-semibold sm:text-6xl">
            The fastest way to turn long-form videos into growth-ready clips
          </h1>
          <p className="max-w-2xl text-pretty text-lg text-white/70 sm:text-xl">
            Replace manual clipping teams with an AI workflow that ideates, edits, and publishes short-form content across every
            platform you manage. Upload once, scale everywhere.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/upload"
              className="group inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-slate-200"
            >
              Launch a Campaign
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            >
              Explore the platform
            </a>
          </div>
          <div className="mt-12 grid w-full gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 sm:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2 text-center">
                <span className="text-3xl font-semibold text-white">{item.value}</span>
                <span className="text-sm uppercase tracking-wide text-white/60">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">Built for modern content teams</h2>
            <p className="mt-3 text-lg text-white/70">
              Every automation you need to manage multiple brands and keep feeds consistently active.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-base text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-10">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <h2 className="text-3xl font-semibold sm:text-4xl">From upload to viral-ready in minutes</h2>
                <p className="mt-4 text-lg text-cyan-50/80">
                  A guided automation stack that replaces manual timelines, cross-posting spreadsheets, and endless revisions.
                </p>
                <ul className="mt-8 space-y-4 text-left text-base text-cyan-50/70">
                  {workflow.map((step, index) => (
                    <li key={step.title} className="flex gap-4">
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-cyan-400/40 text-lg font-semibold text-cyan-200">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                        <p>{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4 rounded-2xl border border-white/10 bg-black/40 p-6 text-sm text-white/70">
                <h3 className="text-lg font-semibold text-white">Included automations</h3>
                <ul className="space-y-3">
                  <li>• Auto-captioning, emoji overlays, and animated subtitles.</li>
                  <li>• Channel-specific aspect ratios and safe zones checked automatically.</li>
                  <li>• Reposting calendar that rehashes proven clips without fatigue.</li>
                  <li>• Analytics sync to highlight wins and prompt fresh variations.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-32 text-center">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-16">
            <h2 className="text-3xl font-semibold sm:text-4xl">Ready to scale your short-form output?</h2>
            <p className="mt-4 text-lg text-white/70">
              Start automating your clips, experiment with repost strategies, and give every brand you manage a constant stream of
              high-performing short-form content.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/upload"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-slate-200"
              >
                Try the uploader
              </Link>
              <a
                href="mailto:founders@scalepost.ai"
                className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
              >
                Talk to us
              </a>
            </div>
          </div>
        </section>
=======
      <p className="text-lg text-gray-300 mb-10 max-w-2xl">
        Automate your content distribution with AI — upload, clip, and post
        everywhere automatically.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          Enter Dashboard
        </Link>
        <Link
          href="/library"
          className="px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
        >
          View Library
        </Link>
>>>>>>> b60796f (fix: use public DATABASE_URL for local dev and sync schema)
      </div>
    </main>
  );
}
