export interface ConfigSection {
    [key: string]: string | number | boolean | undefined;
}

export interface ServiceConfig {
    database?: ConfigSection;
    redis?: ConfigSection;
    gateway?: ConfigSection;
    app?: ConfigSection;
    jwt?: ConfigSection;
}

export class ConfigStore {
    private static instance: ConfigStore;
    private config: ServiceConfig;

    private constructor() {
        this.config = {
            database: {
                host: process.env.DB_HOST || 'mysql',
                user: process.env.DB_USER || 'appuser',
                password: process.env.DB_PASSWORD || 'apppassword',
                name: process.env.DB_NAME || 'ecommerce_db',
                port: parseInt(process.env.DB_PORT || '3306', 10),
                connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
                connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '60000', 10)
            },
            redis: {
                url: process.env.REDIS_URL || 'redis://redis:6379'
            },
            gateway: {
                port: parseInt(process.env.GATEWAY_PORT || '8080', 10),
                backendService1: process.env.BACKEND_SERVICE_1 || 'http://app1:3000',
                backendService2: process.env.BACKEND_SERVICE_2 || 'http://app2:3000',
                backendService3: process.env.BACKEND_SERVICE_3 || 'http://app3:3000'
            },
            app: {
                port: parseInt(process.env.APP_PORT || '3000', 10),
                nodeEnv: process.env.NODE_ENV || 'production'
            },
            jwt: {
                secret: process.env.JWT_SECRET || 'super-secret-de-iara',
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            }
        };
    }

    public static getInstance(): ConfigStore {
        if (!ConfigStore.instance) {
            ConfigStore.instance = new ConfigStore();
        }
        return ConfigStore.instance;
    }

    public getServiceConfig(service: keyof ServiceConfig): ConfigSection | undefined {
        return this.config[service];
    }

    public getValue(service: keyof ServiceConfig, key: string): string | number | boolean | undefined {
        const serviceConfig = this.config[service];
        return serviceConfig ? serviceConfig[key] : undefined;
    }

    public getAllConfigs(): ServiceConfig {
        return this.config;
    }

    public updateConfig(service: keyof ServiceConfig, updates: ConfigSection): void {
        if (this.config[service]) {
            this.config[service] = { ...this.config[service], ...updates };
        } else {
            this.config[service] = updates;
        }
    }
}

