let __files = ['docker', 'yarn', 'npm'];

const which = jest.fn((arg, cb) => {
  if (__files.includes(arg)) {
    cb(undefined, arg);
  } else {
    cb(new Error(`${arg} not found`));
  }
});

which.__setFiles = (...files) => {
  __files = files;
};

which.__reset = () => {
  __files = ['docker', 'yarn', 'npm'];
};

module.exports = which;
