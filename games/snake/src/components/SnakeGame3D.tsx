"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import React from "react";

// Type assertion for OrbitControls to avoid type issues
const OrbitControlsComponent = OrbitControls as React.ComponentType<any>;

/**
 * Minimal 3D stub for Snake — shares no logic yet, just a smoke-render scene.
 * This is feature-gated by `snake_3d_mode` on the page and intended for premium users later.
 */
export function SnakeGame3D() {
  return (
    <div className="relative w-full aspect-video max-w-4xl mx-auto rounded-lg overflow-hidden">
      <Canvas camera={{ position: [3, 3, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        {/* ground plane */}
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.51, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* placeholder snake head cube */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        {/* a few pellets */}
        {[
          [-2, 0.5, -1],
          [1, 0.5, 2],
          [2, 0.5, -3],
        ].map((p, i) => (
          <mesh key={i} position={p as any}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
        ))}
        <OrbitControlsComponent />
      </Canvas>
    </div>
  );
}
