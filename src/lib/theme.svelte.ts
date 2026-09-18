/**
 * 明暗主题。与 i18n 同构:runes 单例 + localStorage 持久化 + `?theme=` 覆盖。
 *
 * 两个主题:
 *   dark  —— CRT 暗色,原版视觉(扫描线 + 字符雨 + 辉光)
 *   light —— 亮色,给**强光环境**用(户外摊位、正午阳光下的屏幕)。
 *            做法是在 <html> 上写 data-theme="light",由 app.css 换一整套语义令牌;
 *            同时关掉 CRT 叠层与字符雨 —— 那两样在亮色下只会糊成一层灰。
 *
 * 为什么用 $state 而不是普通变量:模板要读 `theme()`,普通模块变量 Svelte 追踪不到,
 * 点了按钮界面不会重绘(静音按钮就踩过这个坑)。
 */

export const THEMES = ['dark', 'light'] as const;
export type Theme = (typeof THEMES)[number];

const THEME_KEY = 'csa.raid.theme.v1';

function isTheme(v: unknown): v is Theme {
  return typeof v === 'string' && (THEMES as readonly string[]).includes(v);
}

function themeFromQuery(): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    const q = new URLSearchParams(window.location.search).get('theme');
    return isTheme(q) ? q : null;
  } catch {
    return null;
  }
}

function storedTheme(): Theme | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (!raw) return null;
    const parsed: unknown = isTheme(raw) ? raw : JSON.parse(raw);
    return isTheme(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** 首次进入时决定主题:查询参数 > 本地偏好 > 跟随系统 > 暗色。 */
export function initialTheme(): Theme {
  const q = themeFromQuery();
  if (q) return q;
  const s = storedTheme();
  if (s) return s;
  if (typeof matchMedia === 'function') {
    try {
      if (matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    } catch {
      /* 忽略 */
    }
  }
  return 'dark';
}

const state = $state<{ theme: Theme }>({ theme: initialTheme() });

/** 当前主题(响应式)。 */
export function theme(): Theme {
  return state.theme;
}

export function isLight(): boolean {
  return state.theme === 'light';
}

/** 移动端地址栏配色:跟着主题走,否则亮色下顶上会挂一条黑边。 */
const META_COLOR: Record<Theme, string> = { dark: '#04060a', light: '#f4f7f6' };

/** 把主题写进 <html data-theme>:CSS 令牌全靠它切换。 */
export function applyThemeAttr(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = state.theme;
  // 让原生控件(滚动条、输入框)也跟着换配色
  document.documentElement.style.colorScheme = state.theme === 'light' ? 'light' : 'dark';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', META_COLOR[state.theme]);
}

export function setTheme(next: Theme): void {
  if (!isTheme(next) || state.theme === next) return;
  state.theme = next;
  applyThemeAttr();
  // 手动切过主题后摘掉 ?theme=,否则刷新时该参数会再次盖过用户选择
  if (typeof window !== 'undefined' && typeof history !== 'undefined') {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('theme')) {
        url.searchParams.delete('theme');
        history.replaceState(null, '', url.pathname + url.search + url.hash);
      }
    } catch {
      /* 忽略 */
    }
  }
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(next));
  } catch {
    /* 无痕模式:忽略 */
  }
}

export function toggleTheme(): void {
  setTheme(state.theme === 'dark' ? 'light' : 'dark');
}

/** 切换按钮上显示的图标(表示**切过去之后**的样子)。 */
export const THEME_ICON: Record<Theme, string> = { dark: '☀', light: '☾' };
