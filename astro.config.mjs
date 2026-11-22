// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// frontmatter に noindex: true がある記事はサイトマップから外す
const POSTS_DIR = new URL('./src/content/posts/', import.meta.url);
const noindexPaths = new Set(
  readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md') && /^noindex:\s*true\s*$/m.test(readFileSync(new URL(f, POSTS_DIR), 'utf-8').split('---')[1] ?? ''))
    .map((f) => `/posts/${f.replace(/\.md$/, '')}/`)
);

// https://astro.build/config
export default defineConfig({
  site: 'https://tabisuke.blog',
  integrations: [sitemap({ filter: (page) => !noindexPaths.has(new URL(page).pathname) })],
  vite: {
    plugins: [tailwindcss()]
  }
});
