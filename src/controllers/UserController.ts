import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
  private userService = new UserService();

  /**
   * POST /api/users
   * Crear un nuevo usuario
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email } = req.body;

      // Validar campos requeridos
      if (!name || !email) {
        res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Name and email are required',
        });
        return;
      }

      const user = await this.userService.createUser(name, email);

      res.status(201).json({
        message: 'User created successfully',
        data: user,
      });
    } catch (error: any) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        res.status(400).json({
          error: 'EMAIL_ALREADY_EXISTS',
          message: 'A user with this email already exists',
        });
        return;
      }

      console.error('Error creating user:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user',
      });
    }
  }

  /**
   * GET /api/users/:id
   * Obtener usuario por ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Invalid user ID',
        });
        return;
      }

      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          error: 'NOT_FOUND',
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve user',
      });
    }
  }
}
