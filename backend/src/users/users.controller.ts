import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string; name: string }) {
    return this.usersService.register(body.email, body.password, body.name);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}