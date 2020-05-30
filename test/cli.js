
'use strict'
const { suite, test, run } = require('mocha')
const assert = require('assert')
const Loggerr = require('loggerr')
const spy = require('through2-spy')
const cli = require('../lib/cli')

suite('cli validate', async () => {
  test('check this support information', (done) => {
    const logChecker = spy({ wantStrings: true }, function (chunk) {
      try {
        assert.ok(/information is valid/.test(chunk))
        done()
      } catch (error) {
        done(error)
      }
    })

    cli({
      logger: () => {
        return new Loggerr({
          formatter: 'cli',
          streams: Loggerr.levels.map(() => logChecker)
        })
      }
    })(['validate'])
  })

  run()
})
