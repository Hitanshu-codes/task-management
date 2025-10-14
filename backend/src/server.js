import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger documentation
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Task Management API',
        version: '0.1.0',
        description: 'A simple task management API with authentication and file uploads'
    },
    servers: [
        { url: 'http://localhost:5000', description: 'Development server' }
    ],
    paths: {
        '/api/health': {
            get: {
                summary: 'Health check',
                responses: { '200': { description: 'OK' } }
            }
        },
        '/api/auth/register': {
            post: {
                summary: 'Register new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 6 }
                                },
                                required: ['email', 'password']
                            }
                        }
                    }
                }
            }
        },
        '/api/auth/login': {
            post: {
                summary: 'Login user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string' }
                                },
                                required: ['email', 'password']
                            }
                        }
                    }
                }
            }
        }
    }
};

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
    console.log(`API Documentation: http://localhost:${port}/api/docs`);
});