import type { LocalizedQuestion, Question, TierId } from './types';
import { localizeQuestion } from './types';
import { locale, t, msg, fmt, tagLabel, type Lang } from '../i18n.svelte.ts';
import { noviceQuestions } from './questions/novice';
import { systemsQuestions } from './questions/systems';
import { acmQuestions } from './questions/acm';

/** 全部题目(双语)。文件的划分只是"编写时的归类",难度档位由每题自己的 `tier` 决定。 */
const ALL_SOURCE: LocalizedQuestion[] = [...noviceQuestions, ...systemsQuestions, ...acmQuestions];

/**
 * 按 `tier` 字段分档。
 * 刻意**从数据推导**而不是手写映射:改一道题的档位只需要动它自己的 `tier`,
 * 这里不会漏同步(手写映射曾经就把整档搞空过)。
 */
const BANK_SIZE: Record<TierId, LocalizedQuestion[]> = { ez: [], hd: [], in: [], at: [], sp: [] };
for (const q of ALL_SOURCE) BANK_SIZE[q.tier].push(q);

export const BANK_SOURCE: Record<TierId, LocalizedQuestion[]> = BANK_SIZE;

/** 全部题目(供校验与统计)。 */
export const ALL_QUESTIONS_SOURCE = ALL_SOURCE;

/** 取某一档位、某一语言的题库。 */
export function bankFor(tier: TierId, lang: Lang): Question[] {
  return (BANK_SOURCE[tier] ?? []).map((q) => localizeQuestion(q, lang));
}

/** 一次「抽题」的结果:题目本身(已本地化)+ 打乱后的选项 + 新答案下标。 */
export interface DrawnQuestion {
  q: Question;
  /** 打乱后的展示选项。 */
  options: string[];
  /** 正确项在 options 中的下标。 */
  answerIndex: number;
  /** 抽题时的语言,便于调试与再本地化。 */
  lang: Lang;
}

export function shuffle<T>(input: readonly T[]): T[] {
  const out = input.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/**
 * 抽一道该档位还没在本局出现过的题,按当前语言本地化,并把选项顺序打乱。
 * 题目耗尽时从该档位重新洗牌(保持可无限重玩),但会尽量避开最近用过的。
 */
export function drawQuestion(
  tier: TierId,
  usedIds: readonly string[],
): DrawnQuestion | null {
  const lang = locale();
  const pool = bankFor(tier, lang);
  if (pool.length === 0) return null;

  const used = new Set(usedIds);
  let candidates = pool.filter((q) => !used.has(q.id));

  if (candidates.length === 0) {
    // 全部答过:只避开当前这一档最近用过的那一道,保证还有新鲜感。
    const recent = usedIds[usedIds.length - 1];
    candidates = pool.filter((q) => q.id !== recent);
    if (candidates.length === 0) candidates = pool.slice();
  }

  const q = candidates[Math.floor(Math.random() * candidates.length)];
  const correctText = q.options[q.answer];
  const options = shuffle(q.options);
  const answerIndex = options.indexOf(correctText);

  return { q, options, answerIndex, lang };
}

/** 提供给「内线情报」锦囊的一句话提示:优先用可公开的出处,否则用考点。 */
export function hintFor(q: Question): string {
  const tags = q.tags.map(tagLabel).join(' / ');
  if (q.source) return t(msg('hint.source'), { tags, source: q.source });
  return fmt('hint.tags', { tags });
}
