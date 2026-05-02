import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Particles = () => {
  const mesh = useRef();
  const count = 3000;
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      
      // Update time
      t = particle.t += speed / 2;
      
      // Get mouse position mapped to 3D space
      const mouseX = (state.pointer.x * state.viewport.width) / 2;
      const mouseY = (state.pointer.y * state.viewport.height) / 2;
      
      // Calculate base position
      let x = xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10;
      let y = yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10;
      let z = zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10;

      // Mouse attraction/repulsion
      const dx = mouseX - x;
      const dy = mouseY - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 10) {
        x -= dx * 0.05;
        y -= dy * 0.05;
      }

      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#45A29E" transparent opacity={0.6} />
    </instancedMesh>
  );
};

const ParticleGrid = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ fov: 75, position: [0, 0, 30] }}>
        <Particles />
      </Canvas>
    </div>
  );
};

export default ParticleGrid;
