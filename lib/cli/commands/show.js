'use strict'
const support = require('../../../index.js')

// print out the information for a module and its
// children
async function printModule (module, depth, argv) {
  const pkg = module.package
  const moduleInfo = `${pkg.name}(${pkg.version})`

  const supportInfo = await support.getSupportData(pkg,
    module.path,
    argv.canonical,
    argv['base-path'],
    argv.fetch)
  if (supportInfo.resolved) {
    console.log(`${' '.repeat(2 * (depth + 1))}${moduleInfo} - ${supportInfo.contents}`)
  } else if (supportInfo.error) {
    console.log(`${' '.repeat(2 * (depth + 1))}${moduleInfo} - failed to fetch - ${supportInfo.url}`)
  } else {
    console.log(`${' '.repeat(2 * (depth + 1))}${moduleInfo} - ${supportInfo.url}`)
  }

  // print info for all of the child modules
  module.children.forEach((child, name, map) => {
    printModule(child, depth + 1)
  })
};

module.exports = function (opts) {
  return {
    command: 'show',
    desc: 'Show support information',
    builder: function (yargs) {
      return yargs
    },
    handler: function (argv) {
      const Arborist = require('@npmcli/arborist')
      const arb = new Arborist()
      arb.loadActual().then(root => {
        printModule(root, 0, argv).then(() => {}, (e) => {
          argv.log.error('show failed: ', e)
        })
      })
    }
  }
}
