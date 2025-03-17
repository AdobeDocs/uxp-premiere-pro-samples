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

import type { premierepro, Project, Sequence } from "../types.d.ts";
const ppro = require("premierepro") as premierepro;
import { log } from "./utils";

export async function getSequence(project: Project, sequenceGuid: string) {
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
    const rootItem = await project.getRootItem();
    const projectItems = await rootItem.getItems();

    let mediaItem;
    for (let projectItem of projectItems) {
      const clipProjectItem = ppro.ClipProjectItem.cast(projectItem);
      if (
        clipProjectItem &&
        (await clipProjectItem.getContentType()) ===
          ppro.Constants.ContentType.MEDIA
      ) {
        mediaItem = clipProjectItem;
      }
    }

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
