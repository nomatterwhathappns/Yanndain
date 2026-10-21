import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { copyFile } from 'node:fs/promises';

// Generates one portable HTML file for environments that cannot proxy localhost.
export default defineConfig({
  publicDir: false,
  plugins: [
    { name: 'portable-routing', transformIndexHtml: html => html.replace('<html lang="id">', '<html lang="id" data-portable="true">') },
    viteSingleFile({ outputFileName: 'yanndain-preview.html' }),
    {
      name: 'portable-output',
      async closeBundle() {
        await copyFile('artifacts/portable/yanndain-preview.html', 'yanndain-preview.html');
        await copyFile('artifacts/portable/yanndain-preview.html', 'yanndain-ocean-v4.html');
      },
    },
  ],
  build: {
    outDir: 'artifacts/portable',
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
  },
});
