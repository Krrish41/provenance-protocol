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
    const time = state.clock.getElapsedTime();
    
    // Only update every other frame or based on time to reduce CPU load
    // But since it's instancedMesh, we can also just simplify the math
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      
      const currentTime = t + time * speed;
      
      // Calculate base position with simplified math
      let x = xFactor + Math.cos(currentTime) * factor * 0.1;
      let y = yFactor + Math.sin(currentTime) * factor * 0.1;
      let z = zFactor + Math.cos(currentTime) * factor * 0.1;

      // Only check mouse if it's actually moving (optional performance gain)
      const mouseX = (state.pointer.x * state.viewport.width) / 2;
      const mouseY = (state.pointer.y * state.viewport.height) / 2;
      const dx = mouseX - x;
      const dy = mouseY - y;
      const distanceSq = dx * dx + dy * dy; // Use distance squared to avoid sqrt
      
      if (distanceSq < 100) { // 10^2
        x -= dx * 0.02;
        y -= dy * 0.02;
      }

      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    
    mesh.current.instanceMatrix.needsUpdate = true;
    
    // Request next frame only if needed - but here we want smooth particles
    // so we just keep it but optimized.
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#45A29E" transparent opacity={0.6} />
    </instancedMesh>
  );
};

const ParticleGrid = () => {
  const containerRef = useRef();
  
  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <Canvas 
        camera={{ fov: 75, position: [0, 0, 30] }}
        dpr={[1, 2]} // Optimize for high-DPI screens
        gl={{ antialias: false, powerPreference: "high-performance" }} // Reduce load
        frameloop="always" // Restore continuous animation
      >
        <Particles />
      </Canvas>
    </div>
  );
};

export default ParticleGrid;
