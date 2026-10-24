import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService, SessionUser } from './auth.service';
import { CredentialsDto, RegisterDto } from './auth.dto';
import { AuthenticatedRequest, JwtAuthGuard } from './jwt-auth.guard';

const SESSION_COOKIE = 'islami_session';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const session = await this.auth.register(body.username, body.password, body.name);
    this.setSession(response, session.token);
    return session.user;
  }

  @Post('login')
  async login(@Body() body: CredentialsDto, @Res({ passthrough: true }) response: Response) {
    const session = await this.auth.login(body.username, body.password);
    this.setSession(response, session.token);
    return session.user;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthenticatedRequest): SessionUser {
    return {
      id: request.user.userId,
      username: request.user.username,
      name: request.user.name,
    };
  }

  @Post('check-in')
  @UseGuards(JwtAuthGuard)
  async checkIn(@Req() request: AuthenticatedRequest) {
    await this.auth.recordVisit(request.user.userId);
    return { success: true };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.setHeader('Set-Cookie', `${SESSION_COOKIE}=; ${this.cookieAttributes(0)}`);
    return { success: true };
  }

  private setSession(response: Response, token: string) {
    response.setHeader(
      'Set-Cookie',
      `${SESSION_COOKIE}=${encodeURIComponent(token)}; ${this.cookieAttributes(COOKIE_MAX_AGE / 1000)}`,
    );
  }

  private cookieAttributes(maxAgeSeconds: number) {
    const sameSite = process.env.COOKIE_SAMESITE?.toLowerCase() === 'none' ? 'None' : 'Lax';
    const secure = process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true';
    const attributes = ['HttpOnly', 'Path=/', `SameSite=${sameSite}`, `Max-Age=${maxAgeSeconds}`];
    if (secure) attributes.push('Secure');
    return attributes.join('; ');
  }
}
