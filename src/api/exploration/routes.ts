import { Router, Request, Response } from 'express';
import { SystematicExplorerController } from './controller';

const router = Router();
const controller = new SystematicExplorerController();

// Get exploration methods
router.get('/', async (req: Request, res: Response) => {
  try {
    const methods = await controller.getExplorationMethods();
    res.status(200).json(methods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start new exploration
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { concept, parameters } = req.body;
    const result = await controller.startExploration(concept, parameters);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get exploration result
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await controller.getExplorationById(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Exploration not found' });
    }
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Discover relationships
router.post('/relationships', async (req: Request, res: Response) => {
  try {
    const { sourceId, targetId, parameters } = req.body;
    const relationships = await controller.discoverRelationships(sourceId, targetId, parameters);
    res.status(200).json(relationships);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Discover patterns
router.post('/patterns', async (req: Request, res: Response) => {
  try {
    const { text, parameters } = req.body;
    const patterns = await controller.discoverPatterns(text, parameters);
    res.status(200).json(patterns);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export const explorationRoutes = router;