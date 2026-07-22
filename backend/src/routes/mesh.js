const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.glb' || ext === '.gltf') {
    cb(null, true);
  } else {
    cb(new Error('solo se permiten archivos .glb y .gltf'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

router.post('/upload', authenticateToken, upload.single('mesh'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'no se ha subido ningún archivo' });
    }

    const newMesh = await prisma.mesh.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        userId: req.user.id
      }
    });

    res.status(201).json({
      message: 'modelo subido correctamente',
      mesh: newMesh
    });
  } catch (error) {
    console.error('error al subir modelo:', error);
    res.status(500).json({ error: error.message || 'error interno del servidor al subir el modelo' });
  }
});

router.get('/my-meshes', authenticateToken, async (req, res) => {
  try {
    const meshes = await prisma.mesh.findMany({
      where: { userId: req.user.id },
      orderBy: { uploadDate: 'desc' }
    });

    res.json({ meshes });
  } catch (error) {
    console.error('error al obtener modelos:', error);
    res.status(500).json({ error: 'error interno del servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const meshId = parseInt(req.params.id);

  try {
    const mesh = await prisma.mesh.findUnique({
      where: { id: meshId }
    });

    if (!mesh) {
      return res.status(404).json({ error: 'modelo no encontrado' });
    }

    if (mesh.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'no tienes permisos para eliminar este modelo' });
    }

    const filePath = path.join(uploadDir, mesh.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.mesh.delete({
      where: { id: meshId }
    });

    res.json({ message: 'modelo eliminado correctamente' });
  } catch (error) {
    console.error('error al eliminar modelo:', error);
    res.status(500).json({ error: 'error interno del servidor al eliminar el modelo' });
  }
});

module.exports = router;
