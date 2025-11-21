import 'reflect-metadata';
import { AppDataSource } from '../../src/config/database';
import { UserService } from '../../src/services/UserService';
import { User } from '../../src/models/User';

/**
 * Pruebas Unitarias - UserService
 * 
 * Test 1: No se puede crear usuario con email duplicado
 */
describe('UserService - Unit Tests', () => {
  let userService: UserService;

  beforeAll(async () => {
    // Inicializar base de datos de prueba
    await AppDataSource.initialize();
    userService = new UserService();
  });

  afterAll(async () => {
    // Limpiar base de datos
    await AppDataSource.query('TRUNCATE TABLE tasks, users RESTART IDENTITY CASCADE');
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    // Limpiar usuarios antes de cada test
    await AppDataSource.query('TRUNCATE TABLE tasks, users RESTART IDENTITY CASCADE');
  });

  /**
   * TEST 1: No se puede crear usuario con email duplicado
   * Validación de la lógica de negocio
   */
  test('should not allow creating a user with duplicate email', async () => {
    // Crear primer usuario
    const user1 = await userService.createUser('John Doe', 'john@example.com');
    expect(user1).toBeDefined();
    expect(user1.email).toBe('john@example.com');

    // Intentar crear segundo usuario con el mismo email
    await expect(
      userService.createUser('Jane Doe', 'john@example.com')
    ).rejects.toThrow('EMAIL_ALREADY_EXISTS');
  });

  /**
   * TEST ADICIONAL: Verificar que se puede crear usuario con email único
   */
  test('should create a user with unique email', async () => {
    const user = await userService.createUser('Alice Smith', 'alice@example.com');
    
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.name).toBe('Alice Smith');
    expect(user.email).toBe('alice@example.com');
    expect(user.created_at).toBeDefined();
  });
});
