'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Environment, useProgress, Sky, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ─── 程序化地形生成（当无真实3D模型时展示） ──────────────────────
function ProceduralTerrain() {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 100, 128, 128);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      // Multi-octave noise simulation
      const h =
        Math.sin(x * 0.05) * Math.cos(z * 0.05) * 8 +
        Math.sin(x * 0.1 + 1.5) * Math.cos(z * 0.08) * 4 +
        Math.sin(x * 0.2 + 3.0) * Math.cos(z * 0.15) * 2 +
        Math.random() * 0.3;
      pos.setZ(i, h);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
      <meshStandardMaterial
        color="#2d5a27"
        roughness={0.9}
        metalness={0.05}
        flatShading
      />
    </mesh>
  );
}

// ─── 村落建筑群（程序化生成） ───────────────────────────────────
function VillageBuildings() {
  const buildings = useMemo(() => {
    const arr: { pos: [number, number, number]; scale: [number, number, number]; color: string; rot: number }[] = [];
    const colors = ['#8B7355', '#A0856C', '#C4A882', '#D4C4A8', '#9B8B6B'];
    for (let i = 0; i < 25; i++) {
      const x = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      const terrainH =
        Math.sin(x * 0.05) * Math.cos(z * 0.05) * 8 +
        Math.sin(x * 0.1 + 1.5) * Math.cos(z * 0.08) * 4;
      const h = 1.5 + Math.random() * 3;
      const w = 1.5 + Math.random() * 2;
      arr.push({
        pos: [x, terrainH - 5 + h / 2, z],
        scale: [w, h, w * (0.8 + Math.random() * 0.4)],
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i} position={b.pos} rotation={[0, b.rot, 0]}>
          {/* 建筑主体 */}
          <mesh castShadow>
            <boxGeometry args={b.scale} />
            <meshStandardMaterial color={b.color} roughness={0.85} />
          </mesh>
          {/* 屋顶 */}
          <mesh position={[0, b.scale[1] / 2 + 0.4, 0]} castShadow>
            <coneGeometry args={[b.scale[0] * 0.8, 1.2, 4]} />
            <meshStandardMaterial color="#4A3728" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── 树木 ──────────────────────────────────────────────────────
function Trees() {
  const trees = useMemo(() => {
    const arr: { pos: [number, number, number]; scale: number }[] = [];
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      const terrainH =
        Math.sin(x * 0.05) * Math.cos(z * 0.05) * 8 +
        Math.sin(x * 0.1 + 1.5) * Math.cos(z * 0.08) * 4;
      arr.push({ pos: [x, terrainH - 5, z], scale: 0.8 + Math.random() * 0.6 });
    }
    return arr;
  }, []);

  return (
    <group>
      {trees.map((t, i) => (
        <group key={i} position={t.pos}>
          {/* 树干 */}
          <mesh position={[0, 1.5 * t.scale, 0]} castShadow>
            <cylinderGeometry args={[0.1 * t.scale, 0.15 * t.scale, 3 * t.scale, 6]} />
            <meshStandardMaterial color="#5C3D1E" roughness={0.9} />
          </mesh>
          {/* 树冠 */}
          <mesh position={[0, 3.5 * t.scale, 0]} castShadow>
            <sphereGeometry args={[1.5 * t.scale, 8, 6]} />
            <meshStandardMaterial color={`hsl(${110 + Math.random() * 30}, 55%, ${25 + Math.random() * 15}%)`} roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── 水面 ──────────────────────────────────────────────────────
function Water() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = -4 + Math.sin(clock.elapsedTime * 0.5) * 0.1;
    }
  });
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[20, -4, 20]}>
      <circleGeometry args={[12, 32]} />
      <meshStandardMaterial color="#2d6a8f" roughness={0.1} metalness={0.3} transparent opacity={0.7} />
    </mesh>
  );
}

// ─── GLB 模型加载器 ─────────────────────────────────────────────
function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

// ─── 加载进度指示 ───────────────────────────────────────────────
function LoadingIndicator() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 select-none">
        <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 to-green-300 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.3 }}
          />
        </div>
        <p className="text-white/60 text-xs font-mono">{Math.round(progress)}%</p>
      </div>
    </Html>
  );
}

// ─── 自动旋转相机 ───────────────────────────────────────────────
function AutoRotateCamera({ speed = 0.15 }: { speed?: number }) {
  const { camera } = useThree();
  const angle = useRef(0);
  const radius = 30;
  const height = 15;

  useFrame((_, delta) => {
    angle.current += delta * speed;
    camera.position.x = Math.sin(angle.current) * radius;
    camera.position.z = Math.cos(angle.current) * radius;
    camera.position.y = height + Math.sin(angle.current * 0.5) * 3;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── 主场景 ────────────────────────────────────────────────────
function Scene({ modelPath, autoRotate }: { modelPath: string; autoRotate: boolean }) {
  const isGLB = modelPath.endsWith('.glb') || modelPath.endsWith('.gltf');

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[30, 40, 20]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-20, 20, -10]} intensity={0.3} />
      <fog attach="fog" args={['#87CEEB', 60, 150]} />

      {isGLB ? (
        <GLBModel url={modelPath} />
      ) : (
        <>
          <ProceduralTerrain />
          <VillageBuildings />
          <Trees />
          <Water />
        </>
      )}

      <Sky sunPosition={[100, 50, 100]} turbidity={8} rayleigh={0.5} />

      {autoRotate ? (
        <AutoRotateCamera />
      ) : (
        <OrbitControls
          maxPolarAngle={Math.PI / 2.1}
          minDistance={5}
          maxDistance={80}
          target={[0, 0, 0]}
          enableDamping
          dampingFactor={0.05}
        />
      )}
    </>
  );
}

// ─── 控制面板 ──────────────────────────────────────────────────
function ControlPanel({
  autoRotate, onToggleRotate,
  wireframe, onToggleWireframe,
  showInfo, onToggleInfo,
}: {
  autoRotate: boolean; onToggleRotate: () => void;
  wireframe: boolean; onToggleWireframe: () => void;
  showInfo: boolean; onToggleInfo: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-4 right-4 z-10 flex flex-col gap-2"
    >
      {[
        { label: '🔄', title: '自动旋转', active: autoRotate, onClick: onToggleRotate },
        { label: '📐', title: '线框模式', active: wireframe, onClick: onToggleWireframe },
        { label: 'ℹ️', title: '场景信息', active: showInfo, onClick: onToggleInfo },
      ].map((btn) => (
        <button
          key={btn.title}
          onClick={btn.onClick}
          title={btn.title}
          className={`h-10 w-10 rounded-xl backdrop-blur-sm border shadow-lg flex items-center justify-center text-base transition-all ${
            btn.active
              ? 'bg-emerald-600/90 border-emerald-400 text-white'
              : 'bg-black/50 border-white/20 text-white/70 hover:bg-black/70'
          }`}
        >
          {btn.label}
        </button>
      ))}
    </motion.div>
  );
}

// ─── 导出主组件 ────────────────────────────────────────────────
interface GSViewerProps {
  modelPath: string;
  villageName?: string;
}

export default function GSViewer({ modelPath, villageName }: GSViewerProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full h-[60vh] rounded-xl overflow-hidden shadow-2xl relative bg-gradient-to-b from-sky-200 to-sky-400">
      {/* Loading overlay */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1a0f] via-[#0d2218] to-[#0a1a0f]"
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
          >
            <motion.div
              className="absolute w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="relative z-10 text-center">
              <div className="text-4xl mb-4">🏔️</div>
              <h3 className="text-white text-lg font-bold mb-2">3D 扫描建模</h3>
              <p className="text-white/50 text-sm mb-6">{villageName || '加载高保真场景...'}</p>
              <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-300 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                  onAnimationComplete={() => setIsLoaded(true)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control panel */}
      <ControlPanel
        autoRotate={autoRotate}
        onToggleRotate={() => setAutoRotate(!autoRotate)}
        wireframe={wireframe}
        onToggleWireframe={() => setWireframe(!wireframe)}
        showInfo={showInfo}
        onToggleInfo={() => setShowInfo(!showInfo)}
      />

      {/* Info panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 z-10 bg-black/70 backdrop-blur-md rounded-xl p-4 border border-white/10"
          >
            <h4 className="text-white font-bold text-sm mb-2">🔬 3D扫描建模技术说明</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-white/70">
              <div><span className="text-emerald-400 font-bold">技术</span><br/>摄影测量/LiDAR扫描</div>
              <div><span className="text-emerald-400 font-bold">精度</span><br/>亚厘米级点云</div>
              <div><span className="text-emerald-400 font-bold">渲染</span><br/>Three.js WebGL 2.0</div>
              <div><span className="text-emerald-400 font-bold">兼容</span><br/>Web + 桌面端通用</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [30, 15, 30], fov: 60 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <Suspense fallback={<LoadingIndicator />}>
          <Scene modelPath={modelPath} autoRotate={autoRotate} />
        </Suspense>
      </Canvas>
    </div>
  );
}
