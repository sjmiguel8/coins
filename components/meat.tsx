import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

interface MeatProps {
  position: [number, number, number]
  id: string
}

export default function Meat({ position, id }: MeatProps) {
  const meatRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/meat.glb')
  const [isCollected, setIsCollected] = useState(false)
  const [lifespan] = useState(30000) // 30 seconds before disappearing
  const [created] = useState(Date.now())
  
  useEffect(() => {
    const model = scene.clone()
    
    model.scale.set(1, 1, 1)
    model.position.set(0, 0, 0)
    model.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true
        node.receiveShadow = true
      }
    })
    
    if (meatRef.current) {
      meatRef.current.add(model)
    }
  }, [scene])
  
  useFrame((state) => {
    if (!meatRef.current || isCollected) return
    
    // Make meat disappear after its lifespan
    if (Date.now() - created > lifespan) {
      setIsCollected(true)
      return
    }
    
    // Simple rotation & hover effect
    meatRef.current.rotation.y += 0.01
    const time = state.clock.getElapsedTime()
    const hoverY = position[1] + Math.sin(time * 1.5) * 0.1
    meatRef.current.position.y = hoverY
    
    // Check for player proximity every few frames
    if (Math.floor(time * 10) % 5 !== 0) return
    
    // Find player
    let playerMesh: THREE.Object3D | undefined = undefined
    
    state.scene.traverse((object: THREE.Object3D) => {
      if (object.userData && object.userData.isPlayer) {
        playerMesh = object
      }
    })
    
    if (playerMesh && meatRef.current) {
      const meatPos = new THREE.Vector3()
      const playerPos = new THREE.Vector3()
      
      meatRef.current.getWorldPosition(meatPos)
      playerMesh.getWorldPosition(playerPos)
      
      const distance = meatPos.distanceTo(playerPos)
      
      if (distance < 1.5 && !isCollected) {
        setIsCollected(true)
        
        // Dispatch collection event
        window.dispatchEvent(new CustomEvent('meat-collected', {
          detail: { position }
        }))
      }
    }
  })
  
  if (isCollected) return null
  
  return (
    <group 
      ref={meatRef}
      position={position}
      userData={{ isMeat: true, id }}
    />
  )
}
