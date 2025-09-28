// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   try {
//     const { candidateData, sessionData } = req.body;

//     // Mock summary generation - replace with OpenAI integration
//     const totalScore = sessionData.questions.reduce((sum, q) => sum + (q.score || 0), 0);
//     const averageScore = totalScore / sessionData.questions.length;
    
//     let recommendation = 'Strong candidate';
//     let strengths = [];
//     let improvements = [];

//     if (averageScore >= 12) {
//       recommendation = 'Excellent candidate - highly recommend';
//       strengths = ['Strong technical knowledge', 'Clear communication', 'Good problem-solving approach'];
//     } else if (averageScore >= 8) {
//       recommendation = 'Good candidate - recommend with considerations';
//       strengths = ['Solid technical foundation', 'Adequate communication'];
//       improvements = ['Could improve on advanced concepts'];
//     } else {
//       recommendation = 'Needs further evaluation';
//       strengths = ['Basic understanding demonstrated'];
//       improvements = ['Requires significant improvement in technical knowledge', 'Communication could be clearer'];
//     }

//     const summary = `
// Interview Summary for ${candidateData.name}:

// Overall Performance: ${recommendation}

// Strengths:
// ${strengths.map(s => `• ${s}`).join('\n')}

// Areas for Improvement:
// ${improvements.map(i => `• ${i}`).join('\n')}

// Technical Score: ${Math.round((totalScore / (sessionData.questions.length * 15)) * 100)}/100

// The candidate demonstrated ${averageScore >= 10 ? 'strong' : averageScore >= 7 ? 'adequate' : 'limited'} technical knowledge across the interview questions.
//     `.trim();

//     res.status(200).json({
//       summary,
//       recommendation,
//       strengths,
//       improvements
//     });
//   } catch (error) {
//     console.error('Summary generation error:', error);
//     res.status(500).json({ message: 'Failed to create summary' });
//   }
// }

//Version 2

import { geminiService } from '../src/services/geminiService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { candidateData, sessionData } = req.body;

    if (!candidateData || !sessionData) {
      return res.status(400).json({ message: 'Missing required fields: candidateData or sessionData' });
    }

    // Call Gemini to create interview summary
    const summary = await geminiService.createSummary(candidateData, sessionData);

    res.status(200).json(summary);
  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ message: 'Failed to create summary' });
  }
}
