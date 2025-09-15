// Entry point for our entire application 

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import bodyParser from "body-parser";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import errorHandler from './middleware/errorHandler';


/* CONFIGURATIONS - setup files*/ 
// Load environment variables
dotenv.config();
const app = express();

// Trust proxy (needed if behind nginx/Heroku for secure cookies)
app.set('trust proxy', 1);

// Basic middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(limiter);


// Health check
app.get("/", (req, res) => {
  res.send("This is home route");  // test for whether our home route works
});

// API Routes
// where our routes will be created
app.use('/api/auth', authRoutes);

// After routes:
app.use(errorHandler);


// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* SERVER */
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});