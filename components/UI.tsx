import React, { useState } from 'react';
import { Shuffle, Eye, EyeOff, Play } from 'lucide-react';
import { AnimationState } from '../types';

interface UIProps {
  animState: AnimationState;
  setAnimState: (s: AnimationState) => void;
  reducedMotion: boolean;
  setReducedMotion: (b: boolean) => void;
}

export const UI: React.FC<UIProps> = ({ animState, setAnimState, reducedMotion, setReducedMotion }) => {
  const [showUI, setShowUI] = useState(true);

  const toggleAnimation = () => {
    // If we are in tree mode, break to chaos. If in chaos, start morph.
    if (animState === AnimationState.TREE || animState === AnimationState.FINISHED) {
        setAnimState(AnimationState.CHAOS);
    } else {
        setAnimState(AnimationState.MORPH);
    }
  };

  return (
    <div className={`absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10 transition-opacity duration-500 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Header / Brand */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-3xl font-bold text-white font-serif tracking-wide drop-shadow-lg">
            ThinkBridge
          </h1>
          <p className="text-yellow-100/60 text-xs tracking-widest uppercase mt-1">Holiday Experience</p>
        </div>
        
        {/* Visibility Toggle for Recording */}
        <button 
            onClick={() => setShowUI(false)} 
            className="text-white/30 hover:text-white transition-colors"
            title="Hide UI for Recording"
        >
            <EyeOff className="w-5 h-5" />
        </button>
      </div>

      {/* Central Message Area - Fades in when animation is FINISHED */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl text-center transition-all duration-1000 ${animState === AnimationState.FINISHED ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
         <div className="space-y-6">
            <h2 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                Happy Holidays
            </h2>
            <p className="text-xl text-green-100/80 font-light tracking-wide">
                from ThinkBridge
            </p>
         </div>
      </div>

      {/* Bottom Controls */}
      <div className={`flex flex-col md:flex-row justify-between items-end gap-4 pointer-events-auto w-full transition-all duration-500 ${animState === AnimationState.FINISHED ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        
        {/* Reduced Motion Toggle */}
        <button 
            onClick={() => setReducedMotion(!reducedMotion)}
            className="text-xs text-white/40 hover:text-white flex items-center gap-2 bg-black/20 backdrop-blur px-3 py-1 rounded-full"
        >
            {reducedMotion ? "Enable Motion" : "Reduce Motion"}
        </button>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={toggleAnimation}
            className="group relative px-6 py-3 bg-white/5 border border-white/10 hover:border-yellow-500/50 rounded-full text-white font-medium transition-all hover:bg-white/10 backdrop-blur-md overflow-hidden"
          >
            <span className="flex items-center gap-2">
              {animState === AnimationState.CHAOS ? <Play className="w-4 h-4 text-yellow-400 fill-current" /> : <Shuffle className="w-4 h-4" />}
              {animState === AnimationState.CHAOS ? "Play Animation" : "Replay"}
            </span>
          </button>
        </div>
      </div>
      
      {/* Recording Hint (Hidden by default, shown if UI is hidden) */}
      {!showUI && (
          <div className="fixed bottom-4 right-4 pointer-events-auto">
              <button onClick={() => setShowUI(true)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white">
                  <Eye className="w-6 h-6" />
              </button>
          </div>
      )}
    </div>
  );
};