import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { OceanMesh } from "./OceanMaterial";
import type { OceanParams } from "@/types/ocean-params";

interface OceanSceneProps {
  params: OceanParams;
}

export function OceanScene({ params }: OceanSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 8, 20], fov: 55, near: 0.1, far: 500 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#0a0e17" }}
    >
      <color attach="background" args={["#0a0e17"]} />
      <fog attach="fog" args={["#0a0e17", 60, 150]} />
      
      <ambientLight intensity={params.lighting.ambientIntensity} />
      <directionalLight
        position={[
          Math.cos((params.lighting.sunElevation * Math.PI) / 180) * Math.sin((params.lighting.sunAzimuth * Math.PI) / 180) * 50,
          Math.sin((params.lighting.sunElevation * Math.PI) / 180) * 50,
          Math.cos((params.lighting.sunElevation * Math.PI) / 180) * Math.cos((params.lighting.sunAzimuth * Math.PI) / 180) * 50,
        ]}
        intensity={params.lighting.sunIntensity}
        color="#fff5e0"
      />
      
      <Stars radius={100} depth={50} count={1500} factor={4} fade speed={0.5} />
      
      <OceanMesh params={params} />
      
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        maxPolarAngle={Math.PI * 0.48}
        minDistance={5}
        maxDistance={80}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
