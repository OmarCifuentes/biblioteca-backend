# 🧪 Instrucciones de Testing Automatizado

## Pre-requisitos

1. **Servidor corriendo:**
```bash
npm run dev
```

2. **Usuario admin creado en MongoDB:**
```javascript
// Conecta a tu MongoDB y ejecuta:
db.users.insertOne({
  email: "admin@biblioteca.com",
  password: "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUa2AqXESW",
  name: "Admin",
  permissions: [
    "create_books",
    "modify_books",
    "disable_books",
    "modify_users",
    "disable_users"
  ],
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Nota: El password hash corresponde a "admin123"
```

## Opción 1: Newman CLI (Recomendado)

### Instalación
```bash
npm install -g newman
npm install -g newman-reporter-htmlextra
```

### Ejecución Básica
```bash
newman run postman-collection.json
```

### Con Reporte HTML
```bash
newman run postman-collection.json -r htmlextra --reporter-htmlextra-export report.html
```

### Con Variables Personalizadas
```bash
newman run postman-collection.json --env-var "base_url=http://localhost:3000/api"
```

### Output Esperado
```
┌─────────────────────────┬────────────────┬───────────────┐
│                         │       executed │        failed │
├─────────────────────────┼────────────────┼───────────────┤
│              iterations │              1 │             0 │
├─────────────────────────┼────────────────┼───────────────┤
│                requests │             56 │             0 │
├─────────────────────────┼────────────────┼───────────────┤
│            test-scripts │             56 │             0 │
├─────────────────────────┼────────────────┼───────────────┤
│      prerequest-scripts │              2 │             0 │
├─────────────────────────┼────────────────┼───────────────┤
│              assertions │            168 │             0 │
├─────────────────────────┴────────────────┴───────────────┤
│ total run duration: 24.3s                                │
├──────────────────────────────────────────────────────────┤
│ total data received: 47.23kB (approx)                    │
├──────────────────────────────────────────────────────────┤
│ average response time: 387ms [min: 45ms, max: 1.2s]     │
└──────────────────────────────────────────────────────────┘

✨ TODOS LOS TESTS PASARON
```

## Opción 2: Postman GUI

### Importar Colección
1. Abrir Postman
2. File → Import
3. Seleccionar postman-collection.json
4. Click "Import"

### Ejecutar Tests
1. Click derecho en "Biblioteca API - Automated Tests"
2. Seleccionar "Run collection"
3. Verificar settings:
   - Iterations: 1
   - Delay: 0ms
   - Data: None
4. Click "Run Biblioteca API"

### Ver Resultados
- Tests passed: X/X
- Assertions: X passed
- Duration: ~30s

## Troubleshooting

### Error: "ECONNREFUSED"
**Problema:** Servidor no está corriendo
**Solución:** 
```bash
npm run dev
```

### Error: "Admin login failed"
**Problema:** Usuario admin no existe
**Solución:** Crear usuario admin en MongoDB (ver Pre-requisitos)

### Error: "Duplicate email"
**Problema:** Tests corridos anteriormente dejaron datos
**Solución:** 
```bash
# Limpiar colección users (excepto admin)
db.users.deleteMany({ email: { $regex: /test\.com$/ } })
```

### Varios tests fallan
**Problema:** Orden de ejecución roto
**Solución:** 
- Correr colección completa de nuevo (tests son dependientes)
- No correr tests individuales fuera de orden

## Scripts NPM (Opcional)

Añade a package.json:
```json
{
  "scripts": {
    "test:auto": "newman run postman-collection.json",
    "test:report": "newman run postman-collection.json -r htmlextra --reporter-htmlextra-export report.html",
    "test:ci": "newman run postman-collection.json --bail"
  }
}
```

Luego ejecuta:
```bash
npm run test:auto       # Tests básicos
npm run test:report     # Tests + reporte HTML
npm run test:ci         # Para CI/CD (falla rápido)
```

## Integración con GitHub Actions (Bonus)

Crea .github/workflows/test.yml:
```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start server
        run: npm run dev &
        env:
          MONGO_URI: mongodb://localhost:27017/biblioteca_test
          JWT_SECRET: test_secret
      
      - name: Wait for server
        run: sleep 5
      
      - name: Install Newman
        run: npm install -g newman
      
      - name: Run tests
        run: newman run postman-collection.json
```

## Checklist de Testing

Antes de entregar proyecto:
```
✅ Servidor inicia sin errores (npm run dev)
✅ Usuario admin existe en MongoDB
✅ Todos los tests pasan con Newman
✅ Reporte HTML generado sin errores
✅ .env no está en el repositorio
✅ node_modules no está en el repositorio
✅ README.md está completo
```

## Estructura de Tests

La colección incluye:

**Folder 1: Setup & Auth (10 requests)**
- Crear usuarios de prueba
- Login usuarios
- Login admin
- Validaciones de auth

**Folder 2: Users CRUD (10 requests)**
- Get, Update, Delete usuarios
- Validaciones de permisos
- Soft deletes

**Folder 3: Books CRUD (18 requests)**
- CRUD completo de libros
- Filtros y búsquedas
- Paginación
- Soft deletes

**Folder 4: Reservations (10 requests)**
- Reservar y devolver libros
- Historiales
- Validaciones de disponibilidad

**Folder 5: Edge Cases (8 requests)**
- IDs inválidos
- Tokens inválidos
- Validaciones de datos

**Total: 56 requests | 168+ assertions**

## Contacto / Ayuda

Si tienes problemas:
1. Verifica que el servidor esté corriendo
2. Verifica que admin existe en DB
3. Lee los mensajes de error completos
4. Revisa logs del servidor mientras corren los tests

---

**¡Tests automatizados listos! 🎉**

56 requests | 168+ assertions | ~30 segundos
