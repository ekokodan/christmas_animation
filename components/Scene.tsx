import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { MagicTree } from './MagicTree';
import { AnimationState } from '../types';

interface SceneProps {
  animState: AnimationState;
  reducedMotion: boolean;
}

const CameraRig: React.FC<{ state: AnimationState; reducedMotion: boolean }> = ({ state, reducedMotion }) => {
    const { camera } = useThree();
    const vec = new THREE.Vector3();

    useFrame((stateObj, delta) => {
        if (reducedMotion) {
            camera.position.set(0, 0, 9);
            camera.lookAt(0, 0, 0);
            return;
        }

        // Cinematic push-in
        let targetZ = 14; // Intro distance
        if (state === AnimationState.MORPH || state === AnimationState.TREE || state === AnimationState.FINISHED) {
            targetZ = 8; // Close up
        }
        
        // Lerp camera z
        camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 0.8, delta);
        
        // Gentle sway
        const t = stateObj.clock.elapsedTime;
        camera.position.x = Math.sin(t * 0.1) * 0.5;
        camera.position.y = Math.cos(t * 0.15) * 0.2;
        
        camera.lookAt(0, 0.5, 0); // Look slightly up at the tree center
    });
    
    return null;
}

export const Scene: React.FC<SceneProps> = ({ animState, reducedMotion }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <Canvas 
        ref={canvasRef}
        gl={{ preserveDrawingBuffer: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }} 
        dpr={[1, 1.5]} // Limit DPR for performance
    >
      <color attach="background" args={['#020408']} />
      
      <CameraRig state={animState} reducedMotion={reducedMotion} />

      {/* Lighting: Premium Studio Setup */}
      <ambientLight intensity={0.2} />
      {/* Key Light (Warm Gold) */}
      <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={15} color="#ffd700" castShadow />
      {/* Rim Light (Cool/Greenish) - gives the tree depth */}
      <spotLight position={[-10, 5, -5]} angle={0.5} penumbra={1} intensity={10} color="#2E8B57" />
      {/* Fill Light */}
      <pointLight position={[0, -5, 5]} intensity={2} color="#ffffff" />

      <Suspense fallback={null}>
        <MagicTree state={animState} reducedMotion={reducedMotion} />
        <Environment preset="night" /> 
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      </Suspense>

      <ContactShadows resolution={1024} scale={20} blur={2.5} opacity={0.4} far={10} color="#000000" />
      
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};