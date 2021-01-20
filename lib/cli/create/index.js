'use strict';

// module "create" - containing 'support create' command functionality
const jsonFile = require('json-file-plus');
const path = require('path');
const support = require('../../../index.js');
const inquirer = require('inquirer');
const supportFileTemplate = require('./create-support-template.json');
const yaml = require('js-yaml');
const fs = require('fs-extra');

const backingStatusesEnum = Object.freeze({
  NONE: 'none',
  HOBBY: 'hobby',
  GET_FROM_FUNDING_YML: 'get_from_funding',
  GET_FROM_FUNDING_PACKAGE_JSON: 'get_from_funding_package_json'
});

module.exports = async function create (useDefaultValues) {
  // check package.json for support info presence
  const supportInfoFound = await isSupportInfoExist();
  if (supportInfoFound) {
    throw new Error('Support info already present in package.json');
  }

  // default
  let responses = {
    targetVersion: 'lts',
    responseTime: 'time-permitting',
    backingType: backingStatusesEnum.HOBBY
  };

  if (!useDefaultValues) {
    // if no support info exist - collect data from user
    responses = await inquirer.prompt(getInteractiveQuestions());
  }

  const resultSupportObject = await prepareSupportObject(responses);

  await writeGeneratedSupportInfo(resultSupportObject);

  // update docs
  // logs
};

const getInteractiveQuestions = module.exports.getInteractiveQuestions = () => {
  const responseTypes = support.getSupportResponseTypesList();
  const defaultResponseTypeIndex = responseTypes.indexOf('time-permitting');

  return [
    {
      type: 'list',
      name: 'targetVersion',
      message: 'What versions of Node.js does your package support?',
      choices: support.getNodeJsTargetVersionsList()
    },
    {
      type: 'list',
      name: 'responseTime',
      message: 'How quickly you are able to respond to issues?',
      choices: responseTypes,
      default: defaultResponseTypeIndex
    },
    {
      type: 'list',
      name: 'backingType',
      message: 'What type of backing your package accepts?',
      choices: [
        backingStatusesEnum.NONE,
        backingStatusesEnum.HOBBY,
        {
          name: 'Get values from .github/FUNDING.yml',
          value: backingStatusesEnum.GET_FROM_FUNDING_YML
        },
        {
          name: 'Get values from package.json funding field',
          value: backingStatusesEnum.GET_FROM_FUNDING_PACKAGE_JSON
        }
      ],
      default: 1
    }
  ];
};

const isSupportInfoExist = module.exports.isSupportInfoExist = async () => {
  const packageJsonFile = await getPackageJsonFile();
  const supportValue = await packageJsonFile.get('support');

  return !!supportValue;
};

const prepareSupportObject = module.exports.prepareSupportObject = async (supportValues) => {
  const version = supportFileTemplate.versions[0];

  // set target Node.js version
  version.target.node = supportValues.targetVersion;
  // set support response time
  version.response.type = supportValues.responseTime;

  if (supportValues.backingType === backingStatusesEnum.GET_FROM_FUNDING_YML) {
    // build backing object based on FUNDING.yml
    version.backing.donations = await buildBackingFromFundingYml();
  } else if (supportValues.backingType === backingStatusesEnum.GET_FROM_FUNDING_PACKAGE_JSON) {
    // build backing object based on funding field in package.json
    version.backing.donations = await buildBackingFromPackageJson();
  } else {
    // use value from user
    version.backing[supportValues.backingType] = '';
  }

  return supportFileTemplate;
};

const buildBackingFromFundingYml = module.exports.buildBackingFromFundingYml = async () => {
  try {
    const fundingPlatformsURLs = {
      github: 'https://github.com/',
      patreon: 'https://www.patreon.com/',
      open_collective: 'https://opencollective.com/',
      ko_fi: 'https://ko-fi.com/',
      tidelift: 'https://tidelift.com/funding/github/',
      community_bridge: 'https://funding.communitybridge.org/projects/',
      liberapay: 'https://liberapay.com/',
      issuehunt: 'https://issuehunt.io/r/',
      otechie: 'https://otechie.com/',
      custom: ''
    };
    const backingResult = [];
    const fundingPath = path.join(process.cwd(), '.github', 'FUNDING.yml');
    const fundingYml = yaml.load(await fs.readFile(fundingPath, 'utf8'));

    for (const platform in fundingYml) {
      if (Object.hasOwnProperty.call(fundingYml, platform) && fundingYml[platform]) {
        const username = fundingYml[platform];

        if (Array.isArray(username)) {
          username.forEach(el => {
            backingResult.push(`${fundingPlatformsURLs[platform]}${el}`);
          });
        } else {
          backingResult.push(`${fundingPlatformsURLs[platform]}${username}`);
        }
      }
    }

    return backingResult;
  } catch (e) {
    throw new Error(`Generating backing from FUNDING.yml failed - ${e.message}`);
  }
};

const buildBackingFromPackageJson = module.exports.buildBackingFromPackageJson = async () => {
  try {
    const packageJsonFile = await getPackageJsonFile();
    const funding = await packageJsonFile.get('funding');
    const supportBackingResult = [];

    if (!funding) {
      throw new Error('Funding field not found in package.json');
    }

    const processFundingValue = fundingValue => {
      let fundingUrl = '';

      if (typeof fundingValue === 'string') {
        fundingUrl = fundingValue;
      } else if (typeof fundingValue === 'object' && fundingValue.url) {
        fundingUrl = fundingValue.url;
      }

      if (fundingUrl) {
        supportBackingResult.push(fundingUrl);
      }
    };

    if (Array.isArray(funding)) {
      funding.forEach(el => {
        processFundingValue(el);
      });
    } else {
      processFundingValue(funding);
    }

    return supportBackingResult;
  } catch (e) {
    throw new Error(`Generating backing from package.json failed - ${e.message}`);
  }
};

const writeGeneratedSupportInfo = module.exports.writeGeneratedSupportInfo = async (supportObj) => {
  try {
    const packageJsonFile = await getPackageJsonFile();

    const writeToPackageJson = () => {
      packageJsonFile.set({
        support: true
      });

      return packageJsonFile.save();
    };

    const writeSupportFile = () => {
      return fs.writeFile(
        path.join(process.cwd(), 'package-support.json'),
        JSON.stringify(supportObj, null, 2),
        'utf-8'
      );
    };

    return Promise.all([
      writeToPackageJson(),
      writeSupportFile()
    ]);
  } catch (e) {
    throw new Error(`Writing support info failed - ${e.message}`);
  }
};

async function getPackageJsonFile () {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  return await jsonFile(packageJsonPath);
}
