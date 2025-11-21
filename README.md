# ToDo API - Sistema de Gestión de Tareas

API REST para gestionar tareas (to-do list) asociadas a usuarios, estructurada por capas (Modelos, Servicios, Controladores).

## Tecnologías

- **Lenguaje:** TypeScript
- **Framework:** Express.js
- **Base de datos:** PostgreSQL 17
- **ORM:** TypeORM
- **Testing:** Jest + Supertest
- **Análisis estático:** ESLint + eslint-plugin-security
- **CI/CD:** GitHub Actions

## Estructura del Proyecto

```
ToDoAPI/
├── src/
│   ├── models/           # Entidades de base de datos
│   │   ├── User.ts       # Modelo de usuario
│   │   └── Task.ts       # Modelo de tarea
│   ├── services/         # Lógica de negocio
│   │   ├── UserService.ts
│   │   └── TaskService.ts
│   ├── controllers/      # Controladores HTTP
│   │   ├── UserController.ts
│   │   └── TaskController.ts
│   ├── routes/           # Definición de endpoints
│   │   ├── userRoutes.ts
│   │   ├── taskRoutes.ts
│   │   └── index.ts
│   ├── config/           # Configuración
│   │   └── database.ts   # Configuración de PostgreSQL
│   └── index.ts          # Punto de entrada
├── tests/
│   ├── unit/             # Pruebas unitarias
│   ├── integration/      # Pruebas de integración
│   └── e2e/              # Pruebas end-to-end
├── .github/
│   └── workflows/
│       └── ci.yml        # Pipeline CI/CD
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.js
└── .env
```

## Modelo de Datos

### Tabla `users`
| Campo       | Tipo      | Descripción                |
|-------------|-----------|----------------------------|
| id          | INT (PK)  | Identificador único        |
| name        | VARCHAR   | Nombre del usuario         |
| email       | VARCHAR   | Email (único)              |
| created_at  | TIMESTAMP | Fecha de creación          |

### Tabla `tasks`
| Campo        | Tipo      | Descripción                |
|--------------|-----------|----------------------------|
| id           | INT (PK)  | Identificador único        |
| title        | VARCHAR   | Título de la tarea         |
| description  | TEXT      | Descripción (opcional)     |
| is_completed | BOOLEAN   | Estado (default: false)    |
| user_id      | INT (FK)  | ID del usuario propietario |
| created_at   | TIMESTAMP | Fecha de creación          |

## Instalación y Configuración

### 1. Requisitos previos

- Node.js 20+
- PostgreSQL 17
- npm o yarn

### 2. Clonar el repositorio

```bash
git clone <repository-url>
cd ToDoAPI
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar base de datos

Asegúrate de tener PostgreSQL corriendo y crea la base de datos:

```sql
CREATE DATABASE todo_api_db;
```

### 5. Configurar variables de entorno

Copia `.env.example` a `.env` y ajusta si es necesario:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin123
DB_DATABASE=todo_api_db
PORT=3000
NODE_ENV=development
```

**Nota:** Las tablas se crearán automáticamente gracias a TypeORM con `synchronize: true`.

### 6. Iniciar el servidor

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# Modo producción
npm run build
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## Endpoints de la API

### **Health Check**
```
GET /health
```

### **Usuarios**

#### Crear usuario
```http
POST /api/users
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com"
}
```

**Respuesta (201):**
```json
{
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "created_at": "2024-11-21T10:30:00.000Z"
  }
}
```

#### Obtener usuario por ID
```http
GET /api/users/:id
```

### **Tareas**

#### Crear tarea
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Completar proyecto",
  "description": "Terminar el backend de la API",
  "user_id": 1
}
```

**Respuesta (201):**
```json
{
  "message": "Task created successfully",
  "data": {
    "id": 1,
    "title": "Completar proyecto",
    "description": "Terminar el backend de la API",
    "is_completed": false,
    "user_id": 1,
    "created_at": "2024-11-21T10:35:00.000Z"
  }
}
```

#### Listar tareas de un usuario
```http
GET /api/users/:id/tasks
```

#### Actualizar estado de tarea
```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "is_completed": true
}
```

#### Marcar tarea como completada
```http
PATCH /api/tasks/:id/complete
```

#### Eliminar tarea
```http
DELETE /api/tasks/:id
```

## Pruebas

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar pruebas específicas
```bash
# Pruebas unitarias (4 pruebas)
npm run test:unit

# Pruebas de integración (3 pruebas)
npm run test:integration

# Pruebas E2E (1 flujo completo)
npm run test:e2e
```

### Cobertura de pruebas

Las pruebas incluyen:

**Unitarias:**
1. No permitir usuario con email duplicado
2. No crear tarea sin user_id
3. Actualizar is_completed correctamente
4. Eliminar tarea exitosamente

**Integración:**
1. POST /api/users → respuesta 201
2. POST /api/tasks → asociación con usuario
3. GET /api/users/:id/tasks → listar tareas

**E2E:**
1. Flujo completo de 6 pasos

## Análisis Estático

Ejecutar ESLint con reglas de seguridad:

```bash
npm run lint

# Corregir automáticamente
npm run lint:fix
```

## Validaciones de Negocio

La capa de servicios implementa:

1. **Email único:** No permite usuarios con email duplicado
2. **Validar user_id:** No crea tarea sin user_id válido
3. **Usuario existente:** Verifica que user_id exista antes de crear tarea
4. **Actualización controlada:** Solo permite actualizar `is_completed`

## Códigos de Respuesta HTTP

| Código | Significado           | Uso                                    |
|--------|-----------------------|----------------------------------------|
| 200    | OK                    | Consulta exitosa                       |
| 201    | Created               | Recurso creado exitosamente            |
| 400    | Bad Request           | Datos inválidos o faltantes            |
| 404    | Not Found             | Recurso no encontrado                  |
| 500    | Internal Server Error | Error interno del servidor             |

## Ejemplos de Uso

### Ejemplo completo con cURL

```bash
# 1. Crear usuario
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana García","email":"ana@example.com"}'

# 2. Crear tarea
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Estudiar TypeScript","description":"Repasar decoradores","user_id":1}'

# 3. Listar tareas del usuario
curl http://localhost:3000/api/users/1/tasks

# 4. Marcar como completada
curl -X PATCH http://localhost:3000/api/tasks/1/complete

# 5. Eliminar tarea
curl -X DELETE http://localhost:3000/api/tasks/1
```

## CI/CD Pipeline

El proyecto incluye un pipeline de GitHub Actions que:

1. Instala dependencias
2. Compila TypeScript
3. Ejecuta pruebas unitarias
4. Ejecuta pruebas de integración
5. Ejecuta prueba E2E
6. Ejecuta análisis estático (ESLint)
7. Imprime "OK" si todo pasa
8. Marca como "Failed" si algo falla

## Advertencias Importantes

- **Base de datos:** Asegúrate de que PostgreSQL esté corriendo antes de iniciar
- **Puerto 3000:** Verifica que el puerto 3000 esté disponible
- **Credenciales:** Las credenciales por defecto son `postgres/admin123`
- **Sincronización:** `synchronize: true` solo debe usarse en desarrollo
- **Tests:** Los tests requieren conexión a la base de datos

## Troubleshooting

### Error: "Cannot connect to database"
```bash
# Verificar que PostgreSQL está corriendo
# Windows:
sc query postgresql-x64-17

# Iniciar servicio si está detenido
net start postgresql-x64-17
```

### Error: "Port 3000 is already in use"
```bash
# Cambiar el puerto en .env
PORT=3001
```

### Error: "Database does not exist"
```sql
-- Conectarse a PostgreSQL y crear la base de datos
CREATE DATABASE todo_api_db;
```

## Contacto

Para dudas o sugerencias, contactar al desarrollador.

## Licencia

ISC

---

**Desarrollado para el parcial práctico de Backend Development**
