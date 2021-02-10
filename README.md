# Package Support

[![NPM Version](https://img.shields.io/npm/v/@pkgjs/support.svg)](https://npmjs.org/package/@pkgjs/support)
[![NPM Downloads](https://img.shields.io/npm/dm/@pkgjs/support.svg)](https://npmjs.org/package/@pkgjs/support)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/standard/standard)
[![CI Test](https://github.com/pkgjs/support/workflows/Test/badge.svg)](https://github.com/pkgjs/support/actions)

![support backing](https://img.shields.io/badge/support%20backing-HOBBY-blue.svg)
![support target](https://img.shields.io/badge/support%20target-LTS-red.svg)
![support response-def](https://img.shields.io/badge/support%20response-best--effort-yellow.svg)

When an author releases an Open Source package there are many different levels
of support they may intend to provide.  The [Node.js Package Maintenance Working Group](https://github.com/nodejs/package-maintenance)
is working to propose [a spec](https://github.com/nodejs/package-maintenance/blob/HEAD/docs/PACKAGE-SUPPORT.md) to help package authors declare their intended support goals.  This package provides
some tooling around working with the format proposed.

This repository is managed by the [Package Maintenance Working Group](https://github.com/nodejs/package-maintenance), see [Governance](https://github.com/nodejs/package-maintenance/blob/HEAD/Governance.md).

## Command line usage

A command line tool is provided which supports the following commands:

* show - show the support info for the package tree.
* validate - validate support info for a package, to be used by a 
  maintainer before publishing.
* create - setup a support declaration for a package.

These commands support the following options:

* --canonical  - prefer canonical data over package support data
  that may be available locally. Default is `false`.
* --fetch - if local support data is not available or --canonical
  is specified, fetch the support data from the remote canonical
  location when needed. Default is `false`
* --base-path - directory root within which the tool can read/validate
  package support files. The default is the directory from which the
  package.json for the top level package was read.

More details and explanation of the use cases for these
commands is provided in [command line usage](./doc/command-line-usage.md).

The simplest way to run the tool is to simply run:

```
npx @pkgjs/support show
```

```
npx @pkgjs/support validate
```

```
npx @pkgjs/support create
```
