import * as THREE from 'three';

export enum TreeMorphState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleData {
  id: number;
  scatterPosition: THREE.Vector3;
  treePosition: THREE.Vector3;
  scatterRotation: THREE.Euler;
  treeRotation: THREE.Euler;
  scale: number;
  speed: number; // For slight variation in animation speed
}

export interface TreeSystemProps {
  treeState: TreeMorphState;
}