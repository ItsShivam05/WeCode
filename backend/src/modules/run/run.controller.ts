import { Request, Response } from 'express';
import { ApiResponse } from '@wecode/shared';
import { runService } from './run.service';

export class RunController {
  async runCode(req: Request, res: Response): Promise<void> {
    const slug = req.params.slug as string;
    const { language, code, customInput } = req.body;

    const result = await runService.runCode(slug, language, code, customInput);

    const response: ApiResponse = {
      success: true,
      data: result,
    };
    res.status(200).json(response);
  }
}

export const runController = new RunController();
