import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { QueryRunner, Repository, DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { PrayerSchedule } from '../prayer/entities/prayer-schedule.entity';

@Injectable()
export class PrayerService {
  constructor(
    private dataSource: DataSource,
  ) {}

  async getPrayerTimes(userId: string, date?: Date) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const userRepository = queryRunner.manager.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const targetDate = date || new Date();
      const scheduleDate = targetDate.toISOString().split('T')[0];

      // Check if schedule already exists for today
      const scheduleRepository = queryRunner.manager.getRepository(PrayerSchedule);
      let schedule = await scheduleRepository.findOne({
        where: { userId, schedule_date: scheduleDate },
      });

      if (!schedule) {
        // In production, call external API (Aladhan)
        // For now, return cached or basic data
        schedule = await scheduleRepository.findOne({
          where: { userId },
          order: { schedule_date: 'DESC' },
        });
      }

      if (!schedule) {
        // Return default/fixed prayer times
        return {
          fajr: '05:00',
          dhuhr: '12:00',
          asr: '15:00',
          maghrib: '18:00',
          isha: '19:00',
          date: scheduleDate,
          method: 'Default',
          note: 'Using default prayer times - API call needed for real times',
        };
      }

      return {
        fajr: schedule.fajr.toString(),
        dhuhr: schedule.dhuhr.toString(),
        asr: schedule.asr.toString(),
        maghrib: schedule.maghrib.toString(),
        isha: schedule.isha.toString(),
        date: schedule.schedule_date,
        method: schedule.method,
      };
    } finally {
      await queryRunner.release();
    }
  }

  async savePrayerTimes(userId: string, times: any, method: string, latitude: number, longitude: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const scheduleRepository = queryRunner.manager.getRepository(PrayerSchedule);
      
      // Check if exists for today
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      let schedule = await scheduleRepository.findOne({
        where: { userId, schedule_date: todayStr },
      });

      if (!schedule) {
        schedule = this.dataSource.getRepository(PrayerSchedule).create();
      }

      schedule.userId = userId;
      schedule.schedule_date = todayStr;
      schedule.fajr = times.fajr;
      schedule.dhuhr = times.dhuhr;
      schedule.asr = times.asr;
      schedule.maghrib = times.maghrib;
      schedule.isha = times.isha;
      schedule.latitude = latitude;
      schedule.longitude = longitude;
      schedule.method = method;

      await scheduleRepository.save(schedule);
      return schedule;
    } finally {
      await queryRunner.release();
    }
  }
}