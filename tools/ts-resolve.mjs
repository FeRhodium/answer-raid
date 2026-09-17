/**
 * Node ESM 钩子:
 * 1) resolve:把源码里省略扩展名的相对导入补成 .ts / .js / /index.ts
 * 2) load:对**含 runes 的 TS 模块**用 Svelte 自己的 compileModule 处理($state/$derived/$effect),
 *    否则 Node 的类型剥离只会把 `$state<T>(...)` 变成对未定义标识符的调用。
 *
 * 注意:需要处理的**不只是** `.svelte.ts` —— `i18n.ts` 也是普通 `.ts`,
 * 但同样用了 runes。所以这里按「文件里是否真的出现 runes」来判断,
 * 顺带也避免了给全项目每个 .ts 都跑一遍编译器。
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const RUNE_CALL = /\$state\s*[<(]|\$derived\s*[<(]|\$effect\s*[<(]/;

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (!specifier.startsWith('.') && !specifier.startsWith('/')) throw err;
    const parent = context.parentURL ?? import.meta.url;
    const base = new URL(specifier, parent);
    for (const suffix of ['.ts', '.js', '/index.ts', '/index.js', '.svelte.ts']) {
      try {
        return await nextResolve(base.href + suffix, context);
      } catch {
        /* 试下一个后缀 */
      }
    }
    throw err;
  }
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.ts')) {
    const filename = fileURLToPath(url);
    const raw = await readFile(filename, 'utf8');
    if (url.includes('.svelte.') || RUNE_CALL.test(raw)) {
      // 先剥掉 TS 类型(保留 runes),再交给 Svelte 编译器处理 $state/$derived
      const ts = await import('typescript');
      const stripped = ts.default.transpileModule(raw, {
        fileName: filename,
        compilerOptions: {
          module: ts.default.ModuleKind.ESNext,
          target: ts.default.ScriptTarget.ES2022,
          verbatimModuleSyntax: true,
          isolatedModules: true,
        },
      }).outputText;
      const { compileModule } = await import('svelte/compiler');
      const compiled = compileModule(stripped, { filename, generate: 'client' });
      return { format: 'module', shortCircuit: true, source: compiled.js.code };
    }
  }
  return nextLoad(url, context);
}
