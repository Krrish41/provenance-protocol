import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Particles = ({ count = 800 }) => {
  const points = useRef();

  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 100;
      temp[i * 3 + 1] = (Math.random() - 0.5) * 100;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    points.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    points.current.rotation.x = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        color="#66FCF1"
        transparent
        opacity={0.4}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const ParticleGrid = () => {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
      <Canvas 
        camera={{ position: [0, 0, 50], fov: 60 }}
        dpr={1} // CRITICAL: Force 1x resolution to save GPU
        gl={{ 
          antialias: false, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Particles count={800} />
      </Canvas>
    </div>
  );
};

export default ParticleGrid;
