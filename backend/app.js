import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import courseRoutes from './routes/course.js';
import topicRoutes from './routes/topic.js';
import enrollmentRoutes from './routes/enrollment.js';
import userRoutes from './routes/user.js';
import { adminAuth } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Body parser middleware to read JSON in request bodies
app.use(express.json());

// 2. CORS middleware with x-admin-key allowed
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-admin-key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 3. Serve static uploaded files (PDFs, images)
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsPath));

// 4. Protect API write operations with Admin Auth
app.use('/api', adminAuth);

// 5. Mount API routes
app.use('/api/topics', topicRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/users', userRoutes);

// 6. API Health Check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Pioneer API'
  });
});

// 7. Serve Production Frontend (if built in ../user/dist)
const frontendDistPath = path.join(__dirname, '../user/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  // SPA fallback for non-API client routes
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      const indexPath = path.join(frontendDistPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    }
    next();
  });
} else {
  // If frontend not yet built, show informative root endpoint
  app.get('/', (req, res) => {
    res.json({
      status: 'online',
      message: 'Pioneer Backend API is running.',
      note: 'Frontend dist not found. Run "npm run build" in the user directory to serve the frontend here.'
    });
  });
}

export default app;
