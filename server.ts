import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Vercel Serverless Function handlers to ensure 100% parity
import generateMissionsHandler from './api/ai/generate-missions';
import competenceAnalysisHandler from './api/ai/competence-analysis';
import coachChatHandler from './api/ai/coach-chat';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Dev server must always run on port 3000 in AI Studio
const portArgIndex = process.argv.indexOf('--port');
const portArg = portArgIndex !== -1 ? Number(process.argv[portArgIndex + 1]) : NaN;
const PORT = !isNaN(portArg) ? portArg : 3000;

const hostArgIndex = process.argv.indexOf('--host');
const hostArg = hostArgIndex !== -1 ? process.argv[hostArgIndex + 1] : '0.0.0.0';
const HOST = hostArg || '0.0.0.0';

app.use(express.json({ limit: '10mb' }));

// 1. AI Competence Analysis
app.post('/api/ai/competence-analysis', async (req: Request, res: Response) => {
  await competenceAnalysisHandler(req, res);
});

// 2. AI Mission Generation
app.post('/api/ai/generate-missions', async (req: Request, res: Response) => {
  await generateMissionsHandler(req, res);
});

// 3. AI Career Coach Chat
app.post('/api/ai/coach-chat', async (req: Request, res: Response) => {
  await coachChatHandler(req, res);
});

// Development and Production server setups
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await (
      await import('vite')
    ).createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Career Mission Server successfully listening on http://${HOST}:${PORT}`);
  });
}

startServer();
