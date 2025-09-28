// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   try {
//     const { question, answer } = req.body;

//     // Mock scoring logic - replace with OpenAI integration
//     const answerLength = answer.trim().length;
//     const hasCodeExample = /```|`/.test(answer) || /function|class|const|let|var/.test(answer);
//     const mentionsKeywords = /react|javascript|database|api|security|performance/i.test(answer);

//     let baseScore = Math.min(5, Math.max(1, Math.floor(answerLength / 50)));
    
//     if (hasCodeExample) baseScore += 2;
//     if (mentionsKeywords) baseScore += 2;
//     if (answerLength > 100) baseScore += 1;

//     const score = Math.min(15, Math.max(3, baseScore + Math.floor(Math.random() * 3)));

//     const rubric = {
//       correctness: Math.min(5, Math.floor(score * 0.4)),
//       completeness: Math.min(3, Math.floor(score * 0.2)),
//       clarity: Math.min(2, Math.floor(score * 0.15)),
//       problemSolving: Math.min(3, Math.floor(score * 0.2)),
//       codeQuality: hasCodeExample ? Math.min(2, Math.floor(score * 0.15)) : 0,
//     };

//     res.status(200).json({ score, rubric });
//   } catch (error) {
//     console.error('Scoring error:', error);
//     res.status(500).json({ message: 'Failed to score answer' });
//   }
// }




//Version 2

import { geminiService } from '../src/services/geminiService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Missing required fields: question or answer' });
    }

    // Call Gemini to score the answer
    const result = await geminiService.scoreAnswer(question, answer);

    res.status(200).json(result);
  } catch (error) {
    console.error('Scoring error:', error);
    res.status(500).json({ message: 'Failed to score answer' });
  }
}
