import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { QueryRunner, DataSource } from 'typeorm';
import { DoaCategory } from './entities/doa-category.entity';
import { Doa } from './entities/doa.entity';

@Injectable()
export class DoaService {
  constructor(private dataSource: DataSource) {}

  async getCategories() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const categoryRepository = queryRunner.manager.getRepository(DoaCategory);
      return categoryRepository.find();
    } finally {
      await queryRunner.release();
    }
  }

  async getDoasByCategory(categoryId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const doaRepository = queryRunner.manager.getRepository(Doa);
      return doaRepository.find({
        where: { categoryId },
      });
    } finally {
      await queryRunner.release();
    }
  }
}