import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: { userId: number; username: string; name: string };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cookie = request.headers.cookie
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('islami_session='));
    const token = cookie?.slice('islami_session='.length);

    if (!token) throw new UnauthorizedException('Silakan masuk untuk menyimpan progres.');

    try {
      const payload = verify(token, this.getSecret(), { algorithms: ['HS256'] });
      if (typeof payload === 'string' || typeof payload.sub !== 'string') {
        throw new UnauthorizedException('Sesi tidak valid. Silakan masuk kembali.');
      }
      request.user = {
        userId: Number(payload.sub),
        username: String(payload.username),
        name: String(payload.name),
      };
      return Number.isInteger(request.user.userId) && request.user.userId > 0;
    } catch {
      throw new UnauthorizedException('Sesi tidak valid atau kedaluwarsa. Silakan masuk kembali.');
    }
  }

  private getSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET harus diatur dan berisi sedikitnya 32 karakter.');
    }
    return secret;
  }
}
