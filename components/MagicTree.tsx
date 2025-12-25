import React, { useRef, useMemo, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Float, Trail } from '@react-three/drei';
import { AnimationState } from '../types';

const COUNT = 2000;
const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

interface MagicTreeProps {
  state: AnimationState;
  reducedMotion: boolean;
}

// Ribbon component for the flowing lines
const Ribbon = ({ radius, speed, color, offset, state }: { radius: number, speed: number, color: string, offset: number, state: AnimationState }) => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (!ref.current) return;
        const t = clock.elapsedTime * speed + offset;
        
        // Ribbon movement logic
        if (state === AnimationState.CHAOS) {
            ref.current.position.set(
                Math.sin(t) * radius * 2,
                Math.cos(t * 0.5) * radius * 2,
                Math.cos(t) * radius * 2
            );
        } else {
            // Spiral up the tree
            const spiralY = (Math.sin(t) + 1) * 2.5 - 2.5; // -2.5 to 2.5
            const currentRadius = (2.5 - spiralY) * 0.5 * (radius / 3);
            ref.current.position.x = Math.cos(t * 3) * currentRadius;
            ref.current.position.z = Math.sin(t * 3) * currentRadius;
            ref.current.position.y = spiralY;
        }
    });

    return (
        <Trail width={0.4} length={8} color={new THREE.Color(color)} attenuation={(t) => t * t}>
            <mesh ref={ref}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial color={color} />
            </mesh>
        </Trail>
    );
};

export const MagicTree: React.FC<MagicTreeProps> = ({ state, reducedMotion }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Premium Palette
  const gold = new THREE.Color("#FFD700");
  const deepGold = new THREE.Color("#B8860B");
  const emerald = new THREE.Color("#004225");
  const lightGreen = new THREE.Color("#2E8B57");

  const data = useMemo(() => {
    return new Array(COUNT).fill(0).map((_, i) => {
      // 1. Tree Shape (Cone with spiral clusters)
      const t = i / COUNT; 
      // y goes from -3 (bottom) to 2.5 (top)
      const y = -3 + t * 5.5; 
      const radiusBase = (2.5 - y) * 0.45;
      
      // Add randomness to radius for "fluffy" branches, but keep general cone shape
      const r = radiusBase + (Math.random() - 0.5) * 0.5;
      const angle = t * 50 * Math.PI + (Math.random() * 0.5); 
      
      const treeX = Math.cos(angle) * r;
      const treeZ = Math.sin(angle) * r;
      const treeY = y;

      // 2. Chaos Shape (Nebula)
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const dist = 4 + Math.random() * 4; // Wide spread
      const chaosX = dist * Math.sin(phi) * Math.cos(theta);
      const chaosY = dist * Math.sin(phi) * Math.sin(theta);
      const chaosZ = dist * Math.cos(phi);

      // Color Distribution
      // Outer layer = Gold, Inner layer = Green
      const isInner = Math.random() > 0.6;
      let color = isInner ? (Math.random() > 0.5 ? emerald : lightGreen) : (Math.random() > 0.3 ? gold : deepGold);
      
      return {
        treePos: new THREE.Vector3(treeX, treeY, treeZ),
        chaosPos: new THREE.Vector3(chaosX, chaosY, chaosZ),
        color: color,
        scale: Math.random() * 0.12 + 0.03,
        speed: Math.random() * 0.2 + 0.1,
        phase: Math.random() * Math.PI * 2
      };
    });
  }, []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    data.forEach((d, i) => {
      meshRef.current!.setColorAt(i, d.color);
    });
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [data]);

  // Animation Progress Ref
  const progress = useRef(0);

  useFrame((stateObj, delta) => {
    if (!meshRef.current) return;
    
    // Target logic: If reduced motion, snap. Else lerp.
    const isFormed = state === AnimationState.TREE || state === AnimationState.FINISHED || state === AnimationState.MORPH;
    const target = isFormed ? 1 : 0;
    
    if (reducedMotion) {
        progress.current = target;
    } else {
        // Smooth transition speed
        const speed = isFormed ? 1.5 : 0.8; 
        progress.current = THREE.MathUtils.damp(progress.current, target, speed, delta);
    }

    const t = stateObj.clock.elapsedTime;
    const mix = progress.current;

    data.forEach((d, i) => {
      const { treePos, chaosPos, scale, speed, phase } = d;

      // Mix positions
      // We add a curve to the mix so particles don't just travel linear lines
      const p = new THREE.Vector3();
      p.lerpVectors(chaosPos, treePos, mix);

      // Add "Life" to particles
      if (mix > 0.8) {
          // Tree shimmer
          p.y += Math.sin(t * 2 + phase) * 0.02;
          
          // Gentle rotation of the whole tree
          const rot = t * 0.1;
          const x = p.x * Math.cos(rot) - p.z * Math.sin(rot);
          const z = p.x * Math.sin(rot) + p.z * Math.cos(rot);
          p.x = x;
          p.z = z;
      } else {
          // Chaos drift
          p.x += Math.sin(t * speed + phase) * 0.01;
          p.y += Math.cos(t * speed + phase) * 0.01;
          p.z += Math.sin(t * speed * 0.5 + phase) * 0.01;
      }

      tempObject.position.copy(p);
      
      // Scale pop effect during morph
      const pop = Math.sin(mix * Math.PI) * 0.2; 
      tempObject.scale.setScalar(scale + pop);
      
      // Face camera-ish
      tempObject.rotation.set(t * speed, t * speed * 0.5, 0);

      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* The Particle Tree */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial 
            roughness={0.3} 
            metalness={0.9} 
            emissive="#cfcfcf"
            emissiveIntensity={0.1}
        />
      </instancedMesh>

      {/* The Golden Ribbons - Only show if not reduced motion or strictly in tree state */}
      {!reducedMotion && (
          <>
            <Ribbon radius={3} speed={0.5} offset={0} color="#FFD700" state={state} />
            <Ribbon radius={3.5} speed={0.4} offset={2} color="#F0E68C" state={state} />
            <Ribbon radius={2.5} speed={0.6} offset={4} color="#DAA520" state={state} />
          </>
      )}

      {/* Star at the top */}
      <mesh position={[0, 2.8, 0]}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
        <pointLight intensity={2} distance={5} color="white" />
      </mesh>
    </group>
  );
};