const isTestEnv = process.env.NODE_ENV === 'test';

const info = (msg: string) => {
  if (!isTestEnv) console.log(msg);
};

const error = (msg: string) => {
  if (!isTestEnv) console.error(msg);
};

export { info, error };
