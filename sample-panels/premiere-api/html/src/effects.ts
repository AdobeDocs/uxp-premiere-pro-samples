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
import type { premierepro } from "../types.d.ts";
const ppro = require("premierepro") as premierepro;

let matchnames;
let videoComponentChain;
let audioComponentChain;
const filterFactory = ppro.VideoFilterFactory;
const audioFilterFactory = ppro.AudioFilterFactory;

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

async function getAudioClipTrackItem() {
  const proj = await ppro.Project.getActiveProject();
  if (!proj) {
    log("No active project", "red");
  } else {
    const sequence = await proj.getActiveSequence();
    if (!sequence) {
      log("No sequence found", "red");
    } else {
      const audioTrack = await sequence.getAudioTrack(0);
      if (!audioTrack) {
        log("No videoTrack found", "red");
      } else {
        const trackItems = await audioTrack.getTrackItems(
          ppro.Constants.TrackItemType.CLIP,
          false
        );
        if (trackItems.length === 0) {
          log("No trackItems found", "red");
        } else {
          return trackItems[0];
        }
      }
    }
  }
  return null;
}

export async function getAudioComponentChain() {
  const audioTrackItem = await getAudioClipTrackItem();
  let audioComponentChain = undefined;
  if (audioTrackItem) {
    audioComponentChain = await audioTrackItem.getComponentChain();
  }
  return audioComponentChain;
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
  if (project) {
    const videoComponentChain = await getVideoComponentChain();
    if (!videoComponentChain) {
      return;
    }
    const newComponent1 = await filterFactory.createComponent(
      "PR.ADBE Gamma Correction"
    );

    const newComponent2 = await filterFactory.createComponent(
      "PR.ADBE Extract"
    );

    let success = false;
    try {
      project.lockedAccess(() => {
        success = project.executeTransaction((compoundAction) => {
          var action1 = videoComponentChain.createInsertComponentAction(
            newComponent1,
            2
          );
          var action2 = videoComponentChain.createInsertComponentAction(
            newComponent2,
            2
          );
          compoundAction.addAction(action1);
          compoundAction.addAction(action2);
        }, "Add Multiple Effects");
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

export async function addVocalEnhancerEffect(project) {
  let audioComponentChain = await getAudioComponentChain();
  if (!audioComponentChain) {
    return false;
  }
  let success = false;
  try {
    const trackItem = await getAudioClipTrackItem();
    const newComponent = await audioFilterFactory.createComponentByDisplayName(
      "Vocal Enhancer",
      trackItem
    );
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        let action1 = audioComponentChain.createInsertComponentAction(
          newComponent,
          2
        );
        compoundAction.addAction(action1);
      }, "createInsertComponentAction");
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
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
