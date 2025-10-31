# API de Gestión de Biblioteca

## Descripción
API REST para la gestión de una biblioteca universitaria que permite a los usuarios registrarse, iniciar sesión y reservar libros digitalmente. El sistema incluye autenticación JWT, sistema de permisos granulares y gestión completa de usuarios, libros y reservas.

## Tecnologías
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Bcrypt para encriptación de contraseñas
- Express-validator para validación de datos
- Clean Architecture

## Estructura del Proyecto

```
src/
├── users/                  # Gestión de usuarios
│   ├── user.model.ts       # Esquema de datos
│   ├── user.route.ts       # Rutas de API
│   ├── user.controller.ts  # Controladores
│   └── actions/            # Lógica de negocio
├── books/                  # Gestión de libros (estructura similar)
├── reservations/           # Gestión de reservas (estructura similar)
├── auth/                   # Autenticación
│   ├── auth.route.ts
│   ├── auth.controller.ts
│   └── actions/
├── middleware/             # Middlewares
│   ├── auth.middleware.ts  # Autenticación y permisos
│   ├── error.middleware.ts # Manejo de errores
│   └── validators.ts       # Validación de datos
├── config/                 # Configuraciones
│   └── database.ts         # Conexión a MongoDB
├── types/                  # Definiciones de tipos
│   └── index.ts
└── index.ts               # Punto de entrada
```

## Arquitectura

El proyecto está organizado siguiendo los principios de Clean Architecture:
- **Routes**: Definen los endpoints y aplican middlewares
- **Controllers**: Orquestan las acciones y manejan las respuestas HTTP
- **Actions**: Contienen la lógica de negocio (un archivo por acción)
- **Models**: Definen los esquemas de datos con Mongoose

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/OmarCifuentes/biblioteca-backend
cd biblioteca-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Iniciar servidor en modo desarrollo
npm run dev
```

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/biblioteca
JWT_SECRET=tu_clave_secreta_para_jwt
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

- `PORT`: Puerto donde se ejecutará el servidor
- `MONGO_URI`: URL de conexión a MongoDB
- `JWT_SECRET`: Clave secreta para firmar los tokens JWT
- `JWT_EXPIRES_IN`: Tiempo de expiración de los tokens JWT
- `NODE_ENV`: Entorno de ejecución (development, production)

## API Endpoints

### Autenticación

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `POST` | `/api/auth/register` | Registro de usuario | Público |
| `POST` | `/api/auth/login` | Inicio de sesión | Público |

### Usuarios

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `GET` | `/api/users/:id` | Obtener usuario por ID | Autenticado |
| `PUT` | `/api/users/:id` | Actualizar usuario | Propietario o `modify_users` |
| `DELETE` | `/api/users/:id` | Eliminar usuario (soft delete) | Propietario o `disable_users` |

### Libros

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `POST` | `/api/books` | Crear libro | `create_books` |
| `GET` | `/api/books/:id` | Obtener libro por ID | Público |
| `GET` | `/api/books` | Listar libros con filtros y paginación | Público |
| `PUT` | `/api/books/:id` | Actualizar libro | `modify_books` |
| `DELETE` | `/api/books/:id` | Eliminar libro (soft delete) | `disable_books` |

### Reservas

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `POST` | `/api/books/:bookId/reserve` | Reservar libro | Autenticado |
| `PUT` | `/api/reservations/:id/return` | Devolver libro | Propietario o `modify_users` |
| `GET` | `/api/books/:bookId/history` | Historial de reservas del libro | Público |
| `GET` | `/api/users/:userId/reservations` | Historial de reservas del usuario | Propietario o `modify_users` |

### Parámetros de filtrado para listado de libros

- `title`: Búsqueda parcial por título
- `author`: Búsqueda parcial por autor
- `genre`: Búsqueda exacta por género
- `publisher`: Búsqueda parcial por editorial
- `available`: Filtro por disponibilidad (true/false)
- `publicationDate[gte]`: Fecha de publicación desde (YYYY-MM-DD)
- `publicationDate[lte]`: Fecha de publicación hasta (YYYY-MM-DD)
- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 10)

## Permisos

El sistema implementa un modelo de permisos granulares que permite controlar el acceso a diferentes funcionalidades:

| Permiso | Descripción |
|---------|-------------|
| `create_books` | Permite crear nuevos libros |
| `modify_books` | Permite modificar información de libros existentes |
| `disable_books` | Permite eliminar libros (soft delete) |
| `modify_users` | Permite modificar información de otros usuarios |
| `disable_users` | Permite eliminar usuarios (soft delete) |

## Administración de Usuarios

Por defecto, los usuarios se registran sin permisos especiales. Para crear un usuario administrador:

1. Registra un usuario normal mediante el endpoint `/api/auth/register`
2. Usa el script incluido para agregar permisos de administrador:

```bash
node scripts/add-admin-permissions.js <userId>
```

Alternativamente, puedes conectar directamente a MongoDB y actualizar el documento:

```javascript
db.users.updateOne(
  { email: "admin@biblioteca.com" },
  { 
    $set: { 
      permissions: [
        "create_books",
        "modify_books", 
        "disable_books",
        "modify_users",
        "disable_users"
      ]
    }
  }
)
```

## Scripts

El proyecto incluye los siguientes scripts:

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor en modo desarrollo con recarga automática |
| `npm run build` | Compila el código TypeScript a JavaScript |
| `npm start` | Inicia el servidor en modo producción |
| `npm run lint` | Ejecuta el linter para verificar el código |

## Testing

### Ejemplos de uso

```bash
# Registrar un usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "123456",
    "name": "Nombre Usuario"
  }'

# Iniciar sesión y obtener token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "123456"
  }'

# Crear un libro (requiere token y permisos)
curl -X POST http://localhost:3000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cien años de soledad",
    "author": "Gabriel García Márquez",
    "genre": "Realismo mágico",
    "publisher": "Editorial Sudamericana",
    "publicationDate": "1967-05-30"
  }'

# Buscar libros con filtros
curl -X GET "http://localhost:3000/api/books?author=garcia&genre=realismo&page=1&limit=10"

# Reservar un libro
curl -X POST "http://localhost:3000/api/books/BOOK_ID/reserve" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Pruebas con Newman

El proyecto incluye una colección de Postman para probar todos los endpoints. Puedes ejecutar estas pruebas automáticamente con Newman:

#### Instalación de Newman

```bash
# Instalar Newman globalmente
npm install -g newman

# Si prefieres ver reportes HTML
npm install -g newman-reporter-htmlextra
```

#### Ejecutar pruebas

```bash
# Ejecutar todas las pruebas
newman run postman-collection.json

# Ejecutar con reporte HTML
newman run postman-collection.json -r htmlextra
```

#### Flujos de prueba incluidos

La colección de Postman incluye los siguientes flujos de prueba:

1. **Autenticación**: Registro e inicio de sesión
2. **Gestión de usuarios**: Crear, leer, actualizar y eliminar usuarios
3. **Gestión de libros**: Crear, leer, actualizar y eliminar libros
4. **Reservas**: Reservar libros, devolver libros y consultar historiales
5. **Pruebas de validación**: Verificar que las validaciones funcionan correctamente
6. **Pruebas de permisos**: Verificar que el sistema de permisos funciona correctamente

## Autor

Omar Cifuentes
