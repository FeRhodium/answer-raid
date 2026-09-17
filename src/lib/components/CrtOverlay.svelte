<script lang="ts">
  /** CRT 叠层:扫描线 + 暗角 + 极轻的闪烁。纯装饰,不吃指针事件。 */
  interface Props {
    intense?: boolean;
    /** 亮色主题下整层关掉 —— 扫描线和暗角在白底上只会糊成灰雾。 */
    enabled?: boolean;
  }
  let { intense = false, enabled = true }: Props = $props();
</script>

{#if enabled}
  <div class="crt" class:on={intense} aria-hidden="true">
    <div class="scan"></div>
    <div class="glowline"></div>
    <div class="vignette"></div>
    <div class="grain"></div>
  </div>
{/if}

<style>
  .crt {
    position: fixed;
    inset: 0;
    z-index: 90;
    pointer-events: none;
  }
  .scan {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0px,
      rgba(0, 0, 0, 0) 2px,
      rgba(0, 0, 0, 0.22) 3px,
      rgba(0, 0, 0, 0.22) 4px
    );
    mix-blend-mode: multiply;
    opacity: 0.55;
  }
  .glowline {
    position: absolute;
    left: 0;
    right: 0;
    height: 26vh;
    background: linear-gradient(
      to bottom,
      transparent,
      hsl(var(--hue) 100% 70% / 0.05),
      transparent
    );
    animation: sweepDown 7.5s linear infinite;
  }
  @keyframes sweepDown {
    from {
      transform: translateY(-30vh);
    }
    to {
      transform: translateY(130vh);
    }
  }
  .vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse 78% 72% at 50% 50%,
      transparent 45%,
      rgba(0, 0, 0, 0.55) 100%
    );
  }
  .grain {
    position: absolute;
    inset: -50%;
    opacity: 0.035;
    background-image: radial-gradient(rgba(255, 255, 255, 0.9) 0.5px, transparent 0.6px);
    background-size: 3px 3px;
    animation: grainShift 0.6s steps(3) infinite;
  }
  @keyframes grainShift {
    0% {
      transform: translate(0, 0);
    }
    33% {
      transform: translate(-2px, 1px);
    }
    66% {
      transform: translate(1px, -2px);
    }
    100% {
      transform: translate(0, 0);
    }
  }
  .on .scan {
    opacity: 0.8;
  }
</style>
