import { Request, Response, NextFunction } from 'express';
import { CircuitBreaker } from './CircuitBreaker';
import { Retry } from './Retry';
import { HealthMonitor } from './HealthMonitor';
import axios, { AxiosError } from 'axios';

export class Gateway {
    private circuitBreakers: Map<string, CircuitBreaker>;
    private retry: Retry;
    private healthMonitor: HealthMonitor;
    private backendServices: string[];

    constructor(backendServices: string[]) {
        this.backendServices = backendServices;
        this.circuitBreakers = new Map();
        this.retry = new Retry({
            maxAttempts: 3,
            initialDelay: 1000,
            maxDelay: 5000,
            backoffMultiplier: 2
        });
        this.healthMonitor = new HealthMonitor(backendServices);
    }

    getCircuitBreaker(key: string): CircuitBreaker {
        if (!this.circuitBreakers.has(key)) {
            this.circuitBreakers.set(key, new CircuitBreaker({
                failureThreshold: 5,
                resetTimeout: 60000
            }));
        }
        return this.circuitBreakers.get(key)!;
    }

    async healthCheck(_req: Request, res: Response): Promise<void> {
        try {
            const health = await this.healthMonitor.checkHealth();
            const statusCode = health.status === 'healthy' ? 200 : 
                             health.status === 'degraded' ? 200 : 503;
            res.status(statusCode).json(health);
        } catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    createProxyConFallback(path: string, serviceKey: string) {
        const circuitBreaker = this.getCircuitBreaker(serviceKey);

        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            let lastError: Error | null = null;
            let triedServices = 0;

            for (const serviceUrl of this.backendServices) {
                const circuitState = circuitBreaker.getState();
                if (circuitState === 'OPEN' && triedServices === 0) {
                    lastError = new Error('Circuit breaker is OPEN');
                    break;
                }

                try {
                    await circuitBreaker.execute(async () => {
                        await this.retry.execute(async () => {
                            const targetUrl = `${serviceUrl}${req.originalUrl}`;

                            try {
                                const response = await axios({
                                    method: req.method as any,
                                    url: targetUrl,
                                    data: req.body,
                                    headers: {
                                        ...req.headers,
                                        host: undefined
                                    },
                                    timeout: 10000,
                                    validateStatus: (status) => status < 500
                                });

                                res.status(response.status).json(response.data);
                                triedServices = this.backendServices.length;
                            } catch (error) {
                                if (axios.isAxiosError(error)) {
                                    const axiosError = error as AxiosError;
                                    if (axiosError.response && axiosError.response.status < 500) {
                                        res.status(axiosError.response.status).json(axiosError.response.data);
                                        triedServices = this.backendServices.length;
                                    } else {
                                        throw new Error(`Service ${serviceUrl} unavailable`);
                                    }
                                } else {
                                    throw error;
                                }
                            }
                        }, (attempt, error) => {
                            console.log(`Retry attempt ${attempt} for ${serviceUrl}${req.path}: ${error.message}`);
                        });
                    });

                    break;
                } catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));
                    triedServices++;
                    continue;
                }
            }

            if (triedServices === this.backendServices.length && res.headersSent === false) {
                if (lastError instanceof Error && lastError.message === 'Circuit breaker is OPEN') {
                    res.status(503).json({
                        error: 'Service temporarily unavailable, que momento',
                        circuitState: 'OPEN'
                    });
                } else {
                    res.status(503).json({
                        error: 'All backend services unavailable, está todo caídoo',
                        message: lastError?.message || 'Unknown error'
                    });
                }
            }
        };
    }
}

