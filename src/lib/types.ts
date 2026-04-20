// Shared types for the SmartHire AI screening pipeline.
// This is the contract any backend (Python FastAPI, TS server fns, etc.) must implement.

export type SkillCategory = "technical" | "soft" | "tool" | "language" | "domain";

export interface ParsedResume {
  id: string;
  fileName: string;
  candidateName: string;
  email?: string;
  yearsExperience: number;
  education: string;
  skills: string[];
  rawTextPreview: string;
}

export interface JobRequirements {
  title: string;
  rawDescription: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  minYearsExperience: number;
  keywords: string[];
}

export interface CandidateRanking {
  resumeId: string;
  candidateName: string;
  rank: number;
  score: number; // 0-100 overall
  scoreBreakdown: {
    skillMatch: number;
    semanticSimilarity: number;
    experienceFit: number;
    keywordOverlap: number;
  };
  matchingSkills: string[];
  missingSkills: string[];
  strengthAreas: string[];
  explanation: string;
  summary: string;
  cluster: number;
}

export interface BiasFinding {
  word: string;
  category: "gendered" | "exclusionary" | "ageist" | "corporate-jargon";
  suggestion: string;
  context: string;
}

export interface ScreeningResult {
  job: JobRequirements;
  rankings: CandidateRanking[];
  biasFindings: BiasFinding[];
  clusters: { id: number; label: string; size: number }[];
  processedAt: string;
}
