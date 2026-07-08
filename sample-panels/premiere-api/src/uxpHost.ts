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

// eslint-disable-next-line @typescript-eslint/no-require-imports
const os = require("os") as typeof import("os");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { host, versions } = require("uxp") as typeof import("uxp");

import { log } from "./utils";

export async function logHostInfo() {
  log("=== Host Environment ===");

  // Available as of Premiere 25.6
  log(`OS: ${os.platform()} ${os.release()}`);
  log(`Application: ${host.name} v${host.version}`);
  log(`UXP Runtime: v${versions.uxp}`);
  log(`Plugin Version: v${versions.plugin}`);
  log(`UI Locale: ${host.uiLocale}`);

  await logHostBackgroundColor();
}

declare module "uxp" {
  interface Host {
    /**
     * Gets the current background color of the Premiere host.
     * 
     * The color information is returned as a stringified JSON object with the following structure:
     * ```json
     * {
     *   "type": "rgb",
     *   "value": {
     *     "alpha": number,
     *     "red": number,
     *     "green": number,
     *     "blue": number
     *   }
     * }
     * ```
     *
     * The `type` property is currently set to `"rgb"`.
     *
     * The `value` property is an object with the following properties:
     * - `alpha`: The alpha value of the color (0-1).
     * - `red`: The red value of the color (0-255).
     * - `green`: The green value of the color (0-255).
     * - `blue`: The blue value of the color (0-255).
     *
     * @since 26.5
     * @returns The background color of the Premiere host.
     */
    getBackgroundColor(): Promise<string>;
  }
}

/**
 * Logs the host background color to the console.
 * 
 * @since 26.5
 */
export async function logHostBackgroundColor() {
  if ("getBackgroundColor" in host) {
    const backgroundColor = JSON.parse(await host.getBackgroundColor());

    // type: rgb
    // value: { alpha: number, red: number, green: number, blue: number }
    if (backgroundColor.type === "rgb") {
      const { value } = backgroundColor;
      const red = (value.red * 255).toFixed(0);
      const green = (value.green * 255).toFixed(0);
      const blue = (value.blue * 255).toFixed(0);
      const alpha = value.alpha.toFixed(0);
      log(`Background Color: rgba(${red}, ${green}, ${blue}, ${alpha})`);
    }
  }
}
