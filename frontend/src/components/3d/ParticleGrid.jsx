import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Particles = ({ count = 500 }) => {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      const speed = 0.1 + Math.random() * 0.5;
      temp.push({ x, y, z, speed, offset: Math.random() * 100 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    particles.forEach((p, i) => {
      const { x, y, z, speed, offset } = p;
      // Smooth floating movement
      const xPos = x + Math.sin(time * speed + offset) * 2;
      const yPos = y + Math.cos(time * speed + offset) * 2;
      const zPos = z + Math.sin(time * speed * 0.5 + offset) * 2;
      
      dummy.position.set(xPos, yPos, zPos);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      {/* Icosahedron with 0 detail is only 20 faces - ultra efficient for "sphere" look */}
      <icosahedronGeometry args={[0.15, 0]} />
      <meshBasicMaterial 
        color="#66FCF1" 
        transparent 
        opacity={0.6} 
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
};

const ParticleGrid = () => {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
      <Canvas 
        camera={{ position: [0, 0, 50], fov: 60 }}
        dpr={1} // Keep dpr low to save GPU
        gl={{ 
          antialias: false, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Particles count={500} />
      </Canvas>
    </div>
  );
};

export default ParticleGrid;
