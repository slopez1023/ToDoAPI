import { AppDataSource } from '../config/database';
import { Task } from '../models/Task';
import { UserService } from './UserService';


export class TaskService {
  private taskRepository = AppDataSource.getRepository(Task);
  private userService = new UserService();

  /**
   * Crear una nueva tarea
   * Validación 2 y 3: user_id válido y usuario existente
   */
  async createTask(title: string, description: string | undefined, user_id: number): Promise<Task> {
    // VALIDACIÓN 2: user_id requerido
    if (!user_id) {
      throw new Error('USER_ID_REQUIRED');
    }

    // VALIDACIÓN 3: Usuario debe existir
    const userExists = await this.userService.userExists(user_id);
    if (!userExists) {
      throw new Error('USER_NOT_FOUND');
    }

    const task = this.taskRepository.create({
      title,
      description,
      user_id,
      is_completed: false,
    });

    return await this.taskRepository.save(task);
  }

  /**
   * Obtener todas las tareas de un usuario
   */
  async getTasksByUserId(user_id: number): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { user_id },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Obtener tarea por ID
   */
  async getTaskById(id: number): Promise<Task | null> {
    return await this.taskRepository.findOne({ where: { id } });
  }

  /**
   * Actualizar el estado de una tarea
   * VALIDACIÓN 4: Solo permitir actualizar is_completed
   */
  async updateTaskStatus(id: number, is_completed: boolean): Promise<Task | null> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      return null;
    }

    // VALIDACIÓN 4: Actualización controlada - solo is_completed
    task.is_completed = is_completed;
    return await this.taskRepository.save(task);
  }

  /**
   * Marcar tarea como completada
   */
  async markAsCompleted(id: number): Promise<Task | null> {
    return await this.updateTaskStatus(id, true);
  }

  /**
   * Eliminar una tarea
   */
  async deleteTask(id: number): Promise<boolean> {
    const result = await this.taskRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
