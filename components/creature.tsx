"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import * as THREE from "three"

export default function Creature({ position }: { position: [number, number, number] }) {
  const creatureRef = useRef<THREE.Group>(null)
  const rigidBodyRef = useRef<any>(null)
  const [direction, setDirection] = useState(new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize())

  const changeDirectionTime = useRef(Math.random() * 3 + 2)
  const elapsedTime = useRef(0)

  useFrame((state, delta) => {
    if (!creatureRef.current || !rigidBodyRef.current) return

    // Update elapsed time
    elapsedTime.current += delta

    // Change direction randomly
    if (elapsedTime.current > changeDirectionTime.current) {
      setDirection(new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize())

      changeDirectionTime.current = Math.random() * 3 + 2
      elapsedTime.current = 0
    }

    // Move creature
    const currentPos = rigidBodyRef.current.translation()
    const newPos = {
      x: currentPos.x + direction.x * delta * 1.5,
      y: currentPos.y,
      z: currentPos.z + direction.z * delta * 1.5,
    }

    // Boundary check - keep creatures in a certain area
    const boundary = 15
    if (Math.abs(newPos.x) > boundary || Math.abs(newPos.z) > boundary) {
      setDirection(direction.clone().negate())
      newPos.x = Math.max(-boundary, Math.min(boundary, newPos.x))
      newPos.z = Math.max(-boundary, Math.min(boundary, newPos.z))
    }

    rigidBodyRef.current.setTranslation(newPos)

    // Rotate creature to face movement direction
    if (direction.length() > 0) {
      const lookAt = new THREE.Vector3(currentPos.x + direction.x, currentPos.y, currentPos.z + direction.z)
      const lookAtMatrix = new THREE.Matrix4().lookAt(
        new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z),
        lookAt,
        new THREE.Vector3(0, 1, 0),
      )
      const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(lookAtMatrix)
      creatureRef.current.quaternion.slerp(targetQuaternion, delta * 2)
    }
  })

  return (
    <RigidBody ref={rigidBodyRef} type="dynamic" position={position} lockRotations colliders="ball">
      <group ref={creatureRef}>
        <mesh castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#4CAF50" />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.25, 0.25, 0.4]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[-0.25, 0.25, 0.4]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        {/* Pupils */}
        <mesh position={[0.25, 0.25, 0.5]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[-0.25, 0.25, 0.5]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>
    </RigidBody>
  )
}
