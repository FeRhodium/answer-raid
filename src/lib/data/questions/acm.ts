import type { LocalizedQuestion } from '../types';

/**
 * 竞赛档:专业方向的**通识概念题**。
 * 答案要么是名词要么是数字,现场能一口报出;同时把「看过科普」和「真学过一点」分开。
 * 每题 zh / en 两份文本,`answer` 下标共享。
 */
export const acmQuestions: LocalizedQuestion[] = [
  {
    id: 'acm-1',
    tier: 'in',
    tags: ['Transformer', '注意力'],
    code: `Attention(Q, K, V) = softmax(Q · Kᵀ / √d) · V`,
    lang: 'text',
    answer: 1,
    zh: {
      prompt: 'Transformer 的**自注意力**机制里最核心的三个量是 `Q`、`K`、`V`,它们分别是哪三个词?',
      options: [
        'Question、Knowledge、Vector',
        'Query、Key、Value',
        'Quality、Kernel、Variance',
        'Queue、Key、Vertex',
      ],
      explain:
        '就是 **Query(查询)、Key(键)、Value(值)** —— 本质是一次「软性的查字典」:拿 Query 去和每个 Key 算相似度,再用相似度当权重把各个 Value 加权求和。选 `Question` 是中文直译的坑(`Question` ≠ `Query`);另外两项是长得像但语义无关的词。',
    },
    en: {
      prompt:
        'The three core quantities in the Transformer\'s **self-attention** mechanism are `Q`, `K` and `V`. Which three words are they?',
      options: [
        'Question, Knowledge, Vector',
        'Query, Key, Value',
        'Quality, Kernel, Variance',
        'Queue, Key, Vertex',
      ],
      explain:
        'They are **Query, Key and Value** — essentially a "soft dictionary lookup": the Query is compared against every Key to get similarities, and those similarities become the weights for a weighted sum of the Values. Picking `Question` is a translation trap (`Question` ≠ `Query`); the other two are look-alike words with no relation to the mechanism.',
    },
  },
  {
    id: 'acm-2',
    tier: 'at',
    tags: ['浮点数', 'IEEE754'],
    code: `single precision (32 bit): 1 + 8 + 23 = 32
double precision (64 bit): 1 + 11 + 52 = 64
         sign    exponent    mantissa`,
    lang: 'text',
    answer: 2,
    zh: {
      prompt: '**IEEE 754 单精度**浮点数(共 32 位)由哪几部分组成?',
      options: [
        '8 位整数部分 + 24 位小数部分',
        '1 位符号 + 15 位阶码 + 16 位尾数',
        '1 位符号 + 8 位阶码 + 23 位尾数',
        '2 位符号 + 10 位阶码 + 20 位尾数',
      ],
      explain:
        '单精度 = **1 位符号 + 8 位阶码 + 23 位尾数**,加起来正好 32 位。选 15 + 16 是把双精度的比例记混了(双精度其实是 1 + 11 + 52);选「整数部分 + 小数部分」是把它当成了定点数。这也顺手解释了 **B 档**那道 `0.1 + 0.2`:尾数只有 23 位二进制,存不下 0.1。',
    },
    en: {
      prompt:
        'An **IEEE 754 single-precision** float (32 bits in total) is made up of which parts?',
      options: [
        '8-bit integer part + 24-bit fraction part',
        '1-bit sign + 15-bit exponent + 16-bit mantissa',
        '1-bit sign + 8-bit exponent + 23-bit mantissa',
        '2-bit sign + 10-bit exponent + 20-bit mantissa',
      ],
      explain:
        'Single precision = **1-bit sign + 8-bit exponent + 23-bit mantissa**, which adds up to exactly 32 bits. Picking 15 + 16 confuses it with double precision\'s proportions (double is really 1 + 11 + 52); "integer part + fraction part" treats it as a fixed-point number. This also explains the `0.1 + 0.2` case from the **SYSTEMS tier**: a 23-bit binary mantissa simply cannot hold 0.1.',
    },
  },
  {
    id: 'acm-3',
    tier: 'sp',
    tags: ['计算理论', 'NP'],
    answer: 2,
    zh: {
      prompt: '下列哪一类问题,**至今没有已知的多项式时间算法**?',
      options: [
        '在一堆数中找出最大值',
        '给一堆数排序',
        '旅行商问题(求经过所有城市的最短环路)',
        '两个整数相加',
      ],
      explain:
        '旅行商问题属于 **NP-hard**:城市一多,既没有已知的多项式时间精确算法,实际中也只能求近似解或用指数级搜索。找最大值是 O(n)、排序是 O(n log n)、整数相加更是基本操作 —— 这三个都简单得刺眼,这题考的是你有没有听说过「P 与 NP」这桩悬案。',
    },
    en: {
      prompt: 'Which of these problems has **no known polynomial-time algorithm** to this day?',
      options: [
        'Finding the maximum of a list of numbers',
        'Sorting a list of numbers',
        'The travelling salesman problem (shortest tour visiting every city)',
        'Adding two integers',
      ],
      explain:
        'The travelling salesman problem is **NP-hard**: with enough cities there is no known polynomial-time exact algorithm, and in practice you settle for approximations or exponential search. Finding a maximum is O(n), sorting is O(n log n), and integer addition is a primitive — those three are glaringly easy, so this question is really asking whether you have heard of the P versus NP question at all.',
    },
  },
  {
    id: 'acm-4',
    tier: 'in',
    tags: ['数据结构', '哈希表'],
    answer: 3,
    zh: {
      prompt: '在一百万个整数里,要判断「某个数是否出现过」,用下面哪种结构**平均最快**?',
      options: ['链表', '有序数组 + 二分查找', '栈', '哈希表'],
      explain:
        '哈希表平均只要 **O(1)**:算一下哈希值就能直接跳到对应位置。有序数组加二分是 O(log n)、链表是 O(n);栈根本不适合查找,它只支持在一端进出一端出。这正是「两数之和」这类题的标准解法:边扫边往哈希表里塞,查一次是常数时间。',
    },
    en: {
      prompt:
        'Given a million integers, which structure is **fastest on average** for deciding whether a particular number occurs in it?',
      options: ['Linked list', 'Sorted array + binary search', 'Stack', 'Hash table'],
      explain:
        'A hash table needs only **O(1)** on average: compute the hash and jump straight to the slot. A sorted array with binary search is O(log n) and a linked list is O(n); a stack is simply the wrong tool, since it only supports push and pop at one end. This is exactly the standard trick behind "two sum" style problems: scan once while inserting into a hash table, and each lookup is constant time.',
    },
  },
  {
    id: 'acm-5',
    tier: 'sp',
    tags: ['算法', '双指针'],
    answer: 2,
    zh: {
      prompt:
        '一个**已经从小到大排好序**的数组,要在里面找两个数使它们的和等于目标值,最优做法的时间复杂度是?',
      options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
      explain:
        '用**左右双指针**:一个指最小、一个指最大,和偏小就把左指针右移,偏大就把右指针左移,两个指针最多一共走 n 步,所以是 **O(n)**。暴力枚举两个下标是 O(n²);O(n log n) 是没有利用「已经排好序」这个白送的条件 —— 既然已经有序,就不必再排序或二分了。',
    },
    en: {
      prompt:
        'Given an array that is **already sorted in ascending order**, you must find two numbers whose sum equals a target value. What is the time complexity of the optimal approach?',
      options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
      explain:
        'Use **two pointers from both ends**: one at the smallest element and one at the largest; if the sum is too small move the left pointer right, if too large move the right pointer left. Together the pointers take at most n steps, so it is **O(n)**. Brute-forcing every pair of indices is O(n²), and O(n log n) fails to exploit the free gift of "already sorted" — since it is sorted, there is no need to sort or binary-search at all.',
    },
  },
];
