function splitSentences(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);
}

function keywords(text) {
  const stop = new Set("the a an and or but is are was were be been being to of in on for with as by at from that this these those it its you your we our they their can could should would will may might about into than then such not no do does did have has had what which who when where why how".split(" "));
  const counts = {};
  String(text || "").toLowerCase().match(/[a-z0-9][a-z0-9-]{2,}/g)?.forEach((w) => {
    if (!stop.has(w)) counts[w] = (counts[w] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([w]) => w);
}

export function localSummarize(text, maxPoints = 6) {
  const sentences = splitSentences(text);
  if (!sentences.length) return [String(text || "").trim()].filter(Boolean);
  const top = new Set(keywords(text).slice(0, 15));
  return sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: sentence.toLowerCase().match(/[a-z0-9-]+/g)?.reduce((sum, w) => sum + (top.has(w) ? 1 : 0), 0) || 0,
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, maxPoints)
    .sort((a, b) => a.index - b.index)
    .map((x) => x.sentence);
}

export function retrieveContext(text, question, limit = 4) {
  const q = new Set(keywords(question).slice(0, 12));
  const chunks = String(text || "").match(/.{1,900}(?:\s|$)/g) || [String(text || "")];
  return chunks
    .map((chunk) => ({
      chunk,
      score: (chunk.toLowerCase().match(/[a-z0-9-]+/g) || []).reduce((sum, w) => sum + (q.has(w) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.chunk)
    .join("\n\n");
}

export function localAnswer(context, question) {
  const relevant = retrieveContext(context, question, 3);
  const summary = localSummarize(relevant, 3);
  if (!summary.length) return "I could not find enough relevant information in the selected study material.";
  return `${summary.join(" ")}\n\n(Local extractive mode — start the AI server for a reasoned answer.)`;
}

export function localFlashcards(text, count = 8) {
  const sentences = splitSentences(text).slice(0, Math.max(count * 2, count));
  const terms = keywords(text);
  return Array.from({ length: Math.min(count, Math.max(1, sentences.length)) }, (_, i) => {
    const sentence = sentences[i % sentences.length] || String(text || "").slice(0, 180);
    const term = terms.find((t) => sentence.toLowerCase().includes(t)) || terms[i] || `Concept ${i + 1}`;
    return {
      id: `card_${Date.now()}_${i}`,
      front: `What should you remember about “${term}”?`,
      back: sentence,
      mastered: false,
    };
  });
}

export function localQuiz(text, count = 5) {
  const sentences = splitSentences(text);
  const terms = keywords(text);
  return Array.from({ length: Math.min(count, Math.max(1, sentences.length)) }, (_, i) => {
    const sentence = sentences[i % sentences.length] || String(text || "");
    const answer = terms.find((t) => sentence.toLowerCase().includes(t)) || terms[i] || "concept";
    const distractors = terms.filter((t) => t !== answer).slice(i + 1, i + 4);
    while (distractors.length < 3) distractors.push(["example", "method", "result"][distractors.length]);
    const choices = [answer, ...distractors.slice(0, 3)].sort((a, b) => a.localeCompare(b));
    return {
      id: `q_${Date.now()}_${i}`,
      question: `Which key term best matches this idea: “${sentence.slice(0, 140)}${sentence.length > 140 ? "…" : ""}”`,
      choices,
      answer,
      explanation: sentence,
    };
  });
}

function localResumeATS(text) {
  const source = String(text || "");
  const lower = source.toLowerCase();
  const checks = [
    ["Skills section", /skills|technical skills/],
    ["Education section", /education|b\.?tech|bachelor|university|college/],
    ["Project or experience evidence", /project|experience|internship/],
    ["Contact information", /@|linkedin|github|phone|\+\d/],
  ];
  const passed = checks.filter(([, re]) => re.test(lower)).length;
  const score = 45 + passed * 10;
  return {
    score,
    verdict: "Basic structural check only. Start the real AI backend for a proper ATS review.",
    strengths: checks.filter(([, re]) => re.test(lower)).map(([label]) => `${label} detected.`),
    issues: ["Local mode cannot judge wording quality, keyword fit, impact, or role-specific ATS alignment."],
    keywords: keywords(source).slice(0, 8),
    sectionAdvice: [],
    rewrittenSummary: "",
  };
}

function localMeta() {
  return { mode: "local", provider: "browser", model: "extractive-fallback" };
}

export async function getAIStatus() {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) throw new Error("AI server unavailable");
    return await response.json();
  } catch {
    return { ok: false, aiConfigured: false, provider: "local", model: "extractive-fallback" };
  }
}

export async function callAI(action, payload) {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
    if (response.ok) return await response.json();
  } catch {
    // The explicit local mode below keeps the prototype usable when the server/API is unavailable.
  }

  if (action === "summarize") return { points: localSummarize(payload.text || ""), _meta: localMeta() };
  if (action === "qa" || action === "explain") return { answer: localAnswer(payload.text || payload.context || "", payload.question || payload.concept || ""), sources: [], _meta: localMeta() };
  if (action === "flashcards") return { cards: localFlashcards(payload.text || "", payload.count || 8), _meta: localMeta() };
  if (action === "quiz") return { questions: localQuiz(payload.text || "", payload.count || 5), _meta: localMeta() };
  if (action === "resume-ats") return { ...localResumeATS(payload.text || ""), _meta: localMeta() };
  if (action === "study-plan") {
    const days = payload.days || 7;
    return {
      plan: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        focus: payload.goal || "Review core concepts",
        tasks: ["25 min focused study", "10 min active recall", "5 min review"],
      })),
      _meta: localMeta(),
    };
  }
  return { _meta: localMeta() };
}
