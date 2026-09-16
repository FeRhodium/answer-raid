<script lang="ts">
  /** 标题页:输入代号 → 选择开始。展示三档难度与个人最佳战绩。 */
  import { fade, fly } from 'svelte/transition';
  import { TIERS } from '../data/tiers';
  import { ROUNDS_PER_TIER } from '../data/types';
  import { game, startRun, JOKERS_PER_RUN, soundOn, toggleSound, initAudio } from '../quiz.svelte';
  import { loadBest, loadHistory, loadHandle } from '../storage';

  const best = loadBest();
  const history = $derived(loadHistory().slice(0, 5));

  let handle = $state(loadHandle());
  let touched = $state(false);

  const ready = $derived(handle.trim().length > 0);

  function go(): void {
    initAudio();
    startRun(handle);
  }

  const p2 = (n: number) => String(n).padStart(2, '0');

  const LOGO = ` ██████╗███████╗ █████╗     ██████╗  █████╗ ██╗██████╗
██╔════╝██╔════╝██╔══██╗    ██╔══██╗██╔══██╗██║██╔══██╗
██║     ███████╗███████║    ██████╔╝███████║██║██║  ██║
██║     ╚════██║██╔══██║    ██╔══██╗██╔══██║██║██║  ██║
╚██████╗███████║██║  ██║    ██║  ██║██║  ██║██║██████╔╝
 ╚═════╝╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═════╝ `;
</script>

<div class="intro">
  <header class="head">
    <div class="org" in:fade={{ duration: 260 }}>
      <span class="chip">计算机协会 · 百团大战</span>
      <span class="chip">SVELTE 5 · RUNES</span>
      <span class="chip">15 题库 · 随机抽题</span>
    </div>

    <div class="logoWrap">
      <pre class="logo" aria-hidden="true">{LOGO}</pre>
      <pre class="logo ghost" aria-hidden="true">{LOGO}</pre>
      <pre class="logo ghost2" aria-hidden="true">{LOGO}</pre>
    </div>

    <h1 class="title">
      <span class="w1">ANSWER</span>
      <span class="w2">RAID</span>
    </h1>
    <p class="sub">
      三档难度 · 五题一晋级 · 答错扣不灭次数 · 通关 <b>ACM 档</b> 才算封神
    </p>
  </header>

  <section class="grid">
    <div class="panel tiers" in:fly={{ y: 22, duration: 420, delay: 60 }}>
      <h2 class="ph">// 难度档位</h2>
      <ol>
        {#each TIERS as t, i (t.id)}
          <li style="--tier-hue:{t.hue}" class="tier">
            <span class="idx">{p2(i + 1)}</span>
            <span class="icon">{t.icon}</span>
            <span class="meta">
              <span class="name">{t.label} · <em>{t.name}</em></span>
              <span class="desc">{t.desc}</span>
            </span>
            <span class="stat">
              <span>{ROUNDS_PER_TIER} 题</span>
              <span>{t.timeLimit}s / 题</span>
              <span>不灭 ×{t.allowMiss}</span>
            </span>
          </li>
        {/each}
      </ol>
      <p class="rule mute">
        每局从题库中随机抽取未出现过的题目,选项顺序也会重新打乱 —— 背题没用。
      </p>
    </div>

    <div class="rightCol">
      <div class="panel card" in:fly={{ y: 22, duration: 420, delay: 140 }}>
        <h2 class="ph">// 特工代号</h2>
        <label class="field" class:bad={touched && !ready}>
          <span class="pfx">root@csa:~$</span>
          <input
            bind:value={handle}
            oninput={() => (touched = true)}
            onkeydown={(e) => {
              if (e.key === 'Enter' && ready) go();
            }}
            maxlength="14"
            placeholder="你的名字 / 昵称"
            spellcheck="false"
            autocomplete="off"
          />
          <span class="caret">█</span>
        </label>
        <div class="row">
          <button class="btn primary start" onclick={go} disabled={!ready}>
            ▶ 开始突袭
          </button>
          <button
            class="btn ico"
            onclick={toggleSound}
            title={soundOn() ? '静音' : '开启音效'}
            aria-label="切换音效"
          >
            {soundOn() ? '🔊' : '🔇'}
          </button>
        </div>
        {#if !ready}
          <p class="warn mute">代号不能为空 —— 输入任意名字即可开始(也会记在榜上)。</p>
        {:else}
          <p class="go mute">按 <span class="kbd">ENTER</span> 直接开打</p>
        {/if}
      </div>

      <div class="panel card" in:fly={{ y: 22, duration: 420, delay: 210 }}>
        <h2 class="ph">// 装备 · 三个锦囊</h2>
        <ul class="jokers">
          <li><span class="jk">⧗</span><b>逻辑切割</b><span class="dim">抹除两个错误选项</span></li>
          <li><span class="jk">❄</span><b>时间冻结</b><span class="dim">当前题目回补 15 秒</span></li>
          <li><span class="jk">◈</span><b>内线情报</b><span class="dim">给出考点,该题得分 ×0.4</span></li>
        </ul>
        <p class="rule mute">
          整局只有 <b>{JOKERS_PER_RUN}</b> 次,按 <span class="kbd">1</span
          ><span class="kbd">2</span><span class="kbd">3</span> 或点击卡牌使用,用完不补。
        </p>
      </div>

      <div class="panel card record" in:fly={{ y: 22, duration: 420, delay: 280 }}>
        <h2 class="ph">// 档案</h2>
        {#if best}
          <div class="best">
            <div class="bestScore">
              <span class="mute">历史最高</span>
              <b>{best.score.toLocaleString()}</b>
            </div>
            <div class="bestMeta">
              <span>{best.handle}</span>
              <span class="dim">{best.tier.toUpperCase()} 档</span>
              <span class="dim">连击 ×{best.combo}</span>
              <span class="dim">{best.cleared ? '已通关' : '未通关'}</span>
            </div>
          </div>
          {#if history.length > 1}
            <ul class="hist">
              {#each history.slice(1) as h (h.at)}
                <li>
                  <span class="dim">{p2(new Date(h.at).getMonth() + 1)}/{p2(new Date(h.at).getDate())}</span>
                  <span>{h.handle}</span>
                  <span class="dim">{h.tier.toUpperCase()}</span>
                  <b>{h.score.toLocaleString()}</b>
                </li>
              {/each}
            </ul>
          {/if}
        {:else}
          <p class="mute">暂无记录 —— 打完一局就会留下你的痕迹。</p>
        {/if}
      </div>
    </div>
  </section>

  <footer class="foot mute">
    <span>键盘: <span class="kbd">A</span><span class="kbd">B</span><span class="kbd">C</span><span class="kbd">D</span> 选项 · <span class="kbd">1</span><span class="kbd">2</span><span class="kbd">3</span> 锦囊 · <span class="kbd">ENTER</span> 确认</span>
    <span>Svelte 5 + Vite · 无后端 · 数据存本地</span>
  </footer>
</div>

<style>
  .intro {
    position: relative;
    z-index: 3;
    max-width: 1180px;
    margin: 0 auto;
    padding: clamp(1.2rem, 3.5vw, 2.6rem) clamp(0.9rem, 3vw, 2rem) 3rem;
    display: flex;
    flex-direction: column;
    gap: clamp(1.2rem, 3vw, 2rem);
  }

  .head {
    text-align: center;
  }
  .org {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .logoWrap {
    position: relative;
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
  }
  .logo {
    margin: 0;
    font-family: var(--mono);
    font-weight: 700;
    font-size: clamp(0.3rem, 1.42vw, 0.78rem);
    line-height: 1.05;
    letter-spacing: 0;
    color: var(--accent);
    text-shadow: 0 0 18px var(--accent-glow);
    animation: flicker 4.5s infinite;
    white-space: pre;
  }
  .logo.ghost,
  .logo.ghost2 {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .logo.ghost {
    color: #ff2d55;
    opacity: 0.55;
    animation: glitchShift 3.4s infinite steps(2);
  }
  .logo.ghost2 {
    color: #22d3ee;
    opacity: 0.45;
    animation: glitchShift 2.6s infinite reverse steps(2);
  }

  .title {
    display: flex;
    gap: 0.6em;
    justify-content: center;
    align-items: baseline;
    margin: 0.9rem 0 0.4rem;
    font-size: clamp(2rem, 9vw, 5rem);
    letter-spacing: 0.06em;
    line-height: 1;
  }
  .w1 {
    color: #eafff6;
    text-shadow: 0 0 30px hsl(var(--hue) 100% 60% / 0.35);
  }
  .w2 {
    color: var(--accent);
    text-shadow: 0 0 26px var(--accent-glow);
    -webkit-text-stroke: 1px var(--accent);
  }
  .sub {
    margin: 0;
    color: var(--fg-dim);
    font-size: clamp(0.8rem, 2.4vw, 0.98rem);
  }
  .sub b {
    color: var(--accent);
  }

  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: clamp(0.9rem, 2vw, 1.4rem);
    align-items: start;
  }
  @media (max-width: 900px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }

  .panel {
    padding: 1.1rem 1.2rem 1.25rem;
  }
  .ph {
    font-size: 0.82rem;
    letter-spacing: 0.2em;
    color: var(--fg-mute);
    margin-bottom: 0.9rem;
    text-transform: uppercase;
  }

  .tiers ol {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .tier {
    display: grid;
    grid-template-columns: auto auto 1fr auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.7rem 0.85rem;
    border: 1px solid hsl(var(--tier-hue) 70% 55% / 0.35);
    border-left: 3px solid hsl(var(--tier-hue) 100% 60%);
    background: linear-gradient(90deg, hsl(var(--tier-hue) 90% 50% / 0.1), transparent 60%);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .tier:hover {
    transform: translateX(4px);
    box-shadow: -4px 0 22px hsl(var(--tier-hue) 100% 60% / 0.22);
  }
  .idx {
    font-size: 0.72rem;
    color: hsl(var(--tier-hue) 60% 70%);
    opacity: 0.7;
  }
  .icon {
    font-size: 1.5rem;
    color: hsl(var(--tier-hue) 100% 62%);
    text-shadow: 0 0 14px hsl(var(--tier-hue) 100% 60% / 0.6);
  }
  .meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .name {
    font-family: var(--display);
    font-size: 1.02rem;
    color: #eafff6;
    letter-spacing: 0.05em;
  }
  .name em {
    font-style: normal;
    color: hsl(var(--tier-hue) 100% 62%);
    font-size: 0.8em;
  }
  .desc {
    font-size: 0.78rem;
    color: var(--fg-dim);
  }
  .stat {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.1rem;
    font-size: 0.72rem;
    color: hsl(var(--tier-hue) 55% 72%);
    white-space: nowrap;
  }

  .rightCol {
    display: flex;
    flex-direction: column;
    gap: clamp(0.9rem, 2vw, 1.1rem);
  }

  .field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 0.7rem;
    border: 1px solid var(--line-hard);
    background: #03060a;
    font-size: 0.95rem;
  }
  .field.bad {
    border-color: var(--danger);
    animation: shake 0.4s ease-out;
  }
  .pfx {
    color: var(--accent);
    font-size: 0.85em;
    white-space: nowrap;
  }
  .field input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: #eafff6;
    font-family: var(--mono);
    font-size: 1rem;
    letter-spacing: 0.06em;
  }
  .field input::placeholder {
    color: var(--fg-mute);
  }
  .caret {
    color: var(--accent);
    animation: blink 1s steps(1) infinite;
  }

  .row {
    display: flex;
    gap: 0.6rem;
    margin-top: 0.9rem;
  }
  .start {
    flex: 1;
  }
  .ico {
    padding: 0.7em 0.9em;
    font-size: 1rem;
  }
  .warn {
    margin: 0.7rem 0 0;
    font-size: 0.76rem;
  }
  .go {
    margin: 0.7rem 0 0;
    font-size: 0.76rem;
  }

  .jokers {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .jokers li {
    display: grid;
    grid-template-columns: 1.6rem auto 1fr;
    gap: 0.6rem;
    align-items: center;
    font-size: 0.86rem;
    padding: 0.35rem 0.5rem;
    border: 1px dashed var(--line);
  }
  .jk {
    font-size: 1.1rem;
    color: var(--accent);
    text-align: center;
  }
  .jokers b {
    color: #eafff6;
  }

  .rule {
    margin: 0.85rem 0 0;
    font-size: 0.76rem;
    line-height: 1.7;
  }
  .rule b {
    color: var(--accent);
  }

  .best {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    justify-content: space-between;
    padding-bottom: 0.7rem;
    border-bottom: 1px dashed var(--line);
  }
  .bestScore {
    display: flex;
    flex-direction: column;
  }
  .bestScore span {
    font-size: 0.72rem;
    letter-spacing: 0.16em;
  }
  .bestScore b {
    font-family: var(--display);
    font-size: 2.1rem;
    line-height: 1.1;
    color: var(--accent);
    text-shadow: 0 0 20px var(--accent-glow);
  }
  .bestMeta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: 0.76rem;
    gap: 0.1rem;
  }
  .bestMeta > span:first-child {
    color: #eafff6;
  }

  .hist {
    list-style: none;
    margin: 0.7rem 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.28rem;
    font-size: 0.78rem;
  }
  .hist li {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: 0.6rem;
    align-items: center;
  }
  .hist b {
    color: var(--accent);
    font-variant-numeric: tabular-nums;
  }

  .foot {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 1.4rem;
    justify-content: space-between;
    font-size: 0.74rem;
    border-top: 1px solid var(--line);
    padding-top: 0.9rem;
  }
</style>
