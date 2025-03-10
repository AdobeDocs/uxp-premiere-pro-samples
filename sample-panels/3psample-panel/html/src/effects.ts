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

import { log } from "./utils";
import type { premierepro, VideoClipTrackItem } from "../types.d.ts";
const ppro = require("premierepro") as premierepro;

let matchnames;
let videoComponentChain;
const filterFactory = ppro.VideoFilterFactory;

export async function getVideoComponentChain() {
  const proj = await ppro.Project.getActiveProject();
  if (!proj) {
    log("No active project", "red");
    return;
  } else {
    const sequence = await proj.getActiveSequence();
    if (!sequence) {
      log("No sequence found", "red");
      return;
    } else {
      const videoTrack = await sequence.getVideoTrack(0);
      if (!videoTrack) {
        log("No videoTrack found", "red");
        return;
      } else {
        const trackItems = await videoTrack.getTrackItems(
          ppro.Constants.TrackItemType.CLIP,
          false
        );
        if (trackItems.length === 0) {
          log("No trackItems found", "red");
          return;
        } else {
          videoComponentChain = await trackItems[0].getComponentChain();
          matchnames = await filterFactory.getMatchNames();
        }
      }
    }
  }
  return videoComponentChain;
}

//Gets all the effects matchNames.
export async function getEffectsName() {
  return await filterFactory.getMatchNames();
}

export async function addEffects(project) {
  if (project) {
    const videoComponentChain = await getVideoComponentChain();
    if (!videoComponentChain) {
      return;
    }
    const newComponent = await filterFactory.createComponent(
      "PR.ADBE Gamma Correction"
    );

    let success = false;
    try {
      project.lockedAccess(() => {
        success = project.executeTransaction((compoundAction) => {
          var action1 = videoComponentChain.createInsertComponentAction(
            newComponent,
            2
          );
          compoundAction.addAction(action1);
        }, "createInsertComponentAction");
      });
    } catch (err) {
      log(`Error: ${err}`, "red");
      return false;
    }

    return success;
  } else {
    log(`No project found.`, "red");
  }
}

export async function addMultipleEffects(project) {
    const proj = await ppro.Project.getActiveProject();
    const sequence = await proj.getActiveSequence();
    const selection = await sequence.getSelection();
    const trackItems = await selection.getTrackItems();
    const newComponent1 = await filterFactory.createComponent(
      "PR.ADBE Gamma Correction"
    );

    const matchnames = await ppro.TransitionFactory.getVideoTransitionMatchNames();
    const videoTransition = await ppro.TransitionFactory.createVideoTransition(
      matchnames[1]
    );

    let actions = [];
    let success = false;
    let components = [];
    for (let i = 0; i < trackItems.length; i+=1){
      let item = trackItems[i];
      let videoComponentChain = await item.getComponentChain();
      components.push(videoComponentChain);
    }
    try {
      await project.lockedAccess(() => {
        for (let i = 0; i < components.length; i+=1){
          let component = components[i];
          let item = trackItems[i];
          var action1 = component.createInsertComponentAction(
            newComponent1,
            2
          );
          if (!action1){
            continue; 
          }
          var action2 = item.createAddVideoTransitionAction(videoTransition);
          actions.push(action1);
          actions.push(action2);
        }
        success = project.executeTransaction((compoundAction) => {
          actions.forEach(action => {
            compoundAction.addAction(action);
          })
        }, "Add Gamma Effect and End transition");
        return success;
      });
    } catch (err) {
      log(`Error: ${err}`, "red");
      return false;
    }
    return success;
}

export async function removeEffects(project) {
  if (project) {
    const videoComponentChain = await getVideoComponentChain();
    if (!videoComponentChain) {
      return;
    }
    let newComponentToBeDeleted;
    let success;
    try {
      await project.lockedAccess(() => {
        const initialComponenetCount = videoComponentChain.getComponentCount();
        if (initialComponenetCount < 3) {
          log("There is no effects to be removed");
        }
        newComponentToBeDeleted = videoComponentChain.getComponentAtIndex(2);

        success = project.executeTransaction(
          (compoundAction) => {
            var action1 = videoComponentChain.createRemoveComponentAction(
              newComponentToBeDeleted
            );
            compoundAction.addAction(action1);
          },
          "createRemoveComponentAction",
          "createRemoveComponentAction"
        );
      });
    } catch (err) {
      log(`Error: ${err}`, "red");
      return false;
    }

    return success;
  } else {
    log(`No project found.`, "red");
  }
}
