import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Simple Swagger stub
const swaggerDocument = {
    openapi: '3.0.0',
    info: { title: 'Task Management API', version: '0.1.0' },
    paths: {
        '/api/health': {
            get: {
                summary: 'Health check',
                responses: { '200': { description: 'OK' } }
            }
        }
    }
};
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${port}`);
});
