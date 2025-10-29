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

import type { premierepro, ProjectItem } from "../types.d.ts";
const ppro = require("premierepro") as premierepro;
const uxp = require("uxp") as typeof import("uxp");
import { log } from "./utils";

/// Source Monitor html helper functions
/**
 * add list of projectItems in current active project as options in select
 * html component
 */
export async function addProjectItemsOptions() {
  let items = document.getElementById("project-items");
  // get projectItems from current active project
  const proj = await ppro.Project.getActiveProject();
  if (!proj) {
    log(`Load projectItems failed. Cannot find active project.`);
    return;
  }
  const projectRootItem = await proj.getRootItem();
  let projectItems: Array<ProjectItem> = await projectRootItem.getItems();

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
export async function clearProjectItemOptions() {
  let items = document.getElementById("project-items");
  items.innerHTML = "";
}

/**
 * refresh projectItems options
 */
export async function refreshProjectItemOptions() {
  clearProjectItemOptions();
  await addProjectItemsOptions();
}

/// Source Monitor utility functions
/**
 * get projectItem opened at source monitor
 * @returns PPro projectItem / undefined if no projectItem opened
 */
export async function getProjectItemAtSourceMonitor() {
  return ppro.SourceMonitor.getProjectItem();
}

/**
 * open projectItem [clip] in the file user selected
 */
export async function openFilePath() {
  // @ts-ignore
  const file = await uxp.storage.localFileSystem.getFileForOpening();
  if (file?.isFile && file.nativePath) {
    return ppro.SourceMonitor.openFilePath(file.nativePath);
  }
}

/**
 * open open user selected projectItem in source monitor
 * @param selected Name of selected ProjectItem
 * @returns [Boolean] if open projectItem at source monitor succeed
 */
export async function openProjectItem(selected: string) {
  let success = false;
  const proj = await ppro.Project.getActiveProject();
  if (!proj) {
    log(`Load projectItems failed. Cannot find active project.`);
    return;
  }
  const projectRootItem = await proj.getRootItem();
  let projectItems: Array<ProjectItem> = await projectRootItem.getItems();
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
export async function play() {
  return ppro.SourceMonitor.play(1.0);
}

/**
 * get time cursor position at source monitor
 * @returns [Ticktime Object] current time of source monitor cursor
 */
export async function getPosition() {
  return await ppro.SourceMonitor.getPosition();
}

/**
 * close current active clip at source monitor
 */
export async function closeClip() {
  return ppro.SourceMonitor.closeClip();
}

/**
 * close all clips at source monitor
 */
export async function closeAllClips() {
  return ppro.SourceMonitor.closeAllClips();
}
