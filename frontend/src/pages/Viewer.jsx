import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Environment, ContactShadows } from '@react-three/drei';
import { MeshModel } from '../components/MeshScene';
import { 
  ArrowLeft, 
  Layers, 
  Sun, 
  Box as BoxIcon, 
  Maximize2, 
  Disc, 
  Eye, 
  Info 
} from 'lucide-react';

const Viewer = () => {
  const [searchParams] = useSearchParams();
  const meshId = searchParams.get('id');
  const navigate = useNavigate();

  const [meshData, setMeshData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Viewer State Controls
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
        const res = await fetch('http://localhost:5000/api/mesh/my-meshes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          const found = data.meshes.find(m => m.id === parseInt(meshId));
          if (found) {
            setMeshData(found);
          } else {
            setError('Modelo no encontrado o no tienes permiso para verlo.');
          }
        } else {
          setError(data.error || 'Error al obtener la información.');
        }
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
          <p className="font-semibold">Cargando modelo 3D...</p>
        </div>
      </div>
    );
  }

  if (error || !meshData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-300 p-4">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body text-center">
            <h2 className="card-title justify-center text-error">Error</h2>
            <p className="my-4">{error || 'No se pudo cargar el archivo.'}</p>
            <Link to="/dashboard" className="btn btn-primary gap-2">
              <ArrowLeft size={18} /> Volver al panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const modelUrl = `http://localhost:5000/uploads/${meshData.filename}`;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-base-300 to-base-100 select-none">
      
      {/* Top Navbar HUD */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn btn-circle btn-neutral shadow-md" 
            title="Volver al panel"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="bg-base-100/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-base-content/10">
            <h1 className="font-bold text-sm md:text-base text-base-content truncate max-w-[200px] md:max-w-xs">
              {meshData.originalName}
            </h1>
            <p className="text-xs text-base-content/60">
              {(meshData.fileSize / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>

        {/* Floating Quick Action Bar */}
        <div className="flex gap-2 pointer-events-auto bg-base-100/90 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-base-content/10">
          <button 
            onClick={() => setWireframe(!wireframe)}
            className={`btn btn-sm ${wireframe ? 'btn-primary' : 'btn-ghost'}`}
            title="Conmutar Wireframe"
          >
            <Layers size={18} />
            <span className="hidden md:inline">Wireframe</span>
          </button>

          <button 
            onClick={() => setShowMaterials(!showMaterials)}
            className={`btn btn-sm ${showMaterials ? 'btn-primary' : 'btn-ghost'}`}
            title="Lista de Materiales"
          >
            <Disc size={18} />
            <span className="hidden md:inline">Materiales</span>
          </button>
        </div>
      </div>

      {/* Sidebar Analysis Overlay (Left Bottom) */}
      <div className="absolute bottom-4 left-4 z-10 max-w-xs w-full bg-base-100/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-base-content/10 text-xs flex flex-col gap-3">
        <div className="flex items-center justify-between font-bold text-sm border-b border-base-content/10 pb-2">
          <span className="flex items-center gap-1.5"><Info size={16} className="text-primary" /> Estadísticas del Mesh</span>
        </div>

        {analysisStats ? (
          <div className="grid grid-cols-2 gap-2 text-base-content/80">
            <div className="bg-base-200/60 p-2 rounded-lg">
              <span className="block text-base-content/50">Triángulos</span>
              <span className="font-bold text-sm text-base-content">{analysisStats.triangles.toLocaleString()}</span>
            </div>

            <div className="bg-base-200/60 p-2 rounded-lg">
              <span className="block text-base-content/50">Vértices</span>
              <span className="font-bold text-sm text-base-content">{analysisStats.vertices.toLocaleString()}</span>
            </div>

            <div className="col-span-2 bg-base-200/60 p-2 rounded-lg">
              <span className="block text-base-content/50 mb-1">Dimensiones (X × Y × Z)</span>
              <span className="font-mono font-bold text-xs text-primary">
                {analysisStats.dimensions.x}m × {analysisStats.dimensions.y}m × {analysisStats.dimensions.z}m
              </span>
            </div>
          </div>
        ) : (
          <div className="py-2 text-center text-base-content/50">Calculando geometría...</div>
        )}

        {/* Lighting Control Slider */}
        <div className="mt-1 pt-2 border-t border-base-content/10 flex flex-col gap-1">
          <div className="flex justify-between items-center text-base-content/70">
            <span className="flex items-center gap-1"><Sun size={14} /> Iluminación</span>
            <span className="font-mono">{lightIntensity.toFixed(1)}x</span>
          </div>
          <input 
            type="range" 
            min="0.2" 
            max="4.0" 
            step="0.1" 
            value={lightIntensity} 
            onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
            className="range range-xs range-primary" 
          />
        </div>
      </div>

      {/* Materials Overlay (Right Side) */}
      {showMaterials && (
        <div className="absolute bottom-4 right-4 z-10 max-w-xs w-full bg-base-100/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-base-content/10 text-xs">
          <div className="flex justify-between items-center font-bold text-sm border-b border-base-content/10 pb-2 mb-3">
            <span className="flex items-center gap-1.5"><Disc size={16} className="text-secondary" /> Materiales ({analysisStats?.materials?.length || 0})</span>
            <button onClick={() => setShowMaterials(false)} className="btn btn-ghost btn-xs btn-circle">✕</button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {analysisStats?.materials?.map((mat, index) => (
              <div key={mat.id || index} className="flex items-center justify-between bg-base-200/60 p-2 rounded-lg">
                <div className="flex items-center gap-2 truncate">
                  {mat.color ? (
                    <span className="w-3.5 h-3.5 rounded-full border border-base-content/20 shrink-0" style={{ backgroundColor: mat.color }} />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full bg-base-content/20 shrink-0" />
                  )}
                  <span className="truncate font-medium" title={mat.name}>{mat.name}</span>
                </div>
                <span className="text-[10px] opacity-50 font-mono">{mat.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Three.js R3F Canvas */}
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
  );
};

export default Viewer;
