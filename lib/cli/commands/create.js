'use strict';
const support = require('../../../index.js');

module.exports = function (opts) {
  return {
    command: 'create',
    desc: 'Setup a support declaration for a package',
    builder: function (yargs) {
      return yargs
        .option('yes', {
          desc: 'Apply default values',
          type: 'boolean',
          alias: 'y'
        });
    },
    handler: async function (argv) {
      try {
        await support.create(argv.y);
        console.log('Support info created');
      } catch (error) {
        console.error(error.message);
      }
    }
  };
};
