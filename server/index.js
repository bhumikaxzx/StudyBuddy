import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const port = Number(process.env.PORT || 8787);
const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const STOP_WORDS = new Set(
  "the a an and or but is are was were be been being to of in on for with as by at from that this these those it its you your we our they their can could should would will may might about into than then such not no do does did have has had what which who whom whose when where why how explain difference between give tell show compare please".split(" ")
);

function cleanText(value = "") {
  return String(value)
    .replace(/\u0000/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stem(word) {
  return word
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/(ing|edly|edly|ed|es|s)$/i, "");
}

function terms(value = "") {
  const found = cleanText(value).toLowerCase().match(/[a-z0-9][a-z0-9-]{1,}/g) || [];
  return found.map(stem).filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function splitIntoChunks(text, maxChars = 1800, overlapChars = 220) {
  const source = cleanText(text);
  if (!source) return [];

  const paragraphs = source.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  let buffer = "";

  const pushBuffer = () => {
    const chunk = buffer.trim();
    if (!chunk) return;
    chunks.push(chunk);
    buffer = chunk.slice(Math.max(0, chunk.length - overlapChars));
  };

  for (const paragraph of paragraphs.length ? paragraphs : [source]) {
    if (paragraph.length > maxChars) {
      if (buffer.trim()) pushBuffer();
      let start = 0;
      while (start < paragraph.length) {
        const end = Math.min(paragraph.length, start + maxChars);
        chunks.push(paragraph.slice(start, end).trim());
        if (end === paragraph.length) break;
        start = Math.max(start + 1, end - overlapChars);
      }
      buffer = "";
      continue;
    }

    const candidate = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
    if (candidate.length > maxChars && buffer.trim()) pushBuffer();
    buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
  }

  if (buffer.trim()) chunks.push(buffer.trim());
  return chunks.filter(Boolean);
}

function scoreChunk(chunk, query) {
  const qTerms = terms(query);
  if (!qTerms.length) return 0;
  const chunkTerms = terms(chunk);
  const frequencies = new Map();
  for (const t of chunkTerms) frequencies.set(t, (frequencies.get(t) || 0) + 1);

  let score = 0;
  for (const q of qTerms) {
    const count = frequencies.get(q) || 0;
    if (count) score += 2.5 + Math.min(count, 4) * 0.8;
  }

  const lowered = chunk.toLowerCase();
  const meaningfulPhrase = cleanText(query).toLowerCase().replace(/[?!.]+$/g, "");
  if (meaningfulPhrase.length > 8 && lowered.includes(meaningfulPhrase)) score += 12;

  // Prefer chunks that contain several distinct query concepts rather than one repeated word.
  const distinctMatches = qTerms.filter((q) => frequencies.has(q)).length;
  score += distinctMatches * distinctMatches * 0.7;
  return score;
}

function representativeChunks(chunks, limit = 7) {
  if (chunks.length <= limit) return chunks.map((text, index) => ({ text, index, score: 0 }));
  const picks = new Set([0, chunks.length - 1]);
  const slots = Math.max(1, limit - picks.size);
  for (let i = 1; i <= slots; i += 1) {
    picks.add(Math.round((i * (chunks.length - 1)) / (slots + 1)));
  }
  return [...picks]
    .sort((a, b) => a - b)
    .slice(0, limit)
    .map((index) => ({ text: chunks[index], index, score: 0 }));
}

function retrieveChunks(text, query, limit = 6) {
  const chunks = splitIntoChunks(text);
  if (!chunks.length) return [];

  const broadAnalysis = /\b(ats|resume|cv|friendly|review|critique|evaluate|overall|improve|strength|weakness)\b/i.test(query || "");
  if (broadAnalysis) return representativeChunks(chunks, limit);

  const ranked = chunks
    .map((chunk, index) => ({ text: chunk, index, score: scoreChunk(chunk, query) }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  if ((ranked[0]?.score || 0) <= 0) return representativeChunks(chunks, limit);
  return ranked.slice(0, limit);
}

function materialForGeneration(text, limit = 9) {
  const chunks = splitIntoChunks(text);
  const selected = representativeChunks(chunks, limit);
  return selected.map((c, i) => `[Section ${i + 1}]\n${c.text}`).join("\n\n");
}

function contextBlock(chunks) {
  return chunks.map((c, i) => `[Source ${i + 1}]\n${c.text}`).join("\n\n");
}

function sourcePreviews(chunks) {
  return chunks.map((chunk, i) => ({
    id: i + 1,
    chunkIndex: chunk.index,
    excerpt: chunk.text.replace(/\s+/g, " ").slice(0, 260) + (chunk.text.length > 260 ? "…" : ""),
  }));
}

function instructionFor(action, body) {
  if (action === "summarize") {
    const material = materialForGeneration(body.text || "", 10);
    return `You are StudyBuddy, an accurate study assistant. Summarize the supplied study material, not just isolated sentences. Cover the major concepts across the document. Return valid JSON only in this exact shape: {"overview":"2-3 sentence overview","points":["6-8 concise high-value bullets"],"keyTerms":["up to 8 important terms"]}. Do not invent facts not supported by the material.\n\nTITLE: ${body.title || "Study material"}\n\nMATERIAL:\n${material}`;
  }

  if (action === "qa") {
    const chunks = retrieveChunks(body.text || body.context || "", body.question || "", 6);
    return {
      prompt: `You are StudyBuddy, a rigorous tutor answering from a student's uploaded document. Use the sources as evidence, but reason about them instead of copying random text.\n\nRules:\n1. Answer the exact question directly.\n2. Use only claims supported by the supplied sources.\n3. If the sources do not support the answer, say so clearly.\n4. For comparison questions, state the distinction explicitly and use a small example when useful.\n5. For requests to evaluate a resume/CV (including ATS friendliness), analyze the document as a resume rather than merely quoting it.\n6. Cite supporting source numbers in the answer like [1] or [2].\n7. Return valid JSON only: {"answer":"clear educational answer with source markers","citations":[1,2],"grounded":true}.\n\nQUESTION:\n${body.question || ""}\n\nSOURCES:\n${contextBlock(chunks)}`,
      chunks,
    };
  }

  if (action === "explain") {
    const query = body.concept || body.question || "important concepts";
    const chunks = retrieveChunks(body.text || "", query, 6);
    return {
      prompt: `Explain the requested concept like an excellent tutor. Start simple, then give the precise explanation, then one useful example. Stay grounded in the sources. If the material is insufficient, say what is missing. Return valid JSON only: {"answer":"...","citations":[1,2]}.\n\nREQUEST:\n${query}\n\nSOURCES:\n${contextBlock(chunks)}`,
      chunks,
    };
  }

  if (action === "flashcards") {
    const material = materialForGeneration(body.text || "", 10);
    return `Create ${Math.min(Number(body.count) || 10, 20)} high-quality active-recall flashcards from the study material. Cover different concepts across the document. Questions must be specific; answers should be concise and accurate. Avoid cards that merely ask what a random word means unless it is genuinely important. Return valid JSON only: {"cards":[{"front":"question","back":"answer"}]}.\n\nMATERIAL:\n${material}`;
  }

  if (action === "quiz") {
    const material = materialForGeneration(body.text || "", 10);
    return `Create ${Math.min(Number(body.count) || 7, 15)} useful multiple-choice questions from the material. Mix conceptual understanding and application. Each item must have exactly 4 plausible short choices. The \"answer\" field MUST exactly equal one item in \"choices\". Give a short teaching explanation. Return valid JSON only: {"questions":[{"question":"...","choices":["...","...","...","..."],"answer":"exact choice text","explanation":"..."}]}.\n\nMATERIAL:\n${material}`;
  }

  if (action === "resume-ats") {
    const material = materialForGeneration(body.text || "", 12);
    const jd = cleanText(body.jobDescription || "");
    return `Act as an ATS-focused resume reviewer. Analyze ONLY the supplied resume text${jd ? " against the supplied job description" : " for general software/technical recruiting readiness"}. Do not fabricate experience or metrics. Return valid JSON only in this shape: {"score":0,"verdict":"...","strengths":["..."],"issues":["..."],"keywords":["..."],"sectionAdvice":[{"section":"...","advice":"..."}],"rewrittenSummary":"..."}. Score must be an integer from 0 to 100. The rewritten summary must only use facts already present in the resume.\n\nRESUME:\n${material}${jd ? `\n\nJOB DESCRIPTION:\n${jd}` : ""}`;
  }

  if (action === "study-plan") {
    return `Create a practical ${Math.min(Number(body.days) || 7, 30)}-day study plan for this goal: ${body.goal || "study consistently"}. The student has about ${Number(body.minutes) || 90} minutes per day. Make tasks concrete and varied (learn, active recall, practice, review). Return valid JSON only: {"plan":[{"day":1,"focus":"...","tasks":["...","...","..."]}]}.`;
  }

  return "Return valid JSON only: {}";
}

function extractGeminiText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => (typeof part?.text === "string" ? part.text : "")).filter(Boolean).join("\n");
}

function parseJsonOutput(text) {
  const cleaned = String(text || "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("Gemini did not return valid JSON.");
  }
}

async function callGemini(input) {
  const apiKey = process.env.GEMINI_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: input }] }],
      generationConfig: {
        temperature: 0.25,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`Gemini request failed (${response.status}): ${text.slice(0, 900)}`);
    error.status = response.status;
    throw error;
  }

  const payload = await response.json();
  const text = extractGeminiText(payload);
  if (!text) {
    const reason = payload?.candidates?.[0]?.finishReason || payload?.promptFeedback?.blockReason || "empty response";
    throw new Error(`Gemini returned no text (${reason}).`);
  }
  return parseJsonOutput(text);
}

function normalizeCards(cards = []) {
  return cards
    .filter((c) => c?.front && c?.back)
    .map((c, i) => ({
      id: `card_${Date.now()}_${i}`,
      front: String(c.front).trim(),
      back: String(c.back).trim(),
      mastered: false,
    }));
}

function normalizeQuestions(questions = []) {
  return questions
    .filter((q) => q?.question && Array.isArray(q?.choices) && q.choices.length >= 2)
    .map((q, i) => {
      const choices = q.choices.slice(0, 4).map((x) => String(x));
      while (choices.length < 4) choices.push(`Option ${choices.length + 1}`);
      let answer = String(q.answer || "");
      if (!choices.includes(answer) && /^[A-D]$/i.test(answer)) answer = choices[answer.toUpperCase().charCodeAt(0) - 65] || choices[0];
      if (!choices.includes(answer)) answer = choices[0];
      return {
        id: `q_${Date.now()}_${i}`,
        question: String(q.question).trim(),
        choices,
        answer,
        explanation: String(q.explanation || "Review the relevant concept in your notes.").trim(),
      };
    });
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    provider: "gemini",
    model,
  });
});

app.post("/api/ai", async (req, res) => {
  const { action } = req.body || {};
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: "AI server is running, but GEMINI_API_KEY is not configured." });
  }

  try {
    const instruction = instructionFor(action, req.body || {});
    const prompt = typeof instruction === "string" ? instruction : instruction.prompt;
    const retrievedChunks = typeof instruction === "object" ? instruction.chunks || [] : [];
    const result = await callGemini(prompt);

    if (action === "flashcards") result.cards = normalizeCards(result.cards);
    if (action === "quiz") result.questions = normalizeQuestions(result.questions);
    if (action === "qa" || action === "explain") {
      result.sources = sourcePreviews(retrievedChunks);
      result.citations = Array.isArray(result.citations)
        ? result.citations.filter((n) => Number.isInteger(n) && n >= 1 && n <= retrievedChunks.length)
        : [];
    }

    result._meta = {
      mode: "model",
      provider: "gemini",
      model,
      retrievedChunks: retrievedChunks.length,
    };
    res.json(result);
  } catch (error) {
    console.error("AI request failed:", error);
    res.status(error.status || 500).json({ error: error.message || "AI request failed" });
  }
});

app.listen(port, () => {
  console.log(`StudyBuddy AI server listening on http://localhost:${port}`);
  console.log(process.env.GEMINI_API_KEY ? `Gemini AI enabled (${model}).` : "GEMINI_API_KEY is missing; frontend will show Local mode.");
});
app.get("/", (req, res) => {
  res.json({
    message: "StudyBuddy API is running 🚀",
    status: "online",
  });
});