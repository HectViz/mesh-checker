import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, FileBox, Trash2, Eye, LogOut, Maximize2, Box, Search } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import { MeshModel } from '../components/MeshScene';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [meshes, setMeshes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewMesh, setPreviewMesh] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchMeshes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/mesh/my-meshes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMeshes(data.meshes);
      }
    } catch (err) {
      console.error('Error obteniendo modelos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeshes();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'glb' && ext !== 'gltf') {
      setError('Solo se permiten archivos .glb o .gltf');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('El archivo excede el límite de 50MB');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('mesh', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/mesh/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al subir el modelo');
      }

      fetchMeshes();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este modelo?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/mesh/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setMeshes(meshes.filter(m => m.id !== id));
        if (previewMesh && previewMesh.id === id) setPreviewMesh(null);
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  const filteredMeshes = meshes.filter(m =>
    m.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-base-200 p-6 md:p-8 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-base-100 p-4 rounded-box border border-base-content/10 shadow-sm">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileBox size={20} className="text-primary" /> Mis Modelos
            </h1>
          </div>
          <div className="flex gap-2 items-center">
            <Link to="/" className="btn btn-ghost btn-sm">Inicio</Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="btn btn-ghost btn-sm">Admin</Link>
            )}
            <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-ghost btn-sm text-error">
              Salir
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Upload Area */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="bg-base-100 border border-dashed border-base-content/20 rounded-box hover:border-primary/50 transition-colors shadow-sm">
              <div className="flex flex-col items-center text-center p-8">
                <UploadCloud size={36} className="text-primary mb-3" />
                <h2 className="font-semibold mb-1">Subir modelo</h2>
                <p className="text-sm text-base-content/50 mb-4">.glb o .gltf — Máx. 50MB</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".glb,.gltf"
                  className="hidden"
                  id="mesh-upload"
                />
                <label htmlFor="mesh-upload" className={`btn btn-primary btn-sm ${uploading ? 'loading' : ''}`}>
                  {uploading ? 'Subiendo...' : 'Seleccionar Archivo'}
                </label>
              </div>
            </div>

            {previewMesh && (
              <div className="bg-base-100 border border-base-content/10 rounded-box overflow-hidden h-64 relative shadow-sm">
                <div className="absolute top-2 left-2 z-10 bg-base-100 px-2 py-1 rounded text-xs font-medium border border-base-content/10">
                  {previewMesh.originalName}
                </div>
                <div className="w-full h-full cursor-grab active:cursor-grabbing">
                  <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
                    <ambientLight intensity={1} />
                    <directionalLight position={[10, 10, 5]} intensity={1.5} />
                    <Suspense fallback={null}>
                      <Center>
                        <MeshModel url={`http://localhost:5000/uploads/${previewMesh.filename}`} wireframe={false} />
                      </Center>
                      <Environment preset="city" />
                    </Suspense>
                    <OrbitControls autoRotate autoRotateSpeed={2} enablePan={false} enableZoom={true} />
                  </Canvas>
                </div>
              </div>
            )}
          </div>

          {/* Mesh List */}
          <div className="md:col-span-2">
            <div className="bg-base-100 border border-base-content/10 rounded-box shadow-sm">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Box size={18} className="text-base-content/40" />
                    Modelos Recientes
                    {!loading && meshes.length > 0 && (
                      <span className="text-xs text-base-content/40 font-normal">{meshes.length}</span>
                    )}
                  </h2>
                </div>

                {/* Search */}
                {!loading && meshes.length > 0 && (
                  <div className="relative mb-4">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" />
                    <input
                      type="text"
                      placeholder="Buscar modelos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input input-bordered input-sm w-full pl-9"
                    />
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-8 text-base-content/50">Cargando...</div>
                ) : meshes.length === 0 ? (
                  <div className="text-center py-12 text-base-content/40">
                    <FileBox size={36} className="mx-auto mb-3" />
                    <p>Aún no has subido modelos</p>
                  </div>
                ) : filteredMeshes.length === 0 ? (
                  <div className="text-center py-8 text-base-content/40 text-sm">
                    Sin resultados para "{searchQuery}"
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {filteredMeshes.map(mesh => (
                      <div
                        key={mesh.id}
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-base-200/60 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FileBox size={16} className="text-base-content/30 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate" title={mesh.originalName}>
                              {mesh.originalName}
                            </p>
                            <p className="text-xs text-base-content/40">
                              {formatSize(mesh.fileSize)} · {new Date(mesh.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setPreviewMesh(mesh)}
                            className="btn btn-ghost btn-xs btn-square"
                            title="Vista Previa Rápida"
                          >
                            <Eye size={15} />
                          </button>
                          <Link
                            to={`/viewer?id=${mesh.id}`}
                            className="btn btn-ghost btn-xs btn-square"
                            title="Visor Completo"
                          >
                            <Maximize2 size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(mesh.id)}
                            className="btn btn-ghost btn-xs btn-square text-error"
                            title="Eliminar"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full border-t border-base-content/10 pt-6 pb-2 mt-8 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-base-content/40">
        <span>© {new Date().getFullYear()} MeshChecker</span>
        <span>Herramienta de inspección de modelos 3D</span>
      </footer>
    </div>
  );
};

export default Dashboard;
