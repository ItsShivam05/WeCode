import { describe, expect, it } from 'vitest';
import { Difficulty, Language, Role } from '../enums';
import {
  createProblemSchema,
  loginSchema,
  registerSchema,
  runCodeSchema,
  submitCodeSchema,
} from '../validators';

describe('Shared Validation Schemas', () => {
  describe('registerSchema', () => {
    it('accepts valid registration input', () => {
      const valid = {
        email: 'student@college.edu',
        password: 'Password123',
        fullName: 'Jane Doe',
        role: Role.STUDENT,
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email and weak password', () => {
      const invalid = {
        email: 'not-an-email',
        password: 'short',
        fullName: 'J',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('loginSchema', () => {
    it('validates correct login credentials format', () => {
      const result = loginSchema.safeParse({
        email: 'admin@college.edu',
        password: 'secretPassword',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createProblemSchema', () => {
    it('validates a correct problem definition', () => {
      const problem = {
        title: 'Two Sum',
        slug: 'two-sum',
        descriptionMarkdown: 'Find two indices that sum to target.',
        difficulty: Difficulty.EASY,
        timeLimitMs: 2000,
        memoryLimitMb: 256,
        tags: ['arrays', 'hash-table'],
        isPublished: true,
      };
      const result = createProblemSchema.safeParse(problem);
      expect(result.success).toBe(true);
    });

    it('rejects an invalid slug format', () => {
      const problem = {
        title: 'Two Sum',
        slug: 'Two_Sum With Spaces',
        descriptionMarkdown: 'Find two indices that sum to target.',
        difficulty: Difficulty.EASY,
      };
      const result = createProblemSchema.safeParse(problem);
      expect(result.success).toBe(false);
    });
  });

  describe('runCodeSchema & submitCodeSchema', () => {
    it('accepts valid C++ code payloads', () => {
      const runPayload = {
        language: Language.CPP,
        code: '#include <iostream>\nint main() { return 0; }',
        customInput: '42',
      };
      expect(runCodeSchema.safeParse(runPayload).success).toBe(true);
      expect(submitCodeSchema.safeParse(runPayload).success).toBe(true);
    });

    it('rejects empty code', () => {
      const emptyPayload = {
        language: Language.CPP,
        code: '',
      };
      expect(runCodeSchema.safeParse(emptyPayload).success).toBe(false);
    });
  });
});
