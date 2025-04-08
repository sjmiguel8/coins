"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { RigidBody, CapsuleCollider, type RapierRigidBody } from "@react-three/rapier"
import * as THREE from "three"
import { useGameContext } from "./game-context"

// Define proper types
enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  jump = 'jump',
  scene1 = 'scene1',
  scene2 = 'scene2',
  scene3 = 'scene3'
}

// Export the Player component directly
export default function Player() {
  const playerRef = useRef<RapierRigidBody>(null)
  const [, getKeys] = useKeyboardControls<Controls>()
  const { camera } = useThree()
  const { changeScene } = useGameContext()

  // Set up camera to follow player
  useEffect(() => {
    camera.position.set(0, 3, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  useFrame((state, delta) => {
    if (!playerRef.current) return

    // Get current keyboard state
    const keys = getKeys()
    
    // Scene switching
    if (keys.scene1) changeScene("forest")
    if (keys.scene2) changeScene("home")
    if (keys.scene3) changeScene("store")

    // FIXED MOVEMENT: Use direct velocity setting instead of impulses for more responsive control
    const moveSpeed = 5.0 // Units per second
    const velocity = playerRef.current.linvel()
    
    // Create our target velocity based on keypresses
    let targetVelocity = { x: 0, y: velocity.y, z: 0 }
    
    if (keys.forward) targetVelocity.z = -moveSpeed
    if (keys.backward) targetVelocity.z = moveSpeed
    if (keys.left) targetVelocity.x = -moveSpeed
    if (keys.right) targetVelocity.x = moveSpeed

    // Combine directions when pressing multiple keys
    if ((keys.forward || keys.backward) && (keys.left || keys.right)) {
      // Normalize diagonal movement (multiply by ~0.7071)
      targetVelocity.x *= 0.7071
      targetVelocity.z *= 0.7071
    }

    // Jump - improved ground detection
    if (keys.jump) {
      const position = playerRef.current.translation()
      // Simple ground check - just check if we're close to y=0
      if (position.y < 1.1) {
        targetVelocity.y = 10.0 // Strong upward velocity for jump
      }
    }
    
    // Set the calculated velocity directly
    playerRef.current.setLinvel(targetVelocity, true)

    // Camera follow with smoothing
    const position = playerRef.current.translation()
    const cameraPosition = new THREE.Vector3()
    cameraPosition.copy(position)
    cameraPosition.z += 5
    cameraPosition.y += 3

    const cameraTarget = new THREE.Vector3()
    cameraTarget.copy(position)
    cameraTarget.y += 0.25

    state.camera.position.lerp(cameraPosition, 5 * delta)
    state.camera.lookAt(cameraTarget)
  })

  return (
    <RigidBody
      ref={playerRef}
      colliders={false}
      position={[0, 1, 0]}
      friction={1}
      linearDamping={4} // High damping to stop quickly when keys are released
      angularDamping={5}
      lockRotations
      type="dynamic"
      mass={1}
    >
      <CapsuleCollider args={[0.5, 0.5]} />
      <mesh castShadow>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color="#ff8800" />
      </mesh>
      <mesh position={[0, 0.5, -0.5]}>
        <boxGeometry args={[0.5, 0.2, 0.1]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </RigidBody>
  )
}
