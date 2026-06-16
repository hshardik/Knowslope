import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

interface MousePosition {
  x: number;
  y: number;
}

import { useMemo } from 'react';

// Vertex highlights at cage corners
const CageVertices = ({ scrollProgress, cageRadius }: { scrollProgress: number; cageRadius: number }) => {
  const vertices = useMemo(() => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const scale = cageRadius / Math.sqrt(1 + phi * phi);
    
    return [
      [0, phi * scale, scale],
      [0, phi * scale, -scale],
      [0, -phi * scale, scale],
      [0, -phi * scale, -scale],
      [scale, 0, phi * scale],
      [-scale, 0, phi * scale],
      [scale, 0, -phi * scale],
      [-scale, 0, -phi * scale],
      [phi * scale, scale, 0],
      [phi * scale, -scale, 0],
      [-phi * scale, scale, 0],
      [-phi * scale, -scale, 0],
    ] as [number, number, number][];
  }, [cageRadius]);

  const color = new THREE.Color().lerpColors(
    new THREE.Color('#C4B5FD'), // Light violet
    new THREE.Color('#67E8F9'), // Light cyan
    scrollProgress
  );

  return (
    <group>
      {vertices.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
};

// Spherical wireframe cage
const HexagonalCage = ({ scrollProgress, mouse }: { scrollProgress: number; mouse: MousePosition }) => {
  const cageRef = useRef<THREE.Group>(null);
  const cageRadius = 2.5;

  useFrame((state) => {
    if (cageRef.current) {
      cageRef.current.rotation.y = state.clock.elapsedTime * 0.04 + mouse.x * 0.1;
      cageRef.current.rotation.x = state.clock.elapsedTime * 0.02 + mouse.y * 0.06;
    }
  });

  // Darker wireframe color
  const wireColor = new THREE.Color().lerpColors(
    new THREE.Color('#4C1D95'), // Dark violet
    new THREE.Color('#164E63'), // Dark cyan
    scrollProgress
  );

  return (
    <group ref={cageRef}>
      {/* Icosahedron wireframe cage - darker lines */}
      <mesh>
        <icosahedronGeometry args={[cageRadius, 0]} />
        <meshBasicMaterial
          color={wireColor}
          wireframe
          transparent
          opacity={0.85}
        />
      </mesh>
      
      {/* Highlighted vertices */}
      <CageVertices scrollProgress={scrollProgress} cageRadius={cageRadius} />
    </group>
  );
};

const Scene = ({ scrollProgress, mouse }: { scrollProgress: number; mouse: MousePosition }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06B6D4" />
      
      <HexagonalCage scrollProgress={scrollProgress} mouse={mouse} />
      
      {/* Post-processing effects - reduced bloom to prevent washout */}
      <EffectComposer>
        <Bloom
          intensity={0.4 + scrollProgress * 0.3}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.7}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
};

export const Hero3DElement = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouse, setMouse] = useState<MousePosition>({ x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Delay visibility to allow 3D scene to stabilize
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 150);

    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate progress based on element position
        // 0 when element is at top of viewport, 1 when it's scrolled past
        const progress = Math.max(0, Math.min(1, -rect.top / windowHeight + 0.5));
        setScrollProgress(progress);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMouse({ x, y });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    handleScroll(); // Initial call
    
    return () => {
      clearTimeout(readyTimer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none transition-opacity duration-500 ease-out"
      style={{ 
        zIndex: 0,
        opacity: isReady ? 0.6 : 0,
      }}
    >
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
          dpr={[1, 2]}
        >
          <Scene scrollProgress={scrollProgress} mouse={mouse} />
        </Canvas>
      </Suspense>
    </div>
  );
};
