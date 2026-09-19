<script lang="ts">
  /** 顶部 HUD:档位 / 进度 / 不灭次数 / 分数 / 连击 / 倒计时 / 本题潜在得分。 */
  import { TIERS } from '../data/tiers';
  import { ROUNDS_PER_TIER } from '../data/types';
  import { game, tier, livePotential, comboFactor } from '../quiz.svelte';
  import { msg, t, fmt } from '../i18n.svelte.ts';

  const meta = $derived(tier());
  const pct = $derived(
    game.timeLimit > 0 ? Math.max(0, Math.min(1, game.timeLeft / game.timeLimit)) : 0,
  );
  const danger = $derived(game.timeLeft <= 5);
  const warn = $derived(game.timeLeft <= game.timeLimit * 0.34);
  const lives = $derived(meta.allowMiss);
</script>

<header class="hud panel" style="--tier-hue:{meta.hue}">
  <div class="row1">
    <div class="who">
      <span class="pfx">root@csa:~$</span>
      <b>{game.handle || t(msg('hud.anon'))}</b>
    </div>

    <div class="tiers">
      {#each TIERS as x, i (x.id)}
        <span
          class="tb"
          class:cur={i === game.tierIndex}
          class:done={i < game.tierIndex}
          style="--th:{x.hue}"
        >
          <span class="ti">{x.icon}</span>{x.name}
        </span>
      {/each}
    </div>

    <div class="scoreBox">
      <span class="lbl">SCORE</span>
      <b class="score" class:bump={game.lastGain > 0}>{game.score.toLocaleString()}</b>
    </div>
  </div>

  <div class="row2">
    <div class="meta">
      <span class="chip tierChip">{fmt(`tier.${meta.id}.label`)}</span>
      <span class="progWrap" title={t(msg('hud.progressTip'))}>
        {#each Array(ROUNDS_PER_TIER) as _, i (i)}
          <span class="seg" class:on={i < game.tierProgress}></span>
        {/each}
        <span class="progTxt mute">{game.tierProgress}/{ROUNDS_PER_TIER}</span>
      </span>

      <span class="lives" title={t(msg('hud.livesTip'))}>
        <span class="lbl mute">{t(msg('hud.lives'))}</span>
        {#each Array(lives) as _, i (i)}
          <span class="life" class:lost={i >= game.lives}>◆</span>
        {/each}
      </span>

      <span class="combo" class:hot={game.chain >= 3}>
        <span class="lbl mute">{t(msg('hud.combo'))}</span>
        <b>×{game.chain}</b>
        {#if comboFactor() > 1}<em>{fmt('hud.comboRate', { pct: (comboFactor() * 100).toFixed(0) })}</em>{/if}
      </span>

      <span class="pot" title={t(msg('hud.potTip'))}>
        <span class="lbl mute">{t(msg('hud.pot'))}</span>
        <b>+{livePotential()}</b>
      </span>
    </div>

    <div class="timer" class:danger class:warn>
      <span class="tnum">{game.timeLeft.toFixed(1)}<em>s</em></span>
      <span class="tbar">
        <span class="tfill" style="transform:scaleX({pct})"></span>
        {#each Array(9) as _, i (i)}
          <span class="tick" style="left:{(i + 1) * 10}%"></span>
        {/each}
      </span>
    </div>
  </div>
</header>

<style>
  .hud {
    position: relative;
    z-index: 4;
    padding: 0.7rem 0.9rem 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    border-top-width: 2px;
  }

  .row1 {
    display: grid;
    grid-template-columns: minmax(0, auto) 1fr minmax(0, auto);
    gap: 0.8rem;
    align-items: center;
  }
  .who {
    display: flex;
    align-items: baseline;
    gap: 0.45rem;
    font-size: 0.86rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .who .pfx {
    color: var(--fg-mute);
    font-size: 0.74rem;
  }
  .who b {
    color: var(--accent);
    letter-spacing: 0.06em;
  }

  .tiers {
    display: flex;
    gap: 0.4rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  .tb {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.14rem 0.5rem;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    border: 1px solid var(--line);
    color: var(--fg-mute);
    transition: all 0.2s;
  }
  .tb .ti {
    opacity: 0.7;
  }
  .tb.done {
    color: hsl(var(--th) 70% 60%);
    border-color: hsl(var(--th) 70% 45% / 0.5);
    opacity: 0.75;
  }
  .tb.cur {
    color: var(--on-accent);
    background: hsl(var(--th) 100% 62%);
    border-color: hsl(var(--th) 100% 70%);
    box-shadow: 0 0 18px hsl(var(--th) 100% 60% / 0.5);
    opacity: 1;
  }
  .tb.cur .ti {
    opacity: 1;
  }

  .scoreBox {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1.05;
  }
  .lbl {
    font-size: 0.62rem;
    letter-spacing: 0.2em;
    color: var(--fg-mute);
    text-transform: uppercase;
  }
  .score {
    font-family: var(--display);
    font-size: 1.6rem;
    color: var(--accent);
    text-shadow: 0 0 18px var(--accent-glow);
    font-variant-numeric: tabular-nums;
  }
  .score.bump {
    animation: popNum 0.4s ease-out both;
  }

  .row2 {
    display: flex;
    gap: 0.9rem;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .meta {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    flex-wrap: wrap;
    font-size: 0.78rem;
  }
  .tierChip {
    font-size: 0.68rem;
  }
  .progWrap {
    display: inline-flex;
    align-items: center;
    gap: 0.22rem;
  }
  .seg {
    width: 20px;
    height: 6px;
    background: hsl(var(--tier-hue) 40% 30% / 0.5);
    border: 1px solid var(--line);
  }
  .seg.on {
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent-glow);
  }
  .progTxt {
    font-size: 0.7rem;
    margin-left: 0.25rem;
  }

  .lives,
  .combo,
  .pot {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }
  .life {
    color: var(--accent);
    text-shadow: 0 0 10px var(--accent-glow);
    font-size: 0.9rem;
  }
  .life.lost {
    color: var(--slot-used);
    text-shadow: none;
  }
  .combo b {
    color: var(--fg-dim);
    font-variant-numeric: tabular-nums;
  }
  .combo em {
    font-style: normal;
    font-size: 0.68rem;
    color: var(--accent);
    animation: blink 1.6s steps(1) infinite;
  }
  .combo.hot b {
    color: var(--accent);
    text-shadow: 0 0 14px var(--accent-glow);
    animation: popNum 0.3s ease-out both;
  }
  .pot b {
    color: var(--fg-strong);
    font-variant-numeric: tabular-nums;
  }

  .timer {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-width: min(280px, 100%);
    flex: 1;
    justify-content: flex-end;
  }
  .tnum {
    font-family: var(--display);
    font-size: 1.25rem;
    color: var(--accent);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .tnum em {
    font-style: normal;
    font-size: 0.6em;
    opacity: 0.7;
  }
  .tbar {
    position: relative;
    flex: 1;
    max-width: 260px;
    height: 9px;
    background: var(--code-bg);
    border: 1px solid var(--line);
    overflow: hidden;
  }
  .tfill {
    position: absolute;
    inset: 0;
    transform-origin: left center;
    background: linear-gradient(90deg, var(--accent-dim), var(--accent));
    box-shadow: 0 0 14px var(--accent-glow);
    transition: transform 0.1s linear;
  }
  .tick {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--overlay);
  }
  .timer.warn .tfill {
    background: linear-gradient(90deg, var(--warn-deep), var(--warn));
    box-shadow: 0 0 14px var(--warn-glow);
  }
  .timer.warn .tnum {
    color: var(--warn);
  }
  .timer.danger .tfill {
    background: linear-gradient(90deg, var(--danger-deep), var(--danger));
    box-shadow: 0 0 18px var(--danger-glow);
  }
  .timer.danger .tnum {
    color: var(--danger);
    animation: blink 0.5s steps(1) infinite;
  }

  /* ---------- 窄屏(手机) ---------- */
  @media (max-width: 680px) {
    .hud {
      padding: 0.6rem 0.75rem 0.7rem;
      gap: 0.5rem;
    }
    /* 第一行放不下三栏:代号 + 分数一行,三档徽章整行换到第二行 */
    .row1 {
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-areas:
        'who score'
        'tiers tiers';
      gap: 0.5rem 0.7rem;
    }
    .who {
      grid-area: who;
    }
    .tiers {
      grid-area: tiers;
      justify-content: flex-start;
    }
    .scoreBox {
      grid-area: score;
    }
    /* "root@csa:~$" 前缀在小屏占位太宽 */
    .who .pfx {
      display: none;
    }
    .score {
      font-size: 1.35rem;
    }
    .row2 {
      gap: 0.5rem 0.7rem;
    }
    .meta {
      gap: 0.45rem 0.75rem;
      font-size: 0.76rem;
    }
    .timer {
      min-width: 100%;
    }
  }
</style>
