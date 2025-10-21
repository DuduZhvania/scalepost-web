import type { ReactNode } from "react";

export function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <div className="text-sm text-zinc-200">{children}</div>
    </div>
  );
}

export function ReviewRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/20 bg-black/70 p-4">
      <div className="flex items-center justify-between text-sm text-zinc-300">
        <p className="font-semibold text-white">{label}</p>
        {value && <p className="text-zinc-400">{value}</p>}
      </div>
      {children}
    </div>
  );
}

