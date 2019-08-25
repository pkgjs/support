'use strict'
const Ajv = require('ajv')
let ajv
let compiledSchema

const schema = module.exports.schema = require('./schema.json')

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
