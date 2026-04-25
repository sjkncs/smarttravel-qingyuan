"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Box, RotateCcw, Eye, Mountain, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import { getVillages } from "@/lib/data/villages";
import dynamic from "next/dynamic";

const GSViewer = dynamic(
  () => import("@/components/virtual-tour/gs-viewer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[60vh] rounded-xl bg-gradient-to-b from-[#0a1a0f] to-[#0d2218] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-3 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
          <div className="text-sm text-emerald-300">加载3D引擎...</div>
        </div>
      </div>
    ),
  }
);

const villages3D = [
  {
    id: "nangang",
    name: "南岗千年瑶寨",
    nameEn: "Nangang Yao Village",
    desc: "世界瑶族第一寨，千年古韵的3D数字重建",
    descEn: "3D digital reconstruction of the world's premier Yao village",
    modelPath: "/tours/guangdong/liannan-yaozhai/scene.splat",
    image: "🏛️",
  },
  {
    id: "fenglin",
    name: "峰林小镇",
    nameEn: "Fenglin Town",
    desc: "喀斯特峰林地貌的高精度3D扫描",
    descEn: "High-precision 3D scan of karst peak forest landscape",
    modelPath: "/tours/guangdong/fenglin/scene.splat",
    image: "🏔️",
  },
  {
    id: "shangyue",
    name: "上岳古村",
    nameEn: "Shangyue Village",
    desc: "岭南广府建筑群的数字孪生",
    descEn: "Digital twin of Lingnan Cantonese architecture cluster",
    modelPath: "/tours/guangdong/shangyue/scene.splat",
    image: "🏘️",
  },
  {
    id: "youling",
    name: "油岭瑶寨",
    nameEn: "Youling Yao Village",
    desc: "耍歌堂发源地的3D文化遗产保护",
    descEn: "3D cultural heritage preservation of Song Hall origin",
    modelPath: "/tours/guangdong/youling/scene.splat",
    image: "🎭",
  },
  {
    id: "jiqingli",
    name: "积庆里",
    nameEn: "Jiqingli Tea Estate",
    desc: "百年茶园的摄影测量三维重建",
    descEn: "Photogrammetric 3D reconstruction of century-old tea gardens",
    modelPath: "/tours/guangdong/jiqingli/scene.splat",
    image: "🍵",
  },
];

export default function ThreeDPage() {
  const { locale } = useI18n();
  const [selectedVillage, setSelectedVillage] = useState(villages3D[0]);

  return (
    <main className="flex flex-col min-h-dvh">
      <PageHeader
        title={locale === "zh" ? "3D 扫描建模" : "3D Scanning & Modeling"}
        description={
          locale === "zh"
            ? "基于摄影测量/LiDAR技术，实现乡村文化遗产的高保真数字孪生"
            : "High-fidelity digital twins of rural cultural heritage via photogrammetry & LiDAR"
        }
        gradient="from-purple-600 to-violet-500"
      />

      <section className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Village selector */}
          <div className="flex flex-wrap gap-3 justify-center">
            {villages3D.map((v) => (
              <motion.button
                key={v.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedVillage(v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                  selectedVillage.id === v.id
                    ? "bg-purple-600 text-white border-purple-400 shadow-lg"
                    : "bg-card/60 border-border hover:border-purple-300 dark:hover:border-purple-700"
                }`}
              >
                <span className="text-lg">{v.image}</span>
                <span className="text-sm font-medium">
                  {locale === "zh" ? v.name : v.nameEn}
                </span>
              </motion.button>
            ))}
          </div>

          {/* 3D Viewer */}
          <motion.div
            key={selectedVillage.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GSViewer
              modelPath={selectedVillage.modelPath}
              villageName={locale === "zh" ? selectedVillage.name : selectedVillage.nameEn}
            />
          </motion.div>

          {/* Description */}
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">
              {locale === "zh" ? selectedVillage.name : selectedVillage.nameEn}
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              {locale === "zh" ? selectedVillage.desc : selectedVillage.descEn}
            </p>
          </div>

          {/* Technical specs */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              {
                icon: Box,
                title: locale === "zh" ? "摄影测量建模" : "Photogrammetry",
                desc: locale === "zh" ? "无人机多角度拍摄，自动生成高精度网格" : "Drone multi-angle capture, auto mesh generation",
              },
              {
                icon: Eye,
                title: locale === "zh" ? "WebGL 实时渲染" : "WebGL Rendering",
                desc: locale === "zh" ? "Three.js + React Three Fiber 实时3D渲染" : "Three.js + R3F real-time 3D rendering",
              },
              {
                icon: Mountain,
                title: locale === "zh" ? "地形融合" : "Terrain Fusion",
                desc: locale === "zh" ? "DEM高程数据与建筑模型无缝融合" : "DEM elevation data seamlessly merged with building models",
              },
              {
                icon: Compass,
                title: locale === "zh" ? "跨端兼容" : "Cross-Platform",
                desc: locale === "zh" ? "Web/桌面/移动端统一3D体验" : "Unified 3D experience across Web/Desktop/Mobile",
              },
            ].map((spec) => (
              <div
                key={spec.title}
                className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-5 text-center"
              >
                <spec.icon className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                <h4 className="font-bold text-sm mb-1">{spec.title}</h4>
                <p className="text-xs text-muted-foreground">{spec.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
