"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { useGameContext } from "./game-context"
import { Text } from "@react-three/drei"
import { useRapier, RigidBody } from '@react-three/rapier'

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
  const attackRange = 2
  const attackDamage = 10
  const attackCooldown = 2000 // 2 seconds between attacks
  const [lastAttackTime, setLastAttackTime] = useState(0)
  const [isAggressive, setIsAggressive] = useState(false)
  const [targetPlayer, setTargetPlayer] = useState<THREE.Object3D | null>(null)
  const detectionRange = 8 // Range to detect player
  const floorY = position[1] // Store the initial Y position as the floor level
  const [damageText, setDamageText] = useState<number | null>(null)
  const [damageTextPosition, setDamageTextPosition] = useState<[number, number, number]>([0, 0, 0])
  const [isHitEffect, setIsHitEffect] = useState(false);
  const rigidBodyRef = useRef<React.ElementRef<typeof RigidBody>>(null)
  const rapier = useRapier()

  // Load the model once and clone it
  const { scene: originalScene } = useGLTF('/base_basic_pbr.glb')
  const modelRef = useRef<THREE.Object3D>(null)
  useGLTF('/meat.glb')

  const model = useMemo(() => originalScene.clone(), [originalScene]);

  // Configure model appearance
  useEffect(() => {
    if (model) {
      model.scale.set(1.2, 1.2, 1.2)
      model.position.set(0, -0.5, 0)
      
      // Apply shadows
      model.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true
          node.receiveShadow = true
        }
      })
    }
  }, [model])

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  // Direction changes
  useEffect(() => {
    const changeDirection = () => {
      setDirection(prev => {
        // Generate a random angle between -PI/4 and PI/4 (45 degrees)
        const randomAngle = (Math.random() - 0.5) * Math.PI / 2;
        
        // Adjust the influence of the random angle (0.5 means 50% influence)
        const influence = 0.5;
        
        return prev + randomAngle * influence;
      });
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
      
      // Show damage text with random offset for visibility
      const creaturePos = new THREE.Vector3();
      if (creatureRef.current) {
        creatureRef.current.getWorldPosition(creaturePos);
      }
      const randomX = (Math.random() - 0.5) * 0.5;
      const randomZ = (Math.random() - 0.5) * 0.5;
      setDamageTextPosition([
        creaturePos.x + randomX, 
        creaturePos.y + 2, 
        creaturePos.z + randomZ
      ]);
      setDamageText(damage);
      
      // Hide damage text after 1 second
      setTimeout(() => {
        setDamageText(null);
      }, 1000);
      
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
    if (Math.random() < 0.5) {
      const coinPosition = [
        position[0] + (Math.random() - 0.5) * 2,
        position[1] + 0.5,
        position[2] + (Math.random() - 0.5) * 2,
      ] as [number, number, number];
      // Dispatch custom event for coin drop
      window.dispatchEvent(new CustomEvent('coin-drop', { detail: { position: coinPosition, attacker: attacker } }));
    }
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
      if (event.detail.target === creatureRef.current) {
        handleDamage(event.detail.damage, event.detail.attacker);
      }
    };

    window.addEventListener('creature-damage', handleCreatureDamage as EventListener);

    return () => {
      window.removeEventListener('creature-damage', handleCreatureDamage as EventListener);
    };
  }, []);

  useEffect(() => {
    const handlePlayerAttack = (event: CustomEvent<{ direction: string }>) => {
      if (!creatureRef.current) return;

      const attackDirection = event.detail.direction;
      const creaturePos = new THREE.Vector3();
      creatureRef.current.getWorldPosition(creaturePos);

      // Get player position from scene
      let playerPos = new THREE.Vector3();
      const gameScene = modelRef.current?.parent as THREE.Scene;
      if (!gameScene) return;

      gameScene.traverse((object: THREE.Object3D) => {
        if (object.userData && object.userData.isPlayer) {
          object.getWorldPosition(playerPos);
        }
      });

      const distance = creaturePos.distanceTo(playerPos);

      if (distance <= attackRange) {
        // Check attack direction
        let isHit = false;
        switch (attackDirection) {
          case 'forward':
            isHit = creaturePos.z < playerPos.z;
            break;
          case 'backward':
            isHit = creaturePos.z > playerPos.z;
            break;
          case 'left':
            isHit = creaturePos.x < playerPos.x;
            break;
          case 'right':
            isHit = creaturePos.x > playerPos.x;
            break;
          default:
            break;
        }

        if (isHit) {
          handleDamage(attackDamage, null);
          setIsHitEffect(true);
          setTimeout(() => {
            setIsHitEffect(false);
          }, 300);
        }
      }
    };

    window.addEventListener('player-attack', handlePlayerAttack as EventListener);

    return () => {
      window.removeEventListener('player-attack', handlePlayerAttack as EventListener);
    };
  }, []);

  // Check for nearby player and become aggressive
  const checkForPlayer = () => {
    if (isDead) return
    
    let playerMesh: THREE.Object3D | null = null
    const gameScene = modelRef.current?.parent as THREE.Scene
    if (!gameScene) return
    
    gameScene.traverse((object: THREE.Object3D) => {
      if (object.userData && object.userData.isPlayer) {
        playerMesh = object as THREE.Object3D
      }
    })
    
    if (playerMesh && creatureRef.current) {
      const creaturePos = new THREE.Vector3()
      const playerPos = new THREE.Vector3()
      
      creatureRef.current.getWorldPosition(creaturePos)      
      
      const distance = creaturePos.distanceTo(playerPos)
      
      // Become aggressive if player is close enough
      if (distance <= detectionRange) {
        setIsAggressive(true)
        setTargetPlayer(playerMesh)
      } else {
        setIsAggressive(false)
        setTargetPlayer(null)
      }
    }
  }
  
  // Attack the player if in range
  const attackPlayer = () => {
    if (isDead || !isAggressive || !targetPlayer || !creatureRef.current) return
    
    const now = Date.now()
    if (now - lastAttackTime < attackCooldown) return
    
    const creaturePos = new THREE.Vector3()
    const playerPos = new THREE.Vector3()
    
    creatureRef.current.getWorldPosition(creaturePos)
    targetPlayer.getWorldPosition(playerPos)
    
    const distance = creaturePos.distanceTo(playerPos)
    
    if (distance <= attackRange) {
      setLastAttackTime(now)
      
      // Deal damage to player
      window.dispatchEvent(new CustomEvent('player-damage', {
        detail: {
          damage: attackDamage,
        }
      }))
    }
  }

  useEffect(() => {
    const checkInterval = setInterval(checkForPlayer, 1000)
    return () => clearInterval(checkInterval)
  }, [])  
  
  // Modified useFrame logic to chase player when aggressive
  useFrame((state, delta) => {
    if (!creatureRef.current || isDead) return

    // Attack player if aggressive and in range
    if (isAggressive && targetPlayer) {
      attackPlayer()
      
      // Chase player
      const creaturePos = creatureRef.current.position.clone()
      const playerPos = new THREE.Vector3()
      targetPlayer.getWorldPosition(playerPos)
      
      // Calculate angle to player
      const angleToPlayer = Math.atan2(
        playerPos.z - creaturePos.z, 
        playerPos.x - creaturePos.x
      )
      
      // Set direction towards player
      setDirection(angleToPlayer)
    }

    // Simple movement
    const speed = isAggressive ? 1.5 : 1 // Move faster when aggressive
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
    
    // Simple bobbing effect - but maintain the base floor level
    const time = Date.now() * 0.001
    const bobAmount = Math.sin(time * 2) * 0.05
    
    // Ensure creature stays at floor level plus bobbing effect
    creatureRef.current.position.y = floorY + bobAmount

    // Keep the creature above the floor
    if (creatureRef.current) {
      if (creatureRef.current.position.y < floorY) {
        creatureRef.current.position.y = floorY;
      }
    }

    handleRegeneration()
  })

  useFrame(() => {
    if (!rigidBodyRef.current) return

    const num = 2
    const impulse = { x: num * Math.random() - num / 2, y: 2, z: num * Math.random() - num / 2 }
    rigidBodyRef.current.applyImpulse(impulse, true)
  })

  if (isDead) return null

  return (
    <RigidBody ref={rigidBodyRef} colliders="ball" restitution={0.2} friction={1} linearDamping={0.9}>
      <mesh castShadow>
        <sphereGeometry />
        <meshStandardMaterial />
      </mesh>
      <group 
        ref={creatureRef}
        position={[position[0], position[1], position[2]]} 
        userData={{ isCreature: true }}
      >
        {/* Health bar that shows when creature is damaged */}
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
        
        {/* Damage text that appears when creature is hit */}
        {damageText !== null && (
          <Text
            position={[
              damageTextPosition[0] - position[0],
              damageTextPosition[1] - position[1], 
              damageTextPosition[2] - position[2]
            ]}
            color="red"
            fontSize={0.5}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {`-${damageText}`}
          </Text>
        )}
        
        {modelRef.current && (
          <primitive
            object={modelRef.current}
            // Add hit effect
          />
        )}
      </group>
    </RigidBody>
  )
}

// Preload the model
useGLTF.preload('/base_basic_pbr.glb')
useGLTF.preload('/meat.glb')
