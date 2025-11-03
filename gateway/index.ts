import express, { NextFunction, Request, Response } from 'express';
import type { Server } from 'http';
import { Gateway } from './src/Gateway';

const app = express();
const port = Number(process.env.PORT ?? 8080);

const backendServices = [
    process.env.BACKEND_SERVICE_1 || 'http://app1:3000',
    process.env.BACKEND_SERVICE_2 || 'http://app2:3000',
    process.env.BACKEND_SERVICE_3 || 'http://app3:3000'
];

const gateway = new Gateway(backendServices);
let server: Server | undefined;

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
    res.status(200).json({ 
        message: 'TFU3 ANDIS2 API Gateway',
        backendServices: backendServices
    });
});

app.get('/health', (req, res) => {
    gateway.healthCheck(req, res);
});

app.use('/api/customers', gateway.createProxyConFallback('/api/customers', 'customers'));
app.use('/api/orders', gateway.createProxyConFallback('/api/orders', 'orders'));
app.use('/api/products', gateway.createProxyConFallback('/api/products', 'products'));

app.use((req, res) => {
    res.status(404).json({ message: `Endpoint ${req.method} ${req.originalUrl} not found` });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ message: 'Internal server error' });
});

const startServer = async (): Promise<void> => {
    try {
        server = app.listen(port, '0.0.0.0', () => {
            console.log(`Gateway is running on port ${port}`);
            console.log(`Backend services: ${backendServices.join(', ')}`);
        });
    } catch (error) {
        console.error('Failed to start gateway:', error);
        process.exit(1);
    }
};

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    console.log(`Received ${signal}. Shutting down gracefully...`);

    try {
        if (server) {
            await new Promise<void>((resolve, reject) => {
                server?.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }

        console.log('Shutdown completed. Goodbye!');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGINT', () => {
    void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    void shutdown('SIGTERM');
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
    void shutdown('SIGTERM');
});

void startServer();

