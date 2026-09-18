import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { Article } from './entities/article.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ArticleService {
  constructor(private dataSource: DataSource) {}

  async getArticles(publishedOnly: boolean = false) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const articleRepository = queryRunner.manager.getRepository(Article);
      
      const whereClause = publishedOnly 
        ? { status: 'published', publishedAt: !() } 
        : {};
      
      return articleRepository.find({
        where: { status: 'published' },
        order: { publishedAt: 'DESC' },
      });
    } finally {
      await queryRunner.release();
    }
  }

  async getArticleBySlug(slug: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const articleRepository = queryRunner.manager.getRepository(Article);
      const article = await articleRepository.findOne({
        where: { slug },
      });

      if (!article) {
        throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
      }

      return article;
    } finally {
      await queryRunner.release();
    }
  }

  async createArticle(
    author: User,
    title: string,
    slug: string,
    content: string,
    status: string = 'draft'
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const articleRepository = queryRunner.manager.getRepository(Article);
      
      const article = this.dataSource.getRepository(Article).create({
        title,
        slug,
        content,
        authorId: author.id,
        author,
        status,
      });

      await articleRepository.save(article);
      return article;
    } finally {
      await queryRunner.release();
    }
  }

  async updateArticle(
    slug: string,
    updates: { title?: string; content?: string; status?: string }
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const articleRepository = queryRunner.manager.getRepository(Article);
      
      await articleRepository.update({ slug }, updates);
      
      return this.getArticleBySlug(slug);
    } finally {
      await queryRunner.release();
    }
  }
}