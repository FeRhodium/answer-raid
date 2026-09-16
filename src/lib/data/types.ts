/** 题目与难度档位的公共类型。 */

export type TierId = 'novice' | 'hacker' | 'acm';

/** `none` 表示纯文本题;`svg` 时 chartData 是完整 <svg> 源码;`ascii` 时是等宽字符画。 */
export type ChartKind = 'none' | 'svg' | 'ascii';

export interface Question {
  id: string;
  tier: TierId;
  tags: string[];
  /** 支持 **粗体**、`行内代码`、\n 换行。 */
  prompt: string;
  code?: string;
  lang?: string;
  chartKind?: ChartKind;
  chartData?: string;
  options: string[];
  /** 正确选项在 options 中的下标。 */
  answer: number;
  /** 60~160 字,讲清原理与最诱人的干扰项错在哪。 */
  explain: string;
  source?: string;
}

export interface TierMeta {
  id: TierId;
  /** 档位序号,0 起。 */
  index: number;
  name: string;
  label: string;
  desc: string;
  /** 主题色(HSL 色相统一由 CSS 变量接管,这里只给色相值)。 */
  hue: number;
  accent: string;
  icon: string;
  /** 不灭次数(该档位可承受的答错次数)。 */
  allowMiss: number;
  /** 每题限时(秒)。 */
  timeLimit: number;
  /** 基础分。 */
  baseScore: number;
}

/** 每个档位需答对的题数,答满即晋级。 */
export const ROUNDS_PER_TIER = 5;
