import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { OceanMesh } from "./OceanMaterial";
import type { OceanParams } from "@/types/ocean-params";
import { useStudio } from "@/state/studio-store";

interface OceanSceneProps {
  params: OceanParams;
}

export function OceanScene({ params }: OceanSceneProps) {
  const setCaptureCanvas = useStudio(s => s.setCaptureCanvas);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setCaptureCanvas(() => () => {
      const c = canvasRef.current;
      if (!c) return null;
      try { return c.toDataURL("image/png"); } catch { return null; }
    });
    return () => setCaptureCanvas(null);
  }, [setCaptureCanvas]);

  return (
    <Canvas
      onCreated={({ gl }) => { canvasRef.current = gl.domElement; }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: true }}
      camera={{ position: [0, 12, 30], fov: 50, near: 0.1, far: 1000 }}
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
