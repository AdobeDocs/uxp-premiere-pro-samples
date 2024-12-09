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

/**
 * Get input project's scratch disk path in its settings
 * @return [string] Scratch Disk Path of current project
 */
async function getScratchDiskSetting(project) {
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
async function setScratchDiskSettings(project) {
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

module.exports = {
  getScratchDiskSetting,
  setScratchDiskSettings,
};
