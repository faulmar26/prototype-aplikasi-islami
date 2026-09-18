import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrayerModule } from './prayer/prayer.module';
import { Qur'anModule } from './quran/quran.module';
import { DoaModule } from './doa/doa.module';
import { GamingModule } from './gaming/gaming.module';
import { ArticleModule } from './article/article.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'islami_app',
      synchronize: true,
      logging: true,
      entities: [
        __dirname + '/**/*.entity{.ts,js}',
      ],
    }),
    UsersModule,
    AuthModule,
    PrayerModule,
    Qur'anModule,
    DoaModule,
    GamingModule,
    ArticleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}