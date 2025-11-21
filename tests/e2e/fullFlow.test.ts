import 'reflect-metadata';
import request from 'supertest';
import app from '../../src/index';
import { AppDataSource } from '../../src/config/database';
import { User } from '../../src/models/User';
import { Task } from '../../src/models/Task';

/**
 * Prueba End-to-End (E2E)
 * 
 * Flujo completo de 6 pasos:
 * 1. Crear usuario
 * 2. Crear 2 tareas para ese usuario
 * 3. Listar tareas del usuario
 * 4. Marcar una tarea como completada
 * 5. Eliminar una tarea
 * 6. Verificar que solo queda 1 tarea
 */
describe('E2E Test - Complete Task Management Flow', () => {
  let userId: number;
  let task1Id: number;
  let task2Id: number;

  beforeAll(async () => {
    // Inicializar base de datos si no está inicializada
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    // Limpiar base de datos
    if (AppDataSource.isInitialized) {
      await AppDataSource.query('TRUNCATE TABLE tasks, users RESTART IDENTITY CASCADE');
      await AppDataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Limpiar datos antes del test
    if (AppDataSource.isInitialized) {
      await AppDataSource.query('TRUNCATE TABLE tasks, users RESTART IDENTITY CASCADE');
    }
  });

  test('Complete E2E flow: Create user, manage tasks, and verify final state', async () => {
    // ============================================
    // PASO 1: Crear usuario
    // ============================================
    console.log('Step 1: Creating user...');
    const createUserResponse = await request(app)
      .post('/api/users')
      .send({
        name: 'E2E Test User',
        email: 'e2e@test.com',
      });

    expect(createUserResponse.status).toBe(201);
    expect(createUserResponse.body.data).toBeDefined();
    userId = createUserResponse.body.data.id;
    console.log(`User created with ID: ${userId}`);

    // ============================================
    // PASO 2: Crear 2 tareas para ese usuario
    // ============================================
    console.log('Step 2: Creating 2 tasks...');
    
    // Crear primera tarea
    const createTask1Response = await request(app)
      .post('/api/tasks')
      .send({
        title: 'E2E Task 1',
        description: 'First task for E2E testing',
        user_id: userId,
      });

    expect(createTask1Response.status).toBe(201);
    task1Id = createTask1Response.body.data.id;
    console.log(`Task 1 created with ID: ${task1Id}`);

    // Crear segunda tarea
    const createTask2Response = await request(app)
      .post('/api/tasks')
      .send({
        title: 'E2E Task 2',
        description: 'Second task for E2E testing',
        user_id: userId,
      });

    expect(createTask2Response.status).toBe(201);
    task2Id = createTask2Response.body.data.id;
    console.log(`Task 2 created with ID: ${task2Id}`);

    // ============================================
    // PASO 3: Listar tareas del usuario
    // ============================================
    console.log('Step 3: Listing user tasks...');
    const listTasksResponse = await request(app)
      .get(`/api/users/${userId}/tasks`);

    expect(listTasksResponse.status).toBe(200);
    expect(listTasksResponse.body.data).toBeDefined();
    expect(Array.isArray(listTasksResponse.body.data)).toBe(true);
    expect(listTasksResponse.body.data.length).toBe(2);
    console.log(`Found ${listTasksResponse.body.data.length} tasks`);

    // ============================================
    // PASO 4: Marcar una tarea como completada
    // ============================================
    console.log(`Step 4: Marking task ${task1Id} as completed...`);
    const completeTaskResponse = await request(app)
      .patch(`/api/tasks/${task1Id}/complete`);

    expect(completeTaskResponse.status).toBe(200);
    expect(completeTaskResponse.body.data).toBeDefined();
    expect(completeTaskResponse.body.data.is_completed).toBe(true);
    console.log(`Task ${task1Id} marked as completed`);

    // ============================================
    // PASO 5: Eliminar una tarea
    // ============================================
    console.log(`Step 5: Deleting task ${task2Id}...`);
    const deleteTaskResponse = await request(app)
      .delete(`/api/tasks/${task2Id}`);

    expect(deleteTaskResponse.status).toBe(200);
    expect(deleteTaskResponse.body.message).toBe('Task deleted successfully');
    console.log(`Task ${task2Id} deleted`);

    // ============================================
    // PASO 6: Verificar que solo queda 1 tarea
    // ============================================
    console.log('Step 6: Verifying final state...');
    const finalListResponse = await request(app)
      .get(`/api/users/${userId}/tasks`);

    expect(finalListResponse.status).toBe(200);
    expect(finalListResponse.body.data).toBeDefined();
    expect(Array.isArray(finalListResponse.body.data)).toBe(true);
    expect(finalListResponse.body.data.length).toBe(1);
    
    // Verificar que la tarea restante es la primera (completada)
    const remainingTask = finalListResponse.body.data[0];
    expect(remainingTask.id).toBe(task1Id);
    expect(remainingTask.title).toBe('E2E Task 1');
    expect(remainingTask.is_completed).toBe(true);
    
    console.log('Final verification passed: Only 1 task remains (completed)');
    console.log('E2E Test completed successfully!');
  });
});
