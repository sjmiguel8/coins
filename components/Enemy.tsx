import { useRef, useEffect, useState } from 'react'
import { useHealthSystem } from './HealthSystem'
import { useCoinSystem } from './CoinSystem'
import { useCombatStore } from './CombatSystem'
import HealthBar from './HealthBar'
import * as THREE from 'three'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Text } from '@react-three/drei'

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
  const [damageText, setDamageText] = useState<number | null>(null)
  const [damageTextPosition, setDamageTextPosition] = useState<[number, number, number]>([0, 0, 0])
  
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
  
  // Show damage text animation
  useEffect(() => {
    if (damageText !== null) {
      const timer = setTimeout(() => {
        setDamageText(null)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [damageText])
  
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
        </group>
      </RigidBody>
    </group>
  )
}

export default Enemy
