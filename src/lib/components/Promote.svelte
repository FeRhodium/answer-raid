<script lang="ts">
  /** 晋级幕:全屏接管,展示新档位简报与 3.4s 倒计时。 */
  import { TIERS } from '../data/tiers';
  import { ROUNDS_PER_TIER } from '../data/types';
  import { game } from '../quiz.svelte';
  import { onMount } from 'svelte';

  const t = $derived(TIERS[game.tierIndex]);
  const prev = $derived(TIERS[Math.max(0, game.tierIndex - 1)]);
  let cd = $state(3.4);

  onMount(() => {
    const iv = setInterval(() => {
      cd = Math.max(0, +(cd - 0.1).toFixed(1));
    }, 100);
    return () => clearInterval(iv);
  });

  const BRIEF: Record<string, string[]> = {
    hacker: [
      '警告:本档题目涉及未定义行为、内存布局与硬件语义。',
      '直觉在这里通常是错的 —— 请从定义与位级事实出发。',
      '不灭次数重置为 1,答错即出局。',
    ],
    acm: [
      '最终关卡:算法竞赛级别,复杂度与组合计数为主。',
      '建议在草稿纸上推一遍再作答。',
      '通过后你将被记录为「封神」候选。',
    ],
  };
</script>

<div class="promote" style="--th:{t.hue}">
  <div class="grid" aria-hidden="true"></div>

  <div class="box panel">
    <p class="clear">LEVEL CLEAR · {prev.label} 已攻破</p>
    <p class="arrow">▼</p>
    <h2 class="newTier">
      <span class="ic">{t.icon}</span>
      <span class="nm">{t.label}</span>
      <span class="en">{t.name}</span>
    </h2>
    <p class="desc">{t.desc}</p>

    <ul class="brief">
      {#each BRIEF[t.id] ?? [] as line, i (i)}
        <li style="animation-delay:{i * 160}ms"><span class="ar">›</span>{line}</li>
      {/each}
      <li style="animation-delay:480ms">
        <span class="ar">›</span>本档 {ROUNDS_PER_TIER} 题 · 每题 {t.timeLimit}s · 不灭 ×{t.allowMiss}
      </li>
    </ul>

    <div class="prog">
      <span class="pbar"><span class="pfill" style="transform:scaleX({1 - cd / 3.4})"></span></span>
      <span class="cd mute">载入下一档 … {cd.toFixed(1)}s</span>
    </div>
  </div>
</div>

<style>
  .promote {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: grid;
    place-items: center;
    padding: 1.2rem;
    background: radial-gradient(
      ellipse 70% 60% at 50% 50%,
      hsl(var(--th) 80% 12% / 0.96),
      rgba(3, 5, 8, 0.97)
    );
    backdrop-filter: blur(4px);
    animation: fadeIn 0.3s ease-out both;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(hsl(var(--th) 80% 60% / 0.09) 1px, transparent 1px),
      linear-gradient(90deg, hsl(var(--th) 80% 60% / 0.09) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, #000 20%, transparent 75%);
    animation: gridPulse 2.4s ease-in-out infinite;
  }
  @keyframes gridPulse {
    0%,
    100% {
      opacity: 0.55;
    }
    50% {
      opacity: 1;
    }
  }

  .box {
    position: relative;
    max-width: 620px;
    width: 100%;
    padding: 1.6rem 1.5rem 1.3rem;
    text-align: center;
    border-color: hsl(var(--th) 80% 60% / 0.45);
    box-shadow: 0 0 60px hsl(var(--th) 90% 40% / 0.25);
    animation: rise 0.4s ease-out both;
  }

  .clear {
    margin: 0;
    font-size: 0.8rem;
    letter-spacing: 0.26em;
    color: var(--fg-dim);
    text-transform: uppercase;
  }
  .arrow {
    margin: 0.2rem 0;
    font-size: 1.1rem;
    color: hsl(var(--th) 100% 62%);
    animation: popNum 1s ease-out infinite;
  }
  .newTier {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin: 0.2rem 0 0.3rem;
    color: hsl(var(--th) 100% 62%);
    text-shadow: 0 0 30px hsl(var(--th) 100% 60% / 0.6);
  }
  .ic {
    font-size: 1.6rem;
  }
  .nm {
    font-size: clamp(1.6rem, 6vw, 2.6rem);
    letter-spacing: 0.1em;
  }
  .en {
    font-size: 0.9rem;
    letter-spacing: 0.3em;
    opacity: 0.7;
  }
  .desc {
    margin: 0 0 1rem;
    color: var(--fg-dim);
    font-size: 0.86rem;
  }

  .brief {
    list-style: none;
    margin: 0 0 1.2rem;
    padding: 0.9rem 1rem;
    text-align: left;
    border: 1px dashed hsl(var(--th) 70% 60% / 0.35);
    background: rgba(3, 6, 10, 0.6);
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    font-size: 0.86rem;
  }
  .brief li {
    display: flex;
    gap: 0.55rem;
    animation: slideIn 0.35s ease-out both;
    color: #d9f6e8;
  }
  .ar {
    color: hsl(var(--th) 100% 62%);
  }

  .prog {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    align-items: center;
  }
  .pbar {
    display: block;
    width: 100%;
    height: 4px;
    background: #0a1210;
    border: 1px solid hsl(var(--th) 60% 50% / 0.35);
    overflow: hidden;
  }
  .pfill {
    display: block;
    height: 100%;
    background: hsl(var(--th) 100% 62%);
    box-shadow: 0 0 12px hsl(var(--th) 100% 60% / 0.7);
    transform-origin: left center;
    transition: transform 0.1s linear;
  }
  .cd {
    font-size: 0.72rem;
    letter-spacing: 0.18em;
  }
</style>
