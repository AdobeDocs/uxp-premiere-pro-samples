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
  AudioClipTrackItem,
  Project,
  Sequence,
  VideoClipTrackItem,
} from "@adobe/premierepro";

import { log } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ppro = require("premierepro") as premierepro;

/**
 * Retrieves a list of currently selected VideoClipTrackItems in the given sequence.
 *
 * @param sequence 
 * @returns 
 */
export async function getCurrentVideoClipTrackItemsSelected(
  sequence: Sequence
): Promise<VideoClipTrackItem[]> {
  const selection = await sequence.getSelection();
  const trackItems = await selection.getTrackItems();
  return trackItems.filter(isVideoClipTrackItem);
}

/**
 * Retrieves a list of currently selected AudioCLipTrackItems in the given sequence.
 * @param sequence 
 * @returns 
 */
export async function getCurrentAudioClipTrackItemsSelected(
  sequence: Sequence
): Promise<AudioClipTrackItem[]> {
  const selection = await sequence.getSelection();
  const trackItems = await selection.getTrackItems();
  return trackItems.filter(isAudioClipTrackItem);
}

// Type guard predicate function used to help statically verify that the given
// trackItem _is_ a VideoClipTrackItem.
function isVideoClipTrackItem(
  trackItem: AudioClipTrackItem | VideoClipTrackItem
): trackItem is VideoClipTrackItem {
  // @ts-expect-error static typing does not have "hasInstance" details
  return trackItem instanceof ppro.VideoClipTrackItem;
}

// Type guard predicate function used to help statically verify that the given
// trackItem _is_ an AudioClipTrackItem.
function isAudioClipTrackItem(
  trackItem: AudioClipTrackItem | VideoClipTrackItem
): trackItem is AudioClipTrackItem {
  // @ts-expect-error static typing does not have "hasInstance" details
  return trackItem instanceof ppro.AudioClipTrackItem;
}

/**
 * Returns a list of the available video filter effect match names.
 * 
 * Match names align with specific video effects Premiere uses to find and
 * create, whereas display name values vary depending on current language.
 *
 * @returns 
 */
export async function getEffectsName(): Promise<string[]> {
  return await ppro.VideoFilterFactory.getMatchNames();
}

/**
 * Adds a Gamma Correction effect to the currently selected video track
 * for the given project and sequence.
 *
 * @param project 
 * @param sequence
 * @returns 
 */
export async function addEffects(project: Project, sequence: Sequence): Promise<boolean> {
  const selection = await getCurrentVideoClipTrackItemsSelected(sequence);
  if (selection == null || selection.length !== 1) {
    log("Please select one video clip to add a Gamma Correction effect to", "red");
    return false;
  }

  const videoComponentChain = await selection[0].getComponentChain();
  const newComponent = await ppro.VideoFilterFactory.createComponent(
    "PR.ADBE Gamma Correction"
  );

  try {
    let success = false;

    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        const action1 = videoComponentChain.createInsertComponentAction(
          newComponent,
          2
        );
        compoundAction.addAction(action1);
      }, "createInsertComponentAction");
    });

    return success;
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }
}

/**
 * Adds Gamma Correction and Extract effects to the currently selected video track
 * item for the given project and sequence.
 *
 * @param project 
 * @param sequence 
 * @returns 
 */
export async function addMultipleEffects(project: Project, sequence: Sequence): Promise<boolean> {
  const selection = await getCurrentVideoClipTrackItemsSelected(sequence);
  if (selection == null || selection.length !== 1) {
    log("Please select one video clip to add Gamma Correction and Extract effects to", "red");
    return false;
  }

  const videoComponentChain = await selection[0].getComponentChain();
  const newComponent1 = await ppro.VideoFilterFactory.createComponent(
    "PR.ADBE Gamma Correction"
  );
  const newComponent2 = await ppro.VideoFilterFactory.createComponent(
    "PR.ADBE Extract"
  );

  try {
    let success = false;

    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        const action1 = videoComponentChain.createInsertComponentAction(
          newComponent1,
          2
        );
        const action2 = videoComponentChain.createInsertComponentAction(
          newComponent2,
          2
        );
        compoundAction.addAction(action1);
        compoundAction.addAction(action2);
      }, "Add Multiple Effects");
    });

    return success;
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }
}

/**
 * Adds a Vocal Enhancer effect to the currently selected audio track item
 * for the given project and sequence.
 *
 * @param project 
 * @param sequence 
 * @returns 
 */
export async function addVocalEnhancerEffect(project: Project, sequence: Sequence): Promise<boolean> {
  const selection = await getCurrentAudioClipTrackItemsSelected(sequence);
  if (selection == null || selection.length !== 1) {
    log("Please select one audio clip to add a Vocal Enhancer effect to", "red");
    return false;
  }

  const [trackItem] = selection;
  const audioComponentChain = await trackItem.getComponentChain();
  const newComponent = await ppro.AudioFilterFactory.createComponentByDisplayName(
    "Vocal Enhancer",
    trackItem
  );

  try {
    let success = false;

    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        const action1 = audioComponentChain.createInsertComponentAction(
          newComponent,
          2
        );
        compoundAction.addAction(action1);
      }, "createInsertComponentAction");
    });

    return success;
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }
}

/**
 * Removes the last effect from the end of the component chain for the currently
 * selected video track item of the given project and sequence.
 *
 * @param project 
 * @param sequence 
 * @returns 
 */
export async function removeEffects(project: Project, sequence: Sequence): Promise<boolean> {
  const selection = await getCurrentVideoClipTrackItemsSelected(sequence);
  if (selection == null || selection.length != 1) {
    log("Please select one video clip to remove the last effect from", "red");
    return false;
  }

  const videoComponentChain = await selection[0].getComponentChain();

  try {
    let success = false;

    project.lockedAccess(() => {
      const initialComponentCount = videoComponentChain.getComponentCount();
      if (initialComponentCount < 3) {
        log("There are no effects to be removed");
        return;
      }

      const newComponentToBeDeleted = videoComponentChain.getComponentAtIndex(initialComponentCount);
      success = project.executeTransaction(
        (compoundAction) => {
          const action1 = videoComponentChain.createRemoveComponentAction(
            newComponentToBeDeleted
          );
          compoundAction.addAction(action1);
        },
        "createRemoveComponentAction"
      );
    });

    return success;
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }
}
