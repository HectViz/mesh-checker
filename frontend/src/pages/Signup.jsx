import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      setSuccess('Usuario creado. Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 relative">
      <Link to="/" className="btn btn-ghost btn-sm absolute top-4 left-4 gap-2">
        <ArrowLeft size={16} /> Inicio
      </Link>
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center gap-2 text-2xl font-bold mb-4">
            <UserPlus size={24} />
            Regístrate
          </h2>

          {error && <div className="alert alert-error text-sm">{error}</div>}
          {success && <div className="alert alert-success text-sm text-white">{success}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Correo electrónico</span>
              </label>
              <input
                type="email"
                placeholder="Ingresa tu correo"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Nombre de usuario</span>
              </label>
              <input
                type="text"
                placeholder="Elige un usuario"
                className="input input-bordered"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Contraseña</span>
              </label>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label className="label">
                <span className="label-text-alt text-base-content/50">Mín. 6 caracteres, letras y números</span>
              </label>
            </div>

            <div className="form-control mt-4">
              <button type="submit" className="btn btn-primary">Crear cuenta</button>
            </div>
          </form>

          <div className="divider text-xs">o</div>

          <div className="text-center text-sm">
            ¿Ya tienes cuenta? <Link to="/login" className="link link-primary">Inicia sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
