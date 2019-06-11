#!/usr/bin/env node
const path = require('path');
const meow = require('meow');
const { run } = require('./dist/index.js');

const cli = meow(
  `
  Usage
    $ lambi <command>

  Options
    --env, -e    Provide environment variables
    --env-file   Define a file of environment variables
    --volume, -v Relative path to folders to mount into container

  Examples
    $ lambi --env STAGE=development "env"
`,
  {
    flags: {
      env: {
        type: 'string',
        alias: 'e',
      },
      envFile: {
        type: 'string',
      },
      volume: {
        type: 'string',
        alias: 'v',
      },
    },
  },
);

const config = {
  env: arrayify(cli.flags.env),
  envFile: cli.flags.envFile
    ? path.resolve(process.cwd(), cli.flags.envFile)
    : undefined,
  volume: arrayify(cli.flags.volume),
};

const command = cli.input.join(' ');

run(command, config).catch(console.error);

function arrayify(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  return [value];
}
