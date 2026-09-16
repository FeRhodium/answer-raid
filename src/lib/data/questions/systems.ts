import type { Question } from '../types';

/**
 * 硬核档:计算机**通识热知识**。
 * 不要求会写代码,但要求平时关注技术圈 —— 热门、有话题度、排队时可讨论。
 */
export const systemsQuestions: Question[] = [
  {
    id: 'hacker-1',
    tier: 'hacker',
    tags: ['大模型', 'GPT'],
    prompt: '`ChatGPT` 里的 `GPT` 是三个英文单词的首字母缩写,其中 **T** 代表哪个词?',
    code: `G = Generative      生成式
P = Pre-trained     预训练
T = ?               核心架构`,
    lang: 'text',
    options: ['Transformer', 'Text', 'Transfer', 'Technology'],
    answer: 0,
    explain: '`GPT` = **Generative Pre-trained Transformer**,生成式预训练 Transformer。选 `Text` 是望文生义 —— 它确实处理文本,但缩写里没这个词;选 `Transfer` 是形近词混淆。顺带一提,`Transformer` 也正是 **C 档**在考的那个架构:它的核心是自注意力里的 Q / K / V。',
  },
  {
    id: 'hacker-2',
    tier: 'hacker',
    tags: ['大模型', '厂商'],
    prompt: '`Mythos` 这个 AI 模型是哪家公司发布的?',
    options: ['Google', 'Anthropic', 'Meta', 'DeepSeek'],
    answer: 1,
    explain: '`Mythos` 出自 **Anthropic**,也就是 `Claude` 系列背后的那家公司。这题真正筛掉的是「只认识 ChatGPT」的人:知道 `Gemini` 属 Google、`Llama` 属 Meta、`DeepSeek` 是国内的,基本就能靠排除法锁定。',
    source: '社团内部约定(模型归属)',
  },
  {
    id: 'hacker-3',
    tier: 'hacker',
    tags: ['大模型', 'API 计费'],
    prompt: '假设下面四个模型都通过 API 按 token 计费,同样调用约 **100 万 token**,**花费最少**的是?',
    code: `# 同一家的模型通常按能力分档定价
client.chat(model="...")   # 只需把 model 换成下面某一项`,
    lang: 'python',
    options: ['GPT-4o mini', 'GPT-4o', 'Claude Opus', 'Gemini 2.5 Pro'],
    answer: 0,
    explain: '带 `mini` / `flash` / `lite` 这类后缀的,通常是同一代的**小号**版本,价格往往比旗舰低一个数量级。所以同在榜上,`GPT-4o mini` 最便宜。这道题想让你记住的是一条行业规律:**同一家会把模型分成好几档卖**,能用小号的场景就别上旗舰。',
  },
  {
    id: 'hacker-4',
    tier: 'hacker',
    tags: ['Web', '前端框架'],
    prompt: '下列哪一个是**前端框架**?',
    code: `前端:跑在浏览器里,负责界面与交互
后端:跑在服务器上,负责数据与逻辑`,
    lang: 'text',
    options: ['Django', 'Spring Boot', 'React', 'PostgreSQL'],
    answer: 2,
    explain: '`React` 是前端框架,代码最终跑在浏览器里、负责画界面。另外三个都是后端或数据侧的:`Django` 是 Python 的后端框架、`Spring Boot` 是 Java 的后端框架、`PostgreSQL` 是数据库。同类的前端框架还有 `Vue`、`Angular`、`Svelte`。',
  },
  {
    id: 'hacker-5',
    tier: 'hacker',
    tags: ['大模型', '开源'],
    prompt: '下面哪一组模型是**权重开放、可以自己下载部署**的?',
    options: ['GPT-4o 与 Claude', 'Llama 与 DeepSeek', 'Gemini 与 Grok', '以上都可以'],
    answer: 1,
    explain: '`Llama`(Meta)与 `DeepSeek` 都开放了模型权重,可以自己下载、部署到本地或私有服务器上;另外两组都是只能通过官方 API 调用的闭源服务。「开源还是闭源」是这两年技术圈最热的话题之一,也是判断一个人**是真关注还是只听说过**的分水岭。',
  },
];
