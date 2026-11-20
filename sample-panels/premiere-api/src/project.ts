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
import type { Guid, premierepro, Project, Sequence } from "@adobe/premierepro";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ppro = require("premierepro") as premierepro;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const uxp = require("uxp") as typeof import("uxp");
import { log } from "./utils";

/**
 * Opens a project in Premiere using the OS file picker to select the target
 * project file.
 *
 * @returns
 * @since 25.6
 * @since 27.1 Extended example with setShowResolveFontsDialog option
 */
export async function openProject(): Promise<Project | null> {
  // @ts-expect-error - uxp.storage.localFileSystem is not typed correctly
  const file = await uxp.storage.localFileSystem.getFileForOpening({
    types: ["prproj"],
  });

  if (!file || !file.isFile || !file.nativePath) {
    log("Please select an existing project file to open.", "red");
    return null;
  }

  let openOptions = new ppro.OpenProjectOptions()
    .setAddToMRUList(false)
    .setShowConvertProjectDialog(false)
    .setShowLocateFileDialog(false)
    .setShowWarningDialog(false);

  // Check if this method exists before accessing to prevent errors in earlier
  // versions of Premiere. showResolveFontsDialog defaults to false.
  if ("setShowResolveFontsDialog" in openOptions) {
    // @ts-expect-error - setShowResolveFontsDialog is not typed yet!
    openOptions = openOptions.setShowResolveFontsDialog(false);
  }

  try {
    return ppro.Project.open(file.nativePath, openOptions);
  } catch (e) {
    log(`Error: ${e}`);
    return null;
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

export async function getInsertionBin(project: Project) {
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
    // @ts-expect-error - uxp.storage.localFileSystem is not typed correctly
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
    if (!colorSettings) return;
    return colorSettings.getSupportedGraphicsWhiteLuminances();
  } else {
    log("No project found.", "red");
  }
}

export async function getCurrentGraphicsWhiteLuminance(project: Project) {
  if (project) {
    const colorSettings = await getColorSettings(project);
    if (!colorSettings) return;
    return await colorSettings.getGraphicsWhiteLuminance();
  } else {
    log("No project found.", "red");
  }
}

export async function closeProject(project: Project) {
  if (project) {
    return project.close(new ppro.CloseProjectOptions());
  } else {
    log("No project found.", "red");
  }
}

/**
 * Check if a file path points to a valid Premiere project
 * @param projectPath - Path to check
 * @return [boolean] True if it's a valid project file
 */
export async function isProjectFile(projectPath: string): Promise<boolean> {
  try {
    if (!projectPath) {
      log("No project path provided", "red");
      return false;
    }
    return ppro.Project.isProject(projectPath);
  } catch (e) {
    log(`Error checking if file is project: ${e}`, "red");
    return false;
  }
}

/**
 * Prints a count of the current open projects and their names.
 */
export function printOpenProjectDetails(): void {
  // @ts-expect-error - getOpenProjects is not typed yet!
  const projects = ppro.Project.getOpenProjects();
  log(`There are currently ${projects.length} project(s) open`);

  for (const project of projects) {
    log(`- ${project.name}`);
  }
}
