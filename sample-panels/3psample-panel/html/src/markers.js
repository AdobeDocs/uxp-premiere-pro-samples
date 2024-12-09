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

//Returning the sequence markers and clip markers objects from sequence and project root items respectivily
const { log } = require("/src/utils");

async function getMarkerObjects(project) {
  const rootItem = await project.getRootItem();
  const projectItems = await rootItem.getItems();

  if (projectItems.length === 0) {
    log("No project items found.", "red");
    return;
  }

  const projectItem = ppro.ClipProjectItem.cast(projectItems[0]);

  if (!projectItem) {
    log("No clip project item found.", "red");
    return;
  }

  const sequence = await project.getActiveSequence();
  if (!sequence) {
    log("No sequence found.", "red");
    return;
  }

  const sequenceMarkers = await ppro.Markers.getMarkers(sequence);
  const clipMarkers = await ppro.Markers.getMarkers(projectItem);

  if (!sequenceMarkers || !clipMarkers) {
    log("No Sequence Markers or Clip Markers found.", "red");
    return;
  }

  return { sequenceMarkers, clipMarkers };
}

async function createMarkerComment(project) {
  const { sequenceMarkers } = await getMarkerObjects(project);

  let success = false;

  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        const addMarkerAction = sequenceMarkers.createAddMarkerAction(
          "CommentMarker",
          ppro.Marker.MARKER_TYPE_COMMENT,
          ppro.TickTime.createWithSeconds(0.0),
          ppro.TickTime.TIME_ZERO,
          "This is a comment marker"
        );
        compoundAction.addAction(addMarkerAction);
      });
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

async function createMarkerChapter(project) {
  const { sequenceMarkers } = await getMarkerObjects(project);

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        const addMarkerAction = sequenceMarkers.createAddMarkerAction(
          "ChapterMarker",
          ppro.Marker.MARKER_TYPE_CHAPTER,
          ppro.TickTime.createWithSeconds(0.5),
          ppro.TickTime.TIME_ZERO,
          "This is a chapter marker"
        );
        compoundAction.addAction(addMarkerAction);
      });
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

async function createMarkerWeblink(project) {
  const { sequenceMarkers } = await getMarkerObjects(project);

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        const addMarkerAction = sequenceMarkers.createAddMarkerAction(
          "WeblinkMarker",
          ppro.Marker.MARKER_TYPE_WEBLINK,
          ppro.TickTime.createWithSeconds(1.0),
          ppro.TickTime.TIME_ZERO,
          "This is a weblink marker"
        );
        compoundAction.addAction(addMarkerAction);
      });
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

async function createMarkerFlashCuePoint(project) {
  const { sequenceMarkers } = await getMarkerObjects(project);

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        const addMarkerAction = sequenceMarkers.createAddMarkerAction(
          "FlashCuePointMarker",
          ppro.Marker.MARKER_TYPE_FLVCUEPOINT,
          ppro.TickTime.createWithSeconds(1.5),
          ppro.TickTime.TIME_ZERO,
          "This is a Flash Cue Point marker"
        );
        compoundAction.addAction(addMarkerAction);
      });
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

async function moveMarker(project) {
  const { sequenceMarkers } = await getMarkerObjects(project);

  let markerlist = await sequenceMarkers.getMarkers();
  let marker = markerlist[0];

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        const moveMarkerAction = sequenceMarkers.createMoveMarkerAction(
          marker,
          ppro.TickTime.createWithSeconds(3.0)
        );
        compoundAction.addAction(moveMarkerAction);
      });
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

async function removeMarker(project) {
  const { sequenceMarkers } = await getMarkerObjects(project);

  let markerlist = await sequenceMarkers.getMarkers();

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        for (let marker of markerlist) {
          const removeMarkerAction =
            sequenceMarkers.createRemoveMarkerAction(marker);
          compoundAction.addAction(removeMarkerAction);
        }
      });
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

module.exports = {
  createMarkerComment,
  createMarkerChapter,
  createMarkerWeblink,
  createMarkerFlashCuePoint,
  moveMarker,
  removeMarker,
};
