'use strict';
module.exports = function (opts) {
  return {
    command: 'setup',
    desc: 'Setup a support declaration for a package',
    builder: function (yargs) {
      return yargs;
    },
    handler: function (argv) {
      argv.log.info('setup');
    }
  };
};
