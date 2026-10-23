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

let count = 0;

/**
 * Adds the given message to the Events panel, rotating through using the
 * available event types on each publish.
 *
 * @param message - the message to send. Must be a non-empty string.
 * @returns a Promise resolving true when the message is successfully sent
 */
export async function setSDKEventMessage(message: string): Promise<boolean> {
  if (message === "") {
    console.log("The SDK event message cannot be empty", "red");
    return false;
  }

  try {
    // Constants setup within the function to avoid any plugin loading issues
    // for Premiere versions which don't have the `PluginSupport` class.
    const EVENT_TYPES = [
      // @ts-expect-error - PluginSupport is not typed yet!
      ppro.PluginSupport.EVENT_TYPE_ERROR,
      // @ts-expect-error - PluginSupport is not typed yet!
      ppro.PluginSupport.EVENT_TYPE_INFORMATION,
      // @ts-expect-error - PluginSupport is not typed yet!
      ppro.PluginSupport.EVENT_TYPE_WARNING,
    ];
    const eventType = EVENT_TYPES[(count++) % EVENT_TYPES.length];

    // @ts-expect-error - PluginSupport is not typed yet!
    return ppro.PluginSupport.setSDKEventMessage(message, eventType);
  } catch (err) {
    log(`Failed to add message to Events panel: ${err}`, "red");
    return false;
  }
}
