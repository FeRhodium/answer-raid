/**
 * 引擎单测:直接 import 真实的 quiz.svelte.ts 商店模块(Svelte 5 会剥离 runes),
 * 于是可以精确、确定性地驱动整局流程 —— 不再依赖 DOM 或随机数预测。
 *
 * 运行:node --experimental-strip-types --import ./tools/store-register.mjs tools/store-test.mjs
 */

let pass = 0;
let fail = 0;
const failures = [];
function ok(name, cond, extra = '') {
  if (cond) {
    pass += 1;
    console.log(`  \u2713 ${name}`);
  } else {
    fail += 1;
    failures.push(`${name}${extra ? ` — ${extra}` : ''}`);
    console.log(`  \u2717 ${name}${extra ? ` — ${extra}` : ''}`);
  }
}
function section(t) {
  console.log(`\n=== ${t} ===`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const q = await import('../src/lib/quiz.svelte.ts');
const { game, tier } = q;
const TIERS = (await import('../src/lib/data/tiers.ts')).TIERS;
const { ROUNDS_PER_TIER } = await import('../src/lib/data/types.ts');
const { bankFor } = await import('../src/lib/data/questions.ts');
const { fmt, locale, setLocale } = await import('../src/lib/i18n.svelte.ts');

/** 档位名现在走 i18n 字典(`tier.<id>.label`),不再是 TierMeta 上的字段。 */
const tierLabel = (meta) => fmt(`tier.${meta.id}.label`);
const tierIds = (tierId) => bankFor(tierId, locale()).map((x) => x.id);

/** 等到进入指定 phase(引擎里靠 setTimeout 推进) */
async function waitPhase(phase, timeoutMs = 6000) {
  const t0 = Date.now();
  while (game.phase !== phase) {
    if (Date.now() - t0 > timeoutMs) return false;
    await sleep(20);
  }
  return true;
}
/** 当前题的正确项下标(直接来自商店,100% 准确) */
const correctIndex = () => game.current.answerIndex;
const questionId = () => game.current.q.id;

/* ------------------------------------------------------------------ */
section('1. 开局');
ok('初始 phase = boot', game.phase === 'boot', game.phase);
q.boot();
ok('boot() 后进入 intro', game.phase === 'intro', game.phase);
q.startRun('引擎测试');
ok('startRun 后进入 playing', game.phase === 'playing', game.phase);
ok('代号已归一化', game.handle === '引擎测试', game.handle);
ok('档位是入门档', tierLabel(tier()) === '入门档', tierLabel(tier()));
ok('初始分数 0', game.score === 0, String(game.score));
ok('初始不灭 = 2', game.lives === 2, String(game.lives));
ok('初始锦囊 = 3', game.jokersLeft === 3, String(game.jokersLeft));
ok('拿到一道题且 4 个选项', game.current.options.length === 4, String(game.current.options.length));
ok('正确项下标合法', correctIndex() >= 0 && correctIndex() < 4, String(correctIndex()));

section('2. 时间奖励随时间衰减');
const fullPot = q.livePotential();
ok('满时间时本题潜在得分 = 100×1.5×1.0 = 150', fullPot === 150, String(fullPot));
game.timeLeft = game.timeLimit / 2;
ok('时间过半后潜在得分降到 125', q.livePotential() === 125, String(q.livePotential()));
game.timeLeft = 0;
ok('时间归零后潜在得分 = 100', q.livePotential() === 100, String(q.livePotential()));
game.timeLeft = game.timeLimit;

section('3. 锦囊');
ok('逻辑切割可用', q.canUseJoker('fifty'));
q.useJoker('fifty');
ok('抹除 2 个选项', game.eliminated.length === 2, String(game.eliminated.length));
ok('抹除的都是错误项', game.eliminated.every((i) => i !== correctIndex()), JSON.stringify(game.eliminated));
ok('锦囊剩 2', game.jokersLeft === 2, String(game.jokersLeft));
ok('本题不能再用逻辑切割', !q.canUseJoker('fifty'));
q.useJoker('hint');
ok('情报给出考点', typeof game.hint === 'string' && game.hint.length > 0, String(game.hint));
ok('情报使本题得分打 4 折', game.penalty === 0.4, String(game.penalty));
const hintedPot = q.livePotential();
ok('打折后的潜在得分 = 60', hintedPot === 60, String(hintedPot));
ok('锦囊剩 1', game.jokersLeft === 1, String(game.jokersLeft));
q.useJoker('freeze');
ok('时间冻结补满到上限', game.timeLeft === game.timeLimit, String(game.timeLeft));
ok('锦囊耗尽', game.jokersLeft === 0, String(game.jokersLeft));
ok('锦囊耗尽后不可用', !q.canUseJoker('freeze'));
q.useJoker('freeze');
ok('耗尽后再调用不会变成负数', game.jokersLeft === 0, String(game.jokersLeft));

section('4. 答对一题:计分 / 连击 / 进度');
const gain = q.livePotential();
q.answer(correctIndex());
ok('进入 feedback', game.phase === 'feedback', game.phase);
ok('判定为正确', game.isCorrect === true);
ok('得分 = 打折后潜在分', game.score === gain, `${game.score} vs ${gain}`);
ok('连击 = 1', game.chain === 1, String(game.chain));
ok('本档进度 = 1', game.tierProgress === 1, String(game.tierProgress));
ok('答对不扣不灭', game.lives === 2, String(game.lives));
ok('记录了得分明细', game.lastBreakdown.includes('基础'), game.lastBreakdown);

section('5. 答错一题:扣命 / 清零连击');
ok('自动进入下一题', await waitPhase('playing'), game.phase);
const wrongIdx = [0, 1, 2, 3].find((i) => i !== correctIndex());
const scoreBefore = game.score;
q.answer(wrongIdx);
ok('判定为错误', game.isCorrect === false);
ok('不加分', game.score === scoreBefore, `${game.score} vs ${scoreBefore}`);
ok('连击清零', game.chain === 0, String(game.chain));
ok('不灭 2 → 1', game.lives === 1, String(game.lives));
ok('题目总数已计入', game.answered === 2, String(game.answered));

/* ------------------------------------------------------------------ */
section('6. 连答 5 题晋级硬核档');
// 先让本档剩余题目全部答对:当前进度 1,还需 4 题
await waitPhase('playing');
let guard = 0;
while (game.tierProgress < ROUNDS_PER_TIER && game.phase !== 'promote' && guard++ < 12) {
  if (game.phase === 'playing') q.answer(correctIndex());
  await sleep(60);
  if (game.phase === 'feedback') await sleep(300);
  if (game.phase === 'promote') break;
  if (game.phase === 'playing') continue;
  if (game.phase === 'over') break;
  await waitPhase('playing', 4000);
  if (game.phase === 'promote') break;
}
ok('触发晋级幕', game.phase === 'promote', `phase=${game.phase} progress=${game.tierProgress}`);
ok('档位索引前进到 1', game.tierIndex === 1, String(game.tierIndex));
ok('档位是硬核档', tierLabel(tier()) === '硬核档', tierLabel(tier()));
ok('晋级后不灭重置为 1', game.lives === 1, String(game.lives));
ok('本档进度归零', game.tierProgress === 0, String(game.tierProgress));
ok('分数保留', game.score > 0, String(game.score));
ok('连击跨档保留', game.chain >= 1, String(game.chain));

section('7. 硬核档:答错一次即出局');
await waitPhase('playing', 6000);
ok('晋级后拿到硬核档题目', tierIds('hacker').includes(questionId()), questionId());
ok('硬核档限时 45s', game.timeLimit === 45, String(game.timeLimit));
const scoreBeforeDeath = game.score;
const hkWrong = [0, 1, 2, 3].find((i) => i !== correctIndex());
q.answer(hkWrong);
ok('答错后不灭归零', game.lives === 0, String(game.lives));
ok('答错不加分', game.score === scoreBeforeDeath, String(game.score));
ok('进入结算 over', await waitPhase('over'), game.phase);
ok('结算未通关', game.cleared === false);
ok('最终档位记录为硬核档', tierLabel(TIERS[game.finalTierIndex]) === '硬核档', String(game.finalTierIndex));
ok('最高连击被记录', game.bestChain >= 1, String(game.bestChain));
const rankNow = q.rank();
// 该局:入门档全过(5/5)、硬核档首题出局,得分约 400~900 → 应为 B(有底子)
ok('评级为 B(过入门档、折在硬核档)', rankNow.t === 'B', `${rankNow.t} / 分数 ${game.score}`);

/* ------------------------------------------------------------------ */
section('8. 重开一局:状态完全重置');
q.retry();
ok('回到 playing', game.phase === 'playing', game.phase);
ok('分数清零', game.score === 0, String(game.score));
ok('不灭回到 2(入门档)', game.lives === 2, String(game.lives));
ok('锦囊回到 3', game.jokersLeft === 3, String(game.jokersLeft));
ok('档位回到入门档', tierLabel(tier()) === '入门档', tierLabel(tier()));
ok('连击清零', game.chain === 0, String(game.chain));
ok('抹除标记清空', game.eliminated.length === 0, String(game.eliminated.length));
ok('情报清空', game.hint === null, String(game.hint));
ok('折扣重置', game.penalty === 1, String(game.penalty));

/* ------------------------------------------------------------------ */
section('9. 超时判定(直接调用 answer(-1) 无法触发,改为让倒计时自然走完)');
// 把剩余时间压到 0.2s,等心跳把它归零
game.timeLeft = 0.2;
ok('等待超时判定', await waitPhase('feedback', 4000), game.phase);
ok('超时标记', game.timesUp === true);
ok('超时视为答错', game.isCorrect === false);
ok('超时扣命', game.lives === 1, String(game.lives));
ok('超时不计分', game.score === 0, String(game.score));
ok('超时明细文案正确', game.lastBreakdown.includes('TIMEOUT'), game.lastBreakdown);

/* ------------------------------------------------------------------ */
section('9b. i18n:抽题按当前语言本地化');
{
  // 中文:题干应含汉字
  setLocale('zh');
  q.retry();
  ok('[zh] 抽到的题是中文题干', /[\u4e00-\u9fa5]/.test(game.current.q.prompt), game.current.q.prompt.slice(0, 40));
  // 注意:选项**不保证**含汉字 —— 有些题的选项是 `[1, 4, 7]` 这类两种语言通用的字面量。
  // 所以这里只断言「选项文本与题库里该题的中文选项一致」。
  {
    const zhBank = bankFor(game.current.q.tier, 'zh').find((x) => x.id === game.current.q.id);
    ok(
      '[zh] 选项取自中文题库',
      zhBank !== undefined && zhBank.options.every((o) => game.current.q.options.includes(o)),
      game.current.q.options.join('|'),
    );
  }
  ok('[zh] 情报文案是中文', q.canUseJoker('hint') && (q.useJoker('hint'), /[\u4e00-\u9fa5]/.test(game.hint)), String(game.hint));

  // 英文:同一道题应换成英文文本,且结构(id / 答案下标 / 选项数)完全不变
  const zhId = game.current.q.id;
  const zhCount = game.current.q.options.length;
  setLocale('en');
  q.retry();
  ok('[en] 抽到的题是英文题干', !/[\u4e00-\u9fa5]/.test(game.current.q.prompt), game.current.q.prompt.slice(0, 60));
  ok('[en] 题面确实有英文内容', /[a-zA-Z]{4,}/.test(game.current.q.prompt), game.current.q.prompt.slice(0, 40));
  ok('[en] 选项数不变', game.current.q.options.length === zhCount, String(game.current.q.options.length));
  ok('[en] id 仍是题库里的合法 id', /^(novice|hacker|acm)-\d$/.test(game.current.q.id), game.current.q.id);
  ok('[en] 正确项下标仍在选项范围内', game.current.answerIndex >= 0 && game.current.answerIndex < zhCount, String(game.current.answerIndex));
  ok('[en] 情报文案是英文', q.canUseJoker('hint') && (q.useJoker('hint'), !/[\u4e00-\u9fa5]/.test(game.hint)), String(game.hint));
  ok('[en] 计分明细是英文', game.lastBreakdown === '' || !/[\u4e00-\u9fa5]/.test(game.lastBreakdown), game.lastBreakdown);

  // 复位,避免影响后续用例
  setLocale('zh');
  q.retry();
  ok('复位后回到中文题干', /[\u4e00-\u9fa5]/.test(game.current.q.prompt), game.current.q.prompt.slice(0, 30));
  void zhId;
}

/* ------------------------------------------------------------------ */
section('10. 题库不重复抽取(一局内)');
q.retry();
const order = [questionId()];
game.timeLeft = 999;
q.answer(correctIndex());
for (let n = 0; n < 4; n++) {
  await waitPhase('playing', 4000);
  if (game.phase !== 'playing') break;
  order.push(questionId());
  game.timeLeft = 999; // 避免超时
  q.answer(correctIndex());
  await sleep(300);
}
console.log(`      抽到的题序 = ${order.join(' → ')}`);
ok('入门档 5 题互不相同', new Set(order).size === order.length, `dup 出现在 ${order.join(',')}`);

/* ------------------------------------------------------------------ */
section('11. 回到标题');
q.toIntro();
ok('phase = intro', game.phase === 'intro', game.phase);
ok('分数清零', game.score === 0, String(game.score));
ok('保留代号', game.handle === '引擎测试', game.handle);

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
process.exit(process.exitCode ?? 0);
