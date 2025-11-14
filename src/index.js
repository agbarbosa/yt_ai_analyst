import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import channelRoutes from './routes/channel.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Routes
app.use('/api/channel', channelRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'YouTube AI Analyst API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Web UI: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/channel/videos`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
