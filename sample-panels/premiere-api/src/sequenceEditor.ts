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

import type {
  Action,
  AudioClipTrackItem,
  premierepro,
  Project,
  ProjectItem,
  Sequence,
  TickTime,
  VideoClipTrackItem,
} from "@adobe/premierepro";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ppro = require("premierepro") as premierepro;

import { getCurrentVideoClipTrackItemsSelected } from "./effects";
import { getSelectedProjectItems } from "./projectPanel";
import { log } from "./utils";

/**
 * Use first selected projectItem to create new trackItem that overwrites at V2/A2 of active sequence
 * Please note that input is NOT offset. Inputing 2 for video track index will always overwrite trackItem at V3.
 */
export async function overwriteTrackItem(project: Project) {
  let success = false;
  const sequence = await project.getActiveSequence();
  if (sequence) {
    try {
      const sequenceEditor = ppro.SequenceEditor.getEditor(sequence);
      const projectItems: Array<ProjectItem> = await getSelectedProjectItems(
        project
      );
      if (projectItems.length == 0) {
        throw new Error(
          "No projectItem selected in project panel for overwrite"
        );
      }
      project.lockedAccess(() => {
        success = project.executeTransaction((compoundAction) => {
          const overwriteItemAction = sequenceEditor.createOverwriteItemAction(
            projectItems[0], // projectItem reference for creating trackItem
            ppro.TickTime.TIME_ZERO, // Overwrite at beginning of timeline
            1, // video track index (V2)
            1 // audio track index (A2)
          );
          compoundAction.addAction(overwriteItemAction);
        }, "TrackItem Overwritten");
      });
    } catch (err) {
      log(`${err}`, "red");
      return false;
    }
  } else {
    log("No sequence available for edits", "red");
  }
  return success;
}

/**
 * Use first selected projectItem to create new trackItem to inserted at V2/A2 at active sequence
 * Please note that input is NOT offset. Inputing 2 for video track index will always insert new trackItem at V3.
 */
export async function insertTrackItem(project: Project) {
  let success = false;
  const sequence = await project.getActiveSequence();
  if (sequence) {
    try {
      const sequenceEditor = ppro.SequenceEditor.getEditor(sequence);
      const projectItems: Array<ProjectItem> = await getSelectedProjectItems(
        project
      );
      if (projectItems.length == 0) {
        throw new Error("No projectItem selected in project panel for insert");
      }
      project.lockedAccess(() => {
        success = project.executeTransaction((compoundAction) => {
          const insertItemAction = sequenceEditor.createInsertProjectItemAction(
            projectItems[0], // reference for creating trackItem for overwrite
            ppro.TickTime.TIME_ZERO, // time
            1, // video track index
            1, // audio track index
            true // limitedShift, don't shift non-input track for this insert
          );
          compoundAction.addAction(insertItemAction);
        }, "TrackItem Inserted");
      });
    } catch (err) {
      log(`${err}`, "red");
      return false;
    }
  } else {
    log("No sequence available for edits", "red");
  }
  return success;
}

/**
 * Clone first selected trackItem to another track (with index + 1) and 1 second leftward in time
 * Please note that input for this API is offset compared to input trackItem data, which could be negative.
 * For example, if input trackItem is located at V1, it will be cloned at V2.
 * If your input trackItem is located at V2, it will be cloned at V3.
 * If your input trackItem ends at 00:00:12:00, cloned item will end at 00:00:11:00.
 * If you do not specify for if it's insert or not, default is overwrite.
 */
export async function cloneSelectedTrackItem(project: Project) {
  let success = false;
  const sequence = await project.getActiveSequence();
  if (sequence) {
    try {
      const trackItemSelection = await sequence.getSelection();
      const selectedItems: Array<VideoClipTrackItem | AudioClipTrackItem> =
        await trackItemSelection.getTrackItems();
      if (selectedItems.length == 0) {
        throw new Error("No trackItem is selected at sequence for clone");
      }
      const sequenceEditor = ppro.SequenceEditor.getEditor(sequence);
      const timeOffset = ppro.TickTime.createWithSeconds(-1);
      project.lockedAccess(() => {
        success = project.executeTransaction((compoundAction) => {
          const cloneItemAction = sequenceEditor.createCloneTrackItemAction(
            selectedItems[0], // use first selected trackItem for clone
            timeOffset, // shift it 1s leftward
            1, // new trackItem video track index go up by 1 if apply
            1, // new trackItem audio track index go up by 1 if apply
            true, // alignToVideo
            true // Insert, not overwrite
          );
          compoundAction.addAction(cloneItemAction);
        }, "TrackItem cloned");
      });
    } catch (err) {
      log(`${err}`, "red");
      return false;
    }
  } else {
    log("No sequence available for edits", "red");
  }
  return success;
}

/**
 * Remove selected trackItems at active sequence by ripple delete
 */
export async function removeSelectedTrackItems(project: Project) {
  let success = false;
  const sequence = await project.getActiveSequence();
  if (sequence) {
    try {
      const trackItemSelection = await sequence.getSelection();
      const selectedItems: Array<VideoClipTrackItem | AudioClipTrackItem> =
        await trackItemSelection.getTrackItems();
      if (selectedItems.length == 0) {
        throw new Error("No trackItem is selected at sequence for removal");
      }
      const sequenceEditor = ppro.SequenceEditor.getEditor(sequence);
      project.lockedAccess(() => {
        success = project.executeTransaction((compoundAction) => {
          const removeItemAction = sequenceEditor.createRemoveItemsAction(
            trackItemSelection, // selection of items to be removed
            true, // ripple delete
            ppro.Constants.MediaType.VIDEO // align moved track items to the start of the nearest video frame
          );
          compoundAction.addAction(removeItemAction);
        }, "TrackItem removed");
      });
    } catch (err) {
      log(`${err}`, "red");
      return false;
    }
  } else {
    log("No sequence available for edits", "red");
  }
  return success;
}

/**
 * Insert mogrt at active sequence V2
 */
export async function insertMogrt(project: Project, mogrtPath: string) {
  let mogrtItems = [];
  const sequence = await project.getActiveSequence();
  if (sequence) {
    try {
      const sequenceEditor = ppro.SequenceEditor.getEditor(sequence);
      project.lockedAccess(() => {
        mogrtItems = sequenceEditor.insertMogrtFromPath(
          mogrtPath, // path to mogrt file
          ppro.TickTime.TIME_ZERO, // time to insert at
          1, // video track index
          1 // audio track index
        );
      });
    } catch (err) {
      log(`${err}`, "red");
      return false;
    }
  } else {
    log("No sequence available for edits", "red");
  }
  return mogrtItems.length > 0;
}

/**
 * Timeline midpoint of the first selected video clip, or undefined if nothing
 * is selected.
 */
async function getSelectedClipMidpoint(sequence: Sequence): Promise<TickTime | undefined> {
  const [trackItem] = await getCurrentVideoClipTrackItemsSelected(sequence);
  if (!trackItem) {
    return undefined;
  }
  const start = await trackItem.getStartTime();
  const end = await trackItem.getEndTime();
  return start.add(end.subtract(start).divide(2));
}

/**
 * Razor every video and audio track at the midpoint of the selected clip, as
 * a single undo step.
 *
 * Each track gets its own createRazorTrackAction; razorLinkedTrackItems keeps
 * A/V links intact, and the repeat cut it causes on an already-razored linked
 * track is a no-op.
 *
 * @param project - The project to perform razor actions against
 * @return
 * @since 27.1
 */
export async function razorAllTracksAtSelection(project: Project): Promise<boolean> {
  const sequence = await project.getActiveSequence();
  if (!sequence) {
    log("No sequence available for edits", "red");
    return false;
  }

  const razorPosition = await getSelectedClipMidpoint(sequence);
  if (!razorPosition) {
    log("Select a video clip to razor at its midpoint", "red");
    return false;
  }

  const videoTrackCount = await sequence.getVideoTrackCount();
  const audioTrackCount = await sequence.getAudioTrackCount();
  const editor = ppro.SequenceEditor.getEditor(sequence);

  let success = false;
  try {
    project.lockedAccess(() => {
      const actions: Action[] = [];
      for (let i = 0; i < videoTrackCount; i++) {
        actions.push(
          // @ts-expect-error - not typed yet!
          editor.createRazorTrackAction(
            ppro.Constants.MediaType.VIDEO,
            i,
            razorPosition,
            true, // razorLinkedTrackItems
            ppro.Constants.MediaType.VIDEO // alignToMediaType
          )
        );
      }
      for (let i = 0; i < audioTrackCount; i++) {
        actions.push(
          // @ts-expect-error - not typed yet!
          editor.createRazorTrackAction(
            ppro.Constants.MediaType.AUDIO,
            i,
            razorPosition,
            true,
            ppro.Constants.MediaType.VIDEO // keep audio cuts on video frame boundaries
          )
        );
      }

      success = project.executeTransaction((compoundAction) => {
        actions.forEach((action) => compoundAction.addAction(action));
      }, "Razor All Tracks");
    });
  } catch (err) {
    log(`${err}`, "red");
  }
  return success;
}

/**
 * Razor every video track at the midpoint of the selected clip with one action.
 *
 * Audio is left untouched, so linked audio stays whole beneath the cut.
 *
 * @param project - The project to perform razor actions against
 * @return
 * @since 27.1
 */
export async function razorVideoTracksAtSelection(project: Project): Promise<boolean> {
  const sequence = await project.getActiveSequence();
  if (!sequence) {
    log("No sequence available for edits", "red");
    return false;
  }

  const razorPosition = await getSelectedClipMidpoint(sequence);
  if (!razorPosition) {
    log("Select a video clip to razor at its midpoint", "red");
    return false;
  }

  const editor = ppro.SequenceEditor.getEditor(sequence);

  let success = false;
  try {
    project.lockedAccess(() => {
      // @ts-expect-error - not typed yet!
      const action = editor.createRazorAllTracksAction(
        ppro.Constants.MediaType.VIDEO,
        razorPosition,
        ppro.Constants.MediaType.VIDEO
      );
      success = project.executeTransaction((compoundAction) => {
        compoundAction.addAction(action);
      }, "Razor All Video Tracks");
    });
  } catch (err) {
    log(`${err}`, "red");
  }
  return success;
}
