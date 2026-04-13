import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import typescript from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    "scripts/**",
    "eslint.config.mjs",
    // types.d.ts is auto-generated; linting errors will be addressed separately.
    "types.d.ts",
  ]),
  eslint.configs.recommended,
  typescript.configs.recommended,
);
