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
  Component,
  ComponentParam,
  Keyframe,
  MogrtComment,
  MogrtText,
  premierepro,
  PointKeyframe,
  Project,
  Sequence,
  VideoClipTrackItem,
} from "@adobe/premierepro";

import { getCurrentVideoClipTrackItemsSelected } from "./effects";
import { log } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ppro = require("premierepro") as premierepro;

//Gets the componenetParam
export async function getComponentParam() {
  let componentParam!: ComponentParam;
  let component!: Component;
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
        if (trackItems.length == 0) {
          log("No trackItems found", "red");
          return;
        } else {
          const componentChain = await trackItems[0].getComponentChain();
          try {
            proj.lockedAccess(() => {
              component = componentChain.getComponentAtIndex(1);
              componentParam = component.getParam(1);
            });
          } catch (err) {
            log(`Error: ${err}`, "red");
            return;
          }
        }
      }
    }
  }
  return {
    componentParam: componentParam,
    project: proj,
  };
}

export async function changeTimeVarying(
  componentParam: ComponentParam,
  project: Project,
  value: boolean
) {
  let success!: boolean;
  try {
    project.lockedAccess(() => {
      const setTimeVaryingAction =
        componentParam.createSetTimeVaryingAction(value);
      success = project.executeTransaction((compoundAction) => {
        compoundAction.addAction(setTimeVaryingAction);
      }, "SetTimeVaryingAction");
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }
  return success;
}

//Sets the value of the component parameter stream.
export async function setValue() {
  const result = await getComponentParam();
  if (!result) {
    return;
  }
  const { componentParam, project } = result;
  const keyframe = componentParam.createKeyframe(300);

  let success = await changeTimeVarying(componentParam, project, false);
  try {
    project.lockedAccess(() => {
      if (success) {
        success = project.executeTransaction((compoundAction) => {
          log(
            `Setting the value of ${componentParam.displayName} to ${keyframe.value.value}`
          );
          const action1 = componentParam.createSetValueAction(keyframe, true);
          compoundAction.addAction(action1);
        }, "createSetValueAction");
      } else {
        return;
      }
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

//Gets the value of the component parameter stream.
export async function getStartValue(): Promise<Keyframe | PointKeyframe | Color | MogrtComment | MogrtText | null> {
  const result = await getComponentParam();
  if (!result) {
    return null;
  }
  const { componentParam, project } = result;

  const success = await changeTimeVarying(componentParam, project, false);

  if (success) {
    log(`Getting the start value of ${componentParam.displayName}`);
    return componentParam.getStartValue();
  } else {
    return null;
  }
}

//Adds a keyframe to the component parameter stream.
export async function addKeyframe() {
  const result = await getComponentParam();
  if (!result) return;
  const { componentParam, project } = result;

  let success = await changeTimeVarying(componentParam, project, true);
  try {
    project.lockedAccess(() => {
      if (success) {
        success = project.executeTransaction((compoundAction) => {
          const keyframe = componentParam.createKeyframe(500);
          log(
            `Adding a keyframe to ${componentParam.displayName} at ${keyframe.position.seconds}`
          );
          const action = componentParam.createAddKeyframeAction(keyframe);
          compoundAction.addAction(action);
        }, "createAddKeyframeAction");
      } else {
        return;
      }
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }
  return success;
}

//Gets all the keyframes of componentParam stream.
export async function getKeyframes() {
  const result = await getComponentParam();
  if (!result) return;
  const { componentParam } = result;
  return componentParam.getKeyframeListAsTickTimes();
}

//Gets all the keyframes of a componentParam at specific time.
export async function getKeyframe() {
  const result = await getComponentParam();
  if (!result) return;
  const { componentParam } = result;
  try {
    const keyframePtr = componentParam.getKeyframePtr(
      ppro.TickTime.createWithSeconds(0)
    );
    return keyframePtr;
  } catch (e) {
    log(`Error: ${e}`);
    return;
  }
}

//Sets the keyframe interpolation.
export async function setInterpolation() {
  const result = await getComponentParam();
  if (!result) return;
  const { componentParam, project } = result;

  let success = await changeTimeVarying(componentParam, project, true);
  try {
    project.lockedAccess(() => {
      if (success) {
        success = project.executeTransaction((compoundAction) => {
          const keyframe = componentParam.createKeyframe(150);
          keyframe.position = ppro.TickTime.createWithSeconds(1);
          log(
            `Adding a keyframe to ${componentParam.displayName} at ${keyframe.position.seconds}`
          );
          const action = componentParam.createAddKeyframeAction(keyframe);
          compoundAction.addAction(action);
        }, "createAddKeyframeAction");
      } else {
        return false;
      }

      if (success) {
        success = project.executeTransaction((compoundAction) => {
          const action = componentParam.createSetInterpolationAtKeyframeAction(
            ppro.TickTime.createWithSeconds(1),
            ppro.Constants.InterpolationMode.BEZIER
          );
          compoundAction.addAction(action);
        }, "createSetInterpolationAtKeyframeAction");
      } else {
        return false;
      }
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

// Loop through and find all MoGRT-based Components using the component's
// match name to identify them.
async function getMogrtComponentParams(
  videoTrack: VideoClipTrackItem,
): Promise<Component[]> {
  const componentChain = await videoTrack.getComponentChain();
  const count = componentChain.getComponentCount();

  const mogrtComponents: Component[] = [];
  for (let i = 0; i < count; i += 1) {
    const comp = componentChain.getComponentAtIndex(i);
    const matchName = await comp.getMatchName();

    if (matchName === "AE.ADBE Capsule") {
      mogrtComponents.push(comp);
    }
  }

  return mogrtComponents;
}

/**
 * Print some basic details about any MoGRT-based effect which contains source
 * text details.
 *
 * @param project
 * @param sequence
 * @returns
 */
export async function printMogrtTextParamDetails(
  _project: Project,
  sequence: Sequence,
): Promise<boolean> {
  const selection = await getCurrentVideoClipTrackItemsSelected(sequence);
  if (selection == null || selection.length !== 1) {
    log("Please select one video clip to print MoGRT details for.", "red");
    return false;
  }

  const mogrtComponents = await getMogrtComponentParams(selection[0]);
  if (!mogrtComponents.length) {
    log(`There are no MoGRT effects for the selected track item.`, "red");
    return false;
  }

  for (const component of mogrtComponents) {
    const paramCount = component.getParamCount();
    for (let i = 0; i < paramCount; i += 1) {
      const param = component.getParam(i);
      const value = await param.getStartValue();
      if (isMogrtText(value)) {
        log(`Found MogrtText component param "${param.displayName}" with details:`);
        log(` - Has uniform styling? ${value.isUniformStyling()}`);
        log(` - Has editable font name? ${value.isFontNameEditable()}`);
        log(` - Has editable font size? ${value.isFontSizeEditable()}`);
        log(` - Has editable faux styles? ${value.isFauxStylesEditable()}`)
        log(` - Text content: "${value.getText()}"`);
      }
    }
  }

  return true;
}

/**
 * Print some basic details about any MoGRT-based effect which contains comments
 *
 * @param project
 * @param sequence
 * @returns
 */
export async function printMogrtCommentParamDetails(
  _project: Project,
  sequence: Sequence,
): Promise<boolean> {
  const selection = await getCurrentVideoClipTrackItemsSelected(sequence);
  if (selection == null || selection.length !== 1) {
    log("Please select one video clip to print MoGRT details for.", "red");
    return false;
  }

  const mogrtComponents = await getMogrtComponentParams(selection[0]);
  if (!mogrtComponents.length) {
    log(`There are no MoGRT effects for the selected track item.`, "red");
    return false;
  }

  for (const component of mogrtComponents) {
    const paramCount = component.getParamCount();
    for (let i = 0; i < paramCount; i += 1) {
      const param = component.getParam(i);
      const value = await param.getStartValue();
      if (isMogrtComment(value)) {
        log(`Found MogrtComment component param "${param.displayName}":`);
        log(` - With comment: "${value.getText()}"`);
      }
    }
  }

  return true;
}

function makeInstanceOfGuard<T>(ctor: unknown) {
  return (value: unknown): value is T =>
    // @ts-expect-error static typing does not have "hasInstance" details
    value instanceof ctor;
}

/**
 * Type guard predicate function to help coerce a ComponentParam value to a
 * Color value.
 */
export const isColor = makeInstanceOfGuard<Color>(ppro.Color);

/**
 * Type guard predicate function to help coerce a ComponentParam value to a
 * Keyframe value.
 */
export const isKeyframe = makeInstanceOfGuard<Keyframe>(ppro.Keyframe);

/**
 * Type guard predicate function to help coerce a ComponentParam value to a
 * PointKeyframe value.
 */
export const isPointKeyframe = makeInstanceOfGuard<PointKeyframe>(ppro.PointKeyframe);

/**
 * Type guard predicate function to help coerce a ComponentParam value to a
 * MogrtComment value.
 */
export const isMogrtComment = makeInstanceOfGuard<MogrtComment>(ppro.MogrtComment);

/**
 * Type guard predicate function to help coerce a ComponentParam value to a
 * MogrtText value.
 */
export const isMogrtText = makeInstanceOfGuard<MogrtText>(ppro.MogrtText);
