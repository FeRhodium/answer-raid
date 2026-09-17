<script lang="ts">
  /** 开机自检序列。全屏、不可跳过——先建立"硬核"预期。 */
  import { onMount } from 'svelte';
  import { game, boot, bootLines } from '../quiz.svelte';
  import { msg, t } from '../i18n.svelte.ts';

  let shown = $state<string[]>([]);
  let idx = $state(0);
  let charIdx = $state(0);
  let finished = $state(false);
  let clock = $state('00:00:00');

  onMount(() => {
    const clockTimer = setInterval(() => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, '0');
      clock = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    }, 1000);

    const tick = setInterval(() => {
      const line = bootLines()[idx];
      if (line === undefined) {
        clearInterval(tick);
        finished = true;
        return;
      }
      if (charIdx < line.length) {
        charIdx += 2;
        shown = [...shown.slice(0, idx), line.slice(0, charIdx)];
      } else {
        idx += 1;
        charIdx = 0;
      }
    }, 16);

    return () => {
      clearInterval(tick);
      clearInterval(clockTimer);
    };
  });

  function enter(): void {
    if (!finished) {
      const lines = bootLines();
      shown = lines.slice();
      idx = lines.length;
      finished = true;
      return;
    }
    boot();
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      enter();
    }
  }}
/>

<div
  class="boot"
  role="button"
  tabindex="0"
  onclick={enter}
  onkeydown={(e) => {
    if (e.key === 'Enter') enter();
  }}
>
  <div class="bar">
    <span class="dot"></span>
    <span>CSA-BIOS · POST</span>
    <span class="grow"></span>
    <span class="mute">{clock}</span>
  </div>

  <div class="log">
    {#each shown as line, i (i)}
      <div class="line" style="animation-delay:{i * 20}ms">
        <span class="arrow">›</span>
        <span>{line}</span>
        {#if i === shown.length - 1 && !finished}<span class="caret">█</span>{/if}
      </div>
    {/each}
    {#if finished}
      <div class="line ready">
        <span class="arrow">›</span>
        <span>{t(msg('boot.ready'))}</span>
        <span class="caret">█</span>
      </div>
    {/if}
  </div>

  <div class="hint mute">[ SKIP / ENTER ]</div>
</div>

<style>
  .boot {
    position: relative;
    z-index: 3;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(1rem, 5vw, 4rem);
    cursor: pointer;
    background: linear-gradient(180deg, rgba(4, 6, 10, 0.9), rgba(4, 6, 10, 0.72));
  }
  .bar {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.8rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--fg-dim);
    border-bottom: 1px solid var(--line);
    padding-bottom: 0.5rem;
    margin-bottom: 1.4rem;
  }
  .dot {
    width: 8px;
    height: 8px;
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent);
    animation: blink 1.1s steps(1) infinite;
  }
  .grow {
    flex: 1;
  }
  .log {
    font-size: clamp(0.82rem, 2.4vw, 1.02rem);
    line-height: 1.9;
    color: var(--fg);
    min-height: 12rem;
  }
  .line {
    display: flex;
    gap: 0.6rem;
    animation: slideIn 0.2s ease-out both;
  }
  .arrow {
    color: var(--accent);
  }
  .caret {
    color: var(--accent);
    animation: blink 0.9s steps(1) infinite;
  }
  .ready {
    margin-top: 1.2rem;
    color: var(--accent);
  }
  .hint {
    margin-top: 2.5rem;
    font-size: 0.75rem;
    letter-spacing: 0.3em;
    text-align: right;
  }
</style>
