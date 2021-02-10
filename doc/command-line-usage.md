# Using the package support tool from the command line

There are 2 main use cases for the package support tool

* Package Maintainers - document and communicate expectations to consumers
* Package Consumers - understand more about their key dependencies and where they 
  should invest.

The sections which follow document the usage/options of interest for each use
case.

Once you have node.js installed (version 10.x or later) you can
run the support command directly using npx or optionally npm install the
package and add the `bin` directory to your path. In either case
you can run the support tool using `npx @pkgjs/support`.

## Package Consumers

The support tool helps package consumers review and understand the
package support information provided by maintainers. See
[Package-support.md](https://github.com/nodejs/package-maintenance/blob/HEAD/docs/PACKAGE-SUPPORT.md)
which documents the suggested best practice and the specific format of the
package support information.

Package consumers use the `show` command to display the support information
provided by package maintainers.

It is understood that this is only the most basic support that can be provided
to the consumer. The current focus for the support tool is to provide features
to encourage/support maintainers to add the package support info to their packages.
In the future more advanced options can be added to the show command to provide 
more deduplicated or focussed views of the information available.

The general flow is:

* install the package to display package support information for
* cd into the directory which contains the root package
* execute `npx @pkgjs/support show`

For example once node.js and the package support tool are installed to show
the package support for a module (the support module itself in this example):

```shell
npm install @pkgjs/support
cd node_modules/@pkgjs/support
npx @pkgjs/support show
```

with a stripped down version of the the output to make it more easily readable being:

```shell
  @pkgjs/support(0.0.2) - { "versions": [ { "version": "*", "target": { "node": "supported" }, "response": { "type": "time-permitting" }, "backing": { "hobby": "https://github.com/pkgjs/support" } } ] }
    @npmcli/arborist(0.0.0) - unknown
      @npmcli/installed-package-contents(1.0.5) - unknown
        npm-bundled(1.1.1) - unknown
        npm-normalize-package-bin(1.0.1) - unknown
      @npmcli/map-workspaces(0.0.0-pre.1) - unknown
        glob(7.1.6) - unknown
          fs.realpath(1.0.0) - unknown
          inflight(1.0.6) - unknown
            wrappy(1.0.2) - unknown

...

      y18n(4.0.0) - unknown
      yargs-parser(18.1.3) - unknown
        camelcase(5.3.1) - unknown
```

The command shows the support information for the tree of packages starting from the package being assessed. 
In this case it ONLY shows support info for the `support` package as the support information has not
been added to any of the dependent packages yet.

The support info shown is:

```shell
  @pkgjs/support(0.0.2) - { "versions": [ { "version": "*", "target": { "node": "supported" }, "response": { "type": "time-permitting" }, "backing": { "hobby": "https://github.com/pkgjs/support" } } ] }
```

For the rest of the modules it simply shows `unknown` as the packages do not yet provide it.

The package support tool prefers support information which is available locally within the package after installation.
This is to allow offline use. The documented best practices for adding support info are written to maximize
the likelyhood that at reasonably up to date copy of the support information is provided as part of the npm
install.

If the consumer wishes to ignore the local information and always use the canonical version of the support information
they can add the `--canonical` option to the command. Instead of using the local support info, if available, it will
display the URL from which the canonical information can be retrieved. This is the same behavior when 
as when the package.json specifies that there is support info but it is not available in the npm package itself.

For example:

```
npx @pkgjs/support show --canonical
```


```
@pkgjs/support(0.0.2) - https://github.com/pkgjs/support/blob/HEAD/package-support.json
    @npmcli/arborist(0.0.0) - unknown
      @npmcli/installed-package-contents(1.0.5) - unknown
        npm-bundled(1.1.1) - unknown
        npm-normalize-package-bin(1.0.1) - unknown
      @npmcli/map-workspaces(0.0.0-pre.1) - unknown
        glob(7.1.6) - unknown
          fs.realpath(1.0.0) - unknown
          inflight(1.0.6) - unknown
            wrappy(1.0.2) - unknown

...

      y18n(4.0.0) - unknown
      yargs-parser(18.1.3) - unknown
        camelcase(5.3.1) - unknown
```

where the support info is listed as 
`https://github.com/pkgjs/support/blob/HEAD/package-support.json`

The --canonical option does not automatically pull the remote information so that the
consumer can choose to find the locations without automatically triggering a number of
remote calls.

If the consumer wants to have the canonical information pulled automatically they can
add the `--fetch` option which will pull the remote support information when necessary.


The following command/options will always show the most up to date package support information
at the cost of fetching from remote sites.
```
npx @pkgjs/support show --canonical --fetch
```

`--fetch` can also be used without `--canonical` in which case the remote support
information will only be pulled when it is not provided as part of the npm package.

Local support information may be available locally but outside of the package itself.
This may be the case if you are using mono-repo and sharing the support file.
In this case, by default, the support tool will not read/display files outside of the
package itself to avoid potential security issues. In order to allow the tool to display
support info in these cases you can use the `--base-path` option to specify the top
most root from which package support files can be read:

```shell
npx @pkgjs/support --base-path=${cwd}/../.. show
```

In the case where the required base path is not specified, and the file is outside
of the package, the tool will simply print the url from which the support information
can be obtained versus displaying it. For example:

```
@pkgjs/support-show-local-escape-ok(0.0.1) - https://github.com/pkgjs/support/blob/HEAD/my-support-info.json
```

where the `support` entry was:

```json
"support": "../../fixtures/my-support-info.json",
```

## Package Maintainers

Package maintainers want to add and manage the support information for their modules.

[Integration into package.json](https://github.com/nodejs/package-maintenance/blob/HEAD/docs/PACKAGE-SUPPORT.md#integration-into-packagejson)
explains the options for providing support info and what goes into the package.json for
each case.

In order to add support information a maintainer can use `create` command.

`npx @pkgjs/support create` is run from the directory that contains the `package.json` for the package.
It will ask few questions (e.g. what Node.js version your package support or how quickly you are able to respond to issues)
in order to build proper `package-support.json` file.
This command can also build [`backing`](https://github.com/nodejs/package-maintenance/blob/HEAD/docs/PACKAGE-SUPPORT.md#support-backing) field based on your `.github/FUNDING.yml` file or `"funding"` field from `package.json`.

`create` command will create `package-support.json` file in current working directory for you
and will update `package.json` in order to set `"support: true"` field.

`create` command has `-y|--yes` flag which does pretty much the same as `npm init -y` but with package support info.
It will create `package-support.json` file with default commonly-used values.
This can be used in case you want to get some basic scaffolding and edit file manually.

```shell
npx @pkgjs/support create -y
```

In case package support information was added manually - `@pkgjs/support` also provides
ability to validate this infomation automatically according to official schema.

The `validate` command checks that both the information added to the package.json
and the file containing the support info (package-support.json by default) is valid.

`npx @pkgjs/support validate` is run from the directory that contains the `package.json` for the package.
Depending the how the `support` section in the package.json is configured validate will:

* validate the format of the `support` section in the package.json conforms to the
documentation in [Integration into package.json](https://github.com/nodejs/package-maintenance/blob/HEAD/docs/PACKAGE-SUPPORT.md#integration-into-packagejson)
* calculate the file which contains the support info
* if the file is available locally, use that data unless the `--canonical`
  option was specified.
* if the file is not available locally or `--canonical` was specified
  * if --fetch was provided as an option, fetch the file and use that data
  * otherwise simply print that the file was not resolved and the url from 
  where it can be retrieved.

If both the entry in the package.json and the contents of the file with the package support
information is validate you'll see the following output:

```shell
Your support information is valid!
```

If the support information is not available locally or you have specified
`--canonical` without `--fetch` you'll see something like:

```shell
support info not resolved: https://github.com/pkgjs/support/blob/HEAD/package-support.json
```

in this case the file is local to the package, but --canonical was specified. The same
would be shown if the info in the package.json file pointed to a file a different github 
repository.

You might also see this if the file with the support information is outside of the
the package itself, but still available locally. This may be the case if you
are using mono-repo and sharing the support file. An example would be:

```json
"support": "../../fixtures/my-support-info.json",
```

This is the case because, by default, the support tool will not read/display files outside of the
package itself in order to avoid potential security issues. In order to allow the tool to validate
support info in these cases you can use the `--base-path` option to specify the top
most root from which package support files can be read:

```shell
npx @pkgjs/support --base-path=${cwd}/../.. validate
```
