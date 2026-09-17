/**
 * ANSWER RAID 离线验证:题库完整性 + 抽题/选项打乱 + 完整一局的推进逻辑。
 *
 * 运行:node tools/verify.mjs
 *
 * 说明:这里按 node --experimental-strip-types 直接吃 .ts 源文件,
 * 并且**重新实现**了 quiz.svelte.ts 里的推进规则(而不是 import 它),
 * 目的是用一份独立实现去交叉验证「三档递进 + 不灭次数 + 计分」是否自洽。
 */

import { readFileSync } from 'node:fs';
import { noviceQuestions } from '../src/lib/data/questions/novice.ts';
import { systemsQuestions } from '../src/lib/data/questions/systems.ts';
import { acmQuestions } from '../src/lib/data/questions/acm.ts';
import { localizeQuestion } from '../src/lib/data/types.ts';

/**
 * 语言清单直接从这个脚本里给出(而不是 import i18n.ts)——
 * i18n 用了 Svelte 5 runes,而本脚本跑在裸 Node 下,没有 runes 编译器。
 * 下面的断言会校验「这里列的语言」与「题库实际提供的语言」一致。
 */
const LOCALES = ['zh', 'en'];

/** 抽题时会按语言取其中一份文本;这里把双语题摊平成原来的扁平结构(结构字段必须保留)。 */
const flatten = (q) => ({
  ...q.zh,
  id: q.id,
  tier: q.tier,
  tags: q.tags,
  answer: q.answer,
  code: q.code,
  lang: q.lang,
  chartKind: q.chartKind,
  chartData: q.chartData,
});

const TIERS = [
  { id: 'novice', label: '入门档', allowMiss: 2, timeLimit: 30, baseScore: 100, pool: noviceQuestions.map(flatten) },
  { id: 'hacker', label: '硬核档', allowMiss: 1, timeLimit: 45, baseScore: 250, pool: systemsQuestions.map(flatten) },
  { id: 'acm', label: '竞赛档', allowMiss: 1, timeLimit: 60, baseScore: 500, pool: acmQuestions.map(flatten) },
];
const RAW_TIERS = [
  { label: '入门档', pool: noviceQuestions },
  { label: '硬核档', pool: systemsQuestions },
  { label: '竞赛档', pool: acmQuestions },
];
const ROUNDS_PER_TIER = 5;

let pass = 0;
let fail = 0;
const failures = [];

function ok(name, cond, extra = '') {
  if (cond) {
    pass += 1;
    console.log(`  \u2713 ${name}`);
  } else {
    fail += 1;
    failures.push(name + (extra ? ` — ${extra}` : ''));
    console.log(`  \u2717 ${name}${extra ? ` — ${extra}` : ''}`);
  }
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

/* ------------------------------------------------------------------ */
section('1. 题库结构');

const ALL = [...noviceQuestions, ...systemsQuestions, ...acmQuestions];

ok('总题数 = 15', ALL.length === 15, `实际 ${ALL.length}`);

for (const t of TIERS) {
  ok(`${t.label} 恰好 5 题`, t.pool.length === 5, `实际 ${t.pool.length}`);
  ok(
    `${t.label} 全部 tier 字段正确`,
    t.pool.every((q) => q.tier === t.id),
  );
  ok(
    `${t.label} 每题 4 个选项`,
    t.pool.every((q) => Array.isArray(q.options) && q.options.length === 4),
    t.pool.filter((q) => q.options?.length !== 4).map((q) => `${q.id}:${q.options?.length}`).join(','),
  );
  ok(
    `${t.label} answer 下标合法`,
    t.pool.every((q) => Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length),
  );
  ok(
    `${t.label} 选项互不重复`,
    t.pool.every((q) => new Set(q.options).size === q.options.length),
  );
  ok(
    `${t.label} 题面/讲解非空且足够长`,
    t.pool.every((q) => q.prompt.trim().length >= 10 && q.explain.trim().length >= 40),
  );
  ok(
    `${t.label} 每题都有 tags`,
    t.pool.every((q) => Array.isArray(q.tags) && q.tags.length >= 1),
  );
}

ok('题目 id 全局唯一', new Set(ALL.map((q) => q.id)).size === ALL.length);

// 答案下标分布:不能全是同一个位置
for (const t of TIERS) {
  const idx = new Set(t.pool.map((q) => q.answer));
  ok(`${t.label} answer 下标有分布(≥3 种)`, idx.size >= 3, `实际 ${[...idx].join(',')}`);
}
const globalIdx = new Set(ALL.map((q) => q.answer));
ok('全局 answer 下标覆盖 0/1/2/3', [0, 1, 2, 3].every((i) => globalIdx.has(i)), `实际 ${[...globalIdx].sort().join(',')}`);

// chartKind 用法合法,且 svg 数据存在
ok(
  'chartKind 只为 none/ascii/svg 且都带数据',
  ALL.every(
    (q) =>
      q.chartKind === undefined ||
      (['none', 'ascii', 'svg'].includes(q.chartKind) && typeof q.chartData === 'string' && q.chartData.length > 0),
  ),
);
ok('含 svg 图表的题目其 chartData 是合法 <svg>', ALL.filter((q) => q.chartKind === 'svg').every((q) => /^<svg[\s\S]*<\/svg>$/.test(q.chartData.trim())));

// 题目格式多样性:代码题 / 文本题都存在
const withCode = ALL.filter((q) => typeof q.code === 'string' && q.code.length > 0);
ok('存在代码题(≥5 道)', withCode.length >= 5, `实际 ${withCode.length}`);
ok('存在纯文本题(≥3 道)', ALL.length - withCode.length >= 3, `实际 ${ALL.length - withCode.length}`);
ok('代码题都标了 lang', withCode.every((q) => typeof q.lang === 'string' && q.lang.length > 0));
ok('代码里没有 tab 缩进', withCode.every((q) => !q.code.includes('\t')));

/* ---------------- 1b. 双语(i18n)完整性 ---------------- */

for (const t of RAW_TIERS) {
  ok(
    `${t.label} 每题都有 zh 与 en 两份文本`,
    t.pool.every((q) => q.zh && q.en && typeof q.zh.prompt === 'string' && typeof q.en.prompt === 'string'),
  );
  ok(
    `${t.label} 两种语言的选项个数一致`,
    t.pool.every((q) => q.zh.options.length === q.en.options.length),
  );
  ok(
    `${t.label} 两种语言都没有空文本`,
    t.pool.every((q) =>
      [q.zh, q.en].every(
        (x) =>
          x.prompt.trim().length > 0 &&
          x.explain.trim().length > 0 &&
          x.options.every((o) => o.trim().length > 0),
      ),
    ),
  );
  ok(
    `${t.label} 两种语言各自选项互不重复`,
    t.pool.every((q) => [q.zh, q.en].every((x) => new Set(x.options).size === x.options.length)),
  );
  ok(
    `${t.label} 英文题面与讲解足够长`,
    t.pool.every((q) => q.en.prompt.trim().length >= 10 && q.en.explain.trim().length >= 40),
  );
  ok(
    `${t.label} 题面与讲解确实翻译过(英文不与中文雷同)`,
    t.pool.every((q) => q.en.prompt !== q.zh.prompt && q.en.explain !== q.zh.explain),
  );
  ok(
    `${t.label} 至少有一题的选项被翻译(选项里专有名词可以原样保留)`,
    t.pool.some((q) => q.en.options.some((o, i) => o !== q.zh.options[i])),
  );
}

// 摊平后仍满足结构约束(与上面纯中文时期的断言等价)
for (const lang of LOCALES) {
  for (const t of RAW_TIERS) {
    const pool = t.pool.map((q) => localizeQuestion(q, lang));
    ok(
      `${t.label}[${lang}] 摊平后每题 4 选项 / answer 合法 / 选项不重复`,
      pool.every(
        (q) =>
          q.options.length === 4 &&
          Number.isInteger(q.answer) &&
          q.answer >= 0 &&
          q.answer < q.options.length &&
          new Set(q.options).size === q.options.length,
      ),
    );
  }
}

// 摊平不会丢字段:可选题材(code / lang / chart*)必须照抄
for (const lang of LOCALES) {
  const flat = [...noviceQuestions, ...systemsQuestions, ...acmQuestions].map((q) =>
    localizeQuestion(q, lang),
  );
  ok(
    `[${lang}] 摊平后 code / chart 字段无丢失`,
    flat.every((q, i) => {
      const src = [...noviceQuestions, ...systemsQuestions, ...acmQuestions][i];
      return q.code === src.code && q.chartKind === src.chartKind && q.chartData === src.chartData;
    }),
  );
  ok(`[${lang}] 摊平后 tier / id 无丢失`, flat.every((q) => q.tier && q.id));
}

// 中英文字典的 key 必须一一对应
{
  const src = readFileSync(new URL('../src/lib/i18n.svelte.ts', import.meta.url), 'utf8');
  const slice = (from, to) => src.slice(src.indexOf(from), to ? src.indexOf(to) : undefined);
  const keysOf = (block) => new Set([...block.matchAll(/^\s{4}'([^']+)':/gm)].map((m) => m[1]));
  const zh = keysOf(slice('  zh: {', '  en: {'));
  const en = keysOf(slice('  en: {', '\n};'));
  const missingEn = [...zh].filter((k) => !en.has(k));
  const missingZh = [...en].filter((k) => !zh.has(k));
  ok('i18n 字典:每个中文 key 都有英文', missingEn.length === 0, missingEn.join(', '));
  ok('i18n 字典:每个英文 key 都有中文', missingZh.length === 0, missingZh.join(', '));
  ok('i18n 字典:key 数量足够(>60)', zh.size > 60, `实际 ${zh.size}`);

  // 每个题目标签都必须有中英两条,否则英文界面会漏出中文
  const allTags = new Set(RAW_TIERS.flatMap((t) => t.pool.flatMap((q) => q.tags)));
  const missingTagZh = [...allTags].filter((tag) => !zh.has(`tag.${tag}`));
  const missingTagEn = [...allTags].filter((tag) => !en.has(`tag.${tag}`));
  ok(`i18n 字典:全部 ${allTags.size} 个题目标签都有中文条目`, missingTagZh.length === 0, missingTagZh.join(', '));
  ok('i18n 字典:全部题目标签都有英文条目', missingTagEn.length === 0, missingTagEn.join(', '));

  // 题库提供的语言 与 字典/渲染层支持的语言 必须一致
  const srcLangs = new Set();
  for (const t of RAW_TIERS) {
    for (const q of t.pool) {
      for (const k of Object.keys(q)) {
        if (LOCALES.includes(k)) srcLangs.add(k);
      }
    }
  }
  ok(
    '题库提供的语言与 LOCALES 一致',
    LOCALES.every((l) => srcLangs.has(l)) && srcLangs.size === LOCALES.length,
    `题库:${[...srcLangs].join(',')} / 期望:${LOCALES.join(',')}`,
  );
}

/* ------------------------------------------------------------------ */
section('2. 抽题与选项打乱');

function shuffle(input) {
  const out = input.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function draw(tier, usedIds) {
  const used = new Set(usedIds);
  let cands = tier.pool.filter((q) => !used.has(q.id));
  if (cands.length === 0) {
    const recent = usedIds[usedIds.length - 1];
    cands = tier.pool.filter((q) => q.id !== recent);
    if (cands.length === 0) cands = tier.pool.slice();
  }
  const q = cands[Math.floor(Math.random() * cands.length)];
  const correctText = q.options[q.answer];
  const options = shuffle(q.options);
  return { q, options, answerIndex: options.indexOf(correctText) };
}

let badShuffle = 0;
let answerAlwaysSame = 0;
const seenPositions = new Set();
for (let n = 0; n < 400; n++) {
  const d = draw(TIERS[0], []);
  if (d.options[d.answerIndex] !== d.q.options[d.q.answer]) badShuffle += 1;
  if (new Set(d.options).size !== 4) badShuffle += 1;
  seenPositions.add(d.answerIndex);
  if (d.answerIndex === d.q.answer) answerAlwaysSame += 1;
}
ok('打乱后 answerIndex 始终指向正确文本', badShuffle === 0, `${badShuffle} 次异常`);
ok('打乱后 4 个位置都能成为正确项', seenPositions.size === 4, `实际 ${[...seenPositions].sort().join(',')}`);
ok('打乱确实是随机的(不是恒等映射)', answerAlwaysSame < 380, `400 次里有 ${answerAlwaysSame} 次位置不变`);

// 一档 5 题不重复
let dup = 0;
for (let n = 0; n < 200; n++) {
  const used = [];
  for (let i = 0; i < ROUNDS_PER_TIER; i++) {
    const d = draw(TIERS[1], used);
    if (used.includes(d.q.id)) dup += 1;
    used.push(d.q.id);
  }
}
ok('同一档内 5 题不重复(200 次模拟)', dup === 0, `${dup} 次重复`);

/* ------------------------------------------------------------------ */
section('3. 完整一局推进(独立复刻规则)');

function simulate({ answers }) {
  let tierIndex = 0;
  let progress = 0;
  let lives = TIERS[0].allowMiss;
  let score = 0;
  let chain = 0;
  let bestChain = 0;
  let correct = 0;
  let answered = 0;
  let cleared = false;
  let finalTier = 0;
  const usedIds = [];
  const trace = [];

  for (let step = 0; step < 200; step++) {
    const t = TIERS[tierIndex];
    const timeLeft = t.timeLimit; // 完美作答:满时间奖励
    const d = draw(t, usedIds);
    usedIds.push(d.q.id);
    const isRight = answers(step, t, d);
    answered += 1;

    if (isRight) {
      const timeFactor = 1 + 0.5 * (timeLeft / t.timeLimit); // = 1.5
      const comboFactor = Math.min(2, 1 + 0.1 * chain); // chain 为已有连击数
      const gain = Math.round(t.baseScore * timeFactor * comboFactor);
      score += gain;
      chain += 1;
      bestChain = Math.max(bestChain, chain);
      correct += 1;
      progress += 1;
      trace.push(`${t.label} Q${progress} 对 +${gain} (连击${chain})`);
    } else {
      chain = 0;
      lives -= 1;
      trace.push(`${t.label} Q${progress + 1} 错 不灭-1 -> ${lives}`);
    }
    finalTier = Math.max(finalTier, tierIndex);

    if (lives <= 0) return { end: 'dead', tierIndex, score, correct, answered, bestChain, cleared, finalTier, trace };
    if (isRight && progress >= ROUNDS_PER_TIER) {
      if (tierIndex >= TIERS.length - 1) {
        cleared = true;
        return { end: 'cleared', tierIndex, score, correct, answered, bestChain, cleared, finalTier, trace };
      }
      tierIndex += 1;
      progress = 0;
      lives = TIERS[tierIndex].allowMiss;
      trace.push(`>>> 晋级 ${TIERS[tierIndex].label} (不灭重置为 ${lives})`);
    }
  }
  return { end: 'loop', tierIndex, score, correct, answered, bestChain, cleared, finalTier, trace };
}

// 3a. 全对
const perfect = simulate({ answers: () => true });
ok('全对 → 通关', perfect.end === 'cleared', perfect.end);
ok('全对 → 答对 15 题', perfect.correct === 15, String(perfect.correct));
// 手工核算(连击**跨档累积**,不因晋级清零):
//   入门 100×(1.5×1.0,1.1,…,1.4) = 150+165+180+195+210 = 900
//   硬核 250×1.5×(1.5,1.6,1.7,1.8,1.9) = 563+600+638+675+713 = 3189
//   竞赛 500×1.5×2.0 ×5 = 7500
ok('全对 → 满分 11589', perfect.score === 900 + 3189 + 7500, String(perfect.score));
ok('全对 → 最高连击 15', perfect.bestChain === 15, String(perfect.bestChain));
ok('全对 → 到达竞赛档', perfect.finalTier === 2, String(perfect.finalTier));

// 3b. 第一题就错两次 → 死在入门档
let n1 = 0;
const noviceDead = simulate({ answers: () => n1++ < 2 ? false : true });
// 错两次:不灭 2→1→0,第二次后出局
ok('入门档连错 2 题 → 出局', noviceDead.end === 'dead', noviceDead.end);
ok('出局时停在入门档', noviceDead.finalTier === 0, String(noviceDead.finalTier));
ok('出局时得分为 0', noviceDead.score === 0, String(noviceDead.score));

// 3c. 入门档全对后,硬核档错 1 题 → 出局
let step = 0;
const hackerDead = simulate({
  answers: (s, t) => (t.id === 'hacker' ? false : true),
});
ok('硬核档错 1 题即出局(不灭=1)', hackerDead.end === 'dead', hackerDead.end);
ok('硬核档出局时最高档位 = 硬核', hackerDead.finalTier === 1, String(hackerDead.finalTier));
ok('硬核档出局时已答对 5 题(入门全对)', hackerDead.correct === 5, String(hackerDead.correct));

// 3d. 每档固定「错 1 题 + 连对 5 题」:入门档不灭=2 能扛住 1 次失误,
//     但硬核/竞赛档不灭=1,那次失误就是致命的 —— 这正是「越往上越不许犯错」的设计。
const tierCounterA = { novice: 0, hacker: 0, acm: 0 };
const staged = simulate({
  answers: (s, t) => {
    tierCounterA[t.id] += 1;
    return tierCounterA[t.id] !== 1; // 每档第 1 题错
  },
});
ok('入门档失误 1 次不致命(不灭=2)', staged.correct === 5, String(staged.correct));
ok('进入硬核档后首次失误即出局(不灭=1)', staged.end === 'dead' && staged.finalTier === 1, `${staged.end}/${staged.finalTier}`);
ok('该局作答 7 题(入门 6 + 硬核 1)', staged.answered === 7, String(staged.answered));
ok('该局得分 900(入门 5 题:150+165+180+195+210)', staged.score === 900, String(staged.score));

// 3d-2. 只有入门档失误、之后全对 → 能一路通关
const tierCounterB = { novice: 0, hacker: 0, acm: 0 };
const forgiving = simulate({
  answers: (s, t) => {
    tierCounterB[t.id] += 1;
    return !(t.id === 'novice' && tierCounterB[t.id] === 1);
  },
});
ok('仅入门档失误 1 次 → 仍能通关', forgiving.end === 'cleared', forgiving.end);
ok('该局答对 15 题(失误不计分,但 5 道对的仍晋级)', forgiving.correct === 15, String(forgiving.correct));
ok('该局作答 16 题(入门 6 + 硬核 5 + 竞赛 5)', forgiving.answered === 16, String(forgiving.answered));
ok('该局最高连击 15(失误后连对到通关)', forgiving.bestChain === 15, String(forgiving.bestChain));
// 关键结论:答错只是重置连击倍率,不会「浪费」分数 ——
// 该局与全对局的得分完全相同(11589),差别只在多项 1 次作答。
ok('失误但不致命 → 得分与全对局相同 11589', forgiving.score === perfect.score, `${forgiving.score} vs ${perfect.score}`);

// 3e. 不灭次数重置:确认晋级后 lives 回到该档 allowMiss
ok(
  '晋级后不灭次数按新档位重置',
  perfect.trace.some((l) => l.includes('不灭重置为 1')),
  perfect.trace.filter((l) => l.startsWith('>>>')).join(' | '),
);

/* ------------------------------------------------------------------ */
section('4. 评级阈值');

function rankOf({ cleared, correct, finalTier, tierIndex, score }) {
  const reachedAcm = finalTier >= 2 || tierIndex >= 2;
  if (cleared && correct >= TIERS.length * ROUNDS_PER_TIER) return 'SSS';
  if (cleared) return 'SS';
  if (reachedAcm) return 'S';
  if (score >= 900) return 'A';
  if (score >= 400) return 'B';
  if (score >= 150) return 'C';
  return 'D';
}
ok('全对通关 → SSS', rankOf({ cleared: true, correct: 15, finalTier: 2, tierIndex: 2, score: 11200 }) === 'SSS');
ok('错一题通关 → SS', rankOf({ cleared: true, correct: 14, finalTier: 2, tierIndex: 2, score: 10000 }) === 'SS');
ok('死在竞赛档 → S', rankOf({ cleared: false, correct: 11, finalTier: 2, tierIndex: 2, score: 5000 }) === 'S');
ok('入门全对后死在硬核 → A', rankOf({ cleared: false, correct: 6, finalTier: 1, tierIndex: 1, score: 1000 }) === 'A');
ok('低分 → D', rankOf({ cleared: false, correct: 0, finalTier: 0, tierIndex: 0, score: 0 }) === 'D');

/* ------------------------------------------------------------------ */
section('结果');
console.log(`\n通过 ${pass} 项,失败 ${fail} 项`);
if (fail > 0) {
  console.log('\n失败项:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exitCode = 1;
} else {
  console.log('\n全部通过 ✓');
}

// 打印一局全对的轨迹,便于人工核对
console.log('\n--- 全对一局轨迹 ---');
for (const line of perfect.trace) console.log('  ' + line);

console.log('\n--- 每档先错一题 的轨迹(验证不灭次数递减) ---');
for (const line of staged.trace) console.log('  ' + line);
console.log(`  合计: score=${staged.score} correct=${staged.correct} answered=${staged.answered} 结局=${staged.end}`);
