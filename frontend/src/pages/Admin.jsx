import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, Box, Trash2, Eye, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [meshes, setMeshes] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [meshSearch, setMeshSearch] = useState('');

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');

      const [usersRes, meshesRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/admin/meshes', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!usersRes.ok || !meshesRes.ok) {
        throw new Error('error de permisos o de conexión');
      }

      const usersData = await usersRes.json();
      const meshesData = await meshesRes.json();

      setUsers(usersData.users);
      setMeshes(meshesData.meshes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (id === user.id) {
      alert('no puedes eliminar tu propia cuenta');
      return;
    }
    if (!window.confirm('¿estás seguro de eliminar este usuario y TODOS sus modelos? esta acción es irreversible.')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/user/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchAdminData();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMesh = async (id) => {
    if (!window.confirm('¿estás seguro de eliminar este modelo del sistema?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/mesh/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchAdminData();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatSize = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredMeshes = meshes.filter(m =>
    m.originalName.toLowerCase().includes(meshSearch.toLowerCase()) ||
    (m.user?.username || '').toLowerCase().includes(meshSearch.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-base-200 text-base-content/50">Cargando panel de administración...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-base-200 text-error">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-base-200 p-6 md:p-8 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-base-100 p-4 rounded-box border border-base-content/10 shadow-sm">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert size={20} className="text-primary" /> Moderación
            </h1>
          </div>
          <div className="flex gap-2 items-center">
            <Link to="/" className="btn btn-ghost btn-sm">Inicio</Link>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
            <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-ghost btn-sm text-error">
              Salir
            </button>
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-base-100 border border-base-content/10 rounded-box p-4 flex items-center gap-3 shadow-sm">
            <Users size={18} className="text-base-content/40" />
            <div>
              <p className="text-lg font-bold">{users.length}</p>
              <p className="text-xs text-base-content/50">Usuarios registrados</p>
            </div>
          </div>
          <div className="bg-base-100 border border-base-content/10 rounded-box p-4 flex items-center gap-3 shadow-sm">
            <Box size={18} className="text-base-content/40" />
            <div>
              <p className="text-lg font-bold">{meshes.length}</p>
              <p className="text-xs text-base-content/50">Modelos en el sistema</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-base-content/10">
          <button
            className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'users'
              ? 'border-primary text-primary'
              : 'border-transparent text-base-content/50 hover:text-base-content/80'
              }`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={15} /> Usuarios
          </button>
          <button
            className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'meshes'
              ? 'border-primary text-primary'
              : 'border-transparent text-base-content/50 hover:text-base-content/80'
              }`}
            onClick={() => setActiveTab('meshes')}
          >
            <Box size={15} /> Modelos 3D
          </button>
        </div>

        {/* Content */}
        <div className="bg-base-100 border border-base-content/10 rounded-box shadow-sm">
          <div className="p-5">

            {activeTab === 'users' && (
              <>
                {/* Search users */}
                <div className="relative mb-4">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" />
                  <input
                    type="text"
                    placeholder="Buscar por usuario o email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="input input-bordered input-sm w-full pl-9"
                  />
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-base-content/40 text-sm">
                    {userSearch ? `Sin resultados para "${userSearch}"` : 'No hay usuarios'}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {filteredUsers.map(u => (
                      <div
                        key={u.id}
                        className={`flex items-center justify-between py-3 px-3 rounded-lg group ${u.id === user.id ? 'bg-base-200/40' : 'hover:bg-base-200/40'
                          } transition-colors`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center text-xs font-bold text-base-content/60 shrink-0">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">
                                {u.username}
                                {u.id === user.id && <span className="text-base-content/40 font-normal ml-1">(tú)</span>}
                              </p>
                              {u.role === 'ADMIN' && (
                                <span className="badge badge-error badge-xs">admin</span>
                              )}
                            </div>
                            <p className="text-xs text-base-content/40">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-xs text-base-content/40">{u._count.meshes} modelos · {new Date(u.createdAt).toLocaleDateString()}</span>
                          {u.id !== user.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="btn btn-ghost btn-xs btn-square text-error opacity-50 group-hover:opacity-100 transition-opacity"
                              title="Eliminar usuario y sus modelos"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'meshes' && (
              <>
                {/* Search meshes */}
                <div className="relative mb-4">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o usuario..."
                    value={meshSearch}
                    onChange={(e) => setMeshSearch(e.target.value)}
                    className="input input-bordered input-sm w-full pl-9"
                  />
                </div>

                {filteredMeshes.length === 0 ? (
                  <div className="text-center py-8 text-base-content/40 text-sm">
                    {meshSearch ? `Sin resultados para "${meshSearch}"` : 'No hay modelos en el sistema'}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {filteredMeshes.map(mesh => (
                      <div
                        key={mesh.id}
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-base-200/40 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Box size={16} className="text-base-content/30 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate" title={mesh.originalName}>
                              {mesh.originalName}
                            </p>
                            <p className="text-xs text-base-content/40">
                              {mesh.user?.username || 'desconocido'} · {formatSize(mesh.fileSize)} · {new Date(mesh.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/viewer?id=${mesh.id}`}
                            className="btn btn-ghost btn-xs btn-square"
                            title="Inspeccionar"
                          >
                            <Eye size={15} />
                          </Link>
                          <button
                            onClick={() => handleDeleteMesh(mesh.id)}
                            className="btn btn-ghost btn-xs btn-square text-error"
                            title="Eliminar del sistema"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

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

export default Admin;
