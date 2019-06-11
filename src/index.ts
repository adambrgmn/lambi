import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import execa from 'execa';
import Listr, { ListrOptions } from 'listr';
import readPkgUp from 'read-pkg-up';
import whichCb from 'which';
import { flatMap } from 'lodash';
import { TestRenderer } from './TestRenderer';
import * as log from './log';

const which = promisify(whichCb);
const access = promisify(fs.access);

enum PackageManager {
  yarn = 'yarn',
  npm = 'npm',
}

interface Config {
  envFile?: string;
  env: string[];
  volume: string[];
}

interface ListrContext {
  command: string;
  cwd: string;
  projectName: string;
  packageManager: PackageManager;
  imageName: string;
}

export async function run(command: string, config: Config) {
  const ctx: ListrContext = await prepare();

  log.info('\nPreparations completed');
  log.info('Now running task in lambda like context\n');

  const envFile = config.envFile ? ['--env-file', config.envFile] : [];
  const env = flatMap(config.env, e => ['--env', e]);
  const volume = flatMap(config.volume, v => [
    '--volume',
    `${path.join(ctx.cwd, v)}:${path.join('/var/task', v)}`,
  ]);

  return execa(
    'docker',
    [
      'run',
      ...env,
      ...envFile,
      ...volume,
      ctx.imageName,
      '/bin/bash',
      '-c',
      command,
    ],
    { cwd: ctx.cwd, stdio: 'inherit' },
  );
}

function prepare() {
  const options: ListrOptions = {};

  if (process.env.NODE_ENV === 'test') {
    // @ts-ignore
    options.renderer = TestRenderer;
  }

  const tasks = new Listr(
    [
      {
        title: 'Check Docker',
        task: () => which('docker'),
      },
      {
        title: 'Prepare context',
        task: async (ctx: ListrContext) => {
          const pkg = await readPkgUp();
          if (pkg == null) {
            throw new Error('No package.json file in project');
          }

          ctx.cwd = path.dirname(pkg.path);
          ctx.projectName = pkg.package.name;
          ctx.packageManager = await getPackageManager(ctx.cwd);
          ctx.imageName = `lambi-${pkg.package.name
            .replace('@', '')
            .replace('/', '-')}`;
        },
      },
      {
        title: 'Build image',
        task: (ctx: ListrContext) => {
          const Dockerfile = path.join(
            __dirname,
            '../dockerfiles',
            ctx.packageManager,
            'Dockerfile',
          );

          return execa(
            'docker',
            ['build', '-t', ctx.imageName, '--file', Dockerfile, '.'],
            { cwd: ctx.cwd },
          );
        },
      },
    ],
    options,
  );

  return tasks.run();
}

async function getPackageManager(pkgRoot: string): Promise<PackageManager> {
  try {
    await which('yarn');
    await access(path.join(pkgRoot, 'yarn.lock'));
    return PackageManager.yarn;
  } catch (err) {
    return PackageManager.npm;
  }
}
