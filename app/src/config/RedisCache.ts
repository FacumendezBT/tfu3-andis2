import { createClient, RedisClientType } from "redis";

export class RedisCache {
    private client: RedisClientType;
    private static instance: RedisCache;

    private constructor() {
        const url = process.env.REDIS_URL || "redis://redis:6379"
        this.client = createClient({ url });
        this.client.on("error", (err) => console.error("Redis Client Error", err));
    }

    async connect(): Promise<void> {
        if (!this.client.isOpen) {
            await this.client.connect();
            console.log("Connected to Redis");
        }
    }

    static getInstance(): RedisCache {
        if (!this.instance) {
            const inst = new RedisCache();
            this.instance = inst;
        }
        return this.instance;
    }

    async get<T>(key: string): Promise<T | null> {
        const data = await this.client.get(key);
        return data ? (JSON.parse(data) as T) : null;
    }

    async set<T>(key: string, value: T, lifetime = 3600): Promise<void> {
        await this.client.setEx(key, lifetime, JSON.stringify(value));
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async enqueue<T>(queueName: string, data: T): Promise<void> {
        await this.client.rPush(queueName, JSON.stringify(data));
    }

    async dequeueBlocking<T>(queueName: string, timeout = 0): Promise<T | null> {
        const result = await this.client.blPop(queueName, timeout);
        if (!result) return null;
        return JSON.parse(result.element) as T;
    }
}

