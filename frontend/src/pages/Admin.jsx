import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, Box, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [meshes, setMeshes] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div className="p-8 text-center">cargando panel de administración...</div>;
  if (error) return <div className="p-8 text-center text-error">error: {error}</div>;

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-base-100 p-4 rounded-box shadow-sm border border-error/20">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-error">
              <ShieldAlert /> Moderación Global
            </h1>
            <p className="text-sm opacity-70">Panel de control</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft size={16} /> Volver al dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6 bg-base-100">
          <button
            className={`tab gap-2 ${activeTab === 'users' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} /> Usuarios
          </button>
          <button
            className={`tab gap-2 ${activeTab === 'meshes' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('meshes')}
          >
            <Box size={16} /> Modelos 3D
          </button>
        </div>

        {/* Content */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">

            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Modelos Subidos</th>
                      <th>Fecha Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className={u.id === user.id ? 'bg-base-200/50' : ''}>
                        <td className="font-bold">{u.username} {u.id === user.id && '(tú)'}</td>
                        <td>{u.email}</td>
                        <td>
                          <div className={`badge ${u.role === 'ADMIN' ? 'badge-error' : 'badge-ghost'}`}>
                            {u.role.toLowerCase()}
                          </div>
                        </td>
                        <td>{u._count.meshes}</td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          {u.id !== user.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="btn btn-sm btn-outline btn-error"
                            >
                              Eliminar Usuario
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'meshes' && (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Archivo</th>
                      <th>Subido Por</th>
                      <th>Tamaño</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meshes.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-4">No hay modelos en el sistema</td></tr>
                    ) : (
                      meshes.map(mesh => (
                        <tr key={mesh.id}>
                          <td className="font-bold truncate max-w-[200px]" title={mesh.originalName}>
                            {mesh.originalName}
                          </td>
                          <td>
                            <div className="flex flex-col">
                              <span>{mesh.user?.username || 'desconocido'}</span>
                              <span className="text-xs opacity-50">{mesh.user?.email}</span>
                            </div>
                          </td>
                          <td>{formatSize(mesh.fileSize)}</td>
                          <td>{new Date(mesh.uploadDate).toLocaleDateString()}</td>
                          <td>
                            <div className="flex gap-2">
                              <Link to={`/viewer?id=${mesh.id}`} className="btn btn-sm btn-ghost text-primary" title="Inspeccionar">
                                <Eye size={18} />
                              </Link>
                              <button onClick={() => handleDeleteMesh(mesh.id)} className="btn btn-sm btn-ghost text-error" title="Eliminar del sistema">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;
