import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from './jwt-auth.guard';
import { DuaReadingDto, QuranReadingDto } from './profile.dto';
import { ProgressService } from './progress.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly progress: ProgressService) {}

  @Get()
  getProfile(@Req() request: AuthenticatedRequest) {
    return this.progress.getProfile(request.user.userId);
  }

  @Post('quran')
  saveQuranReading(@Req() request: AuthenticatedRequest, @Body() body: QuranReadingDto) {
    return this.progress.saveQuranReading(request.user.userId, body);
  }

  @Post('dua')
  saveDuaReading(@Req() request: AuthenticatedRequest, @Body() body: DuaReadingDto) {
    return this.progress.saveDuaReading(request.user.userId, body);
  }
}
