import { getFirefoxUserPrefs } from './lib/targets/firefoxUserPrefs';
import type { Project } from '@playwright/test';
import { PlaywrightTestConfig, defineConfig } from '@playwright/test';
import * as path from 'path';
import { TestOptions, WorkerOptions } from './lib/fixtures/standard';
import { TargetNames } from './lib/targets';

const CI = !!process.env.CI;

// The DEBUG env is used to debug without the playwright inspector, like in vscode
// see .vscode/launch.json
const DEBUG = !!process.env.DEBUG;
const SLOWMO = parseInt(process.env.PLAYWRIGHT_SLOWMO || '0');
const NUM_WORKERS = parseInt(process.env.PLAYWRIGHT_WORKERS || '16');

let retries = 0,
  workers = NUM_WORKERS || 2,
  maxFailures = 0;
if (CI) {
  // Overall maxFailures is now dependent on the number of retries, workers
  retries = 3;
  workers = 2;
  maxFailures = retries * workers * 2;
}

export default defineConfig<PlaywrightTestConfig<TestOptions, WorkerOptions>>({
  outputDir: path.resolve(__dirname, '../../artifacts/functional'),
  forbidOnly: CI,
  retries,
  testDir: 'tests',
  // Run all tests in parallel.
  fullyParallel: true,
  use: {
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    ...TargetNames.map(
      (name) =>
        ({
          name,
          use: {
            browserName: 'firefox',
            targetName: name,
            launchOptions: {
              args: DEBUG ? ['-start-debugger-server'] : undefined,
              firefoxUserPrefs: getFirefoxUserPrefs(name, DEBUG),
              headless: !DEBUG,
              slowMo: SLOWMO,
            },
            trace: CI ? 'on-first-retry' : 'retain-on-failure',
          },
        } as Project)
    ),
  ],
  reporter: CI
    ? [
        ['./lib/ci-reporter.ts'],
        [
          'junit',
          {
            outputFile: path.resolve(
              __dirname,
              '../../artifacts/tests/test-results.xml'
            ),
          },
        ],
      ]
    : 'list',
  workers,
  maxFailures,
});
