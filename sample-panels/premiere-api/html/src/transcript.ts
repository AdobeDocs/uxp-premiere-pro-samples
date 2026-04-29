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

import type { premierepro, Project } from "@adobe/premierepro";
import { getClipProjectItem, getSelectedProjectItems } from "./projectPanel";
import { log } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ppro = require("premierepro") as premierepro;

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
    const success = project.lockedAccess(() => {
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

export async function hasTranscript(project: Project): Promise<void> {
  const projectItems = await getSelectedProjectItems(project);
  if (!projectItems || projectItems.length === 0) {
    log("Select at least one project item to check for a transcript.", "red");
    return;
  }

  for (const projectItem of projectItems) {
    const clipProjectItem = ppro.ClipProjectItem.cast(projectItem);
    if (!clipProjectItem) {
      continue;
    }

    if (ppro.Transcript.hasTranscript(clipProjectItem)) {
      log(`Clip "${clipProjectItem.name}" has a transcript.`, "green");
    } else {
      log(`Clip "${clipProjectItem.name}" does not have a transcript.`, "red");
    }
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
