import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import execa from 'execa';
import Listr, { ListrOptions } from 'listr';
import readPkgUp from 'read-pkg-up';
import whichCb from 'which';
import { TestRenderer } from './TestRenderer';
import * as log from './log';

const which = promisify(whichCb);
const access = promisify(fs.access);

enum PackageManager {
  yarn = 'yarn',
  npm = 'npm',
}

interface ListrContext {
  command: string;
  cwd: string;
  projectName: string;
  packageManager: PackageManager;
  imageName: string;
}

export async function run(command: string) {
  const ctx: ListrContext = await prepare(command);

  log.info('\nPreparations completed');
  log.info('Now running task in lambda like context\n');
  return execa(
    'docker',
    ['run', ctx.imageName, '/bin/bash', '-c', ctx.command],
    { cwd: ctx.cwd, stdio: 'inherit' },
  );
}

function prepare(command: string) {
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

  return tasks.run({ command });
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
