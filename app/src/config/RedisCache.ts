import { createClient, RedisClientType } from "redis";
import { ConfigClient } from "./ConfigClient";

export class RedisCache {
    private client: RedisClientType;
    private static instance: RedisCache;

    private constructor() {
        const url = process.env.REDIS_URL || "redis://redis:6379"
        this.client = createClient({ url });
        this.client.on("error", (err) => console.error("Redis Client Error", err));
    }

    public async initializeFromConfigService(): Promise<void> {
        try {
            const configClient = ConfigClient.getInstance();
            const redisConfig = await configClient.getServiceConfig('redis');
            
            if (redisConfig && redisConfig.url) {
                console.log('Successfully loaded Redis config from config service');
                
                if (this.client && this.client.isOpen) {
                    await this.client.quit();
                }

                this.client = createClient({ url: redisConfig.url as string });
                this.client.on("error", (err) => console.error("Redis Client Error", err));
                
                console.log('Redis client reinitialized with config service settings');
            }
        } catch (error) {
            console.warn('Failed to load Redis config from config service, using default values:', error);
        }
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
}

