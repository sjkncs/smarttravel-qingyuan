'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getTourConfig, VirtualTourConfig } from '@/lib/virtual-tour-data';
import PanoramaViewer from '@/components/virtual-tour/panorama-viewer';
import ARGuide from '@/components/virtual-tour/ar-guide';
import GSViewer from '@/components/virtual-tour/gs-viewer';

export default function VillageTourPage() {
  const params = useParams();
  const province = params.province as string;
  const villageId = params.village as string;

  const [config, setConfig] = useState<VirtualTourConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePanoramaId, setActivePanoramaId] = useState<string>('');
  const [mode, setMode] = useState<'panorama' | 'ar' | 'gs'>('panorama');

  useEffect(() => {
    async function loadConfig() {
      const data = await getTourConfig(province, villageId);
      if (data) {
        setConfig(data);
        setActivePanoramaId(data.panoramas[0]?.id || '');
      }
      setLoading(false);
    }
    loadConfig();
  }, [province, villageId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (!config) {
    return <div className="min-h-screen flex items-center justify-center">未找到该乡村的虚拟旅游信息</div>;
  }

  const activePanorama = config.panoramas.find(p => p.id === activePanoramaId);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-green-800 mb-3 tracking-tight">{config.name.zh}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">{config.description?.zh || `探索 ${config.province} 省 ${config.village} 的独特魅力`}</p>
        
        <div className="flex justify-center gap-3 mt-6">
          <button 
            onClick={() => setMode('panorama')}
            className={`px-5 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${mode === 'panorama' ? 'bg-green-700 text-white shadow-lg scale-105' : 'bg-white border border-green-200 text-green-700 hover:bg-green-50'}`}
          >
            <span>🌐</span> 360° 全景
          </button>
          {config.arGuide?.enabled && (
            <button 
              onClick={() => setMode('ar')}
              className={`px-5 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${mode === 'ar' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'}`}
            >
              <span>📱</span> AR 导览
            </button>
          )}
          {config.gsScene?.enabled && (
            <button 
              onClick={() => setMode('gs')}
              className={`px-5 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${mode === 'gs' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-white border border-purple-200 text-purple-600 hover:bg-purple-50'}`}
            >
              <span>✨</span> 高保真 3D
            </button>
          )}
        </div>
      </header>

      <main>
        {mode === 'panorama' && activePanorama && (
          <PanoramaViewer 
            imageUrl={activePanorama.imageUrl} 
            hotspots={activePanorama.hotspots.map(h => ({
              ...h,
              onClick: h.targetId ? () => setActivePanoramaId(h.targetId!) : undefined
            }))}
          />
        )}
        
        {mode === 'ar' && <ARGuide />}
        
        {mode === 'gs' && config.gsScene?.enabled && <GSViewer modelPath={config.gsScene.modelPath} villageName={config.name.zh} />}
      </main>

      <footer className="mt-12 pt-6 border-t border-gray-100 text-center text-sm text-gray-400">
        <p>© 2026 智游乡野 · 助力乡村振兴，探索数字中国</p>
      </footer>
    </div>
  );
}
