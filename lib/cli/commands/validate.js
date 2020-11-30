'use strict';

const fs = require('fs-extra');
const path = require('path');
const support = require('../../../index.js');

const errorInSupportElement = 'Error in support element in package.json';

module.exports = function (opts) {
  return {
    command: 'validate',
    desc: 'Validate support information schema',
    builder: function (yargs) {
      return yargs;
    },
    handler: async function (argv) {
      let userPackageJson;
      try {
        userPackageJson = await fs.readJSON(path.join(process.cwd(), 'package.json'));
      } catch (error) {
        argv.log.error(error);
        return;
      }

      let supportData = userPackageJson.support;
      if ((supportData === false) || supportData) {
        // first validate that the supportData is correct
        if ((supportData !== true) && !(typeof supportData === 'string') && !(supportData instanceof Object)) {
          console.error(errorInSupportElement);
          console.error('Support element should either be true or an Object matching the required schema');
          return;
        }

        try {
          support.validateSupportElement({ support: supportData }, true);
        } catch (e) {
          console.error(errorInSupportElement);
          console.error(e.prettyValidationErrors);
          return;
        }

        // support element was ok so validate the data itself
        supportData = await support.getSupportData(userPackageJson,
          path.join(process.cwd()),
          argv.canonical,
          argv['base-path'],
          argv.fetch);
        if (supportData.resolved) {
          try {
            const supportDataJSON = JSON.parse(supportData.contents);
            try {
              const result = support.validate(supportDataJSON, true);
              if (result) {
                console.log('Your support information is valid!');
                return;
              }
            } catch (e) {
              console.error('Error in support JSON');
              console.error(e.prettyValidationErrors);
            }
          } catch (e) {
            console.error('Your support information is not properly formed');
            console.error(e.message);
          }
        } else {
          console.error('support info not resolved: ' + supportData.url);
        }
      } else {
        console.error('no support info');
      }
    }
  };
};
