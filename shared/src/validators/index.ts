import { z } from 'zod';
import { Difficulty, Language, Role } from '../enums';

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Must be a valid email address')
    .max(255, 'Email cannot exceed 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters long')
    .max(100, 'Full name cannot exceed 100 characters'),
  role: z.nativeEnum(Role).optional().default(Role.STUDENT),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Must be a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createProblemSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  descriptionMarkdown: z.string().min(10, 'Description must be at least 10 characters'),
  difficulty: z.nativeEnum(Difficulty),
  timeLimitMs: z.number().int().min(100).max(10000).default(2000),
  memoryLimitMb: z.number().int().min(16).max(1024).default(256),
  tags: z.array(z.string().trim().min(1)).default([]),
  isPublished: z.boolean().default(false),
});

export const updateProblemSchema = createProblemSchema.partial();

export const createTestCaseSchema = z.object({
  inputData: z.string(),
  expectedOutput: z.string(),
  isSample: z.boolean().default(false),
  points: z.number().int().min(0).default(10),
  orderIndex: z.number().int().min(0).default(0),
});

export const runCodeSchema = z.object({
  language: z.nativeEnum(Language),
  code: z.string().min(1, 'Code cannot be empty').max(65536, 'Code size cannot exceed 64 KB'),
  customInput: z.string().max(100000, 'Input cannot exceed 100 KB').optional().default(''),
});

export const submitCodeSchema = z.object({
  language: z.nativeEnum(Language),
  code: z.string().min(1, 'Code cannot be empty').max(65536, 'Code size cannot exceed 64 KB'),
});

export const aiHintSchema = z.object({
  problemId: z.string().uuid('Invalid problem ID'),
  code: z.string().min(1).max(65536),
  language: z.nativeEnum(Language),
  lastVerdict: z.string().optional(),
  errorOutput: z.string().max(10000).optional(),
  hintLevel: z.enum(['CONCEPTUAL', 'ALGORITHMIC', 'SYNTACTIC']).default('CONCEPTUAL'),
});
