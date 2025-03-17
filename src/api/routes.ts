import { Express, Request, Response } from 'express';
import { explorationRoutes } from './exploration/routes';
import { analysisRoutes } from './analysis/routes';
import { verificationRoutes } from './verification/routes';

export function setupRoutes(app: Express): void {
  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API version
  app.get('/api/version', (req: Request, res: Response) => {
    res.status(200).json({ version: '0.1.0', name: 'Integrated Quranic Analysis and Exploration System' });
  });

  // Feature routes
  app.use('/api/exploration', explorationRoutes);
  app.use('/api/analysis', analysisRoutes);
  app.use('/api/verification', verificationRoutes);

  // 404 handler
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });
}