# Lambi

> Run commands in a docker like node environment

## Description

`lambi` is mainly a cli util used to run commands in a
[AWS Lambda](https://aws.amazon.com/lambda/) like environment. It is useful if
you're building you function locally before pushing it to AWS.

If you bundle your code locally you might end up with binaries being built for
the wrong platform – e.g. you're doing dev and bundling on a mac and lambdas run
in a more linuz like environment.

## Installation

Install using npm or yarn, it will work both locally and globally.

```bash
$ npm install --save-dev @fransvilhelm/lambi
$ yarn add --dev @fransvilhelm/lambi
```

## CLI usage

```bash
$ lambi yarn run build
```

`lambi` accepts a single argument which will run in the created lambda like
environment.

### Flags

#### `--env, -e`

Use the `--env` flag (alias `-e`) to send environment variables into the
container.

```bash
$ lambi --env NODE_ENV=production -e STAGE=staging "yarn build"
```

#### `--env-file`

Use the `--env-file` flag to use a file of environment variables to send into
the container.

`.env`:

```
API_KEY=123456789
SECRET=987654321
```

```bash
$ lambi --env-file .env "env"
```

#### `--volume, -v`

Use the `--volume` flag (alias `-v`) to mount a folder relative to the project
root into the container.

```bash
$ lambi -v ./src "yarn test --watch"
```

This is useful if you for example want to get the built files where binaries are
included.

```bash
$ lambi -v ./dist "ncc build src/index.ts -o dist/handler.js"
```

You could of course mount the working directory into the container using `.`,
but that might lead to unexpected behaviour.

### Chaining

If you like to chain arguments, e.g. build and deploy, you need to wrap the
argument in quotes.

```bash
lambi "yarn run build && yarn run deploy"
```

### Modules bin commands

Some node packages might also install programs to run from the command line,
e.g. this package installs a lambi program into `./node_modules/.bin/lambi`.

When using scripts in `package.json` these programs can be run without writing
out the relative path. The same goes for scripts running inside the container
created by `lambi`. This is because we add the path `./node_modules/.bin` to the
`PATH` variable.

This means that you can run any program installed locally by npm or yarn without
the relative path:

```bash
# Instead of this
$ lambi ./node_modules/.bin/jest
# You can do this
$ lambi jest
```

## License

MIT (c) Adam Bergman 2019
