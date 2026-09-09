import { describe, expect, it } from 'vitest';
import { JudgeComparator } from '../judge/comparator';

describe('JudgeComparator', () => {
  it('returns isMatch: true for identical single-line output', () => {
    const result = JudgeComparator.compare('42', '42');
    expect(result.isMatch).toBe(true);
  });

  it('normalizes CRLF and trailing spaces', () => {
    const actual = 'hello world   \r\n42 \r\n';
    const expected = 'hello world\n42\n';
    const result = JudgeComparator.compare(actual, expected);
    expect(result.isMatch).toBe(true);
  });

  it('ignores trailing blank lines at end of output', () => {
    const actual = 'output\n\n\n';
    const expected = 'output';
    const result = JudgeComparator.compare(actual, expected);
    expect(result.isMatch).toBe(true);
  });

  it('detects mismatch correctly and reports differing line', () => {
    const actual = '1\n2\n4\n';
    const expected = '1\n2\n3\n';
    const result = JudgeComparator.compare(actual, expected);
    expect(result.isMatch).toBe(false);
    expect(result.mismatchLine).toBe(3);
    expect(result.actualSnippet).toBe('4');
    expect(result.expectedSnippet).toBe('3');
  });

  it('detects missing lines as mismatch', () => {
    const actual = 'line1\n';
    const expected = 'line1\nline2\n';
    const result = JudgeComparator.compare(actual, expected);
    expect(result.isMatch).toBe(false);
    expect(result.mismatchLine).toBe(2);
  });
});
