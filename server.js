import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Import API handlers
const generateQuestions = (await import('./api/generate-questions.js')).default;
const scoreAnswer = (await import('./api/score-answer.js')).default;
const createSummary = (await import('./api/create-summary.js')).default;

// API routes
app.post('/api/generate-questions', (req, res) => {
  generateQuestions(req, res);
});

app.post('/api/score-answer', (req, res) => {
  scoreAnswer(req, res);
});

app.post('/api/create-summary', (req, res) => {
  createSummary(req, res);
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});