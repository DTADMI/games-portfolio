import * as THREE from "three";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Lights
      ambientLight: THREE.AmbientLightProps;
      directionalLight: THREE.DirectionalLightProps;

      // Geometries
      mesh: THREE.MeshProps;
      planeGeometry: THREE.BufferGeometryNode<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>;
      boxGeometry: THREE.BufferGeometryNode<THREE.BoxGeometry, typeof THREE.BoxGeometry>;
      sphereGeometry: THREE.SphereGeometryProps;

      // Materials
      meshStandardMaterial: THREE.MeshStandardMaterialProps;
      orbitControls: THREE.OrbitControlsProps;
    }
  }
}

export {};
