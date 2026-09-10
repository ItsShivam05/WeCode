import { Request, Response } from 'express';
import { ApiResponse, Difficulty } from '@wecode/shared';
import { problemsService } from './problems.service';

export class ProblemsController {
  async listProblems(req: Request, res: Response): Promise<void> {
    const { difficulty, tag, search, status, page, limit } = req.query;

    const result = await problemsService.listProblems({
      difficulty: difficulty as Difficulty,
      tag: tag as string,
      search: search as string,
      status: status === 'SOLVED' || status === 'UNSOLVED' ? status : undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
      role: req.user?.role,
      userId: req.user?.userId,
    });

    const response: ApiResponse = {
      success: true,
      data: result.problems,
      meta: {
        total: result.total,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      },
    };
    res.status(200).json(response);
  }

  async getProblemBySlug(req: Request, res: Response): Promise<void> {
    const slug = req.params.slug as string;
    const problem = await problemsService.getProblemBySlug(slug, req.user?.userId);

    const response: ApiResponse = {
      success: true,
      data: problem,
    };
    res.status(200).json(response);
  }

  async createProblem(req: Request, res: Response): Promise<void> {
    const problem = await problemsService.createProblem(req.body, req.user!.userId);
    const response: ApiResponse = {
      success: true,
      data: problem,
    };
    res.status(201).json(response);
  }

  async addTestCase(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const testCase = await problemsService.addTestCase(id, req.body);
    const response: ApiResponse = {
      success: true,
      data: testCase,
    };
    res.status(201).json(response);
  }
}

export const problemsController = new ProblemsController();
