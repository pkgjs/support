'use strict'
const path = require('path')
const fs = require('fs')
const normalizeUrl = require('normalize-url')
const Ajv = require('ajv')
const got = require('got')

let ajv
let compiledSchema

const schema = module.exports.schema = require('./schema.json')

module.exports.defaultPackageSupport = 'package-support.json'

module.exports.validate = (obj) => {
  if (!ajv) {
    ajv = new Ajv()
    compiledSchema = ajv.compile(schema)
  }

  const validates = compiledSchema(obj)
  if (!validates) {
    const err = new Error('Validation Failed')
    err.validationErrors = compiledSchema.errors
    err.validationSchema = compiledSchema.schema
    throw err
  }
  return true
}

// extract the URL for the support info from the pkg info
module.exports.getRemoteSupportInfoUrl = (repository, supportPath) => {
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

// the path should not try to escape the root as it
// is specified to be a relative path
module.exports.sanitizePath = (basePath, inputPath, basePathOverride) => {
  const effectiveBasePath = path.normalize(basePathOverride || basePath)
  const candidatePath = path.join(basePath, inputPath)
  let ret = path.basename(inputPath)
  if (candidatePath.indexOf(effectiveBasePath) === 0) {
    // inputPath did not try to escape
    ret = inputPath
  }
  return ret
}

async function resolveSupportInfo (supportInfo, fetchCanonical) {
  supportInfo.resolved = false
  if (fetchCanonical) {
    const url = normalizeUrl(supportInfo.url
      .replace('blob', '')
      .replace('github.com', 'raw.githubusercontent.com'))
    try {
      const result = await got(url)
      supportInfo.contents = result.body
      supportInfo.resolved = true
    } catch (e) {
      supportInfo.error = e
    }
  }
}

module.exports.getSupportData = async (pkg, pkgPath, preferCanonical, basePathOverride, fetchCanonical) => {
  const supportInfo = { contents: 'unknown', url: '', resolved: true }
  if (pkg.support) {
    if ((pkg.support === true) || (typeof pkg.support === 'string')) {
      const supportInfoName = (pkg.support === true)
        ? module.exports.defaultPackageSupport : module.exports.sanitizePath(pkgPath, pkg.support, basePathOverride)
      const localPath = path.join(pkgPath, supportInfoName)
      if (!preferCanonical && fs.existsSync(localPath)) {
        supportInfo.contents = fs.readFileSync(localPath)
        supportInfo.resolved = true
      } else {
        supportInfo.url = module.exports.getRemoteSupportInfoUrl(pkg.repository, supportInfoName)
        await resolveSupportInfo(supportInfo, fetchCanonical)
      }
    } else if (typeof pkg.support === 'object') {
      const supportInfoName = pkg.support.path ? pkg.support.path : module.exports.defaultPackageSupport
      supportInfo.url = module.exports.getRemoteSupportInfoUrl(pkg.support.repository, supportInfoName)
      await resolveSupportInfo(supportInfo, fetchCanonical)
    }
  }
  return supportInfo
}
