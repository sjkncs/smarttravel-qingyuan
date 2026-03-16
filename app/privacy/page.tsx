import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";

const sections = [
  {
    title: "一、信息收集",
    titleEn: "1. Information Collection",
    content: `我们收集以下类型的个人信息：

【账号信息】
- 注册时提供的手机号码、邮箱地址
- 您主动填写的昵称、头像等个人资料

【使用信息】
- 您的搜索记录、浏览的村落页面、收藏的行程
- AI对话内容（用于改善服务质量，脱敏处理后存储）
- 设备信息：浏览器类型、操作系统、IP地址

【支付信息】
- 支付方式类型（实际支付信息由第三方支付机构处理，我们不存储完整卡号等敏感信息）
- 订单金额、时间等交易记录`,
    contentEn: `We collect the following types of personal information:

[Account Information]
- Phone number and email address provided during registration
- Personal profile information such as nickname and avatar that you actively fill in

[Usage Information]
- Your search history, village pages visited, and saved itineraries
- AI conversation content (stored after anonymization for service improvement purposes)
- Device information: browser type, operating system, IP address

[Payment Information]
- Payment method type (actual payment information is processed by third-party payment institutions; we do not store complete card numbers or other sensitive information)
- Transaction records such as order amounts and timestamps`,
  },
  {
    title: "二、信息使用",
    titleEn: "2. Information Use",
    content: `我们将收集的信息用于以下目的：

2.1 提供服务：处理您的旅游规划请求，为您推荐个性化村落和行程。

2.2 改善产品：分析用户行为数据（匿名化处理），优化AI推荐算法和用户体验。

2.3 安全保障：检测和防范欺诈、安全漏洞及其他非法行为。

2.4 通知服务：向您发送重要服务通知、订单确认等信息（非营销类）。

2.5 合规要求：根据法律法规要求保存必要的交易记录和用户信息。

我们不会将您的个人信息出售给第三方，也不会用于与提供本服务无关的目的。`,
    contentEn: `We use collected information for the following purposes:

2.1 Service Provision: Processing your travel planning requests and recommending personalized villages and itineraries.

2.2 Product Improvement: Analyzing user behavior data (anonymized) to optimize AI recommendation algorithms and user experience.

2.3 Security: Detecting and preventing fraud, security vulnerabilities, and other illegal activities.

2.4 Notifications: Sending you important service notices, order confirmations, and similar information (non-marketing).

2.5 Compliance: Retaining necessary transaction records and user information as required by law.

We do not sell your personal information to third parties, nor do we use it for purposes unrelated to providing this service.`,
  },
  {
    title: "三、信息共享",
    titleEn: "3. Information Sharing",
    content: `在以下情况下，我们可能与第三方共享您的信息：

3.1 服务提供商：与协助我们提供服务的技术服务商共享必要信息，包括云服务提供商、支付处理机构、短信/邮件服务商。所有服务商均受保密协议约束。

3.2 法律要求：当法律法规或有权机关要求时，我们将依法提供相关信息。

3.3 业务转让：如发生合并、收购等业务变更，用户信息可能作为资产转让，届时将提前通知用户。

3.4 获得同意：在获得您明确同意的情况下，与其他第三方共享信息。

我们不会将您的信息共享给广告商用于定向广告。`,
    contentEn: `We may share your information with third parties in the following circumstances:

3.1 Service Providers: Sharing necessary information with technical service providers who assist us in providing services, including cloud service providers, payment processors, and SMS/email service providers. All service providers are bound by confidentiality agreements.

3.2 Legal Requirements: Providing relevant information as required by law or competent authorities.

3.3 Business Transfers: In the event of mergers, acquisitions, or other business changes, user information may be transferred as an asset, and users will be notified in advance.

3.4 With Consent: Sharing information with other third parties with your explicit consent.

We do not share your information with advertisers for targeted advertising.`,
  },
  {
    title: "四、数据安全",
    titleEn: "4. Data Security",
    content: `我们采取以下措施保护您的个人信息安全：

- 传输加密：所有数据传输均使用 HTTPS/TLS 加密
- 存储加密：敏感信息（如密码）使用 bcrypt 加密存储
- 访问控制：基于 RBAC 角色的权限管理，限制内部人员访问
- 定期审计：定期进行安全审计和渗透测试
- 数据最小化：仅收集提供服务所必需的信息

请注意，没有任何网络传输或存储方法是100%安全的。如发生数据泄露，我们将依法及时通知受影响用户。`,
    contentEn: `We take the following measures to protect the security of your personal information:

- Transmission Encryption: All data transmission uses HTTPS/TLS encryption
- Storage Encryption: Sensitive information (such as passwords) is stored encrypted using bcrypt
- Access Control: RBAC role-based permission management to restrict internal access
- Regular Audits: Regular security audits and penetration testing
- Data Minimization: Only collecting information necessary to provide services

Please note that no method of network transmission or storage is 100% secure. In the event of a data breach, we will notify affected users in a timely manner as required by law.`,
  },
  {
    title: "五、您的权利",
    titleEn: "5. Your Rights",
    content: `根据适用法律，您对个人信息享有以下权利：

5.1 访问权：您有权查看我们持有的您的个人信息。

5.2 更正权：您有权要求更正不准确的个人信息，可通过账号设置页面直接修改。

5.3 删除权：您有权要求删除您的个人信息（"被遗忘权"）。请注意，法律要求保留的信息除外。

5.4 可携带权：您有权获取您在本平台产生的数据的副本。

5.5 反对权：您有权反对我们处理您的个人信息用于特定目的。

如需行使上述权利，请发送邮件至 privacy@smarttravel-qy.com，我们将在15个工作日内处理您的请求。`,
    contentEn: `Under applicable law, you have the following rights regarding your personal information:

5.1 Right of Access: You have the right to view the personal information we hold about you.

5.2 Right of Rectification: You have the right to request correction of inaccurate personal information, which can be modified directly through the account settings page.

5.3 Right of Erasure: You have the right to request deletion of your personal information ("right to be forgotten"), except for information required to be retained by law.

5.4 Right of Portability: You have the right to obtain a copy of data you have generated on the Platform.

5.5 Right to Object: You have the right to object to our processing of your personal information for specific purposes.

To exercise the above rights, please send an email to privacy@smarttravel-qy.com, and we will process your request within 15 business days.`,
  },
  {
    title: "六、Cookie 政策",
    titleEn: "6. Cookie Policy",
    content: `我们使用 Cookie 及类似技术来：

- 保持您的登录状态
- 记住您的语言偏好和主题设置
- 分析平台使用情况（匿名化数据）
- 保障平台安全

您可以通过浏览器设置禁用 Cookie，但这可能影响某些功能的正常使用。我们不使用第三方广告 Cookie。`,
    contentEn: `We use cookies and similar technologies to:

- Maintain your login status
- Remember your language preferences and theme settings
- Analyze Platform usage (anonymized data)
- Ensure Platform security

You can disable cookies through your browser settings, but this may affect the normal use of certain features. We do not use third-party advertising cookies.`,
  },
  {
    title: "七、儿童隐私",
    titleEn: "7. Children's Privacy",
    content: `本平台不针对14周岁以下的儿童提供服务。如我们发现收集了未成年人的个人信息，将立即删除相关信息。如果您认为我们错误地收集了您孩子的信息，请联系我们。`,
    contentEn: `The Platform does not provide services to children under the age of 14. If we discover that we have collected personal information from minors, we will immediately delete the relevant information. If you believe we have mistakenly collected your child's information, please contact us.`,
  },
  {
    title: "八、联系我们",
    titleEn: "8. Contact Us",
    content: `如您对本隐私政策有任何问题或意见，请联系我们：

- 客服电话：188-5600-8931
- 隐私邮箱：privacy@smarttravel-qy.com
- 客服邮箱：support@smarttravel-qy.com
- QQ邮箱：2797660051@qq.com
- 地址：广东省深圳市南山区西丽大学城
- 工作时间：周一至周五 9:00–18:00

本隐私政策最后更新时间：2026年3月15日`,
    contentEn: `If you have any questions or comments about this Privacy Policy, please contact us:

- Phone: 188-5600-8931
- Privacy Email: privacy@smarttravel-qy.com
- Support Email: support@smarttravel-qy.com
- QQ Email: 2797660051@qq.com
- Address: Xili University Town, Nanshan District, Shenzhen, Guangdong Province
- Working Hours: Monday–Friday 9:00–18:00

This Privacy Policy was last updated: March 15, 2026`,
  },
];

export default function PrivacyPage() {
  return (
    <main className="flex flex-col min-h-dvh">
      <PageHeader
        title="隐私政策"
        description="我们重视您的隐私，本政策说明我们如何收集、使用和保护您的个人信息"
      />

      <section className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 p-4 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 text-sm text-sky-800 dark:text-sky-200">
            本隐私政策于 2026年3月15日 生效。我们承诺保护您的个人信息安全，请仔细阅读以了解我们的数据处理方式。
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
