import 'reflect-metadata';
import request from 'supertest';
import app from '../../src/index';
import { AppDataSource } from '../../src/config/database';
import { User } from '../../src/models/User';
import { Task } from '../../src/models/Task';

/**
 * Pruebas de Integración - API Endpoints
 * 
 * Test 1: POST /api/users → verificar respuesta 201
 * Test 2: POST /api/tasks → verificar asociación con usuario
 * Test 3: GET /api/users/:id/tasks → listar tareas
 */
describe('Integration Tests - API Endpoints', () => {
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
    // Limpiar datos antes de cada test
    if (AppDataSource.isInitialized) {
      await AppDataSource.query('TRUNCATE TABLE tasks, users RESTART IDENTITY CASCADE');
    }
  });

  /**
   * TEST 1: POST /api/users → verificar respuesta 201
   */
  test('POST /api/users should return 201 and create user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'Integration Test User',
        email: 'integration@test.com',
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');
    expect(response.body.data).toBeDefined();
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.name).toBe('Integration Test User');
    expect(response.body.data.email).toBe('integration@test.com');
    expect(response.body.data.created_at).toBeDefined();
  });

  /**
   * TEST 2: POST /api/tasks → verificar asociación con usuario
   */
  test('POST /api/tasks should return 201 and associate task with user', async () => {
    // Crear usuario primero
    const userResponse = await request(app)
      .post('/api/users')
      .send({
        name: 'Task Owner',
        email: 'taskowner@test.com',
      });

    const userId = userResponse.body.data.id;

    // Crear tarea asociada al usuario
    const taskResponse = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Integration Test Task',
        description: 'This is a test task',
        user_id: userId,
      });

    expect(taskResponse.status).toBe(201);
    expect(taskResponse.body.message).toBe('Task created successfully');
    expect(taskResponse.body.data).toBeDefined();
    expect(taskResponse.body.data.id).toBeDefined();
    expect(taskResponse.body.data.title).toBe('Integration Test Task');
    expect(taskResponse.body.data.user_id).toBe(userId);
    expect(taskResponse.body.data.is_completed).toBe(false);
  });

  /**
   * TEST 3: GET /api/users/:id/tasks → listar tareas
   */
  test('GET /api/users/:id/tasks should return list of user tasks', async () => {
    // Crear usuario
    const userResponse = await request(app)
      .post('/api/users')
      .send({
        name: 'User With Tasks',
        email: 'withtasks@test.com',
      });

    const userId = userResponse.body.data.id;

    // Crear múltiples tareas
    await request(app)
      .post('/api/tasks')
      .send({
        title: 'Task 1',
        description: 'First task',
        user_id: userId,
      });

    await request(app)
      .post('/api/tasks')
      .send({
        title: 'Task 2',
        description: 'Second task',
        user_id: userId,
      });

    // Obtener tareas del usuario
    const tasksResponse = await request(app)
      .get(`/api/users/${userId}/tasks`);

    expect(tasksResponse.status).toBe(200);
    expect(tasksResponse.body.message).toBe('Tasks retrieved successfully');
    expect(tasksResponse.body.data).toBeDefined();
    expect(Array.isArray(tasksResponse.body.data)).toBe(true);
    expect(tasksResponse.body.data.length).toBe(2);
    expect(tasksResponse.body.data[0].user_id).toBe(userId);
    expect(tasksResponse.body.data[1].user_id).toBe(userId);
  });

  /**
   * TEST ADICIONAL: Verificar error 400 con email duplicado
   */
  test('POST /api/users should return 400 for duplicate email', async () => {
    // Crear primer usuario
    await request(app)
      .post('/api/users')
      .send({
        name: 'First User',
        email: 'duplicate@test.com',
      });

    // Intentar crear segundo usuario con el mismo email
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'Second User',
        email: 'duplicate@test.com',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('EMAIL_ALREADY_EXISTS');
  });

  /**
   * TEST ADICIONAL: Verificar error 404 al crear tarea con user_id inválido
   */
  test('POST /api/tasks should return 404 for non-existent user', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Orphan Task',
        description: 'Task without valid user',
        user_id: 99999,
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('USER_NOT_FOUND');
  });
});
