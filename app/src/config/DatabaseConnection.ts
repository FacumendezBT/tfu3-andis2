import { config as loadEnv } from 'dotenv';
import mysql from 'mysql2/promise';
import type { PoolOptions } from 'mysql2/promise';
import { ConfigClient } from './ConfigClient';

loadEnv();

export type DatabaseConfig = PoolOptions & {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
};

export class DatabaseConnection {
    private static instance: DatabaseConnection;
    private pool: mysql.Pool;
    private config: DatabaseConfig;

    private constructor() {
        this.config = {
            host: process.env.DB_HOST || 'mysql',
            user: process.env.DB_USER || 'appuser',
            password: process.env.DB_PASSWORD || 'apppassword',
            database: process.env.DB_NAME || 'ecommerce_db',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT ?? '10', 10),
            waitForConnections: true,
            queueLimit: 0,
            connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT ?? '60000', 10)
        };

        this.pool = mysql.createPool(this.config);
    }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    public getPool(): mysql.Pool {
        return this.pool;
    }

    public async getConnection(): Promise<mysql.PoolConnection> {
        try {
            const connection = await this.pool.getConnection();
            return connection;
        } catch (error) {
            console.error('Error getting database connection:', error);
            throw error;
        }
    }

    public async query(sql: string, values?: any[]): Promise<any> {
        try {
            const [rows] = await this.pool.execute(sql, values);
            return rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    public async execute(sql: string, values?: any[]): Promise<mysql.ResultSetHeader> {
        try {
            const [result] = await this.pool.execute(sql, values);
            return result as mysql.ResultSetHeader;
        } catch (error) {
            console.error('Database execute error:', error);
            throw error;
        }
    }

    public async beginTransaction(): Promise<mysql.PoolConnection> {
        const connection = await this.getConnection();
        await connection.beginTransaction();
        return connection;
    }

    public async commitTransaction(connection: mysql.PoolConnection): Promise<void> {
        try {
            await connection.commit();
            connection.release();
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    }

    public async rollbackTransaction(connection: mysql.PoolConnection): Promise<void> {
        try {
            await connection.rollback();
            connection.release();
        } catch (error) {
            connection.release();
            throw error;
        }
    }

    public async testConnection(): Promise<boolean> {
        try {
            const connection = await this.getConnection();
            await connection.ping();
            connection.release();
            return true;
        } catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }

    public async close(): Promise<void> {
        try {
            await this.pool.end();
        } catch (error) {
            console.error('Error closing database pool:', error);
            throw error;
        }
    }

    public getConfig(): DatabaseConfig {
        return { ...this.config };
    }

    public async initializeFromConfigService(): Promise<void> {
        try {
            const configClient = ConfigClient.getInstance();
            const dbConfig = await configClient.getServiceConfig('database');
            
            if (dbConfig) {
                console.log('Successfully loaded database config from config service');
                
                // Close existing pool before creating a new one
                if (this.pool) {
                    await this.pool.end();
                }

                this.config = {
                    host: dbConfig.host as string || this.config.host,
                    user: dbConfig.user as string || this.config.user,
                    password: dbConfig.password as string || this.config.password,
                    database: dbConfig.name as string || this.config.database,
                    port: dbConfig.port as number || this.config.port,
                    connectionLimit: dbConfig.connectionLimit as number || this.config.connectionLimit,
                    waitForConnections: true,
                    queueLimit: 0,
                    connectTimeout: dbConfig.connectTimeout as number || this.config.connectTimeout
                };

                this.pool = mysql.createPool(this.config);
                console.log('Database connection pool reinitialized with config service settings');
            }
        } catch (error) {
            console.warn('Failed to load config from config service, using default values:', error);
        }
    }
}