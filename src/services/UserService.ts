import { AppDataSource } from '../config/database';
import { User } from '../models/User';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Crear un nuevo usuario
   * Validación: Email debe ser único
   */
  async createUser(name: string, email: string): Promise<User> {
    // VALIDACIÓN 1: Email único
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const user = this.userRepository.create({ name, email });
    return await this.userRepository.save(user);
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  /**
   * Obtener todos los usuarios
   */
  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  /**
   * Verificar si un usuario existe
   */
  async userExists(id: number): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user !== null;
  }
}
