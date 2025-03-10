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
const uxp = require("uxp");
const {
  getSelectedProjectItems,
  getProjectItems,
  isInputValidForColumn,
} = require("./commonUtils");
let { XMPMeta } = uxp.xmp;

const kColumnsCannotBeEdited = [
  "ASC_SOP",
  "ASC_SAT",
  "Audio Duration",
  "Audio In Point",
  "Audio Info",
  "Audio Usage",
  "Audio Out Point",
  "Captions",
  "Capture Settings",
  "Content Analysis",
  "Field Order",
  "File Path",
  "File Name",
  "Frame Rate",
  "Label",
  "Lut",
  "Lut1",
  "Lut2",
  "Media Start",
  "Media Duration",
  "Media End",
  "Media File Name",
  "Media File Path",
  "Media Type",
  "Original Video File Name",
  "Original Audio File Name",
  "Offline Properties",
  "Project Locked",
  "Proxy",
  "Proxy File Path",
  "Proxy Media File Name",
  "Proxy Media File Path",
  "Selected",
  "Sound Timecode",
  "Status",
  "Subclip Start",
  "Subclip End",
  "Subclip Duration",
  "Sync status",
  "Sync Offset",
  "Video Codec",
  "Video In Point",
  "Video Out Point",
  "Video Duration",
  "Video Info",
  "Video Usage",
  "Transcription Status",
  "Content Credentials",
];

const PPRO_METADATA_URL =
  "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";

function getPickerValue(inputPickerElementId, UISilent = false) {
  const inputPickerElement = document.getElementById(inputPickerElementId);
  if (!UISilent && inputPickerElement.value == undefined) {
    inputPickerElement.invalid = true;
    document.getElementById("console").innerText =
      "Please select a metadata column for update";
  } else {
    inputPickerElement.invalid = false;
  }
  return inputPickerElement.value;
}

async function getColSampleData() {
  // for getting sample data for preview, set UISilent to true
  const column = getPickerValue("column-picker", true);
  if (column == undefined) {
    return "";
  }

  // for preview, dismiss dialog opening
  let projectItems = await getSelectedProjectItems(false);
  if (projectItems.length == 0) {
    return "";
  }
  let body = "";
  for (const projectItem of projectItems) {
    // if item can be casted to clip project item
    if (ppro.ClipProjectItem.cast(projectItem)) {
      // record its data to use it for preview text
      let projectItemMetadata = await ppro.Metadata.getProjectMetadata(
        projectItem
      );
      let xmpProject = new XMPMeta(projectItemMetadata);
      if (xmpProject.doesPropertyExist(PPRO_METADATA_URL, column)) {
        body = await xmpProject.getProperty(PPRO_METADATA_URL, column).value;
        return body;
      }
    }
  }
  return body;
}

function getSetMetadataAction(projectItem, xmpProject, column, updateValue) {
  let updatedFields = [column];
  if (updateValue == "") {
    if (xmpProject.doesPropertyExist(PPRO_METADATA_URL, column)) {
      xmpProject.deleteProperty(PPRO_METADATA_URL, column);
    }
  } else {
    xmpProject.setProperty(PPRO_METADATA_URL, column, updateValue);
  }

  let newXmpStr = xmpProject.serialize();
  return ppro.Metadata.createSetProjectMetadataAction(
    projectItem,
    newXmpStr,
    updatedFields
  );
}

async function getProjectItemMetadatas(projectItems) {
  let projectItemMetadatas = [];
  for (const projectItem of projectItems) {
    if (ppro.ClipProjectItem.cast(projectItem)) {
      let projectItemMetadata = await ppro.Metadata.getProjectMetadata(
        projectItem
      );
      if (projectItemMetadata) {
        projectItemMetadatas.push(projectItemMetadata);
      } else {
        projectItemMetadatas.push(null);
      }
    }
  }
  return projectItemMetadatas;
}

// replace # in input string with sequential number with padding
function getTranslatedString(inputPattern, currNum) {
  return inputPattern.replace(/#+/g, (match) => {
    return String(currNum).padStart(match.length, "0");
  });
}

// wrap seq start as 0 if input at sequential number is non-digit
function getSeqNumStart(seqNumString) {
  const regex = /^\d+$/;
  let seqNumStart = 0;
  if (regex.test(seqNumString)) {
    seqNumStart = parseInt(seqNumString);
  }
  return seqNumStart;
}

// update column metadata with input from users
async function updateMetadata() {
  // check if value needed is available by UI
  const column = getPickerValue("column-picker");
  if (column == undefined) {
    return;
  }

  // Use selected projectItem
  const project = await ppro.Project.getActiveProject();
  let projectItems = await getSelectedProjectItems();
  if (projectItems.length == 0) {
    document.getElementById("console").innerHTML =
      "Select at least one project item to update";
    return;
  }
  // get prefix, body, and suffix value
  let prefixPattern = document.getElementById("prefix").value;
  let bodyPattern = document.getElementById("body").value;
  let suffixPattern = document.getElementById("suffix").value;
  let seqNumStartString = document.getElementById("seq-num").value;

  // get seq num start to fill in data
  let index = getSeqNumStart(seqNumStartString);
  let prefix = "";
  let body = "";
  let suffix = "";
  const bodyUndefined = bodyPattern == "" ? true : false;
  let updateValue = "";

  const projectItemMetadatas = await getProjectItemMetadatas(projectItems);
  project.lockedAccess(() => {
    let setMetadataActions = [];
    for (let i = 0; i < projectItemMetadatas.length; i += 1) {
      let currItemMetadata = projectItemMetadatas[i];
      if (!currItemMetadata) {
        continue;
      }
      let projectItem = projectItems[i];
      // update the metadata column with the updated text
      prefix = getTranslatedString(prefixPattern, index);
      suffix = getTranslatedString(suffixPattern, index);
      let xmpProject = new XMPMeta(currItemMetadata);
      // If body is not defined by user, use original column value as body
      if (
        xmpProject.doesPropertyExist(PPRO_METADATA_URL, column) &&
        bodyUndefined
      ) {
        body = xmpProject.getProperty(PPRO_METADATA_URL, column).value;
        body = getTranslatedString(body, index);
      } else {
        body = getTranslatedString(bodyPattern, index);
      }
      index += 1;

      updateValue = `${prefix}${body}${suffix}`;

      let inputValidity = isInputValidForColumn(column, updateValue);
      if (!inputValidity) {
        return;
      }

      let action = getSetMetadataAction(
        projectItem,
        xmpProject,
        column,
        updateValue
      );
      setMetadataActions.push(action);
    }
    project.executeTransaction((compoundAction) => {
      for (const setAction of setMetadataActions) {
        compoundAction.addAction(setAction);
      }
    }, "Metadata Changed💫");
  });
}

// copy or exchange column metadatas
async function updateColumnMetadata() {
  const columnLeft = getPickerValue("column-picker-left");
  const columnRight = getPickerValue("column-picker-right");
  if (columnLeft == undefined || columnRight == undefined) {
    return;
  }

  if (columnLeft == columnRight) {
    document.getElementById("console").innerText =
      "Selected columns are the same";
    return;
  }

  // transfer column data left to right
  const project = await ppro.Project.getActiveProject();
  let projectItems = await getSelectedProjectItems();
  if (projectItems.length == 0) {
    document.getElementById("console").innerHTML =
      "Select at least one project item to update";
    return;
  }

  const projectItemMetadatas = await getProjectItemMetadatas(projectItems);
  project.lockedAccess(() => {
    let setMetadataActions = [];
    for (let i = 0; i < projectItemMetadatas.length; i += 1) {
      let currItemMetadata = projectItemMetadatas[i];
      if (!currItemMetadata) {
        continue;
      }
      let projectItem = projectItems[i];
      let xmpProject = new XMPMeta(currItemMetadata);
      // get value from column left
      let leftColValue = "";
      if (xmpProject.doesPropertyExist(PPRO_METADATA_URL, columnLeft)) {
        leftColValue = xmpProject.getProperty(
          PPRO_METADATA_URL,
          columnLeft
        ).value;
      }

      let rightColValue = "";
      if (xmpProject.doesPropertyExist(PPRO_METADATA_URL, columnRight)) {
        rightColValue = xmpProject.getProperty(
          PPRO_METADATA_URL,
          columnRight
        ).value;
      }

      let inputValidity = isInputValidForColumn(columnRight, leftColValue);
      if (!inputValidity) {
        return;
      }

      let action = getSetMetadataAction(
        projectItem,
        xmpProject,
        columnRight,
        leftColValue
      );

      setMetadataActions.push(action);

      if (document.getElementById("exchange").checked) {
        action = getSetMetadataAction(
          projectItem,
          xmpProject,
          columnLeft,
          rightColValue
        );

        inputValidity = isInputValidForColumn(columnLeft, rightColValue);
        if (!inputValidity) {
          return;
        }
        setMetadataActions.push(action);
      }
    }
    project.executeTransaction((compoundAction) => {
      for (const setAction of setMetadataActions) {
        compoundAction.addAction(setAction);
      }
    }, "Column Metadata Changed💫");
  });
}

async function deleteMetadata() {
  const column = getPickerValue("column-delete");

  const project = await ppro.Project.getActiveProject();
  let projectItems = await getSelectedProjectItems();
  if (projectItems.length == 0) {
    document.getElementById("console").innerHTML =
      "Select at least one project item to delete";
    return;
  }
  const projectItemMetadatas = await getProjectItemMetadatas(projectItems);
  project.lockedAccess(() => {
    let setMetadataActions = [];
    for (let i = 0; i < projectItemMetadatas.length; i += 1) {
      let currItemMetadata = projectItemMetadatas[i];
      if (!currItemMetadata) {
        continue;
      }
      let projectItem = projectItems[i];
      let xmpProject = new XMPMeta(currItemMetadata);

      if (xmpProject.doesPropertyExist(PPRO_METADATA_URL, column)) {
        // remove column data if exist
        let action = getSetMetadataAction(
          projectItem,
          xmpProject,
          column,
          "" // tell getSetMetadataAction no need to update xmpProject
        );
        setMetadataActions.push(action);
      }
    }

    project.executeTransaction((compoundAction) => {
      for (const setAction of setMetadataActions) {
        compoundAction.addAction(setAction);
      }
    }, "Metadata Removed🗑️");
  });
}

async function findViableMetadataColumns(projectItem) {
  if (ppro.ClipProjectItem.cast(projectItem)) {
    // get metdata column and omit column that does not apply for edits
    const metadata = await ppro.Metadata.getProjectColumnsMetadata(projectItem);
    const metadataColumns = await JSON.parse(metadata);
    const validColumns = metadataColumns.filter(
      (item) => !kColumnsCannotBeEdited.includes(item.ColumnName)
    );
    return validColumns;
  }
  // If this is bin, recursively find if we can get columns from projectItem inside
  let item = await ppro.FolderItem.cast(projectItem);
  let items = await item.getItems();
  if (items.length == 0) {
    return null; // cannot dig further, return null
  }
  for (const item of items) {
    return findViableMetadataColumns(item);
  }
}

async function getMetdataColumns() {
  let projectItems = await getProjectItems();
  if (projectItems.length == 0) {
    document.getElementById("console").innerHTML =
      "Add one project item to load available metadata control columns";
    return null;
  }

  let metadataColumns;
  for (const projectItem of projectItems) {
    metadataColumns = await findViableMetadataColumns(projectItem);
    if (metadataColumns != null) {
      return metadataColumns;
    }
  }
  return metadataColumns;
}

module.exports = {
  getMetdataColumns,
  updateMetadata,
  updateColumnMetadata,
  deleteMetadata,
  getSeqNumStart,
  getTranslatedString,
  getColSampleData,
};
