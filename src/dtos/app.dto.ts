import { ApiProperty } from '@nestjs/swagger';

export interface TaskData {
  client_name: string;
  system_name: string;
  system_cycles: number;
  start_time: number;
  estimated_time: number;
  general_status: any;
  execution_status: any;
  repairman: string;
  quality_inspector: string;
}

export class TaskIdDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  taskId: string;
}

export class CreateMaintenanceTaskDto {
  @ApiProperty({ type: String, required: true })
  client_name: string;

  @ApiProperty({ type: String, required: true })
  system_name: string;

  @ApiProperty({ type: String, required: true })
  maintenance_name: string;

  @ApiProperty({ type: Number, required: true })
  system_cycles: number;

  @ApiProperty({ type: Number, required: true })
  estimated_time: number;

  @ApiProperty({ type: Number, required: true })
  start_time: number;

  @ApiProperty({ type: String, required: true })
  cost: string; // Assuming cost is represented as a string for u256

  @ApiProperty({ type: String, required: true })
  repairman: string;

  @ApiProperty({ type: String, required: true })
  quality_inspector: string;
}
