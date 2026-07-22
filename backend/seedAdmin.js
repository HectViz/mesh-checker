const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: { role: 'ADMIN' },
      create: {
        username: 'admin',
        email: 'admin@meshchecker.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Cuenta de administrador creada o actualizada correctamente:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('   Rol: ADMIN');
  } catch (error) {
    console.error('Error al crear cuenta admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
