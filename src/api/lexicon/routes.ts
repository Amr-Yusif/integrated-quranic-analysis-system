import { Router, Request, Response } from 'express';
import { LexiconController } from './controller';

const router = Router();
const controller = new LexiconController();

// Get lexicon statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await controller.getStatistics();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search in lexicon
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { query, includeSynonyms, includeDerivatives, matchType } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const options = {
      includeSynonyms: includeSynonyms === 'true',
      includeDerivatives: includeDerivatives === 'true',
      matchType: (matchType as 'exact' | 'startsWith' | 'contains') || 'contains'
    };
    
    const results = await controller.search(query, options);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get entry by ID
router.get('/entry/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await controller.getEntryById(id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get entry by word
router.get('/word/:word', async (req: Request, res: Response) => {
  try {
    const { word } = req.params;
    const entry = await controller.getEntryByWord(word);
    
    if (!entry) {
      return res.status(404).json({ error: 'Word not found' });
    }
    
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get entries by root
router.get('/root/:root', async (req: Request, res: Response) => {
  try {
    const { root } = req.params;
    const entries = await controller.getEntriesByRoot(root);
    
    if (entries.length === 0) {
      return res.status(404).json({ error: 'No entries found for this root' });
    }
    
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get entries by semantic field
router.get('/semantic-field/:field', async (req: Request, res: Response) => {
  try {
    const { field } = req.params;
    const entries = await controller.getEntriesBySemanticField(field);
    
    if (entries.length === 0) {
      return res.status(404).json({ error: 'No entries found for this semantic field' });
    }
    
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all semantic fields
router.get('/semantic-fields', async (req: Request, res: Response) => {
  try {
    const fields = await controller.getSemanticFields();
    res.status(200).json(fields);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all roots
router.get('/roots', async (req: Request, res: Response) => {
  try {
    const roots = await controller.getRoots();
    res.status(200).json(roots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new entry
router.post('/entry', async (req: Request, res: Response) => {
  try {
    const entry = req.body;
    
    if (!entry.word || !entry.definitions || !Array.isArray(entry.definitions)) {
      return res.status(400).json({ 
        error: 'Invalid entry format. Word and definitions array are required.' 
      });
    }
    
    const newEntry = await controller.addEntry(entry);
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Expand lexicon with ML generated entries
router.post('/expand', async (req: Request, res: Response) => {
  try {
    const { sourceText, count } = req.body;
    
    if (!sourceText || typeof sourceText !== 'string') {
      return res.status(400).json({ error: 'Source text is required' });
    }
    
    const entriesCount = count && !isNaN(parseInt(count)) ? parseInt(count) : 10;
    
    const newEntries = await controller.expandLexiconWithML(sourceText, entriesCount);
    res.status(200).json({ 
      message: `Added ${newEntries.length} new entries to lexicon`,
      entries: newEntries
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export lexicon to file
router.post('/export', async (req: Request, res: Response) => {
  try {
    const filePath = await controller.exportLexicon();
    res.status(200).json({ 
      message: `Lexicon exported successfully`,
      filePath
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const lexiconRoutes = router;