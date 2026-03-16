import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";

const sections = [
  {
    title: "一、服务说明",
    titleEn: "1. Service Description",
    content: `智游清远（以下简称"本平台"）是由智游科技（清远）有限公司运营的乡村旅游数字化服务平台，致力于通过AI技术为用户提供个性化的乡村旅游规划、村落发现、文化导览等服务。

本服务协议（以下简称"本协议"）是您与本平台之间关于使用本平台服务所订立的协议。请您在使用本平台服务之前，仔细阅读并理解本协议的所有内容。`,
    contentEn: `SmartTravel Qingyuan (hereinafter "the Platform") is a rural tourism digital service platform operated by SmartTravel Technology (Qingyuan) Co., Ltd., dedicated to providing users with personalized rural tourism planning, village discovery, and cultural guide services through AI technology.

This Service Agreement (hereinafter "the Agreement") is an agreement between you and the Platform regarding the use of the Platform's services. Please read and understand all content of this Agreement carefully before using the Platform's services.`,
  },
  {
    title: "二、用户账号",
    titleEn: "2. User Account",
    content: `2.1 注册：您在使用本平台某些功能时，需要注册账号。注册时您需要提供真实、准确、完整的个人信息。

2.2 账号安全：您负责维护账号及密码的安全，并对以您账号登录后所做的一切行为承担责任。如发现任何未经授权使用您账号的情况，请立即通知我们。

2.3 账号限制：每位用户只能注册一个账号，禁止将账号转让、出售或共享给他人使用。`,
    contentEn: `2.1 Registration: To use certain features of the Platform, you need to register an account. You must provide true, accurate, and complete personal information during registration.

2.2 Account Security: You are responsible for maintaining the security of your account and password, and for all activities conducted under your account. If you discover any unauthorized use of your account, please notify us immediately.

2.3 Account Restrictions: Each user may only register one account. Transferring, selling, or sharing accounts with others is prohibited.`,
  },
  {
    title: "三、服务内容",
    titleEn: "3. Service Content",
    content: `3.1 AI智能规划：本平台提供基于LangChain RAG技术的AI行程规划服务，生成结果仅供参考，实际出行请结合当地实际情况。

3.2 村落信息：本平台展示的村落信息来源于公开数据及合作方，我们努力确保信息准确性，但不对信息的完整性和时效性作出保证。

3.3 社区功能：用户可在社区发布旅游攻略、评价和问答。用户发布的内容须遵守社区准则，不得含有违法、虚假、侵权等内容。

3.4 支付服务：本平台通过第三方支付渠道（支付宝、微信支付、银联等）处理支付，具体费用以购买时显示为准。`,
    contentEn: `3.1 AI Planning: The Platform provides AI itinerary planning services based on LangChain RAG technology. Generated results are for reference only; please consider local conditions for actual travel.

3.2 Village Information: Village information displayed on the Platform comes from public data and partners. We strive to ensure accuracy but do not guarantee completeness or timeliness.

3.3 Community Features: Users may post travel guides, reviews, and Q&A in the community. Content posted must comply with community guidelines and must not contain illegal, false, or infringing content.

3.4 Payment Services: The Platform processes payments through third-party payment channels (Alipay, WeChat Pay, UnionPay, etc.). Specific fees are subject to what is displayed at time of purchase.`,
  },
  {
    title: "四、用户行为规范",
    titleEn: "4. User Conduct",
    content: `用户在使用本平台服务时，须遵守以下规范：

- 遵守中华人民共和国相关法律法规
- 不得发布违法、有害、骚扰性或侵权内容
- 不得干扰或破坏本平台的正常运营
- 不得使用技术手段抓取、复制平台数据
- 尊重少数民族文化，不得发布歧视或不尊重性内容
- 不得冒充他人或进行欺诈行为

违反上述规范的，本平台有权暂停或终止相关账号，并保留追究法律责任的权利。`,
    contentEn: `Users must comply with the following rules when using the Platform's services:

- Comply with relevant laws and regulations of the People's Republic of China
- Do not post illegal, harmful, harassing, or infringing content
- Do not interfere with or disrupt the normal operation of the Platform
- Do not use technical means to scrape or copy Platform data
- Respect ethnic minority cultures; do not post discriminatory or disrespectful content
- Do not impersonate others or engage in fraudulent behavior

Violations may result in account suspension or termination, and the Platform reserves the right to pursue legal liability.`,
  },
  {
    title: "五、知识产权",
    titleEn: "5. Intellectual Property",
    content: `5.1 本平台的所有内容，包括但不限于文字、图片、图标、软件、音频、视频及其组合，均受中国知识产权法律的保护。

5.2 用户在本平台发布的内容，用户保留其知识产权，但同时授予本平台免费、永久、不可撤销的全球性许可，以使用、复制、修改、发布该内容用于平台运营目的。

5.3 未经本平台书面授权，任何人不得擅自复制、传播或商业使用本平台的内容。`,
    contentEn: `5.1 All content on the Platform, including but not limited to text, images, icons, software, audio, video, and combinations thereof, is protected by Chinese intellectual property laws.

5.2 Users retain intellectual property rights over content they post on the Platform, but grant the Platform a free, perpetual, irrevocable, worldwide license to use, reproduce, modify, and publish such content for Platform operation purposes.

5.3 Without written authorization from the Platform, no one may reproduce, distribute, or commercially use Platform content.`,
  },
  {
    title: "六、免责声明",
    titleEn: "6. Disclaimer",
    content: `6.1 本平台AI生成的行程建议、村落推荐等内容基于算法模型，仅供参考，不构成专业旅游意见。

6.2 因不可抗力（自然灾害、政策变化等）导致的服务中断，本平台不承担责任。

6.3 用户因不当使用本平台服务而产生的任何损失，本平台不承担责任。

6.4 本平台对第三方网站或服务不承担责任，包括通过本平台链接访问的任何网站。`,
    contentEn: `6.1 AI-generated itinerary suggestions, village recommendations, and other content on the Platform are based on algorithmic models and are for reference only, and do not constitute professional travel advice.

6.2 The Platform is not responsible for service interruptions caused by force majeure events (natural disasters, policy changes, etc.).

6.3 The Platform is not responsible for any losses arising from improper use of the Platform's services.

6.4 The Platform is not responsible for third-party websites or services, including any websites accessed through links on the Platform.`,
  },
  {
    title: "七、协议修改",
    titleEn: "7. Agreement Modification",
    content: `本平台有权根据需要修改本协议，修改后的协议将在平台上公示。您继续使用本平台服务，即表示您接受修改后的协议。如您不同意修改后的协议，请停止使用本平台服务。`,
    contentEn: `The Platform reserves the right to modify this Agreement as needed. Modified agreements will be posted on the Platform. Your continued use of the Platform's services constitutes your acceptance of the modified Agreement. If you do not agree with the modified Agreement, please stop using the Platform's services.`,
  },
  {
    title: "八、联系我们",
    titleEn: "8. Contact Us",
    content: `如您对本协议有任何疑问，请通过以下方式联系我们：

- 客服电话：188-5600-8931
- 电子邮件：support@smarttravel-qy.com
- QQ邮箱：2797660051@qq.com
- 地址：广东省深圳市南山区西丽大学城
- 工作时间：周一至周五 9:00–18:00

本协议最后更新时间：2026年3月15日`,
    contentEn: `If you have any questions about this Agreement, please contact us via:

- Phone: 188-5600-8931
- Email: support@smarttravel-qy.com
- QQ Email: 2797660051@qq.com
- Address: Xili University Town, Nanshan District, Shenzhen, Guangdong Province
- Working Hours: Monday–Friday 9:00–18:00

Last Updated: March 15, 2026`,
  },
];

export default function TermsPage() {
  return (
    <main className="flex flex-col min-h-dvh">
      <PageHeader
        title="服务协议"
        description="请仔细阅读以下服务条款，使用本平台即表示您同意这些条款"
      />

      <section className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-200">
            本协议于 2026年3月15日 生效。继续使用智游清远服务即表示您已阅读、理解并同意本协议的所有条款。
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
