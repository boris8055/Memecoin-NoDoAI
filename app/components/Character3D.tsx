'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Componente Capybara 3D
function Capybara({ emotion }: { emotion: 'idle' | 'refuse' | 'thinking' | 'win' }) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Animazioni basate su emotion
  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    switch (emotion) {
      case 'idle':
        // Breathing animation
        meshRef.current.scale.y = 1 + Math.sin(time * 2) * 0.05;
        meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
        break;
      
      case 'refuse':
        // Head shake
        meshRef.current.rotation.z = Math.sin(time * 10) * 0.2;
        break;
      
      case 'thinking':
        // Tilt head
        meshRef.current.rotation.x = Math.sin(time * 3) * 0.15;
        break;
      
      case 'win':
        // Jump celebration
        meshRef.current.position.y = Math.abs(Math.sin(time * 5)) * 0.5;
        meshRef.current.rotation.y = time * 2;
        break;
    }

    // Hover effect
    if (hovered) {
      meshRef.current.scale.setScalar(1.1 + Math.sin(time * 5) * 0.05);
    }
  });

  return (
    <group
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Body - Capybara principale */}
      <mesh position={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.6, 1.2, 16, 32]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1, 0.3]} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color="#A0522D" 
          roughness={0.7}
        />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.2, 1.1, 0.7]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.2, 1.1, 0.7]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.9, 0.8]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Ears */}
      <mesh position={[-0.3, 1.4, 0.2]} rotation={[0, 0, -0.3]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.3, 1.4, 0.2]} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Legs */}
      {[-0.3, 0.3].map((x, i) => (
        <group key={i}>
          <mesh position={[x, -0.8, 0.3]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.6, 16]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
          <mesh position={[x, -0.8, -0.3]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.6, 16]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Componente Scene principale
function Scene({ emotion }: { emotion: 'idle' | 'refuse' | 'thinking' | 'win' }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1, 4]} />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1}
        castShadow
      />
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#00f5ff" />
      <pointLight position={[5, 3, -5]} intensity={0.5} color="#ff006e" />

      {/* Capybara */}
      <Capybara emotion={emotion} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial 
          color="#1a0033" 
          roughness={0.8}
        />
      </mesh>

      {/* Grid floor effect */}
      <gridHelper args={[10, 20, '#00f5ff', '#5a189a']} position={[0, -1.19, 0]} />
    </>
  );
}

// Export del componente principale
export default function Character3D({ 
  emotion = 'idle',
  className = ''
}: { 
  emotion?: 'idle' | 'refuse' | 'thinking' | 'win';
  className?: string;
}) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas shadows>
        <Scene emotion={emotion} />
      </Canvas>
    </div>
  );
}
