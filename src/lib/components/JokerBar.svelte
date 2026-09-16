<script lang="ts">
  /** 锦囊卡牌栏。整局限用 3 次,键位 1/2/3(由 App 统一路由)。 */
  import { game, JOKERS, JOKERS_PER_RUN, canUseJoker, useJoker } from '../quiz.svelte';
  import { sfx } from '../audio';

  function act(id: (typeof JOKERS)[number]['id']): void {
    if (!canUseJoker(id)) {
      sfx('wrong');
      return;
    }
    useJoker(id);
  }

  const disabledReason = (id: string): string => {
    if (game.phase !== 'playing') return '当前不可用';
    if (game.jokersLeft <= 0) return '锦囊已耗尽';
    if (id === 'fifty' && game.eliminated.length > 0) return '本题已使用过';
    if (id === 'hint' && game.hint !== null) return '本题已获得情报';
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
    {#each JOKERS as j (j.id)}
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
    background: #16211e;
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
    background: hsl(var(--hue) 40% 8% / 0.7);
    border: 1px solid var(--line);
    transition: border-color 0.15s, box-shadow 0.15s, transform 0.08s, background 0.15s;
  }
  .jcard:hover:not(.dead) {
    border-color: var(--accent);
    box-shadow: 0 0 22px hsl(var(--hue) 100% 60% / 0.22), inset 0 0 24px hsl(var(--hue) 100% 60% / 0.1);
    transform: translateY(-2px);
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
    text-shadow: 0 0 14px var(--accent-glow);
  }
  .nm {
    font-size: 0.82rem;
    color: #eafff6;
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
</style>
