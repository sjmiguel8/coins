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
    event.preventDefault(); // Prevent default behavior
    setIsDragging(true);
    setPreviousMousePosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const onMouseUp = (event: MouseEvent) => {
    event.preventDefault(); // Prevent default behavior
    setIsDragging(false);
  };

  const onMouseMove = (event: MouseEvent) => {
    event.preventDefault(); // Prevent default behavior
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
    event.preventDefault(); // Prevent default behavior
    setIsDragging(true);
    setPreviousMousePosition({
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    });
  };

  const onTouchEnd = (event: TouchEvent) => {
    event.preventDefault(); // Prevent default behavior
    setIsDragging(false);
  };

  const onTouchMove = (event: TouchEvent) => {
    event.preventDefault(); // Prevent default behavior
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
    const element = gl.domElement; // Store the element in a variable

    const handleMouseDown = (e: MouseEvent) => onMouseDown(e);
    const handleMouseUp = (e: MouseEvent) => onMouseUp(e);
    const handleMouseMove = (e: MouseEvent) => onMouseMove(e);
    const handleTouchStart = (e: TouchEvent) => onTouchStart(e);
    const handleTouchEnd = (e: TouchEvent) => onTouchEnd(e);
    const handleTouchMove = (e: TouchEvent) => onTouchMove(e);

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mouseout', handleMouseUp);
    element.addEventListener('mousemove', handleMouseMove);

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);
    element.addEventListener('touchmove', handleTouchMove);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mouseout', handleMouseUp);
      element.removeEventListener('mousemove', handleMouseMove);

      // Remove touch event listeners
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gl, isDragging, previousMousePosition]); // Add gl to the dependency array

  return null; // This component doesn't render anything
}
