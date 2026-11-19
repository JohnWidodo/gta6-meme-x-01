const { mkdir, readFile, writeFile } = require('node:fs/promises');
const { join } = require('node:path');

const botDirectory = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDirectory = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

async function copyPost(): Promise<void> {
  try {
    await mkdir(outputDirectory, { recursive: true });
    const post = await readFile(join(botDirectory, 'POST.json'));
    const parsed: unknown = JSON.parse(post.toString('utf8'));
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('url' in parsed) ||
      typeof parsed.url !== 'string'
    ) {
      throw new Error('POST.json must contain a string "url"');
    }
    if (!/^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/[0-9]+$/.test(parsed.url)) {
      throw new Error('POST.json url must match https://x.com/<handle>/status/<digits>');
    }
    await writeFile(join(outputDirectory, 'POST.json'), post);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Unable to validate or copy POST.json: ${message}`);
    process.exitCode = 1;
  }
}

void copyPost();
