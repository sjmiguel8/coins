"use client";

import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

export default function CameraControls() {
  const { camera, gl } = useThree();

  useEffect(() => {
    // Ensure OrbitControls updates correctly in a React environment
    camera.lookAt(0, 0, 0); // Set initial look at point
  }, [camera]);

  return (
    <OrbitControls enableDamping makeDefault domElement={gl.domElement} />
  );
}
