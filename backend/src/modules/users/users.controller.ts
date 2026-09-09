import { Request, Response } from 'express';
import { ApiResponse } from '@wecode/shared';
import { usersService } from './users.service';

export class UsersController {
  async getMyStats(req: Request, res: Response): Promise<void> {
    const stats = await usersService.getUserStats(req.user!.userId);
    const response: ApiResponse = {
      success: true,
      data: stats,
    };
    res.status(200).json(response);
  }

  async getUserProfile(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const stats = await usersService.getUserStats(id);
    const response: ApiResponse = {
      success: true,
      data: stats,
    };
    res.status(200).json(response);
  }
}

export const usersController = new UsersController();
