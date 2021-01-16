'use strict';
const support = require('../../../index.js');

module.exports = function (opts) {
  return {
    command: 'create',
    desc: 'Setup a support declaration for a package',
    builder: function (yargs) {
      return yargs;
    },
    handler: async function (argv) {
      try {
        await support.create();
      } catch (error) {
        console.error(error.message);
      }
    }
  };
};
