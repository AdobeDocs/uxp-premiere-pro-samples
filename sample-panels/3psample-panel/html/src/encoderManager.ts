import type { premierepro, Project, ProjectItem } from "../types.d.ts";
import { getSelectedProjectItems } from "./projectPanel.js";
import { log } from "./utils";
const ppro = require("premierepro") as premierepro;

/**
 * Encode selected media file to AME
 */
export async function encodeFile(
  mediaPath: string,
  outputPath: string,
  presetPath: string
) {
  try {
    log(`Queueing ${mediaPath} to Adobe Media Encoder`);
    const encoderManager = ppro.EncoderManager.getManager();
    if (!encoderManager.isAMEInstalled) {
      throw new Error(
        "Adobe Media Encoder is not installed or version is not compatible"
      );
    }

    return encoderManager.encodeFile(
      mediaPath,
      outputPath,
      presetPath,
      ppro.TickTime.TIME_ZERO, // start at beginning
      ppro.TickTime.TIME_INVALID // invalid so it will encode to end
    );
  } catch (e) {
    log(`Error: ${e}`, "red");
    return false;
  }
}

export async function encodeFirstSelectedProjectItem(
  project: Project,
  outputPath: string,
  presetPath: string
) {
  try {
    const encoderManager = ppro.EncoderManager.getManager();
    if (!encoderManager.isAMEInstalled) {
      throw new Error(
        "Adobe Media Encoder is not installed or version is not compatible"
      );
    }
    const selectedProjectItems: ProjectItem[] = await getSelectedProjectItems(
      project
    );
    if (selectedProjectItems.length == 0) {
      throw new Error("No projectItem selected in project panel for encode");
    }

    const clipProjectItem = ppro.ClipProjectItem.cast(selectedProjectItems[0]);
    if (!clipProjectItem) {
      throw new Error("First selected project item is not a clip");
    }

    log("Queueing first selected project item to Adobe Media Encoder");
    return encoderManager.encodeProjectItem(
      clipProjectItem,
      outputPath,
      presetPath,
      0 // 0 = entire, 1 = in/out, 2 = work area (only valid for sequence clipProjectItem input)
    );
  } catch (e) {
    log(`Error: ${e}`, "red");
    return false;
  }
}
