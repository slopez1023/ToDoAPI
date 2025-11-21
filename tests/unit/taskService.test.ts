import 'reflect-metadata';
import { AppDataSource } from '../../src/config/database';
import { TaskService } from '../../src/services/TaskService';
import { UserService } from '../../src/services/UserService';
import { User } from '../../src/models/User';
import { Task } from '../../src/models/Task';

/**
 * Pruebas Unitarias - TaskService
 * 
 * Test 2: No se puede crear tarea sin user_id
 * Test 3: is_completed se actualiza correctamente
 * Test 4: Se puede eliminar una tarea
 */
describe('TaskService - Unit Tests', () => {
  let taskService: TaskService;
  let userService: UserService;
  let testUser: User;

  beforeAll(async () => {
    // Inicializar base de datos de prueba
    await AppDataSource.initialize();
    taskService = new TaskService();
    userService = new UserService();
  });

  afterAll(async () => {
    // Limpiar base de datos
    await AppDataSource.query('TRUNCATE TABLE tasks, users RESTART IDENTITY CASCADE');
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    // Limpiar y crear usuario de prueba
    await AppDataSource.query('TRUNCATE TABLE tasks, users RESTART IDENTITY CASCADE');
    
    testUser = await userService.createUser('Test User', 'test@example.com');
  });

  /**
   * TEST 2: No se puede crear tarea sin user_id
   * Validación de la lógica de negocio
   */
  test('should not allow creating a task without user_id', async () => {
    await expect(
      taskService.createTask('Test Task', 'Description', null as any)
    ).rejects.toThrow('USER_ID_REQUIRED');
  });

  /**
   * TEST ADICIONAL: No se puede crear tarea con user_id inválido
   */
  test('should not allow creating a task with non-existent user_id', async () => {
    await expect(
      taskService.createTask('Test Task', 'Description', 99999)
    ).rejects.toThrow('USER_NOT_FOUND');
  });

  /**
   * TEST 3: is_completed se actualiza correctamente
   * Validación de actualización de estado
   */
  test('should update is_completed correctly', async () => {
    // Crear tarea
    const task = await taskService.createTask(
      'Task to Update',
      'Description',
      testUser.id
    );
    
    expect(task.is_completed).toBe(false);

    // Actualizar a completada
    const updatedTask = await taskService.updateTaskStatus(task.id, true);
    expect(updatedTask).toBeDefined();
    expect(updatedTask!.is_completed).toBe(true);

    // Actualizar a no completada
    const revertedTask = await taskService.updateTaskStatus(task.id, false);
    expect(revertedTask).toBeDefined();
    expect(revertedTask!.is_completed).toBe(false);
  });

  /**
   * TEST 4: Se puede eliminar una tarea
   * Validación de eliminación
   */
  test('should be able to delete a task', async () => {
    // Crear tarea
    const task = await taskService.createTask(
      'Task to Delete',
      'Description',
      testUser.id
    );
    
    expect(task).toBeDefined();
    const taskId = task.id;

    // Eliminar tarea
    const deleted = await taskService.deleteTask(taskId);
    expect(deleted).toBe(true);

    // Verificar que no existe
    const deletedTask = await taskService.getTaskById(taskId);
    expect(deletedTask).toBeNull();
  });

  /**
   * TEST ADICIONAL: Intentar eliminar tarea inexistente
   */
  test('should return false when deleting non-existent task', async () => {
    const deleted = await taskService.deleteTask(99999);
    expect(deleted).toBe(false);
  });
});
