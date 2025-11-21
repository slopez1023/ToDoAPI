import 'reflect-metadata';
import express, { Application } from 'express';
import { initializeDatabase } from './config/database';
import routes from './routes';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Aplicación principal - Express Server
 */
const app: Application = express();
const PORT = process.env.PORT || 4000;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use(routes);

/**
 * Iniciar servidor
 */
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await initializeDatabase();

    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Solo iniciar el servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
