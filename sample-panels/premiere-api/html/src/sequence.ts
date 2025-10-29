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

import type {
  AudioClipTrackItem,
  ClipProjectItem,
  Guid,
  premierepro,
  Project,
  ProjectItem,
  Sequence,
  SequenceSettings,
  VideoClipTrackItem,
} from "../types.d.ts";
import { getClipProjectItem } from "./projectPanel.js";
const ppro = require("premierepro") as premierepro;
import { log } from "./utils";

const MEDIA_START_COLUMN_ID = "Column.Intrinsic.MediaStart";
const MEDIA_END_COLUMN_ID = "Column.Intrinsic.MediaEnd";

async function getInfoFromSettings(settings: SequenceSettings) {
  const frameRect = await settings.getVideoFrameRect();
  const par = await settings.getVideoPixelAspectRatio();
  const field = await settings.getVideoFieldType();
  const displayFormat = await settings.getVideoDisplayFormat();

  let fieldType = "No Fields";
  if (field == ppro.Constants.VideoFieldType.LOWER_FIRST) {
    fieldType = "Lower Field First";
  } else if (field == ppro.Constants.VideoFieldType.UPPER_FIRST) {
    fieldType = "Upper Field First";
  }

  let displayFormatType = "";
  switch (displayFormat.type) {
    case ppro.Constants.VideoDisplayFormatType.FEET_FRAME_16mm:
      displayFormatType = "Feet+Frames 16mm";
      break;
    case ppro.Constants.VideoDisplayFormatType.FEET_FRAME_35mm:
      displayFormatType = "Feet+Frames 35mm";
      break;
    case ppro.Constants.VideoDisplayFormatType.FPS_23_976:
      displayFormatType = "23.976 fps";
      break;
    case ppro.Constants.VideoDisplayFormatType.FPS_25:
      displayFormatType = "25 fps";
      break;
    case ppro.Constants.VideoDisplayFormatType.FPS_29_97:
      displayFormatType = "29.97 fps";
      break;
    case ppro.Constants.VideoDisplayFormatType.FPS_29_97_NON_DROP:
      displayFormatType = "29.97 fps Non-Drop-Frame Timecode";
      break;
    case ppro.Constants.VideoDisplayFormatType.FRAMES:
      displayFormatType = "Frames";
      break;
    default:
      displayFormatType = `Format Code: ${displayFormat.type}`;
      break;
  }

  return [
    `Video Frame Size: ${frameRect.height}; Horizontal ${frameRect.width}`,
    `Pixel Aspect Ratio: ${par}`,
    `Fields: ${fieldType}`,
    `Display Format: ${displayFormatType}`,
  ];
}

export async function getVideoSettingsInfo(sequence: Sequence) {
  const settings = await sequence.getSettings();
  return getInfoFromSettings(settings);
}

export async function setSequencePixelAsepctRatio(
  project: Project,
  sequence: Sequence
) {
  const settings = await sequence.getSettings();
  let success = false;
  try {
    success = await settings.setVideoPixelAspectRatio(
      ppro.Constants.PixelAspectRatio.SQUARE.toString()
    );
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        const setSettingsAction = sequence.createSetSettingsAction(settings);
        compoundAction.addAction(setSettingsAction);
      }, "set sequence pixel aspect ratio to square");
    });
  } catch (err) {
    log(err.toString(), "red");
  }
  return success;
}

export async function setSequenceInOutPoint(
  project: Project,
  sequence: Sequence
) {
  let success = false;
  try {
    const sequenceEnd = await sequence.getEndTime();
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        const setInPointAction = sequence.createSetInPointAction(
          ppro.TickTime.TIME_ZERO
        );
        const setOutPoitAction = sequence.createSetOutPointAction(sequenceEnd);
        compoundAction.addAction(setInPointAction);
        compoundAction.addAction(setOutPoitAction);
      }, "set sequence in point to 0 and out point to sequence end");
    });
  } catch (err) {
    log(err.toString(), "red");
  }
  return success;
}

export async function getSequence(project: Project, sequenceGuid: Guid) {
  if (project) {
    return await project.getSequence(sequenceGuid);
  } else {
    log("No project found.");
  }
}

export async function setActiveSequence(project: Project, sequence: Sequence) {
  if (project) {
    return await project.setActiveSequence(sequence);
  } else {
    log("No project found.");
  }
}

export async function createSequence(project: Project, sequenceName: string) {
  if (project) {
    return await project.createSequence(sequenceName);
  } else {
    log("No project found.");
  }
}

export async function createSequenceFromMedia(
  project: Project,
  sequenceName: string
) {
  if (project) {
    let mediaItem = await getClipProjectItem(project);
    if (!mediaItem) {
      log("No media item found in the project.");
      return;
    }

    return project.createSequenceFromMedia(sequenceName, [mediaItem]);
  } else {
    log("No project found.");
  }
}

// getVideoTrackCount() and getAudioTrackCount() are also available
export async function getCaptionTrackCount(sequence: Sequence) {
  if (sequence) {
    return await sequence.getCaptionTrackCount();
  } else {
    log("No sequence found.");
  }
}

//getCaptionTrack and getAudioTrack are also available
export async function getVideoTrack(sequence: Sequence, trackIndex: number) {
  if (sequence) {
    const videoTrackCount = await sequence.getVideoTrackCount();
    if (trackIndex + 1 > videoTrackCount) {
      log(`Video track index should be less than ${videoTrackCount}`);
      return;
    }

    return await sequence.getVideoTrack(trackIndex);
  } else {
    log("No sequence found.");
  }
}

export async function getSequenceSelection(sequence: Sequence) {
  if (sequence) {
    return sequence.getSelection();
  } else {
    log("No sequence found.");
  }
}

export async function setSequenceSelection(sequence: Sequence) {
  if (sequence) {
    let trackItemSelection = await sequence.getSelection();

    const videoTrack = await sequence.getVideoTrack(0);
    const videoTrackItems = videoTrack.getTrackItems(
      ppro.Constants.TrackItemType.CLIP,
      false
    );

    if (videoTrackItems.length === 0) {
      log(`No video tracks found for the sequence ${sequence.name}.`);
    }
    trackItemSelection.addItem(videoTrackItems[0], false);

    return await sequence.setSelection(trackItemSelection);
  } else {
    log("No sequence found.");
  }
}

export async function createSubsequence(sequence: Sequence) {
  if (sequence) {
    try {
      return await sequence.createSubsequence(true);
    } catch (err) {
      log("Error:" + err.toString());
    }
  } else {
    log("No sequence found.");
  }
}

export async function trimSelectedItem(project: Project, sequence: Sequence) {
  let success = false;
  if (sequence) {
    try {
      const selection = await sequence.getSelection();
      const items: Array<VideoClipTrackItem | AudioClipTrackItem> =
        await selection.getTrackItems();
      if (items.length > 0) {
        const oldEnd = await items[0].getEndTime();
        // Note: This is not the best approach for precise TickTime calculation for trim
        // We are working on method that offers direct TickTime object calculation
        // For precise time calculation, please refer to steps at addHandlesToTrackItem
        const newEnd = ppro.TickTime.createWithSeconds(oldEnd.seconds - 1.0);
        project.lockedAccess(() => {
          success = project.executeTransaction((compoundAction) => {
            var action1 = items[0].createSetEndAction(newEnd);
            compoundAction.addAction(action1);
          }, "Trim end of item by 1 second");
        });
      } else {
        throw new Error("no trackItem is selected at sequence");
      }
    } catch (err) {
      log(err.toString(), "red");
      return success;
    }
  } else {
    log("No sequence found.");
  }
  return success;
}

/*
 * Return media start and end time of input projectItem
 */
async function getMediaStartEndTime(projectItem: ProjectItem) {
  const projectItemMetadata = await ppro.Metadata.getProjectColumnsMetadata(
    projectItem
  );
  const projItemMetadataJson = JSON.parse(projectItemMetadata);
  let projItemStartTime;
  let projItemEndTime;
  for (let currentMetadata of projItemMetadataJson) {
    if (projItemStartTime && projItemEndTime) {
      break;
    } else if (currentMetadata.ColumnID == MEDIA_START_COLUMN_ID) {
      projItemStartTime = ppro.TickTime.createWithTicks(
        currentMetadata.ColumnValue
      );
    } else if (currentMetadata.ColumnID == MEDIA_END_COLUMN_ID) {
      projItemEndTime = ppro.TickTime.createWithTicks(
        currentMetadata.ColumnValue
      );
    }
  }
  return [projItemStartTime, projItemEndTime];
}

/*
 * Add media handles to both the start and end of a track item.  Adding a handle
 * value of 1 frame to the start and end will add 1 frame of media to the start
 * of the track item, and add 1 frame of media to the end of the track item.
 *
 * To truncate clips, a negative offset value may be used (effectively removing,
 * rather than adding, media handles).
 *
 * @param project The current working project
 * @param trackItemToChange The target track item to modify
 * @param inPointOffsetFrames The number of frames to add to the start of the track item in the sequence
 * @param outPointOffsetFrames The number of frames to add to the end of the track item in the sequence
 * @returns boolean, where true indicates success, and false indicates faiure
 */
export async function addHandlesToTrackItem(
  project: Project,
  sequence: Sequence,
  trackItemToChange: VideoClipTrackItem | AudioClipTrackItem,
  inPointOffsetFrames: number = 0,
  outPointOffsetFrames: number = 0
) {
  let success = false;

  if (trackItemToChange) {
    if (
      !Number.isInteger(inPointOffsetFrames) ||
      !Number.isInteger(outPointOffsetFrames)
    ) {
      throw new Error("Frame offset arguments must be integers.");
    }

    try {
      const ticksPerSec = 254016000000;
      const projItem = await trackItemToChange.getProjectItem();
      const clipProjItem: ClipProjectItem = await ppro.ClipProjectItem.cast(
        projItem
      );
      if (!clipProjItem) {
        throw new Error("Invalid trackItem type");
      }
      const [mediaStartTime, mediaEndTime] = await getMediaStartEndTime(
        projItem
      );
      // Get frame rate of media and sequence
      const footageInterpretation =
        await clipProjItem.getFootageInterpretation();
      const projItemTimeBase = await footageInterpretation.getFrameRate();
      const sequenceTimeBase =
        ticksPerSec / Number(await sequence.getTimebase());
      const projItemFrameRate =
        ppro.FrameRate.createWithValue(projItemTimeBase);
      const sequenceFrameRate =
        ppro.FrameRate.createWithValue(sequenceTimeBase);

      // Get in point ticks relative to media start.
      // Ex. Media starts at 1min and In point is set as 1min1s, in point = 1s
      const originalInPoint = await trackItemToChange.getInPoint();
      const originalOutPoint = await trackItemToChange.getOutPoint();
      const originalInPointTicks = originalInPoint.ticksNumber;
      const originalOutPointTicks = originalOutPoint.ticksNumber;

      // Get in point ticks in absolute value.
      // Ex. Media start starts at 1min, absolute in point value is 1min1s.
      const absoluteInPointTicks =
        originalInPointTicks + mediaStartTime.ticksNumber;
      const absoluteOutPointTicks =
        originalOutPointTicks + mediaStartTime.ticksNumber;

      const inPointOffset = ppro.TickTime.createWithFrameAndFrameRate(
        inPointOffsetFrames,
        projItemFrameRate
      );
      const outPointOffset = ppro.TickTime.createWithFrameAndFrameRate(
        outPointOffsetFrames,
        projItemFrameRate
      );

      // We need to consider the source and sequence timebases, since we're adding handles at the sequence level,
      // but using the source timebase to modify the in/out of the trackItem source to establish those handles.
      //
      // For Example:  With a sequence at 30FPS and a source clip at 60FPS, we need to add 60 frames of source
      // in order to add 30 frames of handle at the sequence level.
      // Calculate new In/Out points. Compensate for source:sequence timebase ratio.
      const sourceSeqTimeBaseRatio =
        projItemFrameRate.value / sequenceFrameRate.value;
      const inPointOffsetTicks =
        inPointOffset.ticksNumber * sourceSeqTimeBaseRatio;
      const outPointOffsetTicks =
        outPointOffset.ticksNumber * sourceSeqTimeBaseRatio;

      const newAbsInPointTicks = absoluteInPointTicks - inPointOffsetTicks;
      const newAbsOutPointTicks = absoluteOutPointTicks + outPointOffsetTicks;
      const newInPointTicks = originalInPointTicks - inPointOffsetTicks;
      const newOutPointTicks = originalOutPointTicks + outPointOffsetTicks;

      if (
        newAbsInPointTicks >= mediaStartTime.ticksNumber &&
        newAbsOutPointTicks <= mediaEndTime.ticksNumber
      ) {
        project.lockedAccess(() => {
          success = project.executeTransaction((compoundAction) => {
            var action1 = trackItemToChange.createSetInPointAction(
              ppro.TickTime.createWithTicks(String(newInPointTicks))
            );

            var action2 = trackItemToChange.createSetOutPointAction(
              ppro.TickTime.createWithTicks(String(newOutPointTicks))
            );
            compoundAction.addAction(action1);
            compoundAction.addAction(action2);
          }, `Add Handles [${inPointOffsetFrames}F, ${outPointOffsetFrames}F]`);
        });
      } else {
        log(
          "Could not adjust trackItem in/out points due to media limits.",
          "red"
        );
      }
    } catch (err) {
      log(err.toString(), "red");
    }
  } else {
    log("No track item provided.", "red");
  }
  return success;
}

export async function renameFirstSelectedTrackItem(
  project: Project,
  sequence: Sequence
) {
  const selection = await sequence.getSelection();
  const items = await selection.getTrackItems();
  if (items.length == 0) {
    log("No trackItem is selected for rename");
    return false;
  }
  let success = false;
  try {
    project.lockedAccess(() => {
      const renameAction = items[0].createSetNameAction("TrackItem 1");
      success = project.executeTransaction((compoundAction) => {
        compoundAction.addAction(renameAction);
      }, "rename trackItem to TrackItem 1");
    });
  } catch (error) {
    log(error, "red");
  }
  return success;
}
