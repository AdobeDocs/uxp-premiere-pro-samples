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
const { getProjectName } = require("./src/commonUtils");
const {
  exportMetadata,
  exportClipMarkerData,
} = require("./src/exportMetadata");
const {
  getMetdataColumns,
  updateMetadata,
  updateColumnMetadata,
  deleteMetadata,
  getSeqNumStart,
  getTranslatedString,
  getColSampleData,
} = require("./src/batchUpdate");

const copySvg = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="16"
  height="16"
  fill="currentColor"
  class="bi bi-chevron-double-right"
  viewBox="0 0 16 16"
>
  <path
    fill-rule="evenodd"
    d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708"
  />
  <path
    fill-rule="evenodd"
    d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708"
  />
</svg>`;

const exchangeSvg = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="16"
  height="16"
  fill="currentColor"
  class="bi bi-arrow-left-right"
  viewBox="0 0 16 16"
>
  <path
    fill-rule="evenodd"
    d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5m14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5"
  />
</svg>`;

let selectedProjectItems = [];

async function onProjectActivated(project) {
  // update active project name
  document.getElementById("active-project").innerText = project.name.replace(
    /\.\w+$/,
    ""
  );
}

async function onProjectItemSelectionChange(project) {
  // update selected projectItem array
  selectedProjectItems = project.projectItems;
  // load new preview metadata value based on selected item
  await setPreviewText();
}

async function addProjListeners() {
  // intialize active project name if exist
  document.getElementById("active-project").innerText = await getProjectName();

  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.ProjectEvent.ACTIVATED,
    onProjectActivated,
    true // in capture phase
  );

  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.ProjectEvent.DIRTY,
    onProjectDirty, // update preview text & columns when projectItem changes
    true // in capture phase
  );

  ppro.EventManager.addGlobalEventListener(
    ppro.Constants.ProjectEvent.PROJECT_ITEM_SELECTION_CHANGED,
    onProjectItemSelectionChange // update items when selection changes
  );
}

async function onProjectDirty() {
  // load metadata column if they are empty due to lack of valid proejctItem before
  if (
    document.querySelectorAll(".metadata-columns")[0].childNodes.length == 1
  ) {
    await loadMetadataColumns();
  }
}

function toggleIcon() {
  // toggle icon image based on user selection of copy or exchange
  let updateBtn = document.getElementById("column-update-button");
  if (document.getElementById("copy").checked) {
    updateBtn.innerHTML = copySvg;
  } else {
    updateBtn.innerHTML = exchangeSvg;
  }
}

function closeDialog() {
  document.querySelector("#dialog").close("Warning Dialog Closed");
}

async function setPreviewText() {
  let sequentialStart = getSeqNumStart(
    document.getElementById("seq-num").value
  );
  let prefix = getTranslatedString(
    document.getElementById("prefix").value,
    sequentialStart
  );
  let body = getTranslatedString(
    document.getElementById("body").value,
    sequentialStart
  );
  let suffix = getTranslatedString(
    document.getElementById("suffix").value,
    sequentialStart
  );

  if (body == "") {
    // body empty, not overwriting data, make body text grey
    body = await getColSampleData();
    document.getElementById("body-text").classList.add("highlight");
    document.getElementById("write-state").style.display = "none";
  } else {
    // we are overwriting data, display warning text
    document.getElementById("body-text").classList.remove("highlight");
    document.getElementById("write-state").style.display = "inline-block";
  }

  document.getElementById("prefix-text").style.display =
    prefix == "" ? "none" : "inline-block";
  document.getElementById("body-text").style.display =
    body == "" ? "none" : "inline-block";
  document.getElementById("suffix-text").style.display =
    suffix == "" ? "none" : "inline-block";

  document.getElementById("prefix-text").innerText = prefix;
  document.getElementById("body-text").innerText = body;
  document.getElementById("suffix-text").innerText = suffix;
}

async function loadMetadataColumns() {
  let metadataColumns = await getMetdataColumns();
  if (metadataColumns == null) {
    return;
  }
  let pickers = document.querySelectorAll(".metadata-columns");
  // load available metadata columns to pickers
  for (const column of metadataColumns) {
    for (const picker of pickers) {
      // for delete picker, name is not a option
      if (picker.id == "delete-picker" && column.ColumnName == "Name") {
        continue;
      }
      let newOption = document.createElement("sp-menu-item");
      newOption.innerText = column.ColumnName;
      newOption.value = column.ColumnID;
      picker.appendChild(newOption);
    }
  }
}

window.addEventListener("load", async () => {
  await loadMetadataColumns();
  await addProjListeners();

  document
    .getElementById("export-button")
    .addEventListener("click", exportMetadata);

  document
    .getElementById("export-marker-button")
    .addEventListener("click", exportClipMarkerData);

  document
    .getElementById("update-button")
    .addEventListener("click", updateMetadata);

  document
    .getElementById("column-update-button")
    .addEventListener("click", updateColumnMetadata);

  document
    .getElementById("delete-button")
    .addEventListener("click", deleteMetadata);

  document.getElementById("copy").addEventListener("click", toggleIcon);
  document.getElementById("exchange").addEventListener("click", toggleIcon);

  document
    .getElementById("dialog-close-button")
    .addEventListener("click", closeDialog);

  document.getElementById("prefix").addEventListener("input", setPreviewText);
  document.getElementById("body").addEventListener("input", setPreviewText);
  document.getElementById("suffix").addEventListener("input", setPreviewText);
  document.getElementById("seq-num").addEventListener("input", setPreviewText);
  document
    .getElementById("column-picker")
    .addEventListener("click", setPreviewText);
});
