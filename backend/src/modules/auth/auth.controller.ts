import { Request, Response } from 'express';
import { ApiResponse } from '@wecode/shared';
import { authService } from './auth.service';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body);

    // Set secure HTTP-only cookie for web clients
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    const response: ApiResponse = {
      success: true,
      data: result,
    };
    res.status(201).json(response);
  }

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    const response: ApiResponse = {
      success: true,
      data: result,
    };
    res.status(200).json(response);
  }

  async getMe(req: Request, res: Response): Promise<void> {
    const user = await authService.getMe(req.user!.userId);
    const response: ApiResponse = {
      success: true,
      data: user,
    };
    res.status(200).json(response);
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('accessToken');
    const response: ApiResponse = {
      success: true,
      data: { message: 'Logged out successfully' },
    };
    res.status(200).json(response);
  }
}

export const authController = new AuthController();
