"use client";

import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

// Dynamically import the ThreeScene component with no SSR
const ThreeScene = dynamic(() => import("@/components/admin/ThreeScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video max-w-5xl mx-auto rounded border bg-gray-900 flex items-center justify-center">
      <p className="text-white">Loading 3D viewer...</p>
    </div>
  ),
});

interface SessionUser {
  user?: {
    roles?: string[];
  };
}

export default function AdminGeoPage() {
  const { data: session } = useSession() as { data: SessionUser | null };
  const isAdmin = session?.user?.roles?.includes("ROLE_ADMIN") ?? false;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Forbidden</h1>
          <p className="text-gray-600 dark:text-gray-300">
            You need admin access to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Admin — User Geo (Stub)</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        This is a stub using react-three-fiber. It will query /api/admin/geo/users and visualize
        clusters.
      </p>
      <ThreeScene />
    </div>
  );
}
