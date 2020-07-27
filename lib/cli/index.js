'use strict';
const yargs = require('yargs/yargs');
const path = require('path');
const Loggerr = require('loggerr');

module.exports = (options = {}) => {
  // Defaults cli configuration
  const opts = Object.assign({
    commandsDir: path.join(__dirname, 'commands'),
    usage: '$0 <command> [options]',
    silentLevel: -1,
    verboseLevel: 'info',
    logLevel: 'error',
    logger: (level) => {
      return new Loggerr({
        formatter: 'cli',
        level: level
      });
    },
    fail: (msg) => {
      log.error(msg);
      console.log();
      cli.showHelp();
      process.exit(1);
    }
  }, options);

  // The log instance
  const log = opts.logger(opts.logLevel);

  // Setup yargs cli instance
  const cli = yargs()

    // Log related flags
    .option('log-level', {
      alias: 'l',
      describe: 'Set the log level',
      type: 'string',
      group: 'Logging:',
      defaultDescription: opts.logLevel
    })
    .option('silent', {
      alias: 'S',
      describe: 'Suppress all output',
      type: 'boolean',
      group: 'Logging:'
    })
    .option('verbose', {
      alias: 'v',
      describe: `Verbose output (alias of --log-level=${opts.verboseLevel})`,
      type: 'boolean',
      group: 'Logging:'
    })
    .conflicts({
      verbose: 'silent',
      silent: 'verbose',
      'log-level': ['silent', 'verbose']
    })
    .option('canonical', {
      describe: 'Use canonical support info even when local info is available',
      type: 'boolean',
      group: 'preferences'
    })
    .option('fetch', {
      describe: 'Fetch canonical support info from remote repos when necessary',
      type: 'boolean',
      group: 'preferences'
    })
    .option('base-path', {
      describe: 'Set top most directory from which local support info files can be read. Defaults to same directory in which package.json is located.',
      type: 'string',
      group: 'preferences'
    })

    .middleware([
      // Log setup
      (argv) => {
        if (argv.silent) {
          argv.logLevel = opts.silentLevel;
        } else if (argv.verbose) {
          argv.logLevel = opts.verboseLevel;
        }
        log.setLevel(argv.logLevel);
        argv.log = log;
      }
    ])

    // ensure we get an error if there is no command
    .demandCommand(1, 'You must specify the command to run')

    // ensure we get an error if we get an unrecognized command
    .strictCommands(true)

    // ensure we only allow known options
    .strict(true)

    .commandDir(opts.commandsDir, {
      visit: (mod) => typeof mod === 'function' ? mod(opts) : mod
    })
    .usage(opts.usage);

  cli.wrap(Math.min(cli.terminalWidth(), 120));

  // on fail callback
  if (typeof opts.fail === 'function') {
    cli.fail(opts.fail);
  }

  return (argv) => cli.parse(argv);
};
