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
  const playerGroupRef = useRef<THREE.Group>(null)
  const [, getKeys] = useKeyboardControls<Controls>()
  const { camera } = useThree()
  const { changeScene } = useGameContext()
  // Store the last movement direction for smooth rotation
  const lastMovementDirection = useRef(new THREE.Vector3(0, 0, -1))

  // Set up camera to follow player
  useEffect(() => {
    camera.position.set(0, 3, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  useFrame((state, delta) => {
    if (!playerRef.current || !playerGroupRef.current) return

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
    
    // Store movement direction for rotation
    const movementDirection = new THREE.Vector3(0, 0, 0)
    
    if (keys.forward) {
      targetVelocity.z = -moveSpeed
      movementDirection.z -= 1
    }
    if (keys.backward) {
      targetVelocity.z = moveSpeed
      movementDirection.z += 1
    }
    if (keys.left) {
      targetVelocity.x = -moveSpeed
      movementDirection.x -= 1
    }
    if (keys.right) {
      targetVelocity.x = moveSpeed
      movementDirection.x += 1
    }

    // Combine directions when pressing multiple keys
    if ((keys.forward || keys.backward) && (keys.left || keys.right)) {
      // Normalize diagonal movement (multiply by ~0.7071)
      targetVelocity.x *= 0.7071
      targetVelocity.z *= 0.7071
    }

    // Rotate player model to face movement direction
    if (movementDirection.lengthSq() > 0.01) {
      // Save last non-zero direction
      lastMovementDirection.current.copy(movementDirection.normalize())
    }
    
    // Always rotate the model to face the last movement direction
    if (lastMovementDirection.current.lengthSq() > 0) {
      // Create a rotation to match the movement direction
      const targetRotation = new THREE.Quaternion()
      const targetDirection = new THREE.Vector3()
      targetDirection.copy(lastMovementDirection.current)
      
      // Calculate the angle to rotate
      const lookAt = new THREE.Matrix4()
      lookAt.lookAt(
        new THREE.Vector3(0, 0, 0),
        targetDirection,
        new THREE.Vector3(0, 1, 0)
      )
      const targetQuaternion = new THREE.Quaternion()
      targetQuaternion.setFromRotationMatrix(lookAt)
      
      // Smoothly interpolate current rotation to target rotation
      playerGroupRef.current.quaternion.slerp(targetQuaternion, 10 * delta)
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
      <group ref={playerGroupRef}>
        <CapsuleCollider args={[0.5, 0.5]} />
        <mesh castShadow userData={{ isPlayer: true }}>
          <capsuleGeometry args={[0.5, 1, 4, 8]} />
          <meshStandardMaterial color="#ff8800" />
        </mesh>
        {/* Face/front of player */}
        <mesh position={[0, 0.5, -0.5]}>
          <boxGeometry args={[0.5, 0.2, 0.1]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>
    </RigidBody>
  )
}
