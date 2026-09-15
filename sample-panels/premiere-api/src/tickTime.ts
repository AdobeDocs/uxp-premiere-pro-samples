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
 * Converts a Sequence's current player position to a timecode string,
 * using the sequence's own timebase and video time display format, and
 * logs the result.
 */
export async function logActiveSequenceTimecode(sequence: Sequence): Promise<void> {
  try {
    const playerPosition = await sequence.getPlayerPosition();
    const timebase: string = await sequence.getTimebase();
    const frameRate = ppro.FrameRate.createWithValue(
      ppro.TickTime.TIME_ONE_SECOND.ticksNumber / Number(timebase)
    );
    const timeDisplay = await sequence.getSequenceVideoTimeDisplayFormat();

    const timecode = ppro.TickTime.timeToTimecode(
      playerPosition,
      frameRate,
      timeDisplay
    );

    log(`Current player position as timecode: ${timecode}`);
  } catch (err) {
    log(`Failed to calculate player position timecode: ${err}`, "red");
  }
}

/**
 * Converts a timecode string to a TickTime, using the sequence's own
 * timebase and video time display format, and logs the result.
 *
 * @param sequence
 * @param timecode e.g. "01:00:00:00"
 */
export async function logTimecodeAsTickTime(
  sequence: Sequence,
  timecode: string
): Promise<void> {
  try {
    const timebase: string = await sequence.getTimebase();
    const frameRate = ppro.FrameRate.createWithValue(
      ppro.TickTime.TIME_ONE_SECOND.ticksNumber / Number(timebase)
    );
    const timeDisplay = await sequence.getSequenceVideoTimeDisplayFormat();

    const tickTime: TickTime = ppro.TickTime.timecodeToTime(
      timecode,
      frameRate,
      timeDisplay
    );

    log(
      `Timecode "${timecode}" converted to ${tickTime.seconds} seconds (${tickTime.ticksNumber} ticks)`
    );
  } catch (err) {
    log(`Failed to convert timecode "${timecode}" to a TickTime: ${err}`, "red");
  }
}
