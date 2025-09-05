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
  Action,
  ComponentParam,
  premierepro,
  Project,
} from "../types.d.ts";
const ppro = require("premierepro") as premierepro;
import { log } from "./utils";

//Gets the componenetParam
export async function getComponentParam() {
  let componentParam: ComponentParam;
  let component;
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
            await proj.lockedAccess(async () => {
              component = componentChain.getComponentAtIndex(1);
              componentParam = await component.getParam(1);
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
  let success: boolean;
  try {
    project.lockedAccess(() => {
      let setTimeVaryingAction =
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
  const { componentParam, project } = await getComponentParam();
  const keyframe = componentParam.createKeyframe(300);

  let success = await changeTimeVarying(componentParam, project, false);
  try {
    project.lockedAccess(() => {
      if (success) {
        success = project.executeTransaction((compoundAction) => {
          log(
            `Setting the value of ${componentParam.displayName} to ${keyframe.value.value}`
          );
          var action1 = componentParam.createSetValueAction(keyframe, true);
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
export async function getStartValue() {
  const { componentParam, project } = await getComponentParam();

  let success = await changeTimeVarying(componentParam, project, false);

  if (success) {
    log(`Getting the start value of ${componentParam.displayName}`);
    return await componentParam.getStartValue();
  } else {
    return;
  }
}

//Adds a keyframe to the component parameter stream.
export async function addKeyframe() {
  const { componentParam, project } = await getComponentParam();

  let success = await changeTimeVarying(componentParam, project, true);
  try {
    project.lockedAccess(() => {
      if (success) {
        success = project.executeTransaction((compoundAction) => {
          const keyframe = componentParam.createKeyframe(500);
          log(
            `Adding a keyframe to ${componentParam.displayName} at ${keyframe.position.seconds}`
          );
          let action = componentParam.createAddKeyframeAction(keyframe);
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
  const { componentParam } = await getComponentParam();
  return componentParam.getKeyframeListAsTickTimes();
}

//Gets all the keyframes of a componentParam at specific time.
export async function getKeyframe() {
  const { componentParam } = await getComponentParam();
  try {
    let keyframePtr = await componentParam.getKeyframePtr(
      ppro.TickTime.createWithSeconds(0)
    );
    return keyframePtr;
  } catch (e) {
    log(`Error: ${e}`);
    return;
  }
}

//Sets the keyframe interpolation.
// Must be one of the following:

// 0 KF_Interp_Mode_Linear

// 1 kfInterpMode_EaseIn_Obsolete

// 2 kfInterpMode_EaseOut_Obsolete

// 3 kfInterpMode_EaseInEaseOut_Obsolete

// 4 KF_Interp_Mode_Hold

// 5 KF_Interp_Mode_Bezier

// 6 KF_Interp_Mode_Time

// 7 kfInterpMode_TimeTransitionStart

// 8 kfInterpMode_TimeTransitionEnd
export async function setInterpolation() {
  const { componentParam, project } = await getComponentParam();

  let success = await changeTimeVarying(componentParam, project, true);
  try {
    project.lockedAccess(() => {
      if (success) {
        success = project.executeTransaction((compoundAction) => {
          let keyframe = componentParam.createKeyframe(150);
          keyframe.position = ppro.TickTime.createWithSeconds(1);
          log(
            `Adding a keyframe to ${componentParam.displayName} at ${keyframe.position.seconds}`
          );
          let action = componentParam.createAddKeyframeAction(keyframe);
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
