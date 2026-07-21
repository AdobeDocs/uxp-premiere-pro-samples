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

import type { premierepro } from "@adobe/premierepro";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ppro = require("premierepro") as premierepro;

import { log } from "./utils";

export function getManifestForFile(filePath: string) {
  const { manifestLocation } = ppro.C2PAService.getManifest(filePath, false /* withValidation */);

  switch (manifestLocation) {
    case ppro.Constants.C2PAManifestLocation.NONE:
      log(`No manifest found for file "${filePath}".`);
      break;

    case ppro.Constants.C2PAManifestLocation.CLOUD:
      log(`Found manifest for file "${filePath}" in the cloud.`)
      break;

    case ppro.Constants.C2PAManifestLocation.EMBEDDED:
      log(`Found manifest for file "${filePath}" embedded in the file.`)
      break;

    case ppro.Constants.C2PAManifestLocation.SIDE_CAR:
      log(`Found manifest for file "${filePath}" in a side car file.`)
      break;
  }
}
