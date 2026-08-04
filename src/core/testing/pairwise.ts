export type FactorValues = Record<string, readonly unknown[]>;

export function buildPairwiseCases<T extends FactorValues>(factors: T): Array<{ [K in keyof T]: T[K][number] }> {
  const entries = Object.entries(factors);
  if (entries.length === 0) {
    return [];
  }

  const candidates = cartesian(entries).map((values) =>
    Object.fromEntries(values.map((value, index) => [entries[index]![0], value])),
  ) as Array<{ [K in keyof T]: T[K][number] }>;
  const uncovered = new Set<string>();

  for (let left = 0; left < entries.length; left += 1) {
    for (let right = left + 1; right < entries.length; right += 1) {
      for (const leftValue of entries[left]![1]) {
        for (const rightValue of entries[right]![1]) {
          uncovered.add(pairKey(entries[left]![0], leftValue, entries[right]![0], rightValue));
        }
      }
    }
  }

  const selected: typeof candidates = [];
  while (uncovered.size > 0 && candidates.length > 0) {
    let bestIndex = 0;
    let bestScore = -1;

    for (const [index, candidate] of candidates.entries()) {
      const score = coveredPairs(candidate).filter((pair) => uncovered.has(pair)).length;
      if (score > bestScore) {
        bestIndex = index;
        bestScore = score;
      }
    }

    const [best] = candidates.splice(bestIndex, 1);
    if (!best || bestScore <= 0) {
      break;
    }
    selected.push(best);
    for (const pair of coveredPairs(best)) {
      uncovered.delete(pair);
    }
  }

  return selected;
}

function cartesian(entries: Array<[string, readonly unknown[]]>, index = 0): unknown[][] {
  if (index >= entries.length) {
    return [[]];
  }

  const tail = cartesian(entries, index + 1);
  return entries[index]![1].flatMap((value) => tail.map((rest) => [value, ...rest]));
}

function coveredPairs(candidate: Record<string, unknown>): string[] {
  const entries = Object.entries(candidate);
  const pairs: string[] = [];
  for (let left = 0; left < entries.length; left += 1) {
    for (let right = left + 1; right < entries.length; right += 1) {
      pairs.push(pairKey(entries[left]![0], entries[left]![1], entries[right]![0], entries[right]![1]));
    }
  }
  return pairs;
}

function pairKey(leftName: string, leftValue: unknown, rightName: string, rightValue: unknown): string {
  return JSON.stringify([leftName, leftValue, rightName, rightValue]);
}
