#!/usr/bin/env node
import { program } from 'commander';
import { LexiconExpansionService } from '../services/lexicon-expansion.service';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import logger from '../utils/logger';

const readFile = promisify(fs.readFile);

// Initialize the lexicon expansion service
const lexiconService = new LexiconExpansionService();

program
  .name('lexicon-expander')
  .description('CLI for expanding the lexicon with ML-generated entries')
  .version('0.1.0');

/**
 * Command to expand lexicon from a text file
 */
program
  .command('expand')
  .description('Expand lexicon with new entries from a text file')
  .requiredOption('-f, --file <path>', 'Path to text file containing Arabic text')
  .option('-c, --count <number>', 'Number of entries to generate', '10')
  .option('-m, --min-confidence <number>', 'Minimum confidence threshold', '0.6')
  .action(async (options) => {
    try {
      // Validate file path
      if (!fs.existsSync(options.file)) {
        logger.error(`File not found: ${options.file}`);
        process.exit(1);
      }
      
      // Read source text
      const sourceText = await readFile(options.file, 'utf8');
      logger.info(`Read ${sourceText.length} characters from ${options.file}`);
      
      // Expand lexicon
      const count = parseInt(options.count, 10);
      const minConfidence = parseFloat(options.minConfidence);
      
      logger.info(`Expanding lexicon with up to ${count} entries (min confidence: ${minConfidence})`);
      
      const newEntries = await lexiconService.expandLexicon({
        sourceText,
        count,
        minConfidence
      });
      
      logger.info(`Successfully added ${newEntries.length} new entries to lexicon`);
      
      // Print summary of new entries
      console.log('\nNew entries added:');
      newEntries.forEach(entry => {
        console.log(`- ${entry.word} (${entry.root || 'root unknown'}): ${entry.definitions[0]}`);
      });
      
    } catch (error) {
      logger.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Command to batch expand lexicon from multiple files
 */
program
  .command('batch-expand')
  .description('Expand lexicon from multiple text files')
  .requiredOption('-d, --dir <path>', 'Directory containing text files')
  .option('-c, --count-per-file <number>', 'Number of entries to generate per file', '5')
  .option('-p, --pattern <glob>', 'File pattern to match', '*.txt')
  .action(async (options) => {
    try {
      // Validate directory
      if (!fs.existsSync(options.dir)) {
        logger.error(`Directory not found: ${options.dir}`);
        process.exit(1);
      }
      
      // Get list of files matching pattern
      const glob = await import('glob');
      const files = await glob.glob(path.join(options.dir, options.pattern));
      
      if (files.length === 0) {
        logger.error(`No files matching pattern ${options.pattern} found in ${options.dir}`);
        process.exit(1);
      }
      
      logger.info(`Found ${files.length} files to process`);
      
      // Process each file
      const countPerFile = parseInt(options.countPerFile, 10);
      let totalAdded = 0;
      
      for (const file of files) {
        logger.info(`Processing ${file}...`);
        const sourceText = await readFile(file, 'utf8');
        
        const newEntries = await lexiconService.expandLexicon({
          sourceText,
          count: countPerFile
        });
        
        totalAdded += newEntries.length;
        logger.info(`Added ${newEntries.length} entries from ${file}`);
      }
      
      logger.info(`Batch expansion complete. Added ${totalAdded} new entries to lexicon`);
      
    } catch (error) {
      logger.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Command to enhance existing entries with ML
 */
program
  .command('enhance')
  .description('Enhance existing lexicon entries with additional linguistic features')
  .action(async () => {
    try {
      logger.info('Enhancing existing lexicon entries...');
      
      const enhancedCount = await lexiconService.enhanceExistingEntries();
      
      if (enhancedCount > 0) {
        logger.info(`Successfully enhanced ${enhancedCount} existing entries`);
      } else {
        logger.info('No entries needed enhancement');
      }
      
    } catch (error) {
      logger.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Command to extract words from a text file
 */
program
  .command('extract-words')
  .description('Extract Arabic words from a text file')
  .requiredOption('-f, --file <path>', 'Path to text file containing Arabic text')
  .option('-o, --output <path>', 'Output file for extracted words')
  .action(async (options) => {
    try {
      // Validate file path
      if (!fs.existsSync(options.file)) {
        logger.error(`File not found: ${options.file}`);
        process.exit(1);
      }
      
      // Read source text
      const sourceText = await readFile(options.file, 'utf8');
      logger.info(`Read ${sourceText.length} characters from ${options.file}`);
      
      // Create a new WordExpander just for extraction
      const { MLWordExpander } = await import('../core/ml/word_expander');
      const expander = new MLWordExpander();
      
      // Extract words
      const extractedWords = await expander.extractWords(sourceText);
      logger.info(`Extracted ${extractedWords.length} unique words`);
      
      // Output results
      if (options.output) {
        const writeFile = promisify(fs.writeFile);
        await writeFile(options.output, extractedWords.join('\n'), 'utf8');
        logger.info(`Words written to ${options.output}`);
      } else {
        // Print to console
        console.log('\nExtracted words:');
        extractedWords.forEach(word => console.log(word));
      }
      
    } catch (error) {
      logger.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.help();
}