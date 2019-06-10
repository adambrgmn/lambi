/* eslint-disable strict */
'use strict';
const path = require('path');

const fs = jest.genMockFromModule('fs');

let __files = [path.join(__dirname, '../yarn.lock')];

const access = jest.fn((file, cb) => {
  if (__files.includes(file)) {
    cb(undefined);
  } else {
    cb(new Error(`${file} not found`));
  }
});

fs.access = access;
fs.__setFiles = (...files) => {
  __files = files;
};

fs.__reset = () => {
  __files = [path.join(__dirname, '../yarn.lock')];
};

module.exports = fs;
