import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
// import http from 'http'; 
import { createServer } from 'http';
import {Server} from 'socket.io';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth'
import postRoutes from './routes/posts'
import commentRoutes from './routes/comments';
import reportRoutes from './routes/reports';
import userRoutes from './routes/users';


const app = express()
const prisma = new PrismaClient();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true, 
  }
});

// Socket.IO connection listener
io.on('connection', (socket) => {
  console.log(`🟢 New client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});

export { io };



// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true, 
}));app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.send('🟢 Backend is running!');
});



// Start both Express and WebSocket server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});