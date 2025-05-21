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
  Guid,
  premierepro,
  Project,
  Sequence,
  VideoClipTrackItem,
} from "../types.d.ts";
import { getProjectColumnsMetadata } from "./metadata.js";
import { getClipProjectItem } from "./projectPanel.js";
const ppro = require("premierepro") as premierepro;
import { log } from "./utils";

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

    return await project.createSequenceFromMedia(sequenceName, mediaItem);
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
  * Add media handles to both the start and end of a track item.  Adding a handle
  * value of 1 second to the start and end will add 1 second of media to the start
  * of the track item, and add 1 second of media to the end of the track item.
  * 
  * To truncate clips, a negative offset value may be used (effectively removing,
  * rather than adding, media handles).
  * 
  * @param project The current working project
  * @param trackItem_toChange The target track item to modify
  * @param inpoint_offset_secs The amount of media to add to the start of the track item, in seconds
  * @param outpoint_offset_secs The amount of media to add to the end of the track item, in seconds
  * @returns boolean, where true indicates success, and false indicates faiure
  */
export async function addHandlesToTrackItem(
                                  project: Project, 
                                  trackItem_toChange: VideoClipTrackItem | AudioClipTrackItem, 
                                  inpoint_offset_secs: number = 0.0, 
                                  outpoint_offset_secs: number = 0.0
                                ) {
  let success = false;
  
  if(trackItem_toChange){
  
    try{

      var projItem = await trackItem_toChange.getProjectItem();
      var projItem_metadata = await ppro.Metadata.getProjectColumnsMetadata(projItem);
      var projItem_metadata_json = JSON.parse(projItem_metadata);
      var projItem_startTime;
      var projItem_endTime;
      
      for (var currentMetadata of projItem_metadata_json){
        if (projItem_startTime && projItem_endTime){
          break;
        }else if (
          currentMetadata.ColumnID == "Column.Intrinsic.MediaStart" && 
          currentMetadata.ColumnName == "Media Start"
          ){
            projItem_startTime = ppro.TickTime.createWithTicks(currentMetadata.ColumnValue);
            ppro.TickTime.create
        }else if (
          currentMetadata.ColumnID == "Column.Intrinsic.MediaEnd" &&
          currentMetadata.ColumnName == "Media End"
          ){
            projItem_endTime = ppro.TickTime.createWithTicks(currentMetadata.ColumnValue);
        }
      }

      var trackItem_inPoint = await trackItem_toChange.getInPoint();
      var trackItem_outPoint = await trackItem_toChange.getOutPoint();

      var trackItem_inPoint_secs_absolute = trackItem_inPoint.seconds;
      var trackItem_outPoint_secs_absolute = trackItem_outPoint.seconds;
      var trackItem_inPoint_secs_offset = trackItem_inPoint.seconds + projItem_startTime.seconds;
      var trackItem_outPoint_secs_offset = trackItem_outPoint.seconds + projItem_startTime.seconds;

      var newInPoint_secs_absolute = trackItem_inPoint_secs_absolute - inpoint_offset_secs;
      var newOutPoint_secs_absolute = trackItem_outPoint_secs_absolute + outpoint_offset_secs;
      var newInPoint_secs_offset = trackItem_inPoint_secs_offset - inpoint_offset_secs;
      var newOutPoint_secs_offset = trackItem_outPoint_secs_offset + outpoint_offset_secs;

      if (
        (projItem_startTime != undefined && projItem_endTime != undefined) &&
        newInPoint_secs_offset >= projItem_startTime.seconds &&
        newOutPoint_secs_offset <= projItem_endTime.seconds &&
        newInPoint_secs_offset <= newOutPoint_secs_offset
      ){
        project.lockedAccess(() => {
          project.executeTransaction((compoundAction) => {
            
            var action1 = trackItem_toChange.createSetInPointAction(
              ppro.TickTime.createWithSeconds(newInPoint_secs_absolute)
            );

            var action2 = trackItem_toChange.createSetOutPointAction(
              ppro.TickTime.createWithSeconds(newOutPoint_secs_absolute)
            );

            compoundAction.addAction(action1);
            compoundAction.addAction(action2);
          }, `Add Handles [${inpoint_offset_secs}s, ${outpoint_offset_secs}s]`);
        
        success = true;
        })
      }else{
        log("Could not adjust trackItem in/out points due to media limits.", "red");
      }
    }catch (err) {
      log(err.toString(), "red");
    }
  }else{
    log("No track item provided.", "red")
  }

  return success;
}
