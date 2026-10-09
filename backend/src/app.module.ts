import { Module, Controller, Get } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseService } from './database.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ProfileController } from './profile.controller';
import { ProgressService } from './progress.service';

@Controller()
class AppController {
  @Get()
  hello() {
    return 'Backend Aplikasi Islami berjalan';
  }
}

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, AuthController, ProfileController],
  providers: [DatabaseService, AuthService, ProgressService, JwtAuthGuard],
})
export class AppModule {}
