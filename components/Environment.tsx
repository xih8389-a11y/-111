import React from 'react';
import { Stars, Sparkles, Environment as DreiEnv } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { COLORS } from '../constants';

export const Environment: React.FC = () => {
  return (
    <>
      {/* --- Cinematic Lighting --- */}
      <ambientLight intensity={0.2} color={COLORS.NIGHT_BLUE} />
      
      {/* Key Light - Warm Gold (The Star's Glow / Holiday warmth) */}
      <spotLight 
        position={[8, 20, 12]} 
        angle={0.6} 
        penumbra={0.8} 
        intensity={200} 
        color="#ffeebb" 
        castShadow 
        shadow-bias={-0.0001}
      />
      
      {/* Rim Light - Cool Moonlight for contrast */}
      <spotLight 
        position={[-15, 10, -15]} 
        angle={0.8} 
        penumbra={1} 
        intensity={150} 
        color="#6688cc" 
      />

      {/* Fill Light from bottom - Magical uplight */}
      <pointLight position={[0, -8, 5]} intensity={50} color="#ffaa00" distance={20} />

      {/* --- Particles --- */}
      {/* Distant Stars */}
      <Stars radius={100} depth={60} count={8000} factor={4} saturation={0.5} fade speed={0.2} />
      
      {/* Falling Snow (White/Blue Sparkles) */}
      <Sparkles 
        count={800} 
        scale={[40, 40, 40]} 
        size={5} 
        speed={0.4} 
        opacity={0.8} 
        color="#eefeff"
      />
      
      {/* Floating Gold Magic Dust */}
      <Sparkles 
        count={300} 
        scale={[20, 25, 20]} 
        size={8} 
        speed={0.2} 
        opacity={0.5} 
        color={COLORS.GOLD} 
      />

      {/* --- Reflections --- */}
      {/* City preset gives nice metallic reflections for ornaments */}
      <DreiEnv preset="city" blur={0.8} background={false} />

      {/* --- Post Processing --- */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.6} 
            mipmapBlur 
            intensity={2.5} 
            radius={0.4} 
            levels={8} 
        />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
        <Noise opacity={0.02} />
      </EffectComposer>
      
      {/* --- Background --- */}
      <color attach="background" args={[COLORS.NIGHT_SKY]} />
      {/* Deep Blue Fog for depth and seamless horizon */}
      <fog attach="fog" args={[COLORS.NIGHT_BLUE, 25, 90]} />
    </>
  );
};