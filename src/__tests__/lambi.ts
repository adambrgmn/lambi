import fs from 'fs';
import which from 'which';
import execa from 'execa';
import readPkgUp from 'read-pkg-up';
import { basename, dirname, join } from 'path';
import { run } from '../index';

jest.mock('fs');
jest.mock('which');
jest.mock('execa');
jest.mock('read-pkg-up');

const defaultConfig = { env: [] };

afterEach(() => {
  // @ts-ignore
  execa.mockReset();
  // @ts-ignore
  fs.__reset();
  // @ts-ignore
  which.__reset();
  // @ts-ignore
  readPkgUp.__reset();
});

it('should throw if docker is not installed', async () => {
  // @ts-ignore
  which.__setFiles();
  await expect(run('ls -al', defaultConfig)).rejects.toThrow(Error);
});

it('should throw if a package.json is not found upwards in the hierarchy', async () => {
  // @ts-ignore
  readPkgUp.__setData(null);
  await expect(run('ls -al', defaultConfig)).rejects.toThrow(Error);
});

it('should pick yarn if yarn is installed and yarn.lock is found', async () => {
  // @ts-ignore
  which.__setFiles('docker', 'yarn');
  // @ts-ignore
  fs.__setFiles(join(__dirname, '../../yarn.lock'));

  await run('ls -al', defaultConfig);
  // @ts-ignore
  const [buildCall] = execa.mock.calls;
  expect(basename(dirname(buildCall[1][4]))).toEqual('yarn');
});

it('should pick npm if yarn is not installed', async () => {
  // @ts-ignore
  which.__setFiles('docker');

  await run('ls -al', defaultConfig);
  // @ts-ignore
  const [buildCall] = execa.mock.calls;
  expect(basename(dirname(buildCall[1][4]))).toEqual('npm');
});

it('should pick npm if yarn.lock is not found', async () => {
  // @ts-ignore
  fs.__setFiles();

  await run('ls -al', defaultConfig);
  // @ts-ignore
  const [buildCall] = execa.mock.calls;
  expect(basename(dirname(buildCall[1][4]))).toEqual('npm');
});

it('should run the command with docker run', async () => {
  await run('ls -al', defaultConfig);
  expect(execa).toHaveBeenLastCalledWith(
    'docker',
    ['run', 'lambi-fransvilhelm-lambi', '/bin/bash', '-c', 'ls -al'],
    expect.objectContaining({
      cwd: expect.any(String),
      stdio: 'inherit',
    }),
  );
});

it('should supply provided env variables to docker env', async () => {
  await run('ls -al', { env: ['NODE_ENV=test'] });
  expect(execa).toHaveBeenLastCalledWith(
    'docker',
    [
      'run',
      '--env',
      'NODE_ENV=test',
      'lambi-fransvilhelm-lambi',
      '/bin/bash',
      '-c',
      'ls -al',
    ],
    expect.objectContaining({
      cwd: expect.any(String),
      stdio: 'inherit',
    }),
  );
});

it('should supply provided env file to docker env', async () => {
  await run('ls -al', { env: [], envFile: '.env' });
  expect(execa).toHaveBeenLastCalledWith(
    'docker',
    [
      'run',
      '--env-file',
      '.env',
      'lambi-fransvilhelm-lambi',
      '/bin/bash',
      '-c',
      'ls -al',
    ],
    expect.objectContaining({
      cwd: expect.any(String),
      stdio: 'inherit',
    }),
  );
});
