<script lang="ts">
  /**
   * 背景:字符雨 + 网格 + 漂移光斑。全部画在 canvas 上,
   * 与档位色相(--hue)同步。页面隐藏时自动停帧。
   */
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement | undefined = $state();
  let hue = $state(152);

  const HEX = '0123456789ABCDEF';
  const GLYPHS = '01<>{}[]()/*+-=|&^%$#@!?~;:¥§ΔΣΩλ∴∵≡⊥⊕⊆≠∞';

  onMount(() => {
    const el = canvas;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let cols = 0;
    let drops: number[] = [];
    let speeds: number[] = [];
    const FS = 15;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.floor(w * dpr);
      el.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / FS);
      drops = new Array(cols).fill(0).map(() => Math.random() * -h);
      speeds = new Array(cols).fill(0).map(() => 0.6 + Math.random() * 1.9);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const mo = new MutationObserver(() => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--hue').trim();
      const n = Number.parseInt(v, 10);
      if (!Number.isNaN(n)) hue = n;
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

    const readHue = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--hue').trim();
      const n = Number.parseInt(v, 10);
      if (!Number.isNaN(n)) hue = n;
    };
    readHue();

    let t = 0;
    let running = true;
    const onVis = () => {
      running = !document.hidden;
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(48, now - last) / 16.67;
      last = now;
      t += dt;

      ctx.clearRect(0, 0, w, h);

      // 漂移光斑
      const g1x = w * (0.5 + 0.32 * Math.sin(t / 420));
      const g2x = w * (0.5 + 0.36 * Math.cos(t / 610));
      const blob = (x: number, y: number, r: number, a: number) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `hsla(${hue} 100% 55% / ${a})`);
        g.addColorStop(1, 'hsla(0 0% 0% / 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      };
      blob(g1x, h * 0.12, Math.max(w, h) * 0.5, 0.05);
      blob(g2x, h * 0.92, Math.max(w, h) * 0.45, 0.035);

      // 网格
      ctx.strokeStyle = `hsla(${hue} 80% 60% / 0.045)`;
      ctx.lineWidth = 1;
      const grid = 44;
      ctx.beginPath();
      for (let x = 0; x <= w; x += grid) {
        ctx.moveTo(Math.floor(x) + 0.5, 0);
        ctx.lineTo(Math.floor(x) + 0.5, h);
      }
      for (let y = 0; y <= h; y += grid) {
        ctx.moveTo(0, Math.floor(y) + 0.5);
        ctx.lineTo(w, Math.floor(y) + 0.5);
      }
      ctx.stroke();

      // 字符雨
      ctx.font = `600 ${FS}px 'JetBrains Mono', monospace`;
      ctx.textBaseline = 'top';
      for (let i = 0; i < cols; i++) {
        const x = i * FS + 2;
        const y = drops[i];
        const head = Math.random() < 0.06 ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : HEX[(Math.random() * 16) | 0];
        // 拖尾
        for (let k = 0; k < 7; k++) {
          const ty = y - k * FS;
          if (ty < -FS || ty > h) continue;
          const a = k === 0 ? 0.85 : 0.2 * (1 - k / 7);
          ctx.fillStyle = `hsla(${hue} 100% ${k === 0 ? 78 : 58}% / ${a})`;
          ctx.fillText(
            k === 0 ? head : HEX[(Math.random() * 16) | 0],
            x,
            ty,
          );
        }
        drops[i] += speeds[i] * dt * 2.3;
        if (drops[i] > h + 40 && Math.random() < 0.06) drops[i] = -Math.random() * 120;
        if (drops[i] > h + 200) drops[i] = -Math.random() * 120;
      }

      if (running) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  });
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
  canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    opacity: 0.5;
  }
</style>
