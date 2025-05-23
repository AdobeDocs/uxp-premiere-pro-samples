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
import { getClipProjectItem, setFootageInterpretation } from "./projectPanel.js";
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

/*
  * Add media handles to both the start and end of a track item.  Adding a handle
  * value of 1 frame to the start and end will add 1 frame of media to the start
  * of the track item, and add 1 frame of media to the end of the track item.
  * 
  * To truncate clips, a negative offset value may be used (effectively removing,
  * rather than adding, media handles).
  * 
  * @param project The current working project
  * @param trackItem_toChange The target track item to modify
  * @param inpoint_offset_secs The amount of media to add to the start of the track item, in frames
  * @param outpoint_offset_secs The amount of media to add to the end of the track item, in frames
  * @returns boolean, where true indicates success, and false indicates faiure
  */
export async function addHandlesToTrackItem_usingTicks(
                                  project: Project, 
                                  sequence: Sequence,
                                  trackItem_toChange: VideoClipTrackItem | AudioClipTrackItem, 
                                  inpoint_offset_frames: number = 0, 
                                  outpoint_offset_frames: number = 0
                                ) {
  let success = false;
  
  if(trackItem_toChange){
  
    if ( !(Number.isInteger(inpoint_offset_frames)) || !(Number.isInteger(outpoint_offset_frames)) ){
      throw new Error("Frame offset arguments must be be integers.");
    }

    try{
      const ticks_per_sec = 254016000000;

      var projItem = await trackItem_toChange.getProjectItem();
      var clipProjItem = await ppro.ClipProjectItem.cast(projItem);

      var projItem_metadata = await ppro.Metadata.getProjectColumnsMetadata(projItem);
      var projItem_metadata_json = JSON.parse(projItem_metadata);
      var projItem_startTime;
      var projItem_endTime;
      
      var projItem_interpret = await clipProjItem.getFootageInterpretation();
      
      var projItem_timebase = await projItem_interpret.getFrameRate();
      var seq_timebase = ticks_per_sec/Number(await sequence.getTimebase());
      var projItem_Framerate = ppro.FrameRate.createWithValue(projItem_timebase);
      var seq_Framerate = ppro.FrameRate.createWithValue(seq_timebase);
      
      for (var currentMetadata of projItem_metadata_json){
        if (projItem_startTime && projItem_endTime){
          break;
        }else if (
          currentMetadata.ColumnID == "Column.Intrinsic.MediaStart" && 
          currentMetadata.ColumnName == "Media Start"
          ){
            projItem_startTime = ppro.TickTime.createWithTicks(currentMetadata.ColumnValue);
            
        }else if (
          currentMetadata.ColumnID == "Column.Intrinsic.MediaEnd" &&
          currentMetadata.ColumnName == "Media End"
          ){
            projItem_endTime = ppro.TickTime.createWithTicks(currentMetadata.ColumnValue);
        }
      }

      var trackItem_inPoint = await trackItem_toChange.getInPoint();
      var trackItem_outPoint = await trackItem_toChange.getOutPoint();

      var trackItem_inPoint_ticks_absolute = Number(trackItem_inPoint.ticks);
      var trackItem_outPoint_ticks_absolute = Number(trackItem_outPoint.ticks);
      var trackItem_inPoint_ticks_offset = Number(trackItem_inPoint.ticks) + Number(projItem_startTime.ticks);
      var trackItem_outPoint_ticks_offset = Number(trackItem_outPoint.ticks) + Number(projItem_startTime.ticks);

      var inpoint_offset_TickTime = ppro.TickTime.createWithFrameAndFrameRate(inpoint_offset_frames, projItem_Framerate);
      var outpoint_offset_TickTime = ppro.TickTime.createWithFrameAndFrameRate(outpoint_offset_frames, projItem_Framerate);
      var inpoint_offset_ticks = Number(inpoint_offset_TickTime.ticks);      
      var outpoint_offset_ticks = Number(outpoint_offset_TickTime.ticks);

      // we need to consider the source and sequence timebases, since we're adding handles at the sequence level,
      // but modifying the source in/out.
      //
      // For Example:  If with a sequence at 30FPS and a source clip at 60FPS, we need to add 60 frames of source
      // in order to add 30 frames of handle at the sequence level.
      var source_sequence_timebase_ratio = projItem_Framerate.value/seq_Framerate.value;

      // Compensate for source:sequence timebase ratio
      // var newInPoint_ticks_absolute = trackItem_inPoint_ticks_absolute - (inpoint_offset_ticks * source_sequence_timebase_ratio);
      // var newOutPoint_ticks_absolute = trackItem_outPoint_ticks_absolute + (outpoint_offset_ticks * source_sequence_timebase_ratio);
      // var newInPoint_ticks_offset = trackItem_inPoint_ticks_offset - (inpoint_offset_ticks * source_sequence_timebase_ratio);
      // var newOutPoint_ticks_offset = trackItem_outPoint_ticks_offset + (outpoint_offset_ticks* source_sequence_timebase_ratio);
      
      // Ignore source:sequence timebase ratio, and use source framerate only.
      var newInPoint_ticks_absolute = trackItem_inPoint_ticks_absolute - inpoint_offset_ticks;
      var newOutPoint_ticks_absolute = trackItem_outPoint_ticks_absolute + outpoint_offset_ticks;
      var newInPoint_ticks_offset = trackItem_inPoint_ticks_offset - inpoint_offset_ticks;
      var newOutPoint_ticks_offset = trackItem_outPoint_ticks_offset + outpoint_offset_ticks;


      if (
        (projItem_startTime != undefined && projItem_endTime != undefined) &&
        newInPoint_ticks_offset >= projItem_startTime.ticks &&
        newOutPoint_ticks_offset <= projItem_endTime.ticks &&
        newInPoint_ticks_offset <= newOutPoint_ticks_offset
      ){
        project.lockedAccess(() => {
          project.executeTransaction((compoundAction) => {
            
            var action1 = trackItem_toChange.createSetInPointAction(
              ppro.TickTime.createWithTicks(String(newInPoint_ticks_absolute))
            );

            var action2 = trackItem_toChange.createSetOutPointAction(
              ppro.TickTime.createWithTicks(String(newOutPoint_ticks_absolute))
            );

            compoundAction.addAction(action1);
            compoundAction.addAction(action2);
          }, `Add Handles [${inpoint_offset_frames}f, ${outpoint_offset_frames}f]`);
        
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
