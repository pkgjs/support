'use strict'

const fs = require('fs-extra')
const path = require('path')
const support = require('../../../index.js')

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

      let supportData = userPackageJson.support
      if (supportData === true) {
        supportData = support.getSupportData(userPackageJson, path.join(process.cwd()), false, undefined)
        if (supportData.resolved) {
          const supportDataJSON = JSON.parse(supportData.contents)
          try {
            const result = support.validate(supportDataJSON)
            if (result) {
              argv.log.info('Your support information is valid!')
              return
            }
          } catch (e) {
            argv.log.error('validate: ', e.validationErrors)
          }
        } else {
          argv.log.info('support info not resolved:' + supportData.url)
        }
      } else {
        argv.log.info('no support info')
      }
    }
  }
}
