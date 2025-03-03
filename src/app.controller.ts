import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Abi } from 'starknet';
import { CreateMaintenanceTaskDto, TaskIdDto } from './dtos/app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/rpc-version')
  async getRpcVersion(): Promise<string> {
    return this.appService.getRpcVersion();
  }

  @Get('/mt-contract-abi')
  getMaintenanceTrackerAbi(): Abi {
    return this.appService.getMaintenanceTrackerAbi();
  }

  @Post('/get-task-info')
  async getMTInfo(@Body() body: TaskIdDto) {
    return { result: await this.appService.getTaskInfo(body) };
  }

  @Post('/create-task')
  async createMaintenanceTask(@Body() body: CreateMaintenanceTaskDto) {
    return { result: await this.appService.createMaintenanceTask(body) };
  }
}
