"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls, useGLTF } from "@react-three/drei";
import { RigidBody, CapsuleCollider, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useGameContext } from "./game-context";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';
import { Vector3 } from 'three'; // Add this line

// Move these outside the component to prevent re-creation on every render
const lastMovementDirection = new THREE.Vector3(0, 0, -1);
const currentVelocity = { x: 0, y: 0, z: 0 };

enum Controls {
  forward = "forward",
  backward = "backward",
  left = "left",
  right = "right",
  jump = "jump",
  scene1 = "scene1",
  scene2 = "scene2",
  scene3 = "scene3",
  attack = "attack",
}

export interface PlayerProps {
  cameraLock: boolean;
  position: Vector3 | number[];
  onReady?: () => void;
  startPosition?: [number, number, number];
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  userData?: any;
  rotation?: [number, number, number]; // Add missing rotation prop
  scale?: [number, number, number]; // Add missing scale prop
  name?: string; // Add missing name prop
}

// Define a global event to handle navigation requests from outside components
export type NavigationEvent = {
  targetPosition: THREE.Vector3;
  enabled: boolean;
}

// Define the GameContextType interface
interface GameContextType {
  camera: THREE.PerspectiveCamera;
  controls: any;
  scene: THREE.Scene;
  setHealth: (health: number) => void;
  hunger: number;
  setHunger: (hunger: number) => void;
  changeScene: (sceneName: string) => void;
  health: number;
  damagePlayer: (damage: number) => void;
  isDead: boolean;
  lastAttacked: number;
  setLastAttacked: (time: number) => void;
  eatMeat: (hungerPoints: number) => void;
}

export default function Player({ 
  position, 
  cameraLock = false,
  startPosition = [0, 1.5, 0], 
  cameraPosition = [0, 7.5, 10], 
  cameraTarget = [0, 1.5, 0],
  onReady,
  userData = {}
}: PlayerProps) {
  const playerRef = useRef<RapierRigidBody>(null);
  const playerGroupRef = useRef<THREE.Group>(null);
  const [, getKeys] = useKeyboardControls<Controls>(); // Move useKeyboardControls here
  const { camera, controls, scene, setHealth: updateHealth, hunger: initialHunger, setHunger, changeScene, health, damagePlayer, isDead, lastAttacked, setLastAttacked, eatMeat } = useGameContext() as unknown as GameContextType;

  // Use useRef instead of creating new objects on each render
  const isTransitioning = useRef(false);

  // Navigation state for click-to-move
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [mixer, setMixer] = useState<AnimationMixer | null>(null);

  // Attack variables
  const [isAttacking, setIsAttacking] = useState(false);
  const attackRange = 2; // Attack range
  const attackDamage = 20; // Damage dealt per attack

  const maxHealth = 1800; // Set maximum health
  const defaultHealth = maxHealth; // Set default health to maxHealth

  const [localHealth] = useState(defaultHealth); // Use local state for health
  
  // Use refs to store previous values for comparison
  const prevLocalHealthRef = useRef(localHealth);
  const prevInitialHungerRef = useRef(initialHunger);
  
  // Update the ref values when the actual values change
  useEffect(() => {
    prevLocalHealthRef.current = localHealth;
  }, [localHealth]);
  
  useEffect(() => {
    prevInitialHungerRef.current = initialHunger;
  }, [initialHunger]);

  // Function to handle attacking
  const attack = () => {
    if (!playerRef.current) return;

    const playerPosition = playerRef.current.translation();
    const attackPosition = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);

    scene.traverse((object: THREE.Object3D) => {
      if (object.userData && object.userData.isCreature) {
        const creaturePosition = new THREE.Vector3();
        object.getWorldPosition(creaturePosition);

        const distance = attackPosition.distanceTo(creaturePosition);

        if (distance <= attackRange) {
          // Deal damage to the creature
          const damageEvent = new CustomEvent('creature-damage', {
            detail: {
              target: object,
              damage: attackDamage,
              attacker: playerRef.current
            }
          });
          window.dispatchEvent(damageEvent);
        }
      }
    });
  };

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
    
    return () => {
      window.removeEventListener('player-navigation', handleNavigation as EventListener);
    };
  }, []);

  // Add attack control
  useEffect(() => {
    const keys = getKeys();
    if (keys.attack && !isAttacking) {
      setIsAttacking(true);
      attack();
      setTimeout(() => setIsAttacking(false), 500); // Attack cooldown
    }
  }, [getKeys, isAttacking, attack]);

  // GLB model loading effect
  useEffect(() => {
    const loader = new GLTFLoader();
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
        loadedModel.position.set(0, -3, 0); // Adjust this if needed
        loadedModel.rotation.set(0, Math.PI, 0); // Face forward
        
        setModel(loadedModel);

        // Create and play animations
        const newMixer = new AnimationMixer(loadedModel);
        setMixer(newMixer);

        if (gltf.animations.length > 0) {
          // Play the first animation by default
          const action = newMixer.clipAction(gltf.animations[0]);
          action.play();
        }
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }, []);

  // Position reset and camera setup effect
  useEffect(() => {
    if (playerRef.current && camera) {
      const pos = Array.isArray(position)
        ? { x: position[0], y: position[1], z: position[2] }
        : { x: position.x, y: position.y, z: position.z };

      playerRef.current.setTranslation(
        { x: pos.x, y: pos.y, z: pos.z },
        true
      );
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      playerRef.current.wakeUp();

      if (onReady) onReady();
    }

    if (camera && controls) {
      camera.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
      controls.target.set(cameraTarget[0], cameraTarget[1], cameraTarget[2]);
      controls.update();
    }
  }, [camera, controls, position, onReady]);

  // Camera rotation effect
  useEffect(() => {
    if (camera) {
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
  }, [camera]);
  
  // Main game loop - handles movement, physics, animations
  useFrame(({camera, scene, gl, ...rest}, delta) => {
    if (!playerRef.current || !playerGroupRef.current || isTransitioning.current) return;

    const position = playerRef.current.translation();

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

    // Base movement settings
    const moveSpeed = 7.0;
    const rigidBodyVelocity = playerRef.current.linvel();
    const targetVelocity = { x: 0, y: rigidBodyVelocity.y, z: 0 };
    const movementDirection = new THREE.Vector3(0, 0, 0);

    // Get camera's quaternion for direction-relative movement
    const cameraQuaternion = new THREE.Quaternion();
    if (camera) {
      camera.getWorldQuaternion(cameraQuaternion);
    }

    // Create movement vectors
    const forwardVector = new THREE.Vector3(0, 0, -1);
    const sidewaysVector = new THREE.Vector3(1, 0, 0);

    // Handle click-to-move navigation
    if (isNavigating && targetPosition) {
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
    }

    // Normalize diagonal movement
    if ((keys.forward || keys.backward) && 
        (keys.left || keys.right)) {
      const length = Math.sqrt(targetVelocity.x ** 2 + targetVelocity.z ** 2);
      if (length > 0) {
        targetVelocity.x = (targetVelocity.x / length) * moveSpeed;
        targetVelocity.z = (targetVelocity.z / length) * moveSpeed;
      }
    }

    // Smooth movement
    const smoothFactor = 10.0 * clampedDelta;
    currentVelocity.x = THREE.MathUtils.lerp(
      currentVelocity.x,
      targetVelocity.x,
      smoothFactor
    );
    currentVelocity.z = THREE.MathUtils.lerp(
      currentVelocity.z,
      targetVelocity.z,
      smoothFactor
    );

    // Apply velocity to rigid body
    try {
      playerRef.current.setLinvel(
        {
          x: currentVelocity.x,
          y: targetVelocity.y,
          z: currentVelocity.z,
        },
        true
      );
    } catch (e) {
      console.warn("Could not set player velocity");
    }

    // Handle rotation - update last movement direction if moving
    if (movementDirection.lengthSq() > 0.01) {
      lastMovementDirection.copy(movementDirection.normalize());
    }

    // Rotate player model to face movement direction
    if (
      (Math.abs(currentVelocity.x) > 0.1 || Math.abs(currentVelocity.z) > 0.1) &&
      lastMovementDirection.lengthSq() > 0
    ) {
      const lookAt = new THREE.Matrix4();
      lookAt.lookAt(
        new THREE.Vector3(0, 0, 0),
        lastMovementDirection,
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
            x: currentVelocity.x,
            y: 10.0,
            z: currentVelocity.z,
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

    // Update camera position if cameraLock is enabled
    if (cameraLock && camera) {
      camera.position.set(playerPosition.x + cameraPosition[0], playerPosition.y + cameraPosition[1], playerPosition.z + cameraPosition[2]);
      controls.target.copy(cameraTarget);
      controls.update();
    }
  });

  // Method to handle attacking
  const handleAttack = () => {
    if (isDead) return

    // Define attack cooldown
    const attackCooldown = 500; // Cooldown in milliseconds
    
    // Check attack cooldown
    const now = Date.now()
    if (now - lastAttacked < attackCooldown) return
    
    setLastAttacked(now)
    
    if (!playerRef.current) return
    
    const playerPosition = playerRef.current.translation()
    const attackPosition = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z)

    scene.traverse((object: THREE.Object3D) => {
      if (object.userData && object.userData.isCreature) {
        const creaturePosition = new THREE.Vector3()
        object.getWorldPosition(creaturePosition)

        const distance = attackPosition.distanceTo(creaturePosition)

        if (distance <= attackRange) {
          // Deal damage to the creature
          const damageEvent = new CustomEvent('creature-damage', {
            detail: {
              target: object,
              damage: attackDamage,
              attacker: playerRef.current
            }
          })
          window.dispatchEvent(damageEvent)
        }
      }
    })
  }
  
  // Listen for meat collection events
  useEffect(() => {
    const handleMeatCollection = (event: CustomEvent<{ position: [number, number, number] }>) => {
      if (playerRef.current) {
        const playerPosition = playerRef.current.translation()
        const meatPosition = new THREE.Vector3(...event.detail.position)
        
        const distance = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z)
          .distanceTo(meatPosition)
          
        if (distance < 1.5) {
          eatMeat(30) // Restore 30 hunger points when eating meat
        }
      }
    }
    
    window.addEventListener('meat-collected', handleMeatCollection as EventListener)
    
    return () => {
      window.removeEventListener('meat-collected', handleMeatCollection as EventListener)
    }
  }, [])
  
  // Listen for creature attacks on player
  useEffect(() => {
    const handleCreatureAttack = (event: CustomEvent<{ damage: number }>) => {
      if (isDead) return
      damagePlayer(event.detail.damage)
      setLastAttacked(Date.now())
    }
    
    window.addEventListener('player-damage', handleCreatureAttack as EventListener)
    
    return () => {
      window.removeEventListener('player-damage', handleCreatureAttack as EventListener)
    }
  }, [isDead])
  
  // Handle keyboard input for attacking
  useEffect(() => {
    const keys = getKeys();
    if (keys.attack) {
      handleAttack();
    }
  }, [getKeys, handleAttack]);

  return (
    <RigidBody
      ref={playerRef}
      colliders={false}
      position={
        Array.isArray(position)
          ? (position as [number, number, number])
          : (position as Vector3)
      }
      friction={0.2}
      linearDamping={4}
      angularDamping={5}
      lockRotations
      type="dynamic"
      mass={1}
      restitution={0.1}
      gravityScale={1.5}
      userData={userData}
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
