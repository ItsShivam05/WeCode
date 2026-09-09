import { Request, Response } from 'express';
import { ApiResponse } from '@wecode/shared';
import { aiService } from './ai.service';

export class AiController {
  async getHint(req: Request, res: Response): Promise<void> {
    const result = await aiService.generateHint(req.user!.userId, req.body);
    const response: ApiResponse = {
      success: true,
      data: result,
    };
    res.status(200).json(response);
  }
}

export const aiController = new AiController();
