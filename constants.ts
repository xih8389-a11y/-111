import * as THREE from 'three';

// Visual Palette
export const COLORS = {
  EMERALD: new THREE.Color('#084a28'),   // Deep forest green
  EMERALD_LIGHT: new THREE.Color('#1f7a46'), 
  GOLD: new THREE.Color('#FFD700'),
  GOLD_WARM: new THREE.Color('#FFC000'),
  RED_VELVET: new THREE.Color('#960018'), // Carmine/Ruby red
  SILVER: new THREE.Color('#E5E4E2'),     // Platinum
  NIGHT_SKY: new THREE.Color('#020408'),  // Almost black blue
  NIGHT_BLUE: new THREE.Color('#0a1529'), // Deep atmospheric blue
  SNOW: new THREE.Color('#F0F8FF'),
};

// Tree Dimensions (Adjusted for better framing)
export const TREE_HEIGHT = 16;
export const TREE_RADIUS = 6.5;
export const SCATTER_RADIUS = 35;

// Particle Counts
export const NEEDLE_COUNT = 7000;   // Increased density for softer look
export const ORNAMENT_COUNT = 600; 
export const RIBBON_COUNT = 1600;   

// Animation
export const ANIMATION_DURATION = 3.5; // Majestic slow morph