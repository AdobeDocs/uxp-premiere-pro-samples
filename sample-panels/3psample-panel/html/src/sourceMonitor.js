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
const { log } = require("/src/utils");

/// Source Monitor html helper functions
/**
 * add list of projectItems in current active project as options in select
 * html component
 */
async function addProjectItemsOptions() {
  let items = document.getElementById("project-items");
  // get projectItems from current active project
  const proj = await ppro.Project.getActiveProject();
  if (!proj) {
    log(`Load projectItems failed. Cannot find active project.`);
    return;
  }
  const projectRootItem = await proj.getRootItem();
  let projectItems = await projectRootItem.getItems();

  if (!projectItems) {
    log(`Project Empty. Cannot find valid projectItem to open`);
    return;
  }
  // insert them as option
  for (let i = 0; i < projectItems.length; i++) {
    let option = document.createElement("option");
    option.innerText = projectItems[i].name;
    option.value = projectItems[i].name;
    items.appendChild(option);
  }
}

/**
 * clear options for projectItems under select
 */
function clearProjectItemOptions() {
  let items = document.getElementById("project-items");
  items.innerHTML = "";
}

/**
 * refresh projectItems options
 */
async function refreshProjectItemOptions() {
  clearProjectItemOptions();
  await addProjectItemsOptions();
}

/// Source Monitor utility functions
/**
 * get projectItem opened at source monitor
 * @returns PPro projectItem / undefined if no projectItem opened
 */
async function getProjectItemAtSourceMonitor() {
  return ppro.SourceMonitor.getProjectItem();
}

/**
 * open projectItem [clip] in the file user selected
 */
async function openFilePath() {
  const file = await uxp.storage.localFileSystem.getFileForOpening();
  if (file && file.isFile && file.nativePath) {
    return ppro.SourceMonitor.openFilePath(file.nativePath);
  }
}

/**
 * open open user selected projectItem in source monitor
 * @param selected Name of selected ProjectItem
 * @returns [Boolean] if open projectItem at source monitor succeed
 */
async function openProjectItem(selected) {
  let success = false;
  const proj = await ppro.Project.getActiveProject();
  if (!proj) {
    log(`Load projectItems failed. Cannot find active project.`);
    return;
  }
  const projectRootItem = await proj.getRootItem();
  let projectItems = await projectRootItem.getItems();
  if (!projectItems) {
    log(`Project Empty. Cannot find valid projectItem to open`);
    return;
  }

  for (let i = 0; i < projectItems.length; i++) {
    // open projectItem with corresponding name
    if (projectItems[i].name == selected) {
      success = await ppro.SourceMonitor.openProjectItem(projectItems[i]);
    }
  }
  return success;
}

/**
 * play clip at source monitor in original speed
 */
async function play() {
  return ppro.SourceMonitor.play(1.0);
}

/**
 * get time cursor position at source monitor
 * @returns [Ticktime Object] current time of source monitor cursor
 */
async function getPosition() {
  return await ppro.SourceMonitor.getPosition();
}

/**
 * close current active clip at source monitor
 */
async function closeClip() {
  return ppro.SourceMonitor.closeClip();
}

/**
 * close all clips at source monitor
 */
async function closeAllClips() {
  return ppro.SourceMonitor.closeAllClips();
}

module.exports = {
  getProjectItemAtSourceMonitor,
  openFilePath,
  openProjectItem,
  play,
  getPosition,
  closeClip,
  closeAllClips,
  addProjectItemsOptions,
  clearProjectItemOptions,
  refreshProjectItemOptions,
};
