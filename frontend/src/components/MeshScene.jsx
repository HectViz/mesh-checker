import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function MeshModel({ url, wireframe, onAnalysisComplete }) {
  const { scene } = useGLTF(url);

  // Analyze mesh geometry, polycount, bounding box, materials
  const analysis = useMemo(() => {
    let triangles = 0;
    let vertices = 0;
    const materialsSet = new Map();
    const box = new THREE.Box3();

    if (scene) {
      box.setFromObject(scene);

      scene.traverse((child) => {
        if (child.isMesh) {
          // Geometry stats
          const geometry = child.geometry;
          if (geometry) {
            if (geometry.index) {
              triangles += geometry.index.count / 3;
            } else if (geometry.attributes.position) {
              triangles += geometry.attributes.position.count / 3;
            }

            if (geometry.attributes.position) {
              vertices += geometry.attributes.position.count;
            }
          }

          // Material stats
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((mat) => {
            if (mat && !materialsSet.has(mat.name || mat.uuid)) {
              materialsSet.set(mat.name || mat.uuid, {
                id: mat.uuid,
                name: mat.name || 'Sin nombre',
                type: mat.type,
                color: mat.color ? `#${mat.color.getHexString()}` : null,
              });
            }
          });
        }
      });
    }

    const size = new THREE.Vector3();
    box.getSize(size);

    return {
      triangles: Math.round(triangles),
      vertices: Math.round(vertices),
      dimensions: {
        x: Number(size.x.toFixed(2)),
        y: Number(size.y.toFixed(2)),
        z: Number(size.z.toFixed(2)),
      },
      materials: Array.from(materialsSet.values()),
    };
  }, [scene]);

  // Notify parent component of stats
  useEffect(() => {
    if (onAnalysisComplete) {
      onAnalysisComplete(analysis);
    }
  }, [analysis, onAnalysisComplete]);

  // Handle wireframe toggle
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((mat) => {
            mat.wireframe = wireframe;
          });
        }
      });
    }
  }, [scene, wireframe]);

  return <primitive object={scene} />;
}
