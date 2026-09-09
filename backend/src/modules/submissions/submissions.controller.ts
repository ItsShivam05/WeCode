import { Request, Response } from 'express';
import { ApiResponse } from '@wecode/shared';
import { submissionsService } from './submissions.service';

export class SubmissionsController {
  async submitCode(req: Request, res: Response): Promise<void> {
    const slug = req.params.slug as string;
    const { language, code } = req.body;

    const result = await submissionsService.submitCode(req.user!.userId, slug, language, code);

    const response: ApiResponse = {
      success: true,
      data: result,
    };
    res.status(202).json(response);
  }

  async getSubmissionById(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await submissionsService.getSubmissionById(id, req.user!.userId, req.user!.role);

    const response: ApiResponse = {
      success: true,
      data: result,
    };
    res.status(200).json(response);
  }

  async listUserSubmissions(req: Request, res: Response): Promise<void> {
    const { problemSlug, page, limit } = req.query;

    const result = await submissionsService.listUserSubmissions(
      req.user!.userId,
      problemSlug as string | undefined,
      page ? parseInt(page as string, 10) : 1,
      limit ? parseInt(limit as string, 10) : 20
    );

    const response: ApiResponse = {
      success: true,
      data: result.submissions,
      meta: {
        total: result.total,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      },
    };
    res.status(200).json(response);
  }
}

export const submissionsController = new SubmissionsController();
