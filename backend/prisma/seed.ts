import bcrypt from 'bcryptjs';
import { PrismaClient, Difficulty, Role } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const defaultDevelopmentPassword = 'WeCodeDevOnly!2026';
const adminEmail = 'admin@wecode.dev';

const tagDefinitions = [
  { slug: 'arrays', name: 'Arrays' },
  { slug: 'strings', name: 'Strings' },
  { slug: 'hash-table', name: 'Hash Table' },
  { slug: 'two-pointers', name: 'Two Pointers' },
  { slug: 'binary-search', name: 'Binary Search' },
  { slug: 'stack', name: 'Stack' },
  { slug: 'linked-list', name: 'Linked List' },
  { slug: 'sliding-window', name: 'Sliding Window' },
  { slug: 'dynamic-programming', name: 'Dynamic Programming' },
  { slug: 'graphs', name: 'Graphs' },
  { slug: 'math', name: 'Math' },
  { slug: 'sorting', name: 'Sorting' },
] as const;

type SeedTestCase = {
  inputData: string;
  expectedOutput: string;
  isSample: boolean;
};

type SeedProblem = {
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  timeLimitMs: number;
  memoryLimitMb: number;
  descriptionMarkdown: string;
  testCases: SeedTestCase[];
};

const problemDefinitions: SeedProblem[] = [
  {
    slug: 'pairing-numbers',
    title: 'Pairing Numbers',
    difficulty: Difficulty.EASY,
    tags: ['arrays', 'hash-table'],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    descriptionMarkdown: `## Description

Given a list of integers and a target value, find two different positions whose values add up to the target. Return the positions in increasing order. Each input has exactly one valid pair.

## Input

The first line contains \`n\`, the number of values. The second line contains \`n\` integers. The third line contains the target integer.

## Output

Print the two zero-based positions separated by a space.

## Examples

### Example 1

Input:
\`\`\`
5
4 9 1 6 3
10
\`\`\`

Output:
\`\`\`
1 2
\`\`\`

### Example 2

Input:
\`\`\`
4
8 2 7 5
13
\`\`\`

Output:
\`\`\`
2 3
\`\`\`

## Constraints

- \`2 <= n <= 100000\`
- Values and the target are between \`-10^9\` and \`10^9\`.
- Exactly one pair produces the target.
`,
    testCases: [
      { inputData: '5\n4 9 1 6 3\n10\n', expectedOutput: '1 2', isSample: true },
      { inputData: '4\n8 2 7 5\n13\n', expectedOutput: '2 3', isSample: true },
      { inputData: '6\n-8 14 3 11 0 5\n6\n', expectedOutput: '0 1', isSample: false },
      { inputData: '5\n1 1 4 8 12\n9\n', expectedOutput: '0 3', isSample: false },
      { inputData: '7\n20 -4 9 2 15 6 1\n11\n', expectedOutput: '1 4', isSample: false },
      { inputData: '3\n-5 10 15\n5\n', expectedOutput: '0 1', isSample: false },
      { inputData: '8\n31 7 18 2 40 -9 13 5\n4\n', expectedOutput: '5 6', isSample: false },
    ],
  },
  {
    slug: 'valid-brackets',
    title: 'Valid Brackets',
    difficulty: Difficulty.EASY,
    tags: ['strings', 'stack'],
    timeLimitMs: 1000,
    memoryLimitMb: 128,
    descriptionMarkdown: `## Description

A bracket string uses the characters \`()\`, \`()\`, \`[]\`, and \`{}\`. Determine whether every opening bracket is closed by the same kind of bracket in the correct order.

## Input

One line containing a non-empty bracket string.

## Output

Print \`YES\` when the string is properly nested and \`NO\` otherwise.

## Examples

### Example 1

Input:
\`\`\`
{[()]}
\`\`\`

Output:
\`\`\`
YES
\`\`\`

### Example 2

Input:
\`\`\`
([)]
\`\`\`

Output:
\`\`\`
NO
\`\`\`

## Constraints

- The string length is between \`1\` and \`200000\`.
- The string contains only parentheses, square brackets, and braces.
`,
    testCases: [
      { inputData: '{[()]}\n', expectedOutput: 'YES', isSample: true },
      { inputData: '([)]\n', expectedOutput: 'NO', isSample: true },
      { inputData: '(((())))[]{}\n', expectedOutput: 'YES', isSample: false },
      { inputData: '{[(])}\n', expectedOutput: 'NO', isSample: false },
      { inputData: '()[]{[()]}\n', expectedOutput: 'YES', isSample: false },
      { inputData: '((())\n', expectedOutput: 'NO', isSample: false },
      { inputData: '}{\n', expectedOutput: 'NO', isSample: false },
    ],
  },
  {
    slug: 'first-position-sorted-array',
    title: 'First Position in a Sorted Array',
    difficulty: Difficulty.EASY,
    tags: ['arrays', 'binary-search'],
    timeLimitMs: 1500,
    memoryLimitMb: 128,
    descriptionMarkdown: `## Description

A non-decreasing array may contain the same value several times. Find the first zero-based position at which the target appears.

## Input

The first line contains \`n\`. The second line contains \`n\` sorted integers. The third line contains the target.

## Output

Print the first position of the target, or \`-1\` if it is not present.

## Examples

### Example 1

Input:
\`\`\`
7
1 2 2 2 5 8 9
2
\`\`\`

Output:
\`\`\`
1
\`\`\`

### Example 2

Input:
\`\`\`
5
3 6 10 14 20
7
\`\`\`

Output:
\`\`\`
-1
\`\`\`

## Constraints

- \`1 <= n <= 200000\`
- Array values are between \`-10^9\` and \`10^9\`.
- The array is sorted in non-decreasing order.
`,
    testCases: [
      { inputData: '7\n1 2 2 2 5 8 9\n2\n', expectedOutput: '1', isSample: true },
      { inputData: '5\n3 6 10 14 20\n7\n', expectedOutput: '-1', isSample: true },
      { inputData: '6\n-4 -4 -4 0 3 9\n-4\n', expectedOutput: '0', isSample: false },
      { inputData: '4\n2 5 8 11\n11\n', expectedOutput: '3', isSample: false },
      { inputData: '1\n42\n42\n', expectedOutput: '0', isSample: false },
      { inputData: '8\n0 0 1 3 3 3 7 10\n3\n', expectedOutput: '3', isSample: false },
      { inputData: '5\n-8 -2 0 4 12\n-9\n', expectedOutput: '-1', isSample: false },
    ],
  },
  {
    slug: 'reverse-linked-list',
    title: 'Reverse a Linked List',
    difficulty: Difficulty.EASY,
    tags: ['linked-list'],
    timeLimitMs: 1500,
    memoryLimitMb: 128,
    descriptionMarkdown: `## Description

You are given the values stored in a singly linked list from its head to its tail. Produce the values after reversing all links in the list.

## Input

The first line contains \`n\`, the number of nodes. The second line contains the node values from head to tail.

## Output

Print the node values from the new head to the new tail on one line.

## Examples

### Example 1

Input:
\`\`\`
5
4 8 1 7 3
\`\`\`

Output:
\`\`\`
3 7 1 8 4
\`\`\`

### Example 2

Input:
\`\`\`
1
99
\`\`\`

Output:
\`\`\`
99
\`\`\`

## Constraints

- \`1 <= n <= 100000\`
- Each node value is between \`-10^9\` and \`10^9\`.
`,
    testCases: [
      { inputData: '5\n4 8 1 7 3\n', expectedOutput: '3 7 1 8 4', isSample: true },
      { inputData: '1\n99\n', expectedOutput: '99', isSample: true },
      { inputData: '2\n-5 12\n', expectedOutput: '12 -5', isSample: false },
      { inputData: '6\n0 0 4 -2 8 8\n', expectedOutput: '8 8 -2 4 0 0', isSample: false },
      { inputData: '4\n100 -100 50 25\n', expectedOutput: '25 50 -100 100', isSample: false },
      { inputData: '3\n7 7 7\n', expectedOutput: '7 7 7', isSample: false },
      { inputData: '7\n1 3 5 7 9 11 13\n', expectedOutput: '13 11 9 7 5 3 1', isSample: false },
    ],
  },
  {
    slug: 'maximum-subarray-sum',
    title: 'Maximum Subarray Sum',
    difficulty: Difficulty.EASY,
    tags: ['arrays', 'dynamic-programming'],
    timeLimitMs: 1500,
    memoryLimitMb: 128,
    descriptionMarkdown: `## Description

Find the largest sum obtainable from a contiguous, non-empty section of an integer array.

## Input

The first line contains \`n\`. The second line contains \`n\` integers.

## Output

Print the maximum contiguous-section sum.

## Examples

### Example 1

Input:
\`\`\`
8
-2 4 -1 5 -6 3 2 -1
\`\`\`

Output:
\`\`\`
8
\`\`\`

### Example 2

Input:
\`\`\`
4
-7 -3 -9 -2
\`\`\`

Output:
\`\`\`
-2
\`\`\`

## Constraints

- \`1 <= n <= 200000\`
- Each value is between \`-10^9\` and \`10^9\`.
`,
    testCases: [
      { inputData: '8\n-2 4 -1 5 -6 3 2 -1\n', expectedOutput: '8', isSample: true },
      { inputData: '4\n-7 -3 -9 -2\n', expectedOutput: '-2', isSample: true },
      { inputData: '5\n5 -2 3 -1 2\n', expectedOutput: '7', isSample: false },
      { inputData: '6\n-1 -2 -3 4 -2 1\n', expectedOutput: '4', isSample: false },
      { inputData: '3\n10 -20 10\n', expectedOutput: '10', isSample: false },
      { inputData: '7\n-4 6 -1 2 -8 5 5\n', expectedOutput: '10', isSample: false },
      { inputData: '1\n-42\n', expectedOutput: '-42', isSample: false },
    ],
  },
  {
    slug: 'longest-unique-segment',
    title: 'Longest Unique Segment',
    difficulty: Difficulty.MEDIUM,
    tags: ['strings', 'sliding-window'],
    timeLimitMs: 2000,
    memoryLimitMb: 128,
    descriptionMarkdown: `## Description

For a given text, find the length of the longest contiguous segment in which no character appears more than once. Characters are compared exactly, including letter case.

## Input

One line containing the text. The text contains no spaces.

## Output

Print the length of the longest segment with all distinct characters.

## Examples

### Example 1

Input:
\`\`\`
blueberry
\`\`\`

Output:
\`\`\`
4
\`\`\`

### Example 2

Input:
\`\`\`
zzzz
\`\`\`

Output:
\`\`\`
1
\`\`\`

## Constraints

- The text length is between \`1\` and \`200000\`.
- The text contains lowercase and uppercase English letters and digits.
`,
    testCases: [
      { inputData: 'blueberry\n', expectedOutput: '4', isSample: true },
      { inputData: 'zzzz\n', expectedOutput: '1', isSample: true },
      { inputData: 'aBcaD\n', expectedOutput: '4', isSample: false },
      { inputData: 'cabbaef\n', expectedOutput: '4', isSample: false },
      { inputData: '01234012\n', expectedOutput: '5', isSample: false },
      { inputData: 'qwertyq\n', expectedOutput: '6', isSample: false },
      { inputData: 'AaAaBb\n', expectedOutput: '2', isSample: false },
    ],
  },
  {
    slug: 'closest-pair-target',
    title: 'Pair Sum Closest to Target',
    difficulty: Difficulty.MEDIUM,
    tags: ['arrays', 'two-pointers'],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    descriptionMarkdown: `## Description

Choose two different values from a sorted array so their sum is as close as possible to a target. Print the chosen values in increasing order. If several pairs are equally close, choose the lexicographically smaller pair.

## Input

The first line contains \`n\`. The second line contains \`n\` integers in non-decreasing order. The third line contains the target.

## Output

Print the chosen pair of values followed by their absolute difference.

## Examples

### Example 1

Input:
\`\`\`
6
1 4 7 10 13 18
15
\`\`\`

Output:
\`\`\`
1 13 1
\`\`\`

### Example 2

Input:
\`\`\`
5
2 5 9 12 20
14
\`\`\`

Output:
\`\`\`
2 12 0
\`\`\`

## Constraints

- \`2 <= n <= 200000\`
- Values and the target are between \`-10^9\` and \`10^9\`.
- A pair always exists.
`,
    testCases: [
      { inputData: '6\n1 4 7 10 13 18\n15\n', expectedOutput: '1 13 1', isSample: true },
      { inputData: '5\n2 5 9 12 20\n14\n', expectedOutput: '2 12 0', isSample: true },
      { inputData: '6\n-10 -3 2 8 14 21\n5\n', expectedOutput: '-3 8 0', isSample: false },
      { inputData: '5\n1 2 8 11 14\n16\n', expectedOutput: '2 14 0', isSample: false },
      { inputData: '4\n-8 -2 4 9\n0\n', expectedOutput: '-8 9 1', isSample: false },
      { inputData: '7\n0 3 6 10 15 19 25\n17\n', expectedOutput: '3 15 1', isSample: false },
      { inputData: '5\n-5 -1 2 6 10\n7\n', expectedOutput: '2 6 1', isSample: false },
    ],
  },
  {
    slug: 'count-connected-zones',
    title: 'Count Connected Zones',
    difficulty: Difficulty.MEDIUM,
    tags: ['graphs'],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    descriptionMarkdown: `## Description

A map has \`n\` locations numbered from \`1\` to \`n\` and \`m\` undirected roads. Locations connected through one or more roads belong to the same zone. Count the zones, including locations with no roads.

## Input

The first line contains \`n m\`. Each of the next \`m\` lines contains two location numbers describing an undirected road.

## Output

Print the number of connected zones.

## Examples

### Example 1

Input:
\`\`\`
6 4
1 2
2 3
4 5
5 6
\`\`\`

Output:
\`\`\`
2
\`\`\`

### Example 2

Input:
\`\`\`
5 2
1 2
3 4
\`\`\`

Output:
\`\`\`
3
\`\`\`

## Constraints

- \`1 <= n <= 200000\`
- \`0 <= m <= 200000\`
- Roads do not connect a location to itself.
`,
    testCases: [
      { inputData: '6 4\n1 2\n2 3\n4 5\n5 6\n', expectedOutput: '2', isSample: true },
      { inputData: '5 2\n1 2\n3 4\n', expectedOutput: '3', isSample: true },
      { inputData: '4 0\n', expectedOutput: '4', isSample: false },
      { inputData: '7 6\n1 2\n2 4\n4 1\n3 5\n5 6\n6 3\n', expectedOutput: '3', isSample: false },
      {
        inputData: '8 7\n1 2\n2 3\n3 4\n5 6\n6 7\n7 8\n1 4\n',
        expectedOutput: '2',
        isSample: false,
      },
      { inputData: '3 2\n1 2\n2 3\n', expectedOutput: '1', isSample: false },
      { inputData: '6 3\n1 6\n2 5\n3 4\n', expectedOutput: '3', isSample: false },
    ],
  },
  {
    slug: 'minimum-coins',
    title: 'Minimum Coins',
    difficulty: Difficulty.MEDIUM,
    tags: ['dynamic-programming'],
    timeLimitMs: 2000,
    memoryLimitMb: 128,
    descriptionMarkdown: `## Description

You have unlimited coins of the listed denominations. Find the smallest number of coins needed to make an exact amount. A denomination may be used any number of times.

## Input

The first line contains the target amount and the number of denominations, \`amount k\`. The second line contains \`k\` positive denominations.

## Output

Print the minimum number of coins, or \`-1\` when the amount cannot be formed.

## Examples

### Example 1

Input:
\`\`\`
11 3
1 4 6
\`\`\`

Output:
\`\`\`
3
\`\`\`

### Example 2

Input:
\`\`\`
7 2
2 5
\`\`\`

Output:
\`\`\`
-1
\`\`\`

## Constraints

- \`0 <= amount <= 100000\`
- \`1 <= k <= 20\`
- Each denomination is between \`1\` and \`10000\`.
`,
    testCases: [
      { inputData: '11 3\n1 4 6\n', expectedOutput: '3', isSample: true },
      { inputData: '7 2\n2 5\n', expectedOutput: '-1', isSample: true },
      { inputData: '0 3\n2 3 7\n', expectedOutput: '0', isSample: false },
      { inputData: '27 4\n1 5 10 25\n', expectedOutput: '3', isSample: false },
      { inputData: '18 3\n4 6 9\n', expectedOutput: '2', isSample: false },
      { inputData: '23 3\n2 4 8\n', expectedOutput: '-1', isSample: false },
      { inputData: '63 5\n1 7 13 21 30\n', expectedOutput: '3', isSample: false },
    ],
  },
  {
    slug: 'rain-collection',
    title: 'Rain Collection',
    difficulty: Difficulty.HARD,
    tags: ['arrays', 'two-pointers'],
    timeLimitMs: 3000,
    memoryLimitMb: 256,
    descriptionMarkdown: `## Description

A row of blocks has the given heights. After rain, water can remain in the dips between taller blocks. Calculate the total number of water units held above the blocks.

## Input

The first line contains \`n\`. The second line contains \`n\` non-negative block heights.

## Output

Print the total trapped water units.

## Examples

### Example 1

Input:
\`\`\`
8
3 0 2 0 4 1 2 3
\`\`\`

Output:
\`\`\`
10
\`\`\`

### Example 2

Input:
\`\`\`
6
1 2 3 4 5 6
\`\`\`

Output:
\`\`\`
0
\`\`\`

## Constraints

- \`1 <= n <= 200000\`
- Each height is between \`0\` and \`100000\`.
- Use a wide integer type for the total.
`,
    testCases: [
      { inputData: '8\n3 0 2 0 4 1 2 3\n', expectedOutput: '10', isSample: true },
      { inputData: '6\n1 2 3 4 5 6\n', expectedOutput: '0', isSample: true },
      { inputData: '5\n5 0 0 0 5\n', expectedOutput: '15', isSample: false },
      { inputData: '7\n4 1 0 2 1 3 5\n', expectedOutput: '12', isSample: false },
      { inputData: '4\n0 3 0 2\n', expectedOutput: '2', isSample: false },
      { inputData: '3\n2 0 2\n', expectedOutput: '2', isSample: false },
      { inputData: '9\n6 2 4 0 3 1 5 2 6\n', expectedOutput: '25', isSample: false },
    ],
  },
];

async function main() {
  if (process.env.NODE_ENV === 'production' && !process.env.SEED_ADMIN_PASSWORD) {
    throw new Error('SEED_ADMIN_PASSWORD must be set when running the seed in production.');
  }

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? defaultDevelopmentPassword;
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { fullName: 'WeCode Admin', role: Role.ADMIN, passwordHash },
    create: {
      email: adminEmail,
      fullName: 'WeCode Admin',
      role: Role.ADMIN,
      passwordHash,
    },
  });

  const tags = new Map<string, { id: string }>();
  for (const tag of tagDefinitions) {
    const savedTag = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: tag,
      select: { id: true },
    });
    tags.set(tag.slug, savedTag);
  }

  for (const definition of problemDefinitions) {
    const problem = await prisma.problem.upsert({
      where: { slug: definition.slug },
      update: {
        title: definition.title,
        descriptionMarkdown: definition.descriptionMarkdown,
        difficulty: definition.difficulty,
        timeLimitMs: definition.timeLimitMs,
        memoryLimitMb: definition.memoryLimitMb,
        isPublished: true,
        createdById: admin.id,
      },
      create: {
        slug: definition.slug,
        title: definition.title,
        descriptionMarkdown: definition.descriptionMarkdown,
        difficulty: definition.difficulty,
        timeLimitMs: definition.timeLimitMs,
        memoryLimitMb: definition.memoryLimitMb,
        isPublished: true,
        createdById: admin.id,
      },
    });

    for (const tagSlug of definition.tags) {
      const tag = tags.get(tagSlug);
      if (!tag) throw new Error(`Missing tag definition: ${tagSlug}`);

      await prisma.problemTag.upsert({
        where: {
          problemId_tagId: {
            problemId: problem.id,
            tagId: tag.id,
          },
        },
        update: {},
        create: { problemId: problem.id, tagId: tag.id },
      });
    }

    for (const [orderIndex, testCase] of definition.testCases.entries()) {
      const existing = await prisma.testCase.findFirst({
        where: {
          problemId: problem.id,
          orderIndex,
          isSample: testCase.isSample,
        },
        select: { id: true },
      });

      if (existing) {
        await prisma.testCase.update({
          where: { id: existing.id },
          data: {
            inputData: testCase.inputData,
            expectedOutput: testCase.expectedOutput,
            points: 10,
          },
        });
      } else {
        await prisma.testCase.create({
          data: {
            problemId: problem.id,
            inputData: testCase.inputData,
            expectedOutput: testCase.expectedOutput,
            isSample: testCase.isSample,
            points: 10,
            orderIndex,
          },
        });
      }
    }
  }

  const [userCount, tagCount, problemCount, sampleCount, hiddenCount, relationshipCount] =
    await Promise.all([
      prisma.user.count({ where: { email: adminEmail } }),
      prisma.tag.count(),
      prisma.problem.count({
        where: { slug: { in: problemDefinitions.map((item) => item.slug) } },
      }),
      prisma.testCase.count({
        where: {
          isSample: true,
          problem: { slug: { in: problemDefinitions.map((item) => item.slug) } },
        },
      }),
      prisma.testCase.count({
        where: {
          isSample: false,
          problem: { slug: { in: problemDefinitions.map((item) => item.slug) } },
        },
      }),
      prisma.problemTag.count({
        where: { problem: { slug: { in: problemDefinitions.map((item) => item.slug) } } },
      }),
    ]);

  console.log(
    `Seed complete: ${userCount} admin user, ${tagCount} tags, ${problemCount} problems, ${sampleCount} sample tests, ${hiddenCount} hidden tests, ${relationshipCount} problem-tag relationships.`
  );

  if (process.env.SEED_ADMIN_PASSWORD) {
    console.log('Admin password loaded from SEED_ADMIN_PASSWORD.');
  } else {
    console.log(`Development admin password: ${defaultDevelopmentPassword}`);
  }
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
