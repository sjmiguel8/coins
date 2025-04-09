"use client"

import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useState, useRef, useEffect } from "react";
import { RigidBody } from "@react-three/rapier";

export default function NavigationSystem() {
  const { scene, camera, gl } = useThree();
  const [targetMarker, setTargetMarker] = useState<THREE.Mesh | null>(null);
  const markerRef = useRef<THREE.Mesh>(null);
  const planeRef = useRef<THREE.Mesh>(null);
  const [useClickToMove, setUseClickToMove] = useState(false);

  useEffect(() => {
    // Listen for toggle controls event
    const handleToggleControls = (event: CustomEvent<{ useVirtualJoystick: boolean, useClickToMove: boolean }>) => {
      setUseClickToMove(event.detail.useClickToMove);
    };
    window.addEventListener('toggle-controls', handleToggleControls as EventListener);

    return () => {
      window.removeEventListener('toggle-controls', handleToggleControls as EventListener);
    };
  }, []);
  
  // Create an invisible plane for raycast to detect clicks
  useEffect(() => {
    // Create marker mesh (visible indicator of where player will move)
    const markerGeometry = new THREE.CylinderGeometry(0.5, 0.1, 0.1, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.rotation.x = Math.PI / 2;
    marker.visible = false;
    
    scene.add(marker);
    setTargetMarker(marker);
    
    // Handle click events on the canvas
    const handleClick = (event: MouseEvent) => {
      if (!useClickToMove) return; // Disable click-to-move if not enabled

      // Normalize mouse coordinates
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;
      
      // Raycasting to find the clicked position
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      
      // Only detect clicks on the ground
      const groundObjects = scene.children.filter(child => 
        child.userData && (child.userData.isGround || child.userData.isFloor));
        
      // If no explicit ground objects, we'll use a horizontal plane at y=0
      if (groundObjects.length === 0) {
        // Create a plane at y=0 for raycasting
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const targetPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, targetPoint);
        
        if (targetPoint) {
          marker.position.copy(targetPoint);
          marker.position.y = 0.1; // Slightly above ground to avoid z-fighting
          marker.visible = true;
          
          // Dispatch custom event for player navigation
          window.dispatchEvent(new CustomEvent('player-navigation', {
            detail: {
              targetPosition: targetPoint,
              enabled: true
            }
          }));
          
          // Hide marker after a delay
          setTimeout(() => {
            if (marker) marker.visible = false;
          }, 2000);
        }
      } else {
        // Use explicit ground objects for raycasting
        const intersects = raycaster.intersectObjects(groundObjects, true);
        
        if (intersects.length > 0) {
          const intersect = intersects[0];
          marker.position.copy(intersect.point);
          marker.position.y += 0.1; // Slightly above ground
          marker.visible = true;
          
          // Dispatch custom event for player navigation
          window.dispatchEvent(new CustomEvent('player-navigation', {
            detail: {
              targetPosition: intersect.point.clone(),
              enabled: true
            }
          }));
          
          // Hide marker after a delay
          setTimeout(() => {
            if (marker) marker.visible = false;
          }, 2000);
        }
      }
    };
    
    gl.domElement.addEventListener('click', handleClick);
    
    return () => {
      gl.domElement.removeEventListener('click', handleClick);
      scene.remove(marker);
    };
  }, [scene, camera, gl, useClickToMove]);
  
  // Animation for target marker
  useFrame(({ clock }) => {
    if (targetMarker && targetMarker.visible) {
      targetMarker.scale.x = 1 + Math.sin(clock.getElapsedTime() * 5) * 0.1;
      targetMarker.scale.z = 1 + Math.sin(clock.getElapsedTime() * 5) * 0.1;
      targetMarker.rotation.y += 0.03;
    }
  });
  
  return null; // This component doesn't render anything directly
}
