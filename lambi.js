#!/usr/bin/env node
const { run } = require('./dist/index.js');

const command = process.argv.slice(2).join(' ');
run(command).catch(console.error);
