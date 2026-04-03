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

import type { Guid, premierepro, Project, ProjectItem } from "../types.d.ts";
const ppro = require("premierepro") as premierepro;
import { log } from "./utils";

/**
 * Import files into project
 * @param project Input PPro project object
 * @param filePaths Array of string file paths to import
 * @returns [Boolean] if import successful
 */
export async function importFiles(project: Project, filePaths: string[]) {
  try {
    // import into current project if any
    return await project.importFiles(
      filePaths,
      true, // suppressUI
      null, // Project bin unset, should import it to project root
      false // importAsNumberedStills
    );
  } catch (err) {
    log(`Error importing files: ${err}`, "red");
    return false;
  }
}

/**
 * Import sequences into project
 * @param project Input PPro project object
 * @param projectFilePath File path of project that contains sequences to import
 * @param seqIds Array of string sequences id to be imported
 * @returns [Boolean] if import successful
 */
export async function importSequences(
  project: Project,
  projectFilePath: string,
  seqIds: Guid[]
) {
  try {
    return project.importSequences(projectFilePath, seqIds);
  } catch (err) {
    log(`Error importing sequences: ${err}`, "red");
    return false;
  }
}

/**
 * Import sequences into project
 * @param project Input PPro project object
 * @param projectFilePath File path of project that contains ae composition to import
 * @param aeCompName Name of ae composition
 * @param rootItem Root item of project that contains ae composition to import
 * @returns [Boolean] if import successful
 */
export async function importAeComponent(
  project: Project,
  projectFilePath: string,
  aeCompName: string,
  rootItem: ProjectItem
) {
  try {
    return project.importAEComps(projectFilePath, [aeCompName], rootItem);
  } catch (err) {
    log(`Error importing AE composition: ${err}`, "red");
    return false;
  }
}

/**
 * Import sequences into project
 * @param project Input PPro project object
 * @param projectFilePath File path of project that contains ae composition to import
 * @param rootItem Root item of project that contains ae composition to import
 * @returns [Boolean] if import successful
 */
export async function importAllAeComponents(
  project: Project,
  projectFilePath: string,
  rootItem: ProjectItem
) {
  try {
    return project.importAllAEComps(projectFilePath, rootItem);
  } catch (err) {
    log(`Error importing all AE compositions: ${err}`, "red");
    return false;
  }
}
