/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2024 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it. If you have received this file from a source other than Adobe,
 * then your use, modification, or distribution of it requires the prior
 * written permission of Adobe.
 **************************************************************************/

import type { premierepro, Sequence } from "../types.d.ts";
import { log } from "./utils";
const ppro = require("premierepro") as premierepro;

/**
 * Export a sequence as Final Cut Pro XML to a user-selected output directory.
 */
export async function exportAsFinalCutProXML(sequence: Sequence, outputFilePath: string) {
  try {
    return await ppro.ProjectConverter.exportAsFinalCutProXML(
      sequence,
      outputFilePath,
      true // suppressUI
    );
  } catch (e) {
    log(`Error exporting as Final Cut Pro XML: ${e}`, "red");
    return false;
  }
}

/**
 * Export a sequence as OpenTimelineIO to a user-selected output directory.
 */
export async function exportAsOpenTimelineIO(sequence: Sequence, outputFilePath: string) {
  try {
    return await ppro.ProjectConverter.exportAsOpenTimelineIO(
      sequence,
      outputFilePath,
      true // suppressUI
    );
  } catch (e) {
    log(`Error exporting as OpenTimelineIO: ${e}`, "red");
    return false;
  }
}

/**
 * Import an OpenTimelineIO file into the active project.
 */
export async function importFromOpenTimelineIO(importPath: string) {
  try {
    return await ppro.ProjectConverter.importFromOpenTimelineIO(
      importPath,
      true // suppressUI
    );
  } catch (e) {
    log(`Error importing from OpenTimelineIO: ${e}`, "red");
    return false;
  }
}

/**
 * Import a Final Cut Pro XML file into the active project.
 */
export async function importFromFinalCutProXML(importPath: string) {
  try {
    return await ppro.ProjectConverter.importFromFinalCutProXML(
      importPath,
      true // suppressUI
    );
  } catch (e) {
    log(`Error importing from Final Cut Pro XML: ${e}`, "red");
    return false;
  }
}
/**
 * Export a sequence as AAF with specified options.
 */

export async function exportAAF(
  sequence: Sequence,
  outputFilePath: string,
  mixdownVideo: boolean,
  explodeToMono: boolean,
  sampleRate: number,
  bitsPerSample: number,
  embedAudio: boolean,
  audioFileFormat: number,
  trimSources: boolean,
  handleFrames: number,
  videoMixdownPresetPath?: string,
  renderAudioEffects: boolean = false,
  interleaveWithoutEffects: boolean = false,
  preserveParentFolder: boolean = false
) {
  try {
    return await ppro.ProjectConverter.exportAAF(
      sequence,
      outputFilePath,
      false, // suppressUI
      false, // useLegacyAAFExport
      48000, // sampleRate
      16,    // bitsPerSample
      false,  // embedAudio
      0,      // audioFileFormat: 0=AIFF, 1=WAVE
      false,  // trimSources
      0,      // handleFrames: 0–1000
      "",     // videoMixdownPresetPath (optional)
      false,  /* renderAudioEffects (optional) */
      false,  /* interleaveWithoutEffects (optional) */
      false   /* preserveParentFolder (optional) */
    );
  } catch (e) {
    log(`Error exporting as AAF: ${e}`, "red");
    return false;
  }
}