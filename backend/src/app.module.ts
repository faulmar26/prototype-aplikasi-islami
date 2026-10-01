import { Module, Controller, Get } from '@nestjs/common';

@Controller()
class AppController {
  @Get()
  hello() {
    return 'Backend Aplikasi Islami berjalan';
  }
}

@Module({ controllers: [AppController] })
export class AppModule {}