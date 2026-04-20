import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  ArrowRight, BrainCircuit, Download, FileSearch, Loader2,
  RotateCcw, Sparkles, Users, Zap,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadZone } from "@/components/smarthire/UploadZone";
import { CandidateCard } from "@/components/smarthire/CandidateCard";
import { BiasPanel } from "@/components/smarthire/BiasPanel";
import { ResultsCharts } from "@/components/smarthire/ResultsCharts";
import { mockParseResumes, rankingsToCsv, runScreening } from "@/lib/mockApi";
import { API_BASE } from "@/lib/api";
import type { ScreeningResult } from "@/lib/types";

export const Route = createFileRoute("/")({
  component: Index,
});

const SAMPLE_JD = `Senior Backend Engineer

We're looking for a backend engineer with 4+ years of Python experience to join our platform team. You'll design and ship REST APIs using FastAPI, work with PostgreSQL at scale, and own deployments on AWS with Docker and Kubernetes. Experience with NLP, Machine Learning, or data pipelines is a strong plus.

You should be a self-starter who can synergize with a young and energetic team and demonstrate strong culture fit. Bonus if you've been a rockstar engineer at a fast-moving startup.`;

function Index() {
  const { user, token } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [jobTitle, setJobTitle] = useState("Senior Backend Engineer");
  const [jobDescription, setJobDescription] = useState(SAMPLE_JD);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const canRun = files.length > 0 && jobDescription.trim().length > 30;

  const stats = useMemo(() => {
    if (!result) return null;
    const top = result.rankings[0];
    const avg = Math.round(
      result.rankings.reduce((s, r) => s + r.score, 0) / result.rankings.length,
    );
    return { count: result.rankings.length, top, avg };
  }, [result]);

  async function handleRun() {
    if (!canRun) return;
    setLoading(true);
    try {
      const parsed = await mockParseResumes(files);
      const res = await runScreening(parsed, jobTitle, jobDescription);
      setResult(res);
      setExpandedId(res.rankings[0]?.resumeId ?? null);
      
      if (user && token) {
        fetch(`${API_BASE}/screenings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ jobTitle, resultJson: res })
        }).catch(e => console.error('Failed to save to backend', e));
      }

      toast.success(`Ranked ${res.rankings.length} candidates`, {
        description: `Top match: ${res.rankings[0]?.candidateName} (${res.rankings[0]?.score}) ${user ? '- Saved to your account!' : ''}`,
      });
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      toast.error("Screening failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    if (!result) return;
    const csv = rankingsToCsv(result);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smarthire-${result.job.title.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  function handleReset() {
    setFiles([]);
    setResult(null);
    setExpandedId(null);
  }

  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-right" />

      {/* Hero */}
      <header className="relative overflow-hidden pt-10 pb-16 animate-float">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 relative z-10 text-center">
          <div className="mx-auto flex max-w-fit items-center justify-center space-x-2 rounded-full border border-border bg-foreground/5 px-5 py-2 backdrop-blur-md shadow-sm mb-8 hover:bg-foreground/10 transition-colors duration-300">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#00ff88] animate-ping"></span>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#00ff88]">
              Next-Gen AI Screening
            </span>
          </div>
          <h1 className="mt-4 mx-auto max-w-4xl font-display text-5xl font-extrabold leading-[1.05] sm:text-7xl drop-shadow-xl text-foreground">
            Hire on signal,<br className="hidden sm:block" />
            <span className="bg-gradient-accent bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,0,128,0.3)]">not on keywords.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/80 sm:text-xl font-medium leading-relaxed">
            Drop in a stack of resumes, paste your job description, and get stunningly precise AI rankings — with skill-gap analysis, bias detection, and instant insights.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4 sm:gap-6">
            {[
              { icon: FileSearch, label: "Parse PDF / DOCX" },
              { icon: BrainCircuit, label: "Semantic match" },
              { icon: Users, label: "Cluster talent" },
              { icon: Zap, label: "Explain every score" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-foreground/90 bg-foreground/5 backdrop-blur-md px-4 py-2 rounded-xl border border-border hover:bg-foreground/10 hover:scale-105 transition-all duration-300 cursor-default">
                <div className="flex size-8 items-center justify-center rounded-lg bg-accent/20">
                  <Icon className="size-4 text-accent" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Inputs */}
        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-xl p-8 shadow-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">1. Resumes</h2>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {files.length} uploaded
              </span>
            </div>
            <UploadZone files={files} onChange={setFiles} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 font-display text-xl font-semibold">2. Job description</h2>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Role title
            </label>
            <Input
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="mt-1.5"
            />
            <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <Textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={10}
              className="mt-1.5 resize-none font-mono text-xs"
              placeholder="Paste your job description…"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {jobDescription.length} chars · We auto-extract required skills, experience & keywords.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-end">
          {result && (
            <Button variant="ghost" onClick={handleReset}>
              <RotateCcw /> Reset
            </Button>
          )}
          <Button
            size="lg"
            onClick={handleRun}
            disabled={!canRun || loading}
            className="relative w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold text-base shadow-elevated border border-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 px-8 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform duration-300 ease-in-out"></div>
            <span className="relative z-10 flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
              {loading ? "Analyzing…" : "Run AI screening"}
              {!loading && <ArrowRight className="opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
            </span>
          </Button>
        </div>

        {/* Results */}
        {result && stats && (
          <section id="results" className="mt-12 space-y-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                <Sparkles className="size-3.5 text-accent" /> Results
              </div>
              <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                <h2 className="font-display text-3xl font-bold sm:text-4xl">
                  {result.job.title}
                </h2>
                <Button variant="outline" onClick={handleExport}>
                  <Download /> Export CSV
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Candidates ranked" value={stats.count.toString()} />
                <Stat label="Top score" value={stats.top.score.toString()} accent />
                <Stat label="Avg score" value={stats.avg.toString()} />
                <Stat label="Required skills" value={result.job.requiredSkills.length.toString()} />
              </div>
            </div>

            <BiasPanel findings={result.biasFindings} />

            <ResultsCharts result={result} />

            <div>
              <h3 className="mb-3 font-display text-lg font-semibold">
                Ranked candidates · click any card to expand
              </h3>
              <div className="space-y-3">
                {result.rankings.map(c => (
                  <CandidateCard
                    key={c.resumeId}
                    candidate={c}
                    expanded={expandedId === c.resumeId}
                    onToggle={() => setExpandedId(expandedId === c.resumeId ? null : c.resumeId)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {!result && (
          <section className="mt-16 rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
              <FileSearch className="size-5" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Upload at least one resume and a job description to see ranked results.
            </p>
          </section>
        )}
      </main>

      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>SmartHire AI · explainable resume intelligence</p>
          <p className="font-mono">v0.1 · UI ready · backend pluggable</p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 shadow-card ${accent ? "border-accent/40 bg-accent/10" : "border-border bg-card"}`}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}
