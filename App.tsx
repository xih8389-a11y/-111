import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Loader } from '@react-three/drei';
import { TreeSystem } from './components/TreeSystem';
import { Environment } from './components/Environment';
import { TreeMorphState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeMorphState>(TreeMorphState.SCATTERED);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeMorphState.SCATTERED 
        ? TreeMorphState.TREE_SHAPE 
        : TreeMorphState.SCATTERED
    );
  };

  const isTree = treeState === TreeMorphState.TREE_SHAPE;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          dpr={[1, 2]} // Quality scaling
          camera={{ position: [0, 0, 30], fov: 45 }} // Moved back to ensure full visibility
          gl={{ antialias: false, alpha: false }}
        >
          <Suspense fallback={null}>
            <TreeSystem treeState={treeState} />
            <Environment />
            <OrbitControls 
                enablePan={false} 
                minPolarAngle={Math.PI / 2 - 0.5} 
                maxPolarAngle={Math.PI / 2 + 0.5}
                minDistance={10}
                maxDistance={45}
                autoRotate={isTree} // Gently rotate when formed
                autoRotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Loading Overlay (Drei built-in) */}
      <Loader 
        containerStyles={{ backgroundColor: '#050505' }}
        innerStyles={{ width: '200px', height: '2px', backgroundColor: '#333' }}
        barStyles={{ height: '2px', backgroundColor: '#D4AF37' }}
        dataStyles={{ color: '#D4AF37', fontFamily: 'serif', fontSize: '12px' }}
      />

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        
        {/* Header / Brand */}
        <header className="flex flex-col items-center md:items-start text-center md:text-left pointer-events-auto transition-opacity duration-1000 ease-out">
          <h2 className="text-arix-gold text-xs tracking-[0.3em] uppercase mb-2 font-sans opacity-80">
            Arix Collection
          </h2>
          <h1 className="text-4xl md:text-6xl text-white font-serif tracking-tight leading-tight drop-shadow-2xl">
            Signature <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-arix-gold to-arix-gold-light italic">
              Interactive
            </span>
          </h1>
        </header>

        {/* Interaction Controls */}
        <footer className="flex flex-col items-center justify-end pb-8 pointer-events-auto">
          
          <div className="mb-6 max-w-md text-center">
            <p className={`text-sm md:text-base text-gray-300 font-serif italic transition-opacity duration-700 ${isTree ? 'opacity-100' : 'opacity-0'}`}>
              "A convergence of elegance and technology, forming the spirit of the season."
            </p>
          </div>

          <button
            onClick={toggleState}
            className="group relative px-8 py-3 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          >
            {/* Button Background & Border */}
            <div className="absolute inset-0 border border-arix-gold opacity-50 rounded-full group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-arix-gold opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></div>
            
            {/* Button Content */}
            <span className="relative z-10 font-sans text-xs md:text-sm tracking-[0.2em] uppercase text-arix-gold group-hover:text-white transition-colors duration-300 flex items-center gap-3">
              {isTree ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-arix-green animate-pulse"></span>
                  Release to Scatter
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-arix-gold animate-pulse"></span>
                  Assemble Form
                </>
              )}
            </span>
          </button>
          
          <div className="mt-8 text-[10px] text-gray-600 tracking-widest uppercase font-sans opacity-50">
            Experience 2024
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;