import type { LocalizedQuestion } from '../types';

/**
 * 硬核档:计算机**通识热知识**。
 * 不要求会写代码,但要求平时关注技术圈 —— 热门、有话题度、排队时可讨论。
 * 每题 zh / en 两份文本,`answer` 下标共享。
 */
export const systemsQuestions: LocalizedQuestion[] = [
  {
    id: 'hacker-1',
    tier: 'at',
    tags: ['大模型', 'GPT'],
    code: `G = Generative      builds new output
P = Pre-trained     trained on data first
T = ?               the core architecture`,
    lang: 'text',
    answer: 0,
    zh: {
      prompt: '`ChatGPT` 里的 `GPT` 是三个英文单词的首字母缩写,其中 **T** 代表哪个词?',
      options: ['Transformer', 'Text', 'Transfer', 'Technology'],
      explain:
        '`GPT` = **Generative Pre-trained Transformer**,生成式预训练 Transformer。选 `Text` 是望文生义 —— 它确实处理文本,但缩写里没这个词;选 `Transfer` 是形近词混淆。顺带一提,`Transformer` 也正是 **C 档**在考的那个架构:它的核心是自注意力里的 Q / K / V。',
      source: '社团内部约定(模型归属)',
    },
    en: {
      prompt: '`GPT` in `ChatGPT` is an acronym of three English words. Which word does the **T** stand for?',
      options: ['Transformer', 'Text', 'Transfer', 'Technology'],
      explain:
        '`GPT` = **Generative Pre-trained Transformer**. Picking `Text` is reading too much into the name — it does handle text, but that word is not in the acronym; `Transfer` is a look-alike. Incidentally, `Transformer` is exactly the architecture the **ACM tier** asks about: its heart is the Q / K / V of self-attention.',
      source: 'Club convention (model attribution)',
    },
  },
  {
    id: 'hacker-2',
    tier: 'hd',
    tags: ['大模型', '厂商'],
    answer: 2,
    zh: {
      prompt: '`Mythos` 这个 AI 模型是哪家公司发布的?',
      options: ['Google', 'Meta', 'Anthropic', 'DeepSeek'],
      explain:
        '`Mythos` 出自 **Anthropic**,也就是 `Claude` 系列背后的那家公司。这题真正筛掉的是「只认识 ChatGPT」的人:知道 `Gemini` 属 Google、`Llama` 属 Meta、`DeepSeek` 是国内的,基本就能靠排除法锁定。',
      source: '社团内部约定(模型归属)',
    },
    en: {
      prompt: 'Which company released the AI model called `Mythos`?',
      options: ['Google', 'Meta', 'Anthropic', 'DeepSeek'],
      explain:
        '`Mythos` comes from **Anthropic**, the company behind the `Claude` family. What this really filters out is people who only know ChatGPT: knowing that `Gemini` is Google\'s, `Llama` is Meta\'s and `DeepSeek` is Chinese is enough to lock the answer down by elimination.',
      source: 'Club convention (model attribution)',
    },
  },
  {
    id: 'hacker-3',
    tier: 'ez',
    tags: ['大模型', 'API 计费'],
    code: `# models from one vendor are usually priced in tiers
client.chat(model="...")   # just swap in one of the options below`,
    lang: 'python',
    answer: 3,
    zh: {
      prompt: '假设下面四个模型都通过 API 按 token 计费,同样调用约 **100 万 token**,**花费最少**的是?',
      options: ['Claude Opus', 'Gemini 2.5 Pro', 'GPT-4o', 'GPT-4o mini'],
      explain:
        '带 `mini` / `flash` / `lite` 这类后缀的,通常是同一代的**小号**版本,价格往往比旗舰低一个数量级。所以同在榜上,`GPT-4o mini` 最便宜。这道题想让你记住的是一条行业规律:**同一家会把模型分成好几档卖**,能用小号的场景就别上旗舰。',
    },
    en: {
      prompt:
        'Assume all four models below are billed per token through an API. For the same call of about **1 million tokens**, which one is **cheapest**?',
      options: ['Claude Opus', 'Gemini 2.5 Pro', 'GPT-4o', 'GPT-4o mini'],
      explain:
        'Names carrying a `mini` / `flash` / `lite` suffix are usually the **small sibling** of the same generation, and typically cost an order of magnitude less than the flagship. So on this list, `GPT-4o mini` is cheapest. The industry rule to remember: **one vendor sells its models in several price tiers**, so don\'t reach for the flagship when the small one will do.',
    },
  },
  {
    id: 'hacker-4',
    tier: 'at',
    tags: ['Web', '前端框架'],
    code: `frontend: runs in the browser, draws the UI
backend:  runs on a server, owns the data`,
    lang: 'text',
    answer: 2,
    zh: {
      prompt: '下列哪一个是**前端框架**?',
      options: ['Django', 'Spring Boot', 'React', 'PostgreSQL'],
      explain:
        '`React` 是前端框架,代码最终跑在浏览器里、负责画界面。另外三个都是后端或数据侧的:`Django` 是 Python 的后端框架、`Spring Boot` 是 Java 的后端框架、`PostgreSQL` 是数据库。同类的前端框架还有 `Vue`、`Angular`、`Svelte`。',
    },
    en: {
      prompt: 'Which of the following is a **frontend framework**?',
      options: ['Django', 'Spring Boot', 'React', 'PostgreSQL'],
      explain:
        '`React` is a frontend framework: its code ultimately runs in the browser and draws the interface. The other three live on the backend or data side — `Django` is a Python backend framework, `Spring Boot` a Java backend framework, and `PostgreSQL` a database. Other frontend frameworks in the same family include `Vue`, `Angular` and `Svelte`.',
    },
  },
  {
    id: 'hacker-5',
    tier: 'sp',
    tags: ['大模型', '开源'],
    answer: 0,
    zh: {
      prompt: '下面哪一组模型是**权重开放、可以自己下载部署**的?',
      options: ['Llama 与 DeepSeek', 'Gemini 与 Grok', 'GPT-4o 与 Claude', '以上都可以'],
      explain:
        '`Llama`(Meta)与 `DeepSeek` 都开放了模型权重,可以自己下载、部署到本地或私有服务器上;另外两组都是只能通过官方 API 调用的闭源服务。「开源还是闭源」是这两年技术圈最热的话题之一,也是判断一个人**是真关注还是只听说过**的分水岭。',
    },
    en: {
      prompt: 'Which pair of models has **open weights that you can download and deploy yourself**?',
      options: ['Llama and DeepSeek', 'Gemini and Grok', 'GPT-4o and Claude', 'All of the above'],
      explain:
        'Both `Llama` (Meta) and `DeepSeek` publish their model weights, so you can download them and deploy locally or on your own servers; the other two pairs are closed services reachable only through an official API. "Open or closed" is one of the hottest topics in tech right now, and it separates people who **actually follow the field from those who have only heard of it**.',
    },
  },
];
