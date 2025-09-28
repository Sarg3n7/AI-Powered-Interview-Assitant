// Version 1
// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Load API key from environment (must be prefixed with VITE_ in Vite projects)
// const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// if (!GEMINI_API_KEY) {
//   console.error("❌ Missing Gemini API key! Please add VITE_GEMINI_API_KEY to your .env file.");
// }

// // --- Setup Gemini client ---
// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// const MODEL_NAME = "gemini-2.0-flash";

// // Helper for safe Gemini calls
// async function safeGenerate(prompt, context) {
//   try {
//     const model = genAI.getGenerativeModel({ model: MODEL_NAME });
//     const result = await model.generateContent(prompt);
//     const text = result.response.text();

//     console.log(`✅ Gemini raw output (${context}):`, text);

//     return text;
//   } catch (err) {
//     console.error(`❌ Gemini API error (${context}) with model "${MODEL_NAME}":`, err);
//     return null;
//   }
// }

// class GeminiService {
//   // -------------------- QUESTIONS --------------------
//   async generateQuestions(resumeText, candidateName) {
//     const prompt = `
// You are an expert technical interviewer for a Full Stack Developer (React/Node.js).
// Based on the candidate's resume, generate exactly 6 interview questions.

// Candidate: ${candidateName}
// Resume: ${resumeText}

// Requirements:
// - 2 Easy questions (20s each) → basics, syntax, fundamentals
// - 2 Medium questions (60s each) → problem-solving, best practices
// - 2 Hard questions (120s each) → system design, architecture

// ⚠️ IMPORTANT: Return ONLY valid JSON array, no commentary, no markdown.
// Format:
// [
//   {
//     "text": "Question text",
//     "difficulty": "Easy|Medium|Hard",
//     "timeLimit": 20|60|120,
//     "rubric": {
//       "correctness": "What to look for",
//       "completeness": "What makes it complete",
//       "clarity": "How to judge clarity"
//     }
//   }
// ]
// `;

//     const text = await safeGenerate(prompt, "generateQuestions");

//     if (!text) return this.getFallbackQuestions();

//     try {
//       const jsonMatch = text.match(/\[[\s\S]*\]/);
//       if (!jsonMatch) throw new Error("No JSON array in response");

//       let questions = JSON.parse(jsonMatch[0]);

//       if (!Array.isArray(questions)) throw new Error("Not an array");

//       // Ensure 6 questions
//       if (questions.length < 6) {
//         questions = [
//           ...questions,
//           ...this.getFallbackQuestions().slice(questions.length),
//         ];
//       } else if (questions.length > 6) {
//         questions = questions.slice(0, 6);
//       }

//       return questions;
//     } catch (err) {
//       console.error("❌ Failed to parse Gemini questions:", err);
//       return this.getFallbackQuestions();
//     }
//   }

//   // -------------------- SCORING --------------------
//   async scoreAnswer(question, answer) {
//     const prompt = `
// Score this interview answer on a scale of 0-15.

// Question: ${question}
// Answer: ${answer}

// Scoring:
// - Correctness (0-5)
// - Completeness (0-3)
// - Clarity (0-2)
// - Problem Solving (0-3)
// - Code Quality (0-2)

// Return ONLY valid JSON:
// {
//   "score": number,
//   "rubric": {
//     "correctness": number,
//     "completeness": number,
//     "clarity": number,
//     "problemSolving": number,
//     "codeQuality": number
//   }
// }
// `;

//     const text = await safeGenerate(prompt, "scoreAnswer");
//     if (!text) return this.getFallbackScore(answer);

//     try {
//       const jsonMatch = text.match(/\{[\s\S]*\}/);
//       if (!jsonMatch) throw new Error("No JSON object in response");

//       return JSON.parse(jsonMatch[0]);
//     } catch (err) {
//       console.error("❌ Failed to parse Gemini score:", err);
//       return this.getFallbackScore(answer);
//     }
//   }

//   // -------------------- SUMMARY --------------------
//   async createSummary(candidateData, sessionData) {
//     const totalScore = sessionData.questions.reduce(
//       (sum, q) => sum + (q.score || 0),
//       0
//     );
//     const maxScore = sessionData.questions.length * 15;

//     const transcript = sessionData.questions
//       .map(
//         (q, i) =>
//           `Q${i + 1} [${q.difficulty}]: ${q.text}\nA${i + 1}: ${
//             q.answer || "No answer"
//           }\nScore: ${q.score || 0}/15\n`
//       )
//       .join("\n");

//     const prompt = `
// Create a professional interview summary.

// Candidate: ${candidateData.name}
// Email: ${candidateData.email}
// Total Score: ${totalScore}/${maxScore}

// Interview Transcript:
// ${transcript}

// Return ONLY valid JSON:
// {
//   "summary": "2-3 paragraph professional summary",
//   "recommendation": "Hiring recommendation",
//   "strengths": ["strength1", "strength2"],
//   "improvements": ["area1", "area2"]
// }
// `;

//     const text = await safeGenerate(prompt, "createSummary");
//     if (!text) return this.getFallbackSummary(candidateData, sessionData);

//     try {
//       const jsonMatch = text.match(/\{[\s\S]*\}/);
//       if (!jsonMatch) throw new Error("No JSON object in response");

//       const parsed = JSON.parse(jsonMatch[0]);
//       return {
//         summary: parsed.summary,
//         recommendation: parsed.recommendation,
//         strengths: parsed.strengths,
//         improvements: parsed.improvements,
//       };
//     } catch (err) {
//       console.error("❌ Failed to parse Gemini summary:", err);
//       return this.getFallbackSummary(candidateData, sessionData);
//     }
//   }

//   // -------------------- FALLBACKS --------------------
//   getFallbackQuestions() {
//     return [
//       {
//         text: "What is the difference between var, let, and const in JavaScript?",
//         difficulty: "Easy",
//         timeLimit: 20,
//         rubric: {
//           correctness: "Explains scoping and hoisting differences",
//           completeness: "Mentions block scope, temporal dead zone",
//           clarity: "Clear explanation with examples",
//         },
//       },
//       {
//         text: "Explain what a closure is in JavaScript and provide an example.",
//         difficulty: "Easy",
//         timeLimit: 20,
//         rubric: {
//           correctness: "Correct definition of closure",
//           completeness: "Provides example",
//           clarity: "Explains use case",
//         },
//       },
//       {
//         text: "How would you optimize a React app for performance?",
//         difficulty: "Medium",
//         timeLimit: 60,
//         rubric: {
//           correctness: "Mentions memoization, virtualization, code splitting",
//           completeness: "At least 3 techniques explained",
//           clarity: "Explains when to use each",
//         },
//       },
//       {
//         text: "Compare SQL vs NoSQL databases with examples.",
//         difficulty: "Medium",
//         timeLimit: 60,
//         rubric: {
//           correctness: "Accurate pros/cons",
//           completeness: "Covers use cases",
//           clarity: "Clear comparison",
//         },
//       },
//       {
//         text: "Design a REST API for a blogging platform.",
//         difficulty: "Hard",
//         timeLimit: 120,
//         rubric: {
//           correctness: "Follows REST conventions",
//           completeness: "Covers CRUD + auth",
//           clarity: "Clear design",
//         },
//       },
//       {
//         text: "Explain how you would design authentication with JWTs.",
//         difficulty: "Hard",
//         timeLimit: 120,
//         rubric: {
//           correctness: "Mentions JWT flow, refresh tokens",
//           completeness: "Security best practices",
//           clarity: "Clear explanation",
//         },
//       },
//     ];
//   }

//   getFallbackScore(answer) {
//     const length = answer.trim().length;
//     let base = Math.min(5, Math.floor(length / 40));

//     if (/function|const|let|class/.test(answer)) base += 2;
//     if (/react|node|api|database/i.test(answer)) base += 2;
//     if (length > 120) base += 1;

//     const score = Math.min(15, Math.max(3, base + Math.floor(Math.random() * 3)));

//     return {
//       score,
//       rubric: {
//         correctness: Math.min(5, Math.floor(score * 0.4)),
//         completeness: Math.min(3, Math.floor(score * 0.2)),
//         clarity: Math.min(2, Math.floor(score * 0.15)),
//         problemSolving: Math.min(3, Math.floor(score * 0.2)),
//         codeQuality: /function|const|let|class/.test(answer) ? 2 : 0,
//       },
//     };
//   }

//   getFallbackSummary(candidateData, sessionData) {
//     const total = sessionData.questions.reduce((s, q) => s + (q.score || 0), 0);
//     const avg = total / sessionData.questions.length;

//     return {
//       summary: `Interview Summary for ${candidateData.name}: The candidate showed ${
//         avg >= 10 ? "strong" : avg >= 7 ? "adequate" : "limited"
//       } technical knowledge. Overall performance suggests ${
//         avg >= 10
//           ? "a highly promising full-stack developer."
//           : avg >= 7
//           ? "a solid foundation with room for growth."
//           : "they require further training before a full-stack role."
//       }`,
//       recommendation:
//         avg >= 10
//           ? "Highly recommend"
//           : avg >= 7
//           ? "Recommend with reservations"
//           : "Not recommended at this time",
//       strengths: avg >= 10 ? ["Strong technical base", "Good problem solving", "Clear communication"] : ["Basic understanding"],
//       improvements: avg >= 10 ? ["Minor refinements"] : ["Deeper technical knowledge", "More practice with system design"],
//     };
//   }
// }

// export const geminiService = new GeminiService();


//Version 2

import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Config ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.0-flash";

// Retry settings
const MAX_RETRIES = 3;          // total attempts = 1 initial + (MAX_RETRIES - 1) retries
const BASE_BACKOFF_MS = 1200;   // starting backoff if API doesn't provide retry info
const MAX_BACKOFF_MS = 7000;    // cap backoff
const JITTER_MS = 300;          // +/- jitter

if (!GEMINI_API_KEY) {
  console.error("❌ Missing Gemini API key! Please add VITE_GEMINI_API_KEY to your .env file.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ---------- helpers ----------
let lastCallTs = 0;
const MIN_GAP_MS = 1200; // ~1.2s between calls

async function ensureMinGap() {
  const now = Date.now();
  const wait = lastCallTs + MIN_GAP_MS - now;
  if (wait > 0) {
    await sleep(wait);
  }
  lastCallTs = Date.now();
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Best-effort extraction of retry-after (ms) from Gemini error object.
 * Handles:
 *  - google.rpc.RetryInfo { "retryDelay": "4s" }
 *  - "Please retry in 4.0696s."
 *  - fallback to exponential backoff
 */
function getRetryAfterMs(err, attemptIdx) {
  try {
    // The SDK throws GoogleGenerativeAIFetchError with text that often contains structured JSON.
    // We'll try to parse JSON inside the message first.
    const msg = String(err?.message || "");
    // Look for explicit "retryDelay":"Xs"
    const retryDelayMatch = msg.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
    if (retryDelayMatch) {
      const sec = parseInt(retryDelayMatch[1], 10);
      if (!Number.isNaN(sec)) return Math.min(MAX_BACKOFF_MS, sec * 1000);
    }
    // Look for "Please retry in 4.0696s."
    const pleaseRetryMatch = msg.match(/Please retry in ([\d.]+)s/i);
    if (pleaseRetryMatch) {
      const sec = parseFloat(pleaseRetryMatch[1]);
      if (!Number.isNaN(sec)) return Math.min(MAX_BACKOFF_MS, Math.floor(sec * 1000));
    }
  } catch {
    // ignore and use exponential backoff below
  }

  // Exponential backoff with jitter if server didn't specify a delay
  const base = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * Math.pow(2, attemptIdx));
  const jitter = Math.floor(Math.random() * (2 * JITTER_MS + 1)) - JITTER_MS; // +/- JITTER_MS
  return Math.max(250, base + jitter);
}

/**
 * Try to infer HTTP status code from the error (SDK specific).
 */
function getHttpStatus(err) {
  // Some versions expose err.status; otherwise parse from the message: "[429 ]" or "[503 ]"
  if (err?.status && Number.isInteger(err.status)) return err.status;
  const m = String(err?.message || "").match(/\[(\d{3})\s*\]/);
  if (m) {
    const code = parseInt(m[1], 10);
    if (!Number.isNaN(code)) return code;
  }
  return undefined;
}

/**
 * Safe wrapper around Gemini's generateContent with targeted retries for
 * transient errors (429/503). Returns `string | null` (null if all retries fail).
 */
async function safeGenerate(prompt, context) {
  await ensureMinGap();
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  let lastErr = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result?.response?.text?.();
      if (typeof text === "string") {
        // Uncomment for debugging
        // console.log(`✅ Gemini raw output (${context}) [attempt ${attempt + 1}/${MAX_RETRIES}]:`, text);
        return text;
      }
      throw new Error("Empty response from Gemini");
    } catch (err) {
      lastErr = err;
      const status = getHttpStatus(err);

      // Only retry on 429 / 503. Fail fast on other errors (4xx/5xx non-retryable).
      const isRetryable = status === 429 || status === 503;

      if (isRetryable && attempt < MAX_RETRIES - 1) {
        const waitMs = getRetryAfterMs(err, attempt);
        console.debug(
          `⚠️ Gemini ${context} failed with ${status}. Retrying in ${waitMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})…`
        );
        await sleep(waitMs);
        continue;
      }

      // Not retryable or out of attempts
      console.error(
        `❌ Gemini API error (${context}) with model "${MODEL_NAME}" (attempt ${attempt + 1}/${MAX_RETRIES}):`,
        err
      );
      break;
    }
  }

  return null; // all attempts failed
}

class GeminiService {
  // -------------------- QUESTIONS --------------------
  async generateQuestions(resumeText, candidateName) {
    const prompt = `
You are an expert technical interviewer for a Full Stack Developer (React/Node.js).
Based on the candidate's resume, generate exactly 6 interview questions.

Candidate: ${candidateName}
Resume: ${resumeText}

Requirements:
- 2 Easy questions (20s each) → basics, syntax, fundamentals
- 2 Medium questions (60s each) → problem-solving, best practices
- 2 Hard questions (120s each) → system design, architecture

Return ONLY a valid JSON array, with no commentary or markdown.
Format:
[
  {
    "text": "Question text",
    "difficulty": "Easy|Medium|Hard",
    "timeLimit": 20|60|120,
    "rubric": {
      "correctness": "What to look for",
      "completeness": "What makes it complete",
      "clarity": "How to judge clarity"
    }
  }
]
`;

    const text = await safeGenerate(prompt, "generateQuestions");

    if (!text) return this.getFallbackQuestions();

    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array in response");

      let questions = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(questions)) throw new Error("Response is not an array");

      // Normalize to exactly 6
      if (questions.length < 6) {
        questions = [...questions, ...this.getFallbackQuestions().slice(questions.length)];
      } else if (questions.length > 6) {
        questions = questions.slice(0, 6);
      }

      // Light validation (ensure fields exist and timeLimit is one of 20/60/120)
      questions = questions.map((q, i) => ({
        text: String(q?.text || `Question ${i + 1}?`),
        difficulty: ["Easy", "Medium", "Hard"].includes(q?.difficulty) ? q.difficulty : (i < 2 ? "Easy" : i < 4 ? "Medium" : "Hard"),
        timeLimit: [20, 60, 120].includes(q?.timeLimit) ? q.timeLimit : (i < 2 ? 20 : i < 4 ? 60 : 120),
        rubric: {
          correctness: q?.rubric?.correctness || "Technical accuracy",
          completeness: q?.rubric?.completeness || "Covers key points",
          clarity: q?.rubric?.clarity || "Clear explanation",
        },
      }));

      return questions;
    } catch (err) {
      console.error("❌ Failed to parse Gemini questions:", err);
      return this.getFallbackQuestions();
    }
  }

  // -------------------- SCORING --------------------
  async scoreAnswer(question, answer) {
    const prompt = `
Score this interview answer on a scale of 0-15.

Question: ${question}
Answer: ${answer}

Scoring dimensions:
- Correctness (0-5)
- Completeness (0-3)
- Clarity (0-2)
- Problem Solving (0-3)
- Code Quality (0-2)

Return ONLY valid JSON:
{
  "score": number,
  "rubric": {
    "correctness": number,
    "completeness": number,
    "clarity": number,
    "problemSolving": number,
    "codeQuality": number
  }
}
`;

    const text = await safeGenerate(prompt, "scoreAnswer");
    if (!text) return this.getFallbackScore(answer);

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object in response");

      const parsed = JSON.parse(jsonMatch[0]);
      // Ensure numeric and bounded values
      const clamp = (v, min, max) => Math.max(min, Math.min(max, Number(v) || 0));

      const rubric = {
        correctness: clamp(parsed?.rubric?.correctness, 0, 5),
        completeness: clamp(parsed?.rubric?.completeness, 0, 3),
        clarity: clamp(parsed?.rubric?.clarity, 0, 2),
        problemSolving: clamp(parsed?.rubric?.problemSolving, 0, 3),
        codeQuality: clamp(parsed?.rubric?.codeQuality, 0, 2),
      };
      const score = clamp(parsed?.score, 0, 15);

      return { score, rubric };
    } catch (err) {
      console.error("❌ Failed to parse Gemini score:", err);
      return this.getFallbackScore(answer);
    }
  }

  // -------------------- SUMMARY --------------------
  async createSummary(candidateData, sessionData) {
    const totalScore = sessionData.questions.reduce((sum, q) => sum + (q.score || 0), 0);
    const maxScore = sessionData.questions.length * 15;

    const transcript = sessionData.questions
      .map(
        (q, i) =>
          `Q${i + 1} [${q.difficulty}]: ${q.text}\nA${i + 1}: ${q.answer || "No answer"}\nScore: ${q.score || 0}/15\n`
      )
      .join("\n");

    const prompt = `
Create a professional interview summary.

Candidate: ${candidateData.name}
Email: ${candidateData.email}
Total Score: ${totalScore}/${maxScore}

Interview Transcript:
${transcript}

Return ONLY valid JSON:
{
  "summary": "2-3 paragraph professional summary",
  "recommendation": "Hiring recommendation",
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"]
}
`;

    const text = await safeGenerate(prompt, "createSummary");
    if (!text) return this.getFallbackSummary(candidateData, sessionData);

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object in response");

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: String(parsed?.summary || ""),
        recommendation: String(parsed?.recommendation || ""),
        strengths: Array.isArray(parsed?.strengths) ? parsed.strengths : [],
        improvements: Array.isArray(parsed?.improvements) ? parsed.improvements : [],
      };
    } catch (err) {
      console.error("❌ Failed to parse Gemini summary:", err);
      return this.getFallbackSummary(candidateData, sessionData);
    }
  }

  // -------------------- FALLBACKS --------------------
  getFallbackQuestions() {
    return [
      {
        text: "What is the difference between var, let, and const in JavaScript?",
        difficulty: "Easy",
        timeLimit: 20,
        rubric: {
          correctness: "Explains scoping and hoisting differences",
          completeness: "Mentions block scope, temporal dead zone",
          clarity: "Clear explanation with examples",
        },
      },
      {
        text: "Explain what a closure is in JavaScript and provide an example.",
        difficulty: "Easy",
        timeLimit: 20,
        rubric: {
          correctness: "Correct definition of closure",
          completeness: "Provides example",
          clarity: "Explains use case",
        },
      },
      {
        text: "How would you optimize a React app for performance?",
        difficulty: "Medium",
        timeLimit: 60,
        rubric: {
          correctness: "Mentions memoization, virtualization, code splitting",
          completeness: "At least 3 techniques explained",
          clarity: "Explains when to use each",
        },
      },
      {
        text: "Compare SQL vs NoSQL databases with examples.",
        difficulty: "Medium",
        timeLimit: 60,
        rubric: {
          correctness: "Accurate pros/cons",
          completeness: "Covers use cases",
          clarity: "Clear comparison",
        },
      },
      {
        text: "Design a REST API for a blogging platform.",
        difficulty: "Hard",
        timeLimit: 120,
        rubric: {
          correctness: "Follows REST conventions",
          completeness: "Covers CRUD + auth",
          clarity: "Clear design",
        },
      },
      {
        text: "Explain how you would design authentication with JWTs.",
        difficulty: "Hard",
        timeLimit: 120,
        rubric: {
          correctness: "Mentions JWT flow, refresh tokens",
          completeness: "Security best practices",
          clarity: "Clear explanation",
        },
      },
    ];
  }

  getFallbackScore(answer) {
    const length = (answer || "").trim().length;
    let base = Math.min(5, Math.floor(length / 40));
    if (/function|const|let|class/.test(answer)) base += 2;
    if (/react|node|api|database|express|redux/i.test(answer)) base += 2;
    if (length > 120) base += 1;
    const score = Math.min(15, Math.max(3, base + Math.floor(Math.random() * 3)));

    return {
      score,
      rubric: {
        correctness: Math.min(5, Math.floor(score * 0.4)),
        completeness: Math.min(3, Math.floor(score * 0.2)),
        clarity: Math.min(2, Math.floor(score * 0.15)),
        problemSolving: Math.min(3, Math.floor(score * 0.2)),
        codeQuality: /function|const|let|class/.test(answer) ? 2 : 0,
      },
    };
  }

  getFallbackSummary(candidateData, sessionData) {
    const total = sessionData.questions.reduce((s, q) => s + (q.score || 0), 0);
    const avg = total / sessionData.questions.length;

    return {
      summary: `Interview Summary for ${candidateData.name}: The candidate showed ${
        avg >= 10 ? "strong" : avg >= 7 ? "adequate" : "limited"
      } technical knowledge across the topics discussed. Overall performance suggests ${
        avg >= 10
          ? "a highly promising full-stack developer."
          : avg >= 7
          ? "a solid foundation with room for growth."
          : "they require further preparation before a full-stack role."
      }`,
      recommendation:
        avg >= 10
          ? "Highly recommend"
          : avg >= 7
          ? "Recommend with reservations"
          : "Not recommended at this time",
      strengths:
        avg >= 10
          ? ["Strong technical base", "Good problem solving", "Clear communication"]
          : ["Basic understanding"],
      improvements:
        avg >= 10 ? ["Minor refinements"] : ["Deeper technical knowledge", "More practice with system design"],
    };
  }
}

export const geminiService = new GeminiService();
