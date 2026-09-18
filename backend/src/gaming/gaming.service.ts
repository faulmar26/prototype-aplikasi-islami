import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { User } from '../users/user.entity';
import { Mission } from './entities/mission.entity';
import { UserMissionProgress } from './entities/user-mission-progress.entity';
import { Streak } from './entities/streak.entity';

@Injectable()
export class GamingService {
  constructor(private dataSource: DataSource) {}

  async getTodayMissions(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const missionRepository = queryRunner.manager.getRepository(Mission);
      const progressRepository = queryRunner.manager.getRepository(UserMissionProgress);
      const streakRepository = queryRunner.manager.getRepository(Streak);

      // Get daily missions
      const dailyMissions = await missionRepository.find({
        where: { isDaily: true },
      });

      // Get user's progress for each mission
      const missionsWithProgress = await Promise.all(dailyMissions.map(async (mission) => {
        let progress = await progressRepository.findOne({
          where: { userId, missionId: mission.id },
        });

        if (!progress) {
          progress = this.dataSource.getRepository(UserMissionProgress).create();
          progress.userId = userId;
          progress.missionId = mission.id;
          progress.currentCount = 0;
          progress.isCompleted = false;
          progress.progressDate = new Date();
          await progressRepository.save(progress);
        }

        return {
          ...mission,
          currentCount: progress.currentCount,
          isCompleted: progress.isCompleted,
        };
      }));

      // Get or create streak
      let streak = await streakRepository.findOne({
        where: { userId },
      });

      if (!streak) {
        streak = this.dataSource.getRepository(Streak).create();
        streak.userId = userId;
        streak.currentStreak = 0;
        streak.longestStreak = 0;
        streak.lastActiveDate = new Date();
        await streakRepository.save(streak);
      }

      const today = new Date();
      const lastActive = streak.lastActiveDate;

      // Calculate streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActive < yesterday || lastActive.toDateString() !== today.toDateString()) {
        // User was inactive, reset or continue based on last activity
        if (lastActive.toDateString() !== today.toDateString()) {
          streak.currentStreak = 0; // Reset if last activity was not yesterday
        }
      }

      // Update last active date
      streak.lastActiveDate = today;
      await streakRepository.save(streak);

      return {
        missions: missionsWithProgress,
        streak: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
        },
      };
    } finally {
      await queryRunner.release();
    }
  }

  async claimDailyLogin(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const missionRepository = queryRunner.manager.getRepository(Mission);
      const progressRepository = queryRunner.manager.getRepository(UserMissionProgress);
      const streakRepository = queryRunner.manager.getRepository(Streak);

      // Find daily login mission
      const loginMission = await missionRepository.findOne({
        where: { type: 'daily_login', isDaily: true },
      });

      if (!loginMission) {
        throw new HttpException('Daily login mission not found', HttpStatus.NOT_FOUND);
      }

      // Get or create progress
      let progress = await progressRepository.findOne({
        where: { userId, missionId: loginMission.id },
      });

      if (!progress) {
        progress = this.dataSource.getRepository(UserMissionProgress).create();
        progress.userId = userId;
        progress.missionId = loginMission.id;
        progress.currentCount = 0;
        progress.isCompleted = false;
        progress.progressDate = new Date();
        await progressRepository.save(progress);
      }

      // Increment progress
      progress.currentCount++;
      
      // Check if target reached
      if (progress.currentCount >= loginMission.targetCount) {
        progress.isCompleted = true;
      }

      await progressRepository.save(progress);

      // Update streak
      const today = new Date();
      let streak = await streakRepository.findOne({
        where: { userId },
      });

      if (!streak) {
        streak = this.dataSource.getRepository(Streak).create();
        streak.userId = userId;
        streak.currentStreak = 1;
        streak.longestStreak = 1;
        streak.lastActiveDate = today;
        await streakRepository.save(streak);
      } else {
        // Check if user was active yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (streak.lastActiveDate < yesterday) {
          // Reset streak if user was inactive
          streak.currentStreak = 1;
        } else {
          // Continue streak
          streak.currentStreak++;
        }

        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak;
        }

        streak.lastActiveDate = today;
        await streakRepository.save(streak);
      }

      return {
        mission: loginMission,
        progress,
        streak: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
        },
      };
    } finally {
      await queryRunner.release();
    }
  }

  async completeQuranReading(userId: string, surahId: number, ayahCount: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const missionRepository = queryRunner.manager.getRepository(Mission);
      const progressRepository = queryRunner.manager.getRepository(UserMissionProgress);
      const streakRepository = queryRunner.manager.getRepository(Streak);

      // Find "baca_quran" mission
      const readQuranMission = await missionRepository.findOne({
        where: { type: 'read_quran', isDaily: true },
      });

      if (!readQuranMission) {
        throw new HttpException('Reading mission not found', HttpStatus.NOT_FOUND);
      }

      // Get or create progress
      let progress = await progressRepository.findOne({
        where: { userId, missionId: readQuranMission.id },
      });

      if (!progress) {
        progress = this.dataSource.getRepository(UserMissionProgress).create();
        progress.userId = userId;
        progress.missionId = readQuranMission.id;
        progress.currentCount = 0;
        progress.isCompleted = false;
        progress.progressDate = new Date();
        await progressRepository.save(progress);
      }

      // Add to current count
      progress.currentCount += ayahCount;

      // Check if target reached (typically 1-10 ayat per day)
      if (progress.currentCount >= readQuranMission.targetCount) {
        progress.isCompleted = true;
      }

      await progressRepository.save(progress);

      // Update streak
      const today = new Date();
      let streak = await streakRepository.findOne({
        where: { userId },
      });

      if (!streak) {
        streak = this.dataSource.getRepository(Streak).create();
        streak.userId = userId;
        streak.currentStreak = 1;
        streak.longestStreak = 1;
        streak.lastActiveDate = today;
        await streakRepository.save(streak);
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (streak.lastActiveDate < yesterday) {
          streak.currentStreak = 1;
        } else {
          streak.currentStreak++;
        }

        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak;
        }

        streak.lastActiveDate = today;
        await streakRepository.save(streak);
      }

      return {
        mission: readQuranMission,
        progress,
        streak: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
        },
      };
    } finally {
      await queryRunner.release();
    }
  }
}