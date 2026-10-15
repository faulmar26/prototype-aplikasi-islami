import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CredentialsDto {
  @IsString()
  @Length(3, 32)
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'Nama pengguna hanya boleh berisi huruf, angka, titik, garis bawah, dan tanda hubung.',
  })
  username: string;

  @IsString()
  @Length(8, 72)
  password: string;
}

export class RegisterDto extends CredentialsDto {
  @IsOptional()
  @IsString()
  @Length(1, 60)
  name?: string;
}
