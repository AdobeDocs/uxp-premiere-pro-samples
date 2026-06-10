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

import type { premierepro } from "@adobe/premierepro";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ppro = require("premierepro") as premierepro;
import { log } from "./utils";

/**
 * Get the active production instance
 * @return [object | null] Active production instance or null if no active production found
 */
export function getActiveProduction(): object | null {
  try {
    return ppro.PRProduction.getActiveProduction();
  } catch (e) {
    log(`Error getting active production: ${e}`, "red");
    return null;
  }
}

/**
 * Get scratch disk setting for the active production
 * @return [string | null] Scratch Disk Path of current production, or null if failed
 */
export async function getScratchDiskSettings(): Promise<string | null> {
  try {
    const activeProduction = ppro.PRProduction.getActiveProduction();
    if (!activeProduction) {
      log("No active production found", "red");
      return null;
    }
    const scratchDiskSettings = await activeProduction.getScratchDiskSettings();
    const capturePath = scratchDiskSettings.getScratchDiskPath(
      ppro.Constants.ScratchDiskFolderType.CAPTURE
    );
    return capturePath;
  } catch (e) {
    log(`Error getting production scratch disk settings: ${e}`, "red");
    return null;
  }
}