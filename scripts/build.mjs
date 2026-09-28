import { mkdirSync, writeFileSync, cpSync, rmSync, appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createIdentity, buildReport } from './build-identity.mjs';

const metadata = createIdentity();
const directory = resolve('artifacts', metadata.id);
const manifest = resolve('.build', `${metadata.id}.json`);
mkdirSync('.build', { recursive: true });
writeFileSync(manifest, JSON.stringify(metadata, null, 2) + '\n', { flag: 'wx' });
mkdirSync(directory, { recursive: true });
process.env.EASYASPIE_BUILD_MANIFEST = manifest;
process.env.EASYASPIE_BUILD_DIRECTORY = directory;
console.log(`BUILD START ${metadata.id}`);
try {
  const { build } = await import('vite');
  await build();
  writeFileSync(`${directory}/build.json`, JSON.stringify(metadata, null, 2) + '\n');
  writeFileSync(`${directory}/BUILD.md`, buildReport(metadata, 'Build succeeded'));
  rmSync('dist', { recursive: true, force: true });
  cpSync(directory, 'dist', { recursive: true });
  const output = `id=${metadata.id}\npath=${directory}\n`;
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, output);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, buildReport(metadata, 'Build succeeded'));
  console.log(`BUILD SUCCESS ${metadata.id}\nArtifact: ${directory}`);
} catch (error) {
  writeFileSync(`${directory}/BUILD.md`, buildReport(metadata, 'Build failed; reservation retained'));
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, buildReport(metadata, 'Build failed; reservation retained'));
  console.error(`BUILD FAILED ${metadata.id}`);
  throw error;
}
