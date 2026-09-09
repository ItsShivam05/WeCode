import { AiHintRequestDto, AiHintResponseDto } from '@wecode/shared';

export class AiService {
  /**
   * Phase 2 Boundary: AI Hint Generation
   *
   * Architectural Guarantees:
   * 1. AI is NEVER the source of truth for code judging or correctness.
   * 2. AI provides pedagogical/Socratic hints, not complete solution code.
   * 3. Kept behind a dedicated service boundary to allow swapping models or providers.
   */
  async generateHint(_userId: string, request: AiHintRequestDto): Promise<AiHintResponseDto> {
    // In Phase 1 foundation, we provide the contract and structural response.
    // In Phase 2, this calls the dedicated LLM service with strict system prompts.
    return {
      hint: 'Consider your time complexity when iterating through nested loops. Could an auxiliary hash table help look up elements in O(1) time?',
      guidanceType: request.hintLevel || 'CONCEPTUAL',
      remainingDailyQuota: 9,
    };
  }
}

export const aiService = new AiService();
