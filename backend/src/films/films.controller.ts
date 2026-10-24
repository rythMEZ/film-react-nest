import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { FilmsService } from './films.service';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}
  @Get()
  async findAll() {
    const items = await this.filmsService.findAll();
    return { total: items.length, items };
  }

  @Get(':id/schedule')
  async findSchedule(@Param('id', ParseUUIDPipe) id: string) {
    const items = await this.filmsService.findScheduleById(id);
    return { total: items.length, items };
  }
}
