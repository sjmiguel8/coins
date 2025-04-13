"use client";

import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import '@/utils/extend'; // Add this import to ensure extension is loaded

export default function CameraControls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef.current) {
      // Set initial target
      controlsRef.current.target.set(0, 1, 0);
      controlsRef.current.update();
    }
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      makeDefault
      domElement={gl.domElement}
      minAzimuthAngle={-Infinity}
      maxAzimuthAngle={Infinity}
      minPolarAngle={Math.PI * 0.1}
      maxPolarAngle={Math.PI * 0.9}
      enablePan={false}
      enableZoom={true}
      minDistance={3}
      maxDistance={20}
    />
  );
}
