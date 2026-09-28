import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { createIdentity } from './scripts/build-identity.mjs';

export default defineConfig(({ command }) => {
  if (command === 'build' && !process.env.EASYASPIE_BUILD_MANIFEST) throw new Error('Use npm run build to allocate a build identity.');
  const metadata = process.env.EASYASPIE_BUILD_MANIFEST
    ? JSON.parse(readFileSync(process.env.EASYASPIE_BUILD_MANIFEST, 'utf8'))
    : createIdentity('web-dev');
  if (command === 'serve') console.log(`DEVELOPMENT SESSION ${metadata.id}`);
  return { base: './', define: { __BUILD_IDENTITY__: JSON.stringify(metadata) }, build: { outDir: process.env.EASYASPIE_BUILD_DIRECTORY || 'dist', chunkSizeWarningLimit: 650 } };
});
