// @ts-check
import { defineConfig } from "astro/config";

import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  output: "static",
  adapter: node({
    mode: "standalone",
  }),
  vite: {
    plugins: [tailwindcss()],
  },
  site: "https://heavenclub.es",
  integrations: [icon(), sitemap(), mdx()],
  trailingSlash: "always",
});
