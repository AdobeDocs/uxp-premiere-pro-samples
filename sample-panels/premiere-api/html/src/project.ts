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
import type { Guid, premierepro, Project, Sequence } from "../types.d.ts";
const ppro = require("premierepro") as premierepro;
const uxp = require("uxp") as typeof import("uxp");
import { log } from "./utils";

export async function openProject() {
  // @ts-ignore
  const file = await uxp.storage.localFileSystem.getFileForOpening({
    types: ["prproj"],
  });
  if (file?.isFile && file.nativePath) {
    try {
      return await ppro.Project.open(file.nativePath);
    } catch (e) {
      log(`Error: ${e}`);
    }
  }
}

export async function openInputProject(projectPath: string) {
  return ppro.Project.open(projectPath);
}

export async function getActiveProject() {
  return await ppro.Project.getActiveProject();
}

export async function getActiveSequence(project: Project) {
  if (project) {
    return await project.getActiveSequence();
  } else {
    log(`No project found.`, "red");
  }
}

export async function getProjectFromId(projectId: Guid) {
  return ppro.Project.getProject(projectId);
}

export async function getInsertionBin(project) {
  if (project) {
    return await project.getInsertionBin();
  } else {
    log("No project found.", "red");
  }
}

export async function getAllSequences(project: Project) {
  if (project) {
    return await project.getSequences();
  } else {
    log("No project found.", "red");
  }
}

export async function openSequence(
  project: Project,
  proposedSequence: Sequence
) {
  if (project) {
    return await project.openSequence(proposedSequence);
  } else {
    log("No project found.", "red");
  }
}

export async function pauseGrowing(pause: boolean, project: Project) {
  if (project) {
    return await project.pauseGrowing(pause);
  } else {
    log("No project found.", "red");
  }
}

export async function saveProject(project: Project) {
  if (project) {
    return await project.save();
  } else {
    log("No project found.", "red");
  }
}

export async function saveAsProject(project: Project) {
  if (project) {
    // @ts-ignore
    const file = await uxp.storage.localFileSystem.getFileForSaving(
      `newProjectCopy`,
      {
        types: ["prproj"],
      }
    );

    if (file && file.isFile && file.nativePath) {
      return await project.saveAs(file.nativePath);
    } else {
      log("User cancelled the save as activity.");
    }
  } else {
    log("No project found.", "red");
  }
}

export async function getColorSettings(project: Project) {
  if (project) {
    const colorSettings = await project.getColorSettings();
    if (!colorSettings) {
      log("Error getting project color settings.", "red");
    }

    return colorSettings;
  } else {
    log("No project found.", "red");
  }
}

export async function getSupportedGraphicsWhiteLuminances(project: Project) {
  if (project) {
    const colorSettings = await getColorSettings(project);
    return colorSettings.getSupportedGraphicsWhiteLuminances();
  } else {
    log("No project found.", "red");
  }
}

export async function getCurrentGraphicsWhiteLuminance(project: Project) {
  if (project) {
    const colorSettings = await getColorSettings(project);
    return await colorSettings.getGraphicsWhiteLuminance();
  } else {
    log("No project found.", "red");
  }
}

export async function closeProject(project: Project) {
  if (project) {
    return project.close();
  } else {
    log("No project found.", "red");
  }
}
