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

async function openProject() {
  const file = await uxp.storage.localFileSystem.getFileForOpening({
    types: ["prproj"],
  });
  if (file && file.isFile && file.nativePath) {
    try {
      return await ppro.Project.open(file.nativePath);
    } catch (e) {
      log(`Error: ${e}`);
    }
  }
}

async function openInputProject(projectPath) {
  return ppro.Project.open(projectPath);
}

async function getActiveProject() {
  return await ppro.Project.getActiveProject();
}

async function getActiveSequence(project) {
  if (project) {
    return await project.getActiveSequence();
  } else {
    log(`No project found.`, "red");
  }
}

async function getProjectFromId(projectId) {
  return ppro.Project.getProject(projectId);
}

async function getInsertionBin(project) {
  if (project) {
    return await project.getInsertionBin();
  } else {
    log("No project found.", "red");
  }
}

async function getAllSequences(project) {
  if (project) {
    return await project.getSequences();
  } else {
    log("No project found.", "red");
  }
}

async function openSequence(project, proposedSequence) {
  if (project) {
    return await project.openSequence(proposedSequence);
  } else {
    log("No project found.", "red");
  }
}

async function pauseGrowing(pause, project) {
  if (project) {
    return await project.pauseGrowing(pause);
  } else {
    log("No project found.", "red");
  }
}

async function saveProject(project) {
  if (project) {
    return await project.save();
  } else {
    log("No project found.", "red");
  }
}

async function saveAsProject(project) {
  if (project) {
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

async function getColorSettings(project) {
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

async function getSupportedGraphicsWhiteLuminances(project) {
  if (project) {
    const colorSettings = await getColorSettings(project);
    return await colorSettings.getSupportedGraphicsWhiteLuminances(project);
  } else {
    log("No project found.", "red");
  }
}

async function getCurrentGraphicsWhiteLuminance(project) {
  if (project) {
    const colorSettings = await getColorSettings(project);
    return await colorSettings.getGraphicsWhiteLuminance();
  } else {
    log("No project found.", "red");
  }
}

async function closeProject(project) {
  if (project) {
    return project.close();
  } else {
    log("No project found.", "red");
  }
}

module.exports = {
  openProject,
  openInputProject,
  getActiveProject,
  getActiveSequence,
  getProjectFromId,
  getInsertionBin,
  getAllSequences,
  openSequence,
  pauseGrowing,
  getSupportedGraphicsWhiteLuminances,
  getCurrentGraphicsWhiteLuminance,
  saveProject,
  saveAsProject,
  closeProject,
};
