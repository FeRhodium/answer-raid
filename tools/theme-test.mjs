/**
 * 主题令牌校验:node tools/theme-test.mjs
 *
 * 为什么单独写一个脚本:DOM 冒烟测试跑在 happy-dom 里,它**不加载 CSS 文件**,
 * 所以测试里读 getComputedStyle 拿不到 data-theme 覆盖后的值 —— 亮色主题到底有没有生效,
 * 在那里是测不出来的。这里直接读 app.css 的源码来校验。
 *
 * 守两件事:
 * 1) 两个主题必须定义**同一套**令牌 —— 否则亮色下会漏用暗色的值(比如近黑文字配深底);
 * 2) 组件里不许再出现硬编码的暗色 —— 一处漏改,亮色下就是一块黑斑。
 */

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'src/app.css'), 'utf8');

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

/** 取出某个选择器块里定义的令牌名 -> 值 */
function tokensIn(startPattern, endPattern) {
  const start = css.indexOf(startPattern);
  if (start < 0) return null;
  const end = endPattern ? css.indexOf(endPattern, start + 1) : css.length;
  const block = css.slice(start, end < 0 ? css.length : end);
  const out = new Map();
  for (const m of block.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) out.set(m[1], m[2].trim());
  return out;
}

section('1. 两套主题的令牌完整性');
const dark = tokensIn(':root {', "[data-theme='light']");
const light = tokensIn("[data-theme='light'] {", '\n}');

ok('找到 :root 令牌块', dark instanceof Map && dark.size > 10, String(dark?.size));
ok('找到 [data-theme=light] 令牌块', light instanceof Map && light.size > 10, String(light?.size));

/**
 * 与主题无关的令牌:色相由 JS 按档位写入,字体栈两套主题共用。
 * 亮色块里**不应该**重复定义它们。
 */
const THEME_INDEPENDENT = new Set(['hue', 'mono', 'display']);

const missing = [...dark.keys()].filter((k) => !THEME_INDEPENDENT.has(k) && !light.has(k));
ok('亮色主题覆盖了全部配色令牌(无遗漏)', missing.length === 0, missing.join(', '));

// --hue 由 JS 写进 :root 的内联样式,主题不该再定义它(否则会盖掉档位换色)
ok('亮色主题不重复定义与主题无关的令牌', [...THEME_INDEPENDENT].every((k) => !light.has(k)), [...THEME_INDEPENDENT].filter((k) => light.has(k)).join(', '));

section('2. 亮色主题的取值确实"亮"');
{
  const l = light ?? new Map();
  const d = dark ?? new Map();
  const changed = [...d.keys()].filter((k) => l.get(k) !== d.get(k));
  ok('亮色主题改动了绝大部分令牌', changed.length >= d.size - 3, `${changed.length}/${d.size}`);

  // 背景必须真的变亮;正文必须真的变暗
  const bg = l.get('bg') ?? '';
  ok('--bg 是亮色', /^#(f|e|d)/i.test(bg), bg);
  ok('--fg 是深色', /^#(0|1|2)/i.test(l.get('fg') ?? ''), l.get('fg'));
  ok('--code-bg 不是暗色', !/^#0[0-9a-f]{5}$/i.test(l.get('code-bg') ?? ''), l.get('code-bg'));
  ok('--panel 基本不透明(亮色下要靠面板自身给对比)', !/\/\s*0\.[0-7]\d*\s*\)/.test(l.get('panel') ?? ''), l.get('panel'));
  ok('--on-accent 是深色(亮色强调色块上要压深字)', /^#(0|1|2)/i.test(l.get('on-accent') ?? ''), l.get('on-accent'));
}

section('3. 组件里没有残留的硬编码暗色');
{
  const dir = join(root, 'src');
  const files = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(svelte|css)$/.test(e.name)) files.push(p);
    }
  };
  walk(dir);

  // 只允许出现在 app.css 的令牌定义里
  const BAD = [
    { re: /#04060a/gi, what: '暗色底/近黑字' },
    { re: /#03060a/gi, what: '代码块暗底' },
    { re: /#05080c/gi, what: '滚动条暗底' },
    { re: /#070c12/gi, what: '暗色次级底' },
    { re: /#eafff6/gi, what: '暗色下才可读的亮字' },
    { re: /#cdf3e2/gi, what: '暗色下才可读的代码字' },
    { re: /rgba\(4,\s*6,\s*10/gi, what: '暗色遮罩' },
  ];
  const offenders = [];
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    const isTokenFile = f.endsWith('app.css');
    for (const { re, what } of BAD) {
      for (const m of src.matchAll(re)) {
        // app.css 里只允许在令牌定义行出现
        const line = src.slice(src.lastIndexOf('\n', m.index) + 1, src.indexOf('\n', m.index));
        if (isTokenFile && /^\s*--[a-z0-9-]+:/.test(line)) continue;
        offenders.push(`${f.replace(root, '')} → ${what}`);
      }
    }
  }
  ok('组件里没有硬编码的暗色', offenders.length === 0, offenders.slice(0, 6).join(' | '));
}

section('4. 首帧不闪暗色(预置主题脚本)');
{
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  ok('index.html 里有内联的主题预置脚本', /dataset\.theme\s*=/.test(html));
  ok('预置脚本读同一个 localStorage key', html.includes('csa.raid.theme.v1'));
  ok('预置脚本支持 ?theme= 覆盖', html.includes("get('theme')"));
  ok('color-scheme 同时声明 dark 与 light', /content="dark light"/.test(html));
  ok('theme-color 有对应 meta(供 JS 改写)', /name="theme-color"/.test(html));
}

section('5. 亮色下关掉了 CRT 装饰');
ok(
  'CrtOverlay 支持 enabled 开关',
  readFileSync(join(root, 'src/lib/components/CrtOverlay.svelte'), 'utf8').includes('enabled'),
);
ok(
  'RainBackground 支持 enabled 开关',
  readFileSync(join(root, 'src/lib/components/RainBackground.svelte'), 'utf8').includes('enabled'),
);
ok(
  'App 按主题传入 enabled',
  /enabled=\{theme\(\) === 'dark'\}/.test(readFileSync(join(root, 'src/App.svelte'), 'utf8')),
);

section('结果');
console.log(`\n通过 ${pass} 项,失败 ${fail} 项`);
if (fail > 0) {
  console.log('\n失败项:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exitCode = 1;
} else {
  console.log('\n全部通过 ✓');
}
