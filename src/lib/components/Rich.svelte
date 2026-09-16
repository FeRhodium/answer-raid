<script lang="ts">
  /**
   * 极简 inline 富文本渲染器:只支持 **粗体** 与 `行内代码`,
   * 以及 \n 换行。不使用 {@html},避免任何注入风险。
   */
  interface Props {
    text: string;
    class?: string;
  }
  let { text, class: cls = '' }: Props = $props();

  type Piece = { t: 'text' | 'b' | 'c'; v: string; k: number };

  const pieces = $derived.by<Piece[]>(() => {
    const out: Piece[] = [];
    const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let last = 0;
    let k = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push({ t: 'text', v: text.slice(last, m.index), k: k++ });
      const raw = m[0];
      if (raw.startsWith('**')) out.push({ t: 'b', v: raw.slice(2, -2), k: k++ });
      else out.push({ t: 'c', v: raw.slice(1, -1), k: k++ });
      last = m.index + raw.length;
    }
    if (last < text.length) out.push({ t: 'text', v: text.slice(last), k: k++ });
    return out;
  });
</script>

<span class="rich {cls}">
  {#each pieces as p (p.k)}{#if p.t === 'b'}<b>{p.v}</b>{:else if p.t === 'c'}<code>{p.v}</code
      >{:else}{p.v}{/if}{/each}
</span>

<style>
  .rich {
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
