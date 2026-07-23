import { Link, useNavigate } from 'react-router-dom';
import { Box, ArrowRight, Triangle, Palette, Zap, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-200 p-6 md:p-8 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1">

        {/* Header */}
        <div className="flex justify-between items-center mb-10 bg-base-100 p-4 rounded-box border border-base-content/10 shadow-sm">
          <div className="flex items-center gap-2">
            <Box size={22} className="text-primary" />
            <span className="text-lg font-bold">MeshChecker</span>
          </div>
          <div className="flex gap-2 items-center">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="btn btn-ghost btn-sm">Admin</Link>
                )}
                <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-ghost btn-sm text-error">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Iniciar Sesión</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Regístrate</Link>
              </>
            )}
          </div>
        </div>

        {/* Hero */}
        <div className="py-16 md:py-24 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Inspecciona tus modelos 3D en <span className="text-primary">segundos</span>
          </h1>
          <p className="text-base text-base-content/60 mb-8 leading-relaxed">
            La herramienta para gamedevs y artistas 3D. Sube tus archivos .glb o .gltf y obtén visualización y estadísticas al instante.
          </p>
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="btn btn-primary gap-2"
          >
            Empezar Gratis <ArrowRight size={18} />
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="bg-base-100 border border-base-content/10 rounded-box p-6 shadow-sm">
            <Triangle size={20} className="text-primary mb-3" />
            <h3 className="font-semibold mb-1">Análisis de geometría</h3>
            <p className="text-sm text-base-content/50">Revisa el polycount y dimensiones al instante.</p>
          </div>
          <div className="bg-base-100 border border-base-content/10 rounded-box p-6 shadow-sm">
            <Palette size={20} className="text-primary mb-3" />
            <h3 className="font-semibold mb-1">Materiales e iluminación</h3>
            <p className="text-sm text-base-content/50">Inspecciona la lista de materiales y ajusta las luces.</p>
          </div>
          <div className="bg-base-100 border border-base-content/10 rounded-box p-6 shadow-sm">
            <Zap size={20} className="text-primary mb-3" />
            <h3 className="font-semibold mb-1">Rápido y ligero</h3>
            <p className="text-sm text-base-content/50">Sin descargas. Renderizado nativo con WebGL.</p>
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

export default Home;
