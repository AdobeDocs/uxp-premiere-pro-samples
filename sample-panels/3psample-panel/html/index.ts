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
/// <reference path="./types.d.ts" />
//module imports
import { log, clearLog, registerClick } from "./src/utils";
import {
  openProject,
  openInputProject,
  getActiveProject,
  getActiveSequence,
  getProjectFromId,
  getInsertionBin,
  getAllSequences,
  openSequence,
  pauseGrowing,
  saveProject,
  saveAsProject,
  getSupportedGraphicsWhiteLuminances,
  getCurrentGraphicsWhiteLuminance,
  closeProject,
} from "./src/project";

import {
  getSequence,
  setActiveSequence,
  createSequence,
  createSequenceFromMedia,
  getCaptionTrackCount,
  getVideoTrack,
  getSequenceSelection,
  setSequenceSelection,
  createSubsequence,
  trimSelectedItem,
  addHandlesToTrackItem,
} from "./src/sequence";

import {
  createMarkerComment,
  createMarkerChapter,
  createMarkerWeblink,
  createMarkerFlashCuePoint,
  moveMarker,
  removeMarker,
} from "./src/markers";
import {
  getProjectItems,
  getSelectedProjectItems,
  getMediaFilePath,
  createBin,
  createSmartBin,
  renameBin,
  removeItem,
  moveItem,
  setInOutPoint,
  clearInOutPoint,
  setScaleToFrameSize,
  refreshMedia,
  setFootageInterpretation,
  setOverrideFrameRate,
  setOverridePixelAspectRatio,
  attachProxy,
  changeMediaFilePath,
  getProjectViewIds,
  getProjectFromViewId,
  getSelectedProjectItemsFromViewId,
} from "./src/projectPanel";

import {
  addPropertiesToMetadataSchema,
  setProjectPanelMetadata,
  setProjectMetadata,
  setXMPMetadata,
  getProjectPanelMetadata,
  getProjectMetadata,
  getXMPMetadata,
  getProjectColumnsMetadata,
} from "./src/metadata";

import {
  getProjectItemAtSourceMonitor,
  openFilePath,
  openProjectItem,
  play,
  getPosition,
  closeClip,
  closeAllClips,
} from "./src/sourceMonitor";

import {
  setValue,
  getStartValue,
  addKeyframe,
  getKeyframes,
  getKeyframe,
  setInterpolation,
} from "./src/keyframe";

import {
  getEffectsName,
  addEffects,
  addMultipleEffects,
  removeEffects,
} from "./src/effects";

import {
  getTransitionNames,
  addTransitionStart,
  addTransitionEnd,
  removeTransitionStart,
} from "./src/transition";

import {
  getSequenceSampleProperty,
  setSampleSequenceProperty,
  clearSampleSequenceProperty,
} from "./src/properties";

import {
  getScratchDiskSetting,
  setScratchDiskSettings,
  getIngestEnabled,
  setIngestEnabled,
} from "./src/settings";

import { addProjSeqListeners, addEncoderListeners } from "./src/eventManager";

import {
  exportSequenceFrame,
  exportSequence,
  getExportFileExtension,
} from "./src/export";

import {
  importFiles,
  importSequences,
  importAeComponent,
  importAllAeComponents,
} from "./src/import";

import {
  getPreferenceSetting,
  setPreferenceSetting,
} from "./src/appPreference";

import {
  overwriteTrackItem,
  insertTrackItem,
  cloneSelectedTrackItem,
  removeSelectedTrackItems,
} from "./src/sequenceEditor";

//global objects.
import type {
  premierepro,
  ProjectItem,
  Guid,
  Sequence,
  VideoClipTrackItem,
  AudioClipTrackItem,
  TrackItemSelection,
} from "./types.d.ts";
const ppro = require("premierepro") as premierepro;
const uxp = require("uxp") as typeof import("uxp");

//project button events
async function openProjectClicked() {
  const project = await openProject();
  if (project) {
    log(`Project "${project.name} opened successfully`);
  } else {
    log(`Failed to open the project`, "red");
  }
}

async function getActiveProjectClicked() {
  const activeProject = await getActiveProject();
  if (activeProject) {
    log(`Active project is "${activeProject.name}"`);
  } else {
    log(`Failed to find active project`, "red");
  }
}

async function getActiveSequenceClicked() {
  const project = await getProject();
  if (!project) return;

  const activeSequence = await getActiveSequence(project);
  if (activeSequence) {
    log(`Active sequence is "${activeSequence.name}"`);
  } else {
    log(`Failed to find active sequence`, "red");
  }
}

async function getProjectFromIdClicked() {
  const baseProject = await getProject();
  const projectId = baseProject.guid;

  const project = await getProjectFromId(projectId);
  if (project) {
    log(`Project is "${project.name}" for the projectid: ${projectId}`);
  } else {
    log(`Failed to find the project for the id ${projectId}`, "red");
  }
}

async function getInsertionBinClicked() {
  const project = await getProject();
  if (!project) return;

  const folder = await getInsertionBin(project);
  if (folder) {
    log(`Folder name is "${folder.name}"`);
  } else {
    log(`No folder found`, "red");
  }
}

async function getAllSequencesClicked() {
  const project = await getProject();
  if (!project) return;

  const sequences: Array<Sequence> = await getAllSequences(project);
  if (sequences.length === 0) {
    log("No sequences found.", "red");
  } else {
    log("Sequences are: ");
    sequences.forEach((sequence, index) => {
      log(`${index + 1}. Sequence ${sequence.name}`);
    });
  }
}

async function openSequenceClicked() {
  const project = await getProject();
  if (!project) return;

  const sequences = await getAllSequences(project);
  if (sequences.length === 0) {
    log("No sequences found.", "red");
    return;
  }
  if (sequences.length === 1) {
    log(
      `Please have at least 2 sequences for this project ${project.name}.`,
      "orange"
    );
    return;
  }
  const activeSequence: Sequence = await getActiveSequence(project);
  if (!activeSequence) {
    log(`Failed to find active sequence`, "red");
    return;
  }

  const proposedSequence: Sequence = sequences.find(
    (seq: Sequence) => seq.name != activeSequence.name
  );

  if (!proposedSequence) {
    log(`Failed to find the proposed sequence`, "red");
    return;
  }

  log(`Trying to open sequence ${proposedSequence.name}`);

  const success = await openSequence(project, proposedSequence);
  if (!success) {
    log(`Open sequence ${proposedSequence.name} failed`, "red");
    return;
  }

  const newActiveSequence = await getActiveSequence(project);
  log(
    newActiveSequence && proposedSequence.name === newActiveSequence.name
      ? `Sequence ${newActiveSequence.name} opened`
      : `Failed to open ${newActiveSequence.name}`
  );
}

//Can also be used to unpause by passing false.
async function pauseGrowingClicked() {
  const project = await getProject();
  if (!project) return;

  let success = await pauseGrowing(true, project);
  log(
    success
      ? `Stopped the project file (${project.name}) from growing further to prevent it from becoming too large, and switched to a new file.`
      : `Failed to pause file growing for project ${project.name}`
  );
}

async function saveProjectClicked() {
  const project = await getProject();
  if (!project) return;

  let success = await saveProject(project);
  log(
    success
      ? `Project ${project.name} successfully`
      : `Failed to save project ${project.name}`
  );
}

async function saveAsProjectClicked() {
  const project = await getProject();
  if (!project) return;

  let success = await saveAsProject(project);
  log(
    success
      ? `Project ${project.name} saved as successfully`
      : `Failed to do save as project ${project.name}`
  );
}

async function getSupportedGraphicsWhiteLuminancesClicked() {
  const project = await getProject();
  if (!project) return;

  let supportedColors = await getSupportedGraphicsWhiteLuminances(project);
  if (supportedColors.length === 0) {
    log("No supported colors found.", "red");
    return;
  }

  supportedColors.forEach((color, index) => {
    log(`${index + 1}. Color: ${color}`);
  });
}

async function getCurrentGraphicsWhiteLuminanceClicked() {
  const project = await getProject();
  if (!project) return;

  const color = await getCurrentGraphicsWhiteLuminance(project);
  log(
    color
      ? `Current white luminance value: ${color}`
      : "No white luminance value found"
  );
}

async function closeProjectClicked() {
  const project = await getProject();
  if (!project) return;

  const projName = project.name;
  await closeProject(project);
  log(`Project "${projName}" is closed.`);
}

//sequence button events
async function getSequenceClicked() {
  const project = await getProject();
  if (!project) return;

  //Finding the last sequence id
  let sequenceGuid: Guid;
  const sequences = await getAllSequences(project);
  sequences.forEach((sequence: Sequence) => {
    sequenceGuid = sequence.guid;
  });

  if (!sequenceGuid) {
    log(`No sequences found`);
    return;
  }

  log(`Trying to get sequence from sequence id ${sequenceGuid.toString()}`);

  const sequence = await getSequence(project, sequenceGuid);
  log(
    sequence
      ? `Sequence ${sequence.name} found`
      : `No sequence found for id ${sequenceGuid.toString()}`
  );
}

async function setActiveSequenceClicked() {
  const project = await getProject();
  if (!project) return;

  //Finding the last sequence id
  let proposedSequence;
  const sequences = await getAllSequences(project);
  sequences.forEach((sequence) => {
    proposedSequence = sequence;
  });

  if (!proposedSequence) {
    log(`No sequences found to set active sequence`);
    return;
  }

  log(
    `Trying to set active sequence from last sequence ${proposedSequence.name}`
  );

  const success = await setActiveSequence(project, proposedSequence);
  log(
    success
      ? `Set active sequence to "${proposedSequence.name}" (last sequence found)`
      : `Error setting active sequence for id ${proposedSequence.name}`
  );
}

async function createSequenceClicked() {
  const project = await getProject();
  if (!project) return;

  const sequenceName = `Sequence-${new Date().toLocaleString()}`;
  const sequence = await createSequence(project, sequenceName);
  log(
    sequence
      ? `Sequence ${sequence.name} created successfully`
      : `Error creating sequence`
  );
}

async function createSequenceFromMediaClicked() {
  const project = await getProject();
  if (!project) return;

  const sequenceName = `Sequence-${new Date().toLocaleString()}`;
  const sequence = await createSequenceFromMedia(project, sequenceName);
  log(
    sequence
      ? `Sequence ${sequence.name} created successfully`
      : `Error creating sequence`
  );
}

async function getCaptionTrackCountClicked() {
  const project = await getProject();
  if (!project) return;

  const sequence = await project.getActiveSequence();
  const captionTrackCount = await getCaptionTrackCount(sequence);
  log(
    captionTrackCount > 0
      ? `Number of caption tracks found: ${captionTrackCount}`
      : `No caption tracks found`
  );
}

async function getVideoTrackClicked() {
  const project = await getProject();
  if (!project) return;

  const sequence = await project.getActiveSequence();
  const videoTrack = await getVideoTrack(sequence, 0);
  log(
    videoTrack
      ? `First video track found: "${videoTrack.name}"`
      : `No video track found`
  );
}

async function getSequenceSelectionClicked() {
  const project = await getProject();
  if (!project) return;

  const sequence = await project.getActiveSequence();
  let trackItemSelection = await getSequenceSelection(sequence);
  let trackItems = await trackItemSelection.getTrackItems();
  if (!trackItems.length) {
    log("No track items selected", "red");
    return;
  }
  log(`Selected TrackItems:\n`);
  trackItems.forEach(
    async (item: VideoClipTrackItem | AudioClipTrackItem, index) => {
      let name = await item.getName();
      log(`    ${index + 1}: ${name}\n`);
    }
  );
}

async function setSequenceSelectionClicked() {
  const project = await getProject();
  if (!project) return;

  const sequence = await project.getActiveSequence();
  let success = await setSequenceSelection(sequence);
  log(
    success
      ? `Successfully set the selection for sequence ${sequence.name}`
      : `Could not set selection for sequence ${sequence.name}`
  );
}

async function createSubsequenceClicked() {
  const project = await getProject();
  if (!project) return;

  const sequence = await project.getActiveSequence();
  let newSequence = await createSubsequence(sequence);
  log(
    newSequence
      ? `Sub sequence created with ${newSequence.name}`
      : `Could not create sub sequence`
  );
}

async function overwriteItemClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await overwriteTrackItem(project);
  log(
    success
      ? "New trackItem overwrote item at V2/A2 of active sequence"
      : "Failed to overwrite trackItem in active sequence"
  );
}

async function insertItemClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await insertTrackItem(project);
  log(
    success
      ? "New trackItem is inserted at V2/A2 of active sequence"
      : "Failed to insert trackItem in active sequence"
  );
}

async function cloneSelectedItemClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await cloneSelectedTrackItem(project);
  log(
    success
      ? "Selected trackItem is cloned at track of active sequence"
      : "Failed to clone the trackItem in active sequence"
  );
}

async function removeSelectedItemClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await removeSelectedTrackItems(project);
  log(
    success
      ? "Selected trackItems are removed at active sequence"
      : "Failed to remove selected trackItems at active sequence"
  );
}

async function trimSelectedItemClicked() {
  const project = await getProject();
  const sequence = await getActiveSequence(project);
  if (!project) return;

  const success = await trimSelectedItem(project, sequence);
  log(
    success
      ? "First selected trackItem is trimmed and shortened by 1s"
      : "Failed to trim selected trackItem at active sequence"
  );
}

async function trimHandlesClicked(callback) {
  var success = false;
  const project = await getProject();
  if (!project) return;

  const sequence = await getActiveSequence(project);

  const selection = await sequence.getSelection();
  const items: Array<VideoClipTrackItem | AudioClipTrackItem> =
    await selection.getTrackItems();
    
  if (items.length > 0) {
    const trackItem_toChange = items[0];

    var inPointOffset = -20;
    var outPointOffset = -20;

    success = await addHandlesToTrackItem(project, sequence, trackItem_toChange, inPointOffset, outPointOffset);
  } else {
    log("No trackItem selected.", "red");
    throw new Error("no trackItem is selected at sequence");
  }

  if (success){
    log(`First trackItem handles were changed by ${inPointOffset} frame(s) at head and ${outPointOffset} frame(s) at the tail.`);
  }else{
    log("Failed to trim first selected trackItem.", "red");
  }
}

//marker button events
async function createMarkerCommentClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await createMarkerComment(project);
  log(
    success ? "Add comment marker successfull" : "Failed to add comment marker"
  );
}

async function createMarkerChapterClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await createMarkerChapter(project);
  log(
    success ? "Add chapter marker successfull" : "Failed to add chapter marker"
  );
}

async function createMarkerWeblinkClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await createMarkerWeblink(project);
  log(
    success ? "Add weblink marker successfull" : "Failed to add weblink marker"
  );
}

async function createMarkerFlashCuePointClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await createMarkerFlashCuePoint(project);
  log(
    success
      ? "Add flash cue point marker successfull"
      : "Failed to add flash cue point marker"
  );
}

async function moveMarkerClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await moveMarker(project);
  log(success ? "Move marker successfull" : "Failed to move marker");
}

async function removeMarkerClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await removeMarker(project);
  log(success ? "Remove marker successfull" : "Failed to remove marker");
}

async function getProjectItemsClicked() {
  const project = await getProject();
  if (!project) return;

  const projectItems: Array<ProjectItem> = await getProjectItems(project);
  if (!projectItems.length) {
    log("No project items found", "red");
    return;
  }
  log("Project Item read is successfull");
  projectItems.forEach((item, index) => {
    log(`   ${index + 1}: ${item.name}`);
  });
}

async function getSelectedProjectItemsClicked() {
  const project = await getProject();
  if (!project) return;

  const projectItems: Array<ProjectItem> = await getSelectedProjectItems(
    project
  );
  if (!projectItems.length) {
    log("No project items found", "red");
    return;
  }
  log("Project Item read is successfull");
  projectItems.forEach((item, index) => {
    log(`   ${index + 1}: ${item.name}`);
  });
}

async function getMediaFilePathClicked() {
  const project = await getProject();
  if (!project) return;

  const path = await getMediaFilePath(project);
  if (path == null) {
    log("No media project item available for getting path");
  } else {
    log(`Path of project item is ${path}`);
  }
}

async function createBinClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await createBin(project);
  if (!success) {
    log("Failed to create Bin", "red");
    return;
  }
  log("Successfully created a new bin");
}

async function createSmartBinClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await createSmartBin(project);
  if (!success) {
    log("Failed to create smart Bin", "red");
    return;
  }
  log("Successfully created a new smart bin");
}

async function renameBinClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await renameBin(project);
  if (!success) {
    log("Failed to rename Bin", "red");
    return;
  }
  log("Successfully renamed the bin");
}

async function removeItemClicked() {
  const project = await getProject();
  if (!project) return;

  await removeItem(project);
}

async function moveItemClicked() {
  const project = await getProject();
  if (!project) return;

  await moveItem(project);
}

async function setInOutPointClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await setInOutPoint(project);
  if (!success) {
    log("Failed to set In Out Points", "red");
    return;
  }
  log("Successfully set In Out points");
}

async function clearInOutPointClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await clearInOutPoint(project);
  if (!success) {
    log("Failed to clear In Out Points", "red");
    return;
  }
  log("Successfully cleared In Out points");
}
async function setScaleToFrameSizeClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await setScaleToFrameSize(project);
  if (!success) {
    log("Failed to set scale to frame size", "red");
    return;
  }
  log("Successfully set scale to frame size");
}

async function refreshMediaClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await refreshMedia(project);
  if (!success) {
    log("Failed to refresh media", "red");
    return;
  }
  log("Successfully refreshed media");
}

async function setFootageInterpretationClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await setFootageInterpretation(project);
  if (!success) {
    log("Failed to set footage interpretation", "red");
    return;
  }
  log("Successfully set footage interpretation");
}

async function attachProxyClicked() {
  const project = await getProject();
  if (!project) return;

  let proxyFile;
  log("Please select media file to attach as proxy");
  const file = await uxp.storage.localFileSystem.getFileForOpening();
  if (file && file.isFile && file.nativePath) {
    proxyFile = file.nativePath;
  } else {
    log("Selection of proxy file failed. Please try again");
    return;
  }

  const success = await attachProxy(project, proxyFile);
  log(
    success
      ? "Successfully attached new proxy to projectItem"
      : "Failed to attach proxy"
  );
}

async function changePathClicked() {
  const project = await getProject();
  if (!project) return;

  let mediaFile;
  log("Please select media file for the change of media file path");
  const file = await uxp.storage.localFileSystem.getFileForOpening();
  if (file && file.isFile && file.nativePath) {
    mediaFile = file.nativePath;
  } else {
    log("Selection of new media file failed. Please try again");
    return;
  }

  const success = await changeMediaFilePath(project, mediaFile);
  log(
    success
      ? "Successfully changed media file path"
      : "Failed to change media file path of projectItem"
  );
}

async function getProjectViewIdsClicked() {
  const viewIds: Array<Guid> = await getProjectViewIds();
  if (viewIds.length == 0) {
    log("No project view available for getting ids", "red");
    return;
  }
  viewIds.forEach((viewGuid, index) => {
    log(`    ${index + 1}: ${viewGuid.toString()}`);
  });
}

async function getProjectFromViewIdClicked() {
  // get project from first view id found
  const viewIds: Array<Guid> = await getProjectViewIds();
  if (viewIds.length == 0) {
    log("No project view found for getting project", "red");
    return;
  }
  const projectViewId = viewIds[0];
  const project = await getProjectFromViewId(projectViewId);
  if (project) {
    log(
      `Project is "${project.name}" for the project view id: ${projectViewId}`
    );
  } else {
    log(`Failed to find the project for the id ${projectViewId}`, "red");
  }
}

async function getSelectionFromViewIdClicked() {
  // get selected projectItems from first view id found
  const viewIds: Array<Guid> = await getProjectViewIds();
  if (viewIds.length == 0) {
    log("No project view found.", "red");
    return;
  }
  const projectViewId = viewIds[0];
  const selectedItems: Array<ProjectItem> =
    await getSelectedProjectItemsFromViewId(projectViewId);
  if (selectedItems.length == 0) {
    log(`No item is selected for project view with id ${projectViewId}`);
    return;
  }
  selectedItems.forEach((item, index) => {
    log(`   ${index + 1}: ${item.name}`);
  });
}

//metadata button events
async function getProjectMetadataClicked() {
  const project = await getProject();
  if (!project) return;

  const metadata = await getProjectMetadata(project);
  if (metadata) {
    try {
      await navigator.clipboard.write({ "text/plain": metadata });
      log(`Project metadata copied to clipboard`);
    } catch {
      log("Failed to copy Project metadata to clipboard", "red");
    }
  } else {
    log("Failed to read Project metadata"), "red";
  }
}

async function getXMPMetadataClicked() {
  const project = await getProject();
  if (!project) return;

  const metadata = await getXMPMetadata(project);
  if (metadata) {
    try {
      await navigator.clipboard.write({ "text/plain": metadata });
      log(`XMP Metadata copied to clipboard`);
    } catch {
      log("Failed to copy XMP Metadata to clipboard", "red");
    }
  } else {
    log("Failed to read XMP metadata", "red");
  }
}

async function getProjectColumnsMetadataClicked() {
  const project = await getProject();
  if (!project) return;

  const metadata = await getProjectColumnsMetadata(project);
  if (metadata) {
    try {
      await navigator.clipboard.write({ "text/plain": metadata });
      log(`Project column metadata copied to clipboard`);
    } catch {
      log("Failed to copy Project column Metadata to clipboard", "red");
    }
  } else {
    log("Failed to read Project column metadata", "red");
  }
}

async function getProjectPanelMetadataClicked() {
  const metadata = await getProjectPanelMetadata();
  if (metadata) {
    try {
      await navigator.clipboard.write({ "text/plain": metadata });
      log(`Project panel metadata copied to clipboard`);
    } catch {
      log("Failed to copy Project panel metadata to clipboard", "red");
    }
  } else {
    log("Failed to read Project panel metadata", "red");
  }
}

async function setXMPMetadataClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await setXMPMetadata(project);
  log(success ? "Successfully set xmp metadata" : "Failed to set xmp metadata");
}

async function setProjectPanelMetadatClicked() {
  const success = await setProjectPanelMetadata();
  log(
    success
      ? "Successfully set project panel metadata"
      : "Failed to set project panel metadata"
  );
}

async function addPropertiesToMetadataSchemaClicked() {
  const success = await addPropertiesToMetadataSchema();
  log(
    success
      ? "Successfully added properties to metadata schema"
      : "Failed to add properties to metadata schema"
  );
}

async function setProjectMetadataClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await setProjectMetadata(project);
  log(
    success
      ? "Successfully set project metadata"
      : "Failed to set project metadata"
  );
}

//source monitor button events
async function openFilePathClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await openFilePath();
  log(
    success
      ? "Successfully opened selected file at source monitor"
      : "Failed to send the projectItems at selected file to source monitor"
  );
}

async function openProjectItemClicked() {
  let selected = document.getElementById("project-items").value;

  if (!selected) {
    log("Please select a projectItem to open");
  } else {
    let success = await openProjectItem(selected);
    if (success) {
      log(`Opened ${selected} at source monitor successfully`);
    } else {
      log(`Failed to open ${selected} at source monitor`);
    }
  }
}

async function playClicked() {
  //  check if there is a active projectItem opened at source monitor
  const item = await getProjectItemAtSourceMonitor();
  if (!item) {
    log("No projectItem opened in source monitor");
    return;
  }
  const success = await play();
  log(
    success
      ? "Successfully played current projectItem at source monitor"
      : "Failed to play at source monitor"
  );
}

async function getPositionClicked() {
  //  check if there is a active projectItem opened at source monitor
  const item = await getProjectItemAtSourceMonitor();
  if (!item) {
    log("No projectItem opened in source monitor");
    return;
  }
  let time = await getPosition();
  if (time) {
    log(`Current time of source monitor in seconds is ${time.seconds}`);
  } else {
    log(`Failed to get current time of source monitor`, "red");
  }
}

async function closeClipClicked() {
  //  check if there is a active projectItem opened at source monitor
  const item = await getProjectItemAtSourceMonitor();
  if (!item) {
    log("No projectItem opened in source monitor");
    return;
  }
  const success = await closeClip();
  log(
    success
      ? "Successfully closed clip in source monitor"
      : "Failed to close clip"
  );
}

async function closeAllClipsClicked() {
  //  check if there is a active projectItem opened at source monitor
  const item = await getProjectItemAtSourceMonitor();
  if (!item) {
    log("No projectItem opened in source monitor");
    return;
  }
  const success = await closeAllClips();
  log(
    success
      ? "Successfully closed all clips in source monitor"
      : "Failed to close all clips"
  );
}

async function setValueClicked() {
  const success = await setValue();
  log(success ? "Successfully set the value" : "Failed to set the value");
}
async function getStartValueClicked() {
  const startValueKeyframe = await getStartValue();
  log(
    startValueKeyframe
      ? `start value: "${startValueKeyframe.value.value}"`
      : "Failed to get the start value"
  );
}

async function addKeyframeClicked() {
  const startValue = await addKeyframe();
  log(
    startValue
      ? "Successfully added the keyframe"
      : "Failed to add the keyframe"
  );
}

async function getKeyframesClicked() {
  const ticktimes = await getKeyframes();

  if (ticktimes && ticktimes.length > 0) {
    log("keyframes found at following seconds:");
    for (let index in ticktimes) {
      log(`"${ticktimes[index].seconds}"`);
    }
  } else log("Failed to gets all the keyframe or there is no keyframe found");
}

async function getKeyframeClicked() {
  const keyframe = await getKeyframe();
  log(
    keyframe
      ? `keyframe at 0 seconds has value: "${keyframe.value.value}"`
      : "Failed to gets the keyframe at specific time"
  );
}
async function setInterpolationClicked() {
  const success = await setInterpolation();
  log(
    success
      ? "Successfully sets the Interpolation"
      : "Failed to sets the Interpolation"
  );
}
async function getEffectsNameClicked() {
  const effects = await getEffectsName();
  if (effects) {
    log("Followings are the effects list:");
    for (let index in effects) {
      log(effects[index]);
    }
  } else log("Failed to gets all the effect names", "red");
}
async function addEffectsClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await addEffects(project);
  log(success ? "Successfully added the effect" : "Failed to add the effect");
}
async function addMultipleEffectsClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await addMultipleEffects(project);
  log(success ? "Successfully added the effects" : "Failed to add the effect");
}
async function removeEffectsClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await removeEffects(project);
  log(
    success ? "Successfully removed the effect" : "Failed to remove the effect"
  );
}
async function getTransitionNamesClicked() {
  const transitions = await getTransitionNames();
  if (transitions) {
    log("Followings are the transitions list:");
    for (let index in transitions) {
      log(transitions[index]);
    }
  } else {
    log("Failed to gets all the transitions names", "red");
  }
}

//transition and effects button events
async function addTransitionStartClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await addTransitionStart(project);
  log(
    success
      ? "Successfully added transition to the start of trackitem"
      : "Failed to add transition to the start of trackitem"
  );
}

async function addTransitionEndClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await addTransitionEnd(project);
  log(
    success
      ? "Successfully added transition to the end of trackitem"
      : "Failed to add transition to the end of trackitem"
  );
}

async function removeTransitionStartClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await removeTransitionStart(project);
  log(
    success
      ? "Successfully removed transition to the start of trackitem"
      : "Failed to removed transition to the start of trackitem"
  );
}

async function setOverrideFrameRateClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await setOverrideFrameRate(project);
  if (!success) {
    log("Failed to set override frame rate", "red");
    return;
  }
  log("Successfully set override frame rate");
}

async function setOverridePixelAspectRatioClicked() {
  const project = await getProject();
  if (!project) return;

  const success = await setOverridePixelAspectRatio(project);
  if (!success) {
    log("Failed to set override pixel aspect ratio", "red");
    return;
  }
  log("Successfully set override pixel aspect ratio");
}

//Properties button events
async function getSampleSequencePropertyClicked() {
  const project = await getProject();
  if (!project) return;

  const sequence = await getActiveSequence(project);
  if (!sequence) {
    log("No active sequence available to check properties");
    return;
  }

  const value = await getSequenceSampleProperty(sequence);
  if (value) {
    log(`Sample Property has value ${value}`);
  }
}

async function setSampleSequencePropertyClicked() {
  const project = await getProject();
  if (!project) return;

  const sequence = await getActiveSequence(project);
  if (!sequence) {
    log("No active sequence available to set properties");
    return;
  }

  const success = await setSampleSequenceProperty(sequence, project);
  log(
    success
      ? "Successfully added sample property to sequence"
      : "Failed to add sample property to sequence"
  );
}

async function clearSampleSequencePropertyClicked() {
  const project = await getProject();
  if (!project) return;

  const sequence = await getActiveSequence(project);
  if (!sequence) {
    log("No active sequence available to check properties");
    return;
  }

  const success = await clearSampleSequenceProperty(sequence, project);
  log(
    success
      ? "Successfully removed sample property in sequence"
      : "Failed to remove sample property in sequence"
  );
}

//Settings button events
async function getScratchDiskSettingClicked() {
  const project = await getProject();
  if (!project) return;

  let scratchDiskPath = await getScratchDiskSetting(project);
  log(`Current scratch disk path is ${scratchDiskPath}`);
}

async function setScratchDiskSettingsClicked() {
  const project = await getProject();
  if (!project) return;

  let success = await setScratchDiskSettings(project);
  log(
    success
      ? "Successfully updated scratch disk path to MyDocuments"
      : "Failed to update scratch disk path settings"
  );
}

async function getIngestSettingsClicked() {
  const project = await getProject();
  if (!project) return;

  let enabled = await getIngestEnabled(project);
  log(`IngestEnabled: ${enabled}`);
}

async function setIngestSettingsClicked() {
  const project = await getProject();
  if (!project) return;

  let success = await setIngestEnabled(project);
  log(
    success
      ? "Successfully updated ingest enabled to true"
      : "Failed to update ingest settings"
  );
}

//AppPreference button events
async function getPreferenceSettingClicked() {
  let currSetting = await getPreferenceSetting();
  log(`Current Auto Peak Generation Setting is: ${currSetting}`);
}

async function setPreferenceSettingClicked() {
  let success = await setPreferenceSetting();
  log(
    success
      ? "Successfully updated auto peak generation preference"
      : "Failed to update auto peak generation preference"
  );
}

//Export control button events
async function exportSequenceFrameClicked() {
  const project = await getProject();
  if (!project) return;

  const sequence = await getActiveSequence(project);
  if (!sequence) {
    log("No active sequence available for export.");
    return;
  }
  let success = await exportSequenceFrame(sequence);
  log(
    success
      ? "Successfully export current frame as png"
      : "Failed to export current frame as png"
  );
}

async function exportSequenceClicked() {
  const project = await getProject();
  if (!project) return;

  const sequence = await getActiveSequence(project);
  if (!sequence) {
    log("No active sequence available for export.");
    return;
  }

  const success = await exportSequence(sequence);
  log(
    success
      ? "Successfully export sequence as MPEG2"
      : "Failed to export sequence"
  );
}

async function getExportFileExtensionClicked() {
  const project = await getProject();
  if (!project) return;

  const sequence = await getActiveSequence(project);
  if (!sequence) {
    log("No active sequence available for getting exported extension");
    return;
  }

  let presetFile;
  log("Please select a preset file for getting the export file extension");
  const file = await uxp.storage.localFileSystem.getFileForOpening({
    types: ["epr"],
  });
  if (file && file.isFile && file.nativePath) {
    presetFile = file.nativePath;
  } else {
    log("Selection of preset file failed. Please try again");
    return;
  }

  try {
    const extension = await getExportFileExtension(sequence, presetFile);
    log(`Exported file extension will be ${extension}`);
  } catch (err) {
    log(`Error: ${err}`, "red");
  }
}

//import button events
async function importFilesClicked() {
  let success = false;
  const files = await uxp.storage.localFileSystem.getFileForOpening({
    allowMultiple: true,
  }); // allow multiple files selection
  let filePaths = [];
  if (files.length === 0) {
    log(`No file selected`);
    return;
  } else {
    log(`Importing files selected..`);
    for (let i = 0; i < files.length; i++) {
      if (files[i] && files[i].isFile && files[i].nativePath) {
        filePaths.push(files[i].nativePath);
      }
    }
  }

  // import into current active project
  const project = await getProject();
  if (project) {
    success = await importFiles(project, filePaths);
  } else {
    log(`no active project found for import`);
  }

  if (success) {
    log(`Import files succeed`);
  } else {
    log(`Failed to import files`);
  }
}

async function importSequencesClicked() {
  // save current proj reference
  const project = await getProject();
  if (!project) return;

  log(`Please open the project which you'd to import all its sequences`);
  // let user open the project containing sequences they'd like to import
  let newProject = await openProject();

  // if no sequence exist, return and alert user
  let sequences: Array<Sequence> = await newProject.getSequences();
  if (sequences.length == 0) {
    log(`no sequence found for import`);
    return;
  }

  // import every sequence inside of project opened to previous active project
  let seqIds = [];
  for (let i = 0; i < sequences.length; i++) {
    seqIds.push(sequences[i].guid);
  }

  log(`Importing sequences into ${project.name}..`);
  // open the original active project
  await openInputProject(project.path);

  const success = await importSequences(project, newProject.path, seqIds);
  if (success) {
    log(`Import sequences succeed`);
  } else {
    log(`Failed to import sequences`);
  }
}

async function importAeComponentClicked() {
  let aeInstalled = await ppro.Utils.isAEInstalled();
  if (!aeInstalled) {
    log(
      `Please ensure that the matching version of "After Effects" is installed on this machine.`,
      `red`
    );
    return;
  }

  const project = await getProject();
  if (!project) return;

  let success = false;
  const rootItem = await project.getRootItem();

  // let user select ae composition file for import
  const file = await uxp.storage.localFileSystem.getFileForOpening({
    types: ["aep"],
  });
  if (file && file.isFile && file.nativePath) {
    // check if user have input for ae composition name for import
    let aeCompName = document.getElementById("ae-component-name")!.value;
    if (!aeCompName) {
      log("Please put name of ae composition in entry");
      return;
    }
    success = await importAeComponent(
      project,
      file.nativePath,
      aeCompName,
      rootItem
    );
  }

  if (success) {
    log(`Import ae composition succeed`);
  } else {
    log(`Failed to import.. Did you put the correct name for composition?`);
  }
}

async function importAllAeComponentsClicked() {
  let aeInstalled = await ppro.Utils.isAEInstalled();
  if (!aeInstalled) {
    log(
      `Please ensure that the matching version of "After Effects" is installed on this machine.`,
      `red`
    );
    return;
  }

  const project = await getProject();
  if (!project) return;

  let success = false;
  const rootItem = await project.getRootItem();
  // let user select ae composition file for import
  const file = await uxp.storage.localFileSystem.getFileForOpening({
    types: ["aep"],
  });
  if (file && file.isFile && file.nativePath) {
    success = await importAllAeComponents(project, file.nativePath, rootItem);
  }
  if (success) {
    log(`Import all ae composition succeed`);
  } else {
    log(`Failed to import ae composition`);
  }
}

async function sliceButtonClicked(clickParams, numSlices: number = 20){
  const ticksPerSec = 254016000000;
  let userSliceValue = document.getElementById("numSlices").value;
  if (userSliceValue != null){
    try{
      numSlices = parseInt(userSliceValue);
    }catch (err){
      log(`Cannot Slice User Value: ${err}`, "red");
    }
  }

  let success = false;
  const project = await getProject();
  // const projRootItem = await project.getRootItem();
  const activeSequence = await project.getActiveSequence();
  const activeSequenceFrameRate = await activeSequence.getTimebase();
  const activeSequenceEditor = await ppro.SequenceEditor.getEditor(activeSequence);

  const projectItems: Array<ProjectItem> = await getSelectedProjectItems(project);

  let vidTrackZero = await activeSequence.getVideoTrack(0);
  let v1_trackItems = await vidTrackZero.getTrackItems(1, false);
  
  // split up the track item in V1
  if (
      v1_trackItems.length >= 1 && projectItems.length == 1
    ){
      // get project item to cut in
      let projItem = await v1_trackItems[0].getProjectItem();
      let clipProjItem = await ppro.ClipProjectItem.cast(projItem);

      let trackItemStartTime = await v1_trackItems[0].getStartTime();
      let trackItemEndTime = await v1_trackItems[0].getEndTime();

      let trackItemTimeDelta = await trackItemEndTime.subtract(trackItemStartTime);
      try{
        var ticksStep = await trackItemTimeDelta.divide(numSlices);
      } catch (err) {
        log(`${err}`, "red");
        return false;
      }

      // TODO would validate here what tracks have content, and make new tracks if necessary for insert operations


      // Add Gaps
      let mediaInsertActionsQueue = [];
      let tickStepCounter = ticksStep;

      // project.lockedAccess(() => {});
      let seqFrameRateTicks = ticksPerSec/parseInt(activeSequenceFrameRate);
      let seqFrameRate = ppro.FrameRate.createWithValue(seqFrameRateTicks);


        try{
            project.lockedAccess(() => {
              // slice up the sequence trackItem
              for (let step = 1; step < numSlices; step++){ // starts at 1 since tickStepCounter starts offset, not at 0
                let nearestFrameToStep = tickStepCounter.alignToNearestFrame(seqFrameRate);

                let insertItemAction1 = activeSequenceEditor.createInsertProjectItemAction(
                  projectItems[0],
                  nearestFrameToStep, //tickStepCounter
                  1, // video track index (V2)
                  1, // audio track index (A2)
                  false
                );

                let insertItemAction2 = activeSequenceEditor.createInsertProjectItemAction(
                    projectItems[0],
                    nearestFrameToStep,
                    1, // video track index (V2)
                    1, // audio track index (A2)
                    false
                  );

                // BUG Add action twice to force add edit to the V1 trackItem
                mediaInsertActionsQueue.push(insertItemAction1);
                mediaInsertActionsQueue.push(insertItemAction2);

                tickStepCounter = tickStepCounter.add(ticksStep);
              }
              success = project.executeTransaction((compoundAction) => {

                // build compound action from action array
                for (const individualAction of mediaInsertActionsQueue){
                  compoundAction.addAction(individualAction);
                }
                // compoundAction.addAction(insertItemAction1);
                // compoundAction.addAction(insertItemAction2);
              }, "Slice Up Track");
            });

            // Clean Up the trackItems used to make the slices
            // let trackItemsRemoveActionsQueue = [];
            // let selectedItemsToRemove = ppro.TrackItemSelection.createEmptySelection();

            let v2_track = await activeSequence.getVideoTrack(1);
            let v2_contents = v2_track.getTrackItems(1, false);
            let a2_track = await activeSequence.getAudioTrack(1);
            let a2_contents = a2_track.getTrackItems(1, false);

            project.lockedAccess(() => {

            let removeTrackItemsAction;
            ppro.TrackItemSelection.createEmptySelection((trackItemSelection) => { 
              for (const trackItemFound of v2_contents){
                trackItemSelection.addItem(trackItemFound);
              }
              for (const trackItemFound of a2_contents){
                trackItemSelection.addItem(trackItemFound);
              }
              removeTrackItemsAction = activeSequenceEditor.createRemoveItemsAction(
                trackItemSelection,
                false,
                ppro.Constants.MediaType.VIDEO,
                false
              )
            });

            success = project.executeTransaction((compoundAction) => {
                compoundAction.addAction(removeTrackItemsAction);
              }, "Clean Up Track");

            });
        }
      catch (err) {
        log(`${err}`, "red");
        return false;
      }

        
        
    // clean up inserted frames

  }else {
    // thrown an error that there must be a video track item present
  }

  return true;
}

async function testButtonClicked(){ // for testing Sequence.getSettings() - remove __testing_getSettings from function name to use
  let success = false;

  const project = await getProject();
  const projRootItem = await project.getRootItem();
  let folderItems = await projRootItem.getItems();
  
  let sequences = await project.getSequences();
  
  for(let i = 0; i < folderItems.length; i++){
    log(`Looking at ${folderItems[i].name}`);
    let clipProjItem = ppro.ClipProjectItem.cast(folderItems[i]);
    let isMulticam = await clipProjItem.isMulticamClip();
    let isSequence = await clipProjItem.isSequence();
    if(isMulticam || isSequence){
      try{
        let seqForProjItem = await clipProjItem.getSequence();
        let projItemSettings = await seqForProjItem.getSettings();
        let pulledSetting = await projItemSettings.getPreviewCodec();
        log(`...Got the settings!`);
      }catch(e) {
        log(e);
      }
    }else{
      log(`...Not a Sequence or Mutlicam`);
    }
    // let isMC = await folderItems[i].isMulticamClip();
      
    }
  }


async function testButtonClicked__testing_tickTimeMath(){ // for testing ticktime math - remove __testing_ticktimeMath from function name to use
  // log("Test Button Clicked!")
  
  const ticks_per_sec = 254016000000;
  
  // Testing Audio Filter Factory
  const AUTOMATIC_CLICK_REMOVER_MATCH_NAME =
    "433322b0-d25a-4cfa-a4f1-4a1ab2d7615b";

  // const matchNames = await ppro.AudioFilterFactory.getMatchNames();
  
  // const sampleRate = ppro.FrameRate.createWithValue(48000);
  // const audioChannelLayout =
  //   dvaMediaTypes.AudioChannelLayout.createCommonAudioChannelLayout(
  //     dvaMediaTypes.AudioChannelLayout.CHANNELLAYOUT_STEREO
  //   );


  // const filterModule = await ppro.AudioFilterFactory.getFilterModule(
  //     AUTOMATIC_CLICK_REMOVER_MATCH_NAME
  //   );

  // let audioFilterComponent = await ppro.AudioFilterFactory.createComponent(
  //     AUTOMATIC_CLICK_REMOVER_MATCH_NAME,
  //     sampleRate,
  //     audioChannelLayout
  //   );


  // Testing Sequence In/Out Points
  let success = false;

  const project = await getProject();
  const sequence = await getActiveSequence(project);
  const seqFramerate = ppro.FrameRate.createWithValue(
    ticks_per_sec/Number(await sequence.getTimebase())
  );



  if (sequence) {

    let inPoint = 2; //seconds
    let outPoint = 10; //seconds

    let inTickTime = ppro.TickTime.createWithTicks(String(inPoint * seqFramerate.value * seqFramerate.ticksPerFrame));
    // let inTickTime_rounded = inTickTime.alignToNearestFrame(seqFramerate);
    let inTickTime_rounded = inTickTime.alignToFrame(seqFramerate);

    let outTickTime = ppro.TickTime.createWithTicks(String(outPoint * seqFramerate.value * seqFramerate.ticksPerFrame));
    // let outTickTime_rounded = outTickTime.alignToNearestFrame(seqFramerate);
    let outTickTime_rounded = outTickTime.alignToNearestFrame(seqFramerate);

    let addedTicktime = outTickTime.add(inTickTime);
    let subtractedTickTime = outTickTime.subtract(inTickTime);
    let multTickTime = outTickTime.multiply(inPoint);
    let divTickTime = outTickTime.divide(inPoint);

    project.lockedAccess(() => {
      project.executeTransaction((compoundAction) => {
        let action1 = sequence.createSetInPointAction(
          ppro.TickTime.createWithTicks(
            inTickTime_rounded.ticks
          )
        );
        
        let action2 = sequence.createSetOutPointAction(
          ppro.TickTime.createWithTicks(
            outTickTime_rounded.ticks
          )
        );
    
        compoundAction.addAction(action1);
        compoundAction.addAction(action2);
      })
    })
    
    success = true;

  } else {
    log("Test conditions were not met.  See IF statement of test..", "red");
    throw new Error("Test IF condition not met");
  }

  if (success){
    log(`Test Succeeded.`);
  }else{
    log("Test Failed!", "red");
  }
  
  return;
}

window.addEventListener("load", async () => {
  //project events registering
  registerClick("open-project", openProjectClicked);
  registerClick("active-project", getActiveProjectClicked);
  registerClick("active-sequence-project", getActiveSequenceClicked);
  registerClick("open-from-id-project", getProjectFromIdClicked);
  registerClick("get-insertion-bin-project", getInsertionBinClicked);
  registerClick("get-all-sequences-project", getAllSequencesClicked);
  registerClick("open-sequence-project", openSequenceClicked);
  registerClick('pause-project"', pauseGrowingClicked);
  registerClick("save-project", saveProjectClicked);
  registerClick("save-as-project", saveAsProjectClicked);
  registerClick(
    "get-supported-luminances-project",
    getSupportedGraphicsWhiteLuminancesClicked
  );
  registerClick(
    "get-luminance-project",
    getCurrentGraphicsWhiteLuminanceClicked
  );
  registerClick("close-project", closeProjectClicked);

  //sequence events registering
  registerClick("get-sequence-from-id", getSequenceClicked);
  registerClick("set-active-sequence", setActiveSequenceClicked);
  registerClick("create-sequence", createSequenceClicked);
  registerClick("create-media-sequence", createSequenceFromMediaClicked);
  registerClick("get-caption-track-count", getCaptionTrackCountClicked);
  registerClick("get-video-track-sequence", getVideoTrackClicked);
  registerClick("get-selection-sequence", getSequenceSelectionClicked);
  registerClick("set-selection-sequence", setSequenceSelectionClicked);
  registerClick("create-sub-sequence", createSubsequenceClicked);
  registerClick("overwrite-item", overwriteItemClicked);
  registerClick("insert-item", insertItemClicked);
  registerClick("clone-selected-item", cloneSelectedItemClicked);
  registerClick("remove-selected-items", removeSelectedItemClicked);
  registerClick("trim-selected-item", trimSelectedItemClicked);
  registerClick("trim-handles", trimHandlesClicked);

  //marker events registering
  registerClick("marker-comment", createMarkerCommentClicked);
  registerClick("marker-chapter", createMarkerChapterClicked);
  registerClick("marker-weblink", createMarkerWeblinkClicked);
  registerClick("marker-flashcuepoint", createMarkerFlashCuePointClicked);
  registerClick("marker-movemarker", moveMarkerClicked);
  registerClick("marker-removemarker", removeMarkerClicked);

  //metadata events registering
  registerClick("get-project-metadata", getProjectMetadataClicked);
  registerClick("get-xmp-metadata", getXMPMetadataClicked);
  registerClick(
    "get-projectcolumns-metadata",
    getProjectColumnsMetadataClicked
  );
  registerClick("get-projectpanel-metadata", getProjectPanelMetadataClicked);
  registerClick("set-xmp-metadata", setXMPMetadataClicked);
  registerClick("set-projectpanel-metadata", setProjectPanelMetadatClicked);
  registerClick(
    "add-property-metadata-schema",
    addPropertiesToMetadataSchemaClicked
  );
  registerClick("set-project-metadata", setProjectMetadataClicked);

  //source monitor events registering
  registerClick("open-filePath", openFilePathClicked);
  registerClick("open-projectItem", openProjectItemClicked);
  registerClick("play", playClicked);
  registerClick("get-pos", getPositionClicked);
  registerClick("close-clip", closeClipClicked);
  registerClick("close-all-clips", closeAllClipsClicked);

  //keyframe events registering
  registerClick("set-value", setValueClicked);
  registerClick("get-start-value", getStartValueClicked);
  registerClick("add-keyframe", addKeyframeClicked);
  registerClick("get-keyframes", getKeyframesClicked);
  registerClick("get-keyfram-time", getKeyframeClicked);
  registerClick("set-interpolation", setInterpolationClicked);

  //project panel item events registering
  registerClick("get-project-items", getProjectItemsClicked);
  registerClick("get-selected-project-items", getSelectedProjectItemsClicked);
  registerClick("get-media-path", getMediaFilePathClicked);
  registerClick("create-bin", createBinClicked);
  registerClick("create-smart-bin", createSmartBinClicked);
  registerClick("rename-bin", renameBinClicked);
  registerClick("remove-item", removeItemClicked);
  registerClick("move-item", moveItemClicked);
  registerClick("set-in-out-point", setInOutPointClicked);
  registerClick("clear-in-out-point", clearInOutPointClicked);
  registerClick("set-override-framerate", setOverrideFrameRateClicked);
  registerClick(
    "set-override-pixel-aspect-ratio",
    setOverridePixelAspectRatioClicked
  );
  registerClick("set-scale-to-frame-size", setScaleToFrameSizeClicked);
  registerClick("set-footage-interpretation", setFootageInterpretationClicked);
  registerClick("set-footage-interpretation", setFootageInterpretationClicked);
  registerClick("refresh-media", refreshMediaClicked);
  registerClick("attach-proxy", attachProxyClicked);
  registerClick("change-path", changePathClicked);
  registerClick("get-view-ids", getProjectViewIdsClicked);
  registerClick("get-project-from-view-id", getProjectFromViewIdClicked);
  registerClick("get-selection-from-view-id", getSelectionFromViewIdClicked);

  //Effects & transitions
  registerClick("get-effect-names", getEffectsNameClicked);
  registerClick("add-gamma-correction-effect", addEffectsClicked);
  registerClick("add-multiple-effects", addMultipleEffectsClicked);
  registerClick("remove-gamma-correction-effect", removeEffectsClicked);
  registerClick("get-transition-names", getTransitionNamesClicked);
  registerClick("add-transition-start", addTransitionStartClicked);
  registerClick("add-transition-end", addTransitionEndClicked);
  registerClick("remove-transition-start", removeTransitionStartClicked);

  // Properties
  registerClick("get-sequence-property", getSampleSequencePropertyClicked);
  registerClick("set-sequence-property", setSampleSequencePropertyClicked);
  registerClick("clear-sequence-property", clearSampleSequencePropertyClicked);

  // Settings
  registerClick("get-project-setting", getScratchDiskSettingClicked);
  registerClick("set-project-setting", setScratchDiskSettingsClicked);
  registerClick("get-ingest-setting", getIngestSettingsClicked);
  registerClick("set-ingest-enabled", setIngestSettingsClicked);

  // AppPreference
  registerClick("get-autopeak-preference", getPreferenceSettingClicked);
  registerClick("set-autopeak-setting", setPreferenceSettingClicked);

  // Export
  registerClick("export-frame", exportSequenceFrameClicked);
  registerClick("export-sequence", exportSequenceClicked);
  registerClick("get-export-file-extension", getExportFileExtensionClicked);

  // Import controls
  registerClick("import-ae-component", importAeComponentClicked);
  registerClick("import-files", importFilesClicked);
  registerClick("import-all-ae-components", importAllAeComponentsClicked);
  registerClick("import-sequences", importSequencesClicked);

  // Test Buttons
  registerClick("test-button", testButtonClicked);
  registerClick("slice-up-button", sliceButtonClicked);

  document
    .querySelector(".clear-btn")!
    .addEventListener("click", () => clearLog());

  // add project & seq open/close/activate event listeners. Details in eventManager.ts
  await addProjSeqListeners();

  // add encoder event listeners. Details in eventManager.ts
  await addEncoderListeners();
});

//Helper functions
document
  .querySelector(".clear-btn")!
  .addEventListener("click", () => clearLog());

async function getProject() {
  const activeProject = await getActiveProject();
  if (activeProject) {
    return activeProject;
  } else {
    log(`Failed to find active project`, "red");
  }
}
