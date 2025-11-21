import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

// POST /api/users - Crear usuario
router.post('/users', (req, res) => userController.createUser(req, res));

// GET /api/users/:id - Consultar usuario por ID
router.get('/users/:id', (req, res) => userController.getUserById(req, res));

export default router;
