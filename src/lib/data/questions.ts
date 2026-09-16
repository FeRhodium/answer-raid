import type { Question, TierId } from './types';
import { noviceQuestions } from './questions/novice';
import { systemsQuestions } from './questions/systems';
import { acmQuestions } from './questions/acm';

export const BANK: Record<TierId, Question[]> = {
  novice: noviceQuestions,
  hacker: systemsQuestions,
  acm: acmQuestions,
};

export const ALL_QUESTIONS: Question[] = [
  ...noviceQuestions,
  ...systemsQuestions,
  ...acmQuestions,
];

/** 一次「抽题」的结果:题目本身 + 打乱后的选项 + 新答案下标。 */
export interface DrawnQuestion {
  q: Question;
  /** 打乱后的展示选项。 */
  options: string[];
  /** 正确项在 options 中的下标。 */
  answerIndex: number;
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
 * 抽一道该档位还没在本局出现过的题,并把选项顺序打乱。
 * 题目耗尽时从该档位重新洗牌(保持可无限重玩),但会尽量避开最近用过的。
 */
export function drawQuestion(
  tier: TierId,
  usedIds: readonly string[],
): DrawnQuestion | null {
  const pool = BANK[tier];
  if (!pool || pool.length === 0) return null;

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

  return { q, options, answerIndex };
}

/** 提供给「求助」锦囊的一句话提示:优先用可公开的出处,否则用考点。 */
export function hintFor(q: Question): string {
  if (q.source) return `检测到标签【${q.tags.join(' / ')}】· 出处:${q.source}`;
  return `检测到考点【${q.tags.join(' / ')}】,回到定义本身推一遍,别信直觉。`;
}
