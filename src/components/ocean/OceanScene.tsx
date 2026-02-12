import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OceanMesh } from "./OceanMaterial";
import type { OceanParams } from "@/types/ocean-params";

interface OceanSceneProps {
  params: OceanParams;
}

export function OceanScene({ params }: OceanSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 12, 30], fov: 50, near: 0.1, far: 1000 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      style={{ background: "#060a12" }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={["#060a12"]} />
      <fog attach="fog" args={["#060a12", 80, 250]} />

      <OceanMesh params={params} />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        maxPolarAngle={Math.PI * 0.485}
        minPolarAngle={Math.PI * 0.05}
        minDistance={3}
        maxDistance={120}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
