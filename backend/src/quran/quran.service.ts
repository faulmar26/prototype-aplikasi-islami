import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { QueryRunner, DataSource } from 'typeorm';
import { Surah } from './entities/surah.entity';
import { AyahDetail } from './entities/ayah.entity';

@Injectable()
export class Qur'anService {
  constructor(private dataSource: DataSource) {}

  async getSurahs() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const surahRepository = queryRunner.manager.getRepository(Surah);
      return surahRepository.find({
        order: { id: 1 },
      });
    } finally {
      await queryRunner.release();
    }
  }

  async getAyahs(surahId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const ayahRepository = queryRunner.manager.getRepository(AyahDetail);
      return ayahRepository.find({
        where: { surahId },
        order: { number: 1 },
      });
    } finally {
      await queryRunner.release();
    }
  }

  async getLastRead(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const bookmarkRepository = queryRunner.manager.getRepository(Bookmark);
      return bookmarkRepository.findOne({
        where: { userId },
        order: { savedAt: 'DESC' },
      });
    } finally {
      await queryRunner.release();
    }
  }

  async saveLastRead(userId: string, surahId: number, ayahId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const bookmarkRepository = queryRunner.manager.getRepository(Bookmark);
      
      let bookmark = await bookmarkRepository.findOne({
        where: { userId },
      });

      if (!bookmark) {
        bookmark = this.dataSource.getRepository(Bookmark).create();
      }

      bookmark.userId = userId;
      bookmark.surahId = surahId;
      bookmark.ayahId = ayahId;
      bookmark.savedAt = new Date();

      await bookmarkRepository.save(bookmark);
      return bookmark;
    } finally {
      await queryRunner.release();
    }
  }
}