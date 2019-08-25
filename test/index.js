'use strict'
const { before, suite, test, run } = require('mocha')
const path = require('path')
const util = require('util')
const fs = require('fs-extra')
const Ajv = require('ajv')
const support = require('..')

// Delay so we can load in the example files
;(async () => {
  const examplesDir = path.join(__dirname, '..', 'examples')
  const examples = await fs.readdir(examplesDir)

  suite('package support schema', async () => {
    let ajv

    before(() => {
      ajv = new Ajv()
    })

    test('has a valid json schema', () => {
      ajv.compile(support.schema)
      const validates = ajv.validateSchema(support.schema)
      if (!validates) {
        console.error(util.inspect(ajv.errors, false, null, true))
        throw new Error('Schema validation failed')
      }
    })

    examples.forEach((file) => {
      test(`validate examples: ${file}`, async () => {
        const json = await fs.readJSON(path.join(examplesDir, file))
        try {
          support.validate(json)
        } catch (e) {
          console.error(util.inspect(e, false, null, true))
          throw e
        }
      })
    })
  })

  run()
})()
