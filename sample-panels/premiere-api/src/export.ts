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

import type { premierepro, Sequence } from "@adobe/premierepro";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ppro = require("premierepro") as premierepro;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const uxp = require("uxp") as typeof import("uxp");

import { log } from "./utils";
/**
 * Export current active sequence's current frame as PNG file
 */
export async function exportSequenceFrame(sequence: Sequence) {
  let exportFolder;
  log("Please select folder for export");
  // @ts-expect-error - uxp.storage.localFileSystem is not typed correctly
  const folder = await uxp.storage.localFileSystem.getFolder();
  if (folder?.isFolder && folder.nativePath) {
    exportFolder = folder.nativePath
  } else {
    log("Selection of folder for export failed. Please try again");
    return false;
  }

  const playerPos = await sequence.getPlayerPosition();
  const exportName = "output.png";

  log(`Exporting to "${exportFolder + path.sep + exportName}"...`);

  return ppro.Exporter.exportSequenceFrame(
    sequence,
    playerPos,
    exportName,
    exportFolder,
    600, // width
    500 // height
  );
}

/**
 * Export current active sequence as MEPG2 file
 */
export async function exportSequence(sequence: Sequence) {
  // let user select preset file
  let presetFile;
  log("Please select a preset file for export");
  // @ts-expect-error - uxp.storage.localFileSystem is not typed correctly
  const file = await uxp.storage.localFileSystem.getFileForOpening({
    types: ["epr"],
  });
  if (file?.isFile && file.nativePath) {
    presetFile = file.nativePath;
  } else {
    log("Selection of preset file failed. Please try again");
    return false;
  }

  // let user choose dir for export output mpg file into
  let outputFolder;
  log("Please select folder for export");
  // @ts-expect-error - uxp.storage.localFileSystem is not typed correctly
  const folder = await uxp.storage.localFileSystem.getFolder();
  if (folder?.isFolder && folder.nativePath) {
    outputFolder = folder.nativePath;
  } else {
    log("Selection of folder for export failed. Please try again");
    return false;
  }

  const exportName = "output.mpg"; // export to MPEG2
  const exportPath = outputFolder + path.sep + exportName;
  log(`Exporting to "${exportPath}"...`);

  const encoder = ppro.EncoderManager.getManager();
  return encoder.exportSequence(
    sequence,
    ppro.Constants.ExportType.IMMEDIATELY, // export in Premiere Pro
    exportPath, // file path to export to
    presetFile // preset file
  );
}

/**
 * Get Export File Extension based on preset and sequence
 */
export async function getExportFileExtension(sequence: Sequence, presetFile: string) {
  return ppro.EncoderManager.getExportFileExtension(sequence, presetFile);
}
