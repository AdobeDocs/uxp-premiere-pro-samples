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

import type { premierepro, Project, ProjectItem } from "../types.d.ts";
const ppro = require("premierepro") as premierepro;
import { log } from "./utils";

export async function getRootItem(project: Project) {
  const rootItem = await project.getRootItem();
  return rootItem;
}

export async function getProjectItems(project: Project) {
  const rootItem = await getRootItem(project);
  const projectItems = await rootItem.getItems();
  return projectItems;
}

export async function getSelectedProjectItems(project: Project) {
  const projectSelection = await ppro.ProjectUtils.getSelection(project);
  const projectItems = await projectSelection.getItems();
  return projectItems;
}

export async function getClipProjectItem(project: Project) {
  const rootItem = await getRootItem(project);
  const projectItems: Array<ProjectItem> = await rootItem.getItems();

  let mediaItem;
  for (let projectItem of projectItems) {
    const clipProjectItem = ppro.ClipProjectItem.cast(projectItem);
    if (
      clipProjectItem &&
      (await clipProjectItem.getContentType()) ===
        ppro.Constants.ContentType.MEDIA
    ) {
      // Take the first media found.
      mediaItem = clipProjectItem;
      break;
    } else {
      const folderProjectItem = ppro.FolderItem.cast(projectItem);
      if (folderProjectItem) {
        let items = await folderProjectItem.getItems();
        projectItems.push(...items);
      }
    }
  }
  if (!mediaItem) {
    log("No media project item found.", "red");
    return;
  }
  return ppro.ClipProjectItem.cast(mediaItem);
}

export async function getMediaFilePath(project: Project) {
  const clipProjectItem = await getClipProjectItem(project);
  if (clipProjectItem) {
    return clipProjectItem.getMediaFilePath();
  }
  return null;
}

export async function createBin(project: Project) {
  if (!project) {
    log(`No project found.`, "red");
    return;
  }
  const rootItem = await getRootItem(project);

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        const createBinAction = rootItem.createBinAction("Bin1", true);
        compoundAction.addAction(createBinAction);
      });
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

export async function createSmartBin(project: Project) {
  if (!project) {
    log(`No project found.`, "red");
    return;
  }
  const rootItem = await getRootItem(project);

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        const createBinAction = rootItem.createSmartBinAction("Bin2", "Bin");
        compoundAction.addAction(createBinAction);
      });
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

export async function renameBin(project: Project) {
  if (!project) {
    log(`No project found.`, "red");
    return;
  }
  const rootItem = await getRootItem(project);

  //create a bin named Bin3

  try {
    project.lockedAccess(() => {
      project.executeTransaction((compoundAction) => {
        const createBinAction = rootItem.createBinAction("Bin3", true);
        compoundAction.addAction(createBinAction);
      });
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  const newItems: Array<ProjectItem> = await rootItem.getItems();

  const newBin = newItems.find((item) => item.name == "Bin3");

  //rename Bin3 to Bin3_rename
  let success = false;

  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        const renameBinAction =
          ppro.FolderItem.cast(newBin).createRenameBinAction("Bin3_rename");
        compoundAction.addAction(renameBinAction);
      });
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

export async function removeItem(project: Project) {
  const rootItem = await getRootItem(project);

  //create a bin named Bin4
  try {
    project.lockedAccess(() => {
      project.executeTransaction((compoundAction) => {
        const createBinAction = rootItem.createBinAction("Bin4", true);
        compoundAction.addAction(createBinAction);
      });
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }
  const newItems: Array<ProjectItem> = await rootItem.getItems();

  const newBin = newItems.find((item) => item.name == "Bin4");

  //setTimeout is not mandatory here, wrapping inside setTimeout to make removeItem feature visisble on project panel.
  setTimeout(async () => {
    let success = false;
    try {
      project.lockedAccess(() => {
        success = project.executeTransaction((compoundAction) => {
          const createRemoveItemAction = rootItem.createRemoveItemAction(
            ppro.FolderItem.cast(newBin)
          );
          compoundAction.addAction(createRemoveItemAction);
        });
      });
    } catch (err) {
      log(`Error: ${err}`, "red");
      return false;
    }

    if (success) {
      log("Successfully removed the item form project panel");
    }
  }, 1000);
}

export async function moveItem(project: Project) {
  const rootItem = await getRootItem(project);
  try {
    project.lockedAccess(() => {
      project.executeTransaction((compoundAction) => {
        const createBinAction = rootItem.createBinAction("Bin5", true);
        compoundAction.addAction(createBinAction);
      });
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  try {
    project.lockedAccess(() => {
      project.executeTransaction((compoundAction) => {
        const createBinAction = rootItem.createBinAction("Bin6", true);
        compoundAction.addAction(createBinAction);
      });
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  const newItems: Array<ProjectItem> = await rootItem.getItems();

  const newBin1 = newItems.find((item) => item.name == "Bin5");
  const newBin2 = newItems.find((item) => item.name == "Bin6");

  //setTimeout is not mandatory here, wrapping inside setTimeout to make moveitem feature visisble on project panel.
  setTimeout(async () => {
    let success = false;
    try {
      project.lockedAccess(() => {
        success = project.executeTransaction((compoundAction) => {
          const createMoveItemAction = rootItem.createMoveItemAction(
            ppro.FolderItem.cast(newBin1),
            ppro.FolderItem.cast(newBin2)
          );
          compoundAction.addAction(createMoveItemAction);
        });
      });
    } catch (err) {
      log(`Error: ${err}`, "red");
      return false;
    }

    if (success) {
      log("Successfully moved the item to another bin");
    }
  }, 1000);
}

export async function setInOutPoint(project: Project) {
  if (!project) {
    log(`No project found.`, "red");
    return;
  }
  const inPoint = ppro.TickTime.createWithSeconds(2);
  const outPoint = ppro.TickTime.createWithSeconds(4);
  const clipProjectItem = await getClipProjectItem(project);

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        let action = clipProjectItem.createSetInOutPointsAction(
          inPoint,
          outPoint
        );
        compoundAction.addAction(action);
      }, "createSetInOutPointsAction");
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

export async function clearInOutPoint(project: Project) {
  if (!project) {
    log(`No project found.`, "red");
    return;
  }
  const clipProjectItem = await getClipProjectItem(project);

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        let action = clipProjectItem.createClearInOutPointsAction();
        compoundAction.addAction(action);
      }, "createClearInOutPointsAction");
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

export async function setScaleToFrameSize(project: Project) {
  if (!project) {
    log(`No project found.`, "red");
    return;
  }
  const clipProjectItem = await getClipProjectItem(project);

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        let action = clipProjectItem.createSetScaleToFrameSizeAction();
        compoundAction.addAction(action);
      }, "createSetScaleToFrameSizeAction");
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}
export async function refreshMedia(project: Project) {
  const clipProjectItem = await getClipProjectItem(project);
  const success = await clipProjectItem.refreshMedia();
  return success;
}

export async function setFootageInterpretation(project: Project) {
  if (!project) {
    log(`No project found.`, "red");
    return;
  }
  const clipProjectItem = await getClipProjectItem(project);
  let interpretation = await clipProjectItem.getFootageInterpretation();
  await interpretation.setFrameRate(20);
  await interpretation.setPixelAspectRatio(1.5);
  let createSetFootageInterpretationAction =
    await clipProjectItem.createSetFootageInterpretationAction(interpretation);

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        compoundAction.addAction(createSetFootageInterpretationAction);
      }, "createSetFootageInterpretationAction");
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}
export async function setOverrideFrameRate(project: Project) {
  const clipProjectItem = await getClipProjectItem(project);

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        let action = clipProjectItem.createSetOverrideFrameRateAction(0.5);
        compoundAction.addAction(action);
      }, "createSetOverrideFrameRateAction");
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

export async function setOverridePixelAspectRatio(project: Project) {
  const clipProjectItem = await getClipProjectItem(project);

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        let action = clipProjectItem.createSetOverridePixelAspectRatioAction(
          1,
          2
        );
        compoundAction.addAction(action);
      }, "createSetOverridePixelAspectRatioAction");
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

/**
 * Note:
 * If inHighRes is set to true, we will attach input file as high resolution footage.
 * If inHighRes is set to false, we will attach input file as proxy to projectItem without changing its media content.
 */
export async function attachProxy(project: Project, proxyFile: string) {
  const clipProjectItem = await getClipProjectItem(project);
  let success = false;
  try {
    success = await clipProjectItem.attachProxy(
      proxyFile,
      false // inHighRes, attach as proxy file
    );
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }
  return success;
}

export async function changeMediaFilePath(project: Project, mediaFile: string) {
  const clipProjectItem = await getClipProjectItem(project);
  let success = false;
  try {
    success = await clipProjectItem.changeMediaFilePath(mediaFile);
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }
  return success;
}

export async function getProjectViewIds() {
  return ppro.ProjectUtils.getProjectViewIds();
}

export async function getProjectFromViewId(viewId) {
  return ppro.ProjectUtils.getProjectFromViewId(viewId);
}

export async function getSelectedProjectItemsFromViewId(viewId) {
  const projectItemSelection = await ppro.ProjectUtils.getSelectionFromViewId(
    viewId
  );
  return projectItemSelection.getItems();
}

export async function renameFirstSelectedProjectItem(project: Project) {
  const selectedItems = await getSelectedProjectItems(project);
  if (selectedItems.length == 0) {
    log("No ProjectItem selected for rename");
    return false;
  }
  let success = false;
  try {
    project.lockedAccess(() => {
      const renameAction = selectedItems[0].createSetNameAction("Item 1");
      success = project.executeTransaction((compoundAction) => {
        compoundAction.addAction(renameAction);
      }, "rename projectItem to Item 1");
    });
  } catch (error) {
    log(error, "red");
  }
  return success;
}

export async function getMediaInfo(project: Project) {
  try {
    const clipProjectItem = await getClipProjectItem(project);
    if (!clipProjectItem) {
      log("No ClipProjectItem found in project panel");
    }
    const media = await clipProjectItem.getMedia();
    if (!media) {
      log("Failed to access media");
    }
    const start = await media.start;
    const duration = await media.duration;
    return {
      name: clipProjectItem.name,
      start: start.seconds,
      duration: duration.seconds,
    };
  } catch (error) {
    log(error, "red");
  }
  return null;
}

export async function setMediaStart(project: Project) {
  let success = false;
  try {
    const clipProjectItem = await getClipProjectItem(project);
    if (!clipProjectItem) {
      log("No ClipProjectItem found in project panel");
    }
    const media = await clipProjectItem.getMedia();
    if (!media) {
      log("Failed to access media");
    }
    const duration = await media.duration;
    if (duration < ppro.TickTime.TIME_ONE_SECOND) {
      log("Media Duration is smaller than 1 second");
    }

    project.lockedAccess(() => {
      const mediaSetStartAction = media.createSetStartAction(
        ppro.TickTime.TIME_ONE_SECOND
      );
      success = project.executeTransaction((compoundAction) => {
        compoundAction.addAction(mediaSetStartAction);
      });
    });
  } catch (error) {
    log(error, "red");
  }
  return success;
}
