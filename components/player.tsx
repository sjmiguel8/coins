"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useKeyboardControls, Text } from "@react-three/drei"
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
  const [moveDirection, setMoveDirection] = useState<string | null>(null)

  // Set up camera to follow player
  useEffect(() => {
    camera.position.set(0, 3, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  useFrame((state, delta) => {
    if (!playerRef.current) return

    // Get current keyboard state
    const keys = getKeys()
    
    // Show which key is pressed in a more visual way
    let currentDirection = null
    if (keys.forward) currentDirection = "FORWARD ↑"
    if (keys.backward) currentDirection = "BACKWARD ↓"
    if (keys.left) currentDirection = "LEFT ←"
    if (keys.right) currentDirection = "RIGHT →"
    
    if (keys.jump) currentDirection = currentDirection ? `${currentDirection} + JUMP` : "JUMP"
    
    // Only update state when direction changes to avoid rerenders
    if (currentDirection !== moveDirection) {
      setMoveDirection(currentDirection)
    }
    
    // Scene switching
    if (keys.scene1) changeScene("forest")
    if (keys.scene2) changeScene("home")
    if (keys.scene3) changeScene("store")

    // Movement - increased strength for more responsive feel
    const impulse = { x: 0, y: 0, z: 0 }
    const torque = { x: 0, y: 0, z: 0 }

    const impulseStrength = 1.2 * delta
    const torqueStrength = 0.4 * delta

    if (keys.forward) {
      impulse.z -= impulseStrength
      torque.x -= torqueStrength
    }

    if (keys.backward) {
      impulse.z += impulseStrength
      torque.x += torqueStrength
    }

    if (keys.right) {
      impulse.x += impulseStrength
      torque.z -= torqueStrength
    }

    if (keys.left) {
      impulse.x -= impulseStrength
      torque.z += torqueStrength
    }

    // Apply movement only if there's actual movement
    if (impulse.x !== 0 || impulse.y !== 0 || impulse.z !== 0) {
      playerRef.current.applyImpulse(impulse, true)
    }
    
    if (torque.x !== 0 || torque.y !== 0 || torque.z !== 0) {
      playerRef.current.applyTorqueImpulse(torque, true)
    }

    // Jump - improved ground detection
    if (keys.jump) {
      const position = playerRef.current.translation()
      
      // Simple ground check - just check if we're close to y=0
      if (position.y < 1.1) {
        playerRef.current.applyImpulse({ x: 0, y: 0.8, z: 0 }, true)
      }
    }

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
    <>
      <RigidBody
        ref={playerRef}
        colliders={false}
        position={[0, 1, 0]}
        friction={1}
        linearDamping={3} /* Increased damping for better control */
        angularDamping={3} /* Increased damping for better control */
        enabledRotations={[false, false, false]}
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
      
      {/* Direction indicator */}
      {moveDirection && (
        <mesh position={[0, 3, 0]}>
          <planeGeometry args={[1, 0.4]} />
          <meshBasicMaterial transparent opacity={0.8} color="#000000" />
          <Text
            position={[0, 0, 0.01]}
            color="white"
            fontSize={0.2}
            anchorX="center"
            anchorY="middle"
          >
            {moveDirection}
          </Text>
        </mesh>
      )}
    </>
  )
}
