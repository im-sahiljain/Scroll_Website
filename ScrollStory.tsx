"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ==========================================
// 1. 3D GEOMETRY COMPONENTS
// ==========================================

// Toggle this flag to easily switch between the external GLB model and the procedural geometric figure.
const USE_GLB_MODEL = true;

/**
 * Component to load and render the external GLB model.
 */
function GLBModel() {
  const { scene } = useGLTF(
    "/models/20260526_Riseonic_BUILDING_AREA_HS_V013(1).glb",
  );

  const formattedScene = React.useMemo(() => {
    if (!scene) return null;
    const cloned = scene.clone();

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const targetHeight = 45.0;
    if (size.y > 0) {
      const scale = targetHeight / size.y;
      cloned.scale.setScalar(scale);
    }

    const scaledBox = new THREE.Box3().setFromObject(cloned);
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    cloned.position.x = -scaledCenter.x;
    cloned.position.z = -scaledCenter.z;
    cloned.position.y = -5.0 - scaledBox.min.y;

    return cloned;
  }, [scene]);

  if (!formattedScene) return null;
  return <primitive object={formattedScene} />;
}

/**
 * Main building component representing the structural environment.
 * Renders the glowing biophilic plates, floating nodes, and structural rods
 * instantly.
 */
function SceneModel() {
  const modelRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  // Smooth Y-axis rotating animations for building components
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (modelRef.current) {
      modelRef.current.rotation.y = elapsed * 0.05;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = elapsed * 0.15;
      ring1Ref.current.rotation.y = elapsed * 0.08;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -elapsed * 0.1;
      ring2Ref.current.rotation.x = elapsed * 0.05;
    }
  });

  return (
    <group position={[0, -2, 0]}>
      {USE_GLB_MODEL ? (
        /* GLB Model rendering */
        <Suspense fallback={null}>
          <GLBModel />
        </Suspense>
      ) : (
        /* Procedural geometric model */
        <>
          {/* Premium Cybernetic Central Core column */}
          <group ref={modelRef}>
            <mesh castShadow receiveShadow position={[0, 15, 0]}>
              <cylinderGeometry args={[0.65, 0.85, 45, 32]} />
              <meshStandardMaterial
                color="#0f172a"
                roughness={0.2}
                metalness={0.95}
              />
            </mesh>
            {/* Holographic glowing wireframe matrix core */}
            <mesh position={[0, 15, 0]}>
              <cylinderGeometry args={[0.67, 0.87, 45, 16]} />
              <meshBasicMaterial
                color="#22d3ee"
                wireframe
                transparent
                opacity={0.25}
              />
            </mesh>
          </group>

          {/* Futuristic Stacked Translucent Floors */}
          {Array.from({ length: 24 }).map((_, i) => {
            const yPos = -5 + i * 1.5;
            // Vary the scale to create an organic organic double-taper design extending higher up
            const scaleFactor = 1.3 - Math.sin((i / 23) * Math.PI) * 0.4;
            const radius = 2.4 * scaleFactor;

            return (
              <group key={i} position={[0, yPos, 0]}>
                {/* Core slab */}
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[radius, radius * 1.02, 0.12, 32]} />
                  <meshPhysicalMaterial
                    color="#06b6d4" // Vibrant cyan
                    transparent
                    opacity={0.35}
                    roughness={0.1}
                    metalness={0.1}
                    transmission={0.6}
                    ior={1.5}
                  />
                </mesh>

                {/* Glowing Accent Ring on the edge of the slab */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[radius, 0.04, 8, 48]} />
                  <meshBasicMaterial color="#22d3ee" toneMapped={false} />
                </mesh>
              </group>
            );
          })}

          {/* Structural Support Pillars (Vertical gold rods framing the tower) */}
          {[
            [-1.6, -1.6],
            [1.6, -1.6],
            [-1.6, 1.6],
            [1.6, 1.6],
          ].map(([x, z], idx) => (
            <mesh key={idx} position={[x, 15, z]} castShadow receiveShadow>
              <cylinderGeometry args={[0.06, 0.06, 45, 8]} />
              <meshStandardMaterial
                color="#e2e8f0"
                roughness={0.1}
                metalness={0.95}
              />
            </mesh>
          ))}

          {/* Large Technical Facade Wireframe Ring (Rotating Energy Node 1) */}
          <mesh ref={ring1Ref} position={[0, 20.5, 0]}>
            <torusGeometry args={[3.2, 0.08, 16, 64]} />
            <meshStandardMaterial
              color="#34d399" // Mint Emerald
              emissive="#047857"
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>

          {/* Large Technical Facade Wireframe Ring (Rotating Energy Node 2) */}
          <mesh ref={ring2Ref} position={[0, -2, 0]}>
            <torusGeometry args={[3.5, 0.05, 8, 4]} />
            <meshBasicMaterial color="#f59e0b" wireframe />
          </mesh>

          {/* External Technical Cage / Facade grid */}
          <mesh position={[0, 15, 0]}>
            <cylinderGeometry args={[2.8, 2.8, 45, 16, 16, true]} />
            <meshStandardMaterial
              color="#1e293b"
              wireframe
              transparent
              opacity={0.08}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

/**
 * Custom particle system floating gently in the background.
 */
function FloatingParticles({ count = 250 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particlesPosition = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const elapsed = state.clock.getElapsedTime();
    // Soft, organic drifting motion
    pointsRef.current.rotation.y = elapsed * 0.02;
    pointsRef.current.rotation.x = elapsed * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesPosition, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#22d3ee"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ==========================================
// 2. CAMERA AND ANIMATION CONTROLLER
// ==========================================

interface SceneControllerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSectionChange: (index: number) => void;
}

/**
 * Handles R3F camera updates based on the page scroll triggers.
 * By updating camera parameters during R3F useFrame, we bypass React renders for perfect 60fps performance.
 */
function SceneController({
  containerRef,
  onSectionChange,
}: SceneControllerProps) {
  const { camera, controls } = useThree();

  // Mutable target state updated smoothly by GSAP ScrollTrigger.
  // We use spherical coordinates (radius, polarAngle) so that the user's
  // azimuthal angle (horizontal rotation) is fully preserved during scroll!
  const animStateRef = useRef({
    targetY: 36.5,
    radius: 17.09,
    polarAngle: 1.18, // angle from vertical Y axis
  });

  // Initialize camera position and target on mount or when controls are created
  useEffect(() => {
    // Use literal initial values — don't read from animStateRef here
    const initialY = 36.5;
    const initialRadius = 17.09;
    const initialPolar = 1.18;

    let azimuth = Math.atan2(5, 15);
    if (controls) {
      // @ts-ignore
      azimuth = controls.getAzimuthalAngle();
    }
    const spherical = new THREE.Spherical(
      initialRadius,
      initialPolar,
      azimuth,
    );
    const targetVec = new THREE.Vector3(0, initialY, 0);
    camera.position.setFromSpherical(spherical).add(targetVec);

    if (controls) {
      // @ts-ignore
      controls.minPolarAngle = initialPolar;
      // @ts-ignore
      controls.maxPolarAngle = initialPolar;
      // @ts-ignore
      controls.target.copy(targetVec);
      // @ts-ignore
      controls.update();
    } else {
      camera.lookAt(targetVec);
    }
  }, [camera, controls]);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const state = animStateRef.current;

    // CRITICAL: Reset state to original values in case useEffect re-runs
    state.targetY = 36.5;
    state.radius = 17.09;
    state.polarAngle = 1.18;

    const tl = gsap.timeline();
    tl.fromTo(
      state,
      { targetY: 36.5, radius: 17.09, polarAngle: 1.18 }, // from (progress=0)
      { targetY: 12, radius: 17.09, polarAngle: 1.35, ease: "none" },
    ).fromTo(
      state,
      { targetY: 12, radius: 17.09, polarAngle: 1.35 }, // from (progress=0.5)
      { targetY: -14.0, radius: 19.5, polarAngle: 1.35, ease: "none" },
    );

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5,
      animation: tl,
      onUpdate: (self) => {
        const progress = self.progress;
        let activeIndex = 0;
        if (progress >= 0.33 && progress < 0.66) {
          activeIndex = 1;
        } else if (progress >= 0.66) {
          activeIndex = 2;
        }
        onSectionChange(activeIndex);

        const DEFAULT_AZIMUTH = Math.atan2(5, 15);
        let azimuth = DEFAULT_AZIMUTH; // default start
        if (controls) {
          // @ts-ignore
          azimuth = controls.getAzimuthalAngle();
        }

        const spherical = new THREE.Spherical(
          state.radius,
          state.polarAngle,
          azimuth,
        );
        const targetVec = new THREE.Vector3(0, state.targetY, 0);

        camera.position.setFromSpherical(spherical).add(targetVec);

        if (controls) {
          // @ts-ignore
          controls.minPolarAngle = state.polarAngle;
          // @ts-ignore
          controls.maxPolarAngle = state.polarAngle;
          // @ts-ignore
          controls.target.copy(targetVec);
          // @ts-ignore
          controls.update();
        } else {
          camera.lookAt(targetVec);
        }

        if (progress < 0.01 || progress > 0.99) {
          console.log("DEBUG_CAMERA_STATE:", {
            progress,
            state: { ...state },
            cameraPos: camera.position.toArray(),
            controlsTarget: controls
              ? (controls as any).target.toArray()
              : null,
            cameraRotation: [
              camera.rotation.x,
              camera.rotation.y,
              camera.rotation.z,
            ],
          });
        }
      },
    });

    return () => {
      tl.kill();
      trigger.kill();
    };
  }, [containerRef, onSectionChange, camera, controls]);

  useEffect(() => {
    const state = animStateRef.current;
    let azimuth = Math.atan2(5, 15);
    if (controls) {
      // @ts-ignore
      azimuth = controls.getAzimuthalAngle();
    }
    const spherical = new THREE.Spherical(
      state.radius,
      state.polarAngle,
      azimuth,
    );
    const targetVec = new THREE.Vector3(0, state.targetY, 0);
    camera.position.setFromSpherical(spherical).add(targetVec);

    if (controls) {
      // @ts-ignore
      controls.minPolarAngle = state.polarAngle;
      // @ts-ignore
      controls.maxPolarAngle = state.polarAngle;
      // @ts-ignore
      controls.target.copy(targetVec);
      // @ts-ignore
      controls.update();
    } else {
      camera.lookAt(targetVec);
    }
  }, [camera, controls]);

  return null;
}

// ==========================================
// 3. MAIN WRAPPER COMPONENT
// ==========================================

export default function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Safe client-side hydration mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen bg-transparent text-slate-100 overflow-x-hidden font-sans"
    >
      {/* BACKGROUND 3D CANVAS */}
      <div className="fixed top-0 left-0 w-full h-screen z-0 bg-gradient-to-b from-[#020617] via-[#0b1329] to-[#020617]">
        {mounted && (
          <Canvas
            shadows
            camera={{ fov: 45, near: 0.1, far: 1000, position: [5, 43, 15] }}
            gl={{ antialias: true, alpha: true }}
          >
            {/* Subtle Ambient base light */}
            <ambientLight intensity={0.4} />

            {/* Futuristic teal directional light */}
            <directionalLight
              position={[5, 10, 5]}
              intensity={1.5}
              color="#22d3ee"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />

            {/* Warmer secondary filling light to offset the cold cyberpunk tone */}
            <directionalLight
              position={[-5, 2, -5]}
              intensity={0.6}
              color="#e0f2fe"
            />

            {/* Glowing particle system in background */}
            {/* <FloatingParticles count={300} /> */}
            <Stars
              radius={100}
              depth={50}
              count={1000}
              factor={4}
              saturation={0.5}
              fade
              speed={1}
            />

            {/* Core Building Scene */}
            <Suspense fallback={null}>
              <SceneModel />
            </Suspense>

            <OrbitControls
              makeDefault
              enableZoom={false}
              enablePan={false}
              rotateSpeed={0.4}
              enableDamping
              dampingFactor={0.05}
            />

            {/* Custom Scroll Controller linking DOM to camera */}
            <SceneController
              containerRef={containerRef}
              onSectionChange={setActiveSection}
            />
          </Canvas>
        )}
      </div>

      {/* 3D SCROLL TRIGGER ANCHORS (NO TEXT OVERLAYS) */}
      <main className="relative z-30 pointer-events-none">
        {/* Section 1 Trigger: Top structure */}
        <section ref={section1Ref} className="h-[200vh] w-full" />

        {/* Section 2 Trigger: Middle atrium */}
        <section ref={section2Ref} className="h-[200vh] w-full" />

        {/* Section 3 Trigger: Bottom base */}
        <section ref={section3Ref} className="h-[200vh] w-full" />
      </main>
    </div>
  );
}
