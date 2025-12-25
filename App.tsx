import React, { useState, useEffect } from 'react';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { AnimationState } from './types';

function App() {
  const [animState, setAnimState] = useState<AnimationState>(AnimationState.CHAOS);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
        setReducedMotion(true);
        setAnimState(AnimationState.FINISHED); // Skip straight to end
    } else {
        // Auto-play sequence
        const t1 = setTimeout(() => {
            setAnimState(AnimationState.MORPH);
        }, 1000); // Wait 1s then start forming

        const t2 = setTimeout(() => {
            setAnimState(AnimationState.TREE);
        }, 4000); // 3 seconds to form tree

        const t3 = setTimeout(() => {
            setAnimState(AnimationState.FINISHED);
        }, 5500); // Reveal text shortly after tree is formed

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        }
    }
  }, []);

  return (
    <div className="relative w-full h-full bg-[#020408]">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene animState={animState} reducedMotion={reducedMotion} />
      </div>

      {/* UI Overlay Layer */}
      <UI 
        animState={animState} 
        setAnimState={setAnimState} 
        reducedMotion={reducedMotion}
        setReducedMotion={setReducedMotion}
      />
    </div>
  );
}

export default App;