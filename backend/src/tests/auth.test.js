import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
    test('POST /api/auth/register - should register a new user', async () => {
        const userData = {
            email: 'test@example.com',
            password: 'password123'
        };

        const response = await request(app)
            .post('/api/auth/register')
            .send(userData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
    });

    test('POST /api/auth/register - should reject invalid email', async () => {
        const userData = {
            email: 'invalid-email',
            password: 'password123'
        };

        const response = await request(app)
            .post('/api/auth/register')
            .send(userData);

        expect(response.status).toBe(400);
    });
});