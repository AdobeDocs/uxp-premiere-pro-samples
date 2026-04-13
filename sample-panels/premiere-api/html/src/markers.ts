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
  Color,
  Guid,
  Marker,
  premierepro,
  Project,
  Sequence,
} from "../types.d.ts";
import { getClipProjectItem } from "./projectPanel.js";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ppro = require("premierepro") as premierepro;
import { log } from "./utils";

//Returning the sequence markers and clip markers objects from sequence and clip project items respectively
export async function getMarkerObjects(project: Project) {
  const projectItem = await getClipProjectItem(project);
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

export async function createMarkerComment(project) {
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

export async function createMarkerChapter(project: Project) {
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

export async function createMarkerWeblink(project: Project) {
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

export async function createMarkerFlashCuePoint(project: Project) {
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

export async function moveMarker(project: Project) {
  const { sequenceMarkers } = await getMarkerObjects(project);

  const markerlist: Array<Marker> = await sequenceMarkers.getMarkers();
  const marker = markerlist[0];

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

export async function removeMarker(project: Project) {
  const { sequenceMarkers } = await getMarkerObjects(project);

  const markerlist = await sequenceMarkers.getMarkers();

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        for (const marker of markerlist) {
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

export type MarkerInfo = {
  name: string;
  guid?: Guid;
  type: string;
  color: Color;
  colorIndex: number;
}

export async function getSequenceMarkerInfo(sequence: Sequence): Promise<MarkerInfo[]> {
  const markerInfos: MarkerInfo[] = [];
  try {
    const sequenceMarkersOwner = await ppro.Markers.getMarkers(sequence);
    const markers = sequenceMarkersOwner.getMarkers();
    for (const marker of markers) {
      const markerInfo: MarkerInfo = {
        name: marker.getName(),
        guid: marker.guid,
        type: marker.getType(),
        color: marker.getColor(),
        colorIndex: marker.getColorIndex(),
      };
      markerInfos.push(markerInfo);
    }
  } catch (error) {
    log(error, "red");
  }
  return markerInfos;
}

export async function setFirstSequenceMarkerColor(
  project: Project,
  sequence: Sequence
) {
  try {
    const sequenceMarkersOwner = await ppro.Markers.getMarkers(sequence);
    const markers = sequenceMarkersOwner.getMarkers();
    if (markers.length == 0) {
      log("No markers found in the sequence", "red");
      return false;
    }
    const firstMarker = markers[0];
    const success = project.lockedAccess(() => {
      project.executeTransaction((compoundAction) => {
        const setMarkerColorAction = firstMarker.createSetColorByIndexAction(
          ppro.Constants.MarkerColor.BLUE
        );
        compoundAction.addAction(setMarkerColorAction);
      }, "Set Marker Color to blue");
    });
    return success;
  } catch (error) {
    log(error, "red");
    return false;
  }
}
