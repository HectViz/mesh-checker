import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Basic placeholder components for pages
const Dashboard = () => <div className="p-8"><h1>panel de usuario</h1></div>;
const Viewer = () => <div className="p-8"><h1>visor 3d</h1></div>;
const Admin = () => <div className="p-8"><h1>panel de administración</h1></div>;
const NotFound = () => <div className="p-8"><h1>página no encontrada</h1></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes (Any User) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/viewer" element={<Viewer />} />
          </Route>

          {/* Admin Only Routes */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
