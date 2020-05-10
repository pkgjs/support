'use strict'
const path = require('path')
const fs = require('fs')
const normalizeUrl = require('normalize-url')
const defaultPackageSupport = 'package-support.json'

// extract the URL for the supetort info from the pkg info
function getRemoteSupportInfoUrl (repository, supportPath) {
  const gitHubInitialPath = '/blob/master/'

  if (repository && (repository.type === 'git')) {
    const directory = repository.directory || ''
    let remoteURL = repository.url
    const trailerLocation = remoteURL.indexOf('.git')
    if (trailerLocation >= 0) {
      remoteURL = remoteURL.substring(0, trailerLocation) +
                  gitHubInitialPath + '/' + directory +
                  '/' + supportPath
    }
    return normalizeUrl(remoteURL)
  } else {
    return 'unknown'
  }
}

// the path should not try to espace the root as it
// is specified to be a relative path
function sanitizePath (basePath, inputPath) {
  const effectiveBasePath = path.normalize(basePathOverride || basePath)
  const candidatePath = path.join(basePath, inputPath)
  let ret = path.basename(inputPath)
  if (candidatePath.indexOf(effectiveBasePath) === 0) {
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
      if (!preferCanonical && fs.existsSync(localPath)) {
        supportInfo = fs.readFileSync(localPath)
      } else {
        supportInfo = getRemoteSupportInfoUrl(pkg.repository, supportInfoName)
      }
    } else if (typeof pkg.support === 'object') {
      const supportInfoName = pkg.support.path ? pkg.support.path : defaultPackageSupport
      supportInfo = getRemoteSupportInfoUrl(pkg.support.repository, supportInfoName)
    }
  }
  console.log(`${' '.repeat(2 * (depth + 1))}${moduleInfo} - ${supportInfo}`)

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
