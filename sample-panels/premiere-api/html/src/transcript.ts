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

import type { premierepro, Project } from "../types.d.ts";
import { getClipProjectItem } from "./projectPanel";
const ppro = require("premierepro") as premierepro;
import { log } from "./utils";

// To ensure successful import/export, please ensure your JSON follow 
// sample Adobe Transcript JSON file spec we provided.
export async function importTranscript(
  transcriptContent: string,
  project: Project
) {
  try {
    const clipProjectItem = await getClipProjectItem(project, true);
    if (!clipProjectItem) {
      console.error("No clip project item found to import transcript.");
      return;
    }
    let success = project.lockedAccess(() => {
      project.executeTransaction((compoundAction) => {
        const action = ppro.Transcript.createImportTextSegmentsAction(
          ppro.Transcript.importFromJSON(transcriptContent), // Convert to TextSegments
          clipProjectItem
        );
        compoundAction.addAction(action);
      }, "Import Transcript Action");
    });
    return success;
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }
}

export async function exportTranscript(project: Project) {
  try {
    const clipProjectItem = await getClipProjectItem(project, true);
    if (!clipProjectItem) {
      console.error("No clip project item found to export transcript.");
      return;
    }
    const transcript = await ppro.Transcript.exportToJSON(clipProjectItem);
    return transcript;
  } catch (err) {
    log(`Error: ${err}`, "red");
    return;
  }
}
