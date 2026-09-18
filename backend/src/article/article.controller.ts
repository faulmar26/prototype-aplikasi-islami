import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ArticleService } from './article.service';
import { User } from '../users/user.entity';

@Controller('article')
@UseGuards('jwt-auth')
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Get()
  async getArticles(@Query('published') published: boolean = false) {
    return this.articleService.getArticles(published);
  }

  @Get('slug/:slug')
  async getArticleBySlug(@Param('slug') slug: string) {
    return this.articleService.getArticleBySlug(slug);
  }

  @Post()
  async createArticle(
    @Request() req,
    @Body() body: { title: string; slug: string; content: string }
  ) {
    const userId = req.user?.sub || req.user?.id;
    const author = await req.user ? { id: userId } : null;
    
    // In a real app, fetch the user from DB
    // For now, we'll use a placeholder
    return this.articleService.createArticle(
      { id: userId } as User,
      body.title,
      body.slug,
      body.content
    );
  }

  @Patch('slug/:slug')
  async updateArticle(
    @Param('slug') slug: string,
    @Body() body: { title?: string; content?: string; status?: string }
  ) {
    return this.articleService.updateArticle(slug, body);
  }
}