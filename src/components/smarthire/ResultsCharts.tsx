import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { ScreeningResult } from "@/lib/types";

const CHART_COLORS = [
  "var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)",
  "var(--color-chart-4)", "var(--color-chart-5)",
];

export function ResultsCharts({ result }: { result: ScreeningResult }) {
  const barData = result.rankings.slice(0, 8).map(r => ({
    name: r.candidateName.split(" ")[0],
    score: r.score,
    skill: r.scoreBreakdown.skillMatch,
  }));
  const pieData = result.clusters.filter(c => c.size > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h3 className="font-display text-base font-semibold">Top candidates by score</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Overall match vs raw skill coverage</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <defs>
                <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="colorSkill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="score" name="Overall" fill="url(#colorOverall)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="skill" name="Skill match" fill="url(#colorSkill)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h3 className="font-display text-base font-semibold">Candidate clusters</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">K-means grouping by profile similarity</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="size"
                nameKey="label"
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={90}
                paddingAngle={3}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
