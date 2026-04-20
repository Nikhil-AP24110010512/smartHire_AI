import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { BiasFinding } from "@/lib/types";

export function BiasPanel({ findings }: { findings: BiasFinding[] }) {
  if (findings.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-success/30 bg-success/10 p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
        <div>
          <h3 className="font-display font-semibold text-success">No bias signals detected</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your job description appears neutral. Nice work.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning-foreground" />
        <div className="flex-1">
          <h3 className="font-display font-semibold text-warning-foreground">
            {findings.length} potential bias signal{findings.length > 1 ? "s" : ""}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Words that may discourage qualified candidates from applying.
          </p>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {findings.map((f, i) => (
          <li key={i} className="rounded-lg border border-border bg-card p-3 text-sm">
            <div className="flex flex-wrap items-baseline gap-2">
              <code className="rounded bg-destructive/10 px-1.5 py-0.5 font-mono text-xs text-destructive">
                {f.word}
              </code>
              <span className="text-xs text-muted-foreground">→</span>
              <code className="rounded bg-success/15 px-1.5 py-0.5 font-mono text-xs text-success">
                {f.suggestion}
              </code>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
                {f.category}
              </span>
            </div>
            <p className="mt-1.5 text-xs italic text-muted-foreground">{f.context}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
