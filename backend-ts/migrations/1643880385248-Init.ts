import { readFileSync } from "fs";
import { resolve } from "path";
import {MigrationInterface, QueryRunner} from "typeorm";

export class Init1643880385248 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(readFileSync(resolve(__dirname, '../schema.sql'), {encoding: 'utf-8'}));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      throw new Error('unsupported');
    }

}
