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

/**
 * Get input project's scratch disk path in its settings
 * @return [string] Scratch Disk Path of current project
 */
export async function getScratchDiskSetting(project: Project) {
  const projectSettings = ppro.ProjectSettings;
  const scratchDiskSettings = await projectSettings.getScratchDiskSettings(
    project
  );
  return scratchDiskSettings.getScratchDiskPath(
    ppro.Constants.ScratchDiskFolderType.VIDEO_CAPTURE
  );
}

/**
 * Set scratch Disk path to MyDocuments
 * @return [bool] if set action succeed or not
 */
export async function setScratchDiskSettings(project: Project) {
  const projectSettings = ppro.ProjectSettings;
  const scratchDiskSettings = await projectSettings.getScratchDiskSettings(
    project
  );
  // set to documents
  await scratchDiskSettings.setScratchDiskPath(
    ppro.Constants.ScratchDiskFolderType.VIDEO_CAPTURE,
    ppro.Constants.ScratchDiskFolder.MY_DOCUMENTS
  );

  let succeed = false;
  try {
    project.lockedAccess(() => {
      succeed = project.executeTransaction((compoundAction) => {
        var action = projectSettings.createSetScratchDiskSettingsAction(
          project,
          scratchDiskSettings
        );
        compoundAction.addAction(action);
      }, "createSetScratchDiskPathAction");
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return succeed;
}

/**
 * Get if ingest enabled in project's ingest setting
 * @return [bool] If ingest is enabled for current project
 */
export async function getIngestEnabled(project: Project) {
  const projectSettings = ppro.ProjectSettings;
  const ingestSettings = await projectSettings.getIngestSettings(project);
  return ingestSettings.getIsIngestEnabled();
}

/**
 * Set ingest enabled to true for current project's ingest settings
 * @return [bool] if set action succeed or not
 */
export async function setIngestEnabled(project: Project) {
  const projectSettings = ppro.ProjectSettings;
  const ingestSettings = await projectSettings.getIngestSettings(project);
  // set to enabled
  await ingestSettings.setIngestEnabled(true);

  let succeed = false;
  try {
    project.lockedAccess(() => {
      succeed = project.executeTransaction((compoundAction) => {
        var action = projectSettings.createSetIngestSettingsAction(
          project,
          ingestSettings
        );
        compoundAction.addAction(action);
      }, "set ingest enabled");
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return succeed;
}
