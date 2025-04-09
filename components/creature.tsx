"use client"

import { useEffect, useState, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { useGameContext } from "./game-context"

interface CreatureProps {
  position: [number, number, number];
}

export default function Creature({ position }: CreatureProps) {
  const creatureRef = useRef<THREE.Group>(null)
  const [direction, setDirection] = useState(() => Math.random() * Math.PI * 2)
  const [health, setHealth] = useState(100)
  const [showHealthBar, setShowHealthBar] = useState(false)
  const [lastAttacked, setLastAttacked] = useState(0)
  const [isDead, setIsDead] = useState(false)
  
  // Load the model once and clone it
  const { scene: originalScene } = useGLTF('/base_basic_pbr.glb')
  const modelRef = useRef<THREE.Object3D>(originalScene.clone())
  const { scene: meatScene } = useGLTF('/meat.glb')

  // Configure model appearance
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.scale.set(1.2, 1.2, 1.2)
      modelRef.current.position.set(0, -0.5, 0)
      
      // Apply shadows
      modelRef.current.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true
          node.receiveShadow = true
        }
      })
    }
  }, [])

  // Direction changes
  useEffect(() => {
    const changeDirection = () => {
      setDirection(prev => {
        const randomAngle = Math.random() * Math.PI - Math.PI / 2
        return prev + randomAngle * 0.8
      })
    }
    
    const intervalId = setInterval(changeDirection, 2000 + Math.random() * 3000)
    return () => clearInterval(intervalId)
  }, [])

  // Function to handle damage
  const handleDamage = (damage: number, attacker: any) => {
    setHealth((prevHealth) => {
      const newHealth = Math.max(prevHealth - damage, 0);
      setShowHealthBar(true);
      setLastAttacked(Date.now());
      if (newHealth === 0) {
        handleDeath(attacker);
      }
      return newHealth;
    });
  };

  // Function to handle health regeneration
  const handleRegeneration = () => {
    if (Date.now() - lastAttacked > 5000 && health < 100) {
      setHealth((prevHealth) => Math.min(prevHealth + 1, 100));
      setShowHealthBar(false);
    }
  };

  // Function to handle death
  const handleDeath = (attacker: any) => {
    setIsDead(true);
    // Drop coins and meat
    dropLoot(attacker);
    // Remove creature after a delay
    setTimeout(() => {
      if (creatureRef.current) {
        creatureRef.current.visible = false;
      }
    }, 1000);
  };

  // Function to drop loot
  const dropLoot = (attacker: any) => {
    // Drop coins
    const coinDropAmount = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < coinDropAmount; i++) {
      const coinPosition = [
        position[0] + (Math.random() - 0.5) * 2,
        position[1] + 0.5,
        position[2] + (Math.random() - 0.5) * 2,
      ] as [number, number, number];
      // Dispatch custom event for coin drop
      window.dispatchEvent(new CustomEvent('coin-drop', { detail: coinPosition }));
    }

    // Drop meat
    if (Math.random() < 0.5) {
      const meatPosition = [
        position[0] + (Math.random() - 0.5) * 2,
        position[1] + 0.5,
        position[2] + (Math.random() - 0.5) * 2,
      ] as [number, number, number];
      // Dispatch custom event for meat drop
      window.dispatchEvent(new CustomEvent('meat-drop', { detail: { position: meatPosition, attacker: attacker } }));
    }
  };

  useEffect(() => {
    const handleCreatureDamage = (event: CustomEvent<{ target: THREE.Object3D; damage: number; attacker: any }>) => {
      if (event.detail.target === modelRef.current) {
        handleDamage(event.detail.damage, event.detail.attacker);
      }
    };

    window.addEventListener('creature-damage', handleCreatureDamage as EventListener);

    return () => {
      window.removeEventListener('creature-damage', handleCreatureDamage as EventListener);
    };
  }, []);

  useFrame((_, delta) => {
    if (!creatureRef.current || isDead) return

    // Simple movement
    const speed = 1
    const xOffset = Math.cos(direction) * speed * delta
    const zOffset = Math.sin(direction) * speed * delta
    
    // Current position
    const currentPosition = creatureRef.current.position.clone()
    
    // New position
    let newX = currentPosition.x + xOffset
    let newZ = currentPosition.z + zOffset

    // Check for NaN values
    if (isNaN(newX) || isNaN(newZ)) {
      console.error("Creature position is NaN! Resetting direction.");
      setDirection(Math.random() * Math.PI * 2); // Reset direction
      return; // Skip this frame
    }
    
    // Clamp position values
    const clampRange = 50;
    newX = Math.max(-clampRange, Math.min(clampRange, newX));
    newZ = Math.max(-clampRange, Math.min(clampRange, newZ));

    // Boundary check
    const maxDistance = 40
    const distanceFromOrigin = Math.sqrt(newX * newX + newZ * newZ)
    
    // Keep within bounds
    if (distanceFromOrigin > maxDistance) {
      // Turn back toward the center
      const angleToCenter = Math.atan2(-currentPosition.z, -currentPosition.x)
      setDirection(angleToCenter)
    } else {
      // Apply new position
      creatureRef.current.position.x = newX
      creatureRef.current.position.z = newZ
    }
    
    // Rotate to face movement direction
    creatureRef.current.rotation.y = direction
    
    // Simple bobbing effect
    const time = Date.now() * 0.001
    const bobAmount = Math.sin(time * 2) * 0.05
    creatureRef.current.position.y = position[1] + bobAmount

    handleRegeneration()
  })

  if (isDead) return null

  return (
    <group 
      ref={creatureRef}
      position={[position[0], position[1], position[2]]} 
      userData={{ isCreature: true }}
    >
      {showHealthBar && (
        <mesh position={[0, 2, 0]}>
          <planeGeometry args={[2, 0.3]} />
          <meshBasicMaterial color="red" transparent opacity={0.8} />
          <mesh scale={[health / 100, 1, 1]} position={[-1 + health / 200, 0, 0]}>
            <planeGeometry args={[2, 0.3]} />
            <meshBasicMaterial color="green" transparent opacity={0.8} />
          </mesh>
        </mesh>
      )}
      <primitive object={modelRef.current} />
    </group>
  )
}

// Preload the model
useGLTF.preload('/base_basic_pbr.glb')
useGLTF.preload('/meat.glb')
