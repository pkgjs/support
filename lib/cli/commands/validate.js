'use strict'

const fs = require('fs-extra')
const path = require('path')
const pathContains = require('contains-path')
const Ajv = require('ajv')

const supportSchema = require('./../../../schema.json')

module.exports = function (opts) {
  return {
    command: 'validate',
    desc: 'Validate support information schema',
    builder: function (yargs) {
      return yargs
    },
    handler: async function (argv) {
      let userPackageJson
      let packageJsonPath
      try {
        const jsonFile = path.join(process.cwd(), 'package.json')
        packageJsonPath = path.dirname(jsonFile)
        userPackageJson = await fs.readJSON(jsonFile)
      } catch (error) {
        argv.log.error(error)
        return
      }

      const ajv = new Ajv({
        // coerceTypes: true,
        useDefaults: true,
        removeAdditional: true,
        allErrors: true,
        nullable: true
      })

      let { support } = userPackageJson

      if (support === true) {
        support = await fs.readJSON(path.join(packageJsonPath, 'package-support.json'))
      } else if (typeof support === 'string') {
        const p = path.join(packageJsonPath, support)
        if (!pathContains(packageJsonPath, p)) {
          throw new Error('Support string path must be contained in cwd')
        }
        support = await fs.readJSON()
      } else if (typeof support === 'object') {
        // TODO check for the repository obj and get the support info via HTTP:
        // https://docs.npmjs.com/files/package.json#repository
      }

      const validate = ajv.compile(supportSchema)
      const result = validate(support)
      if (result) {
        argv.log.info('Your support information is valid!')
        return
      }
      // TODO show better errors
      argv.log.error('validate: ', validate.errors)
    }
  }
}
