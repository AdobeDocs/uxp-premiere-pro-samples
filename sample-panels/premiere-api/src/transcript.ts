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

/**
 * Attempt to transcribe all selected (Clip) Project Items for the given `project`.
 * 
 * Only `ClipProjectItem`s which are _not_ themselves `Sequence`s can be
 * processed here and will be skipped. Multiple selected clips may be queued
 * before being transcribed. Larger clips may take longer to transcribe.
 * 
 * NOTE: Because large clips may take seconds to minutes to process, this
 * function does not await on
 * 
 * Log messages are printed to the UI console to cover various scenarios and
 * provide details as far as clip detection and transcription processing goes.
 * 
 * @param project The project to get the current selection from
 * @returns A Promise which resolves after processing all
 */
export async function transcribeClipProjectItem(project: Project): Promise<PromiseSettledResult<void>[]> {
  const projectItems = await getSelectedProjectItems(project);
  if (!projectItems || projectItems.length === 0) {
    log("Select at least one clip project item to transcribe.", "red");
    return [];
  }

  let count = 0;
  const promises = [];
  for (const projectItem of projectItems) {
    const clipProjectItem = ppro.ClipProjectItem.cast(projectItem);
    if (!clipProjectItem) {
      continue;
    }

    if (await clipProjectItem.isSequence()) {
      log(`Clip "${clipProjectItem.name}" is a sequence and cannot be transcribed directly.`, "red");
      continue;
    }

    if (ppro.Transcript.hasTranscript(clipProjectItem)) {
      log(`Clip "${clipProjectItem.name}" already has a transcript available.`);
    } else {
      // Default to using the current language code preference
      // Fire and forget since transcriptions may get queued if many clips are selected
      const promise = ppro.Transcript.transcribeClipProjectItem(clipProjectItem, /* options */).then(
        (success: boolean) => {
          if (success) {
            log(`Successfully transribed clip "${clipProjectItem.name}"`, "green");
          } else {
            log(`Failed to transcribe clip "${clipProjectItem.name}"`, "red");
          }
        },
        (err: string | Error) => {
          log(`Failed to transcribe clip "${clipProjectItem.name}": ${err}`, "red");

          throw err;
        }
      );
      promises.push(promise);
      count += 1;
    }
  }

  if (count > 0) {
    log(`Transcription started for ${count} clip(s).`, "green");
  } else {
    log(`Transcription skipped; all selected Project Items are either transcribed or are not Clips`, "red");
  }

  return Promise.allSettled(promises);
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
