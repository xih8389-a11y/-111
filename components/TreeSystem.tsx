import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMorphState, ParticleData, TreeSystemProps } from '../types';
import { 
    NEEDLE_COUNT, 
    ORNAMENT_COUNT, 
    RIBBON_COUNT,
    TREE_HEIGHT, 
    TREE_RADIUS, 
    SCATTER_RADIUS, 
    COLORS, 
    ANIMATION_DURATION 
} from '../constants';

// --- Helper: Random Point ---
const randomPointInSphere = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
};

// --- Helper: Generate Star Shape ---
const createStarShape = (innerRadius: number, outerRadius: number, points: number) => {
    const shape = new THREE.Shape();
    const PI2 = Math.PI * 2;
    // Start at top
    shape.moveTo(0, outerRadius);
    
    for(let i=1; i < points * 2; i++) {
        const r = i % 2 === 1 ? innerRadius : outerRadius;
        const a = (i / (points * 2)) * PI2;
        // Rotate -PI/2 so 0 is up, actually shape coord system is Y up so add PI/2
        // Standard circle starts at 3 o'clock. We want 12 o'clock.
        const x = Math.cos(a + Math.PI/2) * r;
        const y = Math.sin(a + Math.PI/2) * r;
        shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
}

// --- Logic: Soft Layered Pine Tree ---
const generatePineTreeData = () => {
    const needles: ParticleData[] = [];
    const ornaments: ParticleData[] = [];
    const ribbons: ParticleData[] = [];

    // Configuration
    const layers = 22; // More layers for dense look
    
    // We want to distribute needles somewhat evenly, but more at the bottom.
    // Let's iterate layers from bottom to top.
    
    let needleId = 0;
    
    // Keep track of branch tips for potential ornament placement
    const branchTips: THREE.Vector3[] = [];

    for (let l = 0; l < layers; l++) {
        const tLayer = l / (layers - 1); // 0 (bottom) to 1 (top)
        
        // Non-linear height distribution (tighter at top)
        const y = -TREE_HEIGHT/2 + tLayer * TREE_HEIGHT;
        
        // Base radius for this layer
        const layerRadius = TREE_RADIUS * (1 - tLayer * 0.9) + 0.2; // Tapers to top
        
        // Number of branches in this layer
        const branchCount = Math.floor(10 + 15 * (1 - tLayer));
        
        // Angle offset per layer to stagger branches
        const layerAngleOffset = l * 0.5;

        // Needles per branch
        const needlesPerBranch = Math.floor((NEEDLE_COUNT / layers) / branchCount * 1.5); 

        for (let b = 0; b < branchCount; b++) {
            const angle = (b / branchCount) * Math.PI * 2 + layerAngleOffset + (Math.random()*0.2);
            
            // Calculate Branch vector
            // Branches droop due to gravity. 
            // We simulate a curve: P(t) = (r*t, -droop*t^2, 0) rotated by angle
            
            const maxDroop = 1.5 * (1 - tLayer * 0.5); // Bottom branches droop more
            
            // Generate needles along the branch
            for (let n = 0; n < needlesPerBranch; n++) {
                const tBranch = n / (needlesPerBranch - 1); // 0 to 1 along branch length
                
                // Radius at this point along branch
                const r = tBranch * layerRadius;
                // Droop y
                const dy = Math.pow(tBranch, 1.8) * maxDroop;
                
                const xBase = Math.cos(angle) * r;
                const zBase = Math.sin(angle) * r;
                const yBase = y - dy;

                // Add volumetric noise ("fuzz") so it's a branch volume, not a line
                const fuzz = 0.5 * (1 - tBranch * 0.5); // Fuzzier near trunk
                
                const pos = new THREE.Vector3(
                    xBase + (Math.random()-0.5)*fuzz,
                    yBase + (Math.random()-0.5)*fuzz,
                    zBase + (Math.random()-0.5)*fuzz
                );

                // LookAt logic: Needles point outward/forward
                const dummy = new THREE.Object3D();
                dummy.position.copy(pos);
                dummy.lookAt(xBase * 2, yBase, zBase * 2); // Point away from center
                dummy.rotateZ((Math.random()-0.5)); // Random twist

                if (needleId < NEEDLE_COUNT) {
                    needles.push({
                        id: needleId++,
                        treePosition: pos,
                        scatterPosition: randomPointInSphere(SCATTER_RADIUS),
                        treeRotation: dummy.rotation,
                        scatterRotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0),
                        scale: 0.5 + Math.random() * 0.5,
                        speed: 0.5 + Math.random() * 0.5
                    });
                }
                
                // If this is near the tip (last 10%), save for ornament
                if (tBranch > 0.9 && Math.random() > 0.7) {
                    branchTips.push(new THREE.Vector3(xBase, yBase - 0.2, zBase)); // Hang slightly below
                }
            }
        }
    }

    // --- Ornaments ---
    // 1. Place on tips (Priority)
    // 2. Fill random gaps if count not reached
    
    // Shuffle tips
    branchTips.sort(() => Math.random() - 0.5);

    for (let i = 0; i < ORNAMENT_COUNT; i++) {
        let pos: THREE.Vector3;
        
        if (i < branchTips.length) {
            pos = branchTips[i];
        } else {
            // Random fill
            const t = Math.random();
            const y = -TREE_HEIGHT/2 + t * TREE_HEIGHT * 0.9;
            const r = (TREE_RADIUS * (1 - t)) * Math.random();
            const a = Math.random() * Math.PI * 2;
            pos = new THREE.Vector3(Math.cos(a)*r, y, Math.sin(a)*r);
        }

        ornaments.push({
            id: i,
            treePosition: pos,
            scatterPosition: randomPointInSphere(SCATTER_RADIUS),
            treeRotation: new THREE.Euler(0,0,0),
            scatterRotation: new THREE.Euler(Math.random()*6, Math.random()*6, 0),
            scale: 0.6 + Math.random() * 0.6,
            speed: 0.3 + Math.random() * 0.4
        });
    }

    // --- Ribbon (Double Helix Spiral) ---
    // Smooth spiral curve
    const spiralLoops = 6;
    for (let i = 0; i < RIBBON_COUNT; i++) {
        const t = i / RIBBON_COUNT;
        // height
        const y = -TREE_HEIGHT/2 + t * TREE_HEIGHT;
        // Radius tapers
        const r = (TREE_RADIUS + 0.5) * (1 - t * 0.95);
        
        // Angle
        const angle = t * Math.PI * 2 * spiralLoops;
        
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        
        const pos = new THREE.Vector3(x, y, z);
        
        // Calculate tangent for rotation
        const nextT = (i+1)/RIBBON_COUNT;
        const nextY = -TREE_HEIGHT/2 + nextT * TREE_HEIGHT;
        const nextAngle = nextT * Math.PI * 2 * spiralLoops;
        const nextPos = new THREE.Vector3(Math.cos(nextAngle)*r, nextY, Math.sin(nextAngle)*r);
        
        const dummy = new THREE.Object3D();
        dummy.position.copy(pos);
        dummy.lookAt(nextPos);

        ribbons.push({
            id: i,
            treePosition: pos,
            scatterPosition: randomPointInSphere(SCATTER_RADIUS),
            treeRotation: dummy.rotation,
            scatterRotation: new THREE.Euler(Math.random()*6, Math.random()*6, 0),
            scale: 1,
            speed: 0.2 + Math.random() * 0.3
        });
    }

    return { needles, ornaments, ribbons };
};

export const TreeSystem: React.FC<TreeSystemProps> = ({ treeState }) => {
  const needleRef = useRef<THREE.InstancedMesh>(null);
  const ornamentRef = useRef<THREE.InstancedMesh>(null);
  const ribbonRef = useRef<THREE.InstancedMesh>(null);
  const starRef = useRef<THREE.Group>(null);
  
  const progress = useRef(0);

  // Generate Data
  const { needles, ornaments, ribbons } = useMemo(() => generatePineTreeData(), []);

  // Set Colors for Ornaments
  useLayoutEffect(() => {
    if (ornamentRef.current) {
        const tempColor = new THREE.Color();
        for (let i = 0; i < ORNAMENT_COUNT; i++) {
            const r = Math.random();
            if (r < 0.4) tempColor.set(COLORS.GOLD); // 40% Gold
            else if (r < 0.7) tempColor.set(COLORS.RED_VELVET); // 30% Red
            else if (r < 0.9) tempColor.set(COLORS.SILVER); // 20% Silver
            else tempColor.set(COLORS.EMERALD_LIGHT).addScalar(0.2); // 10% Shiny Green
            
            ornamentRef.current.setColorAt(i, tempColor);
        }
        ornamentRef.current.instanceColor!.needsUpdate = true;
    }
  }, [ornaments]);

  useFrame((state, delta) => {
    const dest = treeState === TreeMorphState.TREE_SHAPE ? 1 : 0;
    const speed = delta / ANIMATION_DURATION;
    
    // Smooth damp
    if (progress.current < dest) progress.current = Math.min(progress.current + speed, dest);
    else if (progress.current > dest) progress.current = Math.max(progress.current - speed, dest);
    
    const t = progress.current;
    // Cubic Ease In/Out for majestic feel
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const dummy = new THREE.Object3D();

    // 1. Needles
    if (needleRef.current) {
        needles.forEach((data, i) => {
            dummy.position.lerpVectors(data.scatterPosition, data.treePosition, easeT);
            
            if (t > 0.8) {
                dummy.rotation.copy(data.treeRotation);
                // Gentle breeze
                dummy.rotation.z += Math.sin(state.clock.elapsedTime * 1.5 + data.treePosition.x * 0.5) * 0.03;
            } else {
                dummy.rotation.set(
                    data.scatterRotation.x + state.clock.elapsedTime * 0.5, 
                    data.scatterRotation.y + state.clock.elapsedTime * 0.5, 
                    0
                );
            }
            
            // Pop effect
            const scale = data.scale * (0.2 + 0.8 * easeT);
            dummy.scale.setScalar(scale);
            
            dummy.updateMatrix();
            needleRef.current!.setMatrixAt(i, dummy.matrix);
        });
        needleRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Ornaments
    if (ornamentRef.current) {
        ornaments.forEach((data, i) => {
            dummy.position.lerpVectors(data.scatterPosition, data.treePosition, easeT);
            
            // Gently swing when formed
            if (t > 0.9) {
                dummy.rotation.x = Math.sin(state.clock.elapsedTime * 2 + i) * 0.1;
            } else {
                dummy.rotation.y += delta;
            }

            const popScale = Math.min(1, easeT * 1.1); // Slightly delayed
            dummy.scale.setScalar(data.scale * popScale);

            dummy.updateMatrix();
            ornamentRef.current!.setMatrixAt(i, dummy.matrix);
        });
        ornamentRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. Ribbons
    if (ribbonRef.current) {
        ribbons.forEach((data, i) => {
            dummy.position.lerpVectors(data.scatterPosition, data.treePosition, easeT);
            
            if (t > 0.5) {
                dummy.rotation.copy(data.treeRotation);
                // Shimmer
                dummy.rotation.x += Math.sin(state.clock.elapsedTime * 4 + i) * 0.1;
            } else {
                 dummy.rotation.copy(data.scatterRotation);
            }

            const visible = Math.min(1, easeT * 1.5);
            dummy.scale.setScalar(visible * 0.8);

            dummy.updateMatrix();
            ribbonRef.current!.setMatrixAt(i, dummy.matrix);
        });
        ribbonRef.current.instanceMatrix.needsUpdate = true;
    }

    // 4. Star Topper Animation
    if (starRef.current) {
        // Only visible when tree is mostly formed
        const starVisible = Math.max(0, (easeT - 0.7) * 3.33); // 0 to 1 over last 30%
        starRef.current.scale.setScalar(starVisible * 1.2); // Overshoot slightly
        
        // Spin slowly
        starRef.current.rotation.y = state.clock.elapsedTime * 0.3;
        // Bob slightly
        starRef.current.position.y = (TREE_HEIGHT/2 + 0.8) + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  const starShape = useMemo(() => createStarShape(0.6, 1.4, 5), []);

  return (
    <group>
      {/* Needles: Instanced Mesh */}
      <instancedMesh ref={needleRef} args={[undefined, undefined, NEEDLE_COUNT]}>
        <boxGeometry args={[0.06, 0.5, 0.06]} />
        <meshStandardMaterial 
            color={COLORS.EMERALD} 
            roughness={0.6} 
            metalness={0.1}
        />
      </instancedMesh>

      {/* Ornaments: Instanced Mesh */}
      <instancedMesh ref={ornamentRef} args={[undefined, undefined, ORNAMENT_COUNT]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial 
            roughness={0.1} 
            metalness={0.8} 
            envMapIntensity={2}
        />
      </instancedMesh>

      {/* Ribbon: Glowing Flakes */}
      <instancedMesh ref={ribbonRef} args={[undefined, undefined, RIBBON_COUNT]}>
        <planeGeometry args={[0.15, 0.15]} />
        <meshBasicMaterial 
            color={COLORS.GOLD_WARM} 
            side={THREE.DoubleSide}
            toneMapped={false}
        />
      </instancedMesh>

      {/* Star Topper: Custom 3D Shape */}
      <group ref={starRef} position={[0, TREE_HEIGHT/2 + 0.8, 0]}>
        <mesh>
            <extrudeGeometry 
                args={[
                    starShape, 
                    { depth: 0.4, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 2 }
                ]} 
            />
            <meshStandardMaterial 
                color={COLORS.GOLD}
                emissive={COLORS.GOLD}
                emissiveIntensity={3}
                roughness={0.2}
                metalness={1}
                toneMapped={false}
            />
        </mesh>
        {/* Glow halo around star */}
        <mesh>
             <sphereGeometry args={[2, 16, 16]} />
             <meshBasicMaterial color={COLORS.GOLD_WARM} transparent opacity={0.1} />
        </mesh>
      </group>
    </group>
  );
};