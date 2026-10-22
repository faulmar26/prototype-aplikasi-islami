import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from './jwt-auth.guard';
import { BookmarkCategoryDto, CreateBookmarkDto, DuaReadingDto, QuranReadingDto } from './profile.dto';
import { ProgressService } from './progress.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly progress: ProgressService) {}

  @Get()
  getProfile(@Req() request: AuthenticatedRequest) {
    return this.progress.getProfile(request.user.userId);
  }

  @Post('quran')
  saveQuranReading(@Req() request: AuthenticatedRequest, @Body() body: QuranReadingDto) {
    return this.progress.saveQuranReading(request.user.userId, body);
  }

  @Post('dua')
  saveDuaReading(@Req() request: AuthenticatedRequest, @Body() body: DuaReadingDto) {
    return this.progress.saveDuaReading(request.user.userId, body);
  }

  @Get('bookmarks')
  getBookmarks(@Req() request: AuthenticatedRequest) {
    return this.progress.getBookmarks(request.user.userId);
  }

  @Post('bookmark-categories')
  createBookmarkCategory(@Req() request: AuthenticatedRequest, @Body() body: BookmarkCategoryDto) {
    return this.progress.createBookmarkCategory(request.user.userId, body);
  }

  @Delete('bookmark-categories/:id')
  deleteBookmarkCategory(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.progress.deleteBookmarkCategory(request.user.userId, id);
  }

  @Post('bookmarks')
  createBookmark(@Req() request: AuthenticatedRequest, @Body() body: CreateBookmarkDto) {
    return this.progress.createBookmark(request.user.userId, body);
  }

  @Delete('bookmarks/:id')
  deleteBookmark(@Req() request: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.progress.deleteBookmark(request.user.userId, id);
  }
}
