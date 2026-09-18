import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { PrayerService } from './prayer.service';
import { User } from '../users/user.entity';

@Controller('prayer')
@UseGuards('jwt-auth') // Will use guard later
export class PrayerController {
  constructor(private prayerService: PrayerService) {}

  @Get('times')
  async getTimes(
    @Request() req,
    @Query('date') date?: string,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.prayerService.getPrayerTimes(userId, date ? new Date(date) : undefined);
  }

  @Post('save')
  async saveTimes(
    @Request() req,
    @Body() body: {
      fajr: string;
      dhuhr: string;
      asr: string;
      maghrib: string;
      isha: string;
      method: string;
      latitude: number;
      longitude: number;
    },
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.prayerService.savePrayerTimes(userId, body, body.method, body.latitude, body.longitude);
  }
}