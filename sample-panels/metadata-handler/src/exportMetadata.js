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
const { getProjectName, getProjectItems } = require("./commonUtils");

const timeColKeys = [
  "Media Start",
  "Media End",
  "Media Duration",
  "Video In Point",
  "Video Out Point",
  "Video Duration",
  "Subclip Start",
  "Subclip End",
  "Subclip Duration",
];
const outOrEndKeys = ["Media End", "Video Out Point", "Subclip End"];

async function exportMetadata() {
  let projectName = await getProjectName();
  let projectItems = await getProjectItems();
  if (projectItems.length == 0) {
    document.getElementById("console").innerHTML =
      "Please have at least one projectItem available to export metadata";
    return;
  }

  let timeType = document.getElementById("time-type").value;
  let metadata = [];
  for (const projectItem of projectItems) {
    // if it can be casted to clip project item
    if (ppro.ClipProjectItem.cast(projectItem) != null) {
      // get metdata
      let clipMetadata = await getClipMetadata(projectItem, timeType);
      metadata.push(clipMetadata);
    }
    // otherwise cast to folder projectItem and read info inside
    const item = ppro.FolderItem.cast(projectItem);
    if (item) {
      // export medata info for every object inside of folder item
      let folderItems = await item.getItems();
      if (folderItems.length > 0) {
        projectItems.push(...folderItems);
      }
    }
  }

  let content;
  let type = document.getElementById("file-type").value;
  // parse array of json object into selected format
  if (type == "csv") {
    // export in csv format
    content = convertToCSV(metadata);
  } else {
    content = convertToTSV(metadata);
  }

  // ask user for save location
  const fileName = `${projectName}_Metadata`;
  const file = await uxp.storage.localFileSystem.getFileForSaving(fileName, {
    types: [type],
  });
  if (!file) {
    // file picker was cancelled
    document.getElementById("console").innerHTML =
      "Please select a folder to save";
    return;
  }
  // write content to exported file
  await file.write(content);
}

function secondToTimeCode(seconds, frameRate, isOutOrEnd = false) {
  const frames = Math.round(seconds * frameRate);
  const frameRateRounded = Math.round(frameRate);
  const wholeDisplaySeconds = Math.floor(frames / frameRateRounded);
  let ff = Math.floor(frames - wholeDisplaySeconds * frameRateRounded);

  if (isOutOrEnd) {
    ff = ff - 1; // wrap frame count with start index of 0
  }

  const hours = Math.floor(wholeDisplaySeconds / 3600);
  const minutes = Math.floor((wholeDisplaySeconds % 3600) / 60);
  const secs = Math.floor(wholeDisplaySeconds % 60);

  const pad = (num) => String(num).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}:${pad(ff, 2)}`;
}

function convertToCSV(metadataArray) {
  if (metadataArray.length == 0) {
    return "";
  }
  const headers = Object.keys(metadataArray[0]);
  const csvRows = [
    headers.join(","),
    ...metadataArray.map((row) =>
      headers.map((field) => JSON.stringify(row[field] || "")).join(",")
    ),
  ];
  return csvRows.join("\n");
}

function convertToTSV(metadataArray) {
  const csv = convertToCSV(metadataArray);
  return csv.replace(/,/g, "\t"); // Replace commas with tabs
}

async function getFrameRate(inProjectItem) {
  const metadata = await ppro.Metadata.getProjectColumnsMetadata(inProjectItem);
  const columnMetadata = JSON.parse(metadata);
  for (const currMetadata of columnMetadata) {
    if (currMetadata.ColumnName == "Frame Rate") {
      const match = currMetadata.ColumnValue.match(/^(\d+(\.\d+)?)\s*fps$/); // check if it match
      return match ? parseFloat(match[1]) : 30; // for audio clip, use 30 fps
    }
  }
}

async function getClipMetadata(inProjectItem, timeType) {
  const metadata = await ppro.Metadata.getProjectColumnsMetadata(inProjectItem);
  const columnMetadata = JSON.parse(metadata);
  let frameRate;
  // now get each
  let clipColMetadata = {};
  for (const currMetadata of columnMetadata) {
    let colName = currMetadata.ColumnName;
    let colValue = currMetadata.ColumnValue;
    if (colName == "Frame Rate") {
      const match = currMetadata.ColumnValue.match(/^(\d+(\.\d+)?)\s*fps$/); // check if it matchs
      frameRate = match ? parseFloat(match[1]) : 30; // for audio clip, use 30 fps
    } else if (timeColKeys.includes(colName) && colValue != "") {
      // convert ticks to timecode
      let ticktime = ppro.TickTime.createWithTicks(colValue);
      if (timeType == "smpte") {
        if (outOrEndKeys.includes(colName)) {
          colValue = secondToTimeCode(ticktime.seconds, frameRate, true); // isOutOrEnd
        } else {
          colValue = secondToTimeCode(ticktime.seconds, frameRate);
        }
      } else if (timeType == "frames") {
        // use fps * seconds = frames
        colValue = Math.round(frameRate * ticktime.seconds);
      } else {
        frames = Math.round(frameRate * ticktime.seconds);
        feet = Math.floor(frames / 16);
        frames = frames % 16;
        colValue = `${feet} feet+${frames} frames`;
      }
    }
    clipColMetadata[colName] = colValue;
  }
  console.log(clipColMetadata);
  return clipColMetadata;
}

async function getMarkerMetadata(inProjectItem) {
  let clipProjectItem = ppro.ClipProjectItem.cast(inProjectItem);
  const clipMarkers = await ppro.Markers.getMarkers(clipProjectItem);
  const markers = await clipMarkers.getMarkers();
  if (markers.length == 0) {
    return null;
  }
  let clipMarkersData = [];
  for (const clipMarker of markers) {
    let clipMarkerMetadata = {};
    clipMarkerMetadata["Clip Name"] = inProjectItem.name;
    clipMarkerMetadata["Marker Name"] = await clipMarker.getName();
    clipMarkerMetadata["Type"] = await clipMarker.getType();
    clipMarkerMetadata["Comments"] = await clipMarker.getComments();
    // get and record timecode datas
    const frameRate = await getFrameRate(inProjectItem);
    let start = await clipMarker.getStart();
    clipMarkerMetadata["Start"] = secondToTimeCode(start.seconds, frameRate);
    let duration = await clipMarker.getDuration();
    clipMarkerMetadata["Duration"] = secondToTimeCode(
      duration.seconds,
      frameRate
    );
    clipMarkerMetadata["Target"] = await clipMarker.getTarget();
    clipMarkerMetadata["Url"] = await clipMarker.getUrl();
    clipMarkersData.push(clipMarkerMetadata);
  }
  return clipMarkersData;
}

async function exportClipMarkerData() {
  const projectName = await getProjectName();
  const projectItems = await getProjectItems();
  if (projectItems.length == 0) {
    document.getElementById("console").innerHTML =
      "Please have at least one projectItem available to get clip marker data";
    return;
  }
  let metadata = [];
  for (const projectItem of projectItems) {
    // if it can be casted to clip project item, record marker data
    if (ppro.ClipProjectItem.cast(projectItem)) {
      let clipMarkersData = await getMarkerMetadata(projectItem);
      if (clipMarkersData != null) {
        metadata.push(...clipMarkersData);
      }
    }
    // otherwise cast to folder projectItem and read item inside
    const item = ppro.FolderItem.cast(projectItem);
    if (item) {
      // export medata info for every object inside of folder item
      let folderItems = await item.getItems();
      if (folderItems.length > 0) {
        projectItems.push(...folderItems);
      }
    }
  }

  let content;
  let type = document.getElementById("clip-marker-type").value;

  // parse array of json object into selected format
  if (type == "csv") {
    // export in csv format
    content = convertToCSV(metadata);
  } else {
    content = convertToTSV(metadata);
  }

  // ask user for save location
  const fileName = `${projectName}_ClipMarkers`;
  const file = await uxp.storage.localFileSystem.getFileForSaving(fileName, {
    types: [type],
  });
  if (!file) {
    // file picker was cancelled
    document.getElementById("console").innerHTML =
      "Please select a folder to save";
    return;
  }
  // write content to exported file
  await file.write(content);
}

module.exports = {
  exportMetadata,
  exportClipMarkerData,
};
