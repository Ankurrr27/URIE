const STOP_WORDS = new Set([
  "and",
  "the",
  "with",
  "for",
  "from",
  "that",
  "this",
  "you",
  "your",
  "are",
  "will",
  "have",
  "has",
  "our",
  "their",
  "into",
  "using",
  "use"
]);

export type AtsAnalysis = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  suggestions: string[];
};

export function extractKeywords(text: string) {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([keyword]) => keyword);
}

export function analyzeResumeAgainstJob(resumeText: string, jobDescription: string): AtsAnalysis {
  const resume = resumeText.toLowerCase();
  const jobKeywords = extractKeywords(jobDescription);
  const matchedKeywords = jobKeywords.filter((keyword) => resume.includes(keyword));
  const missingKeywords = jobKeywords.filter((keyword) => !resume.includes(keyword)).slice(0, 20);

  const keywordScore = jobKeywords.length ? (matchedKeywords.length / jobKeywords.length) * 70 : 0;
  const formatScore = scoreFormatting(resumeText);
  const impactScore = scoreImpactLanguage(resumeText);
  const score = Math.min(100, Math.round(keywordScore + formatScore + impactScore));

  return {
    score,
    matchedKeywords,
    missingKeywords,
    strengths: buildStrengths(score, matchedKeywords, resumeText),
    suggestions: buildSuggestions(missingKeywords, resumeText, score)
  };
}

function scoreFormatting(text: string) {
  let score = 0;
  if (/experience|work history/i.test(text)) score += 5;
  if (/education/i.test(text)) score += 5;
  if (/skills|technologies/i.test(text)) score += 5;
  if (text.length > 1500) score += 5;
  return score;
}

function scoreImpactLanguage(text: string) {
  let score = 0;
  if (/\d+%|\$\d+|\d+x|\d+\s+(users|customers|requests|teams)/i.test(text)) score += 5;
  if (/built|led|owned|improved|reduced|increased|launched|automated/i.test(text)) score += 5;
  return score;
}

function buildStrengths(score: number, matched: string[], text: string) {
  const strengths = [];
  if (matched.length > 8) strengths.push("Strong alignment with role keywords.");
  if (/\d+%|\$\d+|\d+x/i.test(text)) strengths.push("Includes measurable impact and outcomes.");
  if (/skills|technologies/i.test(text)) strengths.push("Has a dedicated skills section.");
  if (score >= 80) strengths.push("Resume is likely to perform well in ATS screening.");
  return strengths.length ? strengths : ["Clear baseline content was detected."];
}

function buildSuggestions(missing: string[], text: string, score: number) {
  const suggestions = [];
  if (missing.length) suggestions.push(`Add role-relevant keywords naturally: ${missing.slice(0, 8).join(", ")}.`);
  if (!/\d+%|\$\d+|\d+x/i.test(text)) suggestions.push("Quantify achievements with metrics, scale, revenue, time saved, or quality gains.");
  if (!/summary|profile/i.test(text)) suggestions.push("Add a concise professional summary tailored to the job description.");
  if (score < 70) suggestions.push("Reorder bullets so the most relevant experience and skills appear near the top.");
  return suggestions;
}
