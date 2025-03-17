import { Router, Request, Response } from 'express';
import { VerificationController } from './controller';

const router = Router();
const controller = new VerificationController();

// Get verification methods
router.get('/', async (req: Request, res: Response) => {
  try {
    const methods = await controller.getVerificationMethods();
    res.status(200).json(methods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify a knowledge node
router.post('/node', async (req: Request, res: Response) => {
  try {
    const { nodeId, parameters } = req.body;
    const result = await controller.verifyKnowledgeNode(nodeId, parameters);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Verify a relationship
router.post('/relationship', async (req: Request, res: Response) => {
  try {
    const { sourceId, targetId, relationshipType, parameters } = req.body;
    const result = await controller.verifyRelationship(sourceId, targetId, relationshipType, parameters);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get verification history
router.get('/history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const history = await controller.getVerificationHistory(id);
    
    if (!history || history.length === 0) {
      return res.status(404).json({ error: 'No verification history found' });
    }
    
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify analysis results
router.post('/analysis', async (req: Request, res: Response) => {
  try {
    const { analysisId, parameters } = req.body;
    const result = await controller.verifyAnalysisResults(analysisId, parameters);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export const verificationRoutes = router;