import { Controller, Get, Body, UseGuards, Request } from '@nestjs/common';
import { DoaService } from './doa.service';
import { User } from '../users/user.entity';

@Controller('doa')
@UseGuards('jwt-auth')
export class DoaController {
  constructor(private doaService: DoaService) {}

  @Get('categories')
  async getCategories() {
    return this.doaService.getCategories();
  }

  @Get('categories/:categoryId')
  async getDoasByCategory(@Param('categoryId') categoryId: string) {
    return this.doaService.getDoasByCategory(categoryId);
  }
}