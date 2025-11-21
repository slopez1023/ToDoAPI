import { Request, Response } from 'express';
import { TaskService } from '../services/TaskService';

/**
 * TaskController - Manejo de peticiones HTTP para tareas
 * Endpoints:
 * - POST /api/tasks - Crear tarea
 * - GET /api/users/:id/tasks - Listar tareas de un usuario
 * - PUT /api/tasks/:id - Actualizar estado de tarea
 * - PATCH /api/tasks/:id/complete - Marcar tarea como completada
 * - DELETE /api/tasks/:id - Eliminar tarea
 */
export class TaskController {
  private taskService = new TaskService();

  /**
   * POST /api/tasks
   * Crear una nueva tarea asociada a un usuario
   */
  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, user_id } = req.body;

      // Validar campos requeridos
      if (!title || !user_id) {
        res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Title and user_id are required',
        });
        return;
      }

      const task = await this.taskService.createTask(title, description, user_id);

      res.status(201).json({
        message: 'Task created successfully',
        data: task,
      });
    } catch (error: any) {
      if (error.message === 'USER_ID_REQUIRED') {
        res.status(400).json({
          error: 'USER_ID_REQUIRED',
          message: 'user_id is required to create a task',
        });
        return;
      }

      if (error.message === 'USER_NOT_FOUND') {
        res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'The specified user does not exist',
        });
        return;
      }

      console.error('Error creating task:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create task',
      });
    }
  }

  /**
   * GET /api/users/:id/tasks
   * Obtener todas las tareas de un usuario
   */
  async getTasksByUserId(req: Request, res: Response): Promise<void> {
    try {
      const user_id = parseInt(req.params.id);

      if (isNaN(user_id)) {
        res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Invalid user ID',
        });
        return;
      }

      const tasks = await this.taskService.getTasksByUserId(user_id);

      res.status(200).json({
        message: 'Tasks retrieved successfully',
        data: tasks,
      });
    } catch (error) {
      console.error('Error getting tasks:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve tasks',
      });
    }
  }

  /**
   * PUT /api/tasks/:id
   * Actualizar estado de una tarea (is_completed)
   */
  async updateTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { is_completed } = req.body;

      if (isNaN(id)) {
        res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Invalid task ID',
        });
        return;
      }

      if (typeof is_completed !== 'boolean') {
        res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'is_completed must be a boolean',
        });
        return;
      }

      const task = await this.taskService.updateTaskStatus(id, is_completed);

      if (!task) {
        res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update task',
      });
    }
  }

  /**
   * PATCH /api/tasks/:id/complete
   * Marcar tarea como completada
   */
  async markTaskAsCompleted(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Invalid task ID',
        });
        return;
      }

      const task = await this.taskService.markAsCompleted(id);

      if (!task) {
        res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        message: 'Task marked as completed',
        data: task,
      });
    } catch (error) {
      console.error('Error marking task as completed:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to mark task as completed',
      });
    }
  }

  /**
   * DELETE /api/tasks/:id
   * Eliminar una tarea
   */
  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Invalid task ID',
        });
        return;
      }

      const deleted = await this.taskService.deleteTask(id);

      if (!deleted) {
        res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        message: 'Task deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete task',
      });
    }
  }
}
