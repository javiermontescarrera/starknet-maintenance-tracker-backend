import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Abi, Account, config, Contract, RpcProvider } from 'starknet';
import deployedContracts from './assets/contracts/deployedContracts';
import { CreateMaintenanceTaskDto, TaskData, TaskIdDto } from './dtos/app.dto';

type ContractInfo = {
  abi: Abi;
  address: string;
};

@Injectable()
export class AppService {
  rpc_provider: RpcProvider;
  account: Account;
  mtContract: Contract;

  constructor(private configService: ConfigService) {
    config.set('mode', 'DEFAULT');
    this.rpc_provider = new RpcProvider({
      nodeUrl:
        this.configService.get('RPC_ENDPOINT_URL') ??
        'http://localhost:5050/rpc',
    });

    // initialize existing pre-deployed account 0 of Devnet
    const accountAddress: string =
      this.configService.get('ACCOUNT_ADDRESS') ?? '0x' + '0'.repeat(62);
    const privateKey: string =
      this.configService.get('PRIVATE_KEY') ?? '0x' + '0'.repeat(62);

    this.account = new Account(this.rpc_provider, accountAddress, privateKey);

    const mtContractInfo = this.getMaintenanceTrackerInfo();
    this.mtContract = new Contract(
      mtContractInfo.abi,
      mtContractInfo.address,
      this.rpc_provider,
    );

    this.mtContract.connect(this.account);

    // As we return a bigint as part of a response, we need to update the BigInt prototype:
    BigInt.prototype['toJSON'] = function () {
      return Number(this);
    };
  }

  getMaintenanceTrackerInfo = (): ContractInfo => {
    const response: ContractInfo = {
      abi: [],
      address: '',
    };
    const network: string = this.configService.get('NETWORK') ?? 'devnet';

    if (network.toLowerCase() === 'devnet') {
      response.abi = deployedContracts.devnet.MaintenanceTracker.abi;
      response.address = deployedContracts.devnet.MaintenanceTracker.address;
    } else if (network.toLowerCase() === 'sepolia') {
      response.abi = deployedContracts.sepolia.MaintenanceTracker.abi;
      response.address = deployedContracts.sepolia.MaintenanceTracker.address;
    }

    console.log(`Using ${network} network`);
    console.log(`Using contract address: ${response.address}`); // 0x54e68e6fe40129f0171b4228e1a61ae143cf9235072fad0db2d1a3ea905fa17

    return response;
  };

  // nro solicitud de restricción de llamadas del area comercial de claro: 3953838284
  // plazo maximo 48 horas
  getHello(): string {
    return 'Hello World!';
  }

  async getRpcVersion(): Promise<string> {
    const resp = await this.rpc_provider.getSpecVersion();
    return resp;
  }

  getContractAddress(): string {
    // initialize existing pre-deployed account 0 of Devnet
    return this.account.address;
  }

  getMaintenanceTrackerAbi(): Abi {
    return this.mtContract.abi;
  }

  async getTaskInfo(args: TaskIdDto): Promise<TaskData> {
    if (Object.keys(args).length > 1) {
      throw new BadRequestException('Err:TooManyArgs');
    }

    const { taskId }: { taskId: string } = args;

    // console.log(`Requested taskId: ${taskId}`);

    try {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      const task: TaskData = await this.mtContract.get_maintenance_task(taskId);
      // console.log(`Task: ${JSON.stringify(task)}`);
      return task;
    } catch (e) {
      console.log(e);
      throw new BadRequestException('Err:WrongCt', e);
    }
  }

  async createMaintenanceTask(args: CreateMaintenanceTaskDto): Promise<string> {
    if (Object.keys(args).length > 9) {
      throw new BadRequestException('Err:TooManyArgs');
    }

    const {
      client_name,
      system_name,
      maintenance_name,
      system_cycles,
      estimated_time,
      start_time,
      cost,
      repairman,
      quality_inspector,
    } = args;

    try {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      const taskId: string = await this.mtContract.create_maintenance_task(
        client_name,
        system_name,
        maintenance_name,
        Number(system_cycles),
        estimated_time,
        start_time,
        Number(cost),
        repairman,
        quality_inspector,
      );
      // console.log(`TaskId: ${taskId}`);
      return taskId;
    } catch (e) {
      console.log(e);
      throw new BadRequestException('Err:WrongCt', e);
    }
  }
}
