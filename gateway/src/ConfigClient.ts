import axios, { AxiosInstance } from 'axios';

export interface ConfigValue {
    [key: string]: string | number | boolean | undefined;
}

export class ConfigClient {
    private static instances: Map<string, ConfigClient> = new Map();
    private axiosInstance: AxiosInstance;
    private configUrl: string;
    private cachedConfig: Map<string, ConfigValue> = new Map();
    private cacheTimeout: number;

    private constructor(configServiceUrl: string, cacheTimeout: number = 300000) {
        this.configUrl = configServiceUrl;
        this.cacheTimeout = cacheTimeout;
        this.axiosInstance = axios.create({
            baseURL: configServiceUrl,
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    public static getInstance(configServiceUrl?: string, cacheTimeout?: number): ConfigClient {
        const url = configServiceUrl || process.env.CONFIG_SERVICE_URL || 'http://config-service:4000';
        const cache = cacheTimeout || parseInt(process.env.CONFIG_CACHE_TIMEOUT || '300000', 10);
        
        if (!ConfigClient.instances.has(url)) {
            ConfigClient.instances.set(url, new ConfigClient(url, cache));
        }
        return ConfigClient.instances.get(url)!;
    }

    public async getServiceConfig(service: string): Promise<ConfigValue> {
        // Check cache first
        if (this.cachedConfig.has(service)) {
            return this.cachedConfig.get(service)!;
        }

        try {
            const response = await this.axiosInstance.get(`/config/${service}`);
            const config = response.data;
            
            // Cache the configuration
            this.cachedConfig.set(service, config);
            
            // Invalidate cache after timeout
            setTimeout(() => {
                this.cachedConfig.delete(service);
            }, this.cacheTimeout);

            return config;
        } catch (error) {
            console.error(`Failed to fetch configuration for ${service}:`, error);
            throw new Error(`Configuration service unavailable for ${service}`);
        }
    }

    public async getValue(service: string, key: string): Promise<string | number | boolean | undefined> {
        try {
            const config = await this.getServiceConfig(service);
            return config[key];
        } catch (error) {
            console.error(`Failed to fetch configuration ${service}.${key}:`, error);
            throw error;
        }
    }

    public async healthCheck(): Promise<boolean> {
        try {
            const response = await this.axiosInstance.get('/health');
            return response.status === 200;
        } catch (error) {
            console.error('Configuration service health check failed:', error);
            return false;
        }
    }

    public clearCache(): void {
        this.cachedConfig.clear();
    }

    public clearServiceCache(service: string): void {
        this.cachedConfig.delete(service);
    }
}

