/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2026 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it. If you have received this file from a source other than Adobe,
 * then your use, modification, or distribution of it requires the prior
 * written permission of Adobe.
 **************************************************************************/

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
