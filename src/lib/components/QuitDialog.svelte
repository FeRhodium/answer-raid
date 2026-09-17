<script lang="ts">
  /**
   * 中途退出的确认弹窗。
   * 现场是触屏 + 站着操作,直接把"退出"做成一步太容易误触 —— 所以中间加一道确认。
   * 弹窗弹出时引擎会暂停倒计时(心跳只认 playing),取消后回到原来的阶段。
   */
  import { confirmQuit, cancelQuit, game } from '../quiz.svelte';
  import { msg, t, fmt } from '../i18n.svelte.ts';
  import { ROUNDS_PER_TIER } from '../data/types';
  import { TIERS } from '../data/tiers';

  const curTier = $derived(TIERS[game.tierIndex]);
</script>

{#if game.phase === 'confirm-quit'}
  <div class="quit" role="dialog" aria-modal="true" aria-label={t(msg('quit.title'))}>
    <div class="box panel">
      <h2 class="title">{t(msg('quit.title'))}</h2>
      <p class="body">{t(msg('quit.body'))}</p>

      <ul class="stats">
        <li>
          <span class="k"
            >{fmt('fb.tierProgress', {
              tier: fmt(`tier.${curTier.id}.label`),
              n: game.tierProgress,
              total: ROUNDS_PER_TIER,
            })}</span
          >
        </li>
        <li><span class="k">SCORE</span><b>{game.score.toLocaleString()}</b></li>
        <li><span class="k">{fmt('intro.nPerTier', { n: ROUNDS_PER_TIER })}</span><b>{game.correct}/{game.answered}</b></li>
      </ul>

      <div class="acts">
        <button class="btn primary" onclick={confirmQuit}>{t(msg('quit.confirm'))}</button>
        <button class="btn" onclick={cancelQuit}>{t(msg('quit.cancel'))}</button>
      </div>
      <p class="hint mute">{t(msg('quit.escHint'))}</p>
    </div>
  </div>
{/if}

<style>
  .quit {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: grid;
    place-items: center;
    padding: 1.2rem;
    background: var(--scrim);
    backdrop-filter: blur(3px);
  }
  .box {
    width: min(460px, 100%);
    padding: 1.2rem 1.25rem 1.35rem;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    border-left: 3px solid var(--accent);
  }
  .title {
    font-size: 1.15rem;
    color: var(--accent-text);
    letter-spacing: 0.06em;
  }
  .body {
    margin: 0;
    font-size: 0.86rem;
    color: var(--fg-dim);
    line-height: 1.7;
  }
  .stats {
    list-style: none;
    margin: 0.2rem 0 0;
    padding: 0.6rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    border: 1px dashed var(--line);
    background: var(--code-bg);
    font-size: 0.82rem;
  }
  .stats li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
  .stats .k {
    color: var(--fg-mute);
  }
  .stats b {
    color: var(--fg-strong);
  }
  .acts {
    display: flex;
    gap: 0.6rem;
    margin-top: 0.2rem;
  }
  .acts .btn {
    flex: 1;
    font-size: 0.86rem;
    padding: 0.6em 0.8em;
  }
  .hint {
    margin: 0;
    text-align: center;
    font-size: 0.72rem;
  }
</style>
