// src/app/page.tsx
"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center px-4">
      <h1 className="text-5xl font-bold mb-6">Welcome to Scalepost</h1>

      <p className="text-lg text-gray-300 mb-10 max-w-2xl">
        AI-powered content engine — upload your videos, generate clips, and
        automate posting across platforms.
      </p>

      <Link
        href="/upload"
        className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-colors"
      >
        Go to Upload Page
      </Link>
    </main>
  );
}
