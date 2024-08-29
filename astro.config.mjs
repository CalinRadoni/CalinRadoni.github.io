import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config

export default defineConfig({
	site: 'https://calinradoni.github.io',
	integrations: [mdx(), sitemap()],

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      // experimentalThemes: {
      //   light: 'github-light',
      //   dark: 'github-dark',
      // },
      wrap: false,
    },
  },
});
