import { Controller, Get, ParseIntPipe, Query } from "@nestjs/common";
import { ChartItem, ChartItemWork } from 'shared/types';
import { ChartService } from "src/services/chart.service";

@Controller('/api/v4/charts')
export class ChartController {
  constructor(
    private chartService: ChartService,
  ) {}

  @Get('works/weekly')
  async getWeeklyWorks(
    @Query('limit', new ParseIntPipe()) limit: number
  ): Promise<Array<ChartItem<ChartItemWork>>> {
    return this.chartService.getWeeklyWorks(limit)
  }
}
