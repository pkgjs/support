const { suite, test, before, after } = require('mocha');
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const childProcess = require('child_process');
const inquirer = require('inquirer');
const support = require('../index.js');

suite('support create command', () => {
  const supportCommand = path.join(__dirname, '..', 'bin', 'support');

  // for mocking inquirer
  let inquirerOrigin;
  before(() => {
    inquirerOrigin = inquirer.prompt;
  });

  test('call create with -y', (done) => {
    const { fixtureCwd, targetPackageJsonPath } = prepareFixtures('create-with-default-values');
    const targetPackageSupportPath = path.join(fixtureCwd, 'package-support.json');

    childProcess.exec(`${supportCommand} create -y`, { cwd: fixtureCwd }, (err, stdout, stderr) => {
      const resultSupportContent = fs.readFileSync(targetPackageSupportPath, 'utf-8').trim();
      const resultPackageJsonContent = fs.readFileSync(targetPackageJsonPath, 'utf-8').trim();
      const expectedSupportContent = fs.readFileSync(path.join(fixtureCwd, 'expexted-package-support.json'), 'utf-8').trim();
      const expectedPackageJsonContent = fs.readFileSync(path.join(fixtureCwd, 'expected-package.json'), 'utf-8').trim();

      assert.strictEqual(resultSupportContent, expectedSupportContent);
      assert.strictEqual(resultPackageJsonContent, expectedPackageJsonContent);

      cleanUpFixtures('create-with-default-values');
      done(err);
    });
  });

  suite('backing from FUNDING.yml', () => {
    test('FUNDING.yml not found', async () => {
      const { fixtureCwd } = prepareFixtures('create-with-funding-yml-no-file');
      inquirer.prompt = (questions) => Promise.resolve({
        targetVersion: 'lts',
        responseTime: 'time-permitting',
        backingType: 'get_from_funding'
      });

      process.chdir(fixtureCwd);

      try {
        await support.create(false);
      } catch (e) {
        assert.strictEqual(e.message.includes('Generating backing from FUNDING.yml failed'), true);
        cleanUpFixtures('create-with-funding-yml-no-file');
      }
    });

    test('FUNDING.yml present', async () => {
      const { fixtureCwd, targetPackageJsonPath } = prepareFixtures('create-with-funding-yml-positive');
      const targetPackageSupportPath = path.join(fixtureCwd, 'package-support.json');
      inquirer.prompt = (questions) => Promise.resolve({
        targetVersion: 'lts',
        responseTime: 'time-permitting',
        backingType: 'get_from_funding'
      });

      process.chdir(fixtureCwd);

      await support.create(false);

      const resultSupportContent = fs.readFileSync(targetPackageSupportPath, 'utf-8').trim();
      const resultPackageJsonContent = fs.readFileSync(targetPackageJsonPath, 'utf-8').trim();
      const expectedSupportContent = fs.readFileSync(path.join(fixtureCwd, 'expexted-package-support.json'), 'utf-8').trim();
      const expectedPackageJsonContent = fs.readFileSync(path.join(fixtureCwd, 'expected-package.json'), 'utf-8').trim();

      assert.strictEqual(resultSupportContent, expectedSupportContent);
      assert.strictEqual(resultPackageJsonContent, expectedPackageJsonContent);

      cleanUpFixtures('create-with-funding-yml-positive');
    });
  });

  suite('backing from package.json funding field', () => {
    test('funding field not found', async () => {
      const { fixtureCwd } = prepareFixtures('create-with-package-json-funding');
      inquirer.prompt = (questions) => Promise.resolve({
        targetVersion: 'lts',
        responseTime: 'time-permitting',
        backingType: 'get_from_funding_package_json'
      });

      process.chdir(fixtureCwd);

      try {
        await support.create(false);
      } catch (e) {
        assert.strictEqual(e.message.includes('Funding field not found in package.json'), true);
        cleanUpFixtures('create-with-package-json-funding');
      }
    });

    test('funding field as array', async () => {
      const { fixtureCwd, targetPackageJsonPath } = prepareFixtures('create-with-package-json-funding-positive');
      const targetPackageSupportPath = path.join(fixtureCwd, 'package-support.json');
      inquirer.prompt = (questions) => Promise.resolve({
        targetVersion: 'lts',
        responseTime: 'time-permitting',
        backingType: 'get_from_funding_package_json'
      });

      process.chdir(fixtureCwd);

      await support.create(false);

      const resultSupportContent = fs.readFileSync(targetPackageSupportPath, 'utf-8').trim();
      const resultPackageJsonContent = fs.readFileSync(targetPackageJsonPath, 'utf-8').trim();
      const expectedSupportContent = fs.readFileSync(path.join(fixtureCwd, 'expexted-package-support.json'), 'utf-8').trim();
      const expectedPackageJsonContent = fs.readFileSync(path.join(fixtureCwd, 'expected-package.json'), 'utf-8').trim();

      assert.strictEqual(resultSupportContent, expectedSupportContent);
      assert.strictEqual(resultPackageJsonContent, expectedPackageJsonContent);

      cleanUpFixtures('create-with-package-json-funding-positive');
    });

    test('funding field as string', async () => {
      const { fixtureCwd, targetPackageJsonPath } = prepareFixtures('create-with-package-json-funding-string-positive');
      const targetPackageSupportPath = path.join(fixtureCwd, 'package-support.json');
      inquirer.prompt = (questions) => Promise.resolve({
        targetVersion: 'lts',
        responseTime: 'time-permitting',
        backingType: 'get_from_funding_package_json'
      });

      process.chdir(fixtureCwd);

      await support.create(false);

      const resultSupportContent = fs.readFileSync(targetPackageSupportPath, 'utf-8').trim();
      const resultPackageJsonContent = fs.readFileSync(targetPackageJsonPath, 'utf-8').trim();
      const expectedSupportContent = fs.readFileSync(path.join(fixtureCwd, 'expexted-package-support.json'), 'utf-8').trim();
      const expectedPackageJsonContent = fs.readFileSync(path.join(fixtureCwd, 'expected-package.json'), 'utf-8').trim();

      assert.strictEqual(resultSupportContent, expectedSupportContent);
      assert.strictEqual(resultPackageJsonContent, expectedPackageJsonContent);

      cleanUpFixtures('create-with-package-json-funding-string-positive');
    });
  });

  // restore
  after(() => {
    inquirer.prompt = inquirerOrigin;
    process.chdir(__dirname);
  });
});

function prepareFixtures (fixtureFolderName) {
  const fixtureCwd = path.join(__dirname, 'fixtures', 'create', fixtureFolderName);
  const sourcePackageJsonPath = path.join(fixtureCwd, 'default-package.json');
  const targetPackageJsonPath = path.join(fixtureCwd, 'package.json');
  fs.copySync(sourcePackageJsonPath, targetPackageJsonPath);

  return {
    fixtureCwd,
    sourcePackageJsonPath,
    targetPackageJsonPath
  };
}

function cleanUpFixtures (fixtureFolderName) {
  const fixtureCwd = path.join(__dirname, 'fixtures', 'create', fixtureFolderName);
  const targetPackageJsonPath = path.join(fixtureCwd, 'package.json');
  const targetPackageSupportPath = path.join(fixtureCwd, 'package-support.json');
  fs.removeSync(targetPackageJsonPath);
  fs.removeSync(targetPackageSupportPath);
}
