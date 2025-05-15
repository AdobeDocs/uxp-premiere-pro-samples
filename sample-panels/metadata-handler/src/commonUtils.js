/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2025 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it. If you have received this file from a source other than Adobe,
 * then your use, modification, or distribution of it requires the prior
 * written permission of Adobe.
 **************************************************************************/

const ppro = require("premierepro");

const ALLOWED_INPUTS_GOOD_HIDE = [
  "TRUE",
  "FALSE",
  "True",
  "False",
  "true",
  "false",
];
const CHECKED_COLUMNS = [
  "Column.PropertyBool.Good",
  "Column.PropertyBool.Hide",
];

async function openDialog() {
  await document.querySelector("#dialog").uxpShowModal({
    title: "Caution",
    resize: "both",
    size: {
      width: 400,
      height: 300,
    },
  });
}

async function getProjectName() {
  const project = await ppro.Project.getActiveProject();
  if (project) {
    return project.name.replace(/\.\w+$/, "");
  }
  return null;
}

async function getSelectedProjectItems(showDialog = true) {
  // Use selected ProjectItem
  const projectItems = selectedProjectItems;
  if (projectItems.length == 0 && showDialog) {
    openDialog();
  }
  return projectItems;
}

async function getProjectItems() {
  const project = await ppro.Project.getActiveProject();
  if (!project) {
    document.getElementById("console").innerHTML =
      "Please open a project to load metadata columns";
    return null;
  }
  const projectRootItem = await project.getRootItem();
  return projectRootItem.getItems();
}

// confirm if input valid
async function isInputValidForColumn(column, updateValue) {
  if (
    CHECKED_COLUMNS.includes(column) &&
    !ALLOWED_INPUTS_GOOD_HIDE.includes(updateValue)
  ) {
    return false;
  }
  return true;
}

module.exports = {
  getProjectName,
  getProjectItems,
  getSelectedProjectItems,
  isInputValidForColumn,
};
