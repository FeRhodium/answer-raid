<script lang="ts">
  /**
   * 应用外壳:按 phase 切换 开机自检 / 标题 / 对局 / 晋级幕 / 结算,
   * 并把当前难度档位的色相写入 :root,驱动全站配色。
   */
  import BootScreen from './lib/components/BootScreen.svelte';
  import Intro from './lib/components/Intro.svelte';
  import Hud from './lib/components/Hud.svelte';
  import QuestionCard from './lib/components/QuestionCard.svelte';
  import Feedback from './lib/components/Feedback.svelte';
  import JokerBar from './lib/components/JokerBar.svelte';
  import Promote from './lib/components/Promote.svelte';
  import Result from './lib/components/Result.svelte';
  import RainBackground from './lib/components/RainBackground.svelte';
  import CrtOverlay from './lib/components/CrtOverlay.svelte';
  import { game, tier, soundOn, toggleSound, initAudio, answerByKey, jokerByKey, canUseJoker, useJoker } from './lib/quiz.svelte';
  import { sfx } from './lib/audio';
  import { onMount } from 'svelte';

  const inRun = $derived(
    game.phase === 'playing' || game.phase === 'feedback' || game.phase === 'promote',
  );

  /** 全局键盘路由:A/B/C/D 选项 · 1/2/3 锦囊。输入框内不拦截。 */
  function onKey(e: KeyboardEvent): void {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const joker = jokerByKey(e.key);
    if (joker && game.phase === 'playing') {
      e.preventDefault();
      if (canUseJoker(joker)) useJoker(joker);
      else sfx('wrong');
      return;
    }
    if (answerByKey(e.key)) e.preventDefault();
  }

  onMount(() => {
    initAudio();
  });

  $effect(() => {
    const hue = inRun || game.phase === 'over' ? tier().hue : 152;
    document.documentElement.style.setProperty('--hue', String(hue));
  });
</script>

<RainBackground />
<CrtOverlay intense={game.phase === 'promote'} />
<svelte:window onkeydown={onKey} />

<div class="app" class:glitch={game.phase === 'feedback' && game.isCorrect === false}>
  {#if game.phase === 'boot'}
    <BootScreen />
  {:else if game.phase === 'intro'}
    <Intro />
  {:else if inRun}
    <main class="play">
      <Hud />
      {#key game.current?.q.id ?? 'none'}
        <div class="stack anim-rise">
          <QuestionCard />
          {#if game.phase === 'feedback'}
            <Feedback />
          {/if}
        </div>
      {/key}
      <JokerBar />
      {#if game.phase === 'promote'}
        <Promote />
      {/if}
    </main>
  {:else if game.phase === 'over'}
    <Result />
  {/if}
</div>

{#if game.phase !== 'boot'}
  <div class="corner">
    <button class="mini" onclick={toggleSound} title={soundOn() ? '静音' : '开启音效'} aria-label="切换音效">
      {soundOn() ? '🔊' : '🔇'}
    </button>
  </div>
{/if}

<style>
  .app {
    position: relative;
    min-height: 100svh;
    z-index: 2;
  }
  .app.glitch {
    animation: shake 0.4s ease-out both;
  }

  .play {
    position: relative;
    z-index: 3;
    max-width: 940px;
    margin: 0 auto;
    padding: 0 clamp(0.6rem, 2.4vw, 1.2rem) 3rem;
    display: flex;
    flex-direction: column;
    gap: clamp(0.7rem, 1.8vw, 1.05rem);
  }
  .stack {
    display: flex;
    flex-direction: column;
    gap: clamp(0.7rem, 1.8vw, 1.05rem);
  }

  .corner {
    position: fixed;
    top: 0.5rem;
    right: 0.55rem;
    z-index: 95;
  }
  .mini {
    width: 2rem;
    height: 2rem;
    display: grid;
    place-items: center;
    font-size: 0.85rem;
    background: rgba(4, 6, 10, 0.75);
    border: 1px solid var(--line);
    color: var(--fg-dim);
    transition: border-color 0.15s, color 0.15s;
  }
  .mini:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
</style>
