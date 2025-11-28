'use client';

import { useSession } from 'next-auth/react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export default function AdminGeoPage() {
  const { data: session } = useSession();
  const isAdmin = Boolean((session as any)?.user?.roles?.includes?.('ROLE_ADMIN'));

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Forbidden</h1>
          <p className="text-gray-600 dark:text-gray-300">You need admin access to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Admin — User Geo (Stub)</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">This is a stub using react-three-fiber. It will query /api/admin/geo/users and visualize clusters.</p>
      <div className="relative w-full aspect-video max-w-5xl mx-auto rounded border">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 3, 3]} />
          <mesh>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshStandardMaterial color="#111827" wireframe />
          </mesh>
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}
