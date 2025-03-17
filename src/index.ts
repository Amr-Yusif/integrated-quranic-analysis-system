import express from 'express';
import { setupRoutes } from './api/routes';
import { connectDatabase } from './utils/database';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
setupRoutes(app);

// Start server
async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;