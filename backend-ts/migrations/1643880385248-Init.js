const fs = require('fs')
const path = require('path')

module.exports = class Init1643880385248 {

    async up(queryRunner) {
      // await queryRunner.query(fs.readFileSync(path.resolve(__dirname, '../schema.sql'), {encoding: 'utf-8'}));
    }

    async down(queryRunner) {
      throw new Error('unsupported');
    }

}
