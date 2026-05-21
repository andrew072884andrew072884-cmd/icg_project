import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

function Column({ position }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <cylinderGeometry args={[0.35, 0.45, 6.5, 20]} />
      <meshStandardMaterial color="#f6d364" metalness={0.45} roughness={0.3} />
    </mesh>
  );
}

function NeonFrame({ position, rotation = [0, 0, 0], scale = [1, 1, 1] }) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <torusGeometry args={[1.55, 0.05, 16, 64]} />
      <meshStandardMaterial
        color="#88c8ff"
        emissive="#6a54ff"
        emissiveIntensity={2.5}
      />
    </mesh>
  );
}

export default function Stage({ syncState }) {
  const danceFloor = useRef(null);
  const backdrop = useRef(null);

  useFrame(() => {
    const beatPulse = syncState?.beatPulse ?? 0;
    const bassEnergy = syncState?.bassEnergy ?? 0;

    if (danceFloor.current) {
      danceFloor.current.material.emissiveIntensity = 0.85 + beatPulse * 1.15 + bassEnergy * 0.55;
      const scale = 1 + beatPulse * 0.025;
      danceFloor.current.scale.set(scale, 1, scale);
    }

    if (backdrop.current) {
      backdrop.current.material.emissiveIntensity = 1.1 + beatPulse * 0.8 + bassEnergy * 0.45;
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#050a14" roughness={0.92} />
      </mesh>

      <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[7.8, 8.8, 0.4, 48]} />
        <meshStandardMaterial
          color="#101726"
          metalness={0.35}
          roughness={0.5}
          emissive="#0f1e49"
          emissiveIntensity={0.4}
        />
      </mesh>

      <mesh ref={danceFloor} position={[0, 0.22, 0]}>
        <cylinderGeometry args={[6.9, 6.9, 0.06, 48]} />
        <meshStandardMaterial
          color="#122745"
          emissive="#4e9dff"
          emissiveIntensity={1.2}
          metalness={0.15}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, 8, -10]} receiveShadow>
        <boxGeometry args={[22, 16, 0.6]} />
        <meshStandardMaterial
          color="#121a2e"
          emissive="#2d1b60"
          emissiveIntensity={0.5}
        />
      </mesh>

      <mesh ref={backdrop} position={[0, 5.2, -9.6]}>
        <planeGeometry args={[12, 5.4]} />
        <meshStandardMaterial
          color="#172038"
          emissive="#4f2ca4"
          emissiveIntensity={1.4}
        />
      </mesh>

      <Column position={[-7.8, 3.25, -5.6]} />
      <Column position={[7.8, 3.25, -5.6]} />
      <Column position={[-7.8, 3.25, 5.6]} />
      <Column position={[7.8, 3.25, 5.6]} />

      <NeonFrame position={[-4.8, 5.4, -9.2]} />
      <NeonFrame position={[4.8, 5.4, -9.2]} />

      <mesh position={[-2.6, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.15, 1.1, 32]} />
        <meshStandardMaterial color="#17243a" metalness={0.2} roughness={0.7} />
      </mesh>

      <mesh position={[2.6, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.15, 1.1, 32]} />
        <meshStandardMaterial color="#2a1832" metalness={0.2} roughness={0.7} />
      </mesh>
    </group>
  );
}
