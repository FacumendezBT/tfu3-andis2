export enum CircuitState {
    CLOSED = 'CLOSED',
    OPEN = 'OPEN',
    HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerOptions {
    failureThreshold?: number;
    resetTimeout?: number;
    monitoringPeriod?: number;
}

export class CircuitBreaker {
    private state: CircuitState;
    private failureCount: number;
    private successCount: number;
    private lastFailureTime: number | null;
    private failureThreshold: number;
    private resetTimeout: number;
    private monitoringPeriod: number;

    constructor(options: CircuitBreakerOptions = {}) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        this.failureThreshold = options.failureThreshold ?? 5;
        this.resetTimeout = options.resetTimeout ?? 60000;
        this.monitoringPeriod = options.monitoringPeriod ?? 60000;
    }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            if (this.shouldAttemptReset()) {
                this.state = CircuitState.HALF_OPEN;
                this.successCount = 0;
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess(): void {
        this.failureCount = 0;

        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= 2) {
                this.state = CircuitState.CLOSED;
                this.successCount = 0;
            }
        }
    }

    private onFailure(): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.failureThreshold) {
            this.state = CircuitState.OPEN;
        }
    }

    private shouldAttemptReset(): boolean {
        if (!this.lastFailureTime) {
            return true;
        }
        return Date.now() - this.lastFailureTime >= this.resetTimeout;
    }

    getState(): CircuitState {
        return this.state;
    }
    
    reset(): void {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
    }
}

