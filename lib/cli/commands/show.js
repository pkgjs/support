'use strict'
module.exports = function (opts) {
  return {
    command: 'show',
    desc: 'Show support information',
    builder: function (yargs) {
      return yargs
    },
    handler: function (argv) {
      argv.log.info('show')
    }
  }
}
