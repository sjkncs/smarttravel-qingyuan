"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

export default function Faq() {
  const accordionItems = [
    {
      title: "智游乡野是什么？",
      content: (
        <div className="text-muted-foreground">
          智游乡野是一款AI驱动的乡村旅游数字化解决方案，基于HarmonyOS ArkTS原生开发。
          融合LangChain AI引擎、村落发现算法、实景地图导航和数字人伴游，为用户提供从发现、规划、导航到陪伴的一站式智能化乡村旅行服务。
        </div>
      ),
    },
    {
      title: "AI行程规划是如何工作的？",
      content: (
        <div className="text-muted-foreground">
          我们的AI引擎基于端侧LangChain架构，通过ReAct Agent协同6大工具（天气、POI、路线、文化、社区、知识库），
          结合RAG检索增强生成技术，30秒内生成考虑性价比、文化深度、体力消耗、安全系数、天气适配、实时人流6大维度的个性化行程。
          即使在弱网/无网环境下，也能通过三级降级机制提供服务。
        </div>
      ),
    },
    {
      title: "支持哪些地区的村落？",
      content: (
        <div className="text-muted-foreground">
          目前覆盖广东清远5大特色村落：峰林小镇（英西峰林走廊）、南岗千年瑶寨（连南）、上岳古村（佛冈）、
          油岭瑶寨（连南）、积庆里（英德红茶产区）。每个村落均有详细的RAI可达性指数、CPI文化保护指数和VSI安全指数评估。
          未来将扩展至全国更多乡村。
        </div>
      ),
    },
    {
      title: "如何保护少数民族文化？",
      content: (
        <div className="text-muted-foreground">
          我们首创文化保护指数(CPI)，评估非遗濒危度、传承人图谱、文化敏感度和承载力。
          AI在推荐和规划时自动遵守文化敏感规则（如禁止拍摄禁忌区域、尊重宗教仪式）。
          同时通过CBT社区受益追踪系统，确保旅游收入透明分配，激励在地雇佣和青年回流。
        </div>
      ),
    },
    {
      title: "需要联网才能使用吗？",
      content: (
        <div className="text-muted-foreground">
          不需要！智游乡野具有三级降级容错架构：有网时使用完整LangChain AI流程（RAG+Agent+Memory），
          API失败时降级为传统LLM对话，完全离线时使用本地知识库+关键词匹配引擎。确保在山区信号弱的乡村也能正常使用。
        </div>
      ),
    },
    {
      title: "商业模式是怎样的？",
      content: (
        <div className="text-muted-foreground">
          采用ToC/ToG/ToB三元结构：C端提供基础免费+高级订阅（¥19.9/月解锁不限次AI规划）；
          G端提供乡村数字地图授权和文旅大数据看板；B端通过农特产场景化导流和民宿智能推荐实现商业变现，
          兼顾社会效益与经济效益。
        </div>
      ),
    },
  ];

  return (
    <motion.section
      initial={{ y: 20, opacity: 0 }}
      whileInView={{
        y: 0,
        opacity: 1,
      }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.5, type: "spring", bounce: 0 }}
      className="relative w-full max-w-(--breakpoint-xl) mx-auto px-4 py-28 gap-5 md:px-8 flex flex-col justify-center items-center"
    >
      <div className="flex flex-col gap-3 justify-center items-center">
        <h4 className="text-2xl font-bold sm:text-3xl bg-linear-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
          常见问题
        </h4>
        <p className="max-w-xl text-muted-foreground text-center">
          关于智游乡野的常见疑问解答
        </p>
      </div>
      <div className="flex w-full max-w-lg">
        <Accordion type="multiple" className="w-full">
          {accordionItems.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="text-muted-foreground"
            >
              <AccordionTrigger className="text-left">
                {item.title}
              </AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </motion.section>
  );
}
