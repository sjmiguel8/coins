"use client";

import { useRef, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function CameraControls() {
  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [previousMousePosition, setPreviousMousePosition] = useState({
    x: 0,
    y: 0,
  });

  const PI_2 = Math.PI / 2;

  const onMouseDown = (event: MouseEvent) => {
    setIsDragging(true);
    setPreviousMousePosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const onMouseUp = (event: MouseEvent) => {
    setIsDragging(false);
  };

  const onMouseMove = (event: MouseEvent) => {
    if (!isDragging) return;

    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y,
    };

    const sensitivity = 0.005; // Adjust sensitivity here

    camera.rotation.y -= deltaMove.x * sensitivity;
    camera.rotation.x -= deltaMove.y * sensitivity;

    camera.rotation.x = Math.max(-PI_2, Math.min(PI_2, camera.rotation.x));

    setPreviousMousePosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  // Touch event handlers
  const onTouchStart = (event: TouchEvent) => {
    setIsDragging(true);
    setPreviousMousePosition({
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    });
  };

  const onTouchEnd = (event: TouchEvent) => {
    setIsDragging(false);
  };

  const onTouchMove = (event: TouchEvent) => {
    if (!isDragging) return;

    const deltaMove = {
      x: event.touches[0].clientX - previousMousePosition.x,
      y: event.touches[0].clientY - previousMousePosition.y,
    };

    const sensitivity = 0.005; // Adjust sensitivity here

    camera.rotation.y -= deltaMove.x * sensitivity;
    camera.rotation.x -= deltaMove.y * sensitivity;
    camera.rotation.x = Math.max(-PI_2, Math.min(PI_2, camera.rotation.x));

    setPreviousMousePosition({
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    });
  };

  useEffect(() => {
    gl.domElement.addEventListener('mousedown', onMouseDown);
    gl.domElement.addEventListener('mouseup', onMouseUp);
    gl.domElement.addEventListener('mouseout', onMouseUp);
    gl.domElement.addEventListener('mousemove', onMouseMove);

    // Add touch event listeners
    gl.domElement.addEventListener('touchstart', onTouchStart);
    gl.domElement.addEventListener('touchend', onTouchEnd);
    gl.domElement.addEventListener('touchcancel', onTouchEnd);
    gl.domElement.addEventListener('touchmove', onTouchMove);

    return () => {
      gl.domElement.removeEventListener('mousedown', onMouseDown);
      gl.domElement.removeEventListener('mouseup', onMouseUp);
      gl.domElement.removeEventListener('mouseout', onMouseUp);
      gl.domElement.removeEventListener('mousemove', onMouseMove);

      // Remove touch event listeners
      gl.domElement.removeEventListener('touchstart', onTouchStart);
      gl.domElement.removeEventListener('touchend', onTouchEnd);
      gl.domElement.removeEventListener('touchcancel', onTouchEnd);
      gl.domElement.removeEventListener('touchmove', onTouchMove);
    };
  }, [isDragging, previousMousePosition]);

  return null; // This component doesn't render anything
}
