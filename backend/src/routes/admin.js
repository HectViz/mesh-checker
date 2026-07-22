const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

const uploadDir = path.join(__dirname, '../../uploads');

// Middleware to ensure user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'acceso denegado. requiere rol de administrador' });
  }
  next();
};

router.use(authenticateToken, requireAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        _count: {
          select: { meshes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ users });
  } catch (error) {
    console.error('error al obtener usuarios:', error);
    res.status(500).json({ error: 'error interno del servidor' });
  }
});

// Get all meshes
router.get('/meshes', async (req, res) => {
  try {
    const meshes = await prisma.mesh.findMany({
      include: {
        user: {
          select: { username: true, email: true }
        }
      },
      orderBy: { uploadDate: 'desc' }
    });
    res.json({ meshes });
  } catch (error) {
    console.error('error al obtener modelos:', error);
    res.status(500).json({ error: 'error interno del servidor' });
  }
});

// Delete user and all their meshes
router.delete('/user/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    // Cannot delete yourself
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'no puedes eliminar tu propia cuenta de administrador' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { meshes: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'usuario no encontrado' });
    }

    // Delete physical files
    user.meshes.forEach(mesh => {
      const filePath = path.join(uploadDir, mesh.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Delete user from DB (meshes will cascade delete due to schema)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'usuario y modelos eliminados correctamente' });
  } catch (error) {
    console.error('error al eliminar usuario:', error);
    res.status(500).json({ error: 'error al eliminar el usuario' });
  }
});

// Delete specific mesh
router.delete('/mesh/:id', async (req, res) => {
  const meshId = parseInt(req.params.id);

  try {
    const mesh = await prisma.mesh.findUnique({
      where: { id: meshId }
    });

    if (!mesh) {
      return res.status(404).json({ error: 'modelo no encontrado' });
    }

    // Delete physical file
    const filePath = path.join(uploadDir, mesh.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from DB
    await prisma.mesh.delete({
      where: { id: meshId }
    });

    res.json({ message: 'modelo eliminado correctamente por moderación' });
  } catch (error) {
    console.error('error al eliminar modelo:', error);
    res.status(500).json({ error: 'error al eliminar el modelo' });
  }
});

module.exports = router;
