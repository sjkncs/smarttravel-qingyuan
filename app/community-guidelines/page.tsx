import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";

const sections = [
  {
    title: "一、总则",
    content: `智游乡野社区（以下简称"社区"）致力于打造一个友善、真实、有价值的乡村旅游交流平台。为了维护良好的社区氛围，保障所有用户的合法权益，特制定本社区准则。

所有用户在使用社区功能时，须遵守本准则。违反准则的内容将被删除，严重违规者将被暂停或永久禁止使用社区功能。`,
  },
  {
    title: "二、内容规范",
    content: `用户发布的所有内容（包括但不限于游记、攻略、评论、问答、图片）须符合以下要求：

【鼓励发布】
- 真实的旅行体验分享和心得感悟
- 有价值的旅行攻略、路线推荐和实用信息
- 村落文化介绍、民俗体验、美食推荐
- 客观公正的景点、住宿、餐饮评价
- 对其他用户问题的友善回答和帮助

【禁止发布】
- 虚假、编造或严重夸大的旅行信息
- 广告推销、垃圾信息和重复刷屏
- 涉及色情、暴力、赌博等违法内容
- 侵犯他人隐私、肖像权或知识产权的内容
- 恶意攻击、人身侮辱、网络暴力
- 政治敏感、宗教极端或其他不当言论`,
  },
  {
    title: "三、民族文化尊重",
    content: `清远地区拥有丰富的少数民族文化（瑶族、壮族等），本平台高度重视民族文化的保护和尊重：

3.1 尊重各民族的风俗习惯、宗教信仰和传统文化。

3.2 禁止发布任何带有民族歧视、文化偏见或不尊重少数民族的内容。

3.3 在拍摄和分享涉及民族村寨、宗教场所、传统仪式的内容时，请事先征得当地居民同意。

3.4 鼓励以开放、包容的态度分享和传播民族文化知识。`,
  },
  {
    title: "四、用户行为规范",
    content: `4.1 友善交流：以平等、尊重的态度与其他用户互动，不得进行人身攻击、恶意嘲讽或骚扰行为。

4.2 真实可信：分享的旅行经历和评价应基于真实体验，不得恶意造谣或发布虚假信息。

4.3 保护隐私：未经他人允许，不得在社区中公开他人的个人信息、照片或联系方式。

4.4 账号使用：不得使用多个账号进行刷量、刷评或操控社区内容。

4.5 举报配合：如发现违反社区准则的内容，请积极使用举报功能；对于不实举报，平台保留追究责任的权利。`,
  },
  {
    title: "五、知识产权",
    content: `5.1 原创保护：社区鼓励原创内容，用户发布的原创游记、攻略、摄影作品受知识产权法律保护。

5.2 转载规范：转载他人内容须注明出处并获得原作者授权。

5.3 平台使用权：用户在社区发布的内容，即授予平台在运营范围内使用、展示和推广的权利。

5.4 侵权投诉：如发现您的内容被他人侵权使用，请联系我们处理。`,
  },
  {
    title: "六、违规处理",
    content: `根据违规程度，平台将采取以下措施：

- 轻微违规：删除违规内容并发出警告
- 一般违规：删除内容、限制发布功能（1–7天）
- 严重违规：永久禁言或封禁账号
- 涉嫌违法：配合相关部门依法处理

用户对处理结果有异议的，可发送申诉邮件至 support@smarttravel-qy.com，我们将在5个工作日内复核。`,
  },
  {
    title: "七、联系我们",
    content: `如您对本社区准则有任何疑问或建议，请联系我们：

- 客服电话：188-5600-8931
- 电子邮件：support@smarttravel-qy.com
- QQ邮箱：2797660051@qq.com
- 地址：广东省深圳市南山区西丽大学城
- 工作时间：周一至周五 9:00–18:00

本社区准则最后更新时间：2026年3月15日`,
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <main className="flex flex-col min-h-dvh">
      <PageHeader
        title="社区准则"
        description="共建友善、真实、有价值的乡村旅游交流社区"
      />

      <section className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
            本社区准则于 2026年3月15日 生效。使用智游乡野社区功能即表示您已阅读、理解并同意遵守本准则。
          </div>

          <div className="space-y-8">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-border bg-card/60 p-6"
              >
                <h2 className="text-base font-bold text-foreground mb-3">
                  {section.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
