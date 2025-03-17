import { Router, Request, Response } from 'express';
import { AnalysisController } from './controller';

const router = Router();
const controller = new AnalysisController();

// Get analysis methods
router.get('/', async (req: Request, res: Response) => {
  try {
    const methods = await controller.getAnalysisMethods();
    res.status(200).json(methods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start new analysis
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { text, parameters } = req.body;
    const result = await controller.startAnalysis(text, parameters);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get analysis result
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await controller.getAnalysisById(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Perform integrated analysis
router.post('/integrated', async (req: Request, res: Response) => {
  try {
    const { text, parameters } = req.body;
    const result = await controller.performIntegratedAnalysis(text, parameters);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Extract entities from text
router.post('/entities', async (req: Request, res: Response) => {
  try {
    const { text, parameters } = req.body;
    const entities = await controller.extractEntities(text, parameters);
    res.status(200).json(entities);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export const analysisRoutes = router;