import { Check, Sparkles, X } from "lucide-react";
import type { CandidateRanking } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  candidate: CandidateRanking;
  expanded: boolean;
  onToggle: () => void;
}

export function CandidateCard({ candidate: c, expanded, onToggle }: Props) {
  const tone =
    c.score >= 80 ? "bg-success/15 text-success border-success/30"
    : c.score >= 60 ? "bg-accent/20 text-accent-foreground border-accent/40"
    : "bg-muted text-muted-foreground border-border";

  return (
    <article
      onClick={onToggle}
      className={cn(
        "group cursor-pointer rounded-2xl border bg-card p-5 shadow-card transition-all hover:shadow-elevated",
        expanded && "ring-2 ring-ring",
      )}
    >
      <header className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display text-lg font-bold">
          #{c.rank}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-semibold leading-tight">{c.candidateName}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{c.summary}</p>
        </div>
        <div className={cn("rounded-lg border px-3 py-2 text-right", tone)}>
          <div className="font-display text-2xl font-bold leading-none">{c.score}</div>
          <div className="text-[10px] uppercase tracking-wider opacity-70">match</div>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {(["skillMatch", "semanticSimilarity", "experienceFit", "keywordOverlap"] as const).map(k => (
          <div key={k}>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {k === "skillMatch" ? "Skill" : k === "semanticSimilarity" ? "Semantic" : k === "experienceFit" ? "Experience" : "Keyword"}
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-accent"
                style={{ width: `${c.scoreBreakdown[k]}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {expanded && (
        <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-success">
              <Check className="size-3.5" /> Matching skills
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.matchingSkills.length === 0 && (
                <span className="text-sm text-muted-foreground">None matched</span>
              )}
              {c.matchingSkills.map(s => (
                <span key={s} className="rounded-md bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-destructive">
              <X className="size-3.5" /> Skill gaps
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.missingSkills.length === 0 && (
                <span className="text-sm text-muted-foreground">None — full coverage</span>
              )}
              {c.missingSkills.map(s => (
                <span key={s} className="rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 rounded-lg bg-muted/60 p-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground">
              <Sparkles className="size-3.5 text-accent" /> Why this score
            </div>
            <p className="text-sm leading-relaxed">{c.explanation}</p>
            {c.strengthAreas.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.strengthAreas.map(s => (
                  <span key={s} className="rounded bg-card px-2 py-0.5 text-[11px] font-medium">
                    ★ {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
