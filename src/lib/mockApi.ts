// Mock implementation of the SmartHire screening API.
// Swap this single file for a `fetch(PYTHON_BACKEND_URL)` call when the
// Python FastAPI service is deployed. The shape returned MUST match ScreeningResult.

import type {
  BiasFinding,
  CandidateRanking,
  JobRequirements,
  ParsedResume,
  ScreeningResult,
} from "./types";

const SAMPLE_NAMES = [
  "Aarav Mehta",
  "Sofia Rodriguez",
  "Liam O'Connor",
  "Yuki Tanaka",
  "Priya Sharma",
  "Marcus Chen",
  "Amara Okafor",
  "Elena Volkov",
];

const SKILL_POOL = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js", "Django", "FastAPI",
  "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
  "Machine Learning", "TensorFlow", "PyTorch", "spaCy", "NLP", "Pandas",
  "Leadership", "Communication", "Agile", "Scrum", "REST APIs", "GraphQL",
  "CI/CD", "Terraform", "Redis", "Kafka",
];

const BIAS_DICT: Record<string, BiasFinding> = {
  rockstar: { word: "rockstar", category: "gendered", suggestion: "expert", context: "" },
  ninja: { word: "ninja", category: "gendered", suggestion: "specialist", context: "" },
  guru: { word: "guru", category: "gendered", suggestion: "expert", context: "" },
  aggressive: { word: "aggressive", category: "gendered", suggestion: "proactive", context: "" },
  "young and energetic": { word: "young and energetic", category: "ageist", suggestion: "motivated", context: "" },
  "digital native": { word: "digital native", category: "ageist", suggestion: "tech-fluent", context: "" },
  "culture fit": { word: "culture fit", category: "exclusionary", suggestion: "values alignment", context: "" },
  manpower: { word: "manpower", category: "gendered", suggestion: "workforce", context: "" },
  chairman: { word: "chairman", category: "gendered", suggestion: "chairperson", context: "" },
  "synergize": { word: "synergize", category: "corporate-jargon", suggestion: "collaborate", context: "" },
};

function pseudoRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pickN<T>(arr: T[], n: number, rand: () => number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rand() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

export function parseJobDescription(raw: string, title: string): JobRequirements {
  const lower = raw.toLowerCase();
  const requiredSkills = SKILL_POOL.filter(s => lower.includes(s.toLowerCase())).slice(0, 8);
  const yearsMatch = raw.match(/(\d+)\+?\s*years?/i);
  const minYearsExperience = yearsMatch ? parseInt(yearsMatch[1], 10) : 2;
  const keywords = Array.from(new Set(
    raw.toLowerCase().split(/[^a-z0-9+#.]+/).filter(w => w.length > 4),
  )).slice(0, 20);
  return {
    title: title || "Untitled Role",
    rawDescription: raw,
    requiredSkills: requiredSkills.length ? requiredSkills : ["Python", "SQL", "Communication"],
    niceToHaveSkills: ["Docker", "AWS", "Leadership"].filter(s => !requiredSkills.includes(s)),
    minYearsExperience,
    keywords,
  };
}

export function detectBias(raw: string): BiasFinding[] {
  const findings: BiasFinding[] = [];
  const lower = raw.toLowerCase();
  for (const [key, finding] of Object.entries(BIAS_DICT)) {
    const idx = lower.indexOf(key);
    if (idx !== -1) {
      const start = Math.max(0, idx - 30);
      const end = Math.min(raw.length, idx + key.length + 30);
      findings.push({ ...finding, context: "…" + raw.slice(start, end).trim() + "…" });
    }
  }
  return findings;
}

let pdfjsLib: any = null;
import mammoth from 'mammoth';

async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  try {
    if (ext === 'txt') {
      return await file.text();
    }
    
    if (ext === 'pdf') {
      if (!pdfjsLib) {
        pdfjsLib = await import('pdfjs-dist');
        const workerUrl = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.default;
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // @ts-ignore
        text += content.items.map((item) => item.str).join(' ') + '\n';
      }
      return text;
    }
    
    if (ext === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
  } catch (err) {
    console.error("Error reading file", file.name, err);
  }
  
  // Only fallback to file.text() for txt files to prevent binary junk from being parsed
  if (ext === 'txt') {
      return await file.text();
  }
  return "";
}

export async function mockParseResumes(files: File[]): Promise<ParsedResume[]> {
  const results: ParsedResume[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const extractedText = await extractTextFromFile(f);
    const textLower = extractedText.toLowerCase();
    
    const rand = pseudoRand(f.name.length + f.size + i * 17);
    
    // Extract base name from file name (remove extension, replace special chars with spaces)
    const baseName = f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    // Capitalize first letters
    const formattedName = baseName.replace(/\b\w/g, l => l.toUpperCase()).trim();
    
    const name = formattedName || SAMPLE_NAMES[i % SAMPLE_NAMES.length];
    
    // Extract real skills from text
    let foundSkills = SKILL_POOL.filter(s => textLower.includes(s.toLowerCase()));
    if (foundSkills.length === 0) {
      foundSkills = pickN(SKILL_POOL, 6 + Math.floor(rand() * 6), rand);
    }
    
    // Extract real experience from text (e.g. "X years")
    const yearsMatch = textLower.match(/(\d+)\+?\s*years?/i);
    const parsedExp = yearsMatch ? parseInt(yearsMatch[1], 10) : null;
    const yearsExperience = parsedExp !== null ? parsedExp : 1 + Math.floor(rand() * 12);
    
    // Generate real preview
    let previewText = extractedText.replace(/\s+/g, ' ').substring(0, 150).trim();
    if (!previewText) {
      previewText = `${name} — ${foundSkills.slice(0, 3).join(", ")} specialist with hands-on delivery experience.`;
    }
    
    results.push({
      id: `r-${i}-${Date.now()}`,
      fileName: f.name,
      candidateName: name,
      email: `${name.toLowerCase().replace(/[^a-z]/g, ".")}@example.com`,
      yearsExperience,
      education: ["BS Computer Science", "MS Data Science", "BTech Engineering", "MBA"][Math.floor(rand() * 4)],
      skills: foundSkills,
      rawTextPreview: previewText,
    });
  }
  
  return results;
}

function rankCandidates(resumes: ParsedResume[], job: JobRequirements): CandidateRanking[] {
  const required = new Set(job.requiredSkills.map(s => s.toLowerCase()));
  return resumes
    .map((r, idx) => {
      const rSkills = new Set(r.skills.map(s => s.toLowerCase()));
      const matching = r.skills.filter(s => required.has(s.toLowerCase()));
      const missing = job.requiredSkills.filter(s => !rSkills.has(s.toLowerCase()));
      const skillMatch = required.size ? (matching.length / required.size) * 100 : 60;
      const semanticSimilarity = 55 + ((r.skills.length * 7 + r.yearsExperience * 3) % 40);
      const experienceFit = Math.max(0, 100 - Math.abs(r.yearsExperience - job.minYearsExperience - 2) * 12);
      const keywordOverlap = Math.min(100, matching.length * 18 + 25);
      const score = Math.round(
        skillMatch * 0.4 + semanticSimilarity * 0.3 + experienceFit * 0.2 + keywordOverlap * 0.1,
      );
      const strengthAreas: string[] = [];
      if (matching.length >= 3) strengthAreas.push("Strong skill alignment");
      if (r.yearsExperience >= job.minYearsExperience) strengthAreas.push("Meets experience bar");
      if (r.skills.includes("Leadership")) strengthAreas.push("Leadership signal");
      if (matching.some(s => ["AWS", "Docker", "Kubernetes"].includes(s))) strengthAreas.push("Cloud-ready");

      const explanation =
        missing.length === 0
          ? `Covers every required skill (${matching.join(", ")}) with ${r.yearsExperience}y experience.`
          : `Strong on ${matching.slice(0, 3).join(", ") || "general fundamentals"} but missing ${missing.slice(0, 2).join(" & ")}.`;

      const summary = `${r.candidateName} — ${r.yearsExperience}y experience, ${r.education}. ${
        matching.length >= 3 ? "Highly aligned" : matching.length >= 1 ? "Partial fit" : "Adjacent profile"
      } for ${job.title}.`;

      const cluster = matching.length >= 4 ? 0 : matching.length >= 2 ? 1 : 2;

      return {
        resumeId: r.id,
        candidateName: r.candidateName,
        rank: 0,
        score,
        scoreBreakdown: {
          skillMatch: Math.round(skillMatch),
          semanticSimilarity: Math.round(semanticSimilarity),
          experienceFit: Math.round(experienceFit),
          keywordOverlap: Math.round(keywordOverlap),
        },
        matchingSkills: matching,
        missingSkills: missing,
        strengthAreas: strengthAreas.length ? strengthAreas : ["Transferable experience"],
        explanation,
        summary,
        cluster,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((c, i) => ({ ...c, rank: i + 1 }));
}

export async function runScreening(
  resumes: ParsedResume[],
  jobTitle: string,
  jobDescription: string,
): Promise<ScreeningResult> {
  // simulate latency so the loading UI is visible
  await new Promise(r => setTimeout(r, 900));
  const job = parseJobDescription(jobDescription, jobTitle);
  const rankings = rankCandidates(resumes, job);
  const biasFindings = detectBias(jobDescription);
  const clusterLabels = ["Top match", "Mid match", "Adjacent"];
  const clusters = [0, 1, 2].map(id => ({
    id,
    label: clusterLabels[id],
    size: rankings.filter(r => r.cluster === id).length,
  }));
  return { job, rankings, biasFindings, clusters, processedAt: new Date().toISOString() };
}

export function rankingsToCsv(result: ScreeningResult): string {
  const header = [
    "rank", "candidate", "score", "skill_match", "semantic", "experience", "keyword",
    "matching_skills", "missing_skills", "summary",
  ].join(",");
  const rows = result.rankings.map(r => [
    r.rank,
    JSON.stringify(r.candidateName),
    r.score,
    r.scoreBreakdown.skillMatch,
    r.scoreBreakdown.semanticSimilarity,
    r.scoreBreakdown.experienceFit,
    r.scoreBreakdown.keywordOverlap,
    JSON.stringify(r.matchingSkills.join("; ")),
    JSON.stringify(r.missingSkills.join("; ")),
    JSON.stringify(r.summary),
  ].join(","));
  return [header, ...rows].join("\n");
}
