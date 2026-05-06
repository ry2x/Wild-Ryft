import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

import config from "../../eslint.config.js";

const astroConfig = [
  ...config,

  // Astro recommended rules
  ...eslintPluginAstro.configs.recommended,

  // Astro files configuration
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: eslintPluginAstro.parser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".astro"],
      },
    },
    rules: {
      // Add custom Astro rules here if needed
    },
  },
];

export default astroConfig;
