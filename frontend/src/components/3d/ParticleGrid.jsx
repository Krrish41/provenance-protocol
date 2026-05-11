import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Particles = () => {
  const count = 1500;
  const mesh = useRef();
  
  // Create a BufferGeometry for maximum performance
  const [positions, initialPositions, step] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const initialPos = new Float32Array(count * 3);
    const stepArr = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const x = -50 + Math.random() * 100;
      const y = -50 + Math.random() * 100;
      const z = -50 + Math.random() * 100;
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      
      initialPos[i * 3] = x;
      initialPos[i * 3 + 1] = y;
      initialPos[i * 3 + 2] = z;
      
      stepArr[i] = Math.random() * 100;
    }
    return [pos, initialPos, stepArr];
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * 0.8;
    const { positions } = mesh.current.geometry.attributes;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const s = step[i];
      
      // Efficient sine-based movement
      positions.array[i3] = initialPositions[i3] + Math.sin(time + s) * 3;
      positions.array[i3 + 1] = initialPositions[i3 + 1] + Math.cos(time + s) * 3;
      positions.array[i3 + 2] = initialPositions[i3 + 2] + Math.sin(time * 0.5 + s) * 2;
    }
    
    positions.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.4}
        color="#66FCF1"
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const ParticleGrid = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas 
        camera={{ fov: 75, position: [0, 0, 30] }}
        dpr={[1, 2]} 
        gl={{ 
          antialias: false, 
          powerPreference: "high-performance",
          alpha: true 
        }}
        frameloop="always"
      >
        <Particles />
      </Canvas>
    </div>
  );
};

export default ParticleGrid;
