import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Circle, Html, OrbitControls, Sky, Stars, Stats, useProgress } from '@react-three/drei';
import * as THREE from 'three';

function Loader() {
  const { progress } = useProgress()
  return <Html center>{progress.toFixed(0)}% loaded</Html>
}

function CityModel() {
  const gltf = useLoader(GLTFLoader, '/models/city.glb')
  const modelRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.001
    }
  })

  return (
    <primitive
      ref={modelRef}
      object={gltf.scene}
      position={[0, 0, 0]}
      scale={hovered ? 1.1 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[-5, 10, 5]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
    </>
  )
}

function Environment() {
  return (
    <>
      <Sky sunPosition={[100, 10, 100]} />
      <Stars radius={300} depth={50} count={5000} factor={4} />
      <Circle args={[30]} rotation-x={-Math.PI / 2} receiveShadow>
        <meshStandardMaterial color="#3f7b9d" />
      </Circle>
    </>
  )
}

function CameraController() {
  const { camera, gl } = useThree();
  useFrame((state) => {
    camera.position.lerp(new THREE.Vector3(-0.5, 1, 2), 0.05)
    camera.lookAt(0, 0, 0)
  })
  return <OrbitControls args={[camera, gl.domElement]} />
}

const Scene: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Canvas shadows camera={{ position: [-0.5, 1, 2], fov: 60 }}>
        <CameraController />
        <Lights />
        <Environment />
        <CityModel />
        <axesHelper args={[5]} />
        <Stats />
      </Canvas>
    </Suspense>
  );
};

export default Scene;