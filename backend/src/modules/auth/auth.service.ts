import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role, UserDto } from '@wecode/shared';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error-handler';

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role?: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResult> {
    // 1. College domain restriction check (if configured)
    if (env.ALLOWED_EMAIL_DOMAIN_REGEX) {
      const regex = new RegExp(env.ALLOWED_EMAIL_DOMAIN_REGEX, 'i');
      if (!regex.test(input.email)) {
        throw new AppError(
          400,
          'INVALID_EMAIL_DOMAIN',
          'Registration requires a valid college email address'
        );
      }
    }

    // 2. Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'An account with this email already exists');
    }

    // 3. Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    // 4. Create user in database
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        fullName: input.fullName,
        role: input.role || Role.STUDENT,
      },
    });

    // 5. Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.email,
      user.role as Role
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role as Role,
        createdAt: user.createdAt.toISOString(),
      },
      accessToken,
      refreshToken,
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.email,
      user.role as Role
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role as Role,
        createdAt: user.createdAt.toISOString(),
      },
      accessToken,
      refreshToken,
    };
  }

  async getMe(userId: string): Promise<UserDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User does not exist');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as Role,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private generateTokens(userId: string, email: string, role: Role) {
    const payload = { userId, email, role };
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
