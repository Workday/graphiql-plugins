import { Page, test } from '@playwright/test';
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.join(__dirname, '..', '..');
const RECORD_DEMO = process.env.RECORD_DEMO === 'true';

type DemoScriptContext = {
  page: Page;
  projectDir: string;
};
test.describe('Demo', () => {
  for (const { project, demoScript } of [
    {
      project: 'graphiql-plugin-multipart-requests',
      demoScript: async ({ page, projectDir }: DemoScriptContext) => {
        await page.addInitScript(() => {
          window.localStorage.setItem(
            'graphiql:query',
            `
mutation($file: FileAttachment!) {
  a: uploadPhoto(photo: "part0", worker: 1) {
    filename
    filesize
    contentType  
  }
  b: uploadPhoto(photo: $file, worker: 1) {
    filename
    filesize
    contentType
  }
}`.trim()
          );
          window.localStorage.setItem('graphiql:variables', `{ "file": "part1" }`);
          window.localStorage.setItem('graphiql:theme', `dark`);
        });
        await page.goto(`index.html`);
        await page.getByLabel(/.*Documentation Explorer.*/).click();

        await page.getByLabel(/.*Multipart Attachments.*/).click();

        await delay(1000);

        for (const file of ['demo.gif', 'package.json']) {
          await page.getByRole('button', { name: /.*Add Part.*/ }).click();

          await delay();

          const fileChooserPromise = page.waitForEvent('filechooser');
          await page
            .getByRole('button', { name: /.*Attach File.*/ })
            .last()
            .click();
          const fileChooser = await fileChooserPromise;
          await fileChooser.setFiles(path.join(projectDir, file));

          await delay();
        }

        await delay(1000);

        await page.getByRole('button', { name: /.*Execute.*/ }).click();

        await delay(3000);
      },
    },
  ]) {
    test(project, async ({ browser }) => {
      const context = await browser.newContext(
        RECORD_DEMO
          ? {
              recordVideo: {
                dir: path.join(REPO_ROOT, 'playwright-report'),
                size: {
                  width: 1600,
                  height: 900,
                },
              },
              viewport: {
                width: 1600,
                height: 900,
              },
            }
          : {}
      );
      const projectDir = path.join(REPO_ROOT, `packages/${project}`);

      const page = await context.newPage();

      await demoScript({ page, projectDir });

      await context.close();

      if (RECORD_DEMO) {
        await page.video().saveAs(path.join(projectDir, 'demo.webm'));
      }
    });
  }
});

async function delay(sleepMs = 500) {
  if (RECORD_DEMO) {
    // only delay for the recording
    await new Promise((resolve) => setTimeout(resolve, sleepMs));
  }
}
