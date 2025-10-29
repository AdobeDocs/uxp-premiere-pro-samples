/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2025 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it. If you have received this file from a source other than Adobe,
 * then your use, modification, or distribution of it requires the prior
 * written permission of Adobe.
 **************************************************************************/

import type { premierepro, Project, Sequence } from "../types.d.ts";
const ppro = require("premierepro") as premierepro;
import { log } from "./utils";

const AUTO_PEAK_GENERATION_KEY =
  ppro.Constants.PreferenceKey.AUTO_PEAK_GENERATION;
const appPreference = ppro.AppPreference;

/**
 * Get auto peak generation preference settings
 * @return [String] Auto Peak Preference Setting
 */
export async function getPreferenceSetting() {
  return appPreference.getValue(AUTO_PEAK_GENERATION_KEY);
}

/**
 * Set auto peak generation preference settings alternatively
 * @return [Boolean] if operation succeed
 */
export async function setPreferenceSetting() {
  let succeed = true;
  try {
    let newValue = true;
    if (appPreference.getValue(AUTO_PEAK_GENERATION_KEY) == "true") {
      newValue = false;
    }

    appPreference.setValue(
      AUTO_PEAK_GENERATION_KEY,
      newValue,
      appPreference.PROPERTY_PERSISTENT
    );
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }
  return succeed;
}
