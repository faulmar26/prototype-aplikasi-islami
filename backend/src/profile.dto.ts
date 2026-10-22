import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class QuranReadingDto {
  @IsInt()
  @Min(1)
  @Max(114)
  surahNumber: number;

  @IsString()
  @Length(1, 100)
  surahName: string;

  @IsInt()
  @Min(1)
  @Max(286)
  ayahNumber: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class DuaReadingDto {
  @IsInt()
  @Min(1)
  @Max(1000)
  duaId: number;

  @IsString()
  @Length(1, 100)
  duaTitle: string;
}

export class BookmarkCategoryDto {
  @IsString()
  @Length(1, 50)
  name: string;

  @IsIn(['custom'])
  type: 'custom';
}

export class CreateBookmarkDto {
  @IsInt()
  @Min(1)
  categoryId: number;

  @IsIn(['quran', 'dua'])
  contentType: 'quran' | 'dua';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(114)
  surahNumber?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(286)
  ayahNumber?: number;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  surahName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  duaId?: number;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  duaTitle?: string;
}
