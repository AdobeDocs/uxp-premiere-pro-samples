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

import type { premierepro, Sequence, TickTime } from "@adobe/premierepro";

import { log } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ppro = require("premierepro") as premierepro;

/**
 * Gets the in point of the work area for a sequence.
 * @param sequence - The sequence to get the work area in point for.
 * @returns The in point of the work area for the sequence.
 */
export function getWorkAreaInPoint(sequence: Sequence): TickTime {
  return ppro.WorkAreaUtils.getWorkAreaInPoint(sequence);
}

/**
 * Gets the out point of the work area for a sequence.
 * @param sequence - The sequence to get the work area out point for.
 * @returns The out point of the work area for the sequence.
 */
export function getWorkAreaOutPoint(sequence: Sequence): TickTime {
  return ppro.WorkAreaUtils.getWorkAreaOutPoint(sequence);
}

/**
 * Sets the in point of the work area for a sequence.
 * @param sequence - The sequence to set the work area in point for.
 * @param [inPoint=ppro.TickTime.TIME_ZERO] - The in point to set for the work area.
 * @returns True if the in point was set successfully, false otherwise.
 */
export function setWorkAreaInPoint(
  sequence: Sequence,
  inPoint: TickTime = ppro.TickTime.TIME_ZERO
): boolean {
  const success = ppro.WorkAreaUtils.setWorkAreaInPoint(sequence, inPoint);
  if (success) {
    log(`Sequence work area in point set to ${inPoint.seconds} seconds`, "green");
  } else {
    log(`Failed to set sequence work area in point`, "red");
  }
  return success;
}

/**
 * Sets the out point of the work area for a sequence.
 * @param sequence - The sequence to set the work area out point for.
 * @param [outPoint=ppro.TickTime.TIME_MAX] - The out point to set for the work area.
 * @returns True if the out point was set successfully, false otherwise.
 */
export function setWorkAreaOutPoint(
  sequence: Sequence,
  outPoint: TickTime = ppro.TickTime.TIME_MAX
): boolean {
  const success = ppro.WorkAreaUtils.setWorkAreaOutPoint(sequence, outPoint);
  if (success) {
    log(`Sequence work area out point set to ${outPoint.seconds} seconds`, "green");
  } else {
    log(`Failed to set sequence work area out point`, "red");
  }
  return success;
}

/**
 * Sets the in and out points of the work area for a sequence.
 * @param sequence - The sequence to set the work area in and out points for.
 * @param [inPoint=ppro.TickTime.TIME_ONE_SECOND] - The in point to set for the work area.
 * @param [outPoint=ppro.TickTime.createWithSeconds(10)] - The out point to set for the work area.
 * @returns True if the in and out points were set successfully, false otherwise.
 */
export function setWorkAreaInOutPoints(
  sequence: Sequence,
  inPoint: TickTime = ppro.TickTime.TIME_ONE_SECOND,
  outPoint: TickTime = ppro.TickTime.createWithSeconds(10),
): boolean {
  const success = ppro.WorkAreaUtils.setWorkAreaInOutPoints(sequence, inPoint, outPoint);
  if (success) {
    log(`Sequence work area in and out points set to ${inPoint.seconds} seconds and ${outPoint.seconds} seconds`, "green");
  } else {
    log(`Failed to set sequence work area in and out points`, "red");
  }
  return success;
}
