"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls, useGLTF } from "@react-three/drei";
import { RigidBody, CapsuleCollider, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useGameContext } from "./game-context";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';

enum Controls {
  forward = "forward",
  backward = "backward",
  left = "left",
  right = "right",
  jump = "jump",
  scene1 = "scene1",
  scene2 = "scene2",
  scene3 = "scene3",
}

interface PlayerProps {
  startPosition?: [number, number, number];
}

// Define a global event to handle navigation requests from outside components
export type NavigationEvent = {
  targetPosition: THREE.Vector3;
  enabled: boolean;
}

export default function Player({ startPosition = [0, 1.5, 0] }: PlayerProps) {
  const playerRef = useRef<RapierRigidBody>(null);
  const playerGroupRef = useRef<THREE.Group>(null);
  const [, getKeys] = useKeyboardControls<Controls>();
  const { camera, controls, scene } = useThree();
  const { changeScene } = useGameContext();

  const lastMovementDirection = useRef(new THREE.Vector3(0, 0, -1));
  const currentVelocity = useRef({ x: 0, y: 0, z: 0 });
  const isTransitioning = useRef(false);

  // Navigation state for click-to-move
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // For virtual joystick controls
  const [virtualControls, setVirtualControls] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const [useVirtualJoystick, setUseVirtualJoystick] = useState(true);
  const [useClickToMove, setUseClickToMove] = useState(false);

  // Load the phoenix bird model
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [mixer, setMixer] = useState<AnimationMixer | null>(null);

  // Listen for click-to-move events from the scene
  useEffect(() => {
    // Access any navigation events set on the window object
    const handleNavigation = (event: CustomEvent<NavigationEvent>) => {
      if (event.detail.enabled) {
        setTargetPosition(event.detail.targetPosition);
        setIsNavigating(true);
      } else {
        setTargetPosition(null);
        setIsNavigating(false);
      }
    };
    
    // Create a custom event for navigation
    window.addEventListener('player-navigation', handleNavigation as EventListener);
    
    // Create a custom event for virtual controls
    const handleVirtualControls = (event: CustomEvent<any>) => {
      setVirtualControls(event.detail);
    };
    window.addEventListener('virtual-joystick', handleVirtualControls as EventListener);
    
    // Listen for toggle controls event
    const handleToggleControls = (event: CustomEvent<{ useVirtualJoystick: boolean, useClickToMove: boolean }>) => {
      setUseVirtualJoystick(event.detail.useVirtualJoystick);
      setUseClickToMove(event.detail.useClickToMove);
    };
    window.addEventListener('toggle-controls', handleToggleControls as EventListener);

    return () => {
      window.removeEventListener('player-navigation', handleNavigation as EventListener);
      window.removeEventListener('virtual-joystick', handleVirtualControls as EventListener);
      window.removeEventListener('toggle-controls', handleToggleControls as EventListener);
    };
  }, []);

  // GLB model loading effect
  useEffect(() => {
    const loader = new GLTFLoader();
    const url = '/bob_the_builder_capoeira_rig_animation.glb';

    loader.load(
      url,
      (gltf) => {
        // ...existing code...
        const loadedModel = gltf.scene;

        // Adjust the model to be visible
        loadedModel.traverse((node: any) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        // Position the model correctly
        loadedModel.position.set(0, -1, 0); // Adjust this if needed
        loadedModel.rotation.set(0, Math.PI, 0); // Face forward
        
        setModel(loadedModel);

        // Create and play animations
        const newMixer = new AnimationMixer(loadedModel);
        setMixer(newMixer);

        // Log animations for debugging
        console.log('Available animations:', gltf.animations);

        if (gltf.animations.length > 0) {
          // Play the first animation by default
          const action = newMixer.clipAction(gltf.animations[0]);
          action.play();
        }

        console.log('Model loaded!', gltf);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('An error happened loading the GLTF:', error);
      }
    );
  }, [scene]);

  // Position reset and camera setup effect
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setTranslation(
        { x: startPosition[0], y: startPosition[1], z: startPosition[2] },
        true
      );
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      playerRef.current.wakeUp();
    }

    camera.position.set(startPosition[0], startPosition[1] + 6, startPosition[2] + 10);
  }, [camera, startPosition]);

  // Main game loop - handles movement, physics, animations
  useFrame((state, delta) => {
    if (!playerRef.current || !playerGroupRef.current || isTransitioning.current) return;

    // Update the animation mixer each frame
    if (mixer) {
      mixer.update(delta);
    }

    const clampedDelta = Math.min(delta, 0.1);
    const keys = getKeys();

    // Scene transitions
    if (keys.scene1 || keys.scene2 || keys.scene3) {
      isTransitioning.current = true;

      if (keys.scene1) changeScene("forest");
      else if (keys.scene2) changeScene("home");
      else if (keys.scene3) changeScene("store");

      setTimeout(() => {
        isTransitioning.current = false;
      }, 100);
    }

    // Reset if fallen off map
    const position = playerRef.current.translation();
    if (position.y < -10) {
      playerRef.current.setTranslation(
        { x: startPosition[0], y: startPosition[1], z: startPosition[2] },
        true
      );
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    // Base movement settings
    const moveSpeed = 5.0;
    const rigidBodyVelocity = playerRef.current.linvel();
    const targetVelocity = { x: 0, y: rigidBodyVelocity.y, z: 0 };
    const movementDirection = new THREE.Vector3(0, 0, 0);

    // Get camera's quaternion for direction-relative movement
    const cameraQuaternion = new THREE.Quaternion();
    camera.getWorldQuaternion(cameraQuaternion);

    // Create movement vectors
    const forwardVector = new THREE.Vector3(0, 0, -1);
    const sidewaysVector = new THREE.Vector3(1, 0, 0);

    // Rotate the movement vector by the camera's quaternion
    forwardVector.applyQuaternion(cameraQuaternion);
    sidewaysVector.applyQuaternion(cameraQuaternion);

    // Handle click-to-move navigation
    if (useClickToMove && isNavigating && targetPosition) {
      const playerPos = new THREE.Vector3(position.x, position.y, position.z);
      const distanceToTarget = playerPos.distanceTo(targetPosition);
      
      // Reached destination or close enough
      if (distanceToTarget < 1.0) {
        setIsNavigating(false);
        setTargetPosition(null);
      } else {
        // Calculate direction to target
        const direction = new THREE.Vector3()
          .subVectors(targetPosition, playerPos)
          .normalize();
        
        // Project direction onto the horizontal plane (ignore y component)
        direction.y = 0;
        direction.normalize();
        
        // Apply movement
        targetVelocity.x = direction.x * moveSpeed;
        targetVelocity.z = direction.z * moveSpeed;
        
        // For rotation
        movementDirection.copy(direction);
      }
    } 
    // Handle keyboard and virtual controls
    else {
      // Apply movement based on key presses or virtual controls
      if (keys.forward || (useVirtualJoystick && virtualControls.forward)) {
        targetVelocity.x += forwardVector.x * moveSpeed;
        targetVelocity.z += forwardVector.z * moveSpeed;
        movementDirection.z -= 1;
      }
      if (keys.backward || (useVirtualJoystick && virtualControls.backward)) {
        targetVelocity.x -= forwardVector.x * moveSpeed;
        targetVelocity.z -= forwardVector.z * moveSpeed;
        movementDirection.z += 1;
      }
      if (keys.left || (useVirtualJoystick && virtualControls.left)) {
        targetVelocity.x -= sidewaysVector.x * moveSpeed;
        targetVelocity.z -= sidewaysVector.z * moveSpeed;
        movementDirection.x -= 1;
      }
      if (keys.right || (useVirtualJoystick && virtualControls.right)) {
        targetVelocity.x += sidewaysVector.x * moveSpeed;
        targetVelocity.z += sidewaysVector.z * moveSpeed;
        movementDirection.x += 1;
      }
    }

    // Normalize diagonal movement
    if ((keys.forward || keys.backward || (useVirtualJoystick && virtualControls.forward) || (useVirtualJoystick && virtualControls.backward)) && 
        (keys.left || keys.right || (useVirtualJoystick && virtualControls.left) || (useVirtualJoystick && virtualControls.right))) {
      const length = Math.sqrt(targetVelocity.x ** 2 + targetVelocity.z ** 2);
      if (length > 0) {
        targetVelocity.x = (targetVelocity.x / length) * moveSpeed;
        targetVelocity.z = (targetVelocity.z / length) * moveSpeed;
      }
    }

    // Smooth movement
    const smoothFactor = 10.0 * clampedDelta;
    currentVelocity.current.x = THREE.MathUtils.lerp(
      currentVelocity.current.x,
      targetVelocity.x,
      smoothFactor
    );
    currentVelocity.current.z = THREE.MathUtils.lerp(
      currentVelocity.current.z,
      targetVelocity.z,
      smoothFactor
    );

    // Apply velocity to rigid body
    try {
      playerRef.current.setLinvel(
        {
          x: currentVelocity.current.x,
          y: targetVelocity.y,
          z: currentVelocity.current.z,
        },
        true
      );
    } catch (e) {
      console.warn("Could not set player velocity");
    }

    // Handle rotation - update last movement direction if moving
    if (movementDirection.lengthSq() > 0.01) {
      lastMovementDirection.current.copy(movementDirection.normalize());
    }

    // Rotate player model to face movement direction
    if (
      (Math.abs(currentVelocity.current.x) > 0.1 || Math.abs(currentVelocity.current.z) > 0.1) &&
      lastMovementDirection.current.lengthSq() > 0
    ) {
      const lookAt = new THREE.Matrix4();
      lookAt.lookAt(
        new THREE.Vector3(0, 0, 0),
        lastMovementDirection.current,
        new THREE.Vector3(0, 1, 0)
      );
      const targetQuaternion = new THREE.Quaternion();
      targetQuaternion.setFromRotationMatrix(lookAt);

      const rotationSpeed = Math.min(1.0, 5.0 * clampedDelta);
      playerGroupRef.current.quaternion.slerp(targetQuaternion, rotationSpeed);
    }

    // Handle jumping
    if (keys.jump) {
      const position = playerRef.current.translation();
      if (position.y < 1.1) {
        playerRef.current.setLinvel(
          {
            x: currentVelocity.current.x,
            y: 10.0,
            z: currentVelocity.current.z,
          },
          true
        );
      }
    }

    // Update camera target to follow player
    const playerPosition = playerRef.current.translation();
    const cameraTarget = new THREE.Vector3(playerPosition.x, playerPosition.y + 1, playerPosition.z);

    if (controls) {
      controls.target.copy(cameraTarget);
      controls.update();
    }
  });

  return (
    <RigidBody
      ref={playerRef}
      colliders={false}
      position={startPosition}
      friction={0.2}
      linearDamping={4}
      angularDamping={5}
      lockRotations
      type="dynamic"
      mass={1}
      restitution={0.1}
      gravityScale={1.5}
    >
      <group ref={playerGroupRef}>
        <CapsuleCollider args={[0.5, 0.5]} friction={0.5} restitution={0} density={1.2} />
        {model && (
          <primitive 
            object={model} 
            scale={[1, 1, 1]}
            position={[0, -0.5, 0]}
            castShadow 
            receiveShadow 
            userData={{ isPlayer: true }} 
          />
        )}
      </group>
    </RigidBody>
  );
}

// Update preload path
useGLTF.preload('/bob_the_builder_capoeira_rig_animation.glb');