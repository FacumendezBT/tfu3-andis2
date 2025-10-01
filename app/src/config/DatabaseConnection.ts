import { config as loadEnv } from 'dotenv';
import mysql from 'mysql2/promise';
import type { PoolOptions } from 'mysql2/promise';

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
            host: this.getEnv('DB_HOST'),
            user: this.getEnv('DB_USER'),
            password: this.getEnv('DB_PASSWORD'),
            database: this.getEnv('DB_NAME'),
            port: parseInt(this.getEnv('DB_PORT'), 10),
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

    private getEnv(key: string): string {
        const value = process.env[key];
        if (!value) {
            throw new Error(`Environment variable ${key} is not defined`);
        }
        return value;
    }
}