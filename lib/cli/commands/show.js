'use strict'
const support = require('../../../index.js')

// print out the information for a module and its
// children
function printModule (module, depth) {
  const pkg = module.package
  const moduleInfo = `${pkg.name}(${pkg.version})`

  const supportInfo = support.getSupportData(pkg, module.path, preferCanonical, basePathOverride)
  if (supportInfo.resolved) {
    console.log(`${' '.repeat(2 * (depth + 1))}${moduleInfo} - ${supportInfo.contents}`)
  } else {
    console.log(`${' '.repeat(2 * (depth + 1))}${moduleInfo} - ${supportInfo.url}`)
  }

  // print info for all of the child modules
  module.children.forEach((child, name, map) => {
    printModule(child, depth + 1)
  })
};

let preferCanonical = false
let basePathOverride
module.exports = function (opts) {
  return {
    command: 'show',
    desc: 'Show support information',
    builder: function (yargs) {
      return yargs
    },
    handler: function (argv) {
      preferCanonical = false
      if (argv.canonical) {
        preferCanonical = true
      }
      basePathOverride = undefined
      if (argv['base-path']) {
        basePathOverride = argv['base-path']
      }
      const Arborist = require('@npmcli/arborist')
      const arb = new Arborist()
      arb.loadActual().then(root => {
        printModule(root, 0)
      })
    }
  }
}
