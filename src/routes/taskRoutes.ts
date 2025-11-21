import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';


const router = Router();
const taskController = new TaskController();

// POST /api/tasks - Crear tarea
router.post('/tasks', (req, res) => taskController.createTask(req, res));

// GET /api/users/:id/tasks - Listar tareas de un usuario
router.get('/users/:id/tasks', (req, res) => taskController.getTasksByUserId(req, res));

// PUT /api/tasks/:id - Actualizar estado de tarea
router.put('/tasks/:id', (req, res) => taskController.updateTaskStatus(req, res));

// PATCH /api/tasks/:id/complete - Marcar tarea como completada
router.patch('/tasks/:id/complete', (req, res) => taskController.markTaskAsCompleted(req, res));

// DELETE /api/tasks/:id - Eliminar tarea
router.delete('/tasks/:id', (req, res) => taskController.deleteTask(req, res));

export default router;
