// Entry point for our entire application 

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import bodyParser from "body-parser";
import helmet from "helmet";
import morgan from "morgan";


/* ROUTE IMPORT */  
//  route imports to be added here
console.log("Loading authRoutes...");
import authRoutes from './routes/authRoutes';
console.log("authRoutes loaded.");


/* CONFIGURATIONS - setup files*/ 
// Load environment variables
dotenv.config();
const app = express();

// Basic middleware
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());


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