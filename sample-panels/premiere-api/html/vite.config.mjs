/*
 * Copyright 2026 Adobe. All rights reserved.
 *
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  publicDir: "public",
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: false,
    minify: false,
    sourcemap: true,
    target: "esnext",
    rolldownOptions: {
      input: resolve(__dirname, "index.ts"),
      external: ["premierepro", "uxp"],
      output: {
        format: "cjs",
        preserveModules: true,
        preserveModulesRoot: __dirname,
        entryFileNames: "[name].js",
      },
    },
  },
});
