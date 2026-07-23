import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Environment, ContactShadows } from '@react-three/drei';
import { MeshModel } from '../components/MeshScene';
import {
  ArrowLeft,
  Layers,
  Sun,
  Disc,
  Info,
  MousePointerClick,
  Mouse,
  Move,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const Viewer = () => {
  const [searchParams] = useSearchParams();
  const meshId = searchParams.get('id');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meshData, setMeshData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [wireframe, setWireframe] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(1.5);
  const [showMaterials, setShowMaterials] = useState(false);
  const [analysisStats, setAnalysisStats] = useState(null);

  useEffect(() => {
    if (!meshId) {
      setError('No se especificó un ID de modelo.');
      setLoading(false);
      return;
    }

    const fetchMeshInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const idNum = parseInt(meshId);

        // First try the user's own meshes
        const res = await fetch('http://localhost:5000/api/mesh/my-meshes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok) {
          const found = data.meshes.find(m => m.id === idNum);
          if (found) {
            setMeshData(found);
            return;
          }
        }

        // If not found and user is admin, try admin endpoint
        if (user?.role === 'ADMIN') {
          const adminRes = await fetch('http://localhost:5000/api/admin/meshes', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const adminData = await adminRes.json();

          if (adminRes.ok) {
            const found = adminData.meshes.find(m => m.id === idNum);
            if (found) {
              setMeshData(found);
              return;
            }
          }
        }

        setError('Modelo no encontrado o no tienes permiso para verlo.');
      } catch (err) {
        console.error(err);
        setError('Error de conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeshInfo();
  }, [meshId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-300 text-base-content">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="font-medium text-sm">Cargando modelo 3D...</p>
        </div>
      </div>
    );
  }

  if (error || !meshData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-300 p-4">
        <div className="bg-base-100 border border-base-content/10 rounded-box max-w-md w-full shadow-sm">
          <div className="p-6 text-center">
            <h2 className="font-bold text-error mb-2">Error</h2>
            <p className="text-sm text-base-content/60 mb-4">{error || 'No se pudo cargar el archivo.'}</p>
            <Link to="/dashboard" className="btn btn-primary btn-sm gap-2">
              <ArrowLeft size={16} /> Volver al panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const modelUrl = `http://localhost:5000/uploads/${meshData.filename}`;

  const sliderPercent = ((lightIntensity - 0.2) / (4.0 - 0.2)) * 100;

  return (
    <div className="w-screen h-screen overflow-hidden flex select-none">

      <div className="w-72 shrink-0 bg-base-100 border-r border-base-content/10 flex flex-col h-full overflow-y-auto">

        <div className="p-4 border-b border-base-content/10">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-base-content transition-colors mb-3"
          >
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <h1 className="font-semibold text-base truncate" title={meshData.originalName}>
            {meshData.originalName}
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            {(meshData.fileSize / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>

        <div className="p-4 border-b border-base-content/10">
          <h2 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Info size={12} /> Geometría
          </h2>

          {analysisStats ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-base-200/60 p-2.5 rounded-lg">
                <span className="block text-base-content/50 text-xs mb-0.5">Triángulos</span>
                <span className="font-bold text-base text-base-content">{analysisStats.triangles.toLocaleString()}</span>
              </div>
              <div className="bg-base-200/60 p-2.5 rounded-lg">
                <span className="block text-base-content/50 text-xs mb-0.5">Vértices</span>
                <span className="font-bold text-base text-base-content">{analysisStats.vertices.toLocaleString()}</span>
              </div>
              <div className="col-span-2 bg-base-200/60 p-2.5 rounded-lg">
                <span className="block text-base-content/50 text-xs mb-0.5">Dimensiones (X × Y × Z)</span>
                <span className="font-mono font-bold text-base text-base-content">
                  {analysisStats.dimensions.x}m × {analysisStats.dimensions.y}m × {analysisStats.dimensions.z}m
                </span>
              </div>
            </div>
          ) : (
            <div className="py-3 text-center text-base-content/50 text-sm">Calculando...</div>
          )}
        </div>

        <div className="p-4 border-b border-base-content/10">
          <h2 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Layers size={12} /> Herramientas
          </h2>

          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-base-content/80 flex items-center gap-2">
                <Layers size={14} className="text-base-content/50" /> Wireframe
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={wireframe}
                onChange={() => setWireframe(!wireframe)}
              />
            </label>

            <div className="mt-1">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-base-content/80 flex items-center gap-2">
                  <Sun size={14} className="text-base-content/50" /> Iluminación
                </span>
                <span className="text-xs font-mono text-base-content/60">{lightIntensity.toFixed(1)}x</span>
              </div>
              <div className="relative h-1.5 bg-base-300 rounded-full">
                <div
                  className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
                  style={{ width: `${sliderPercent}%` }}
                />
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.1"
                  value={lightIntensity}
                  onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-base-100 pointer-events-none transition-all"
                  style={{ left: `calc(${sliderPercent}% - 6px)` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1">
          <button
            onClick={() => setShowMaterials(!showMaterials)}
            className="w-full text-left text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-3 flex items-center gap-1.5 hover:text-base-content/80 transition-colors"
          >
            {showMaterials ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <Disc size={12} />
            Materiales ({analysisStats?.materials?.length || 0})
          </button>

          {showMaterials && analysisStats?.materials && (
            <div className="flex flex-col gap-1.5">
              {analysisStats.materials.map((mat, index) => (
                <div key={mat.id || index} className="flex items-center justify-between bg-base-200/60 p-2.5 rounded-lg">
                  <div className="flex items-center gap-2 truncate">
                    {mat.color ? (
                      <span className="w-3 h-3 rounded-full border border-base-content/20 shrink-0" style={{ backgroundColor: mat.color }} />
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-base-content/20 shrink-0" />
                    )}
                    <span className="truncate text-sm text-base-content/80" title={mat.name}>{mat.name}</span>
                  </div>
                  <span className="text-xs text-base-content/50 font-mono ml-2">{mat.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-base-content/10 text-xs text-base-content/60 flex flex-col gap-1.5">
          <span className="flex items-center gap-2"><MousePointerClick size={12} /> Click para rotar</span>
          <span className="flex items-center gap-2"><Mouse size={12} /> Scroll para zoom</span>
          <span className="flex items-center gap-2"><Move size={12} /> Shift + Click para pan</span>
        </div>
      </div>

      <div className="flex-1 relative bg-gradient-to-b from-base-300 to-base-200">
        <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
          <ambientLight intensity={lightIntensity * 0.5} />
          <directionalLight position={[10, 10, 5]} intensity={lightIntensity} castShadow />
          <directionalLight position={[-10, -10, -5]} intensity={lightIntensity * 0.4} />

          <Suspense fallback={null}>
            <Center top>
              <MeshModel
                url={modelUrl}
                wireframe={wireframe}
                onAnalysisComplete={setAnalysisStats}
              />
            </Center>
            <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={10} blur={1.5} far={10} />
            <Environment preset="city" />
          </Suspense>

          <OrbitControls makeDefault enableDamping dampingFactor={0.05} minDistance={0.5} maxDistance={50} />
        </Canvas>
      </div>
    </div>
  );
};

export default Viewer;
