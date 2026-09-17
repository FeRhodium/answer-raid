import type { LocalizedQuestion } from '../types';

/**
 * 入门档:阅读题 —— **题干即教材**。
 * 5 题全部自带材料,不预设任何计算机先验知识;考的是「读规格、照着执行」的素养。
 * 每题 zh / en 两份文本,`answer` 下标共享;改选项时两边必须同步增删。
 */
export const noviceQuestions: LocalizedQuestion[] = [
  {
    id: 'novice-1',
    tier: 'novice',
    tags: ['补码', '二进制'],
    answer: 2,
    zh: {
      prompt:
        '计算机用**固定位数**的二进制存整数,常见表示法叫**补码**:正数按普通二进制写;求一个正数的相反数,做法是 **按位取反,再 +1**。\n8 位下 `1` = `00000001`,`1` 取反得 `11111110`,再 +1 得 `11111111`,即 `-1`。\n按同样规则,8 位下 `-2` 的二进制是?',
      options: ['10000010', '11111101', '11111110', '10000001'],
      explain:
        '`2` = `00000010`,按位取反得 `11111101`,再 +1 得 `11111110`,这就是 `-2`。选 `11111101` 是**漏了最后那个 +1**;选 `10000010` 是拿最高位当符号位、其余照抄数值的朴素想法(它其实是 `-126`);选 `10000001` 则是把「取反」直接当成了 `-1`。',
    },
    en: {
      prompt:
        'Computers store integers in a **fixed number of binary digits**, usually in a form called **two\'s complement**: positive numbers are written as plain binary, and to negate a number you **flip every bit, then add 1**.\nIn 8 bits, `1` = `00000001`; flipping it gives `11111110`, and adding 1 gives `11111111`, which is `-1`.\nBy the same rule, what is `-2` in 8-bit binary?',
      options: ['10000010', '11111101', '11111110', '10000001'],
      explain:
        '`2` = `00000010`; flipping the bits gives `11111101`, and adding 1 gives `11111110`, which is `-2`. Picking `11111101` means you **forgot the final +1**; picking `10000010` is the naive "top bit is the sign, copy the rest" idea (that pattern is actually `-126`); picking `10000001` treats "flip the bits" as if it already produced `-1`.',
    },
  },
  {
    id: 'novice-2',
    tier: 'novice',
    tags: ['排序', '选择排序'],
    code: `void selectionSort(int a[], int n) {
  for (int i = 0; i < n - 1; i++) {
    int minIdx = i;
    for (int j = i + 1; j < n; j++)
      if (a[j] < a[minIdx]) minIdx = j;   // only the index is recorded
    int t = a[i]; a[i] = a[minIdx]; a[minIdx] = t;  // exactly one swap per round
  }
}`,
    lang: 'cpp',
    answer: 1,
    zh: {
      prompt:
        '**选择排序**:每一轮在「还没排好的部分」里找出最小的数,和这部分最左边的数交换位置,然后未排好部分缩短一格。\n例如 `[5, 2, 9, 4]`:第 1 轮找到 2 与 5 交换得 `[2, 5, 9, 4]`;第 2 轮在 `[5, 9, 4]` 里找到 4 与 5 交换得 `[2, 4, 9, 5]`;第 3 轮找到 5 与 9 交换得 `[2, 4, 5, 9]`,完成。\n注意它每轮「比较两数大小」的次数:第 1 轮 3 次、第 2 轮 2 次、第 3 轮 1 次 —— 对 n 个数,**比较次数恒为 n(n-1)/2,与数据长什么样无关**。\n那么在下面哪个数组上,它的**交换次数**最多?',
      options: ['[1, 2, 3, 4, 5, 6]', '[6, 5, 4, 3, 2, 1]', '[3, 1, 6, 2, 5, 4]', '都一样多'],
      explain:
        '交换次数取决于「当前最小值是否已经在正确位置」:完全递增时最小值每次都恰好在原位,一次都不用换;完全递减时每轮的最小值都在最右端,前 5 轮都得换,共 5 次。选「都一样多」的人是把材料里那句 **比较次数恒为 n(n-1)/2** 记串了 —— 比较确实恒为 15 次,但问的是**交换**。',
    },
    en: {
      prompt:
        '**Selection sort** works in rounds: each round it finds the smallest value among the not-yet-sorted part, swaps it with the leftmost element of that part, then shrinks the unsorted part by one.\nFor example `[5, 2, 9, 4]`: round 1 finds 2 and swaps it with 5, giving `[2, 5, 9, 4]`; round 2 looks at `[5, 9, 4]`, finds 4 and swaps it with 5, giving `[2, 4, 9, 5]`; round 3 swaps 5 with 9, giving `[2, 4, 5, 9]`, done.\nNote how many **comparisons** it makes each round: 3 in round 1, 2 in round 2, 1 in round 3 — for n elements the **comparison count is always n(n-1)/2, no matter what the data looks like**.\nSo on which of the following arrays does it perform the **most swaps**?',
      options: ['[1, 2, 3, 4, 5, 6]', '[6, 5, 4, 3, 2, 1]', '[3, 1, 6, 2, 5, 4]', 'All the same'],
      explain:
        'The swap count depends on whether the current minimum is already in place: on a fully ascending array the minimum is always already where it belongs, so nothing is ever swapped; on a fully descending array the minimum sits at the far right every round, so the first 5 rounds all swap, for 5 swaps total. Picking "All the same" means you mixed up the prompt\'s line that **the comparison count is always n(n-1)/2** — comparisons really are always 15 here, but the question asks about **swaps**.',
    },
  },
  {
    id: 'novice-3',
    tier: 'novice',
    tags: ['Python', 'range'],
    code: `>>> list(range(0, 5, 2))
[0, 2, 4]
>>> list(range(5, 0, -2))
[5, 3, 1]
>>> list(range(1, 10, 3))`,
    lang: 'python',
    answer: 1,
    zh: {
      prompt:
        'Python 的 `range(a, b, c)` 生成一个整数序列:从 `a` 开始,每次加 `c`,直到**不小于** `b` 就停下(也就是 `b` 本身不包含在内);`c` 可以为负数。\n例如 `range(0, 5, 2)` 得到 0, 2, 4;`range(5, 0, -2)` 得到 5, 3, 1。\n那么 `list(range(1, 10, 3))` 的结果是?',
      options: ['[1, 4, 7, 10]', '[1, 4, 7]', '[1, 3, 6, 9]', '[3, 6, 9]'],
      explain:
        '从 1 出发每次加 3:1、4、7、10,但 10 已经**不小于** 10,所以停,结果是 `[1, 4, 7]`。选 `[1, 4, 7, 10]` 是忘了右端不包含;选 `[1, 3, 6, 9]` 是把步长 3 当成了起始值、又把 1 当成公差;选 `[3, 6, 9]` 则是把 `a` 和 `c` 的位置记反了。',
    },
    en: {
      prompt:
        'Python\'s `range(a, b, c)` produces a sequence of integers: it starts at `a` and adds `c` each time, stopping once the value is **not less than** `b` (so `b` itself is excluded); `c` may be negative.\nFor example `range(0, 5, 2)` gives 0, 2, 4 and `range(5, 0, -2)` gives 5, 3, 1.\nSo what does `list(range(1, 10, 3))` evaluate to?',
      options: ['[1, 4, 7, 10]', '[1, 4, 7]', '[1, 3, 6, 9]', '[3, 6, 9]'],
      explain:
        'Starting from 1 and adding 3 gives 1, 4, 7, 10 — but 10 is **not less than** 10, so it stops and the result is `[1, 4, 7]`. Picking `[1, 4, 7, 10]` forgets that the right end is excluded; picking `[1, 3, 6, 9]` treats the step 3 as the start and 1 as the step; picking `[3, 6, 9]` swaps the roles of `a` and `c`.',
    },
  },
  {
    id: 'novice-4',
    tier: 'novice',
    tags: ['整除', '取余'],
    code: `>>> 17 // 5, 17 % 5
(3, 2)
>>> 1000 // 7, 1000 % 7`,
    lang: 'python',
    answer: 3,
    zh: {
      prompt:
        '在多数编程语言里,两个整数相除有两种结果:`//` 是**整除**(只留商),`%` 是**取余数**,两者满足\n**被除数 = 除数 × 商 + 余数**。\n例如 `17 // 5` 得 3、`17 % 5` 得 2,因为 17 = 5 × 3 + 2。\n那么 `1000 // 7` 和 `1000 % 7` 分别是多少?',
      options: ['143 和 1', '142 和 7', '143 和 -1', '142 和 6'],
      explain:
        '7 × 142 = 994,7 × 143 = 1001 已经超过 1000,所以商只能是 **142**;再由材料里的等式得余数 = 1000 - 994 = **6**。验算一遍:`7 × 142 + 6 = 1000`,正好对上。选 143 开头的两项是把除法「四舍五入」了;选 7 是把余数写成了除数 —— 余数**必须小于除数**。',
    },
    en: {
      prompt:
        'In most programming languages, dividing two integers can give two different results: `//` is **integer division** (the quotient only) and `%` is the **remainder**, and together they satisfy\n**dividend = divisor × quotient + remainder**.\nFor example `17 // 5` is 3 and `17 % 5` is 2, because 17 = 5 × 3 + 2.\nSo what are `1000 // 7` and `1000 % 7`?',
      options: ['143 and 1', '142 and 7', '143 and -1', '142 and 6'],
      explain:
        'Since 7 × 142 = 994 and 7 × 143 = 1001 already exceeds 1000, the quotient can only be **142**; the prompt\'s identity then gives remainder = 1000 - 994 = **6**. Check it: `7 × 142 + 6 = 1000` fits exactly. Both options starting with 143 rounded the division up; picking 7 writes the divisor as the remainder — a remainder **must be smaller than the divisor**.',
    },
  },
  {
    id: 'novice-5',
    tier: 'novice',
    tags: ['循环', '累加'],
    code: `int s = 0;
for (int i = 1; i <= 10; i++) {
  s = s + i;
}`,
    lang: 'cpp',
    answer: 1,
    zh: {
      prompt:
        '阅读下面这段程序:`s` 一开始是 0,然后让 `i` 依次取 1、2、3、…、10,每次执行 `s = s + i`。\n循环结束后 `s` 的值是多少?',
      options: ['45', '55', '100', '10'],
      explain:
        '这是把 1 到 10 全部加起来,即 10 × 11 ÷ 2 = **55**。选 45 是把 1~9 相加(把 `i <= 10` 读成了 `i < 10`);选 100 是把它当成了 10 × 10;选 10 则是以为循环只执行最后一次,那是一种完全不同的赋值方式。',
    },
    en: {
      prompt:
        'Read this program: `s` starts at 0, then `i` takes the values 1, 2, 3, …, 10 in turn and each time executes `s = s + i`.\nWhat is the value of `s` after the loop ends?',
      options: ['45', '55', '100', '10'],
      explain:
        'This adds 1 through 10, which is 10 × 11 ÷ 2 = **55**. Picking 45 sums 1–9 (reading `i <= 10` as `i < 10`); picking 100 treats it as 10 × 10; picking 10 assumes only the final iteration matters, which would be a completely different kind of assignment.',
    },
  },
];
