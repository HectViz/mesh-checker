import { Link } from 'react-router-dom';
import { Box, Play, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-sm px-8">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl normal-case font-bold gap-2">
            <Box className="text-primary" />
            MeshChecker
          </Link>
        </div>
        <div className="flex-none gap-4">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">Ir al Panel</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Iniciar Sesión</Link>
              <Link to="/signup" className="btn btn-primary">Regístrate</Link>
            </>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero min-h-[80vh]">
        <div className="hero-content text-center">
          <div className="max-w-xl">
            <h1 className="text-5xl font-extrabold tracking-tight mb-6">
              Inspecciona tus modelos 3D en <span className="text-primary">SEGUNDOS</span>
            </h1>
            <p className="py-6 text-lg text-base-content/80">
              La herramienta perfecta para gamedevs y artistas 3D. Sube tus archivos .glb o .gltf y obten visualización y estadísticas en tiempo récord.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to={user ? "/dashboard" : "/signup"} className="btn btn-primary btn-lg gap-2">
                Empezar Gratis <Play size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 bg-base-100">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Directo en el navegador</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card bg-base-200">
              <div className="card-body items-center text-center">
                <CheckCircle2 className="text-success mb-2" size={32} />
                <h3 className="card-title">Análisis de geometría</h3>
                <p className="text-sm opacity-70">Revisa el polycount y dimensiones al instante.</p>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body items-center text-center">
                <CheckCircle2 className="text-success mb-2" size={32} />
                <h3 className="card-title">Materiales e iluminación</h3>
                <p className="text-sm opacity-70">Inspecciona la lista de materiales y ajusta las luces para revisar geometría.</p>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body items-center text-center">
                <CheckCircle2 className="text-success mb-2" size={32} />
                <h3 className="card-title">Rápido y ligero</h3>
                <p className="text-sm opacity-70">Sin descargas. Renderizado nativo con WebGL.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
