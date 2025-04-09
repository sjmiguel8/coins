"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { RigidBody, CapsuleCollider, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useGameContext } from "./game-context";

enum Controls {
  forward = "forward",
  backward = "backward",
  left = "left",
  right = "right",
  jump = "jump",
  scene1 = "scene1",
  scene2 = "scene2",
  scene3 = "scene3",
}

interface PlayerProps {
  startPosition?: [number, number, number];
}

export default function Player({ startPosition = [0, 1.5, 0] }: PlayerProps) {
  const playerRef = useRef<RapierRigidBody>(null);
  const playerGroupRef = useRef<THREE.Group>(null);
  const [, getKeys] = useKeyboardControls<Controls>();
  const { camera, controls } = useThree();
  const { changeScene } = useGameContext();

  const lastMovementDirection = useRef(new THREE.Vector3(0, 0, -1));
  const currentVelocity = useRef({ x: 0, y: 0, z: 0 });
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setTranslation(
        { x: startPosition[0], y: startPosition[1], z: startPosition[2] },
        true
      );
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      playerRef.current.wakeUp();
    }

    camera.position.set(startPosition[0], startPosition[1] + 6, startPosition[2] + 10);
  }, [camera, startPosition]);

  useFrame((state, delta) => {
    if (!playerRef.current || !playerGroupRef.current || isTransitioning.current) return;

    const clampedDelta = Math.min(delta, 0.1);
    const keys = getKeys();

    if (keys.scene1 || keys.scene2 || keys.scene3) {
      isTransitioning.current = true;

      if (keys.scene1) changeScene("forest");
      else if (keys.scene2) changeScene("home");
      else if (keys.scene3) changeScene("store");

      setTimeout(() => {
        isTransitioning.current = false;
      }, 100);
    }

    const position = playerRef.current.translation();
    if (position.y < -10) {
      playerRef.current.setTranslation(
        { x: startPosition[0], y: startPosition[1], z: startPosition[2] },
        true
      );
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    const moveSpeed = 5.0;
    const rigidBodyVelocity = playerRef.current.linvel();
    const targetVelocity = { x: 0, y: rigidBodyVelocity.y, z: 0 };
    const movementDirection = new THREE.Vector3(0, 0, 0);

    if (keys.forward) {
      targetVelocity.z = -moveSpeed;
      movementDirection.z -= 1;
    }
    if (keys.backward) {
      targetVelocity.z = moveSpeed;
      movementDirection.z += 1;
    }
    if (keys.left) {
      targetVelocity.x = -moveSpeed;
      movementDirection.x -= 1;
    }
    if (keys.right) {
      targetVelocity.x = moveSpeed;
      movementDirection.x += 1;
    }

    if ((keys.forward || keys.backward) && (keys.left || keys.right)) {
      const length = Math.sqrt(targetVelocity.x ** 2 + targetVelocity.z ** 2);
      if (length > 0) {
        targetVelocity.x = (targetVelocity.x / length) * moveSpeed;
        targetVelocity.z = (targetVelocity.z / length) * moveSpeed;
      }
    }

    const smoothFactor = 10.0 * clampedDelta;
    currentVelocity.current.x = THREE.MathUtils.lerp(
      currentVelocity.current.x,
      targetVelocity.x,
      smoothFactor
    );
    currentVelocity.current.z = THREE.MathUtils.lerp(
      currentVelocity.current.z,
      targetVelocity.z,
      smoothFactor
    );

    try {
      playerRef.current.setLinvel(
        {
          x: currentVelocity.current.x,
          y: targetVelocity.y,
          z: currentVelocity.current.z,
        },
        true
      );
    } catch (e) {
      console.warn("Could not set player velocity");
    }

    if (movementDirection.lengthSq() > 0.01) {
      lastMovementDirection.current.copy(movementDirection.normalize());
    }

    if (
      (Math.abs(currentVelocity.current.x) > 0.1 || Math.abs(currentVelocity.current.z) > 0.1) &&
      lastMovementDirection.current.lengthSq() > 0
    ) {
      const lookAt = new THREE.Matrix4();
      lookAt.lookAt(
        new THREE.Vector3(0, 0, 0),
        lastMovementDirection.current,
        new THREE.Vector3(0, 1, 0)
      );
      const targetQuaternion = new THREE.Quaternion();
      targetQuaternion.setFromRotationMatrix(lookAt);

      const rotationSpeed = Math.min(1.0, 5.0 * clampedDelta);
      playerGroupRef.current.quaternion.slerp(targetQuaternion, rotationSpeed);
    }

    if (keys.jump) {
      const position = playerRef.current.translation();
      if (position.y < 1.1) {
        playerRef.current.setLinvel(
          {
            x: currentVelocity.current.x,
            y: 10.0,
            z: currentVelocity.current.z,
          },
          true
        );
      }
    }

    const playerPosition = playerRef.current.translation();
    const cameraTarget = new THREE.Vector3(playerPosition.x, playerPosition.y + 1, playerPosition.z);

    if (controls) {
      controls.target.copy(cameraTarget);
      controls.update();
    }
  });

  return (
    <RigidBody
      ref={playerRef}
      colliders={false}
      position={startPosition}
      friction={0.2}
      linearDamping={4}
      angularDamping={5}
      lockRotations
      type="dynamic"
      mass={1}
      restitution={0.1}
      gravityScale={1.5}
    >
      <group ref={playerGroupRef}>
        <CapsuleCollider args={[0.5, 0.5]} friction={0.5} restitution={0} density={1.2} />
        <mesh castShadow userData={{ isPlayer: true }} scale={[0.8, 0.8, 0.8]}>
          <capsuleGeometry args={[0.5, 1, 4, 8]} />
          <meshStandardMaterial color="#ff8800" />
        </mesh>
        <mesh position={[0, 0.5, -0.5]}>
          <boxGeometry args={[0.5, 0.2, 0.1]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>
    </RigidBody>
  );
}
