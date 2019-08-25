# Package Support

[![NPM Version](https://img.shields.io/npm/v/@pkgjs/support.svg)](https://npmjs.org/package/@pkgjs/support)
[![NPM Downloads](https://img.shields.io/npm/dm/@pkgjs/support.svg)](https://npmjs.org/package/@pkgjs/support)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/standard/standard)
[![CI Test](https://github.com/pkgjs/support/workflows/Test/badge.svg)](https://github.com/pkgjs/support/actions)

![support backing](https://img.shields.io/badge/support%20backing-HOBBY-blue.svg)
![support target](https://img.shields.io/badge/support%20target-LTS-red.svg)
![support response-def](https://img.shields.io/badge/support%20response-best--effort-yellow.svg)

When an author releases an Open Source package there are many different levels
of support they may intend to provide.  The [Node.js Package Maintenence Working Group](https://github.com/nodejs/package-maintenance)
is working to propse [a spec](https://github.com/nodejs/package-maintenance/issues/220) to help package authors delcare their intended support goals.  This package provides
some tooling around working with the format proposed.

## Project Status

The spec proposal is currently being reviewed and is open for feedback.  As we have not
finalized the documentation, this package is similarly in draft.  Until the spec is
considered complete I will hold off on publishing `1.0.0`.

## Usage

```
$ npm i @pkgjs/support
```

```javascript
const support = require('@pkgjs/support')

// Load in a projects package.json
const pkgJson = require('./package.json')

// The current spec says that the "support" key will
// be an object with the support schema
try {
  support.validate(pkgJson.support)
} catch (e) {
  // Validateion failure
  // The error is annotated with the
  // errors and schema from `ajv`
  console.error(e)
  console.log(e.validateionErrors)
  console.log(e.validateionSchema)
}
```
