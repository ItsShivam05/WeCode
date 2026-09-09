export interface ComparisonResult {
  isMatch: boolean;
  mismatchLine?: number;
  expectedSnippet?: string;
  actualSnippet?: string;
}

export class JudgeComparator {
  /**
   * Deterministic output comparator
   * - Normalizes Windows CRLF to LF
   * - Trims trailing spaces on individual lines
   * - Ignores trailing empty lines
   * - Performs strict line-by-line equality check
   */
  static compare(actual: string, expected: string): ComparisonResult {
    const normalize = (text: string): string[] => {
      return text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .map((line) => line.trimEnd())
        .filter((line, index, arr) => {
          // Remove trailing empty lines at end of output
          if (line.length > 0) return true;
          // Check if all subsequent lines are also empty
          return arr.slice(index).some((l) => l.length > 0);
        });
    };

    const actualLines = normalize(actual);
    const expectedLines = normalize(expected);

    const maxLines = Math.max(actualLines.length, expectedLines.length);

    for (let i = 0; i < maxLines; i++) {
      const act = actualLines[i] ?? '';
      const exp = expectedLines[i] ?? '';

      if (act !== exp) {
        return {
          isMatch: false,
          mismatchLine: i + 1,
          actualSnippet: act.slice(0, 100),
          expectedSnippet: exp.slice(0, 100),
        };
      }
    }

    return { isMatch: true };
  }
}
