const { MigrationInterface, QueryRunner, TableColumn } = require("typeorm");

module.exports = class RatingToDecimal1668311348070 {

  /**
   * 
   * @param {QueryRunner} queryRunner 
   */
    async up(queryRunner) {
      await queryRunner.query('ALTER TABLE record_record ALTER COLUMN rating TYPE NUMERIC(4,1)')
      await queryRunner.query('ALTER TABLE record_history ALTER COLUMN rating TYPE NUMERIC(4,1)')
    }

    async down(queryRunner) {
    }
}
        