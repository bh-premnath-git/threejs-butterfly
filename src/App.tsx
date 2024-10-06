import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { OrbitControls, Sky, Stars, Text } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

function Butterfly() {
  const butterflyRef = useRef<THREE.Group>(null!);
  const [position, setPosition] = useState(new THREE.Vector3(0, 2, 0));
  const [rotation, setRotation] = useState(new THREE.Euler(0, Math.PI, 0));
  const { camera } = useThree();

  // Load the butterfly model using GLTFLoader
  const gltf = useLoader(GLTFLoader, '/animated_butterfly.glb');
  const mixer = useRef<THREE.AnimationMixer>();

  useEffect(() => {
    if (gltf.animations.length > 0 && butterflyRef.current) {
      // Create the animation mixer
      mixer.current = new THREE.AnimationMixer(butterflyRef.current);
      // Play the first animation (index 0)
      const action = mixer.current.clipAction(gltf.animations[0]);
      action.play();
    }
  }, [gltf]);

  useFrame((state, delta) => {
    if (butterflyRef.current) {
      butterflyRef.current.position.copy(position);
      butterflyRef.current.rotation.copy(rotation);

      // Add a gentle floating motion
      butterflyRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.01;

      // Rotate wings (optional if animation already handles this)
      butterflyRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.2;
    }

    // Update animation mixer
    if (mixer.current) {
      mixer.current.update(delta);
    }

    // Camera follows the butterfly
    camera.position.set(position.x, position.y + 3, position.z + 8);
    camera.lookAt(position.x, position.y, position.z);

    // Store butterfly's position in the global window object
    (window as any).butterflyPosition = position;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          setPosition((prev) => new THREE.Vector3(prev.x, prev.y + 0.1, prev.z));
          setRotation(new THREE.Euler(-0.2, Math.PI, 0));
          break;
        case 'ArrowDown':
          setPosition((prev) => new THREE.Vector3(prev.x, prev.y - 0.1, prev.z));
          setRotation(new THREE.Euler(0.2, Math.PI, 0));
          break;
        case 'ArrowLeft':
          setPosition((prev) => new THREE.Vector3(prev.x - 0.1, prev.y, prev.z));
          setRotation(new THREE.Euler(0, Math.PI / 2, 0.2));
          break;
        case 'ArrowRight':
          setPosition((prev) => new THREE.Vector3(prev.x + 0.1, prev.y, prev.z));
          setRotation(new THREE.Euler(0, -Math.PI / 2, -0.2));
          break;
      }
    };

    const handleKeyUp = () => {
      setRotation(new THREE.Euler(0, Math.PI, 0));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return <primitive object={gltf.scene} ref={butterflyRef} scale={[0.8, 0.8, 0.8]} />;
}


function Terrain() {
  const terrainRef = useRef<THREE.Mesh>(null!)

  useFrame(() => {
    if (terrainRef.current) {
      terrainRef.current.rotation.z += 0.001
    }
  })

  return (
    <mesh ref={terrainRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[100, 100, 50, 50]} />
      <meshStandardMaterial color="#4a7349" wireframe side={THREE.DoubleSide} />
    </mesh>
  )
}

function FloatingText() {
  return (
    <Text
      position={[0, 5, -10]}
      color="white"
      fontSize={1}
      maxWidth={10}
      lineHeight={1}
      letterSpacing={0.02}
      textAlign="center"
      anchorX="center"
      anchorY="middle"
    >
      Butterfly Adventure
    </Text>
  )
}

function Instructions() {
  return (
    <div className="absolute top-0 left-0 text-white bg-black bg-opacity-50 p-4 m-4 rounded-lg">
      <h2 className="text-xl font-bold mb-2">Controls:</h2>
      <ul className="list-disc list-inside">
        <li>Use arrow keys to control the butterfly</li>
        <li>Explore the magical world around you</li>
      </ul>
    </div>
  )
}

function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState({ position: { x: 0, y: 0, z: 0 } })

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        position: (window as any).butterflyPosition || { x: 0, y: 0, z: 0 },
      })
    }

    const intervalId = setInterval(updateDebugInfo, 100)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="absolute bottom-0 left-0 text-white bg-black bg-opacity-50 p-2 m-2 rounded">
      <div>
        Position: x: {debugInfo.position.x.toFixed(2)}, y: {debugInfo.position.y.toFixed(2)}, z: {debugInfo.position.z.toFixed(2)}
      </div>
    </div>
  )
}

export default function ButterflyScene() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 3, 8] }}>
        <Sky sunPosition={[100, 10, 100]} />
        <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} castShadow intensity={1} />
        <Suspense fallback={null}>
          <Butterfly />
          <Terrain />
          <FloatingText />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
      <Instructions />
      <DebugInfo />
    </div>
  )
}
