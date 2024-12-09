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

const { log } = require("/src/utils");

async function getSequence(project, sequenceGuid) {
  if (project) {
    return await project.getSequence(sequenceGuid);
  } else {
    log("No project found.");
  }
}

async function setActiveSequence(project, sequence) {
  if (project) {
    return await project.setActiveSequence(sequence);
  } else {
    log("No project found.");
  }
}

async function createSequence(project, sequenceName) {
  if (project) {
    return await project.createSequence(sequenceName);
  } else {
    log("No project found.");
  }
}

async function createSequenceFromMedia(project, sequenceName) {
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
async function getCaptionTrackCount(sequence) {
  if (sequence) {
    return await sequence.getCaptionTrackCount();
  } else {
    log("No sequence found.");
  }
}

//getCaptionTrack and getAudioTrack are also available
async function getVideoTrack(sequence, trackIndex) {
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

async function getSequenceSelection(sequence) {
  if (sequence) {
    return await sequence.getSelection();
  } else {
    log("No sequence found.");
  }
}

async function setSequenceSelection(sequence) {
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

async function createSubsequence(sequence) {
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

module.exports = {
  getSequence,
  setActiveSequence,
  createSequence,
  createSequenceFromMedia,
  getCaptionTrackCount,
  getVideoTrack,
  getSequenceSelection,
  setSequenceSelection,
  createSubsequence,
};
