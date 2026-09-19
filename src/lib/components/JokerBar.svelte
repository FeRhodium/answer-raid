<script lang="ts">
  /** 锦囊卡牌栏。整局限用 3 次,键位 1/2/3(由 App 统一路由)。 */
  import { game, jokers, JOKERS_PER_RUN, canUseJoker, useJoker, type JokerId } from '../quiz.svelte';
  import { msg, t } from '../i18n.svelte.ts';
  import { sfx } from '../audio';

  function act(id: JokerId): void {
    if (!canUseJoker(id)) {
      sfx('wrong');
      return;
    }
    useJoker(id);
  }

  const disabledReason = (id: JokerId): string => {
    if (game.phase !== 'playing') return t(msg('joker.unavailable'));
    if (game.jokersLeft <= 0) return t(msg('joker.exhausted'));
    if (id === 'fifty' && game.eliminated.length > 0) return t(msg('joker.alreadyCut'));
    if (id === 'hint' && game.hint !== null) return t(msg('joker.alreadyHint'));
    return '';
  };
</script>

<aside class="jbar">
  <div class="slots">
    <span class="lbl">JOKER</span>
    {#each Array(JOKERS_PER_RUN) as _, i (i)}
      <span class="slot" class:used={i >= game.jokersLeft}></span>
    {/each}
    <span class="left mute">{game.jokersLeft}/{JOKERS_PER_RUN}</span>
  </div>

  <div class="cards">
    {#each jokers() as j (j.id)}
      <button
        class="jcard"
        class:dead={!canUseJoker(j.id)}
        onclick={() => act(j.id)}
        onmouseenter={() => canUseJoker(j.id) && sfx('hover')}
        title={disabledReason(j.id) || j.desc}
        aria-label="{j.name}:{j.desc}"
      >
        <span class="glyph">{j.glyph}</span>
        <span class="nm">{j.name}</span>
        <span class="ds dim">{j.desc}</span>
        <span class="hk"><span class="kbd">{j.hotkey}</span></span>
      </button>
    {/each}
  </div>
</aside>

<style>
  .jbar {
    position: relative;
    z-index: 4;
    display: flex;
    align-items: center;
    gap: 0.9rem;
    flex-wrap: wrap;
  }
  .slots {
    display: flex;
    align-items: center;
    gap: 0.28rem;
  }
  .lbl {
    font-size: 0.62rem;
    letter-spacing: 0.2em;
    color: var(--fg-mute);
    margin-right: 0.3rem;
  }
  .slot {
    width: 9px;
    height: 16px;
    border: 1px solid var(--line-hard);
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent-glow);
  }
  .slot.used {
    background: var(--slot-used);
    box-shadow: none;
  }
  .left {
    font-size: 0.72rem;
    margin-left: 0.3rem;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
    flex: 1;
    min-width: min(100%, 420px);
  }
  @media (max-width: 560px) {
    .cards {
      grid-template-columns: 1fr;
    }
  }

  .jcard {
    position: relative;
    display: grid;
    grid-template-columns: 1.7rem 1fr auto;
    grid-template-rows: auto auto;
    gap: 0 0.55rem;
    align-items: center;
    padding: 0.45rem 0.6rem;
    text-align: left;
    background: var(--card-bg);
    border: 1px solid var(--card-line);
    transition: border-color 0.15s, box-shadow 0.15s, transform 0.08s, background 0.15s;
  }
  .jcard:hover:not(.dead) {
    border-color: var(--accent);
    box-shadow: 0 0 22px var(--card-glow), inset 0 0 24px var(--card-glow);
    transform: translateY(-2px);
  }
  @media (hover: none) {
    .jcard:hover:not(.dead) {
      border-color: var(--card-line);
      box-shadow: none;
      transform: none;
    }
  }
  .jcard:active:not(.dead) {
    transform: translateY(0);
  }
  .jcard.dead {
    opacity: 0.36;
    cursor: not-allowed;
    filter: grayscale(0.7);
  }
  .glyph {
    grid-row: span 2;
    font-size: 1.35rem;
    color: var(--accent);
    text-align: center;
    text-shadow: var(--glyph-glow);
  }
  .nm {
    font-size: 0.82rem;
    color: var(--fg-strong);
    letter-spacing: 0.04em;
  }
  .ds {
    grid-column: 2;
    font-size: 0.68rem;
    line-height: 1.3;
  }
  .hk {
    grid-row: span 2;
    font-size: 0.7rem;
  }

  /* ---------- 窄屏 / 触屏 ---------- */
  /* 触屏没有 1/2/3 键位,藏掉键帽提示 */
  @media (hover: none), (max-width: 700px) {
    .hk {
      display: none;
    }
    .jbar {
      gap: 0.6rem;
    }
  }
</style>
