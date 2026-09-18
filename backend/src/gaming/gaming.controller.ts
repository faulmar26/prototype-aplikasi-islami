import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { GamingService } from './gaming.service';
import { User } from '../users/user.entity';

@Controller('gaming')
@UseGuards('jwt-auth')
export class GamingController {
  constructor(private gamingService: GamingService) {}

  @Get('missions/today')
  async getTodayMissions(@Request() req) {
    const userId = req.user?.sub || req.user?.id;
    return this.gamingService.getTodayMissions(userId);
  }

  @Post('missions/daily-login/claim')
  async claimDailyLogin(@Request() req) {
    const userId = req.user?.sub || req.user?.id;
    return this.gamingService.claimDailyLogin(userId);
  }

  @Post('missions/quran/complete')
  async completeQuranReading(
    @Request() req,
    @Body() body: { surahId: number; ayahCount: number }
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.gamingService.completeQuranReading(userId, body.surahId, body.ayahCount);
  }
}