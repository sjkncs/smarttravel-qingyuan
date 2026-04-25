'use client';

import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html, useProgress } from '@react-three/drei';
import { Suspense, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ─── 类型定义 ─────────────────────────────────────────────────
interface Hotspot {
  id: string;
  position: [number, number, number];
  label: string | { zh: string; en?: string };
  description?: string | { zh: string; en?: string };
  onClick?: () => void;
}

interface PanoramaViewerProps {
  imageUrl: string;
  hotspots?: Hotspot[];
  autoRotate?: boolean;
  /** 品牌名称，用于加载屏展示 */
  brandName?: string;
  /** 场景名称，用于加载屏展示 */
  sceneName?: string;
  /** 加载完成回调 */
  onLoaded?: () => void;
}

// ─── 工具函数 ─────────────────────────────────────────────────
function resolveText(text: string | { zh: string; en?: string }): string {
  return typeof text === 'string' ? text : text.zh;
}

// ─── 全景球体 ─────────────────────────────────────────────────
function PanoramaSphere({ imageUrl, hotspots }: { imageUrl: string; hotspots?: Hotspot[] }) {
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  texture.mapping = THREE.EquirectangularReflectionMapping;

  return (
    <>
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {hotspots?.map((spot) => (
        <HotspotMarker key={spot.id} {...spot} />
      ))}
    </>
  );
}

// ─── 热点标记 ─────────────────────────────────────────────────
function HotspotMarker({ position, label, description, onClick }: Hotspot) {
  const [hovered, setHovered] = useState(false);
  const labelText = resolveText(label);
  const descText = description ? resolveText(description) : undefined;

  return (
    <group position={position}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial
          color={hovered ? '#4ade80' : '#ffffff'}
          emissive={hovered ? '#4ade80' : '#000000'}
          emissiveIntensity={hovered ? 0.8 : 0}
          transparent
          opacity={0.9}
        />
      </mesh>
      {hovered && (
        <Html distanceFactor={100}>
          <div className="bg-black/85 backdrop-blur-sm text-white p-3 rounded-xl text-sm max-w-[200px] pointer-events-none border border-green-500/30 shadow-lg shadow-green-900/20">
            <h3 className="font-bold text-green-400 mb-1">{labelText}</h3>
            {descText && <p className="text-gray-200 text-xs leading-relaxed">{descText}</p>}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── 加载进度屏（Canvas 内部，Suspense fallback）─────────────
function CanvasLoadingOverlay() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 select-none">
        <div className="w-56 h-[3px] bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-300 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.4 }}
          />
        </div>
        <p className="text-white/60 text-[11px] font-mono tracking-widest">
          {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}

// ─── 全屏加载过渡屏（Canvas 外部）────────────────────────────
interface LoadingOverlayProps {
  isVisible: boolean;
  brandName: string;
  sceneName: string;
}

function LoadingOverlay({ isVisible, brandName, sceneName }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1a0f] via-[#0d2218] to-[#0a1a0f] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
        >
          {/* 背景光晕 */}
          <motion.div
            className="absolute w-96 h-96 rounded-full bg-green-500/5 blur-3xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* 品牌标识 */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Logo 图标 */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-2xl shadow-green-900/50">
              <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
              </svg>
            </div>

            {/* 品牌名 */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white tracking-[0.15em] mb-1">{brandName}</h1>
              <p className="text-green-400/80 text-sm tracking-widest">{sceneName}</p>
            </div>

            {/* 进度条 */}
            <ProgressBar />

            {/* 提示文字 */}
            <motion.p
              className="text-white/30 text-xs tracking-wider"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              正在加载沉浸式场景…
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── 进度条子组件（需在 Canvas 外访问 useProgress）────────────
function ProgressBar() {
  const { progress, active } = useProgress();
  // active=false 且 progress≈100 时动画到 100%
  const displayProgress = active ? progress : 100;

  return (
    <div className="flex flex-col items-center gap-2 w-56">
      <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 via-emerald-300 to-green-400 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${displayProgress}%` }}
          transition={{ ease: 'easeOut', duration: 0.5 }}
        />
      </div>
      <div className="flex items-center justify-between w-full">
        <span className="text-white/40 text-[10px] font-mono">{Math.round(displayProgress)}%</span>
        <span className="text-white/30 text-[10px]">
          {active ? '加载中' : '就绪'}
        </span>
      </div>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────
export default function PanoramaViewer({
  imageUrl,
  hotspots,
  autoRotate = false,
  brandName = '智游乡野',
  sceneName = '虚拟探索',
  onLoaded,
}: PanoramaViewerProps) {
  const [isReady, setIsReady] = useState(false);

  const handleSceneReady = useCallback(() => {
    // 短暂延迟让过渡动画更自然
    setTimeout(() => {
      setIsReady(true);
      onLoaded?.();
    }, 400);
  }, [onLoaded]);

  return (
    <div className="w-full h-[60vh] rounded-xl overflow-hidden shadow-2xl relative bg-[#0a1a0f]">
      {/* 3D Canvas */}
      <Canvas camera={{ fov: 75, position: [0, 0, 0.1] }}>
        <Suspense fallback={<CanvasLoadingOverlay />}>
          <PanoramaSphere imageUrl={imageUrl} hotspots={hotspots} />
          <SceneReadyNotifier onReady={handleSceneReady} />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          autoRotate={autoRotate}
          autoRotateSpeed={0.4}
          rotateSpeed={-0.5}
        />
      </Canvas>

      {/* 全屏加载过渡屏（Canvas 外部，可使用 useProgress） */}
      <LoadingOverlay
        isVisible={!isReady}
        brandName={brandName}
        sceneName={sceneName}
      />
    </div>
  );
}

// ─── 场景就绪通知器（Canvas 内，Suspense 解析后渲染）─────────
function SceneReadyNotifier({ onReady }: { onReady: () => void }) {
  const [notified, setNotified] = useState(false);
  if (!notified) {
    setNotified(true);
    onReady();
  }
  return null;
}
