import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { Qur'anService } from './quran.service';
import { User } from '../users/user.entity';

@Controller('quran')
@UseGuards('jwt-auth')
export class Qur'anController {
  constructor(private quranService: Qur'anService) {}

  @Get('surahs')
  async getSurahs() {
    return this.quranService.getSurahs();
  }

  @Get('surah/:surahId')
  async getSurah(@Param('surahId') surahId: number) {
    const ayahs = await this.quranService.getAyahs(surahId);
    return { surahId, ayahs };
  }

  @Get('last-read')
  async getLastRead(@Request() req) {
    const userId = req.user?.sub || req.user?.id;
    return this.quranService.getLastRead(userId);
  }

  @Post('last-read')
  async saveLastRead(
    @Request() req,
    @Body() body: { surahId: number; ayahId: number }
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.quranService.saveLastRead(userId, body.surahId, body.ayahId);
  }
}