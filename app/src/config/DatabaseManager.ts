import { DatabaseConnection } from './DatabaseConnection';

export class DatabaseManager {
    private static instance: DatabaseManager;
    private dbConnection: DatabaseConnection;

    private constructor() {
        this.dbConnection = DatabaseConnection.getInstance();
    }

    // Es un Singleton para manejar la conexión a la base de datos
    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    
    public async initialize(): Promise<void> {
        try {
            console.log('Initializing database connection...');
            
            const isConnected = await this.dbConnection.testConnection();
            if (!isConnected) {
                throw new Error('Failed to establish database connection');
            }
            
            console.log('Database connection established successfully');
            console.log('Database configuration:', {
                ...this.dbConnection.getConfig(),
                password: '***'
            });
        } catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }
    }

    public async close(): Promise<void> {
        try {
            await this.dbConnection.close();
            console.log('Database connection closed');
        } catch (error) {
            console.error('Error closing database connection:', error);
            throw error;
        }
    }

    public getConnection(): DatabaseConnection {
        return this.dbConnection;
    }
}