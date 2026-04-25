'use client';

import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { Html } from '@react-three/drei';
import { useState } from 'react';
import * as THREE from 'three';

const xrStore = createXRStore();

function VirtualGuide() {
  return (
    <group position={[0, -1, -2]}>
      <mesh>
        <boxGeometry args={[0.5, 1.5, 0.5]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      <Html position={[0, 1, 0]} distanceFactor={3}>
        <div className="bg-white/90 p-2 rounded shadow text-xs text-center">
          👋 嗨！我是你的虚拟导游
        </div>
      </Html>
    </group>
  );
}

export default function ARGuide() {
  const [isAR, setIsAR] = useState(false);

  return (
    <div className="w-full h-[60vh] bg-gray-100 rounded-xl overflow-hidden relative">
      {!isAR ? (
        <div className="flex items-center justify-center h-full flex-col gap-4">
          <p className="text-gray-500">点击按钮开启 AR 导览</p>
          <button 
            onClick={() => setIsAR(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
          >
            启动 AR 模式
          </button>
        </div>
      ) : (
        <Canvas>
          <XR store={xrStore}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <VirtualGuide />
          </XR>
        </Canvas>
      )}
    </div>
  );
}
