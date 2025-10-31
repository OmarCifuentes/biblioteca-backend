const mongoose = require('mongoose');
const { User } = require('../dist/users/user.model');
require('dotenv').config();

// Agrega permisos de administrador a un usuario - Uso: node scripts/add-admin-permissions.js <userId>
async function addAdminPermissions() {
  // Verificar argumentos
  if (process.argv.length < 3) {
    console.error('Usage: node scripts/add-admin-permissions.js <userId>');
    process.exit(1);
  }

  const userId = process.argv[2];

  // Validar formato de ID
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.error('Invalid user ID format');
    process.exit(1);
  }

  try {
    // Conectar a la base de datos
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('MONGO_URI environment variable is not set');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Verificar si el usuario existe
    const user = await User.findById(userId);
    
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }
    
    // Agregar permisos de administrador
    const adminPermissions = [
      'modify_users',
      'disable_users',
      'create_books',
      'modify_books',
      'disable_books'
    ];
    
    // Actualizar permisos de usuario
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $addToSet: { permissions: { $each: adminPermissions } } 
      },
      { new: true }
    );
    
    console.log('Admin permissions added successfully');
    console.log('User:', {
      _id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      permissions: updatedUser.permissions
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding admin permissions:', error);
    process.exit(1);
  }
}

addAdminPermissions();
