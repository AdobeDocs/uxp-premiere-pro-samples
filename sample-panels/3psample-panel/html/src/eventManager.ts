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
  premierepro,
  VideoClipTrackItem,
} from "../types.d.ts";
const ppro = require("premierepro") as premierepro;
import { log } from "./utils";
import { getActiveProject, getActiveSequence } from "./project";
import {
  addProjectItemsOptions,
  clearProjectItemOptions,
  refreshProjectItemOptions,
} from "./sourceMonitor";

/**
 * callback function for sequence close event
 * console sequence name closed and update active sequence name in case of no active seq
 */
async function sequenceClosed(sequence) {
  log("Sequence Closed: " + sequence.name);
  // check for case that no more active sequence exist
  const project = await getActiveProject();
  sequence = await getActiveSequence(project);
  if (!sequence) {
    document.getElementById("active-sequence-name").innerText =
      "No Active Sequence";
  }
}

/**
 * callback function for project open event
 * console project name opened
 */
async function onProjectOpened() {
  const project = await getActiveProject();
  log("Project Opened: " + project.name);
}

/**
 * callback function for project close event
 * console project name closed
 */
async function projectClosed(project) {
  log("Project Closed: " + project.name);
  clearProjectItemOptions();
}

/**
 * callback function for sequence activated event
 * add sequence close event listener and update active seq name
 */
async function onSequenceActivated(sequence) {
  // add close event listener for the current active sequence
  const project = await getActiveProject();
  const seq = await getActiveSequence(project);
  ppro.EventManager.addEventListener(
    seq,
    ppro.Constants.SequenceEvent.CLOSED,
    sequenceClosed,
    false
  );
  // update active sequence name
  document.getElementById("active-sequence-name").innerText = sequence.name;
}

/**
 * callback function for project activated event
 * add project close event listener and update active project name
 */
async function onProjectActivated(project) {
  // refresh current projectItem options
  await refreshProjectItemOptions();
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.ProjectEvent.CLOSED,
    projectClosed
  );
  // update active project name
  document.getElementById("active-project-name").innerText = project.name;
}

/**
 * callback function for project dirty event
 * Update projectItem options when user remove/add new projectItem
 */
async function onProjectDirty() {
  await refreshProjectItemOptions();
}

/**
 * Callback function for sequence trackItem selection change event
 * Log selected trackItem's name in console
 */
async function onSequenceSelectionChange(sequence) {
  console.log(`Selection for ${sequence.name} changed`);
  const project = await getActiveProject();
  const seq = await getActiveSequence(project);
  const selection = await seq.getSelection();
  const trackItems = await selection.getTrackItems();
  trackItems.forEach(async (item: VideoClipTrackItem | AudioClipTrackItem) => {
    let name = await item.getName();
    console.log(`selection for trackItem named ${name} changed`);
  });
}

/**
 * Callback function for encoder complete event
 * Log encoder complete in console when AME job complete
 */
async function onEncoderComplete() {
  console.log("Encoder process complete");
}

/**
 * Callback function for encoder cancel event
 * Log encoder in progress in console when AME job is in progress
 */
async function onEncoderProgress() {
  console.log("Encoder in progress");
}

/**
 * Add Encoder event listeners
 */
export async function addEncoderListeners() {
  let encoder = await ppro.EncoderManager.getManager();
  await ppro.EventManager.addEventListener(
    encoder,
    ppro.EncoderManager.EVENT_RENDER_PROGRESS,
    onEncoderProgress
  );
  await ppro.EventManager.addEventListener(
    encoder,
    ppro.EncoderManager.EVENT_RENDER_COMPLETE,
    onEncoderComplete
  );
}

/**
 * Callback function for effect drop event
 * Log Effect dropped when new effect is dropped to trackItem
 */
export async function onEffectDropped() {
  console.log("Effect dropped");
}

/**
 * Callback function for snap trackItem event
 * Log trackItem snapped when trackItem is snapped in timeline
 */
async function onSnapTrackItem() {
  console.log("TrackItem snapped");
}

/**
 * Add project and sequence event listeners
 */
export async function addProjSeqListeners() {
  // intialize active project and active sequence name, if any
  const project = await getActiveProject();
  if (project) {
    document.getElementById("active-project-name").innerText = project.name;
  }
  const sequence = await getActiveSequence(project);
  if (sequence) {
    document.getElementById("active-sequence-name").innerText = sequence.name;
  }

  // load projectItems for source monitor
  await addProjectItemsOptions();

  // add project event listener
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.ProjectEvent.OPENED,
    onProjectOpened
  );
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.ProjectEvent.ACTIVATED,
    onProjectActivated,
    true // in capture phase
  );
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.ProjectEvent.DIRTY,
    onProjectDirty,
    true
  );

  // add sequence event listeners
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.SequenceEvent.ACTIVATED,
    onSequenceActivated
  );
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.SequenceEvent.SELECTION_CHANGED,
    onSequenceSelectionChange
  );

  // add operation complete event listeners
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.OperationCompleteEvent.EFFECT_DROP_COMPLETE,
    onEffectDropped
  );

  // add snap event listeners
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.SnapEvent.TRACKITEM,
    onSnapTrackItem
  );
}
