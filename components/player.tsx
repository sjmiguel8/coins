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

export default function Player({ startPosition = [0, 1.5, 0] }: PlayerProps) {
  const playerRef = useRef<RapierRigidBody>(null);
  const playerGroupRef = useRef<THREE.Group>(null);
  const [, getKeys] = useKeyboardControls<Controls>();
  const { camera, controls, scene } = useThree();
  const { changeScene } = useGameContext();

  const lastMovementDirection = useRef(new THREE.Vector3(0, 0, -1));
  const currentVelocity = useRef({ x: 0, y: 0, z: 0 });
  const isTransitioning = useRef(false);

  // Load the phoenix bird model
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [mixer, setMixer] = useState<AnimationMixer | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    // Update the path to point directly to the GLB file
    const url = '/bob_the_builder_capoeira_rig_animation.glb';

    loader.load(
      url,
      (gltf) => {
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

  useFrame((state, delta) => {
    if (!playerRef.current || !playerGroupRef.current || isTransitioning.current) return;

    // Update the animation mixer each frame
    if (mixer) {
      mixer.update(delta);
    }

    const clampedDelta = Math.min(delta, 0.1);
    const keys = getKeys();

    if (keys.scene1 || keys.scene2 || keys.scene3) {
      isTransitioning.current = true;

      if (keys.scene1) changeScene("forest");
      else if (keys.scene2) changeScene("home");
      else if (keys.scene3) changeScene("store");

      setTimeout(() => {
        isTransitioning.current = false;
      }, 100);
    }

    const position = playerRef.current.translation();
    if (position.y < -10) {
      playerRef.current.setTranslation(
        { x: startPosition[0], y: startPosition[1], z: startPosition[2] },
        true
      );
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    const moveSpeed = 5.0;
    const rigidBodyVelocity = playerRef.current.linvel();
    const targetVelocity = { x: 0, y: rigidBodyVelocity.y, z: 0 };
    const movementDirection = new THREE.Vector3(0, 0, 0);

    // Get camera's quaternion
    const cameraQuaternion = new THREE.Quaternion();
    camera.getWorldQuaternion(cameraQuaternion);

    // Create a movement vector
    const forwardVector = new THREE.Vector3(0, 0, -1);
    const sidewaysVector = new THREE.Vector3(1, 0, 0);

    // Rotate the movement vector by the camera's quaternion
    forwardVector.applyQuaternion(cameraQuaternion);
    sidewaysVector.applyQuaternion(cameraQuaternion);

    // Apply movement based on key presses
    if (keys.forward) {
      targetVelocity.x += forwardVector.x * moveSpeed;
      targetVelocity.z += forwardVector.z * moveSpeed;
      movementDirection.z -= 1;
    }
    if (keys.backward) {
      targetVelocity.x -= forwardVector.x * moveSpeed;
      targetVelocity.z -= forwardVector.z * moveSpeed;
      movementDirection.z += 1;
    }
    if (keys.left) {
      targetVelocity.x -= sidewaysVector.x * moveSpeed;
      targetVelocity.z -= sidewaysVector.z * moveSpeed;
      movementDirection.x -= 1;
    }
    if (keys.right) {
      targetVelocity.x += sidewaysVector.x * moveSpeed;
      targetVelocity.z += sidewaysVector.z * moveSpeed;
      movementDirection.x += 1;
    }

    // Normalize diagonal movement
    if ((keys.forward || keys.backward) && (keys.left || keys.right)) {
      const length = Math.sqrt(targetVelocity.x ** 2 + targetVelocity.z ** 2);
      if (length > 0) {
        targetVelocity.x = (targetVelocity.x / length) * moveSpeed;
        targetVelocity.z = (targetVelocity.z / length) * moveSpeed;
      }
    }

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

    if (movementDirection.lengthSq() > 0.01) {
      lastMovementDirection.current.copy(movementDirection.normalize());
    }

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
        {/* Adjust scale and position of the model */}
        {model && (
          <primitive 
            object={model} 
            scale={[1, 1, 1]}    // Increased scale to 2
            position={[0, -0.5, 0]}   // Adjust position to align with collider
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