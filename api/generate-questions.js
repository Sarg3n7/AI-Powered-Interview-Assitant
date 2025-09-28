// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   try {
//     const { resumeText, candidateName, role } = req.body;

//     // Mock response for development - replace with OpenAI integration
//     const questions = [
//       {
//         text: `What is the difference between var, let, and const in JavaScript? Please explain with examples.`,
//         difficulty: "Easy",
//         timeLimit: 20,
//         rubric: {
//           correctness: "Understanding of scope and hoisting differences",
//           completeness: "Mentions block scoping, temporal dead zone",
//           clarity: "Clear explanation with examples"
//         }
//       },
//       {
//         text: "Explain what a closure is in JavaScript and provide a practical example of where you might use one.",
//         difficulty: "Easy",
//         timeLimit: 20,
//         rubric: {
//           correctness: "Correct definition of closures",
//           completeness: "Provides working example",
//           clarity: "Explains practical use cases"
//         }
//       },
//       {
//         text: "How would you optimize a React application for better performance? Mention at least 3 specific techniques and explain when you'd use them.",
//         difficulty: "Medium",
//         timeLimit: 60,
//         rubric: {
//           correctness: "Knowledge of React optimization techniques",
//           completeness: "Multiple optimization strategies mentioned",
//           clarity: "Explains when and why to use each technique"
//         }
//       },
//       {
//         text: "Compare SQL and NoSQL databases. When would you choose one over the other for a full-stack application? Give specific examples.",
//         difficulty: "Medium",
//         timeLimit: 60,
//         rubric: {
//           correctness: "Accurate comparison of database types",
//           completeness: "Mentions use cases for each",
//           clarity: "Clear pros and cons comparison"
//         }
//       },
//       {
//         text: "Design a complete RESTful API for a blog system that supports posts, comments, and user authentication. Include all necessary endpoints, HTTP methods, and explain your design decisions.",
//         difficulty: "Hard",
//         timeLimit: 120,
//         rubric: {
//           correctness: "Proper REST conventions followed",
//           completeness: "All CRUD operations covered",
//           clarity: "Well-structured endpoint design"
//         }
//       },
//       {
//         text: "Design and implement a complete authentication and authorization system for a full-stack web application. Cover both frontend and backend, including security best practices, token management, and user roles.",
//         difficulty: "Hard",
//         timeLimit: 120,
//         rubric: {
//           correctness: "Security best practices mentioned",
//           completeness: "Both frontend and backend considerations",
//           clarity: "Explains JWT, sessions, or other auth methods"
//         }
//       }
//     ];

//     res.status(200).json(questions);
//   } catch (error) {
//     console.error('Question generation error:', error);
//     res.status(500).json({ message: 'Failed to generate questions' });
//   }
// }





// Version 2

import { geminiService } from '../src/services/geminiService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { resumeText, candidateName } = req.body;

    if (!resumeText || !candidateName) {
      return res.status(400).json({ message: 'Missing required fields: resumeText or candidateName' });
    }

    // Call Gemini API to generate 6 questions (2 Easy, 2 Medium, 2 Hard)
    const questions = await geminiService.generateQuestions(resumeText, candidateName);

    // Ensure valid fallback if Gemini didn’t return the expected structure
    if (!Array.isArray(questions) || questions.length !== 6) {
      console.warn('Gemini did not return 6 questions, using fallback.');
      return res.status(200).json(geminiService.getFallbackQuestions());
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ message: 'Failed to generate questions' });
  }
}
