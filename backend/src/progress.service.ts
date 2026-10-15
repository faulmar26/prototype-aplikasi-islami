import { Injectable } from '@nestjs/common';
import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from './database.service';
import { DuaReadingDto, QuranReadingDto } from './profile.dto';

interface StreakRow extends RowDataPacket {
  current_streak: number;
  longest_streak: number;
  days_since_active: number;
}

interface MissionRow extends RowDataPacket {
  code: string;
  title: string;
  target_count: number;
  reward_points: number;
  current_count: number;
  is_completed: number;
}

interface ReadingRow extends RowDataPacket {
  last_surah_number: number | null;
  last_surah_name: string | null;
  last_ayah_number: number | null;
  last_dua_id: number | null;
  last_dua_title: string | null;
  updated_at: Date | null;
}

@Injectable()
export class ProgressService {
  constructor(private readonly database: DatabaseService) {}

  async recordLogin(userId: number, connection: PoolConnection) {
    const [rows] = await connection.execute<StreakRow[]>(
      'SELECT current_streak, longest_streak, DATEDIFF(CURDATE(), last_active_date) AS days_since_active FROM streak WHERE user_id = ? FOR UPDATE',
      [userId],
    );
    const existing = rows[0];
    const streak = !existing
      ? 1
      : Number(existing.days_since_active) === 0
        ? Number(existing.current_streak)
        : Number(existing.days_since_active) === 1
          ? Number(existing.current_streak) + 1
          : 1;
    const longest = Math.max(streak, Number(existing?.longest_streak ?? 0));

    await connection.execute(
      `INSERT INTO streak (user_id, current_streak, longest_streak, last_active_date)
       VALUES (?, ?, ?, CURDATE())
       ON DUPLICATE KEY UPDATE current_streak = VALUES(current_streak),
         longest_streak = VALUES(longest_streak), last_active_date = CURDATE()`,
      [userId, streak, longest],
    );
    await this.completeMission(userId, 'login_daily', connection);
  }

  async getProfile(userId: number) {
    const connection = await this.database.getPool().getConnection();
    try {
      const [streakRows] = await connection.execute<StreakRow[]>(
        'SELECT current_streak, longest_streak, 0 AS days_since_active FROM streak WHERE user_id = ? LIMIT 1',
        [userId],
      );
      const [readingRows] = await connection.execute<ReadingRow[]>(
        `SELECT last_surah_number, last_surah_name, last_ayah_number,
          last_dua_id, last_dua_title, updated_at
         FROM user_reading_progress WHERE user_id = ? LIMIT 1`,
        [userId],
      );
      const [missionRows] = await connection.execute<MissionRow[]>(
        `SELECT m.code, m.title, m.target_count, m.reward_points,
          COALESCE(p.current_count, 0) AS current_count,
          COALESCE(p.is_completed, 0) AS is_completed
         FROM missions m
         LEFT JOIN user_mission_progress p
           ON p.mission_id = m.id AND p.user_id = ? AND p.progress_date = CURDATE()
         WHERE m.is_daily = TRUE
         ORDER BY m.id`,
        [userId],
      );
      const [pointsRows] = await connection.execute<RowDataPacket[]>(
        `SELECT COALESCE(SUM(m.reward_points), 0) AS points
         FROM user_mission_progress p
         JOIN missions m ON m.id = p.mission_id
         WHERE p.user_id = ? AND p.is_completed = TRUE`,
        [userId],
      );

      return {
        streak: streakRows[0] ?? { current_streak: 0, longest_streak: 0 },
        reading: readingRows[0] ?? null,
        missions: missionRows.map((mission) => ({
          code: mission.code,
          title: mission.title,
          targetCount: mission.target_count,
          currentCount: mission.current_count,
          rewardPoints: mission.reward_points,
          completed: Boolean(mission.is_completed),
        })),
        points: Number(pointsRows[0]?.points ?? 0),
      };
    } finally {
      connection.release();
    }
  }

  async saveQuranReading(userId: number, reading: QuranReadingDto) {
    const connection = await this.database.getPool().getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute(
        `INSERT INTO user_reading_progress
          (user_id, last_surah_number, last_surah_name, last_ayah_number, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE last_surah_number = VALUES(last_surah_number),
           last_surah_name = VALUES(last_surah_name),
           last_ayah_number = VALUES(last_ayah_number), updated_at = CURRENT_TIMESTAMP`,
        [userId, reading.surahNumber, reading.surahName, reading.ayahNumber],
      );
      if (reading.completed) await this.completeMission(userId, 'read_quran', connection);
      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async saveDuaReading(userId: number, reading: DuaReadingDto) {
    const connection = await this.database.getPool().getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute(
        `INSERT INTO user_reading_progress (user_id, last_dua_id, last_dua_title, updated_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE last_dua_id = VALUES(last_dua_id),
           last_dua_title = VALUES(last_dua_title), updated_at = CURRENT_TIMESTAMP`,
        [userId, reading.duaId, reading.duaTitle],
      );
      await this.completeMission(userId, 'read_dua', connection);
      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private async completeMission(userId: number, code: string, connection: PoolConnection) {
    const [missionRows] = await connection.execute<(RowDataPacket & { id: number })[]>(
      'SELECT id FROM missions WHERE code = ? LIMIT 1',
      [code],
    );
    if (!missionRows[0]) throw new Error(`Misi "${code}" belum tersedia di database.`);
    await connection.execute(
      `INSERT INTO user_mission_progress
        (user_id, mission_id, current_count, is_completed, progress_date)
       VALUES (?, ?, 1, TRUE, CURDATE())
       ON DUPLICATE KEY UPDATE current_count = GREATEST(current_count, 1),
         is_completed = TRUE`,
      [userId, missionRows[0].id],
    );
  }
}
