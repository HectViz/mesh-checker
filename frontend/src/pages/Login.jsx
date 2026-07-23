import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'error al iniciar sesión');
      }

      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 relative p-4">
      <Link to="/" className="btn btn-ghost btn-sm absolute top-4 left-4 gap-2">
        <ArrowLeft size={16} /> Inicio
      </Link>
      <div className="w-full max-w-sm bg-base-100 border border-base-content/10 rounded-box shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-bold text-center flex items-center justify-center gap-2 mb-6">
            <LogIn size={20} />
            Iniciar Sesión
          </h2>

          {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Username</span>
              </label>
              <input
                type="text"
                placeholder="Ingresa tu usuario"
                className="input input-bordered"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Contraseña</span>
              </label>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-control mt-2">
              <button type="submit" className="btn btn-primary">Ingresar</button>
            </div>
          </form>

          <div className="divider text-xs">o</div>

          <div className="text-center text-sm">
            ¿No tienes cuenta? <Link to="/signup" className="link link-primary">Regístrate aquí</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
