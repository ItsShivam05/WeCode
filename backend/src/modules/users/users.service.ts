import { Difficulty, Role, Verdict } from '@wecode/shared';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';

export class UsersService {
  async getUserStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User does not exist');
    }

    // Solved distinct problems count
    const acceptedSubmissions = await prisma.submission.findMany({
      where: {
        userId,
        verdict: Verdict.ACCEPTED,
      },
      select: {
        problemId: true,
        problem: {
          select: {
            difficulty: true,
          },
        },
      },
      distinct: ['problemId'],
    });

    const solvedByDifficulty = {
      [Difficulty.EASY]: 0,
      [Difficulty.MEDIUM]: 0,
      [Difficulty.HARD]: 0,
    };

    acceptedSubmissions.forEach((s) => {
      const diff = s.problem.difficulty as Difficulty;
      if (solvedByDifficulty[diff] !== undefined) {
        solvedByDifficulty[diff]++;
      }
    });

    const totalSubmissions = await prisma.submission.count({
      where: { userId },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role as Role,
        joinedAt: user.createdAt.toISOString(),
      },
      stats: {
        totalSolved: acceptedSubmissions.length,
        totalSubmissions,
        solvedByDifficulty,
      },
    };
  }
}

export const usersService = new UsersService();
