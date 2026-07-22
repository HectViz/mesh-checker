import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, FileBox, Trash2, Eye, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [meshes, setMeshes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
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
        throw new Error(data.error || 'Error al subir');
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

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-base-100 p-4 rounded-box shadow-sm">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileBox className="text-primary" /> Mis modelos
            </h1>
            <p className="text-sm opacity-70">Aquí puedes revisar tus modelos subidos anteriormente.</p>
          </div>
          <div className="flex gap-4 items-center">
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="btn btn-outline btn-sm">panel admin</Link>
            )}
            <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-ghost btn-sm text-error">
              <LogOut size={16} /> salir
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="md:col-span-1">
            <div className="card bg-base-100 shadow-xl border-2 border-dashed border-base-300 hover:border-primary transition-colors">
              <div className="card-body items-center text-center py-12">
                <UploadCloud size={48} className="text-primary mb-4" />
                <h2 className="card-title">subir nuevo modelo</h2>
                <p className="text-sm opacity-70 mb-4">arrastra un .glb o haz clic aquí (máx. 50MB)</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".glb,.gltf"
                  className="hidden"
                  id="mesh-upload"
                />
                <label htmlFor="mesh-upload" className={`btn btn-primary ${uploading ? 'loading' : ''}`}>
                  {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
                </label>
              </div>
            </div>
          </div>

          {/* Mesh List */}
          <div className="md:col-span-2">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4">Modelos recientes</h2>

                {loading ? (
                  <div className="text-center py-8">Cargando...</div>
                ) : meshes.length === 0 ? (
                  <div className="text-center py-12 opacity-50">
                    <FileBox size={48} className="mx-auto mb-4" />
                    Aún no has subido modelos
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Tamaño</th>
                          <th>Fecha</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meshes.map(mesh => (
                          <tr key={mesh.id}>
                            <td>
                              <div className="font-bold truncate max-w-[200px]" title={mesh.originalName}>
                                {mesh.originalName}
                              </div>
                            </td>
                            <td>{formatSize(mesh.fileSize)}</td>
                            <td>{new Date(mesh.uploadDate).toLocaleDateString()}</td>
                            <td>
                              <div className="flex gap-2">
                                <Link to={`/viewer?id=${mesh.id}`} className="btn btn-sm btn-ghost text-primary" title="Ver">
                                  <Eye size={18} />
                                </Link>
                                <button onClick={() => handleDelete(mesh.id)} className="btn btn-sm btn-ghost text-error" title="Eliminar">
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
