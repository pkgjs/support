'use strict';
const { before, suite, test, run } = require('mocha');
const path = require('path');
const util = require('util');
const fs = require('fs-extra');
const Ajv = require('ajv');
const support = require('..');
const childProcess = require('child_process');
const assert = require('assert')

// Delay so we can load in the example files
;(async () => {
  const examplesDir = path.join(__dirname, '..', 'examples');
  const examples = await fs.readdir(examplesDir);

  suite('package support schema', async () => {
    let ajv;

    before(() => {
      ajv = new Ajv();
    });

    test('has a valid json schema', () => {
      ajv.compile(support.schema);
      const validates = ajv.validateSchema(support.schema);
      if (!validates) {
        console.error(util.inspect(ajv.errors, false, null, true));
        throw new Error('Schema validation failed');
      }
    });

    examples.forEach((file) => {
      test(`validate examples: ${file}`, async () => {
        const json = await fs.readJSON(path.join(examplesDir, file));
        try {
          support.validate(json);
        } catch (e) {
          console.error(util.inspect(e, false, null, true));
          throw e;
        }
      });
    });
  });

  const cliTestsDir = path.join(__dirname, 'cli');
  const cliTests = await fs.readdir(cliTestsDir);
  suite('cli tests', async () => {
    const supportCommand = path.normalize('../../../bin/support');
    cliTests.forEach((testDir) => {
      test(`cli test: ${testDir}`, (done) => {
        const cwd = path.join(__dirname, 'cli', testDir);
        const rawCommand = fs.readFileSync(path.join(cwd, 'command')).toString();
        const command = rawCommand.replace(/\$\{cwd\}/g, cwd);
        const expected = safeReadFile(path.join(cwd, 'expected'));
        const expectedErr = safeReadFile(path.join(cwd, 'expected-errors'));

        childProcess.exec(`${supportCommand} ${command}`, { cwd: cwd }, (err, stdout, stderr) => {
          assert.strictEqual(stdout, expected);
          assert.strictEqual(stderr, expectedErr);
          done(err);
        });
      });
    });
  });

  run();
})();

function safeReadFile (filePath) {
  try {
    return fs.readFileSync(filePath).toString();
  } catch (error) {
    if (error.code === 'ENOENT') {
      return '';
    }
    throw error;
  }
}
