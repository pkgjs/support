'use strict'
const path = require('path')
const fs = require('fs')
const defaultPackageSupport = 'package-support.json'

// extract the URL for the supetort info from the pkg info
function getRemoteSupportInfoUrl (pkg, supportPath) {
  const gitHubInitialPath = '/blob/master/'

  if (pkg.repository && (pkg.repository.type === 'git')) {
    let remoteURL = pkg.repository.url
    const trailerLocation = remoteURL.indexOf('.git')
    if (trailerLocation >= 0) {
      remoteURL = remoteURL.substring(0, trailerLocation) +
                  gitHubInitialPath + supportPath
    }
    return remoteURL
  } else {
    return 'unknown'
  }
}

// the path should not try to espace the root as it
// is specified to be a relative path
function sanitizePath (basePath, inputPath) {
  const candidatePath = path.join(basePath, inputPath)
  let ret = ''
  if (candidatePath.indexOf(basePath) === 0) {
    // inputPath did not try to escape
    ret = inputPath
  }
  return ret
};

// print out the information for a module and its
// children
function printModule (module, depth) {
  const pkg = module.package
  const moduleInfo = `${pkg.name}(${pkg.version})`

  // print out the support info for this module
  let supportInfo = 'unknown'
  if (pkg.support) {
    if ((pkg.support === true) || (typeof pkg.support === 'string')) {
      const supportInfoName = (pkg.support === true)
        ? defaultPackageSupport : sanitizePath(module.path, pkg.support)
      const localPath = path.join(module.path, supportInfoName)
      if (fs.existsSync(localPath)) {
        supportInfo = fs.readFileSync(localPath)
      } else {
        supportInfo = getRemoteSupportInfoUrl(pkg, supportInfoName)
      }
    }
  }
  console.log(`${' '.repeat(2 * (depth + 1))}${moduleInfo} - ${supportInfo}`)

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
        printModule(root, 0)
      })
    }
  }
}
