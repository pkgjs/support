'use strict'
module.exports = function (opts) {
  return {
    command: 'badges',
    desc: 'Output badges markdown based on support',
    builder: function (yargs) {
      return yargs
    },
    handler: function (argv) {
      argv.log.info('badges')
    }
  }
}
