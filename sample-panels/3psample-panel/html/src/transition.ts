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

let trackItems;
let matchnames;
const transitionFactory = ppro.TransitionFactory;

export async function getVideoTrackItems() {
  let proj = await ppro.Project.getActiveProject();
  if (!proj) {
    log(`No project found.`, "red");
    return;
  } else {
    let sequence = await proj.getActiveSequence();
    if (!sequence) {
      log("No sequence found", "red");
      return;
    } else {
      let videoTrack = await sequence.getVideoTrack(0);
      if (!videoTrack) {
        log("No videoTrack found", "red");
        return;
      } else {
        trackItems = await videoTrack.getTrackItems(
          ppro.Constants.TrackItemType.CLIP,
          false
        );
        if (trackItems.length == 0) {
          log("No trackItems found", "red");
          return;
        }
      }
    }
  }
  return trackItems;
}

//Gets all the transition matchNames.
export async function getTransitionNames() {
  return await transitionFactory.getVideoTransitionMatchNames();
}

export async function addTransitionStart(project: Project) {
  if (!project) {
    log(`No project found.`, "red");
    return;
  }
  const videoTrackItems = await getVideoTrackItems();

  if (videoTrackItems && videoTrackItems.length === 0) {
    return;
  }
  matchnames = await transitionFactory.getVideoTransitionMatchNames();

  let addTransitionOptions = ppro.AddTransitionOptions();
  addTransitionOptions.setApplyToStart(true);

  const videoTransition = await transitionFactory.createVideoTransition(
    matchnames[0]
  );

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        var action1 = videoTrackItems[0].createAddVideoTransitionAction(
          videoTransition,
          addTransitionOptions
        );
        compoundAction.addAction(action1);
      }, "createAddTransitionAction");
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

export async function addTransitionEnd(project: Project) {
  if (!project) {
    log(`No project found.`, "red");
    return;
  }
  const videoTrackItems = await getVideoTrackItems();

  if (videoTrackItems && videoTrackItems.length === 0) {
    return;
  }

  matchnames = await transitionFactory.getVideoTransitionMatchNames();
  const videoTransition = await transitionFactory.createVideoTransition(
    matchnames[1]
  );

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        var action1 =
          videoTrackItems[0].createAddVideoTransitionAction(videoTransition);
        compoundAction.addAction(action1);
      }, "createAddTransitionAction");
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

export async function removeTransitionStart(project: Project) {
  if (!project) {
    log(`No project found.`, "red");
    return;
  }
  const videoTrackItems = await getVideoTrackItems();

  if (videoTrackItems && videoTrackItems.length === 0) {
    return;
  }

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        var action1 = videoTrackItems[0].createRemoveVideoTransitionAction(
          ppro.Constants.TransitionPosition.START
        );
        compoundAction.addAction(action1);
      }, "createRemoveVideoTransitionAction");
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}
