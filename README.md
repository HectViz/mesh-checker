# MeshChecker
MeshChecker es una aplicación web diseñada para la inspección y análisis de modelos 3D en formato `.glb` y `.gltf`. Permite a los usuarios subir archivos, calcular métricas de geometría en tiempo real (polígonos, vértices y dimensiones), inspeccionar materiales y ajustar configuraciones de iluminación y wireframe directamente desde el navegador.
## Features
*   Autenticación y Roles: Registro e inicio de sesión seguro con JWT y contraseñas encriptadas con Bcrypt. Manejo de roles para usuarios estándar y administradores.
*   Dashboard de Usuario: Subida de modelos mediante arrastrar y soltar (drag-and-drop), panel de vista previa 3D rápida y gestión de archivos personales.
*   Visor 3D Interactivo: Renderizado acelerado por WebGL con Three.js y React Three Fiber.
*   Análisis de Geometría: Cálculo automático de polígonos, vértices y dimensiones exactas (bounding box) con normalización automática de escala.
*   Herramientas de Inspección: Modo wireframe sólido para evaluación topológica, control de intensidad de luz ambiental e inspección de materiales extraídos.
*   Panel de Moderación (Admin): Gestión global de usuarios y modelos del sistema con eliminación en cascada de base de datos y archivos físicos del disco duro.
## Requerimientos
*   **Node.js** (v18 o superior)
*   **npm**
## Pasos de Despliegue y Ejecución
### 1. Configuración del Backend
1.  Desde la terminal entra a la carpeta del backend para instalar las dependencias:
    ```bash
    cd backend
    npm install
    ```
2.  Crea un archivo `.env` en la raíz de la carpeta `backend`:
    ```env
    PORT=5000
    JWT_SECRET=tu_clave_secreta_jwt
    DATABASE_URL="file:./dev.db"
    ```
3.  Ejecuta la migración de Prisma para generar la base de datos SQLite y el cliente:
    ```bash
    npx prisma db push
    ```
4.  (Opcional) Crea la cuenta inicial de administrador ejecutando el script de seed:
    ```bash
    node seedAdmin.js
    ```
5.  Inicia el servidor backend:
    ```bash
    node server.js
    ```
    El servidor correrá en `http://localhost:5000` por defecto.
### 2. Configuración del Frontend
1.  Desde la terminal entra a la carpeta del frontend para instalar las dependencias:
    ```bash
    cd frontend
    npm install
    ```
2.  Inicia el servidor local de desarrollo con Vite:
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173` por defecto.
## Dependencias
*   Backend: Node.js, Express, Prisma (SQLite), Bcrypt, Jsonwebtoken, Multer, CORS, Dotenv.
*   Frontend: React (Vite), React Three Fiber (@react-three/fiber), Three.js, Drei (@react-three/drei), Tailwind CSS, DaisyUI, Lucide React, React Router DOM.
## TO-DO
*   Soporte para formatos adicionales de modelos 3D (`.obj`, `.fbx`).
*   Generación automática de miniaturas estáticas (thumbnails) en el servidor al subir archivos.
