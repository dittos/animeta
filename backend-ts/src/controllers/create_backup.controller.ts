import { Body, Controller, Post } from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators";
import { User } from "src/entities/user.entity";
import { BackupService } from "src/services/backup.service";
import { Connection } from "typeorm";

type Params = {
}

type Result = {
  downloadUrl: string;
}

@Controller('/api/v4/CreateBackup')
export class CreateBackupController {
  constructor(
    private connection: Connection,
    private backupService: BackupService,
  ) {}

  @Post()
  async handle(
    @Body() params: Params,
    @CurrentUser() currentUser: User,
  ): Promise<Result> {
    return {
      downloadUrl: await this.backupService.createBackup(this.connection.manager, currentUser)
    }
  }
}
