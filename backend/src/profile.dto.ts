import { IsBoolean, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

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
