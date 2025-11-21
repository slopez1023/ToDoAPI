import { Router } from 'express';
import userRoutes from './userRoutes';
import taskRoutes from './taskRoutes';


const router = Router();

// Montar rutas de usuarios y tareas
router.use('/api', userRoutes);
router.use('/api', taskRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

export default router;
