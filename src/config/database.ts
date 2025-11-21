import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Task } from '../models/Task';
import * as dotenv from 'dotenv';

dotenv.config();


export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_DATABASE || 'todo_api_db',
  synchronize: true, // Auto-crear tablas (solo para desarrollo)
  logging: false,
  entities: [User, Task],
  subscribers: [],
  migrations: [],
});

/**
 * Inicializar conexión a la base de datos
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log(' Database connected successfully');
    console.log(` Database: ${process.env.DB_DATABASE}`);
  } catch (error) {
    console.error(' Error connecting to database:', error);
    throw error;
  }
};
