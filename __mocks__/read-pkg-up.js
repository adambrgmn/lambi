const path = require('path');
const pkg = require('../package.json');

let __data = {
  package: pkg,
  path: path.join(__dirname, '../package.json'),
};

const readPkgUp = jest.fn(() => Promise.resolve(__data));

const __reset = () => {
  __data = {
    package: pkg,
    path: path.join(__dirname, '../package.json'),
  };
};

const __setData = data => {
  __data = data;
};

readPkgUp.__setData = __setData;
readPkgUp.__reset = __reset;

module.exports = readPkgUp;
