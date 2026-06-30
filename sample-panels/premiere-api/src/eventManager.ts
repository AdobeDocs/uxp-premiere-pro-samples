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
  premierepro,
  Application,
  AudioClipTrackItem,
  OperationCompleteEvent,
  ProjectClosedEvent,
  ProjectEvent,
  ProjectItem,
  VideoClipTrackItem,
} from "@adobe/premierepro";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ppro = require("premierepro") as premierepro;

import { log } from "./utils";
import { getActiveProject, getActiveSequence } from "./project";
import {
  addProjectItemsOptions,
  clearProjectItemOptions,
  refreshProjectItemOptions,
} from "./sourceMonitor";

interface SequenceEvent {
  readonly currentTarget: Application;
  readonly id: string;
  readonly name: string;
  readonly target: Application;
}

/**
 * callback function for sequence close event. This fires when a sequence
 * is closed.
 * 
 * The closed sequence is logged to the UI, and the active sequence name is
 * updated to "No Active Sequence" if there are no more active sequences.
 */
async function onSequenceClosed(event?: object) {
  const e = event as SequenceEvent;
  log(`Sequence ${e.name} closed`);
  console.log(`Sequence ${e.name} closed`, e);

  // check for case that no more active sequence exist
  const project = await getActiveProject();
  const sequence = await getActiveSequence(project);
  if (!sequence) {
    document.getElementById("active-sequence-name")!.innerText =
      "No Active Sequence";
  }
}

/**
 * callback function for sequence activated event. This fires when a sequence
 * is opened or activated.
 * 
 * The activated sequence is logged to the UI, and the active sequence name is
 * updated to the name of the activated sequence.
 */
async function onSequenceActivated(event?: object) {
  const e = event as SequenceEvent;
  log(`Sequence ${e.name} activated`);
  console.log(`Sequence ${e.name} activated`, e);

  // add close event listener for the activated sequence
  const project = await getActiveProject();
  const sequence = await project.getSequence(ppro.Guid.fromString(e.id));

  if (sequence) {
    ppro.EventManager.addEventListener(
      sequence,
      ppro.Constants.SequenceEvent.CLOSED,
      onSequenceClosed,
      false
    );
  }

  // update active sequence name
  document.getElementById("active-sequence-name")!.innerText = e.name;
}

/**
 * Callback function for sequence trackItem selection change event. This fires
 * when the selection in the sequence changes.
 */
async function onSequenceSelectionChange(event?: object) {
  const e = event as SequenceEvent;

  const project = await getActiveProject();
  const sequence = await project.getSequence(ppro.Guid.fromString(e.id));
  if (!sequence) {
    return;
  }

  const selection = await sequence.getSelection();
  const trackItems = await selection.getTrackItems();
  console.log(`Track item selection changed for sequence ${sequence.name}, ${trackItems.length} items selected`);

  trackItems.forEach(async (item: VideoClipTrackItem | AudioClipTrackItem) => {
    const name = await item.getName();
    console.log(`- Track item named ${name} selected`);
  });
}

/**
 * callback function for project open event
 * console project name opened
 */
function onProjectOpened(event?: object) {
  const e = event as ProjectEvent;
  log(`Project Opened: ${e.name}`);
  console.log(`Project ${e.name} opened`, e);
}

/**
 * callback function for project close event
 * console project name closed
 */
function onProjectClosed(event?: object) {
  const e = event as ProjectClosedEvent;
  log(`Project ${e.name} closed`);
  console.log(`Project ${e.name} closed`, event);

  clearProjectItemOptions();
}

/**
 * callback function for project activated event
 * add project close event listener and update active project name
 */
async function onProjectActivated(event?: object) {
  const e = event as ProjectEvent;
  console.log(`Project ${e.name} is now active`);

  // refresh current projectItem options
  await refreshProjectItemOptions();
  // update active project name
  document.getElementById("active-project-name")!.innerText = e.name;
}

/**
 * callback function for project dirty event
 * Update projectItem options when user remove/add new projectItem
 */
async function onProjectDirty(event?: object) {
  console.log(`Project ${(event as ProjectEvent).name} changed`);

  await refreshProjectItemOptions();
}

interface ProjectItemSelectionEvent {
  readonly projectItems: ProjectItem[];
}

/**
 * Callback function for project item selection changed event
 * Log selected project items in console and refresh projectItem options
 */
async function onProjectItemSelectionChanged(event?: object) {
  const e = event as ProjectItemSelectionEvent;
  console.log(`Project item selection changed, ${e.projectItems.length} items selected`);

  e.projectItems.forEach(async (item: ProjectItem) => {
    console.log(`- Project item named ${item.name} selected`);
  });

  await refreshProjectItemOptions();
}

interface RenderCancelEvent {
  readonly jobID: string;
}

/**
 * Callback function for encoder cancel event. This fires when cancelling
 * an AME job.
 */
function onEncoderCancel(event?: object) {
  const e = event as RenderCancelEvent;
  console.log(`Encoder process job "${e.jobID}" cancelled`);
}

interface RenderCompleteEvent {
  readonly jobID: string;
  readonly outputFiles: string[];
}

/**
 * Callback function for encoder complete event. This fires when an AME job
 * completes.
 */
function onEncoderComplete(event?: object) {
  const e = event as RenderCompleteEvent;
  console.log(`Encoder process job "${e.jobID}" complete: ${e.outputFiles.length} files exported`);
  e.outputFiles.forEach((file: string) => {
    console.log(`- ${file}`);
  });
}

interface RenderErrorEvent {
  readonly jobID: string;
  readonly inErrorNumber: number;
}

/**
 * Callback function for encoder error event. This fires when an AME job
 * returns an error.
 */
function onEncoderError(event?: object) {
  const e = event as RenderErrorEvent;
  console.log(`Encoder process job "${e.jobID}" returned error: ${e.inErrorNumber}`);
}

interface RenderProgressEvent {
  readonly jobID: string;
  readonly progressAmount: number;
}

/**
 * Callback function for encoder progress event. This fires when an AME job
 * is in progress. The progress amount is a decimal value between 0 and 1.
 */
function onEncoderProgress(event?: object) {
  const e = event as RenderProgressEvent;
  const progress = (e.progressAmount * 100).toFixed(2);
  console.log(`Encoder process job "${e.jobID}" in progress: ${progress}% completed`);
}

interface RenderQueueEvent {
  readonly jobID: string;
}

/**
 * Callback function for encoder queue event. This fires when an AME job
 * is queued.
 */
function onEncoderQueue(event?: object) {
  const e = event as RenderQueueEvent;
  console.log(`Encoder process job "${e.jobID}" queued`);
}

/**
 * Add Encoder event listeners.
 * 
 * These events are used when encoding a project via AME.
 */
export function addEncoderListeners() {
  const encoder = ppro.EncoderManager.getManager();

  ppro.EventManager.addEventListener(
    encoder,
    ppro.EncoderManager.EVENT_RENDER_CANCEL,
    onEncoderCancel
  );
  ppro.EventManager.addEventListener(
    encoder,
    ppro.EncoderManager.EVENT_RENDER_COMPLETE,
    onEncoderComplete
  );
  ppro.EventManager.addEventListener(
    encoder,
    ppro.EncoderManager.EVENT_RENDER_ERROR,
    onEncoderError
  );
  ppro.EventManager.addEventListener(
    encoder,
    ppro.EncoderManager.EVENT_RENDER_PROGRESS,
    onEncoderProgress
  );
  ppro.EventManager.addEventListener(
    encoder,
    ppro.EncoderManager.EVENT_RENDER_QUEUE,
    onEncoderQueue
  );
}

/**
 * Callback function for effect drop event. This fires when dropping an
 * effect from the Effects panel onto a track item.
 */
export function onEffectDropped(event?: object) {
  console.log("Effect dropped", event as OperationCompleteEvent);
}

/**
 * Callback function for effect dragged over completion event. This fires
 * when dragging an effect from the Effects panel over a track item.
 */
function onEffectDraggedOver(event?: object) {
  console.log("Effect dragged over", event as OperationCompleteEvent);
}

/**
 * Callback function for guides snap event. This fires when snapping
 * motion/transform effects in the Program Monitor to manually-set
 * guides (View > Show Guides).
 * 
 * Log the event occurred; we don't print the event itself due to it
 * potentially generating a lot of noise in the console.
 */
function onSnapGuides(/* event?: object */) {
  console.log("Guides snapped");
}

/**
 * Callback function for keyframe snap event. This fires when snapping
 * the track head to a keyframe, for example when holding down Shift
 * while dragging the track head in the Effect Controls panel between
 * keyframes.
 * 
 * Log the event occurred; we don't print the event itself due to it
 * potentially generating a lot of noise in the console.
 */
function onSnapKeyframe(/* event?: object */) {
  console.log("Keyframe snapped");
}

/**
 * Callback function for razor-playhead snap event. This fires when using the
 * Razor tool and hovering the cut line until it snaps to the playhead.
 *
 * Log the event occurred; we don't print the event itself due to it
 * potentially generating a lot of noise in the console.
 */
function onSnapRazorPlayhead(/* event?: object */) {
  console.log("Razor playhead snapped");
}

/**
 * Callback function for razor-marker snap event. This fires when using the
 * Razor tool and hovering the cut line until it snaps to a marker.
 *
 * Log the event occurred; we don't print the event itself due to it
 * potentially generating a lot of noise in the console.
 */
function onSnapRazorMarker(/* event?: object */) {
  console.log("Razor marker snapped");
}

/**
 * Callback function for track item snap event. This fires when dragging
 * a clip in the Timeline until it snaps into the edge of another clip.
 * 
 * Log the event occurred; we don't print the event itself due to it
 * potentially generating a lot of noise in the console.
 */
function onSnapTrackItem(/* event?: object */) {
  console.log("TrackItem snapped");
}

/**
 * Callback function for track item playhead snap event. This fires when
 * dragging the playhead in the Timeline until it snaps to the edge of a
 * track item.
 * 
 * Log the event occurred; we don't print the event itself due to it
 * potentially generating a lot of noise in the console, especially for
 * sequences with many clips or captions.
 */
function onSnapTrackItemPlayhead(/* event?: object */) {
  console.log("Playhead snapped to trackItem edges");
}

/**
 * Add project and sequence event listeners
 */
export async function addProjSeqListeners() {
  // intialize active project and active sequence name, if any
  const project = await getActiveProject();
  if (project) {
    document.getElementById("active-project-name")!.innerText = project.name;
  }
  const sequence = await getActiveSequence(project);
  if (sequence) {
    document.getElementById("active-sequence-name")!.innerText = sequence.name;
  }

  // load projectItems for source monitor
  await addProjectItemsOptions();

  // add project event listener
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.ProjectEvent.ACTIVATED,
    onProjectActivated,
    true // in capture phase
  );
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.ProjectEvent.CLOSED,
    onProjectClosed
  );
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.ProjectEvent.DIRTY,
    onProjectDirty,
    true // in capture phase
  );
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.ProjectEvent.OPENED,
    onProjectOpened,
    true // in capture phase
  );
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.ProjectEvent.PROJECT_ITEM_SELECTION_CHANGED,
    onProjectItemSelectionChanged,
    true // in capture phase
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
    ppro.Constants.OperationCompleteEvent.EFFECT_DRAG_OVER,
    onEffectDraggedOver
  );
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.OperationCompleteEvent.EFFECT_DROP_COMPLETE,
    onEffectDropped
  );

  // add snap event listeners
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.SnapEvent.GUIDES,
    onSnapGuides
  );
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.SnapEvent.KEYFRAME,
    onSnapKeyframe
  );
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.SnapEvent.PLAYHEAD_TRACKITEM,
    onSnapTrackItemPlayhead
  );
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.SnapEvent.RAZOR_PLAYHEAD,
    onSnapRazorPlayhead
  );
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.SnapEvent.RAZOR_MARKER,
    onSnapRazorMarker
  );
  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.SnapEvent.TRACKITEM,
    onSnapTrackItem
  );
}
