import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useHealthSystem } from './HealthSystem'
import { useCoinSystem } from './CoinSystem'
import { useCombatStore } from './CombatSystem'
import HealthBar from './HealthBar'
import * as THREE from 'three'
import { RigidBody, CuboidCollider } from '@react-three/rapier'

interface EnemyProps {
  id: string
  position: [number, number, number]
  maxHealth?: number
  coinValue?: number
  model?: React.ReactNode
}

const Enemy: React.FC<EnemyProps> = ({ 
  id, 
  position, 
  maxHealth = 50,
  coinValue = 5,
  model 
}) => {
  const enemyRef = useRef<THREE.Group>(null)
  const rigidBodyRef = useRef(null)
  const { registerEntity, entities, damageEntity } = useHealthSystem()
  const { collectCoin } = useCoinSystem()
  const isAttacking = useCombatStore((state) => state.isAttacking)
  const attackType = useCombatStore((state) => state.attackType)
  const [isHit, setIsHit] = useState(false)
  
  const isAlive = entities[id]?.isAlive !== false
  
  // Register enemy with health system
  useEffect(() => {
    registerEntity({
      id,
      type: 'enemy',
      maxHealth,
      currentHealth: maxHealth,
      position: new THREE.Vector3(...position)
    })
    
    // Optional: Register a coin at the enemy's position that appears when killed
  }, [])
  
  // Handle death
  useEffect(() => {
    if (!isAlive && entities[id]) {
      // Drop a coin when dead
      collectCoin(`enemy-coin-${id}`)
    }
  }, [isAlive, id, entities])
  
  // Check for attacks in proximity
  useFrame(({ camera }) => {
    if (!enemyRef.current || !isAttacking || !isAlive) return
    
    const playerDirection = new THREE.Vector3(0, 0, -1)
    playerDirection.applyQuaternion(camera.quaternion)
    
    const enemyPosition = new THREE.Vector3()
    enemyRef.current.getWorldPosition(enemyPosition)
    
    const cameraPosition = camera.position.clone()
    const distanceToEnemy = cameraPosition.distanceTo(enemyPosition)
    
    // Check if player is facing the enemy and close enough
    if (distanceToEnemy < (attackType === 'heavy' ? 4 : 3)) {
      const directionToEnemy = enemyPosition.clone().sub(cameraPosition).normalize()
      const dotProduct = directionToEnemy.dot(playerDirection)
      
      // If player is facing the enemy (dot product is positive and large enough)
      if (dotProduct > 0.7) {
        if (!isHit) {
          const damage = attackType === 'heavy' ? 25 : 10
          damageEntity(id, damage)
          setIsHit(true)
          
          // Show hit effect
          setTimeout(() => setIsHit(false), 300)
        }
      }
    }
  })
  
  if (!isAlive) return null
  
  return (
    <group>
      <RigidBody
        ref={rigidBodyRef}
        position={position}
        type="dynamic"
        colliders={false}
        mass={10}
        lockRotations
      >
        <group ref={enemyRef}>
          {model ? model : (
            <mesh
              castShadow
              receiveShadow
              scale={isHit ? [1.1, 1.1, 1.1] : [1, 1, 1]}
              userData={{ isEnemy: true, entityId: id }}
            >
              <boxGeometry args={[1, 2, 1]} />
              <meshStandardMaterial 
                color={isHit ? "#ff0000" : "#905050"} 
                emissive={isHit ? "#ff0000" : "#000000"}
                emissiveIntensity={isHit ? 0.5 : 0}
              />
            </mesh>
          )}
          <CuboidCollider args={[0.5, 1, 0.5]} />
          <HealthBar entityId={id} offset={[0, 2.5, 0]} />
        </group>
      </RigidBody>
    </group>
  )
}

export default Enemy
