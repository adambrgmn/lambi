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

Install using npm or yarn

```sh
npm install --save-dev @fransvilhelm/lambi
yarn add --dev @fransvilhelm/lambi
```

## CLI usage

```sh
lambi yarn run build
```

`lambi` accepts a single argument which will run in the created lambda like
environment.

### Chaining

If you like to chain arguments, e.g. build and deploy, you need to wrap the
argument in quotes.

```sh
lambi "yarn run build && yarn run deploy"
```

## License

MIT (c) Adam Bergman 2019
